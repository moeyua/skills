---
name: implement
description: 'Implement an authorized change, verify it in proportion to risk, and keep directly affected durable truth accurate. Use when the user says "implement" / "build it" / "实现" / "落实", whether or not a plan exists. Not for shaping unresolved intent, publishing git history, releasing, or expanding the requested scope.'
---

# Implement

Implement owns a clear, authorized outcome from edit through an evidence-backed implementation candidate. A plan is optional context, not an entry gate; missing upstream artifacts or prior Skill calls do not shift orchestration back to the user.

## Ground and bound the change

Resolve intent from the explicit request and the current conversation's settled decisions and corrections, then use an associated plan as implementation context. Read that plan in full and keep its state accurate, but never let it override a later user correction. Keep the active outcome and horizon separate from an Agent-selected mechanism or local task. A Design Summary, plan, code change, or merged artifact carries only the authority of the sources it records; implementation state does not settle an undisclosed consequential preference. When the user rejects a premise, discard it and revisit the edits and conclusions that actually depended on it. Explicit implementation authorization moves an associated `draft` or unaccepted `candidate` plan to `approved` before the first implementation edit. When Check is composed inside the same active Implement invocation, that implementation authorization remains available for in-scope repair; Check findings alone never create authorization or an `approved` state. A `done` plan is never silently replayed or reopened; it needs explicit new implementation authorization, and a legacy `done` without complete Assurance does not establish independent acceptance. Inspect project instructions, working tree, target code, and available verification before editing; use Explore context when unfamiliar structure would otherwise make the change unreliable.

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

## Produce a candidate and compose acceptance when needed

Start with the cheapest evidence that could disprove the change, then broaden for cross-cutting, public, security-sensitive, hard-to-reverse, historically fragile, or explicitly release-bound work.

Once the claimed outcome is implemented and its local evidence and known limitations are recorded, establish a stable, independently recomputable basis for the complete claimed change; the result is a `candidate`. Mark an associated `approved` plan `candidate` and replace its recorded Assurance snapshot with that basis, the Implement producer, evidence, limitations, and any applicable Check result. Without a plan, report the same basis and assurance state without creating an artifact. Candidate is a valid completion state for Implement, but it is not independent acceptance.

Check and Docs are available capabilities, not a fixed sequence. Autonomously compose either, both, or neither when they materially complete the authorized outcome:

- use Check for an explicit acceptance or pre-merge gate, a broad or risky diff, independent judgment, relevant full-suite coverage, or real end-to-end behavior;
- use Docs when the request names a document, the plan carries a Spec delta, or verified behavior makes an existing durable claim false and authority for the correction already exists;
- after any in-scope repair or documentation change, rerun only the evidence whose basis changed; include the complete diff when interactions between code, tests, plans, and docs matter.

An acceptance Check must use a fresh context independent of the implementation trajectory and return the stable candidate basis it checked, its Check producer/reference, `pass`, `findings`, or `inconclusive`, and an explicit acceptance field. Preserve Check's read-only verdict role and Docs' authority/catalog boundaries whenever they are composed. If an independent Check is unavailable, finish honestly at candidate rather than self-attesting acceptance.

Consume the exact Check verdict + acceptance-field pair mechanically:

- `pass` may move the associated plan to `done` only when Check also reports `attested for the exact current candidate` and the reported stable basis matches the current candidate;
- `findings` leave it at `candidate` with acceptance not established; repair only when this Implement invocation's original authorization is still active or the user explicitly authorizes a new implementation outcome, moving it to `approved` before editing;
- `inconclusive` leaves it at `candidate` and names the missing evidence.

Any repair or other change to the checked basis creates a new stable candidate basis; an earlier pass does not attest the changed result. A plan's `done`/Assurance is a time-scoped record, so current acceptance also requires basis match and the latest applicable Check result available in the current context. A later finding supersedes an older pass wherever that result is available, but does not rewrite or reopen the plan or authorize repair; that needs a new explicit implementation outcome, with a new plan only if requested. Implement never reinterprets findings, converts a scoped pass, its own tests, or dogfood into an acceptance verdict, or grants itself `done`.

Retry a plausibly flaky command once. Stop when the same finding returns without new evidence, or when progress requires changed intent, expanded scope, a new dependency, or missing document authority.

A mechanism, local fix, static check, intermediate state, or running job is evidence only for what it actually establishes; it does not replace the user's observable outcome.

## Boundary and report

Implement does not continue into commit, push, PR, release, deployment, or other externally visible delivery unless that outcome was separately authorized through its owning capability.

Lead with what now works, bounded by evidence that matches the claimed outcome. Report candidate or accepted state; the stable candidate basis; changed paths; verification actually run and its producer; the Check producer and exact verdict + acceptance-field pair when one exists, plus whether its reported basis matches the current candidate; known limitations and deliberately unrun material checks; supporting capabilities actually used; and any exact boundary. Never imply a higher-level outcome, independent acceptance, Check, Docs, Publish, or Release happened when the necessary evidence or capability did not.
