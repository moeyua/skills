---
mode: fix
title: Allow implement to carry the current uncommitted plan
created: 2026-07-10
status: done
---

# Allow implement to carry the current uncommitted plan

## Building

Adjust implement's dirty-working-tree preflight so the exact plan selected for the current run may be newly created or modified without being committed, while every unrelated working-tree change—including another plan—continues to stop execution.

## Not building

- No relaxation for files other than the selected plan.
- No directory-wide exception for `plans/`.
- No automatic commit, stage, stash, discard, or other Git-history/index mutation.
- No change to plan discovery, plan approval, branch naming, commit, or PR behavior.
- No executable checker that merely asserts the presence of particular prose.

## Approach

1. **Recommended — exempt the exact selected plan path**: resolve the current plan first, then allow only that path to be newly added or modified. This is the narrowest exception and preserves the existing safety boundary for every unrelated change.
2. **Infer task ownership from a plan slug or branch name**: this could identify a likely current plan without an explicit path, but duplicates plan-selection logic and can select the wrong file when names collide or a run resumes.
3. **Automatically commit or stash the plan before preflight**: this restores a literally clean tree, but mutates Git state without authorization and breaks the separation between shape, implement, and commit.

## Premise collapse

This plan assumes implement has uniquely selected the current plan before evaluating working-tree dirtiness. If no plan can be uniquely selected, the exception must not apply and implement must keep its existing stop-and-request-a-plan behavior.

## Key decisions

1. Only the exact selected plan path is exempt; another plan remains unrelated work and blocks execution.
2. Added or modified states are allowed for the selected plan whether staged or unstaged, while deleted, renamed, or conflicted states still block because the plan is no longer a stable execution source.
3. Implement carries the selected plan onto the working branch without committing, staging, or stashing it; its `draft → approved → done` edits remain part of the current task's working tree.
4. Regression coverage is a paired manual integration matrix plus the repository test suite, because implement behavior is agent-followed prose rather than executable runtime logic.

## Architecture

None — this is a behavior correction within the existing implement skill and its persistent contract; it introduces no module boundary, layer, service, dependency, or data-flow change.

## Public surface changes

The implement preflight changes from “any dirty working tree stops execution” to “the selected plan may be added or modified; every other dirty entry still stops execution.” Branch setup explicitly carries that plan without performing an implicit Git cleanup operation.

## Spec delta

## ADDED Requirements

### Requirement: 仅豁免本次方案的未提交状态

implement 在工作树预检前必须先确定本次执行的 plan，并允许该 plan 处于新增或修改状态；除该精确路径外的任何未提交改动（包括其他 plan）必须继续阻止执行。选中 plan 被删除、重命名或处于冲突状态时也必须停止。implement 不得为满足预检而自动提交、暂存、stash 或丢弃改动。

#### Scenario: 本次 plan 尚未提交

- GIVEN implement 已唯一选中本次 plan，且工作树仅包含该 plan 的新增或修改
- WHEN implement 执行工作树预检
- THEN 预检继续，并在需要时创建或沿用工作分支且携带该 plan

#### Scenario: 工作树包含其他任务的 plan

- GIVEN implement 已唯一选中本次 plan，且工作树还包含另一个未提交 plan
- WHEN implement 执行工作树预检
- THEN implement 停止并把处置决定交还用户

## Implementation steps

1. Record the narrow dirty-tree exception as implement's persistent behavior contract.
   - outcome: the spec distinguishes the selected plan from every unrelated dirty entry, covers unsafe selected-plan states, and prohibits implicit Git cleanup operations.
   - scope: `specs/implement/spec.md`
   - verify: manually compare the added requirement and scenarios against every item in `## Key decisions`, then run `pnpm exec vp test run --filter=verify-skills`.
2. Align implement's preflight and branch setup with the selected-plan exception.
   - outcome: implement resolves the current plan before applying the dirty-tree gate, continues only when all dirtiness is an allowed state of that exact plan, and carries it onto the working branch without staging, committing, or stashing.
   - scope: `skills/implement/SKILL.md`
   - verify: walk the regression matrix in `## Regression tests` against the revised preflight and branch instructions and confirm each row has one unambiguous outcome.
3. Verify the behavior contract and repository invariants together.
   - outcome: the skill and spec agree on allowed and blocking states, and all repository checks remain green.
   - scope: `skills/implement/SKILL.md`, `specs/implement/spec.md`, repository test suite
   - verify: `pnpm test`.

## Verification

- command: `pnpm test`
- checklist (manual):
  - [ ] An untracked, staged-added, staged-modified, or unstaged-modified selected plan does not block implement when it is the only dirty path.
  - [ ] Any dirty non-plan file blocks implement.
  - [ ] Any dirty plan other than the selected plan blocks implement.
  - [ ] A deleted, renamed, or conflicted selected plan blocks implement.
  - [ ] Continuing from a protected branch creates the normal plan-derived working branch and carries the selected plan without an implicit commit, stage, or stash.
  - [ ] Failure to uniquely select a plan applies no exception.

## Rollback

Revert the implement skill and implement spec changes together. No external state or migration is involved; the prior unconditional clean-tree gate is restored immediately.

## Risks & Unknowns

- **Over-broad interpretation of “current plan”**: an agent might treat every file under `plans/` as task-owned. Mitigation: define identity as the exact path selected during preflight and include the opposite-plan regression scenario.
- **Unsafe plan state slips through**: a deleted, renamed, or conflicted plan is not a trustworthy execution source. Mitigation: allow only added or modified states and enumerate the blocking states explicitly.
- **Instruction/spec drift**: prose behavior has no runtime implementation to exercise mechanically. Mitigation: update the skill and persistent spec atomically, use paired manual scenarios, and run the repository's structural test suite.

## Root cause

The root cause is the unconditional `Clean working tree` preflight at `skills/implement/SKILL.md:39` rejecting the selected plan whenever shape has just created or modified it, because the guard treats task-owned plan state and unrelated unsaved work as the same kind of dirtiness.

## Regression tests

This behavior is implemented by agent-followed instructions rather than runtime code, so regression coverage is manual integration backed by the persistent spec:

- **Current-plan-only pass case (new)**: select `plans/current.md`, expose only `?? plans/current.md` (and repeat for staged/unstaged modification), invoke implement, and verify it proceeds to branch setup.
- **Other-plan stop case (new)**: select `plans/current.md`, also expose an uncommitted `plans/other.md`, invoke implement, and verify it stops before branch setup or implementation.
- **Unsafe selected-plan stop case (new)**: select `plans/current.md` while it is deleted, renamed, or conflicted, and verify implement stops because the source plan is unstable.
- **Repository regression suite (existing)**: run `pnpm test` to ensure the revised skill/spec pair preserves all structural and consistency invariants.
