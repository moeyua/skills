---
mode: feat
title: Make release own the default-branch version commit
created: 2026-07-22
status: done
issue: https://github.com/moeyua/skills/issues/27
---

# 让 release 完成默认分支上的版本提交与发布

## Building

把 `/release <tag>` 从“给已有 commit 打 tag”扩展为一条可恢复的版本发布事务：从干净工作树切回并 fast-forward 同步远程默认分支，用显式目标 tag 更新单一根 package 的版本，验证并推送 release commit，确认远程默认分支包含该 commit 后再创建精确 tag 与 GitHub-generated Release。

正常完成后，目标版本同时存在于默认分支的 package metadata、tag 指向的 commit 和 GitHub Release；任一阶段失败都保留已完成状态并阻止后续副作用越过失败点。

## Not building

- 不推导“下一个”版本，也不根据 commit、变更类型或历史自动选择 major/minor/patch；调用者必须给出显式、精确的目标 tag。
- 不支持多个独立版本源、独立发布包或版本策略不唯一的 monorepo；第一版只处理一个可确认的根 package。
- 不自动创建 PR、合并分支、绕过默认分支保护或 force push；默认分支 push 被拒绝时停在本地 release commit。
- 不回写已经存在的历史 tag/Release，也不试图修复 `v1.0.0`、`v2.0.0` 内既有的 `package.json@0.1.0` 漂移。
- 不部署、不回滚、不上传 artifact、不生成 changelog 或仓库内 release-note 文件，也不发布 npm package。

## Approach

采用“version mutation 与 git tag 解耦”的 release commit：先使用项目声明的 package manager 更新版本，但禁止该命令自动 commit/tag；检查实际 diff 后由 release 自己创建和推送 release commit，最后沿用现有精确 tag 与 GitHub Release 流程。

对当前 pnpm 项目，版本步骤使用 `pnpm version <version> --no-git-tag-version`。这比直接运行 `pnpm version <version>` 更适合可恢复发布：tag 不会在版本 diff、commit hook 或默认分支 push 通过前提前出现，已有 tag/release 的一致性检查仍由 release 单一负责。

## Key decisions

1. **默认分支来自 GitHub，不硬编码 `main`。** release 在任何 mutation 前解析远程默认分支；工作树干净时切换到已有本地默认分支，并只允许 fast-forward 到对应 `origin/<default>`。本地分支分叉、无法切换或无法同步时停止。
2. **显式 tag 是版本身份真源。** `<tag>` 必须给出可映射为 package version 的精确版本；release 沿用仓库既有 tag prefix，但不从当前 package version 猜增量。
3. **版本必须进入 tag 所指 commit。** package version 已等于目标且远程默认分支已包含对应 commit 时复用；否则使用项目原生、禁用自动 git tag 的 version 命令生成 metadata diff，并只提交该命令产生的预期版本文件。
4. **默认分支 push 是 release outcome 的显式副作用。** release commit 可以直接推送默认分支；branch protection、hook、认证或网络拒绝都保留本地状态并停止，不自动转为 PR。
5. **先验证远程 commit，再创建 tag。** 只有远程默认分支可达目标 release commit 后才允许创建/push annotated tag；只有远程 peeled tag 指向该 commit 后才创建 GitHub Release。
6. **重跑按 canonical state 补缺失动作。** 已推送 release commit、已推送 tag、已存在 Release 分别作为恢复点；不重复 bump、commit、push、tag 或 Release。
7. **push 前核验实际 committed tree。** fresh、local-ahead recovery 与 remote reuse 共用 single-parent、exact subject、target version、resolved paths 与 semantic version-only diff 谓词；fresh commit 在 hook 执行后重新核验且要求 index/worktree clean，避免把仅核验 staged diff 当作实际提交证据。

## Architecture

### Current

```text
existing remote-default commit
          │
          ▼
   annotated tag ──▶ GitHub Release

package version 不在 release outcome 内
```

### Target

```text
explicit tag
     │
     ▼
resolve/switch/ff-only default branch
     │
     ▼
package-manager version mutation (no git tag)
     │
     ▼
verify diff ──▶ release commit ──▶ push default branch
                                      │ remote target verified
                                      ▼
                               annotated tag ──▶ push exact tag
                                                        │ peeled target verified
                                                        ▼
                                                 GitHub Release
```

`release` 仍是唯一拥有 release commit、tag 与 GitHub Release 副作用的能力；`publish` 的 feature-branch commit/push/PR outcome 不改变，也不会被 release 隐式调用。

## Interface boundary

- **Actor / entry:** 用户在 GitHub-backed、单一根 package、工作树干净的仓库调用 `/release <exact-tag>`。
- **Valid input:** 显式 tag 可无歧义映射为目标 package version，仓库存在一个权威根 package version 和一个已声明或已建立的 package-manager version 命令。
- **Success:** 本地与远程默认分支包含同一个 release commit；package metadata 等于目标版本；local/remote tag 指向该 commit；一个正常或显式 prerelease 的 GitHub Release 存在。
- **Recoverable output:** 报告默认分支、目标版本、release commit、branch push、tag 和 Release 的逐阶段状态；重跑只补缺失阶段。
- **Failure:** dirty tree、版本/命令不唯一、默认分支不能 fast-forward、版本 diff 越界、commit/push/tag/Release 失败时在下一副作用前停止，并准确保留与报告已有状态。
- **Internal:** 具体 package manager 探测、version 字符串去 prefix、精确 staging 路径和 canonical-state 查询属于实现细节，但不得扩大上述支持面。

## Public surface changes

- `release` 的 outcome 从“existing commit → tag + GitHub Release”变为“remote default branch → package version release commit → tag + GitHub Release”。
- `/release` 新增默认分支切换/fast-forward、package metadata 修改、release commit 和默认分支 push 副作用。
- `release` 不再能仅从当前 version source 当作目标版本；没有显式精确 tag 时必须在 mutation 前询问。
- 结果报告新增 default branch、package version、release commit 与 branch push 状态，保留 tag/Release/notes 状态。

## Spec delta

### `specs/release/spec.md`

**MODIFIED Requirements**

- `从显式输入或权威版本源确定 tag`：改为从显式精确 tag 确定目标 package version 与 tag prefix；不得猜 next version，且无法映射时在 mutation 前停止。
- `发布目标必须可核验`：目标改为从 GitHub 解析并切换、fast-forward 的远程默认分支 release commit；dirty、分叉或同步失败时停止。
- `创建并精确推送 tag`：只有 release commit 已推送且可从远程默认分支到达后才能创建/push exact tag。
- `部分 side effect 准确保留和报告`：把 version diff、local release commit、default-branch push、tag push 与 Release 创建纳入有序恢复点，失败不得伪原子回滚或越级继续。

**ADDED Requirements**

- `发布前生成并推送版本提交`：单一根 package 必须用项目原生的 non-tagging version 命令更新到显式目标版本；验证 diff、commit，并在 hook 后从 committed tree 复核统一 release-commit predicate，随后直接 push 默认分支，才能打 tag。
- `版本准备只接受单一权威 package`：缺少根 package、存在多套独立版本、version 命令不明确或版本 diff 包含无关路径时必须停止，不得猜策略或顺手提交。
- `既有发布状态幂等恢复`：package 已为目标版本、release commit/tag/Release 已存在时逐项核验并复用；历史 tag 内版本不一致只报告，不回写历史。
- `通用发布仍排除部署与制品`：release 不部署、不回滚、不上传 artifact、不生成 changelog/release-note 文件，也不发布 registry package。

**REMOVED Requirements**

- `不修改版本也不承担项目发布流程`

## Acceptance scenarios

### Scenario: 从 feature branch 发布显式版本

- **Given** 工作树干净、当前在普通 feature branch、本地默认分支可 fast-forward、根 package 当前版本不是目标版本
- **When** 用户调用 `/release v3.0.0`
- **Then** release 切换并同步默认分支，以 non-tagging version 命令写入 `3.0.0`，创建并推送 release commit，随后让 `v3.0.0` tag 与 GitHub Release 精确指向该 commit

### Scenario: dirty 或默认分支分叉

- **Given** 工作树有改动，或本地默认分支与远程历史分叉
- **When** release 做 preflight
- **Then** 它在切换、版本修改、commit、push、tag 和 Release 前停止，并报告具体阻塞状态

### Scenario: 目标版本或 package 策略不唯一

- **Given** 用户没有提供精确 tag，或仓库存在多个独立 package version / 无明确 non-tagging version 命令
- **When** release 解析身份与版本动作
- **Then** 它在 mutation 前停止，不推导 next version、不任选 package，也不退回只打 tag

### Scenario: 默认分支 push 被保护规则拒绝

- **Given** version diff 与 local release commit 已成功，但远程拒绝直接 push 默认分支
- **When** release 尝试发布 branch commit
- **Then** 它保留并报告 local commit，不创建 tag、不创建 PR、也不创建 GitHub Release

### Scenario: 从已推送 release commit 恢复

- **Given** package version 与 release commit 已在远程默认分支，但 tag 或 GitHub Release 尚缺失
- **When** 用户以同一 tag 重跑 release
- **Then** 它不重复 bump/commit/push，只核验并补齐缺失的 tag 或 Release

### Scenario: 从 branch push 失败留下的本地 commit 恢复

- **Given** 本地默认分支只领先 fetched remote tip 一个 commit，且该 commit 的 parent、`chore(release): <tag>` subject、目标 package version 与 version-only diff 全部匹配
- **When** 用户以同一 tag 重跑 release
- **Then** 它复用该 local release commit 并只重试 default-branch push；任一核验不匹配或存在其他 ahead/diverged history 时停止

### Scenario: 从 commit 失败留下的 version diff 恢复

- **Given** 当前就在 default branch、HEAD 等于 fetched remote tip，且 index/worktree 无 conflict/untracked path，并只把已解析的权威 version metadata 改为目标版本
- **When** 用户以同一 tag 重跑 release
- **Then** 它不重复 version command，从完整 diff/staged diff 验证继续创建 release commit；任何额外 path/field、版本不匹配或 remote movement 都按普通 dirty state 停止

### Scenario: commit hook 改变实际提交

- **Given** staged version diff 已通过，但 commit hook 改写了 subject、在同一 metadata 文件加入无关字段，或在 post-commit 留下 dirty state
- **When** release 在 default-branch push 前核验实际 `HEAD`
- **Then** 它保留并报告本地 commit/status，在 push、tag 与 Release 前停止；不得因 changed path 看似正确而接受，也不得自动 amend/discard

### Scenario: 既有 Release 或历史版本漂移

- **Given** tag 与 GitHub Release 已存在，或历史 tag 中的 package version 与 tag 不一致
- **When** 用户再次请求相同 tag
- **Then** release 返回 canonical 既有状态并报告不一致，不移动 tag、不回写历史版本、不制造新 release commit

## Implementation steps

1. 用契约测试锁定新的 release interface，并取得旧行为的 red 证据。
   - outcome: 测试要求显式目标版本、默认分支切换/fast-forward、non-tagging version bump、release commit 先于 tag、分阶段恢复与仍然排除部署；旧 `Never edit a version file` 契约使目标测试失败。
   - scope: `tests/release.test.ts`
   - verify: `pnpm exec vp test run tests/release.test.ts` 在 skill 改写前失败，失败只指向本计划新增契约。
2. 重塑 release skill，使版本提交、branch push、tag 和 GitHub Release 成为一个有序且幂等的 outcome。
   - outcome: frontmatter、hard gate、preflight、version preparation、state reconciliation、side-effect sequence 与报告共同表达完整接口；旧 tag-only 和 no-version 文本不再与新行为冲突。
   - scope: `skills/release/SKILL.md`
   - verify: `pnpm exec vp test run tests/release.test.ts` 通过，且 `rg -n "Never edit a version file|no version change|不修改版本" skills/release/SKILL.md` 无活动契约命中。
3. 从已经落地并验证的 release 行为同步持久契约与公共入口。
   - outcome: release spec 合并本计划 Spec delta；PRODUCT 收窄“项目专属发布管理”边界；ARCHITECTURE 记录 release commit 数据流与副作用恢复点；RESOLVER 与双语 README 准确展示新的 release outcome。
   - scope: `specs/release/spec.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `skills/RESOLVER.md`, `README.md`, `README.zh-CN.md`
   - verify: `pnpm exec vp test run tests/release.test.ts tests/project-identity.test.ts tests/smoke/verify-skills.test.ts && node skills/doctor/scripts/checker.ts . --json`
4. 对完整 release 变更运行项目门禁与只读 check，修复授权范围内 blocker。
   - outcome: formatting/type/lint、完整测试、Markdown 链接与人工 acceptance review 均覆盖 skill、spec、durable docs 和入口投影；计划仅在最终 check holds up 后标记 done。
   - scope: 本计划列出的全部路径
   - verify: `pnpm check && pnpm test && pnpm lint && node skills/doctor/scripts/checker.ts . --json && git diff --check`

## Verification

- command: `pnpm exec vp test run tests/release.test.ts`
- command: `pnpm check`
- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [x] `/release vX.Y.Z` 的 mutation 只发生在 clean、同步后的默认分支，或严格核验的 version-diff/local-commit 恢复状态中。
  - [x] version metadata 与 tag 指向同一个已推送 release commit，不存在 tag 先于 branch push 的路径。
  - [x] dirty、分叉、多版本源、版本 diff 越界和 branch push 拒绝都在下一副作用前停止。
  - [x] 重跑可以从 release commit、tag 或 Release 任一已完成状态继续，且不重复 canonical 对象。
  - [x] branch push 失败后的单个 local release commit 只有在 parent/message/version/semantic diff 全匹配时可恢复，其他 ahead/diverged history 停止。
  - [x] commit 失败后的 version diff 只有在 default HEAD、remote tip、paths、fields 与目标版本全部匹配时可恢复，其他 dirty state 停止。
  - [x] fresh commit 在 push 前核验实际 committed tree 与 post-hook clean state；local/remote reuse 使用同一 semantic version-only predicate。
  - [x] deployment、rollback、artifact、changelog、registry publish 和自动 PR 仍明确排除。

## Assumptions & risks

- **单一 package 是第一版边界。** 当前仓库只有根 `package.json` 且声明 `pnpm@11.5.1`；通用 skill 面对 workspace/monorepo 时必须识别歧义并停止，而不是把当前仓库约定冒充通用策略。
- **直接 push 默认分支可能被拒绝。** 这是预期失败路径，不是让 release 绕过保护或偷偷创建 PR 的理由；本地 release commit 是可恢复状态。
- **version command 可能改多个 metadata 文件。** release 必须根据项目既有 package-manager 行为检查具体 diff，只允许权威 version metadata；不能用宽泛 staging 吞入其他工作。
- **历史漂移不可修复。** `v1.0.0`、`v2.0.0` 已经发布且都含 `package.json@0.1.0`；新的契约只保证未来 release，自身不能重写不可变 tag。
