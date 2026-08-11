# Plan Specification

## Purpose

plan skill 按用户选择，把可实施的开发工作持久化为本地方案、把边界清楚的开发问题持久化为 problem-oriented GitHub Issues，或同时产出职责分离的二者；未指定 artifact target 时固定使用 `both`。

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

`issue` 必须接受 1–20 个用户明确分隔、属于同一 canonical repository 的 bounded development problems，为每项独立选择 change type 并创建或复用至多一个 Issue；solution、target architecture 或完整 acceptance 尚未确定不得成为 blocker，只有 repository、item boundary 或问题本身不足以可靠记录时才可在 mutation 前 `blocked`。除必定清理且位于项目外的安全临时 body file 外，不得写 plan、工作树、branch 或其他项目状态；零项、21 项以上、跨仓或边界不清不得自动拆批。
(Previously: `issue` 接受 1–20 个明确同仓 work items，但没有区分问题记录与实施交接所需的成熟度。)
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

plan 必须复用已有 shape 结论，但不得把 shape artifact 或调用历史设为门禁；`local` / `both` 的 change 已达到实施成熟度，或 `issue` 的 problem 已足以准确记录时，必须能直接按所选 target 持久化。
(Previously: 当前请求足够明确时必须能直接按所选 target 持久化工作，但没有按 artifact 职责区分“足够明确”。)
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: 四种共享变更类型决定产物证据

plan 必须从共享真源为每个 work item 选择恰好一个 `fix`、`feat`、`refactor` 或 `perf`。本地方案使用对应的 root-cause/regression、interface/acceptance、invariant/coverage 或 baseline/target/measurement 质量门槛；每个 Issue 使用同一类型的 single lowercase label 与 problem-evidence schema，不得借分类选择 target structure、未来工具或实现方式；brainstorm 不是 plan mode。

(Previously: 每个 Issue 使用同一类型的 single lowercase label 与 semantic schema，但 schema 没有排除 target structure、未来工具或实现方式。)
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

`both` 的本地方案与 Issue 必须从同一问题、已知事实、外部约束和可观察结果渲染，但职责保持分离：Issue 只记录问题，本地 plan 承载方案、路径级 scope、顺序和验证；`issue` 必须从每个用户明确条目渲染对应 problem record。调用已经授权所选 target 的公开产出，不得另设理解卡或 prose 审批门槛；Issue 的所有用户可见字段使用用户当前语言，显式语言要求优先。

(Previously: `both` 的本地方案与 Issue 从同一组已知事实、范围、约束与验收渲染，但没有明确两种 artifact 的内容职责。)
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: Issue 只记录问题而不规定实现

`issue` 与 `both` 新建的每个 Issue 必须记录问题或能力缺口、其重要性以及已知的可观察完成状态；可以包含有证据支持的背景、复现、现有测量、影响、外部约束、非目标和验收，但不得规定 technical approach、target architecture、待改 path/symbol、dependency choice、migration design、implementation order 或 test implementation plan。未知 solution 必须保持未知，不得为填满 schema 而变成调查、测量或实现任务；只有对应类型的 problem section 必填，其余 section 必须在有事实支持时才出现。
Verify: [plan Issue projection contract](../../tests/plan.test.ts)

### Requirement: Issue 保持安全且范围有限

Issue 必须只使用与 change type 相同的一个 lowercase label、problem-oriented semantic schema 和安全 body file；所有 GitHub access 先核验 active account，case-only label collision 必须在 Issue mutation 前停止，本轮已经创建的 labels 必须在所有完成或失败结果中准确报告；不得管理 Projects、状态、milestone、assignee、sub-issue 或 dependencies，也不得编辑既有 Issue。GitHub provider 调用细节必须位于 target reference 而非主 SKILL；`local` 仅在存在 canonical URL 时条件式认证，`both` 必须按显式 repository、canonical URL 所属 repository、当前 repository 的顺序解析身份，临时 body file 必须在成功、失败或结果模糊后清理。label 创建失败必须映射到首个依赖该 label 的 `failed` row，保留 `reused` rows，并把其余 create candidates 标记为 `not-attempted`。
(Previously: Issue 使用固定 semantic schema，但没有把 problem-oriented 内容边界纳入安全契约。)
Verify: [plan Issue projection contract](../../tests/plan.test.ts)
