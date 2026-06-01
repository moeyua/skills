# think — `feat` mode

Triggers: new feature, new capability, "add an X", "support Y".

The core of `feat` is **the interface boundary** and **acceptance scenarios**. The feature itself may be large, but the think stage converges it into a plan that can be built in steps.

## Clarify focus (feat-specific)

- User scenario: who, in what situation, wants to achieve what?
- MVP boundary: which cases does the first version support, which not?
- Any similar feature to reference? (in-project / similar projects / framework built-in)
- Acceptance: how does a reviewer verify this feature is implemented?

## Required plan fields (beyond the common skeleton)

### `## Interface boundary`

What the new feature exposes and what it doesn't. Include:

- **Public API**: function signatures / endpoints / commands / component props — down to names and types.
- **Inputs**: what's valid, what's not.
- **Outputs**: what success returns, what failure returns.
- **Side effects**: writes to a database / calls an external service / mutates global state / emits events — list them all.
- **Not exposed**: internal details, room for future extension — state explicitly "not expressed through the external interface".

### `## Acceptance scenarios`

A list of scenarios a reviewer can verify item by item, each in the form:

> Given <state>, when <action>, then <expected outcome>.

Cover at least:

- happy path (at least 1)
- error handling (invalid input / external dependency failure / boundary conditions)
- edge cases (empty / full / boundary values / concurrency)

Each scenario maps to at least 1 implementation step + at least 1 acceptance check.

If the feature changes externally observable behavior, also fill the common skeleton's `## Spec delta` (usually `## ADDED Requirements`) — the acceptance scenarios above map directly onto the spec's scenarios, so the spec skill can crystallize them into `specs/` after build.

## Anti-patterns

- "Support type X" — without saying which types, how the user passes them, how error types are reported.
- Burying an architecture decision inside a feature plan ("refactor the storage layer while we're at it") — split it out into refactor mode.
- Acceptance scenarios written as "basically works" — they must be verifiable item by item.
- Interface boundary lists only the happy path — error returns must be designed in the feat, not left to implement.
- Writing "might add Y later" into the current feat's interface — design only the MVP; extensibility is a v2 concern.
