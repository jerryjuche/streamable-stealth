# Streamable Stealth Address Protocol

A Soroban smart contract and TypeScript SDK enabling private, recurring payment streams to stealth addresses on Stellar.

## Overview

This protocol extends traditional payment streaming to support **stealth addresses**, preserving recipient privacy. Instead of sending value to a transparent recipient address, streams are sent to a 64-byte stealth meta-address. The recipient can claim vested value using their spending key, which proves ownership of the stealth address.

## Key Features

- **Private payment streams**: Value vests to stealth meta-addresses, not transparent addresses
- **Recipient privacy**: Actual recipient address never stored on-chain
- **Vesting schedules**: Streams vest value over time (with optional cliff period)
- **Claimable by recipient**: Only those with the spending key can claim
- **Cancelable**: Senders can cancel streams and refund remaining value
- **Batch support**: Foundation for multiple streams in future versions

## Quick Start

### Prerequisites

- Node.js 18+
- Stellar/Soroban development environment
- Soroban contract deployed to testnet or network

### Installation

```bash
# Install the SDK
npm install @wraith-protocol/streamable-stealth

# Or use directly from this repo
cd streamable-stealth/sdk
npm install
```

### Using the SDK

```typescript
import {
  StreamableStealthClient,
  SchemeId,
  CreateStreamOptions,
  ClaimOptions,
} from "@wraith-protocol/streamable-stealth";

// Initialize SDK client
const client = new StreamableStealthClient(
  "https://soroban-testnet.stellar.org",
  "CONTRACT_ADDRESS_HERE",
  "YOUR_SECRET_KEY_HERE"
);

// Create a stream to a stealth meta-address
// Amount vests over 30 days (2592000 seconds) with no cliff
const streamId = await client.createStream({
  scheme_id: 1, // Your stealth address scheme identifier
  meta_address: Buffer.from("..."), // 64-byte stealth meta-address
  total_amount: "1000000", // 1,000,000 units
  duration_seconds: 2592000, // 30 days
  cliff_seconds: 0, // No cliff
});

// Claim vested value (requires spending key proof)
const claimResult = await client.claim(streamId, {
  spending_key_proof: "proof-data-here",
});
```

### Using the Contract Directly (Rust)

```rust
use streamable_stealth_contract;

fn main() {
    // Initialize
    let contract = streamable_stealth_Contract::instance();
    contract.init(admin_address);
    
    // Create stream
    let stream_id = contract.create_stream(
        scheme_id,
        meta_address,
        total_amount,
        duration_seconds,
        cliff_seconds,
    );
    
    // Claim
    let amount = contract.claim(stream_id, spending_key_proof);
}
```

## Drips Wave Participation

This project is set up for **Drips Wave** participation. The repository includes:

- **Labeled issues** ready for contributors to work on during a Wave sprint
- **Clear complexity levels** (Trivial: 100pts, Medium: 150pts, High: 200pts)
- **Documentation** that contributors can improve
- **Test coverage** that can be extended

### Issues for Wave Participants

| Complexity | Point Value | Issue Description |
|---|---|---|
| Trivial | 100 | Improve documentation examples |
| Trivial | 100 | Add TypeScript type fixes |
| Medium | 150 | Add batch stream creation support |
| Medium | 150 | Improve error handling and messages |
| High | 200 | Complete spending key proof verification |
| High | 200 | Add support for ERC-6538 meta-address format |

## Contributing

This project welcomes contributions from the Stellar ecosystem. To contribute:

1. Fork the repository
2. Look at the `issues` folder for Wave-labeled issues
3. Work on an issue and submit a Pull Request
4. Follow the conventional commits format for commit messages

## License

MIT