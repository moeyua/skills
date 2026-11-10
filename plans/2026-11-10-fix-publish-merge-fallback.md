---
mode: fix
title: Publish 合并优先 rebase，无法 rebase 时改用 squash
created: 2026-11-10
status: done
issue: https://github.com/moeyua/skills/issues/69
---

# Publish 合并优先 rebase，无法 rebase 时改用 squash

## Building

用户明确要求合并 PR 时，Publish 优先使用 rebase；GitHub 判定该 PR 无法 rebase（例如分支通过 merge main 解决过冲突，逐提交重放会再次冲突）或仓库不允许 rebase 时，在其余合并条件均满足且仓库允许 squash 的前提下，自动改用绑定已检查 head 的 squash 合并，不再停下来询问用户，也不重建 PR、不重跑 CI。

## Not building

- 不由 Publish 更新、rebase 或重写 PR 分支（包括 GitHub update-branch），不 force-push，不自动解决冲突或修改代码。
- 不使用 merge commit、`--admin`、`--auto`、merge queue 或删除分支；不修改仓库合并设置或分支保护。
- PR 与 base 存在真实冲突（GitHub 报告不可合并）时仍报告阻塞，squash 不作为绕过手段。
- 不改动 Release 的版本、检查或 CI 相关规则；只同步各处对 Publish 合并方式的描述。
- 不迁移其他项目的 `RELEASE.md`。

## Root cause

[pull-request.md:40-46](../skills/engineering/publish/references/pull-request.md) 把 `gh pr merge --rebase` 定为唯一合并方式并明确禁止 squash，而 [git-state.md:17](../skills/engineering/publish/references/git-state.md) 又禁止 force-push；当分支含 merge main 的提交、GitHub 逐提交重放冲突（`canBeRebased: false`）时，Publish 既不能换合并方式，也无法自行恢复可 rebase 状态，于是 CI 已通过的 PR 只能停下来询问改 squash，或被重建 PR 并重复跑 CI。同一规则还被复制到 Publish 入口、spec、Resolver、README、ARCHITECTURE、PRODUCT、Release 的项目规则与首次接入引用（`project-policy.md`、`onboarding.md`）和本仓库 `RELEASE.md`。

## Key decisions

- 用户已决定：优先 rebase，rebase 不可行时自动 squash（无需再次确认）。
- 合并授权本身覆盖两种方式；squash 不是新的授权范围，也不改变“只有用户明确要求才合并”的规则。
- 方式选择发生在合并前刷新条件时：读取仓库的 `rebaseMergeAllowed` / `squashMergeAllowed`，以及 PR 的 GraphQL `canBeRebased`、`mergeable`、`mergeStateStatus`。`mergeable` 为 `UNKNOWN` 时按既有有界等待重新读取，仍未知则报告，不猜测。
- rebase 调用因 rebase 本身不可用（GitHub 报告无法 rebase，或仓库不允许 rebase）被明确拒绝，且 PR 仍处于未合并、head 不变的原始状态时，允许在同一请求中改用一次 squash。因评审、检查、分支保护等其他未满足条件被拒绝时照常报告阻塞，不改用 squash；rebase 结果模糊时只按 recovery 读取一次，也不改用 squash。
- squash 提交的标题与正文沿用 GitHub 仓库默认设置，不由 Publish 另写。
- 报告必须写明实际使用的合并方式及改用 squash 的原因。

## Implementation steps

1. 先写回归测试
   - outcome: 测试要求 pull-request.md 恰有一条 `--rebase` 与一条 `--squash` 的 `gh pr merge` 命令，均带 `--match-head-commit`，均不含 `--admin|--auto|--delete-branch|--merge`；要求文中写明 squash 仅在无法 rebase 或仓库不允许 rebase 时使用、真实冲突仍报告；spec 含新的合并 Requirement 标题。改动前这些断言失败。
   - scope: `tests/publish.test.ts`
   - verify: `pnpm exec vp test run tests/publish.test.ts` 新断言在改规则前失败

2. 改写 Publish 的合并契约
   - outcome: 入口描述与正文、`pull-request.md` 的 “Merge when requested” 段、`recovery.md` 的合并恢复规则均表达“优先 rebase、无法 rebase 时 squash”，包括方式选择依据、单次改用条件、模糊结果不改用、报告实际方式；`git-state.md` 的 force-push 禁令保持不变。
   - scope: `skills/engineering/publish/SKILL.md`, `skills/engineering/publish/references/pull-request.md`, `skills/engineering/publish/references/recovery.md`
   - verify: `pnpm exec vp test run tests/publish.test.ts` 通过

3. 更新 spec
   - outcome: 按下方 Spec delta 修改 publish spec；release spec 中“PR 检查和 rebase 约定”改为与新合并方式一致的描述。
   - scope: `specs/publish/spec.md`, `specs/release/spec.md`
   - verify: `pnpm test` 通过

4. 同步描述 Publish 合并方式的文档
   - outcome: 所有把 Publish 写成“仅 rebase 合并”的地方改为“优先 rebase，无法 rebase 时 squash”，不扩写其他内容。
   - scope: `skills/RESOLVER.md`, `skills/engineering/README.md`, `README.md`, `README.zh-CN.md`, `ARCHITECTURE.md`, `PRODUCT.md`, `skills/engineering/release/references/project-policy.md`, `skills/engineering/release/references/onboarding.md`, `RELEASE.md`
   - verify: `rg -n -i "rebase" skills specs README.md README.zh-CN.md ARCHITECTURE.md PRODUCT.md RELEASE.md` 中不再有把 rebase 写成唯一合并方式的表述

5. 整体检查
   - outcome: 格式、lint、类型与全部测试通过。
   - scope: 全仓库
   - verify: `pnpm exec vp check && pnpm test`

## Regression tests

- `tests/publish.test.ts` — 将现有用例 “offers a rebase merge command tied to the inspected PR head” 改为 “prefers rebase and falls back to squash only when rebase is unavailable”（改写现有覆盖）：
  - 条件：读取 `pull-request.md` 中所有缩进的 `gh pr merge` 命令行。
  - 期望：恰好两条，一条含 `--rebase`、一条含 `--squash`，都含 `--match-head-commit`，都不含 `--admin`、`--auto`、`--delete-branch`、`--merge`；正文包含 squash 的适用条件（无法 rebase 或仓库不允许 rebase）以及真实冲突仍报告的规则；spec 包含新的合并 Requirement 标题且不再包含 “显式授权的 rebase 合并”。
  - 当前规则下该用例失败（只有一条 rebase 命令且禁止 squash），修复后通过。
- 新增断言（同文件）：`recovery.md` 规定 rebase 结果模糊时不改用 squash；`pull-request.md` 规定只有 rebase 不可用类的拒绝才可改用 squash，评审、检查、分支保护等其他未满足条件导致的拒绝照常报告阻塞。

## Spec delta

- MODIFIED `publish` / Requirement: 显式授权的 rebase 合并 → 重命名为 “显式授权的合并：优先 rebase，必要时 squash”。只有用户明确要求合并时才刷新 head/base/检查/评审/draft/可合并性；条件满足且仓库允许 rebase、PR 可 rebase 时使用绑定已检查 head 的 rebase 合并；仓库不允许 rebase 或 GitHub 判定 PR 无法 rebase 时，在仓库允许 squash 的前提下使用绑定同一 head 的 squash 合并，无需再次确认。rebase 因不可 rebase 或仓库不允许 rebase 被明确拒绝且 PR 保持原状时可改用一次 squash；其他原因的拒绝或结果模糊时不改用。不使用 merge commit、管理员绕过、自动合并或不兼容的 merge queue，不自动解决冲突、不更新或重写分支、不删除分支。报告实际合并方式与原因；queued/open/unknown 不得报告为 merged。
- MODIFIED `publish` / Purpose — “在用户明确要求时执行 rebase 合并”改为“在用户明确要求时合并（优先 rebase，无法 rebase 时 squash）”。
- MODIFIED `publish` / Requirement: 保护本地和远程历史 — “用户明确授权且满足当前条件的 GitHub rebase 合并”改为“GitHub rebase 或 squash 合并”。
- MODIFIED `release` / Requirement: 项目规则与首次接入 — “PR 检查和 rebase 约定”改为 “PR 检查和合并方式约定（优先 rebase，无法 rebase 时 squash）”。

## Verification

- command: `pnpm exec vp check && pnpm test`
- checklist (manual):
  - [ ] 在一个含 merge main 提交、`canBeRebased` 为 false 且 CI 通过的 PR 上要求合并，Publish 直接以 squash 合并并报告原因，不询问、不重建 PR、不重跑 CI
  - [ ] 在可 rebase 的 PR 上要求合并，仍使用 rebase
  - [ ] PR 与 base 有真实冲突时，Publish 报告阻塞，不尝试 squash

## Assurance

- Evidence and limitations: 改写后的 `tests/publish.test.ts` 用例 “prefers rebase and falls back to squash only when rebase is unavailable” 在改规则前失败、改后通过；`pnpm exec vp check` 与 `pnpm test`（17 个文件、184 项）全部通过；同步检查确认 skills、specs、README、ARCHITECTURE、PRODUCT、RELEASE 中不再把 rebase 写成唯一合并方式。手工清单（在真实无法 rebase 的 PR 上合并）未执行，需在下次实际合并时观察。
- Verify: not run
