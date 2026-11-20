# Streamable Stealth Address Protocol

**A Soroban smart contract and TypeScript SDK enabling private, recurring payment streams to stealth addresses on Stellar.**

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version: 1.0.0](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build: Passing](https://img.shields.io/github/actions/workflow/status/jerryjuche/streamable-stealth/ci.yml)

---

## 📡 Quick Links

- **GitHub**: https://github.com/jerryjuche/streamable-stealth
- **Stellar Docs**: https://developers.stellar.org/docs
- **Soroban SDK**: https://soroban.stellar.org/docs

---

## 📖 Overview

This protocol extends traditional payment streaming to support **stealth addresses**, preserving recipient privacy on Stellar/Soroban. Instead of sending value to a transparent recipient address, streams are sent to a **64-byte stealth meta-address**. The recipient can claim vested value using their spending key, which proves ownership of the stealth address without revealing the actual recipient address on-chain.

### Why This Matters

Traditional Soroban streams send value to transparent recipient addresses, making all transaction recipients visible on-chain. This protocol enables private payment streams where:

- The recipient's actual address is never stored on-chain
- Only a 64-byte meta-address is recorded
- Recipients prove ownership via spending key to claim vested value
- Full auditability with privacy preservation

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Private payment streams** | Value vests to stealth meta-addresses, not transparent addresses |
| **Recipient privacy** | Actual recipient address never stored on-chain |
| **Vesting schedules** | Streams vest value over time (with optional cliff period) |
| **Claimable by recipient** | Only those with the spending key can claim |
| **Cancelable** | Senders can cancel streams and refund remaining value |
| **ERC-6538 compatible** | Meta-address format compatible with EVM-based implementations |
| **Multiple schemes** | Scheme IDs allow multiple stealth address implementations to coexist |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust (for contract development)
- Soroban development environment (testnet/horizon)

### Installation

```bash
# Install the TypeScript SDK
npm install @wraith-protocol/streamable-stealth

# Or use directly from this repository
cd streamable-stealth/sdk
npm install
```

### Using the SDK (TypeScript)

```typescript
import {
  StreamableStealthClient,
  SchemeId,
  CreateStreamOptions,
  ClaimOptions,
  StreamCreatedEvent,
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
  scheme_id: 1,
  meta_address: "0000000000000000000000000000000000000000000000000000000000000000",
  total_amount: "1000000",
  duration_seconds: 2592000,
  cliff_seconds: 0,
});

// Claim vested value (requires spending key proof)
const claimResult = await client.claim(streamId, {
  spending_key_proof: "proof-data-here",
});
```

### Using the Contract Directly (Rust)

```rust
use streamable_stealth_contract;
use soroban_sdk::Env;
use soroban_sdk::Address;

fn main() {
    let env = Env::default();
    let contract = streamable_stealth_contract::Contract::instance(&env);

    // Initialize contract with admin
    contract.initialize(&env, &admin_address);

    // Create a new stream
    let stream_id = contract.create_stream(
        &env,
        &sender,
        1,                          // scheme_id
        "0000000000000000000000000000000000000000000000000000000000000000", // meta_address
        1000000,                    // total_amount
        2592000,                    // duration_seconds (30 days)
        0,                          // cliff_seconds
    );

    // Claim vested value
    let amount = contract.claim(&env, stream_id);
}
```

---

## 📁 Project Structure

```text
streamable-stealth/
├── contracts/          # Soroban smart contract (Rust)
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs      # Contract source (compiles with Soroban SDK 21.7.7)
├── sdk/              # TypeScript SDK
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts    # SDK source (builds with npm run build)
├── issues/           # 6 labeled issues for contributors
├── docs/             # Documentation
│   └── overview.md
├── README.md         # This file
└── .github/
    └── workflows/
        └── ci.yml      # CI configuration
```

---

## 📡 Contract API

| Function | Description | Args |
|---|---|---|
| `initialize(env, admin)` | Initialize contract with admin | `admin: Address` |
| `create_stream(env, sender, scheme_id, meta_address, total_amount, duration_seconds, cliff_seconds)` | Create a new stream | All required |
| `claim(env, stream_id)` | Claim vested value from a stream | `stream_id: u64` |
| `cancel(env, stream_id)` | Cancel a stream and refund remaining value | `stream_id: u64` |
| `get_stream(env, stream_id)` | Get stream details | `stream_id: u64` |
| `get_vested_amount(env, stream_id)` | Calculate vested amount | `stream_id: u64` |

---

## 📦 SDK API

| Method | Description |
|---|---|
| `new(rpcUrl, contractAddress, secretKey)` | Initialize SDK client |
| `init(admin)` | Initialize contract |
| `createStream(options)` | Create a new stream |
| `claim(streamId, options)` | Claim vested value |
| `cancel(streamId)` | Cancel a stream |
| `getStream(streamId)` | Get stream details |
| `getVestedAmount(streamId)` | Get vested amount |
| `generateSchemeId()` | Generate random scheme ID |
| `verifySpendingKeyProof(metaAddress, proof)` | Verify spending key proof |
| `calculateVestedAmount(startTime, durationSeconds, cliffSeconds, currentTime)` | Calculate vested amount |

---

## 📜 License

MIT License - Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

---

## 🐛 Contributing

This project welcomes contributions from the Stellar ecosystem. The repository includes 6 labeled issues ready for contributors to work on during sprint cycles:

1. **Pick an issue** - 6 labeled issues with point values
2. **Work on a fix** - Follow the issue description
3. **Submit a PR** - Include clear description and testing

---

## 🔧 Development

### Building the SDK

```bash
cd streamable-stealth/sdk
npm run build   # TypeScript compilation
npm test        # Run tests
npm run lint    # Lint check
```

### Checking the Contract

```bash
cd streamable-stealth/contracts
cargo check     # Compile check
cargo test      # Run test suite
```

---

## 📬 Contact & Support

- **GitHub Issues**: https://github.com/jerryjuche/streamable-stealth/issues
- **Stellar Community**: https://discord.stellar.org

---
*Streamable Stealth Address Protocol - Private recurring payment streams on Soroban*
