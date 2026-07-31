# Plan Specification

## Purpose

plan skill 按用户选择，把已经足够明确的开发工作持久化为本地实施方案、GitHub Issue work items，或二者；未指定 artifact target 时固定使用 `both`。

## Requirements

### Requirement: 显式 artifact target 且默认 both

plan 必须在任何 side effect 前把调用解析为互斥的 `local`、`issue` 或 `both`；显式 target 优先，完全省略时必须等价于 `both`，冲突 target 必须在 mutation 前停止。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: agent 不自动分流或降级 target

plan 不得根据工作树、请求规模、需求成熟度、GitHub 可用性或 agent 偏好推荐、推断、切换或 fallback 到另一 target；target、仓库和条目边界明确时不得增加第二轮确认。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: local target 只写一份本地方案

`local` 必须为一项 coherent change 写一个 `plans/YYYY-MM-DD-<slug>.md`，并保持零 GitHub mutation。显式 existing canonical Issue URL 可以在先认证后只读验证并关联；验证失败不得触发远程写入或 Issue fallback。
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: issue target 零项目写入并支持同仓批量

`issue` 必须接受 1–20 个用户明确分隔、属于同一 canonical repository 的条目，为每项独立选择 change type 并创建或复用至多一个 Issue；除必定清理且位于项目外的安全临时 body file 外，不得写 plan、工作树、branch 或其他项目状态。零项、21 项以上、跨仓或边界不清必须在 mutation 前 `blocked`，不得自动拆批。
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: issue 批次具有稳定事务语义

`issue` 必须在整批 preflight 后按输入顺序串行 mutation，以唯一 hidden batch marker 标识每个 create candidate，并返回 `created`、`reused`、`blocked`、`failed`、`unknown` 或 `not-attempted` 的完整逐项 ledger。首个确定失败必须停批；首个模糊 create 必须永久停批，只允许按 exact marker 做一次只读 reconciliation，且不得按标题查询或盲重试。
Verify: [plan transaction transcripts](../../tests/plan-issue-harness.test.ts)

### Requirement: both target local-first 并建立唯一 Issue 关联

`both` 必须只接受一项 coherent change，先写并验证本地方案，再创建或复用至多一个同范围 Issue；只有 canonical URL 得到确定验证后才能写入 plan frontmatter。本地方案失败时不得尝试 Issue，Issue 失败或结果未知时必须保留方案并返回 `partial`。
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: 三个 target 具有独立完成语义

plan 必须按所选 target 报告 `success`、`partial`、`failed` 或 `blocked`，并只返回已验证存在的 path 与 canonical URL。`both` 的有效 local plan 在远程失败后仍可供 implement 使用；`issue` 失败不得伪造 local fallback。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: 仅 local 与 both 产出本地方案

`local` 与 `both` 产出的方案必须包含 change type、边界、路径级步骤、独立 verify、整体验证和适用的专属证据，且不得含意图级占位符；`both` 必须在任何 Issue mutation 前完成本地写入，`issue` 不得写项目文件。

(Previously: `plan 始终先产出本地方案` 要求所有调用先写本地方案。)
Verify: manual(integration)

### Requirement: plan 不要求先运行 shape

plan 必须复用已有 shape 结论，但不得把 shape artifact 或调用历史设为门禁；当前请求足够明确时必须能直接按所选 target 持久化工作。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: 四种共享变更类型决定产物证据

plan 必须从共享真源为每个 work item 选择恰好一个 `fix`、`feat`、`refactor` 或 `perf`。本地方案使用对应的 root-cause/regression、interface/acceptance、invariant/coverage 或 baseline/target/measurement 质量门槛；每个 Issue 使用同一类型的 single lowercase label 与 semantic schema；brainstorm 不是 plan mode。

(Previously: 四种类型只决定单个本地方案结构和可选 Issue label。)
Verify: [plan Issue projection contract](../../tests/plan.test.ts)

### Requirement: Issue 是显式 target 产物

Issue 只能由 `issue` 或 `both` target 创建或复用。`both` 的 CLI、认证、仓库、权限、label、网络或 Issue 创建失败必须保留有效 plan 并把整体结果报告为 `partial`；`issue` 必须按自己的 ledger 报告结果，不得降级为 `local`。

(Previously: GitHub Issue 是所有 plan 调用在 local plan 之后尽力创建的伴随产物。)
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: 一个 local plan 最多关联一个 Issue

一份 local plan 必须以 frontmatter 中已有或用户显式提供并验证的 canonical Issue URL 为唯一身份；存在关联时必须复用，不得按标题搜索、猜测或创建替代 Issue。`issue` target 的每个独立条目同样最多映射一个 canonical Issue，但一个明确批次可包含至多 20 项。

(Previously: 整次 plan 调用只允许一个 Issue，因为每次调用都只有一个 local plan。)
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: 产物共享意图且不重复确认

`both` 的本地方案与 Issue 必须从同一组已知事实、范围、约束与验收渲染；`issue` 必须从每个用户明确条目渲染对应 intake Issue。调用已经授权所选 target 的公开产出，不得另设理解卡或 prose 审批门槛；Issue 的所有用户可见字段使用用户当前语言，显式语言要求优先。

(Previously: 裸 `/plan` 固定授权 local plan 与可选 Issue companion 两个产出。)
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: Issue 保持安全且范围有限

Issue 必须只使用与 change type 相同的一个 lowercase label、固定 semantic schema 和安全 body file；所有 GitHub access 先核验 active account，case-only label collision 必须在 Issue mutation 前停止，本轮已经创建的 labels 必须在所有完成或失败结果中准确报告；不得管理 Projects、状态、milestone、assignee、sub-issue 或 dependencies，也不得编辑既有 Issue。
Verify: [plan Issue projection contract](../../tests/plan.test.ts)
