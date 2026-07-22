# Plan Specification

## Purpose

plan skill 把一项已经足够明确的 change 持久化为可执行本地方案，并在 GitHub 可用时尽力创建同一意图的 Issue 投影。

## Requirements

### Requirement: plan 始终先产出本地方案

plan 必须先写一个 `plans/YYYY-MM-DD-<slug>.md`，再尝试任何 GitHub side effect；本地方案包含 change type、边界、路径级步骤、独立 verify、整体验证和适用的专属证据，且不得含意图级占位符。
Verify: manual(integration)

### Requirement: plan 不要求先运行 shape

plan 必须复用已有 shape 结论，但不得把 shape artifact 或调用历史设为门禁；当前请求足够明确时必须能直接产出方案。
Verify: manual(integration)

### Requirement: 四种共享变更类型决定方案结构

plan 必须从共享真源选择恰好一个 `fix`、`feat`、`refactor` 或 `perf`，并使用对应的 root-cause/regression、interface/acceptance、invariant/coverage 或 baseline/target/measurement 质量门槛；brainstorm 不是 plan mode。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: GitHub Issue 是尽力创建的伴随产物

plan 必须把 Issue 创建视为 local plan 之后的 best-effort projection。CLI、认证、仓库、权限、label、网络或 Issue 创建失败时必须保留有效 plan、准确报告降级状态，并允许后续 skill 继续。
Verify: manual(integration)

### Requirement: 一个 plan 最多关联一个 Issue

plan 必须以 frontmatter 中已有或用户显式提供并验证的 canonical Issue URL 为唯一身份；存在关联时必须复用，不得按标题搜索、猜测或创建替代 Issue。新建成功后才把 URL 写回 frontmatter；不明确的失败不得自动重试。
Verify: manual(integration)

### Requirement: plan 与 Issue 共享意图且不重复确认

plan 与 Issue 必须从同一组已知事实、范围、约束与验收渲染；`/plan` 调用已经授权这两个公开产出，不得另设理解卡或 prose 审批门槛。Issue 的所有用户可见字段使用用户当前语言，显式语言要求优先。
Verify: manual(integration)

### Requirement: Issue 保持安全且范围有限

Issue 必须只使用与 change type 相同的一个 lowercase label、固定 semantic schema 和安全 body file；不得管理 Projects、状态、milestone、assignee、sub-issue 或 dependencies，也不得编辑既有 Issue。
Verify: [plan Issue projection contract](../../tests/plan.test.ts)
