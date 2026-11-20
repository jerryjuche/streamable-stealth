---
title: "Fix TypeScript type errors in SDK"
labels: ["trivial", "drips-wave"]
points: 100
description: |
  There are several TypeScript type errors in the SDK source that prevent proper type checking.
  Fix the type definitions in `src/index.ts` and ensure `typescript` `--noEmit` passes without errors.
assignees: ["none"]
---

## Description

The SDK has several TypeScript type errors that need to be resolved. This is a straightforward task for contributors with TypeScript experience.

## What to do

1. Run `npm run test:coverage` or `npx tsc --noEmit` to identify all type errors
2. Fix the type definitions in `src/index.ts`
3. Ensure all types are correct and consistent
4. Update any related type definitions

## Acceptance Criteria

- [ ] `npx tsc --noEmit` passes without errors
- [ ] All type definitions are consistent and correct
- [ ] No new type errors introduced
- [ ] Project builds successfully with `npm run build`