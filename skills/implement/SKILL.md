---
name: implement
description: 'Implement an authorized change, verify it in proportion to risk, and keep directly affected durable truth accurate. Use when the user says "implement" / "build it" / "实现" / "落实", whether or not a plan exists. Not for shaping unresolved intent, publishing git history, releasing, or expanding the requested scope.'
---

# Implement

Implement owns a clear, authorized outcome from edit through sufficient proof. A plan is optional context, not an entry gate; missing upstream artifacts or prior Skill calls do not shift orchestration back to the user.

## Ground and bound the change

Resolve intent with this precedence: explicit request → associated plan → current conversation. Read an associated plan in full and keep its state accurate. Explicit implementation authorization moves an associated `draft` plan to `approved` before the first implementation edit. A `done` plan is never silently replayed or reopened; it needs explicit new implementation authorization. Inspect project instructions, working tree, target code, and available verification before editing; use Explore context when unfamiliar structure would otherwise make the change unreliable.

Preserve separable user changes. Stop on overlapping work whose ownership is ambiguous—never stash, discard, stage, or commit it merely to proceed. Before the first implementation edit, use a working branch when the current branch is protected (`main`, `master`, `develop`, or the remote default), detached, or repository policy requires isolation; reuse an existing same-task branch.

State the observable outcome and path-level scope. Mechanical decisions consistent with the repository are yours. A new product semantic, dependency, external side effect, or scope expansion is not mechanical and needs authority.

## Build with proportional proof

Read `references/change-types.md` when it helps select evidence:

- `fix` — establish expected versus actual behavior and protect the correction;
- `feat` — cover the bounded observable interface and acceptance;
- `refactor` — preserve behavior and side-effect invariants;
- `perf` — compare the same metric before and after.

Keep TDD available when a red-to-green test is a cheap, stable, meaningful proof—especially for regression-prone fixes and bounded features. It is not a universal gate: use existing tests or the narrowest falsifiable observation when a new test would be ceremonial, unstable, or require new infrastructure.

Follow local style, reshape the touched range when coherence requires it, and avoid drive-by fixes. Never weaken tests, add skips or ignore directives, bypass hooks, force operations, or repeat failures until one happens to pass.

Keep credentials on the project's normal secret/configuration path. Never place credential values in code, tests, logs, plans, docs, or reports.

## Compose the outcome

Start with the cheapest evidence that could disprove the change, then broaden for cross-cutting, public, security-sensitive, hard-to-reverse, historically fragile, or explicitly release-bound work.

Check and Docs are available capabilities, not a fixed sequence. Autonomously compose either, both, or neither when they materially complete the authorized outcome:

- use Check for an explicit gate, a broad or risky diff, independent judgment, relevant full-suite coverage, or real end-to-end behavior;
- use Docs when the request names a document, the plan carries a Spec delta, or verified behavior makes an existing durable claim false and authority for the correction already exists;
- after any in-scope repair or documentation change, rerun only the evidence whose basis changed; include the complete diff when interactions between code, tests, plans, and docs matter.

Preserve Check's read-only verdict role and Docs' authority/catalog boundaries whenever they are composed.

Retry a plausibly flaky command once. Stop when the same finding returns without new evidence, or when progress requires changed intent, expanded scope, a new dependency, or missing document authority.

Mark an associated plan `done` only after every required outcome and acceptance item is complete; otherwise leave it `approved` and name what remains.

## Boundary and report

Implement does not continue into commit, push, PR, release, deployment, or other externally visible delivery unless that outcome was separately authorized through its owning capability.

Lead with what now works. Report changed paths, verification actually run and its result, supporting capabilities actually used, deliberately unrun material checks, and any exact boundary. Never imply Check, Docs, Publish, or Release happened when it did not.
