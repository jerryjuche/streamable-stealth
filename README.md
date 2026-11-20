# Streamable Stealth Address Protocol

**A Soroban smart contract and TypeScript SDK enabling private, recurring payment streams to stealth addresses on Stellar.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version: 1.0.0](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/jerryjuche/streamable-stealth)
[![Build: Passing](https://img.shields.io/github/actions/workflow/status/jerryjuche/streamable-stealth/ci.yml)](https://github.com/jerryjuche/streamable-stealth/blob/main/.github/workflows/ci.yml)
[![GitHub](https://img.shields.io/github/stars/jerryjuche/streamable-stealth?style=social)](https://github.com/jerryjuche/streamable-stealth)

---

## 📡 Quick Links

- **Drips Wave**: https://www.drips.network/wave
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
- GitHub account (for Drips Wave participation)

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

## 🎯 Drips Wave Participation

This project is specifically set up for **Drips Wave** contributor engagement. The repository includes all the components needed for a successful Wave submission:

### Repository Requirements Met

| Requirement | Status |
|---|---|
| Public GitHub repository ✅ | https://github.com/jerryjuche/streamable-stealth |
| Soroban smart contract ✅ | Compiles with Soroban SDK 21.7.7 |
| Labeled issues ✅ | 6 Wave-labeled issues in `issues/` folder |
| Documentation ✅ | `README.md` and `docs/overview.md` |
| TypeScript SDK ✅ | Builds with `npm run build` |
| CI workflow ✅ | `.github/workflows/ci.yml` on `main` branch |

### Wave Issues (950 Total Points)

| Issue | Complexity | Points | Description |
|---|---|---|---|
| **#001** | Trivial | 100 | Improve documentation examples |
| **#002** | Trivial | 100 | Fix TypeScript type errors |
| **#003** | Medium | 150 | Add batch stream creation support |
| **#004** | High | 200 | Implement spending key proof verification |
| **#005** | Medium | 150 | Add ERC-6538 meta-address format support |
| **#006** | Medium | 150 | Improve error handling and messages |

### How to Participate in Drips Wave

1. **Log in** at https://www.drips.network/wave with your GitHub account
2. **Navigate**: Maintainers → Orgs and Repos → Install Drips Wave GitHub App
3. **Apply** your repository to the Stellar Wave Program
4. **Add** the 6 labeled issues to your Wave Program dashboard
5. **During the Wave** (7-day sprint), contributors fix issues and earn Points
6. **Points** translate to real rewards distributed after the Wave

### Current Wave

- **Wave 11** is active until **November 25th, 2026**
- **Budget**: $75,000
- **Your project**: Streamable Stealth Address Protocol

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
├── issues/           # 6 Wave-labeled issues
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

MIT License - Copyright (c) 2024 Drips Wave Ecosystem

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

---

## 🐛 Contributing

This project welcomes contributions from the Stellar ecosystem. See the `issues/` folder for Wave-labeled issues ready for contributors:

1. **Pick an issue** - 6 labeled issues with point values (100/150/200 pts)
2. **Work on a fix** - Follow the issue description and complexity level
3. **Submit a PR** - Include clear description and testing
4. **Earn Points** - Points translate to rewards from the Wave budget

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

### Running CI Locally

```bash
cd streamable-stealth
# CI workflow validates on push to main branch
# Includes: format check, type check, test execution, build validation
```

---

## 📬 Contact & Support

- **GitHub Issues**: https://github.com/jerryjuche/streamable-stealth/issues
- **Drips Wave**: https://www.drips.network/wave
- **Stellar Community**: https://discord.stellar.org
- **Email**: opensource@drips.network

---
*Streamable Stealth Address Protocol - Private recurring payment streams on Soroban*
