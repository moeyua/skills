# Plan Specification

## Purpose

plan 把已经足够明确的工作持久化为用户选择的本地计划、GitHub Issues 或二者。

## Requirements

### Requirement: target 契约保持 local issue both

plan 必须支持 `local`、`issue`、`both` 三个 target；省略 target 时必须使用 `both`，不得按仓库状态、GitHub 可用性、工作量或失败预期擅自切换或 fallback。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: local 与 both 各承载一个 coherent change

`local` 必须只写一个可执行计划且零 GitHub mutation；`both` 必须先写并验证本地计划，再创建或复用至多一个 companion Issue。Issue 失败只使 `both` partial，不得删除、失效或阻塞本地计划。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: issue target 保留显式 item 边界

`issue` 必须只接受同一仓库 1–20 个显式分开的 work items，保持顺序和一 item 至多一 Issue；不得自动拆分、合并、换仓或写项目文件。
Verify: manual(integration)

### Requirement: plan 可直接进入但不授权实现

清晰请求不得因缺少 shape 或其他调用历史而被拒绝；plan 只能创建所选 artifact，不得实现、提交、推送、开 PR 或把 artifact 当成实现授权。
Verify: manual(integration)

### Requirement: 类型与格式按 target 渐进加载

每个 work item 必须选择一个共享 `fix`、`feat`、`refactor` 或 `perf`；local 只加载对应 plan quality reference，每个 Issue create candidate 只加载自身 type 的一个 Issue schema，并保持用户语言、对应 lowercase label 和完整可观察验收。一个 batch 所需的缺失 change-type labels 必须各创建至多一次。
Verify: [plan Issue projection contract](../../tests/plan.test.ts)

### Requirement: canonical Issue identity 唯一且安全

显式或 plan 已记录的 canonical URL 必须验证后复用，不得按标题搜索、编辑既有 Issue 或创建替代 identity。`both` 的仓库解析顺序必须是显式 repository、canonical Issue URL 携带的 repository、当前 repository；Issue mutation 的认证、用户语言、安全 body file 和 exclusions 由 `issue` / `both` target reference 定义，临时 body file 在成功、失败或结果模糊后都必须清理。`local` 只有收到显式 canonical URL 时才可按其 target contract 做条件式认证和只读验证，不得因此产生 GitHub mutation。label 创建失败必须映射到首个依赖该 label 的 failed row、保留 reused rows，并把其余 create candidates 标为 not-attempted；所有 partial/ambiguous state 必须准确记录。
Verify: [plan Issue projection contract](../../tests/plan.test.ts)
