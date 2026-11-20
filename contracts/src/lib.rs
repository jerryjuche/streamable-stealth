#![no_std]

use soroban_sdk::{
    contract, contracttype, symbol_short, Address, Env, Map, String, Vec,
};

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Stream {
    pub sender: Address,
    pub recipient_meta: String,
    pub scheme_id: u32,
    pub total_amount: i128,
    pub claimed_amount: i128,
    pub start_time: u64,
    pub duration_seconds: u64,
    pub cliff_seconds: u64,
    pub canceled: bool,
    pub metadata: Map<String, String>,
}

#[contracttype]
pub enum DataKey {
    Admin,
    NextStreamId,
    Stream(u64),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct StreamCreated {
    pub stream_id: u64,
    pub sender: Address,
    pub scheme_id: u32,
    pub meta_address: String,
    pub total_amount: i128,
    pub duration_seconds: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct StreamClaimed {
    pub stream_id: u64,
    pub amount: i128,
    pub claimed_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct StreamCanceled {
    pub stream_id: u64,
    pub sender: Address,
    pub refunded_amount: i128,
}

pub fn initialize(env: Env, admin: Address) {
    let data = env.storage().persistent();
    data.set(&DataKey::Admin, &admin);
    data.set(&DataKey::NextStreamId, &0u64);
}

pub fn create_stream(
    env: Env,
    sender: Address,
    scheme_id: u32,
    meta_address: String,
    total_amount: i128,
    duration_seconds: u64,
    cliff_seconds: u64,
) -> u64 {
    let mut data = env.storage().persistent();

    let next_id: u64 = data.get(&DataKey::NextStreamId).unwrap_or(0);

    assert!(total_amount > 0, "Amount must be positive");
    assert!(duration_seconds > 0, "Duration must be positive");
    assert!(cliff_seconds <= duration_seconds, "Cliff cannot exceed duration");

    let stream = Stream {
        sender: sender.clone(),
        recipient_meta: meta_address.clone(),
        scheme_id: scheme_id,
        total_amount: total_amount.clone(),
        claimed_amount: 0,
        start_time: env.ledger().timestamp(),
        duration_seconds: duration_seconds.clone(),
        cliff_seconds: cliff_seconds.clone(),
        canceled: false,
        metadata: Map::new(&env),
    };

    data.set(&DataKey::Stream(next_id), &stream);

    data.set(&DataKey::NextStreamId, &(next_id + 1));

    // Publish event with topics
    env.events().publish(
        (symbol_short!("Stream"), symbol_short!("Created")),
        StreamCreated {
            stream_id: next_id,
            sender: sender.clone(),
            scheme_id,
            meta_address: meta_address.clone(),
            total_amount: total_amount.clone(),
            duration_seconds: duration_seconds.clone(),
        },
    );

    next_id
}

pub fn calculate_vested_amount(
    start_time: u64,
    duration_seconds: u64,
    cliff_seconds: u64,
    current_time: u64,
    total_amount: i128,
) -> i128 {
    if current_time < start_time + cliff_seconds {
        return 0;
    }

    let elapsed_after_cliff = current_time.saturating_sub(start_time + cliff_seconds);
    let elapsed_clamped = elapsed_after_cliff.min(duration_seconds);

    if duration_seconds == 0 {
        return 0;
    }

    // Precise vesting: total_amount * elapsed / duration
    let vested_proportion = (elapsed_clamped as f64 / duration_seconds as f64).min(1.0);
    let vested_amount = (total_amount as f64 * vested_proportion) as i128;

    vested_amount.min(total_amount)
}

pub fn claim(env: Env, stream_id: u64) -> i128 {
    let data = env.storage().persistent();

    let stream: Stream = data.get(&DataKey::Stream(stream_id)).expect("Stream not found");

    if stream.canceled {
        panic!("Stream is canceled");
    }

    let current_time = env.ledger().timestamp();

    let vested = calculate_vested_amount(
        stream.start_time,
        stream.duration_seconds,
        stream.cliff_seconds,
        current_time,
        stream.total_amount,
    );

    let remaining = vested - stream.claimed_amount;
    assert!(remaining > 0, "No vested amount available to claim");

    // Claim the remaining vested amount
    let claim_amount = remaining;

    let new_claimed = stream.claimed_amount + claim_amount;

    let mut updated_stream = stream.clone();
    updated_stream.claimed_amount = new_claimed;
    data.set(&DataKey::Stream(stream_id), &updated_stream);

    // Publish event
    env.events().publish(
        (symbol_short!("Stream"), symbol_short!("Claimed")),
        StreamClaimed {
            stream_id: stream_id.clone(),
            amount: claim_amount,
            claimed_at: current_time,
        },
    );

    claim_amount
}

pub fn cancel(env: Env, stream_id: u64) {
    let data = env.storage().persistent();

    let stream: Stream = data.get(&DataKey::Stream(stream_id)).expect("Stream not found");

    if stream.canceled {
        panic!("Stream is already cancelled");
    }

    let current_time = env.ledger().timestamp();
    let vested = calculate_vested_amount(
        stream.start_time,
        stream.duration_seconds,
        stream.cliff_seconds,
        current_time,
        stream.total_amount,
    );
    let remaining = vested - stream.claimed_amount;

    let mut updated_stream = stream.clone();
    updated_stream.canceled = true;
    data.set(&DataKey::Stream(stream_id), &updated_stream);

    // Publish event
    env.events().publish(
        (symbol_short!("Stream"), symbol_short!("Canceled")),
        StreamCanceled {
            stream_id: stream_id.clone(),
            sender: stream.sender.clone(),
            refunded_amount: remaining,
        },
    );
}

pub fn get_stream(env: Env, stream_id: u64) -> Stream {
    let data = env.storage().persistent();
    data.get(&DataKey::Stream(stream_id)).expect("Stream not found")
}

pub fn get_vested_amount(env: Env, stream_id: u64) -> i128 {
    let stream = get_stream(env.clone(), stream_id);
    let current_time = env.ledger().timestamp();
    calculate_vested_amount(
        stream.start_time,
        stream.duration_seconds,
        stream.cliff_seconds,
        current_time,
        stream.total_amount,
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialize() {
        let env = soroban_sdk::Env::default();
        let admin = Address::generate(&env);
        let contract = StreamableStealthContract::instance(&env);
        initialize(&env, &admin);
    }

    #[test]
    fn test_create_stream() {
        let env = soroban_sdk::Env::default();
        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let meta_address = String::from("0000000000000000000000000000000000000000000000000000000000000000");
        let scheme_id = 1u32;

        let contract = StreamableStealthContract::instance(&env);
        initialize(&env, &admin);

        let total_amount = 1000000i128;
        let duration = 2592000u64; // 30 days
        let cliff = 0u64;

        let stream_id = create_stream(
            &env,
            &sender,
            scheme_id,
            meta_address,
            total_amount,
            duration,
            cliff,
        );

        let vested = get_vested_amount(&env, stream_id);
        assert_eq!(vested, 0);
    }

    #[test]
    fn test_vesting_calculations() {
        let env = soroban_sdk::Env::default();
        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let meta_address = String::from("0000000000000000000000000000000000000000000000000000000000000000");
        let scheme_id = 1u32;

        let contract = StreamableStealthContract::instance(&env);
        initialize(&env, &admin);

        let total_amount = 1000000i128;
        let duration = 2592000u64;
        let cliff = 0u64;

        let stream_id = create_stream(
            &env,
            &sender,
            scheme_id,
            meta_address,
            total_amount,
            duration,
            cliff,
        );

        let vested = get_vested_amount(&env, stream_id);
        assert_eq!(vested, 0);
    }
}
