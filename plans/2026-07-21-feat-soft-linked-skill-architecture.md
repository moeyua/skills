---
mode: feat
title: Rebuild Squire as a soft-linked skill graph
created: 2026-07-21
status: done
---

# 将 Squire 重构为软连接的 skill 能力图

## Building

把 Squire 从“固定 core loop + workflow-managed stages”重构为一组可独立调用、按现有上下文协作的能力。常见路径变为 `shape ···> plan ···> implement ⇄ check ···> docs ···> publish ···> release`，其中虚线只表示上下文传递与常见衔接，不构成前置门禁；唯一自动闭环是一次 implement 任务内部的 `implement → check → implement`，直到没有实现范围内的阻塞问题。

本次形成 11 个 user-facing skill：`explore`、`shape`、`plan`、`implement`、`check`、`docs`、`publish`、`release`、`converge`、`doctor`、`handoff`。`issue` 合入 `plan`，`commit` 与 `pr` 合入 `publish`；`fix` / `feat` / `refactor` / `perf` 成为跨 skill 共享的变更类型。

## Not building

- 全局 `workflow` 编排器，或从 shape 自动一路执行到 release 的流水线。
- “必须先运行某个 skill / 必须存在某份上游产物”一类跨 skill 硬依赖。
- GitHub Projects、Issue 状态管理、拆票、负责人、milestone、sub-issue 或通用任务管理。
- 部署、上线检查、环境迁移、回滚、构建产物上传、项目特有 version bump 或仓库内 changelog / release-note 文件。
- 把现有 domain spec 布局压成单一根 `SPEC.md`；`specs/<domain>/spec.md` 继续作为行为契约布局。
- 改写 `explore`、`check`、`converge`、`doctor`、`handoff` 的核心能力；只做新拓扑和文档目录所必需的引用对齐。
- 为删除的 `/issue`、`/commit`、`/pr` 保留 alias；新架构直接以 `/plan`、`/publish`、`/release` 为公共入口。

## Approach

采用“独立能力 + 软连接”而不是全局 orchestrator 或硬阶段状态机。用户决定调用哪个 skill；每个 skill 复用当前对话、已有 plan、Issue、工作树或 GitHub 状态，但不因某个上游节点没有运行而拒绝工作。skill 可以在自身 outcome 内组合其他能力，例如 shape 按需取 explore 上下文、implement 调用 check 形成修复闭环，但这不等于自动推进整条开发流程。

该方向保留了用户对宏观动作的控制，同时允许一个已授权任务在内部完成必要闭环。它也把“思考”和“持久产出”分开：shape 是纯对话塑形，plan 才创建本地方案并尽力建立 GitHub 追踪。

## Key decisions

1. **边表示上下文，不表示门禁。** 任一 skill 都能由用户直接调用；有上游产物就复用，没有则依据当前请求完成自身 outcome。真正缺少完成当前动作所需的事实或意图时，才解决具体缺口，不能把“没跑过上一步”本身当成错误。
2. **shape 只塑形。** shape 继续负责 grounding、material frontier、推荐与设计收敛，按需使用 explore，但不再写 plan、Issue、spec 或实现文件。
3. **plan 统一本地方案与远程追踪。** `/plan` 始终写 `plans/YYYY-MM-DD-<slug>.md`；GitHub 可用时尽力创建一个同变更类型、同范围的 Issue，并把 canonical URL 写进 plan。Issue 失败不使 plan 失败，也不阻塞 implement、docs 或 publish。
4. **Issue 关联是增强而非有效性门槛。** 一个 plan 最多关联一个 Issue；URL 存在时后续只能复用该 Issue，不按标题猜测或重复创建。没有 Issue 的 plan 仍然有效，publish 也能正常完成。
5. **变更类型属于 change，不属于单个 skill。** `fix` / `feat` / `refactor` / `perf` 由共享规则定义；shape 用它选择思考重点，plan 用它选择 plan 结构与 Issue label，implement 用它决定 TDD、行为保持或测量策略。
6. **implement 持有唯一自动闭环。** implement 可以使用 plan，也能直接执行足够明确的请求；完成改动后自动调用现有 check。check 保持独立、只读和可单独调用；若 findings 属于当前实现范围，implement 修复并再次 check。意图变化、范围扩大、未授权依赖或无法取得进展时退出循环并报告，而不是无限重试。
7. **docs 维护六类记忆。** 默认目录只含 spec、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README；WORKFLOW 从 memory catalog、format、项目根文档和相关检查中移除。docs 可以依据用户或 shape 已确定的产品决策写 PRODUCT，但仍不替用户做产品判断。
8. **publish 是一次完整交付动作。** `/publish` 吸收 commit 的安全分组与 message 规则，以及 pr 的 push、分支历史综合和 PR 创建规则；已完成的子动作按当前 git/GitHub 状态跳过。plan、Issue、check 结果都可作为上下文，但都不是 publish 的前置门禁；Issue URL 存在时 PR 使用 closing reference，不存在时照常发布。
9. **release 只提供通用 GitHub 发布。** `/release` 围绕一个显式输入或权威版本源解析出的 tag 创建/推送 tag，并发布以该 tag 为载体的 GitHub Release notes；不修改项目版本、不部署、不回滚。GitHub Release notes 使用 GitHub 的生成能力，项目特有发布步骤留在项目自身工具之外。
10. **其他 skill 保持正交。** converge、doctor、handoff 继续按需使用；只更新它们对 memory catalog、旧 skill 名和下一步关系的陈旧引用。

## Architecture

### Current

当前产品把 `shape → implement → check → docs` 定义为 core loop，把 `commit → pr` 定义为由 WORKFLOW 管理的交付段；shape 同时承担对话塑形和 plan 文件产出，issue 是流程外 create-only 入口，implement 必须依赖 approved plan，技能间原则上不得自动调用。

### Target

```text
                              ┌───────────┐
                              │  explore  │
                              └─────┬─────┘
                                    · optional facts
                                    ▼
┌─────────┐     soft context     ┌─────────┐     soft context
│  shape  │ · · · · · · · · · ▶ │  plan   │ · · · · · · · · · ┐
└─────────┘                       └────┬────┘                     ·
                                     │                           ▼
                              ┌──────┴──────┐              ┌───────────┐
                              │ local plan │              │ implement │◀──┐
                              │ Issue?     │              └─────┬─────┘   │
                              └─────────────┘                    │         │
                                                               ▼         │ fixes
                                                         ┌───────────┐   │
                                                         │   check   │───┘
                                                         └─────┬─────┘
                                                               ·
                                                               ▼
                  ┌────────┐  ·  ┌─────────┐  ·  ┌─────────┐
                  │  docs  │ · ▶ │ publish │ · ▶ │ release │
                  └────────┘     └─────────┘     └─────────┘

     explore / shape / plan / implement / check / docs / publish / release
     均可独立由用户进入；虚线不是必须顺序。

     converge / doctor / handoff 保持在图外，按需正交使用。
```

### Component responsibilities and data flow

- `shape` 输出会话内的 grounded direction；它可以读取 explore 证据，但没有持久副作用。
- `plan` 从当前请求、既有 shape 结论或其他可靠上下文生成 plan；Issue 是同一变更的 GitHub 投影，不是第二套意图真源。
- plan 中的可选 Issue URL 是 plan 与 publish 之间唯一显式追踪数据；没有 URL 时不构成异常状态。
- `implement` 读取可用的 plan 或当前请求，写代码与测试；check 返回只读 verdict，implement 决定是否在既定范围内继续修复。
- `docs` 从已经确立的事实与决策更新六类持久记忆，不再存储项目工作流。
- `publish` 从当前 git/GitHub 状态完成尚未完成的 commit、push、PR 子动作，并在存在 Issue URL 时把它带入 PR。
- `release` 从 tag 与仓库历史创建 GitHub Release；它不要求工作一定经过 publish。

### Migration

在一个分支中原子迁移公共表面：先建立共享 change-type 真源和新增 skill/spec，再把 shape、implement、docs 与 bench 调整到新职责，随后以 publish/release 替换旧交付能力，最后删除 issue/commit/pr 与 WORKFLOW 及所有陈旧引用。历史 `plans/` 保持原样；它们是当时契约的快照，不批量改写。

## Interface boundary

- **Public skills:** `/explore`、`/shape`、`/plan`、`/implement`、`/check`、`/docs`、`/publish`、`/release`、`/converge`、`/doctor`、`/handoff`。
- **Removed skills:** `/issue`、`/commit`、`/pr`；不保留 alias。
- **Shared change types:** `fix`、`feat`、`refactor`、`perf`；`brainstorm` 只描述 shape 的会话用途，不再与四种 change type 并列为持久 plan mode。
- **Plan output:** 一个本地 plan；GitHub 可用且 Issue 创建成功时，额外产生一个 labeled Issue 与 plan 内 canonical URL。GitHub 失败必须作为降级结果报告，不能反算本地 plan 失败。
- **Implement output:** 代码/测试改动以及最终 check verdict；plan 存在时复用，不存在时也允许从明确请求执行。
- **Check output:** 保持现有 verdict/finding/observation 接口和只读边界；独立 `/check` 不自动改代码。
- **Docs targets:** `specs/<domain>/spec.md`、`PRODUCT.md`、`ARCHITECTURE.md`、`DESIGN.md`、`ROADMAP.md`、`README*`；无 `WORKFLOW.md`。
- **Publish output:** 干净 commit、已推送分支、GitHub PR URL；任何子状态已经满足时不得重复制造 commit、push 或 PR。Issue 关联存在则进入 PR，不存在则省略。
- **Release output:** tag 与对应 GitHub Release URL/notes；不包含部署、版本文件修改或仓库内 release-note 文件。
- **External side effects:** plan 的 Issue、publish 的 git/GitHub 写入、release 的 tag/GitHub Release。每个 side effect 仅属于用户所调用 skill 的公开 outcome，失败要报告实际完成到哪一步，不回滚或伪装成原子成功。

## Public surface changes

- 常见路径从硬编码 core loop 改为软连接能力图，并新增显式 `plan` 节点。
- `/shape` 从“对话或 plan 文件”收窄为纯对话塑形。
- `/plan` 成为 plan 文件与可选 GitHub Issue 的统一产出入口。
- `/implement` 不再要求 approved plan，并自动完成 check 修复闭环。
- `/docs` 删除 WORKFLOW 目标并获得基于既定决策写 PRODUCT 的职责。
- `/publish` 取代 `/commit` 与 `/pr`。
- `/release` 成为 tag + GitHub Release notes 的通用发布入口。
- README、RESOLVER、PRODUCT、ARCHITECTURE 与安装命令展示的 skill 集合仍为 11 个，但成员和关系变化。

## Spec delta

### `specs/shape/spec.md`

**MODIFIED**

- `shape 只塑形不实施` → shape 只输出会话内 grounded direction，不写 plan、Issue、spec 或实现。
- `按收敛状态自适应塑形` → 保留 outcome-first/material-frontier 行为，但移除“named mode 写 plan”的终点。
- `brainstorm mode 不写方案文件` → shape 的所有调用都保持会话式；brainstorm 是用途而非与 change type 并列的持久 mode。
- `named mode 保持专属质量门槛` → 四种 change type 作为共享语义影响证据重点，但 plan 产出门槛迁入 plan spec。

**REMOVED**

- `named mode 产出可执行方案文件`
- `跨结构变更产出 Architecture 段`

### `specs/plan/spec.md`

**ADDED**

- `plan 始终产出本地方案`
- `plan 不要求先运行 shape`
- `四种共享变更类型决定方案结构`
- `GitHub Issue 是尽力创建的伴随产物`
- `一个 plan 最多关联一个 Issue`
- `Issue 失败不阻塞本地方案或后续 skill`
- `plan 与 Issue 从同一已知意图渲染且不重复确认`
- `方案保持路径级 scope、独立 verify 与 change-type 专属证据`

### `specs/implement/spec.md`

**MODIFIED**

- `基于已批准的方案` → 有 plan 时必须遵循；没有 plan 时可从足够明确的当前请求执行，不能因上游 artifact 缺失而停止。
- `仅豁免本次方案的未提交状态` → 预检围绕本次用户请求及可用 plan 判断相关改动，不把 plan 文件设为必需。
- `不在受保护分支上动工` → 无 plan 时也从当前变更主题派生安全工作分支。
- `有测试框架且 fix/feat 走 TDD` → change type 来自共享语义，而非只来自 plan frontmatter。

**ADDED**

- `实现完成后自动运行 check`
- `实现范围内 findings 自动修复并重新 check`
- `意图或范围问题退出自动闭环`

### `specs/docs/spec.md`

**MODIFIED**

- `默认目录驱动的多目标记忆` → catalog 只含 spec、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README。
- `守默认目录边界、PRODUCT 指回 shape` → docs 可从用户或 shape 已确定的决策写 PRODUCT，但不得自行决定产品方向。

**REMOVED**

- `WORKFLOW 流程阶段以 squire skill pipeline 为骨架访谈`

### `specs/publish/spec.md`

**ADDED**

- `按当前状态完成 commit、push 与 PR`
- `commit 保持主题分组、历史风格与敏感文件边界`
- `push 与 PR 禁止 force 和保护分支写入`
- `PR 描述综合整条分支并包含 Test plan`
- `Issue 存在时关联、不存在时不阻塞`
- `已完成子动作可安全恢复而不重复创建`

### `specs/release/spec.md`

**ADDED**

- `从显式输入或权威版本源确定 tag`
- `创建并推送 tag`
- `以 tag 创建带生成 notes 的 GitHub Release`
- `不修改项目版本、不部署、不回滚`
- `部分外部失败如实报告且不伪造原子成功`

### Removed domains

删除 `specs/issue/spec.md`、`specs/commit/spec.md`、`specs/pr/spec.md`；其仍适用的安全与格式契约分别迁入 plan 与 publish。`specs/check/spec.md` 的能力契约保持不变。`specs/explore`、`specs/converge`、`specs/doctor` 只同步移除 WORKFLOW 或旧 skill 名的陈旧引用。

## Implementation steps

1. 建立共享 change type 真源和目标 skill 集合的机械契约。
   - outcome: `fix` / `feat` / `refactor` / `perf` 只有一个共享定义；仓库测试先锁定目标 11-skill 集合、公共名称、spec 配对和无旧 alias，再由后续步骤逐项变绿。
   - scope: `rules/`, `tests/checks.ts`, `tests/checks.test.ts`, `tests/smoke/verify-skills.test.ts`
   - verify: `pnpm exec vp test run tests/checks.test.ts tests/smoke/verify-skills.test.ts`
2. 从 shape 抽离持久产出并建立 plan skill。
   - outcome: shape 成为纯会话塑形能力；新增 plan 使用共享 change type，始终写本地方案，复用迁移后的 plan template/mode bar/Issue semantic schema，并以 best-effort GitHub side effect 建立至多一个 Issue 关联；独立 issue skill/spec 被移除，原 issue schema/language/GitHub safety 测试迁入 plan。
   - scope: `skills/shape/`, `skills/plan/`, `skills/issue/`, `specs/shape/spec.md`, `specs/plan/spec.md`, `specs/issue/`, `tests/issue.test.ts`, `tests/plan.test.ts`
   - verify: `pnpm exec vp test run tests/plan.test.ts tests/smoke/verify-skills.test.ts`
3. 让 shape bench 只评估会话塑形结果。
   - outcome: bench 不再把 plan 写入当作 shape 完成信号或评分要求；checker 只守 shape 的零写入/零实现边界，judge 评估 grounded direction、material decisions 与交互比例；场景、gold case、driver 终止条件和 README 与新 shape spec 锁步。旧契约分数保留为不可横向比较的历史，不用其他 judge 模型冒充已退役模型完成校准。
   - scope: `bench/README.md`, `bench/src/`, `bench/scenarios/`, `bench/golden/`
   - verify: `pnpm exec vp test run bench/src`
4. 把 implement 改为可独立执行并持有 check 修复闭环。
   - outcome: implement 有 plan 时严格复用、无 plan 时从明确请求执行；branch、scope、change type 与验证不再依赖 plan 文件存在；每次实现完成自动运行现有 check，对当前范围内阻塞 finding 修复后重跑，遇到意图/范围变化或无进展则退出报告；check skill/spec 本身不改变。
   - scope: `skills/implement/SKILL.md`, `specs/implement/spec.md`
   - verify: `pnpm test`，并用有 plan、无 plan、check 一次通过、check 发现可修 bug、check 发现范围外问题五类 transcript 做行为验收。
5. 把 durable memory catalog 收敛为六类文档并移除 WORKFLOW。
   - outcome: memory catalog、docs formats、checker 与测试只识别 spec、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README；docs 可记录已经确定的 PRODUCT 决策；根 `WORKFLOW.md` 和 workflow format 删除；explore、converge、doctor 及其 specs 只做相应目录/引用对齐，现有 domain spec 布局保留。
   - scope: `rules/memory-catalog.md`, `skills/docs/`, `skills/explore/`, `skills/converge/`, `skills/doctor/`, `specs/docs/spec.md`, `specs/explore/spec.md`, `specs/converge/spec.md`, `specs/doctor/spec.md`, `tests/memory-catalog.test.ts`, `tests/checker.test.ts`, `WORKFLOW.md`
   - verify: `pnpm exec vp test run tests/memory-catalog.test.ts tests/checker.test.ts tests/smoke/verify-skills.test.ts`，并确认 `node skills/doctor/scripts/checker.ts . --json` 不再要求 WORKFLOW。
6. 以 publish 替换 commit 与 pr。
   - outcome: 一个 publish skill 根据当前工作树、分支、remote 与 PR 状态完成尚未完成的 commit、push、PR；完整保留敏感文件、commit 拆分/message、保护分支、no-force、整分支 Summary 与 Test plan 边界；存在 plan Issue URL 时写 closing reference，不存在时不降级 publish 成功；旧 skill/spec 删除且不保留 alias。
   - scope: `skills/publish/`, `skills/commit/`, `skills/pr/`, `specs/publish/spec.md`, `specs/commit/`, `specs/pr/`, `tests/`
   - verify: `pnpm test`，并在本地 bare remote fixture 验证仅 commit、commit+push、已 push 待 PR 的可恢复路径；GitHub mutation 仅在明确授权的 disposable repository 验收。
7. 新增通用 release skill。
   - outcome: release 从显式 tag 或项目权威版本源确定发布标识，创建/推送 tag，并用 GitHub generated notes 创建对应 Release；不修改版本文件、不部署、不生成 changelog；已存在 tag/release、无新提交、非 GitHub remote、认证失败与部分 side effect 都有准确结果边界。
   - scope: `skills/release/`, `specs/release/spec.md`, `tests/`
   - verify: `pnpm test`，以本地 tag fixture 验证无远程路径；GitHub Release 仅在明确授权的 disposable repository 验收。
8. 把路由、产品哲学和当前架构同步到新能力图。
   - outcome: RESOLVER 与双语 README 展示新的 11-skill 集合和软连接关系；PRODUCT 把“用户决定串联”修订为“用户决定进入哪个能力，skill 可在自身 outcome 内组合能力”，并把通用 tag + GitHub Release 从发布管理禁区中做有界例外；ARCHITECTURE 重写当前目录/数据流/关键决策并保留历史；ROADMAP 移除已落地 release 与 WORKFLOW handoff 项；所有旧名称和硬 core-loop 声称只在明确历史记录中保留。
   - scope: `skills/RESOLVER.md`, `README.md`, `README.zh-CN.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `ROADMAP.md`
   - verify: `rg -n "skills/(issue|commit|pr)|/issue|/commit|/pr|shape → implement|commit → pr|WORKFLOW" README.md README.zh-CN.md PRODUCT.md ARCHITECTURE.md ROADMAP.md skills specs rules tests bench`，逐项确认命中只属于历史说明或测试 fixture；运行 `pnpm test`。
9. 完成整库门禁与代表性行为验收。
   - outcome: 格式、lint、类型/测试、skill↔spec、resolver、memory catalog、doctor checker 与新行为场景全部通过；任何无法运行的外部模型校准或 GitHub side effect 明确记为 skipped，不伪装成 pass。
   - scope: `skills/`, `specs/`, `rules/`, `tests/`, `bench/`, root durable docs
   - verify: `pnpm check && pnpm test && pnpm lint && node skills/doctor/scripts/checker.ts . --json && git diff --check`

## Verification

- command: `pnpm check`
- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `git diff --check`

### Behavior evidence — 2026-07-22

- **plan / implement disposable transcripts:**在 workspace 外的 Node fixtures 实跑七条路径。有 plan 与无 plan 均先红后绿；一次 check 直接通过；一次完整 acceptance probe 发现 `ADA != ada` 后增加红测、scope 内修复并 recheck 通过；新货币语义 + `decimal.js` finding 触发 intent/scope/dependency boundary，tree hash 不变且 plan 保持 approved；离线 `gh auth` exit 1 后本地 plan SHA 不变；已有 canonical Issue 的 mock 日志只有 `issue view`，没有 `issue create`。
- **publish disposable git fixtures:**无 origin 时保留既有 commit；未 push 分支只执行一次 `git push -u` 并建立 upstream；已 push 分支 commit count 与 ahead/behind 均不变，直接进入 non-GitHub manual PR 结果。三个场景均未制造额外 commit。
- **release disposable git fixtures:**无 remote 与 non-GitHub remote 均在创建 tag 前停止，tag count `0 → 0`；matching 与 mismatching annotated tag 的 object/peeled target 前后不变，没有移动或覆盖 tag。
- **read-only check evidence:**独立 review、test、behavior subagent 均确认 workspace status 前后完全一致；`pnpm exec skills add . --list` 实际发现 11 个 skill。
- **explicit skips:**固定 shape judge `claude-fable-5` 已下架，按维护者决定不换模型补跑；未授权 disposable GitHub repository，真实 Issue、PR、tag push 与 GitHub Release/generated notes 均未创建。这些外部项是 skipped，不记为 passed；本地失败、恢复与幂等边界已覆盖。

- checklist (manual):
  - [x] `/shape` 的零写入/零实现边界、模糊与已收敛场景由 bench mechanical tests 锁定；live judge 按上方约定 skipped。
  - [x] `/plan` 可从完整请求直接写本地 plan；GitHub 不可用时 plan 保持有效。真实 GitHub Issue success path 按上方约定 skipped。
  - [x] 同一 plan 已有 canonical Issue URL 时只验证该 URL，不创建第二个 Issue。
  - [x] `/implement` 有无 plan 均能执行；check 一次通过、scope 内修复重查、意图/范围/依赖 boundary 均已在 disposable transcript 验收。
  - [x] 独立 `/check` 保持只读，多个 check run 的工作树 hash 前后相同。
  - [x] `/docs` 可记录已确定 PRODUCT truth，且 catalog、converge、explore、doctor 不再要求 WORKFLOW。
  - [x] `/publish` 的无 remote、未 push、已 push路径已验；真实 GitHub PR 与 closing reference 按上方约定 skipped。
  - [x] `/release` 的前置停止、matching/mismatching tag 不改写已验；真实 GitHub Release/generated notes 按上方约定 skipped。
  - [x] 公共 skill 均不把常见上游 artifact 当门禁；direct plan 与 no-plan implement 已实跑。
  - [x] CLI discovery 只暴露目标 11 个 skill，无 `/issue`、`/commit`、`/pr` alias。

## Rollback

回退本变更提交即可恢复旧 skill 集合、WORKFLOW catalog 与硬 core-loop 文档。实施与自动测试不应创建真实 GitHub 对象；若经明确授权在 disposable repository 做集成验收，Issue、PR、tag 与 Release 是外部状态，需逐项显式清理，不能假设代码回滚会撤销它们。

## Assumptions & risks

- **行为面积大：** skill 集合、memory catalog、bench 和根文档同时变化，最容易留下陈旧路由；目标 inventory、spec pairing、全文陈旧词扫描和 doctor checker 共同守住迁移。
- **软连接被误写回硬门禁：** implement、publish 等现有 prose 大量假设上游 artifact；验收必须覆盖“无 plan / 无 Issue / 未跑 check”等入口，而不只覆盖理想路径。
- **Issue 是非原子远程副作用：** plan 成功而 Issue 失败是合法降级；结果不明确时不得盲目重试。存在 URL 后以它为唯一身份，避免标题搜索造成重复。
- **自动修复循环可能不收敛：** implement 只修当前授权范围内、check 可验证的 finding；同一问题无进展、需要改变意图或扩 scope 时立即退出并报告，不用固定次数假装解决。
- **shape bench 失去 plan 文件终止信号：** driver 必须改用可观察的会话终止状态，同时避免把暂时停顿误判为完成；纯逻辑测试先锁定，模型 judge 校准沿用既有模型可用性纪律。
- **GitHub Release 不是部署：** README、PRODUCT、release skill 与 spec 都要重复守住这一边界，防止通用 release 逐步吸收项目专属发布流程。

## Acceptance scenarios

1. **独立 shape：** Given 用户只有模糊想法，When 调用 shape，Then shape 按需取得事实并在对话中收敛方向，且不创建 plan 或 Issue。
2. **直接 plan：** Given 用户没有运行 shape 但请求已足够明确，When 调用 plan，Then 产生有效本地 plan，不因缺少 shape artifact 停止。
3. **Issue 成功：** Given plan 面向可访问的 GitHub 仓库，When Issue 创建成功，Then plan 记录唯一 canonical URL，Issue label 与共享 change type 一致。
4. **Issue 降级：** Given GitHub 认证、权限或网络失败，When plan 运行，Then 本地 plan 仍成功，错误被准确报告，后续 implement 不受阻塞。
5. **无 plan 实施：** Given 当前请求明确且没有 plan 文件，When 调用 implement，Then 它安全建立范围、完成实现并进入 check 闭环。
6. **实现闭环：** Given check 发现当前实现范围内的回归，When implement 收到 finding，Then 修复后重新 check；Given finding 需要新产品决定或扩大范围，Then 循环退出并把决定交还用户。
7. **独立 check：** Given 用户直接调用 check，When check 发现问题，Then 只报告 verdict/findings，不写文件或自动进入 implement。
8. **六类 docs：** Given已有明确 PRODUCT 决策或其他权威事实，When 调用 docs，Then 写入正确的六类目标之一；WORKFLOW 不再被创建、检查或推荐。
9. **无 Issue 发布：** Given分支可发布但 plan 没有 Issue，When 调用 publish，Then commit、push、PR 正常完成且不伪造关联。
10. **有 Issue 发布：** Given plan 带 Issue URL，When publish 创建面向默认分支的 PR，Then PR 带 closing reference，并保留整分支 Summary 与 Test plan。
11. **通用 release：** Given明确 tag 与可访问 GitHub repository，When 调用 release，Then tag 和 GitHub Release notes 被创建；版本文件、部署状态和仓库文档保持不变。
