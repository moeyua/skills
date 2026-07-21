# shape — `refactor` mode

Use `refactor` when internals change while externally observable behavior, side effects, and meaningful performance characteristics remain stable.

## Evidence to resolve

- Name the structural problem and the boundary of the reorganization.
- Identify observable behavior that must remain invariant.
- Inspect existing coverage and expose unprotected invariants before moving structure.
- Use the common `## Architecture` trigger when the target crosses module boundaries or introduces a layer.

If the intended result changes external behavior, select `fix` or `feat` instead.

## Required plan sections

### `## Behavior invariants`

List concrete reviewer-verifiable assertions for public interfaces, schemas, side effects, error behavior, and performance characteristics that stay stable. Also state the internal names, private signatures, module boundaries, or file layout allowed to change.

### `## Regression coverage`

Map each invariant to existing automated tests, new characterization coverage added before restructuring, or a specific manual check when automation is impractical. Every invariant needs a protection path.

A behavior-preserving refactor normally omits `## Spec delta`.

## Ready when

The target structure is clear, every observable invariant has coverage, and behavior changes or unrelated fixes have been split out.
