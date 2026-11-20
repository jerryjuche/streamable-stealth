---
title: "Implement spending key proof verification"
labels: ["high", "drips-wave"]
points: 200
description: |
  Implement full spending key proof verification to enable claiming from streams.
  The current implementation has a placeholder verification. Complete the integration with
  the stealth address protocol's signature scheme to allow recipients to actually claim
  vested value from streams.
assignees: ["none"]
---

## Description

The contract currently has a basic spending key proof check that only verifies the proof is
non-empty. This issue requires implementing the full verification flow for the stealth
address protocol, enabling recipients to claim vested value from streams.

## What to do

1. Research the stealth address protocol's signature scheme (based on ECDH and secp256k1/ed25519)
2. Implement the spending key proof verification in the contract's `claim` function
3. Update the SDK's `verifySpendingKeyProof` function
4. Add test cases that verify the claiming flow works end-to-end
5. Ensure the verification is secure and doesn't leak private information

## Technical Details

The spending key proof should verify:
- A valid signature using the stealth address protocol's curve
- That the spender owns the spending key associated with the stream's meta-address
- Zero-knowledge proof of knowledge (if used by the protocol)
- Correct derivation of the stealth address from meta-address and ephemeral key

## Acceptance Criteria

- [ ] Contract verifies spending key proofs securely
- [ ] SDK provides `verifySpendingKeyProof` function
- [ ] End-to-end tests pass for claiming flow
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated with verification details