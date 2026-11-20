# Streamable Stealth Address Protocol for Soroban

This Soroban contract enables private, recurring payment streams to stealth addresses on Stellar. 

## Overview

Traditional Soroban streams send value to transparent recipient addresses. This contract introduces the ability to send streams to **stealth meta-addresses**, preserving recipient privacy. The recipient's actual address is never stored on-chain - only a 64-byte meta-address is used.

During a contribution period, the sender allocates a total amount over a fixed duration. As time passes, the recipient "vests" value continuously. The recipient can claim withdrawn value using their spending key, which proves ownership of the stealth address.

## Contract Structure

### Core Data Structures

```rust
// Stealth meta-address: 64-byte address representing a stealth scheme
// Scheme ID: identifies the stealth address scheme used
// Stream vests value over time to the meta-address
```

### Key Functions

| Function | Description |
|---|---|
| `init` | Initialize the contract with admin address |
| `create_stream` | Create a stream to a stealth meta-address |
| `claim` | Recipient claims vested value (requires spending key proof) |
| `cancel` | Cancel a stream and refund remaining value to sender |
| `get_stream` | Retrieve stream details |
| `get_vested_amount` | Calculate vested amount for a stream |

### Events

- `StreamCreated` - Emitted when a new stream is created
- `StreamClaimed` - Emitted when value is claimed
- `StreamCanceled` - Emitted when a stream is canceled

## Stealth Address Integration

The contract works with existing stealth address implementations:

- **ERC-6538 meta-address**: 64-byte on-chain representation
- **Scheme ID**: Unique identifier for the stealth address scheme
- **Spending key**: Proves ownership of the stealth address for claiming

## Installation

```bash
# Build the contract
cd contracts
make build

# Deploy to Stellar testnet
SECRET_KEY="S..." make deploy

# Run tests
make test
```

## Usage Example

```rust
use streamable_stealth_contract;

fn main() {
    // Initialize contract
    let contract = streamable_stealth_Contract::instance();
    
    // Create a stream to a stealth meta-address
    // Amount vests over 30 days (2592000 seconds)
    let stream_id = contract.create_stream(
        scheme_id,       // stealth address scheme identifier
        meta_address,    // 64-byte stealth meta-address
        total_amount,    // total amount to stream
        duration_seconds, // vesting duration
    );
    
    // Recipient can claim vested value
    let claimed = contract.claim(stream_id, spending_key_proof);
}
```