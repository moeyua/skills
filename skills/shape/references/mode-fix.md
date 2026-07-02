# shape — `fix` mode

Triggers: error, exception, wrong behavior, regression, "why doesn't it work", "it used to work".

The core of `fix` is **find the root cause first, then design the fix**. No symptom-level patching (seeing a null and slapping on `if (x == null) return`).

Follow `references/shaping-protocol.md` before writing the plan: explore context, ask clarifying questions, propose 2-3 approaches, grill the recommended approach, and present the design. In `fix`, the grill should pressure-test the root cause, blast radius, and regression coverage.

## Clarify focus (fix-specific)

- Repro conditions: what action, what input, what environment triggers it?
- Blast radius: just this one spot, or could the same class of problem be in many places?
- Expected vs actual behavior: one line each.
- When introduced: did it ever work? when did it start breaking? (for bisecting)

## Required plan fields (beyond the common skeleton)

### `## Root cause`

A one-sentence statement of the root cause, including:

- **What**: down to file:line or function/condition.
- **Why**: the code path that triggers the bug.
- **Every observed symptom is explained by this one sentence** — if the root cause covers only some symptoms, it's a symptom-level guess, not a root cause.

Format:

> The root cause is `<function>` at `<file:line>` doing `<wrong behavior>` when `<condition>`, because `<reason>`.

### `## Regression tests`

Before the fix, there must be a test that **fails on the old code and passes after the fix**.

List:

- test file + test name
- what condition the test covers (what input → what expected output)
- whether it's a new test or an existing one

If the project has no test framework → list the **minimal manual repro steps** (commands / action sequence / what to observe).

If the fix changes the system's contracted behavior — the spec recorded the buggy behavior, or the correct behavior was never recorded — fill the common skeleton's `## Spec delta` (usually `## MODIFIED Requirements`) so docs can correct the source of truth after implement.

## Anti-patterns

- Seeing a null pointer and wrapping it in `if (x) ...` without asking why x is null.
- Swallowing the error with try/catch to "fix" it.
- "It's probably X" — guessing the root cause without reproducing.
- The same bug appears in N places, but only the one the user reported got fixed (missed the pattern scan).
- A root cause written as "bad user input" — that's a symptom, not a root cause.
