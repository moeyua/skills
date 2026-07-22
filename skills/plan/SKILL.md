---
name: plan
description: "Turn a grounded or already-clear development change into one executable local plan and best-effort GitHub Issue companion. Use when the user asks to plan, capture an implementation plan, or turn a settled direction into work. Not for exploring product direction (use shape), executing changes (use implement), editing existing Issues, or managing Projects and task status."
when_to_use: "plan, implementation plan, task plan, write plan, capture work, 计划, 实施方案, 写方案, 任务方案, 记录工作"
dispatch_intent: "Write one executable local plan, then best-effort associate one matching GitHub Issue"
---

# Plan

Plan persists one coherent change. The local plan is the durable implementation handoff; a GitHub Issue is an optional projection of the same intent for tracking.

<HARD-GATE>
Always write the local plan under `plans/` before attempting a GitHub Issue. Plan never implements the change. Issue failure never invalidates, removes, or blocks the local plan or any later skill.
</HARD-GATE>

Three shared rules apply — `references/anti-patterns.md`, `references/durable-context.md`, and `references/change-types.md`. Read any that are not already in context this session. Then read `references/plan-template.md` and only the matching change-type reference.

## Outcome Contract

- Outcome: one coherent change has an executable local plan and, when GitHub is available, at most one GitHub Issue associated with it
- Done when: the plan is written without intent placeholders and the optional Issue attempt has either succeeded once or produced an accurate non-blocking result
- Evidence: current conversation, relevant repository facts, the shared change-type contract, plan-specific verification signals, and actual `gh` output when attempted
- Output: plan path + change type + concise summary + Issue URL or a clear skipped/failed Issue result

## Establish the change

Reuse the current conversation and repository evidence. Do not require shape or any other skill to have run. A complete request can go directly to a plan.

Resolve only gaps that would change the outcome, scope, public behavior, hard-to-reverse architecture, or acceptance. Inspect repository-answerable facts directly. If an intent-level decision remains unresolved, discuss that specific decision and wait; never write a plan containing `TODO`, `TBD`, “implement later”, or equivalent placeholders.

Keep one coherent change per plan. If the input contains independent changes, identify the split and ask which one to persist first rather than silently bundling or creating multiple plans.

## Select the shared change type

Choose exactly one type from `references/change-types.md`: `fix`, `feat`, `refactor`, or `perf`. The type controls the plan evidence bar and the optional Issue label; it is not proof that shape ran.

Load only the matching reference:

- `references/mode-fix.md`
- `references/mode-feat.md`
- `references/mode-refactor.md`
- `references/mode-perf.md`

## Write the local plan first

Use `references/plan-template.md`. Write `plans/YYYY-MM-DD-<slug>.md` with `status: draft`, path-level scope, independently verifiable implementation steps, overall verification, and the matching change-type evidence. Include conditional sections only when their trigger exists.

Exact line locating, final wording, and micro-edit ordering belong to implement. The plan must settle intent without pre-writing the implementation.

The `/plan` invocation authorizes this local file and the best-effort Issue projection described below. Use already settled intent for both artifacts; do not introduce a second confirmation gate or ask the user to approve prose they did not request to review.

## Best-effort GitHub Issue

The plan may carry at most one GitHub Issue. An existing canonical Issue URL in the plan or explicitly supplied by the user is the identity: verify and reuse it when possible, and never search by title or create a replacement. If verification is unavailable, report that fact without inventing a second association.

When no Issue is associated, attempt this projection only after the local plan exists:

1. Run `gh auth status --active --hostname github.com`. Authentication, missing CLI, network, or permission failure means Issue creation is skipped; the plan remains successful.
2. Resolve an explicit `OWNER/REPOSITORY` first with `gh repo view OWNER/REPOSITORY --json nameWithOwner -q .nameWithOwner`; otherwise resolve the current repository with `gh repo view --json nameWithOwner -q .nameWithOwner`. If neither works, skip rather than guess or ask for a repository merely to validate the plan.
3. Read `references/issue-formats.md`. Use the plan's change type as the single lowercase label. Use the user's current language for every user-visible Issue field. An explicit language request overrides the surrounding conversation; identifiers and precision-sensitive proper nouns remain unchanged.
4. Render the matching semantic sections from the same intent as the plan. Every section must be non-empty, ordered, factual, and free of placeholders. Acceptance criteria are observable checkboxes.
5. List labels with `gh label list --repo OWNER/REPOSITORY --limit 1000 --json name`. Reuse an exact lowercase match. If no case-insensitive match exists, create only the selected label using the metadata reference. A case-only collision or label failure ends the Issue attempt without weakening or rolling back the plan.
6. Write the body to a safe temporary file and call `gh issue create --repo OWNER/REPOSITORY --label TYPE --title "TITLE" --body-file BODY_FILE`; remove the temporary file afterward. Never interpolate multiline Markdown into a shell argument.
7. On success, add `issue: <canonical URL>` to the plan frontmatter. On failure or ambiguous network result, report the exact stage and do not retry automatically, because a duplicate may already exist.

Do not use Issue Types, Projects, Drafts, milestones, assignees, dependencies, sub-issues, status automation, or multiple labels. Do not edit an existing Issue as a side effect of planning.

## Finish

Return the plan path, change type, a two- or three-line summary, and one Issue state: `created <URL>`, `reused <URL>`, `skipped <reason>`, or `failed <stage and error>`. A skipped or failed Issue is a successful degraded plan result and does not prevent the user from invoking implement.

Stop without claiming plan success only when the local file cannot be written, reliable facts cannot be obtained, a material intent decision remains unresolved, or the requested work cannot be bounded as one coherent change.
