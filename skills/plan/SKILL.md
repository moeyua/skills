---
name: plan
description: "Persist settled development work as a local implementation plan, GitHub Issue work items, or both. Use when the user asks to plan, capture implementation work, or create Issues from a clear direction. Not for exploring product direction (use shape), executing changes (use implement), editing existing Issues, or managing Projects and task status."
---

# Plan

Plan persists settled work through one of three public targets:

- `local` — one implementation plan in `plans/`;
- `issue` — 1–20 explicitly separated GitHub Issue work items in one repository;
- `both` — one local plan followed by at most one matching Issue.

Resolve the artifact target before any side effect. When the target is omitted, use `both`. If the user supplies conflicting targets, stop before side effects. Never infer, recommend, or switch the target from repository state, GitHub availability, worktree conditions, task size, or expected failure. Do not fall back to or retry through a different artifact target.

Once the target and its required repository and item boundaries are explicit, the invocation authorizes that target's artifacts; execute without a second confirmation or prose-approval gate. Load exactly one target contract:

- `references/target-local.md`
- `references/target-issue.md`
- `references/target-both.md`

## Ground the work

Do not require shape or another artifact to have run. Reuse settled conversation context and inspect only repository facts needed for a reliable handoff. Resolve gaps that could change outcome, scope, public behavior, hard-to-reverse architecture, repository identity, item boundaries, or acceptance; never persist unresolved intent as `TODO` or `TBD`.

The targets have different cardinality: `local` and `both` accept one coherent change; `issue` accepts 1–20 explicitly separated work items for the same repository. Never auto-split, merge, regroup, or reroute work to fit a target.

Select one type per work item from `references/change-types.md`: `fix`, `feat`, `refactor`, or `perf`. For a local plan, load only the matching `references/mode-fix.md`, `references/mode-feat.md`, `references/mode-refactor.md`, or `references/mode-perf.md`. Load `references/issue-formats.md` only for Issue creation, and use the user's current language for every user-visible Issue field.

## Identity and result

Each local plan and Issue work item has at most one GitHub Issue identity. A user-supplied or already recorded canonical URL is that identity: verify and reuse it when the selected target permits, never search by title, and never create a replacement merely because verification failed.

Plan creates only the selected artifacts. It never implements, commits, pushes, opens a pull request, or treats an artifact as implementation approval.

Report the selected target and every artifact's exact result. Include only paths and canonical URLs verified to exist, preserve partial success as its target contract defines, and never convert failure into an unrequested fallback.
