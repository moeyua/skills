# plan — `refactor` type

Use `refactor` when internals change while externally observable behavior, side effects, and meaningful performance characteristics remain stable.

## Evidence to resolve

- Name the structural problem and reorganization boundary.
- Identify observable behavior that must remain invariant.
- Inspect existing coverage and expose unprotected invariants before moving structure.
- Use the common `## Architecture` trigger when the target crosses module boundaries or introduces a layer.

If the intended result changes external behavior, select `fix` or `feat` instead.

## Required plan sections

### `## Behavior invariants`

List reviewer-verifiable assertions for public interfaces, schemas, side effects, error behavior, and important performance characteristics that stay stable. State which internal names, private signatures, module boundaries, or file layout may change.

### `## Regression coverage`

Map every invariant to existing automated tests, new characterization coverage added before restructuring, or a specific manual check when automation is impractical.

A behavior-preserving refactor normally omits `## Spec delta`.

## Ready when

The target structure is clear, every observable invariant has a protection path, and behavior changes or unrelated fixes are split out.
