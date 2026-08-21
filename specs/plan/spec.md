# Plan Specification

## Purpose

plan skill 按用户选择，把可实施的开发工作持久化为本地方案、把边界清楚的开发问题持久化为 problem-oriented GitHub Issues，或同时产出职责分离且问题记录可受控同步的二者；未指定 artifact target 时固定使用 `both`。

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

`issue` 必须接受 1–20 个用户明确分隔、属于同一 canonical repository 的 bounded development problems，为每项独立选择 change type 并创建或只读复用至多一个 Issue；它不得编辑已存在的 Issue。solution、target architecture 或完整 acceptance 尚未确定不得成为 blocker，只有 repository、item boundary 或问题本身不足以可靠记录时才可在 mutation 前 `blocked`。除必定清理且位于项目外的安全临时 body file 外，不得写 plan、工作树、branch 或其他项目状态；零项、21 项以上、跨仓或边界不清不得自动拆批。
(Previously: `issue` 接受 1–20 个明确同仓 work items，但没有区分问题记录与实施交接所需的成熟度。)
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: issue 批次具有稳定事务语义

`issue` 必须在整批 preflight 后按输入顺序串行 mutation，以唯一 hidden batch marker 标识每个 create candidate，并返回 `created`、`reused`、`blocked`、`failed`、`unknown` 或 `not-attempted` 的完整逐项 ledger。首个确定失败必须停批；首个模糊 create 必须永久停批，只允许按 exact marker 做一次只读 reconciliation，且不得按标题查询或盲重试。
Verify: [plan transaction transcripts](../../tests/plan-issue-harness.test.ts)

### Requirement: both target local-first 并建立唯一 Issue 关联

`both` 必须只接受一项 coherent change，并在任何 Issue create/edit mutation 前写入并验证本地方案。没有关联时创建至多一个带可验证 managed envelope 的同范围 Issue；已有 Plan-managed association 时保持 canonical URL 稳定，问题投影未变返回 `unchanged`，同一 bounded problem 的问题投影变化经安全校验与回读后返回 `updated`。本地方案失败时不得尝试 Issue；Issue conflict、失败或结果未知时必须保留方案并返回 `partial`。
(Previously: `both` 先写本地方案，再创建或原样复用至多一个同范围 Issue；既有 Issue 内容不可修订。)
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: 三个 target 具有独立完成语义

plan 必须按所选 target 报告 `success`、`partial`、`failed` 或 `blocked`，并只返回已验证存在的 path 与 canonical URL。`both` 的 Issue 子结果必须区分 `created`、`unchanged`、`updated`、`conflict`、`failed` 与 `unknown`；有效 local plan 在远程冲突或失败后仍可供 implement 使用，`issue` 失败不得伪造 local fallback。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: 仅 local 与 both 产出本地方案

`local` 与 `both` 产出的方案必须包含 change type、边界、路径级步骤、独立 verify、整体验证和适用的专属证据，且不得含意图级占位符；每个实施步骤与条件段必须可追溯到既定目标、验收或必要支撑工作，不得把偶然发现或可选完善提升为方案范围；`both` 必须在任何 Issue mutation 前完成本地写入，`issue` 不得写项目文件。

(Previously: `plan 始终先产出本地方案` 要求所有调用先写本地方案。)
Verify: manual(integration)

### Requirement: local plan 区分实施授权、candidate 与独立验收

本地 plan 必须支持 `draft → approved → candidate → done`：新 plan 是 draft；显式用户请求或仍处于执行中的 Implement authorization 产生 approved；Implement 记录可稳定复算的 candidate basis、本地 evidence 与限制后产生 candidate；只有 acceptance-scoped Check 对同一 basis 返回 pass 与 `attested for the exact current candidate` 才产生 done。普通 scoped pass、findings 或 inconclusive 必须保持 candidate；finding 只否定 acceptance，不得产生 approved 或 repair authority。candidate/done plan 必须保存一个最后获授权投影的 time-scoped Assurance snapshot，包含 basis、Implement producer、evidence/limitations、Check producer、verdict 和 acceptance，授权投影变化时替换而不追加 ledger。任何状态都只是其有权 producer event 的投影，不得由 plan artifact 自行产生 authority。legacy `done` 缺少完整 Assurance 时只能解释为 historical implementation completion、acceptance not established，不得从状态或 artifact existence 伪造/回填 basis、producer、verdict 或 acceptance。带完整 Assurance 的 done 也是 exact accepted candidate 的历史 closed record，不证明不存在 later result；消费者声明 current acceptance 前必须核对 basis，并使用当前上下文可得的 latest applicable Check result，无法建立 applicability 时只能报告历史 snapshot 或重新 Check。后来 finding 在携带它的上下文/Handoff 中 supersede 旧结果，但不得修改/静默重开 plan 或授权修复；持久化 globally latest validity 需要另行授权 writer/ledger，不属于本契约。无关联 plan 的直接 Implement 不得为了记录这些状态自动创建 plan。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: plan 不要求先运行 shape

plan 必须复用已有 shape 结论，但不得把 shape artifact 或调用历史设为门禁；`local` / `both` 的 change 已达到实施成熟度，或 `issue` 的 problem 已足以准确记录时，必须能直接按所选 target 持久化。
(Previously: 当前请求足够明确时必须能直接按所选 target 持久化工作，但没有按 artifact 职责区分“足够明确”。)
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: plan 保持既定决策、来源与范围

plan 必须把用户明确决定或同意的方向、约束与非目标作为 artifact 约束，不得静默重做、重新解释或打开；agent 从含糊上下文推断的偏好不属于既定决定。Design Summary、plan、代码或 merged artifact 只能传递其来源已有的 authority，其存在不得把未披露的重大选择升级为用户决定。用户否定一个前提时，plan 必须丢弃它并只重新判断实际依赖它的 artifact 内容。与方向一致的必要事实按 artifact 所需比例纳入，仓库可回答的事实和可逆实现选择由 agent 直接补全，旁支与可选优化必须排除。只有检查得到的仓库事实、既有契约或权威资料证明既定决定不可行、相互矛盾或具有实质风险时才可重新打开；plan 必须在任何 artifact mutation 前报告原决定、新证据与影响，并等待该决定重新收敛。Shape artifact 不是 Plan 的入口门，Plan artifact 也不授权 implementation。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: 四种共享变更类型决定产物证据

plan 必须从共享真源为每个 work item 选择恰好一个 `fix`、`feat`、`refactor` 或 `perf`。本地方案使用对应的 root-cause/regression、interface/acceptance、invariant/coverage 或 baseline/target/measurement 质量门槛；每个 Issue 使用同一类型的 single lowercase label 与 problem-evidence schema，不得借分类选择 target structure、未来工具或实现方式；brainstorm 不是 plan mode。

(Previously: 每个 Issue 使用同一类型的 single lowercase label 与 semantic schema，但 schema 没有排除 target structure、未来工具或实现方式。)
Verify: [plan Issue projection contract](../../tests/plan.test.ts)

### Requirement: Issue 是显式 target 产物

Issue 只能由 `issue` 或 `both` target 创建或复用，只有 `both` 可以同步已证明由 Plan 管理的 paired problem record。`both` 的 CLI、认证、仓库、权限、label、网络、Issue create/edit、所有权或 digest 失败必须保留有效 plan 并把整体结果报告为 `partial`；`issue` 必须按自己的 ledger 报告结果，不得降级为 `local`。

(Previously: GitHub Issue 是所有 plan 调用在 local plan 之后尽力创建的伴随产物。)
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: 一个 local plan 最多关联一个 Issue

一份 local plan 必须以 frontmatter 中已有或用户显式提供并验证的 canonical Issue URL 为唯一身份；存在关联时必须保持该 identity，不得按标题搜索、猜测或创建替代 Issue。同一 bounded problem 的 managed content 可以由 `both` 修订；问题身份改变、拆分或合并必须在远程 mutation 前停止。`issue` target 的每个独立条目同样最多映射一个 canonical Issue，但一个明确批次可包含至多 20 项。

(Previously: canonical identity 必须复用，但与“既有 Issue 不得编辑”结合后使同一问题的内容也不可修订。)
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: 产物共享意图且不重复确认

`both` 的本地方案与 Issue 必须从同一问题、已知事实、外部约束和可观察结果渲染，但职责保持分离：Issue 只记录问题，本地 plan 承载方案、路径级 scope、顺序和验证。重写 paired plan 时必须重新生成 Issue-owned projection；implementation-only revision 不触发 edit，同一问题的 projection 变化只更新受管内容。`issue` 必须从每个用户明确条目渲染对应 problem record。调用已经授权所选 target 的公开产出，除“plan 保持既定决策与范围”定义的实质证据冲突外，不得另设理解卡或 prose 审批门槛；Issue 的所有用户可见字段使用用户当前语言，显式语言要求优先。

(Previously: `both` 的本地方案与 Issue 从同一组已知事实、范围、约束与验收渲染，但没有明确两种 artifact 的内容职责。)
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: Issue 只记录问题而不规定实现

`issue` 新建及 `both` 新建或同步的每个 Issue projection 必须记录问题或能力缺口、其重要性以及已知的可观察完成状态；可以包含有证据支持的背景、复现、现有测量、影响、外部约束、非目标和验收，但不得规定 technical approach、target architecture、待改 path/symbol、dependency choice、migration design、implementation order 或 test implementation plan。未知 solution 必须保持未知，不得为填满 schema 而变成调查、测量或实现任务；只有对应类型的 problem section 必填，其余 section 必须在有事实支持时才出现。
Verify: [plan Issue projection contract](../../tests/plan.test.ts)

### Requirement: paired Issue 受控同步且保护外部编辑

`both` 创建的 paired Issue 必须用 versioned managed block 标识 Plan-owned title、单一 change-type label 与 problem body，并以 canonical title/type/body 的 SHA-256 验证写入基线。同步必须保留 block 外正文、comments、无关 labels 与项目管理字段；marker 缺失、版本未知、边界异常、type label 不一致或 digest mismatch 必须在 edit 前返回 `conflict`。每次 edit 后只允许按 canonical URL 回读一次：目标 digest 完整匹配为 `updated`，非成功调用且原状态完整保留为 `failed`，部分或其他状态为 `unknown`，不得盲目重试。显式 adoption 是未受管 Issue 建立基线的唯一入口。
Verify: [plan paired Issue synchronization harness](../../tests/plan-paired-issue.test.ts)

### Requirement: Issue 保持安全且范围有限

Issue 必须只使用与 change type 相同的一个 lowercase label、problem-oriented semantic schema 和安全 body file；所有 GitHub access 先核验 active account，case-only label collision 必须在 Issue mutation 前停止，本轮已经创建的 labels 必须在所有完成或失败结果中准确报告。`local` 不得执行 GitHub mutation，`issue` 不得编辑既有 Issue，`both` 只能编辑已验证 managed envelope 的 paired Issue；任何 target 都不得管理 Projects、状态、milestone、assignee、sub-issue 或 dependencies。GitHub provider 调用细节必须位于 target reference 而非主 SKILL；`local` 仅在存在 canonical URL 时条件式认证，`both` 必须按显式 repository、canonical URL 所属 repository、当前 repository 的顺序解析身份，临时 body file 必须在成功、失败或结果模糊后清理。label 创建失败必须映射到首个依赖该 label 的 `failed` row，保留 `reused` rows，并把其余 create candidates 标记为 `not-attempted`。
(Previously: 所有既有 Issue 都不得编辑，因此 paired problem record 无法跟随同一问题的语义修订。)
Verify: [plan Issue projection contract](../../tests/plan.test.ts)
