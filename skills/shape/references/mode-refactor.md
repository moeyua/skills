# think — `refactor` mode

Triggers: restructure, change internals, "refactor this", "split X apart", "this is too messy".

The core of `refactor` is **behavior unchanged** — the externally observable output, side effects, and performance characteristics stay the same; only the internals are reorganized.

## Clarify focus (refactor-specific)

- Goal of the refactor: readability / less duplication / decoupling / preparing for the next feat / something else?
- Boundary: how deep does it go? does it include the external API?
- Behavior-preservation scope: which behaviors absolutely must not change? (public API / side effects / error messages)
- Existing test coverage: how much do current tests protect? how do you verify the parts they don't cover?

## Required plan fields (beyond the common skeleton)

### `## Behavior invariants`

The explicit list of behaviors **this refactor guarantees won't change**. Each is an assertion a reviewer can verify.

Examples:

- public function `foo(x)` returns the same value for all existing inputs
- the response schema of HTTP endpoint `/api/users` is unchanged
- the database schema is unchanged
- log format / error message text is unchanged
- performance characteristics (latency / memory) don't change meaningfully

Also state explicitly what's **allowed to change**:

- internal function names / private method signatures / module structure / file organization — can change
- undocumented implementation details — can change

### `## Regression coverage`

How to verify the invariants really didn't change. Three layers:

1. **Existing automated tests**: list the current test set; running it green protects some invariants.
2. **New regression tests**: for invariants the existing tests don't cover, add tests before refactoring (so the refactor has a safety net).
3. **Manual spot checks**: for what truly can't be automated (visual / integration / performance characteristics), list the specific check steps.

If an invariant has neither an automated test nor a manual check path → **the refactor can't start**; add tests first / freeze first.

## Anti-patterns

- Changing behavior while refactoring ("fixed a couple of bugs along the way") — split it out into fix mode.
- Adding features while refactoring — split it out into feat mode.
- Optimizing performance while refactoring — split it out into perf mode.
- Behavior invariants written as "functionality unchanged" — not specific enough; list them one by one.
- Starting without regression coverage — refactoring is a "high-risk, no-reward" move; don't do it without a safety net.
- Bundling the refactor with feat / fix into one plan — the reviewer can't tell which changes were necessary.
