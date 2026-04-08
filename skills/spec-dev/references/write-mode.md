---
name: write-mode
description: "Detailed instructions for Write Mode: collaborative step-by-step spec writing for features and module contracts"
---

# Write Mode — Detailed Instructions

This is the most common mode — used before starting feature-dev to define what a feature should do.

## What Write Mode produces

A feature spec file at `docs/specs/{feature-name}.md` that serves as structured input for feature-dev. When the user later runs feature-dev, they can point it to this spec so the agent has clear behavior constraints and acceptance criteria to work against.

## For a feature spec

Write Mode is a collaborative, step-by-step conversation — not a one-shot generation. Each step requires the user's confirmation before moving to the next. This matters because specs define what gets built; assumptions made here propagate through development and testing.

**Step 1: Confirm the goal** — Ask the user what the feature should accomplish from the user's perspective. Propose a one-line goal statement. Wait for the user to confirm or refine it. No technology names in the goal.

**Step 2: Define behavior constraints together** — Propose behavior constraints as precondition/behavior/postcondition triples. Present them to the user and ask: are these complete? Any missing edge cases? Any constraints that don't belong? Revise based on feedback. Only proceed when the user confirms.

**Step 3: Define state machine** (if the feature has stateful behavior) — Not every feature needs one. Use judgment: a login flow has states (unauthenticated → authenticating → authenticated → error), a simple data transform does not. If applicable, propose the states and transitions, confirm with the user.

**Step 4: Write Acceptance Criteria** — Propose AC based on the confirmed behavior constraints. Each AC must be verifiable by a single test. Present the list and ask the user to review: any missing? Any too vague? Any that should be split or merged? Mark each as `[ ]` (not yet implemented).

**Step 5: Derive BDD Gherkin scenarios from AC** — Propose scenarios that describe user-visible behavior, covering both happy path and error paths. These scenarios can be verified by automated E2E tests or manual testing — the project's `docs/guides/testing.md` defines which method is used. Confirm with the user.

**Step 6: List TDD unit test pointers** — Propose what pure logic to test, which module — not the full test code. Confirm with the user.

**Step 7: Define out of scope** — Propose what this spec explicitly does NOT cover. This prevents scope creep during development. Confirm with the user.

**Step 8: Write the spec file** — Only after all steps are confirmed, write the complete spec to `docs/specs/{feature-name}.md`.

## Scaling by feature size

Not every feature needs the full treatment. Use judgment:

| Feature size | What to write | What to skip |
|-------------|---------------|--------------|
| **Large** (new module, cross-cutting) | Full spec: goal, behavior constraints, state machine, AC, BDD, TDD pointers, out of scope | Nothing |
| **Medium** (new feature in existing module) | Goal, behavior constraints, AC, BDD scenarios | State machine (unless stateful), TDD pointers (obvious from AC) |
| **Small** (enhancement, UI tweak) | Goal, AC (each AC notes test type: unit/integration/E2E) | Behavior constraints, state machine, full BDD scenarios, detailed TDD pointers |
| **Bug fix** | Skip spec entirely — write a failing test that reproduces the bug, then fix it | Everything |

The scaling guide is about pragmatism, not laziness. A small feature with 2 AC doesn't need 5 BDD scenarios and a state machine. But every AC — regardless of feature size — must indicate how it will be tested. The principle "AC = Test" has no exceptions; what scales is the surrounding documentation, not the test↔AC mapping itself.

## For a module contract

Module contracts define what a module does and doesn't do — its boundary, public API, and invariants. Write or update a contract when:

- A new module is being created
- An existing module's public API is changing
- Multiple developers (or agents) need to understand module boundaries

Steps:
1. Read the module's source code (or discuss with user if the module doesn't exist yet)
2. Define the module's single responsibility
3. List what it owns and what it does NOT own
4. Extract public API (TypeScript signatures from actual code, or proposed signatures for new modules)
5. Identify dependencies consumed (what other modules it calls)
6. Define invariants (conditions that must always hold — violation = bug)
7. Document error scenarios and expected behavior
8. If stateful, define the state machine

## Quality checklist before finishing

- Every AC can be verified by a single test?
- No UI details in the spec (pixel values, colors, button labels)?
- No implementation technology mentioned in behavior constraints?
- BDD scenarios cover both happy path and error paths (regardless of whether verified by automated E2E or manual testing)?
- Module contract lists what it does NOT do?
