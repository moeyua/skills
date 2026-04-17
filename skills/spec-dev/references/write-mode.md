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

**Step 1: Scope** — Propose the feature's **Goal** and **Non-goals** side by side. Goal is one line from the user's perspective, no technology names. Non-goals explicitly list what this spec does NOT cover, to prevent scope creep. Presenting them together lets the user calibrate one against the other — Non-goals sharpen the Goal and vice versa. Wait for confirmation.

**Step 2: Behavior Constraints** — Propose behavior constraints as precondition/behavior/postcondition triples. Present them to the user and ask: are these complete? Any missing edge cases? Any constraints that don't belong? Revise based on feedback. Only proceed when the user confirms.

**Step 3: State Machine** (if the feature has stateful behavior) — Not every feature needs one. Use judgment: a login flow has states (unauthenticated → authenticating → authenticated → error), a simple data transform does not. If applicable, propose the states and transitions, confirm with the user.

**Step 4: Acceptance Criteria** — Propose AC based on the confirmed behavior constraints. Each AC must be verifiable by a single test. Present the list and ask the user to review: any missing? Any too vague? Any that should be split or merged? Mark each as `[ ]` (not yet implemented — see [concepts](concepts.md#three-state-acceptance-criteria) for the full three-state system).

**Step 5: Verification** — Derive testing from AC. Two kinds, presented together in one message because they share the same root (AC) and differ only in scope:

- **BDD scenarios** (user-visible behavior) — Gherkin scenarios covering both happy path and error paths. Each scenario maps back to a specific AC. Verified by automated E2E tests or manual testing; `docs/guides/testing.md` defines which method the project uses.
- **TDD pointers** (pure logic, module-level) — What unit test each AC needs, which module, what behavior to verify. Not the full test code — just direction.

Confirm with the user before proceeding.

**Step 6: Consistency Check** — Before writing the file, run a self-audit and present the results as a checklist to the user. This is the quality gate — assumptions that slipped through earlier steps get caught here, where fixing them is still cheap. Check:

- Every Behavior Constraint's post-condition has at least one AC covering it
- Every AC maps to either a BDD scenario or a TDD pointer (or both)
- BDD scenarios cover at least one happy path AND one error path
- No UI details leaked into AC (pixel values, color codes, button labels)
- No implementation technology mentioned in Behavior Constraints
- Goal and Non-goals are consistent with the AC (nothing in AC that Non-goals excluded, nothing missing that Goal promised)

If anything fails, offer to loop back to the relevant earlier step. If everything passes, proceed to Step 7.

**Step 7: Write Spec File** — Write the complete spec to `docs/specs/{feature-name}.md`.

## Scaling by feature size

Not every feature needs the full treatment. Use judgment:

| Feature size | What to write | What to skip |
|-------------|---------------|--------------|
| **Large** (new module, cross-cutting) | Full 7 steps: Scope, Behavior Constraints, State Machine, AC, Verification (BDD + TDD), Consistency Check, Write | Nothing |
| **Medium** (new feature in existing module) | Scope, Behavior Constraints, AC, Verification (BDD only), Consistency Check, Write | State Machine (unless stateful), TDD pointers (obvious from AC) |
| **Small** (enhancement, UI tweak) | Scope, AC (each AC notes test type: unit/integration/E2E), Consistency Check, Write | Behavior Constraints, State Machine, BDD scenarios, detailed TDD pointers |
| **Bug fix** | Skip spec entirely — write a failing test that reproduces the bug, then fix it | Everything |

The scaling guide is about pragmatism, not laziness. A small feature with 2 AC doesn't need 5 BDD scenarios and a state machine. But every AC — regardless of feature size — must indicate how it will be tested, and Consistency Check always runs. The principle "AC = Test" has no exceptions; what scales is the surrounding documentation, not the test↔AC mapping itself.

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
