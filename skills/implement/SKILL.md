---
name: implement
description: 'Implement an authorized change, verify it, and close in-scope defects through an automatic check loop. Use when the user says "implement" / "build it" / "实现" / "落实", whether or not a plan exists. Not for shaping unresolved intent, writing durable prose docs, publishing git history, or expanding the requested scope.'
when_to_use: "implement, build, write code, apply plan, execute, 实现, 落实, 写代码, 开始动手, 按方案做"
dispatch_intent: "Implement the authorized change and loop through check until it holds up or reaches a real boundary"
---

# Implement

Implement turns an authorized change into working code and tests. A plan is optional context, not an entry gate. Reuse one when it exists; otherwise execute a sufficiently clear request directly.

<HARD-GATE>
Implement writes only within the authorized change, adds no unapproved dependency, and never silently decides new product intent. After implementation verification passes, it invokes check automatically and owns any in-scope repair/recheck loop. It does not continue into docs, publish, or release.
</HARD-GATE>

Read `references/anti-patterns.md`, `references/durable-context.md`, and `references/change-types.md` once per session when they are not already in context.

## Outcome Contract

- Outcome: the authorized change works, its implementation verification passes, and check gives a final verdict
- Done when: check holds up, or the loop reaches an intent/scope/dependency/no-progress boundary that requires the user
- Evidence: changed paths, red→green or invariant/measurement results, verification command output, and each check verdict acted on
- Output: scope + changes + test/verification evidence + check-loop rounds + final verdict or exact boundary

## Establish the implementation context

Resolve intent with this precedence: explicit request → associated plan → current conversation. A later explicit instruction can narrow or correct an older plan; do not treat the mere existence or absence of a plan as authorization.

When a plan path is explicit or uniquely identified by the current conversation, read the whole plan. If its status is `draft`, an explicit implement invocation approves it; set `status: approved` before implementation. A plan already marked `done` is not silently replayed. If no plan is identified, continue from the clear request instead of searching for one and blocking on candidates.

Before editing, inspect in parallel where available:

- `git status --short`, current branch, recent history, and project instructions;
- the files/interfaces named by the request or plan;
- project test and verification commands;
- relevant project facts not already reliable in the session.

Use explore in context mode when project or module understanding is genuinely insufficient. This is fact gathering, not a prerequisite ceremony.

If unrelated working-tree changes are safely separable, preserve them and keep them outside this task. If they overlap the same files or make authorship/scope ambiguous, stop with the exact collision; never stash, stage, commit, discard, or overwrite them merely to proceed.

## Bound the change

State the outcome, path-level scope, acceptance, and change type before the first edit. Derive the type from `references/change-types.md` using the same precedence: explicit request → associated plan → current conversation. Ask only when different classifications would materially change the implementation or proof.

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

Use TDD for `fix` and `feat` when the project has a test framework. A new test that is already green does not prove the requested behavior is absent; correct the test before implementing. Without a framework, use the narrowest reproducible command or manual observation already appropriate to the project—do not create test infrastructure just for ceremony.

Run each focused verification as the change develops, then run the plan's overall verification when a plan provides it or the repository's relevant suite when it does not. Retry only once when a failure plausibly looks flaky. Never skip, weaken, delete, or bypass a failing check.

## Automatic check loop

Invoke check after the implementation verification passes. Invoke the existing standalone check capability with the change scope, diff, available plan, test evidence, and relevant user constraints. Check remains read-only and returns its normal verdict/findings; implement—not check—owns repairs.

For each verdict:

1. **Holds up:** finish the loop. Non-blocking observations stay in the report unless they are already required by the authorized acceptance.
2. **Needs work with in-scope blockers:** fix only blockers that are inside the authorized implementation scope, repeat the relevant implementation verification, then run check again.
3. **Intent change or scope expansion:** stop and return the decision or additional authorization needed.
4. **New dependency:** stop unless that dependency was already authorized.
5. **No progress:** when the same finding returns without new evidence, the repair reverts earlier progress, or check cannot produce an actionable distinction, stop instead of cycling.

There is no arbitrary round count: evidence determines convergence. Track findings across rounds so rewording does not disguise no progress. Never fix unrelated observations simply to make the report empty.

If a referenced plan was used, set its `status: done` only after check holds up and every plan outcome is complete. A boundary exit leaves the plan approved. Without a plan, no placeholder artifact is created.

## Engineering boundaries

- Preserve project conventions, public compatibility required by the change, and user-owned working-tree changes.
- Add or update dependencies only when explicitly authorized by the request or plan; never touch a lockfile incidentally.
- Do not use `--no-verify`, `--force`, `@ts-ignore`, `eslint-disable`, test skips, or repeated retries to manufacture success.
- Keep secrets in the project's normal configuration path; never put credentials in code, tests, logs, plans, or reports.
- Comments explain non-obvious constraints, not the edit itself or the plan/Issue history.
- Treat docs, publish, and release as separate user-invoked outcomes. Do not call them automatically.

## Stop conditions

Stop with concrete evidence when the requested behavior is not clear enough to implement, repository facts contradict an associated plan, unrelated changes overlap the scope, a test is incapable of distinguishing the behavior, verification cannot get green after one reasoned correction, or the check loop reaches any boundary above. Do not route the user backward merely because an upstream artifact is absent.

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
- round 1: <verdict/findings/action>
- ...

Final: holds up | stopped — <specific boundary>
```

Mention skipped external or manual checks accurately. Do not label them passed and do not suggest the next skill as if it already ran.
