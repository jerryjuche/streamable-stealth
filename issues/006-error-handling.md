---
title: "Improve error handling and error messages in contract"
labels: ["medium", "drips-wave"]
points: 150
description: |
  The contract has several places where errors panic with generic messages. Improve the
  error handling to provide clearer, more descriptive error messages that help contributors
  and users understand what went wrong.
assignees: ["none"]
---

## Description

Several contract functions use `panic!` with generic messages. This issue asks to improve
error handling with more descriptive messages and, where appropriate, custom error types.

## What to do

1. Identify all `panic!` calls in the contract with generic messages
2. Replace with custom error types or more descriptive messages
3. Ensure errors are still caught and handled appropriately
4. Update the SDK to surface meaningful errors to users
5. Add tests that verify error scenarios produce expected messages

## Acceptance Criteria

- [ ] No generic panic messages in contract (replace with descriptive errors)
- [ ] SDK provides meaningful error messages
- [ ] All error scenarios covered by tests
- [ ] Project builds and tests pass