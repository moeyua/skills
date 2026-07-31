---
name: plan
description: "Persist settled development work as a local implementation plan, GitHub Issue work items, or both. Use when the user asks to plan, capture implementation work, or create Issues from a clear direction. Not for exploring product direction (use shape), executing changes (use implement), editing existing Issues, or managing Projects and task status."
when_to_use: "plan, implementation plan, task plan, local plan, issue plan, capture work, 计划, 实施方案, 本地计划, 写 issue, 记录工作"
dispatch_intent: "Resolve the user-selected artifact target, then persist settled work as local, issue, or both"
---

# Plan

Plan persists settled development intent in the artifact form the user chooses. It has three public targets: `local`, `issue`, and `both`.

<HARD-GATE>
Resolve the artifact target before any side effect. When the target is omitted, use `both`. Never infer, recommend, or switch the target from repository state, GitHub availability, worktree conditions, request size, or expected failure. Plan never implements, publishes, commits, pushes, or opens a pull request.
</HARD-GATE>

Three shared rules apply — `references/anti-patterns.md`, `references/durable-context.md`, and `references/change-types.md`. Read any that are not already in context this session.

## Outcome Contract

- Outcome: the settled work is persisted through exactly the selected `local`, `issue`, or `both` target
- Done when: every selected artifact has its target-specific completion evidence, or an attempted multi-artifact operation reports its exact partial or failed state without silent fallback
- Evidence: current conversation, relevant repository facts, the shared change-type contract, target-specific verification signals, and actual GitHub output for any attempted mutation
- Output: selected target + per-artifact result + change type for each work item + concise summary + canonical paths or URLs that actually exist

## Resolve the artifact target

Accept an explicit target from the invocation or the user's natural-language instruction:

- `local` — write a local implementation plan only;
- `issue` — create or reuse GitHub Issue work items only;
- `both` — write one local implementation plan, then create or reuse its one Issue companion.

An omitted target is deterministically `both`; omission is not permission to choose based on context. If the user supplies conflicting targets, stop before side effects and ask them to resolve the conflict. Once resolved, load exactly one target contract and follow only that mutation boundary:

- `references/target-local.md`
- `references/target-issue.md`
- `references/target-both.md`

Do not fall back to another target, retry through another target, or reinterpret a failure as permission to create a different artifact.

The invocation authorizes the artifacts and mutations of its resolved target. When the target and its required repository and item boundaries are explicit, execute without a second confirmation or prose-approval gate. Ask only when a genuinely required identity, boundary, or material intent decision remains unresolved.

## Establish the work

Reuse the current conversation and repository evidence. Do not require shape or any other skill to have run. A complete request can go directly to plan.

Resolve only gaps that would change the outcome, scope, public behavior, hard-to-reverse architecture, repository identity, item boundaries, or acceptance. Inspect repository-answerable facts directly. If an intent-level decision remains unresolved, discuss that specific decision and wait; never persist `TODO`, `TBD`, “implement later”, or equivalent intent placeholders.

The targets have different cardinality:

- `local` and `both` accept one coherent change;
- `issue` accepts from 1–20 explicitly separated work items for the same repository.

Never auto-split, merge, group, or reroute work to make it fit a target.

## Classify the work

Choose exactly one type for each work item from `references/change-types.md`: `fix`, `feat`, `refactor`, or `perf`. The type controls evidence structure and the single GitHub label where applicable; it is not proof that shape ran.

For a local plan, load only the matching plan-quality reference:

- `references/mode-fix.md`
- `references/mode-feat.md`
- `references/mode-refactor.md`
- `references/mode-perf.md`

For an Issue, read `references/issue-formats.md` and render the matching schema. Use the user's current language for every user-visible Issue field. An explicit language request overrides the surrounding conversation; identifiers and precision-sensitive proper nouns remain unchanged.

## Canonical Issue identity

Each local plan and each Issue work item may carry at most one GitHub Issue identity. A canonical URL explicitly supplied by the user or already stored in the local plan is the identity: verify it read-only and reuse it when the selected target allows association; never search by title, create a replacement for an unverified association, or edit an existing Issue as a side effect of planning.

Every GitHub access path, including read-only canonical URL verification, starts by checking the active account with `gh auth status --active --hostname github.com`; only after that check may it resolve a repository or attempt another GitHub call. Mutation paths use safe temporary body files for multiline Markdown and remove those files afterward. Do not use Issue Types, Projects, Drafts, milestones, assignees, dependencies, sub-issues, status automation, or multiple labels.

## Finish

Report the selected target first, then the result of every requested artifact. Include only paths and canonical URLs verified to exist. For Issue batches, preserve input order and return the complete item ledger defined by the `issue` target.

Use these overall states:

- `success` — every selected artifact completed or was canonically reused;
- `partial` — `both` wrote its local plan but its Issue did not complete, or an Issue batch contains at least one `created` or `reused` row and at least one other status;
- `failed` — no selected artifact completed;
- `blocked` — preflight found missing or conflicting required input before any mutation.

Never describe a different target as a fallback. A `local` success can proceed to implement. A `both` partial result can also proceed to implement because its valid local plan remains authoritative.
