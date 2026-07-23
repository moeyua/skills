---
name: implement
description: 'Implement an authorized change, verify it, close in-scope defects through check, and conditionally record earned durable truth through docs. Use when the user says "implement" / "build it" / "实现" / "落实", whether or not a plan exists. Not for shaping unresolved intent, inventing documentation, publishing git history, releasing, or expanding the requested scope.'
when_to_use: "implement, build, write code, apply plan, execute, 实现, 落实, 写代码, 开始动手, 按方案做"
dispatch_intent: "Implement the authorized change, close its check loop, synchronize earned durable docs, and report the complete outcome"
---

# Implement

Implement turns an authorized change into working code and tests, a final check verdict, and any durable documentation the verified change has actually earned. A plan is optional context, not an entry gate. Reuse one when it exists; otherwise execute a sufficiently clear request directly.

<HARD-GATE>
Implement writes only within the authorized change, adds no unapproved dependency, and never silently decides new product intent. It invokes the standalone, read-only check automatically and owns in-scope repair/recheck. After that behavior holds up, it invokes docs only for an evidence-backed durable obligation; docs keeps its existing catalog and source-discipline contract. Implement never continues into publish or release.
</HARD-GATE>

Read `references/anti-patterns.md`, `references/durable-context.md`, and `references/change-types.md` once per session when they are not already in context.

## Outcome Contract

- Outcome: the authorized change works, implementation verification passes, check holds up, and every evidence-backed durable-docs obligation is either synchronized or stopped at an exact authority boundary
- Done when: the initial check holds up, the docs decision is reported, any docs diff passes a complete-diff check, and the whole outcome is summarized; or the loop reaches an intent/scope/dependency/authority/no-progress boundary that requires the user
- Evidence: changed paths, red→green or invariant/measurement results, verification commands, every check verdict/action, the docs trigger or not-needed reason, authoritative docs sources, and the final complete diff
- Output: scope + changes + verification + check rounds + docs state/targets + final verdict or exact boundary + a concise complete-work summary

## Establish the implementation context

Resolve intent with this precedence: explicit request → associated plan → current conversation. A later explicit instruction can narrow or correct an older plan; do not treat the mere existence or absence of a plan as authorization.

When a plan path is explicit or uniquely identified by the current conversation, read the whole plan. If its status is `draft`, an explicit implement invocation approves it; set `status: approved` before implementation. A plan already marked `done` is not silently replayed. If no plan is identified, continue from the clear request instead of searching for one and blocking on candidates.

Before editing, inspect in parallel where available:

- `git status --short`, current branch, recent history, and project instructions;
- the files/interfaces named by the request or plan;
- project test and verification commands;
- relevant project facts and durable claims not already reliable in the session.

Use explore in context mode when project or module understanding is genuinely insufficient. This is fact gathering, not a prerequisite ceremony.

If unrelated working-tree changes are safely separable, preserve them and keep them outside this task. If they overlap the same files or make authorship/scope ambiguous, stop with the exact collision; never stash, stage, commit, discard, or overwrite them merely to proceed.

## Bound the change

State the outcome, path-level scope, acceptance, and change type before the first implementation edit. Derive the type from `references/change-types.md` using the same precedence: explicit request → associated plan → current conversation. Ask only when different classifications would materially change implementation or proof.

Mechanical choices inside the authorized outcome are yours: exact line locating, naming consistent with the repository, final wording, and micro-edit ordering. A required intent change, scope expansion, or new dependency is not mechanical; it stops the run.

When the current branch is `main`, `master`, `develop`, or detached, create a working branch before the first implementation edit. Use the plan filename slug when available; otherwise derive a short `<type>-<topic>` slug from the request. Reuse an existing same-task branch rather than creating variants.

## Implement and verify

Locate the relevant code before each edit and follow repository style. Do not make drive-by fixes.

Choose proof from the shared change type:

| type       | implementation discipline                                                      |
| ---------- | ------------------------------------------------------------------------------ |
| `fix`      | reproduce or establish the failure, add a regression that is red, fix to green |
| `feat`     | add acceptance coverage that is red, implement the bounded behavior to green   |
| `refactor` | keep characterization/regression coverage green while preserving invariants    |
| `perf`     | measure a baseline, change the evidenced bottleneck, remeasure against target  |

Use TDD for `fix` and `feat` when the project has a test framework. A new test that is already green does not prove the requested behavior was absent; correct the test before implementing. Without a framework, use the narrowest reproducible command or manual observation already appropriate to the project—do not create test infrastructure for ceremony.

Run focused verification as the change develops, then the plan's overall verification when provided or the repository's relevant suite when it is not. Retry only once when a failure plausibly looks flaky. Never skip, weaken, delete, or bypass a failing check.

## Initial check loop

Invoke check after the implementation verification passes. Run the initial check loop before deciding whether to write durable docs. Pass the standalone check capability the change scope, complete implementation diff, available plan, test evidence, and relevant user constraints. Check remains read-only; implement owns repairs.

For each initial verdict:

1. **Holds up:** proceed to durable-docs assessment. Non-blocking observations remain in the report unless acceptance already requires them.
2. **Needs work with in-scope blockers:** fix only blockers that are inside the authorized implementation scope, repeat relevant implementation verification, then run check again.
3. **Intent change or scope expansion:** stop and return the decision or authorization needed.
4. **New dependency:** stop unless it was already authorized.
5. **No progress:** stop when the same finding returns without new evidence, a repair reverses earlier progress, or check cannot produce an actionable distinction.

There is no arbitrary round count. Track finding identity across rounds so rewording does not hide no progress. Never fix unrelated observations just to empty the report.

## Assess and synchronize durable docs

After the initial check holds up, invoke docs only when at least one of these observable triggers exists:

- the associated plan contains `## Spec delta`;
- the request explicitly names a catalog or document target;
- the verified change makes an existing durable claim false.

For the third trigger, cite the exact existing target and claim and limit inspection to truth directly affected by this change. Do not turn implement into a project-wide doctor audit. Do not invoke docs merely because the catalog exists, because docs might be useful, or because a workflow convention usually includes it.

When a trigger exists, call the independent docs capability with the triggering evidence, settled user/shape decisions, relevant plan delta, verified behavior, and current targets. docs keeps its existing catalog and source-discipline contract: it selects only earned targets, never infers product intent from code, and may return that no update is warranted. Implement must not copy or loosen that contract.

Record one visible state:

- **updated:** docs changed one or more authorized targets; list targets, recorded truth, and authority;
- **not needed:** no trigger existed, or docs established that no durable update was warranted; give the concrete reason;
- **stopped:** a target needs new product intent, missing authority, expanded scope, or another docs boundary; return the exact user decision needed.

Do not mark a plan done after `stopped`.

## Complete-diff check

If docs changed files, invoke check again on the complete diff: implementation, tests, plans, and documentation. This is the final verdict for the implement outcome. If docs made no change, the holds-up initial verdict remains final; do not repeat an identical gate for ceremony.

Handle final-check findings with the same intent/scope/dependency/no-progress boundaries:

- an in-scope implementation blocker → repair it and rerun relevant verification;
- an in-scope docs blocker → call docs again with the finding and existing authority rather than editing around its contract;
- a repair that changes recorded behavior → re-run docs before the next complete-diff check;
- an unrelated observation → report it without expanding scope.

Repeat only while evidence changes and progress is real. Final-check repair does not grant new product intent or dependencies.

If a referenced plan was used, set `status: done` only after implementation verification, the initial check loop, durable-docs assessment/synchronization, any required complete-diff check, and every plan outcome and required acceptance is complete. If any required command, manual check, or observable outcome remains incomplete, leave the plan approved and report the incomplete requirement. A boundary exit likewise leaves it approved. Without a plan, create no placeholder artifact.

## Engineering boundaries

- Preserve project conventions, public compatibility required by the change, and user-owned working-tree changes.
- Add or update dependencies only when explicitly authorized by the request or plan; never touch a lockfile incidentally.
- Do not use `--no-verify`, `--force`, `@ts-ignore`, `eslint-disable`, test skips, or repeated retries to manufacture success.
- Keep secrets in the project's normal configuration path; never put credentials in code, tests, logs, plans, docs, or reports.
- Comments explain non-obvious constraints, not the edit itself or plan/Issue history.
- Keep standalone check read-only and standalone docs independently callable. Their absence earlier in the workflow is never an entry gate.
- Do not continue into publish or release. Commit, push, PR, tag, deployment, and release remain separately authorized outcomes.

## Stop conditions

Stop with concrete evidence when the requested behavior is unclear, repository facts contradict an associated plan, unrelated changes overlap the scope, a test cannot distinguish behavior, verification cannot get green after one reasoned correction, the check loop reaches a boundary above, or docs lacks authority for a triggered claim. Do not route the user backward merely because an upstream artifact is absent.

## Report

Return:

```text
Implemented: <outcome>
Branch: <branch>
Plan: <path and final status, or none>

Changes:
- <path>: <result>

Verification:
- <command/check>: <red → green or final result>

Check loop:
- initial round 1: <verdict/findings/action>
- final round 1: <verdict/findings/action, only when docs changed>

Docs: updated | not needed | stopped
- <trigger/reason, targets, authority or decision needed>

Summary:
- <implemented outcome>
- <verification and final-check result>
- <durable truth recorded or why none was needed>
- <external/manual work accurately skipped>

Final: holds up | stopped — <specific boundary>
```

Lead with the outcome and keep `Summary:` complete but concise. Mention skipped external or manual checks accurately; never label them passed. Do not imply docs ran when it did not, and do not suggest publish/release as if either already happened.
