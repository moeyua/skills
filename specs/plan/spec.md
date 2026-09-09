# Plan Specification

## Purpose

plan skill 按用户选择，把可实施的开发工作持久化为本地方案、把边界清楚的开发问题持久化为 problem-oriented GitHub Issues，或同时产出职责分离且问题记录可受控同步的二者；未指定 artifact target 时固定使用 `both`。产物生成后自动完成一轮独立规划审计，由 Plan 修订有证据且已获授权的问题，再分别报告生成、审计和修订结果。

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

`issue` 必须接受 1–20 个用户明确分隔、属于同一 canonical repository 的 bounded development problems，为每项独立选择 change type 并创建或只读复用至多一个 Issue。调用前已有且仅被复用的 Issue 必须保持只读；只有原始批次明确成功后，本轮确定创建且写前基线匹配的 Issue 才可为审计发现追加至多一次修订 edit。solution、target architecture 或完整 acceptance 尚未确定不得成为 blocker，只有 repository、item boundary 或问题本身不足以可靠记录时才可在 mutation 前 `blocked`。除必定清理且位于项目外的安全临时 body file 外，不得写 plan、工作树、branch 或其他项目状态；零项、21 项以上、跨仓或边界不清不得自动拆批。
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: issue 批次具有稳定事务语义

`issue` 必须在整批 preflight 后按输入顺序串行 mutation，以唯一 hidden batch marker 标识每个 create candidate，并返回 `created`、`reused`、`blocked`、`failed`、`unknown` 或 `not-attempted` 的完整逐项 ledger。首个确定失败必须停批；首个模糊 create 必须永久停批，只允许按 exact marker 做一次只读 reconciliation，且不得按标题查询或盲重试。原始批次一旦停止，审计只能读取已有产物，不得通过修订恢复远程事务，即使 reconciliation 找到新建 Issue 也不得续写。明确成功后的远程审计修订必须按输入顺序进行，每个可写 Issue 最多追加一次 edit，修订前读取 canonical URL 并核对 title、完整 body、单一 change-type label 与本轮写入快照一致，保留 batch marker；marker 不产生跨调用的所有权。首次修订冲突、失败或模糊返回必须停止后续远程修订，即使一次回读证明目标状态已达到也不得续写。每次 edit 只回读一次，以完整目标状态匹配、确定失败且完整原状态保留、其他或不可核实状态分别报告成功、失败或未知；不得重试、替代创建、删除或回滚已成功产物。原始 ledger、修订结果和后续未尝试修订必须分别保留。
Verify: [plan transaction transcripts](../../tests/plan-issue-harness.test.ts)

### Requirement: both target local-first 并建立唯一 Issue 关联

`both` 必须只接受一项 coherent change，并在任何 Issue create/edit mutation 前写入并验证本地方案。没有关联时创建至多一个带可验证 managed envelope 的同范围 Issue；已有 Plan-managed association 时保持 canonical URL 稳定，问题投影未变返回 `unchanged`，同一 bounded problem 的问题投影变化经安全校验与回读后返回 `updated`。审计修订也必须先修订并验证本地方案，再按权限同步同一 canonical Issue；仅实施方案变化不产生远程 edit。本地方案失败时不得尝试 Issue；Issue conflict、失败或结果未知时必须保留方案并返回 `partial`。原始远程事务未明确成功或已有停止条件时，审计可独立修订有效本地方案，但不得恢复远程写入；模糊 edit 即使回读为 `updated` 也不获得审计修订权限。
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: 三个 target 具有独立完成语义

plan 必须按所选 target 保留生成阶段的 `success`、`partial`、`failed` 或 `blocked`，并只返回已验证存在的 path 与 canonical URL。`both` 的 Issue 子结果必须区分 `created`、`unchanged`、`updated`、`conflict`、`failed` 与 `unknown`；有效 local plan 在远程冲突或失败后仍可供 implement 使用，`issue` 失败不得伪造 local fallback。最终报告必须分别说明原始生成结果与 ledger、审计范围和 verdict、修订及定向验证结果、未解决项和未审计范围；生成成功不得掩盖审计或修订失败。只有所需审计完成且没有未解决的阻塞项时才可宣称规划收尾完成，部分成功不得切换 target、撤销产物或自动进入 Implement。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: 产物生成后必须完成一轮规划审计

`local`、`issue` 和 `both` 必须在本次产物生成阶段到达终点后、最终汇报前，自动调用 Check 在新的独立上下文中审计已核实可读的实际产物；部分生成失败时仍须审查可读部分并说明缺口，没有可读产物时报告未执行及原始原因。审计必须提供原始用户需求、明确决定与纠正、约束和非目标、相关项目证据、target、实际产物及可定位版本、生成结果和限制；不得使用完整历史 fork 或只提供 Plan 自己的摘要。Check 必须独立读取所需事实和产物，对本地方案审查保真、范围、事实、顺序依赖、可实施性与有效验证，对 Issue 审查问题、身份、事实、约束和可观察结果，对 `both` 额外审查语义一致性；纯 `issue` 不得因未知方案或完整验收而产生缺陷。优先从同安装集合加载 Check，缺失时查找宿主 Skill；缺少 Check、独立上下文、必需证据或产物访问能力时报告 `inconclusive` 及受影响范围，保留产物，不静默自检、不自动安装。每次 Plan 调用仅有一轮完整审计，内部修订不得递归 Plan 或再次启动完整审计；规划审计不加载实现 acceptance 协议、不写 `## Assurance`，新计划保持 `draft`。
Verify: manual(integration)

### Requirement: Plan 自动修订有证据且已获授权的审计发现

Check 必须只读并返回实际审查范围、版本、恰好一个 `pass`、`findings` 或 `inconclusive`、可追溯到原始目标或项目契约的具体发现及缺失证据。Plan 必须利用既有产物授权直接修订项目事实和已定需求足以确定的问题，无需用户另行调用 Check 或逐项批准。新需求、重大取舍或无法解决的证据冲突必须保留为具体待决项，同时完成其他独立且确定的修订；finding 自身不得扩张写入权限。修订后仅回读并定向核对原发现及受影响的关联内容，分别报告原审计 verdict 与修订验证结果。旧版本 verdict 不覆盖修订版本，不得把定向自检改称新独立 `pass`，未解决缺陷或证据不足必须继续可见；规划审计和修订不得生成 implementation candidate、正式 acceptance 或 `done`。
Verify: manual(integration)

### Requirement: 仅 local 与 both 产出本地方案

`local` 与 `both` 产出的方案必须包含 change type、边界、路径级步骤、独立 verify、整体验证和适用的专属证据，且不得含意图级占位符；每个实施步骤与条件段必须可追溯到既定目标、验收或必要支撑工作，不得把偶然发现或可选完善提升为方案范围。Architecture、Rollback 等条件段只有在既定 outcome 或权威项目契约要求时才能描述 transition、migration 或恢复，不得把 safe migration 当作默认完整性要求；`both` 必须在任何 Issue mutation 前完成本地写入，`issue` 不得写项目文件。

(Previously: `plan 始终先产出本地方案` 要求所有调用先写本地方案。)
Verify: manual(integration)

### Requirement: local plan 区分实施授权、candidate 与独立验收

本地 plan 必须支持 `draft → approved → candidate → done`：新 plan 是 draft；显式用户请求或仍处于执行中的 Implement authorization 产生 approved；Implement 记录可稳定复算的 candidate basis、本地 evidence 与限制后产生 candidate；只有 acceptance-scoped Check 对同一 basis 返回 pass 与 `attested for the exact current candidate` 才产生 done。普通 scoped pass、findings 或 inconclusive 必须保持 candidate；finding 只否定 acceptance，不得产生 approved 或 repair authority。candidate/done plan 必须保存一个最后获授权投影的 time-scoped Assurance snapshot，包含 basis、Implement producer、evidence/limitations、Check producer、verdict 和 acceptance，授权投影变化时替换而不追加 ledger。任何状态都只是其有权 producer event 的投影，不得由 plan artifact 自行产生 authority。legacy `done` 缺少完整 Assurance 时只能解释为 historical implementation completion、acceptance not established，不得从状态或 artifact existence 伪造/回填 basis、producer、verdict 或 acceptance。带完整 Assurance 的 done 也是 exact accepted candidate 的历史 closed record，不证明不存在 later result；消费者声明 current acceptance 前必须核对 basis，并使用当前上下文可得的 latest applicable Check result，无法建立 applicability 时只能报告历史 snapshot 或重新 Check。后来 finding 在携带它的上下文/Handoff 中 supersede 旧结果，但不得修改/静默重开 plan 或授权修复；持久化 globally latest validity 需要另行授权 writer/ledger，不属于本契约。无关联 plan 的直接 Implement 不得为了记录这些状态自动创建 plan。 普通 scoped Check 可省略正式 provenance/acceptance 字段，caller 只能记录实际 verdict 和未请求验收这一事实，不能补造 attestation 或投影 done；关联计划仍维持完整 Assurance schema。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: plan 不要求先运行 shape

plan 必须复用已有 shape 结论，但不得把 shape artifact 或调用历史设为门禁；`local` / `both` 的 change 已达到实施成熟度，或 `issue` 的 problem 已足以准确记录时，必须能直接按所选 target 持久化。
(Previously: 当前请求足够明确时必须能直接按所选 target 持久化工作，但没有按 artifact 职责区分“足够明确”。)
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: plan 保持既定决策、来源与范围

plan 必须把用户明确决定或同意的方向、约束与非目标作为 artifact 约束，不得静默重做、重新解释或打开；agent 从含糊上下文推断的偏好不属于既定决定。Design Summary、plan、代码或 merged artifact 只能传递其来源已有的 authority，其存在不得把未披露的重大选择升级为用户决定。用户否定一个前提时，plan 必须丢弃它并只重新判断实际依赖它的 artifact 内容。失败、歧义或必要状态缺失必须保持可见，不得被写成成功前提或未请求的替代路径；不得擅自增加 fallback、兼容层、迁移、双路径或 legacy path，只有明确用户决定或权威项目契约可以建立对应连续性要求，且各 artifact 仍遵守自身的问题/实施职责边界；已授权替换在没有该 authority 时必须保持 clean break。与方向一致的必要事实按 artifact 所需比例纳入，仓库可回答的事实和可逆实现选择由 agent 直接补全，旁支与可选优化必须排除。只有检查得到的仓库事实、既有契约或权威资料证明既定决定不可行、相互矛盾或具有实质风险时才可重新打开；生成阶段发现此类冲突时，plan 必须在初始 artifact mutation 前报告原决定、新证据与影响，并等待该决定重新收敛。生成后审计发现此类冲突时，保留具体待决项，先完成不依赖它的已授权修订，不擅自决定冲突。Shape artifact 不是 Plan 的入口门，Plan artifact 也不授权 implementation。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: 四种共享变更类型决定产物证据

plan 必须从共享真源为每个 work item 选择恰好一个 `fix`、`feat`、`refactor` 或 `perf`。本地方案使用对应的 root-cause/regression、interface/acceptance、invariant/coverage 或 baseline/target/measurement 质量门槛；每个 Issue 使用同一类型的 single lowercase label 与 problem-evidence schema，不得借分类选择 target structure、未来工具或实现方式；brainstorm 不是 plan mode。

(Previously: 每个 Issue 使用同一类型的 single lowercase label 与 semantic schema，但 schema 没有排除 target structure、未来工具或实现方式。)
Verify: [plan Issue projection contract](../../tests/plan.test.ts)

### Requirement: Issue 是显式 target 产物

Issue 只能由 `issue` 或 `both` target 创建或复用，只有 `both` 可以跨调用同步已证明由 Plan 管理的 paired problem record；纯 `issue` 的修订权仅限本轮明确成功批次中确定创建、基线匹配的内容。`both` 的 CLI、认证、仓库、权限、label、网络、Issue create/edit、所有权或 digest 失败必须保留有效 plan 并把生成结果报告为 `partial`；`issue` 必须按自己的 ledger 报告结果，不得降级为 `local`。审计和修订必须保留这些原始结果。
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: 一个 local plan 最多关联一个 Issue

一份 local plan 必须以 frontmatter 中已有或用户显式提供并验证的 canonical Issue URL 为唯一身份；存在关联时必须保持该 identity，不得按标题搜索、猜测或创建替代 Issue。同一 bounded problem 的 managed content 可以由 `both` 修订；问题身份改变、拆分或合并必须在远程 mutation 前停止。`issue` target 的每个独立条目同样最多映射一个 canonical Issue，但一个明确批次可包含至多 20 项。

(Previously: canonical identity 必须复用，但与“既有 Issue 不得编辑”结合后使同一问题的内容也不可修订。)
Verify: [plan target contracts](../../tests/plan.test.ts)

### Requirement: 产物共享意图且不重复确认

`both` 的本地方案与 Issue 必须从同一问题、已知事实、外部约束和可观察结果渲染，但职责保持分离：Issue 只记录问题，本地 plan 承载方案、路径级 scope、顺序和验证。重写或审计修订 paired plan 时必须重新生成 Issue-owned projection；implementation-only revision 不触发 edit，同一问题的 projection 变化只在写入边界内更新受管内容。`issue` 必须从每个用户明确条目渲染对应 problem record。调用已经授权所选 target 的公开产出及本轮明确审计修订，除“plan 保持既定决策、来源与范围”定义的实质证据冲突外，不得另设理解卡或 prose 审批门槛；Issue 的所有用户可见字段使用用户当前语言，显式语言要求优先。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Requirement: Issue 只记录问题而不规定实现

`issue` 新建及 `both` 新建或同步的每个 Issue projection 必须记录问题或能力缺口、其重要性以及已知的可观察完成状态；可以包含有证据支持的背景、复现、现有测量、影响、外部约束、非目标和验收，但不得规定 technical approach、target architecture、待改 path/symbol、dependency choice、migration design、implementation order 或 test implementation plan。未知 solution 必须保持未知，不得为填满 schema 而变成调查、测量或实现任务；只有对应类型的 problem section 必填，其余 section 必须在有事实支持时才出现。
Verify: [plan Issue projection contract](../../tests/plan.test.ts)

### Requirement: paired Issue 受控同步且保护外部编辑

`both` 创建的 paired Issue 必须用 versioned managed block 标识 Plan-owned title、单一 change-type label 与 problem body，并以 canonical title/type/body 的 SHA-256 验证写入基线。同步必须保留 block 外正文、comments、无关 labels 与项目管理字段；marker 缺失、版本未知、边界异常、type label 不一致或 digest mismatch 必须在 edit 前返回 `conflict`。每次 edit 后只允许按 canonical URL 回读一次，不得盲目重试：生成阶段目标投影与 digest 完整匹配为 `updated`，非成功调用且原状态完整保留为 `failed`，部分、其他或不可核实状态为 `unknown`。审计修订须额外验证当前受管投影仍与审计基线匹配且问题身份未变，保留写前回读时 block 外正文；只有原始远程事务明确成功且没有停止条件才可追加至多一次修订 edit，不能借审计恢复原始失败、冲突或歧义。修订回读须核对完整目标投影、受保护内容和所需 digest，完整目标匹配为 `corrected`，确定失败且完整原状态保留为 `failed`，其他或不可核实状态为 `unknown`。修订调用一旦失败或模糊，即使回读为 `corrected`，也须停止后续远程修订；回读不是 GitHub 原子 compare-and-swap。显式 adoption 是未受管 Issue 建立基线的唯一入口，审计 finding 不提供 adoption 授权。
Verify: [plan paired Issue synchronization harness](../../tests/plan-paired-issue.test.ts)

### Requirement: Issue 保持安全且范围有限

Issue 必须只管理与 change type 相同的一个 lowercase label，使用 problem-oriented semantic schema 和安全 body file；所有 GitHub access 先核验 active account，case-only label collision 必须在 Issue mutation 前停止，生成与修订阶段已创建的 labels 必须在所有完成或失败结果中准确报告。`local` 不得执行 GitHub mutation，`issue` 仅可按本轮成功批次的创建快照修订新建 Issue，调用前已有的 reused Issue 保持只读，`both` 只能编辑已验证 managed envelope 和适用基线的 paired Issue；任何 target 都不得管理 Projects、状态、milestone、assignee、sub-issue 或 dependencies。修订不获得其他 labels 或项目字段的写入权。GitHub provider 调用细节必须位于 target references 与共享 audit reference，而非主 SKILL；各 target 定义所有权与生成事务，共享 audit reference 定义远程修订过程及结果。`local` 仅在存在 canonical URL 时条件式认证，`both` 必须按显式 repository、canonical URL 所属 repository、当前 repository 的顺序解析身份，临时 body file 必须在成功、失败或结果模糊后清理。生成阶段 label 创建失败必须映射到首个依赖该 label 的 `failed` row，保留 `reused` rows，并把其余 create candidates 标记为 `not-attempted`；修订阶段 label 失败保留原始 ledger，记录修订失败并停止后续远程修订。
Verify: [plan Issue projection contract](../../tests/plan.test.ts)
