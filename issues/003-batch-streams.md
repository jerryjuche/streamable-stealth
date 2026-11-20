---
title: "Add batch stream creation support"
labels: ["medium", "drips-wave"]
points: 150
description: |
  Implement batch stream creation functionality that allows creating multiple streams
  to different stealth meta-addresses in a single transaction. This improves gas efficiency
  and user experience for senders creating many streams.
assignees: ["none"]
---

## Description

Currently, the contract and SDK only support creating one stream at a time. This issue asks
to add batch creation support for creating multiple streams in a single operation.

## What to do

1. Extend the contract's `create_stream` function to accept multiple recipient meta-addresses
   and amounts, or create a new `batch_create_streams` function
2. Update the SDK to support the new batch functionality
3. Add appropriate events for batch stream creation
4. Ensure proper access control and validation

## Technical Details

- The contract should support creating 2-5 streams in a single call
- Each stream should have its own duration and cliff period
- Events should be emitted for each stream created
- Validate that total across all streams doesn't exceed reasonable limits

## Acceptance Criteria

- [ ] Contract supports batch creation of 2-5 streams
- [ ] SDK has `createBatchStreams` method
- [ ] Events emitted for each stream created
- [ ] Proper validation and error handling
- [ ] Tests pass for batch creation scenarios