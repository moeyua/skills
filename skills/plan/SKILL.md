---
name: plan
description: "Persist implementation-ready work as a local plan, bounded development problems as GitHub Issues, or both. Use when the user asks to plan, capture implementation work, or create Issues from a clear problem. Not for exploring product direction (use shape), executing changes (use implement), editing existing Issues, or managing Projects and task status."
---

# Plan

Plan persists implementation-ready work or bounded development problems through one of three public targets:

- `local` — one implementation plan in `plans/`;
- `issue` — 1–20 explicitly separated, problem-oriented GitHub Issues in one repository;
- `both` — one local plan followed by at most one matching problem record.

Resolve the artifact target before any side effect. When the target is omitted, use `both`. If the user supplies conflicting targets, stop before side effects. Never infer, recommend, or switch the target from repository state, GitHub availability, worktree conditions, task size, or expected failure. Do not fall back to or retry through a different artifact target.

Once the target and its required repository and item boundaries are explicit, the invocation authorizes that target's artifacts; execute without a second confirmation or prose-approval gate. Load exactly one target contract:

- `references/target-local.md`
- `references/target-issue.md`
- `references/target-both.md`

## Ground the work

Do not require shape or another artifact to have run. Reuse the current conversation and inspect only repository facts needed by the selected artifact.

`local` and `both` require one implementation-ready change. Resolve gaps that could change outcome, scope, public behavior, hard-to-reverse architecture, or acceptance; never put unresolved intent in the local plan as `TODO` or `TBD`.

`issue` requires only a bounded development problem that can be stated factually and distinguished from adjacent items. Its solution, target architecture, and complete acceptance may remain unknown. Inspect facts needed to establish the problem, evidence, impact, repository identity, and item boundary; never invent a solution or turn an unknown into an implementation task merely to make the Issue look actionable.

The targets have different cardinality: `local` and `both` accept one coherent change; `issue` accepts 1–20 explicitly separated work items for the same repository. Never auto-split, merge, regroup, or reroute work to fit a target.

Select one type per work item from `references/change-types.md`: `fix`, `feat`, `refactor`, or `perf`. For a local plan, load only the matching `references/mode-fix.md`, `references/mode-feat.md`, `references/mode-refactor.md`, or `references/mode-perf.md`. Load `references/issue-formats.md` only for Issue creation, and use the user's current language for every user-visible Issue field. Every new Issue records the problem, why it matters, and the observable resolved state when known; it never carries the technical approach, target architecture, path-level changes, or implementation steps from a local plan.

## Identity and result

Each local plan and Issue work item has at most one GitHub Issue identity. A user-supplied or already recorded canonical URL is that identity: verify and reuse it when the selected target permits, never search by title, and never create a replacement merely because verification failed.

Plan creates only the selected artifacts. It never implements, commits, pushes, opens a pull request, or treats an artifact as implementation approval.

Report the selected target and every artifact's exact result. Include only paths and canonical URLs verified to exist, preserve partial success as its target contract defines, and never convert failure into an unrequested fallback.
