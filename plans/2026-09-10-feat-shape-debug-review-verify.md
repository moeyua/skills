---
mode: feat
title: 澄清意图、诊断原因与审阅验证的能力边界
created: 2026-09-10
status: candidate
issue: https://github.com/moeyua/skills/issues/56
---

# 澄清意图、诊断原因与审阅验证的能力边界

## Building

让 Agent 能通过具体、可回答的追问帮助用户形成判断，澄清意图及关键设计；遇到行为异常时能够基于证据定位原因，并在已有修复授权内继续完成修复；让审阅问题与验证结果具有清楚、可独立调用的能力边界。

这是一次围绕开发判断职责的完整调整：重做 Shape，新增 Debug，以 Review 和 Verify 替换 Check，并同步实际消费者、Specs、公共索引和必要测试。计划依据本次已确认的设计及当前项目事实，实施起点为 `3877ad11f43f221f98b41fa2f1c8db05be1a1c27`；开始实施时核对当前差异并保留其他工作。

## Not building

- 不移除其他低频 Skill，不按单元测试、集成测试、E2E 分立公共入口。
- 不保留 Check 别名、转发入口或并行旧路径，不新增通用调度层或固定全流程。
- 不重做 Plan 的 artifact target、Issue 事务和产物格式，不改变 Explore 的固定 Overview。
- 不新增评测框架、依赖、持久记忆类别或研究文档，不全面重写无关测试。
- 不自动安装到全局技能目录，不提交、推送、创建 PR 或发布版本。本计划生成与审计不授权实施。

## Key decisions

1. **Shape 帮助形成判断。** 先弄清具体困扰、想获得的结果及重要约束，不能把用户提出的机制直接当作已定方案。每轮提出所有互不依赖、当前可回答的实质问题；依赖前面答案的问题留到后续。问题须有足够上下文，说明不同答案会改变什么；存在选择时给出有理由的建议，不能要求用户先掌握设计方法才能回答。
2. **不知道也是有效输入。** 用户说“不知道”“纠结”时，通过具体场景、反例、后果比较或有助判断的预览继续澄清，避免换个抽象说法重复提问。依据答案更新判断，仅重开被新信息影响的选择。目标和约束足够清楚后提出暂定方向，再检验关键设计；已清楚的需求直接推进，不设固定轮数或必答题数。
3. **Debug 独立，Implement 负责做完。** Debug 提供可单独调用、可在修复中复用的诊断方法，不承包一套实现流程。Implement 保留代码、回归测试、直接受影响文档及结果交付的写入责任；同一 Agent 可先诊断再修复，不必换 Agent 或制造交接。临时探针和实验改动使用当前任务已有权限，Debug 不凭调用自身扩大权限。
4. **Review 与 Verify 按问题区分。** Review 判断设计、计划或改动有什么需要纠正及其原因；Verify 判断指定结果是否有足够证据。两者都可阅读代码、运行相关验证，不把工具种类当作专属边界。Review 可以运行测试来证实发现，Verify 可以组合 Review 来支持结果判断。
5. **正式验收归 Verify。** Plan 的生成后独立审计改用 Review。正式实现验收由独立 Verify 建立完整候选依据；普通 Review 或 Verify 不强制独立 Agent，也不因一次通过产生 `accepted` 或 `done`。发现问题只提供证据，不产生修复授权。
6. **保留已经明确的边界。** Shape 继续必经当前目标项目的 Explore，保持只读及可审阅的 Design Summary；总结说明目标、取舍原因、支持目标的关键设计与真正未决项。复用既定决定，不将同意方向升级为实施授权。替换入口时保留历史记录原来的来源和时间范围，不把旧结论改写成新能力出具的证明。

## Interface boundary

| 入口      | 输入和适用问题                             | 可观察结果                                                                                | 副作用与组合边界                                                                   |
| --------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Shape     | 意图或关键设计仍不清楚，包括不知道如何选择 | 能接着回答的问题、逐步形成的判断、最终 Design Summary；事实与未决选择可区分               | 只读；Explore 返回后继续对话；不提前写方案或代码                                   |
| Debug     | 已知预期与实际存在偏差，原因尚未建立       | 已知现象、可推翻的假设、观察证据、因果判断及回归场景；证据不足时说明未知                  | 独立诊断按请求结束；在修复任务中返回 Implement；不自行授予持久修复权限             |
| Implement | 已授权的新增、修改或修复                   | 工作行为、相称证据与必要文档；有计划时维护真实生命周期                                    | 需要诊断时用 Debug，审阅时用 Review，结果验证时用 Verify；支持调用结束后继续原任务 |
| Review    | 设计、实际计划/Issue 或代码改动的质量问题  | 一个限定范围的 `pass / findings / inconclusive`；按影响排列的可操作发现、依据和修正方向   | 只读；可以观察项目，不能修源码、测试或产物；规划审计回到 Plan 修订                 |
| Verify    | 指定行为、测试结果、用户路径或验收主张     | 一个限定范围的 `pass / findings / inconclusive`，实际证据及缺口；正式验收才附完整证明字段 | 只读；启动失败不授权修配置；证据不足不缩小用户原主张后声称通过                     |

Debug 在修改前核对预期与实际，检查相关项目契约、源码和适用的文档、类型或变更记录。优先建立能区分故障存在与否的反馈信号，尽可能缩小触发条件；根据本地证据排列可证伪假设，用能区分原因的观察或实验推进，并随反证更新。缺少稳定复现时可继续缩小不确定性，但不能虚构复现成功、把猜测写成根因或盲目补丁。回归场景必须能区分原故障；修复完成还要重放原始触发路径。

Review 的普通通过仅表示实际审阅范围内未发现可操作问题。Verify 对原主张负责，综合有关观察和 Review 发现；不能把代码看起来合理等同于运行结果已经得到证明。两者复用有效事实、只补缺口，不无条件要求 Explore 或全面检查。

## Architecture

当前共有 11 个公共 Skill。Shape 的实质选择原则尚不足以指导多轮意图澄清；Explore 的调试排除项仍指向 Shape。Check 同时承接审阅、运行验证、规划审计和正式验收，Implement 直接组合这个入口。目标是 13 个公共 Skill，仍以入口描述发现能力、条件加载必要 references，不引入运行时路由。

```text
用户的未决意图 -> Shape <-> Explore
                    |
                    +-- 已定方向 + 另行授权 --> Plan 或 Implement

Plan ------ 实际产物及原始依据 ------> Review
  ^                                    |
  +----------- 审阅结论 ----------------+

Implement -- 现象及原始预期 --> Debug -- 因果证据 --> Implement
    |
    +-- 候选改动 --> Review -- 发现及建议 --> Implement
    +-- 指定主张 --> Verify -- 证据及结论 --> Implement
                       |
                       +-- 需要审阅证据 --> Review
```

- 将现有 `skills/check/references/review.md` 的有效判断方法归入 Review；将 test、e2e 和 acceptance 方法归入 Verify。按新职责重组而非复制一套互相矛盾的入口说明；Verify 需要审阅时组合 Review。最终删除 `skills/check/` 与 `specs/check/`。
- Plan 的独立审计只更换能力归属，保留一次独立审阅、原始证据和实际产物、调用方修订、定向核对、生成/审阅/修订结果分开报告的契约。支持定位优先同安装集合，再查宿主已有位置；不自动安装；能力、独立上下文或证据缺失继续明确报告。
- 正式验收协议由 Verify 持有；候选依据、证据不足处理、独立上下文、精确 verdict 与 acceptance 组合、依据变更失效规则保持有效。新的 Assurance 将 `Check producer` 改为 `Verify producer`，其 Verdict 记录 Verify 结果；普通 Review 结果作为实际审阅证据报告，不冒充 Verify。后续 Review 发现与原通过冲突时，消费者不得继续声称当前验收成立，须处理冲突或取得适用的新 Verify。
- Plan、Implement 的 lifecycle 和 Assurance 生产/消费契约同步调整；Publish、Release、Handoff 只保留实际来源与适用范围，交付状态不补足验收。历史计划原字段、来源及结论不批量重写或反向补证。本计划本轮仍由当前 Check 审计，该审计不得改称 Review 或实现验收。

## Public surface changes

- 新增 `debug`、`review`、`verify`；删除 `check`。最终入口集合为 `converge / debug / docs / doctor / explore / handoff / implement / plan / publish / release / review / shape / verify`。
- Shape 的描述及正文体现意图澄清与关键设计追问。Explore 将诊断引导至 Debug、未决意图引导至 Shape；Doctor 的变更审阅排除项引导至 Review，结果验证引导至 Verify。
- Plan 的必需配套能力为 Review；正式验收使用 Verify。安装说明、Resolver、PRODUCT 和 ARCHITECTURE 的公共列表、调用关系及验收来源与实际入口一致。
- 当前计划模板及生产/消费说明改用新的验收来源字段。历史记录只作为其原来时间点的证据，不提供旧入口或旧字段的写入兼容层；需要当前验收时按现行协议重新建立依据。

## Implementation steps

1. **完成 Shape 的可执行对话方法。**
   - outcome: 能从具体困扰出发按轮澄清意图与关键设计，遇到不知道时继续帮助判断，同时保留 Explore、只读和 Design Summary 边界。
   - scope: `skills/shape/SKILL.md`、必要的 Shape reference、`specs/shape/spec.md`；仅调整直接约束该行为的现有测试。
   - verify: 用 Acceptance scenarios 的 S1–S3 作实际对话观察，检查追问是否可回答、是否利用答案推进；运行受影响的结构测试。无前置步骤。
2. **加入 Debug，并接入授权修复。**
   - outcome: 可单独获得有证据的诊断，也可在同一 Implement 任务内完成诊断、修复和原症状复验。
   - scope: `skills/debug/SKILL.md`、必要 reference、`specs/debug/spec.md`、`skills/implement/SKILL.md`、`specs/implement/spec.md`、`skills/explore/SKILL.md`、`specs/explore/spec.md`，以及公共入口/Spec 配对列表和相关结构断言。
   - verify: D1–D3；入口及 Spec 配对检查。依赖步骤 1 的 Shape 边界，以便对预期未定的情况正确分工；不移动既有实现写入责任。
3. **在同一完整改动中替换 Check 及其消费者。**
   - outcome: Review 与 Verify 可分别调用，Plan 完成一次独立 Review，正式验收由 Verify 出具；不存在仍要求旧公共入口的活动契约。
   - scope: 新增 `skills/review/`、`skills/verify/` 及对应 Specs，删除 Check 及其 Spec；同步 `skills/plan/SKILL.md`、`skills/plan/references/audit.md`、`target-issue.md`、`plan-template.md`，Implement 的入口及 `references/assurance.md`，Explore、Doctor、Publish、Release、Handoff 中实际涉及旧能力的入口和 references，以及对应受影响 Specs、公共列表和 `tests/attestation.test.ts`、`tests/plan-audit.test.ts`、`tests/plan.test.ts`、`tests/implement.test.ts`、`tests/development-integrity.test.ts`。
   - verify: R1–R2、V1–V3、C1–C2；运行受影响测试及完整公共配对检查；按语义核对旧入口引用，不能误删普通英文 check、命令名或 Doctor checker。依赖步骤 2 的诊断/实现分工；删除旧入口与更新调用方一起完成，不保留中间兼容层。
4. **收敛公开说明及检查最终完整性。**
   - outcome: 所有当前文档和 Specs 描述相同的 13 个入口、组合及验收规则；机械检查与实际行为证据各自明确。
   - scope: `README.md`、`README.zh-CN.md`、`PRODUCT.md`、`ARCHITECTURE.md`、`skills/RESOLVER.md`，完成下列 Spec delta；仅修改受本次入口/字段变动影响的测试和链接。`tests/checks.ts`、Doctor 脚本与 Issue 事务模拟器原则上复用，仅在直接证据显示契约需要时修改。
   - verify: 执行 Verification；核对修改范围；记录实际对话、诊断、审阅和验证的结果及缺口。依赖步骤 1–3；README 安装示例可检查但不执行全局安装。

## Spec delta

以下名称是各域的持久 Requirement 名称；新增条目落入对应新域，每条保持一个准确的 `Verify:` 声明。对话判断采用 `manual(integration)`；结构/状态检查只有实际测试覆盖时才链接测试。

| 域        | 操作     | Requirement 与变化                                                                                                                                                                                                                                                                   |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| shape     | MODIFIED | `outcome-first 且严格只读`：以具体困扰和期望结果为起点；`复用既定决定`：答案更新判断，只重开受影响项；`只处理实质决策前沿`：按轮提出当前可回答的独立问题，关键设计随判断推进；`会话结论必须通过 Design Summary 审阅`：说明目标、原因和关键设计的关系，保留原审阅及授权边界           |
| shape     | ADDED    | `不确定回答通过具体情境继续澄清`：对不知道、纠结及难以接话的反馈提供场景、后果和有理由的建议                                                                                                                                                                                         |
| debug     | ADDED    | `诊断以预期偏差和本地证据为基础`；`反馈信号与可证伪假设驱动调查`；`诊断结果区分因果证据与未知`；`诊断支持调用不扩大修复授权`：分别覆盖现象与依据、复现及实验更新、结论与回归场景、独立诊断和 Implement 内组合                                                                        |
| review    | ADDED    | `只审阅不修改`；`审阅围绕原始目标与实际产物`；`发现必须可操作且有证据`；`审阅结论限定范围并返回调用方`：覆盖设计/代码/规划、完整实际产物、独立规划审阅的证据及版本、问题记录边界和三种结果，不产生实现验收                                                                           |
| verify    | ADDED    | `只验证不修改`；`验证方法由主张和风险决定`；`验证结论只覆盖实际证据`；`accepted 和 done 需要独立 Verify attestation`；`验收结果由 caller 按依据机械投影`：承接适用测试与真实路径、条件组合 Review、缺证据、正式协议及失效规则                                                        |
| check     | REMOVED  | 删除该域全部现行 Requirement：`只校验不修改`、`evidence 由问题和风险决定`、`accepted 和 done 需要独立 Check attestation`、`项目上下文按缺口取得`、`各方法只加载相关 reference`、`verdict 只覆盖实际证据`、`verdict 只读且由 caller 机械投影`；按上述职责保留必要行为于 Review/Verify |
| implement | MODIFIED | `plan lifecycle 受显式实现授权约束`、`Implement 产生 candidate 而不自我验收`、`自主组合验证、独立验收与持久 truth`、`组合不放宽能力边界`、`完成状态和报告真实`：接入 Debug/Review/Verify，保持修复责任与真实结果，更新验收来源                                                       |
| plan      | MODIFIED | `产物生成后必须完成一轮规划审计`、`Plan 自动修订有证据且已获授权的审计发现`：独立 Review 与调用方修订；`local plan 区分实施授权、candidate 与独立验收`：Verify 结果、Assurance 字段与生命周期一致                                                                                    |
| explore   | MODIFIED | `严格只读且不替其他能力判断`：诊断与未定方向分别由 Debug 和 Shape 承担，保持原只读事实边界                                                                                                                                                                                           |
| publish   | MODIFIED | `发布状态不升级实现验收`：保留实际 Verify 来源及依据，不以发布证明验收                                                                                                                                                                                                               |
| release   | MODIFIED | `release state 不替代实现验收`：来源改为 Verify，保留交付与验收边界                                                                                                                                                                                                                  |
| handoff   | MODIFIED | `摘要保留来源但不创造 authority`：保留新的实际来源、冲突证据和历史来源，不补造证明                                                                                                                                                                                                   |

## Acceptance scenarios

| 编号 | Given / When                                                                 | Then                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| S1   | 用户只说某个流程难用，并提出一个可能的拆分方法；当前项目事实可访问           | Shape 先调查事实、澄清具体困扰与目标；同轮提出互不依赖且当前可回答的问题，不能立即给完整实施方案，也不能把能查到的事实交回用户                   |
| S2   | 用户对一个关键选择说“不知道”；回答一个问题后改变了后续设计前提               | Shape 用具体情境和后果帮助判断，给出有理由的建议；随后利用答案推进，只重开受影响项，不重复未受影响的已定选择                                     |
| S3   | 用户意图已清楚，或已接受一次 Design Summary；后来纠正其中一项                | 复用有效 Explore 事实，不强制重新访谈；仅更新受纠正影响的判断和 Summary；方向同意不产生项目写入或实施授权                                        |
| D1   | 已授权修复一个有明确预期和可观测故障的问题                                   | Implement 使用 Debug 建立信号、验证原因，完成必要代码及回归测试，再观察原始触发路径；不会在诊断结束后要求重新授权同一修复                        |
| D2   | 用户只要求定位原因，未授权持久修复                                           | Debug 返回原因证据、回归场景或明确未知；不擅自修改源码/测试，不把暂定假设写成确定根因                                                            |
| D3   | 无稳定复现，或新证据推翻原假设；另有情况连预期行为也未定                     | 继续能缩小原因范围的观察，明确缺口并更新假设；预期未定的语义选择交由 Shape 澄清，不使用猜测性补丁代替诊断                                        |
| R1   | 请求审阅一个改动或设计，其中存在能由源码、契约或运行观察证实的问题           | Review 报告具体影响、位置或可定位对象及修正方向；允许必要测试，但不写补丁；无发现的结论仅覆盖实际审阅范围                                        |
| R2   | Plan 已生成本地、Issue 或成对实际产物，含未跟踪文件或部分失败                | 独立 Review 按原始请求和实际产物版本审阅；Issue 不被要求含实现方案；结果返回 Plan 修正授权范围内发现并定向核对，不开始第二次完整审阅或升级 draft |
| V1   | 请求验证指定行为或运行测试；只有部分相关测试通过，关键用户路径失败或不可运行 | Verify 明确实际覆盖和缺口；有可证实缺陷报 findings，必要证据取不到报 inconclusive，不以局部通过替代原主张，也不修改配置来制造通过                |
| V2   | 请求正式验收，候选完整依据可建立且可独立观察                                 | 独立 Verify 自行决定足够证据并出具精确依据、来源、verdict 与 acceptance；只有相同依据的 pass 加正式 attestation 才允许调用方投影 done            |
| V3   | 正式验收缺独立上下文、完整依据或必要证据；或普通审阅/测试已通过              | 前者返回 inconclusive 且 acceptance 未建立；后者不变成正式验收。后续编辑或相冲突的 Review 发现不能继续沿用原通过来声称当前验收                   |
| C1   | 从入口描述及 README 安装示例发现能力，或其他 Skill 请求支持                  | 发现 13 个入口及匹配 Specs；Plan 找到 Review，正式验收找到 Verify，调试找到 Debug；找不到必需支持时明确报告，不安装或转回旧入口                  |
| C2   | Publish、Release 或 Handoff 接到普通结果、正式结果或旧计划记录               | 保留实际证据和原来源的适用范围；历史 Check 记录不被改写为 Verify，交付成功和旧 done 不补出当前验收                                               |

## Verification

- command: `./node_modules/.bin/vp test run`，覆盖受影响结构、入口发现、Spec 配对、Plan 审计与生命周期契约；断言目录、链接、状态与字段等机器契约，不新增仅匹配行为措辞的测试。
- command: `./node_modules/.bin/vp check --fix`，使用项目既有检查入口；仅在实施阶段运行，之后核对自动修改范围。
- command: `node skills/doctor/scripts/checker.ts . --json`，检查 Specs、当前文档链接及机械问题；区分新问题和既有问题。
- command: `git diff --check`，并检查未跟踪文件。通过当前活动文档和测试中的 Check 引用清单做语义核对，保留历史证据、通用英文及既有命令。
- checklist (manual):
  - [x] 在临时项目和独立短会话中实际运行 S1–S3：四轮对话涵盖具体困扰、未知选择、明确方向及单项纠正，项目文件无写入。
  - [x] 运行 D1–D3：只读诊断后在同一任务中授权修复，回归与原路径通过；缺复现案例继续调查、保留未知并区分未定产品语义。
  - [x] 覆盖 R1–R2：完整仓库改动独立审阅通过；成对规划样例查出不能区分故障的验证要求和问题记录遗漏的明确约束，无文件或远端写入。
  - [x] 覆盖 V1–V3：检测局部测试通过但目标失败、正式证据缺失、完整候选通过及依据变化后的回归。C1 的入口/支持定位通过结构及实际调用验证，C2 的旧来源与新冲突通过 Handoff 场景验证。
  - [x] [验证记录与隔离夹具](/Users/moeyua/.codex/visualizations/2026/09/10/01a089ce-c399-7f52-9146-4198e776f56c/skill-validation/observations.md)保留输入、可见轨迹、结果与限制。未穷尽支持 Skill 缺失等宿主故障路径；没有真实发布或生产操作，没有新增框架。

Plan 阶段完成计划与对应 Issue 的独立审阅，生成时状态为 `draft`。用户随后明确调用 Implement，实施及上述验证已完成；以下记录本次候选及其证据，不将隔离夹具的正式验收投影为本项目验收。

## Assurance

- Candidate basis: base `3877ad11f43f221f98b41fa2f1c8db05be1a1c27`，完整变更清单 SHA-256 `bfaa99b34903733b2d9fed86c6ab794479a181a15e9df0e53af0efd636954320`；涵盖 46 个路径的内容、删除及 Git 文件模式，本计划仅排除 status 和本节并规范化末尾换行。[候选清单](/Users/moeyua/.codex/visualizations/2026/09/10/01a089ce-c399-7f52-9146-4198e776f56c/skill-validation/candidate-basis.json)与[复算脚本](/Users/moeyua/.codex/visualizations/2026/09/10/01a089ce-c399-7f52-9146-4198e776f56c/skill-validation/recompute-basis.mjs)保留在项目外。
- Candidate producer: Implement
- Evidence and limitations: 17 个测试文件、170 项测试通过；格式、lint、类型、Doctor、差异检查及 8 个受影响入口的 Skill Creator 校验通过。独立 Review `/root/implementation_review` 对完整改动返回 pass，无待修订发现。普通 Verify 结合实际隔离场景给出下述 scoped verdict；[行为记录](/Users/moeyua/.codex/visualizations/2026/09/10/01a089ce-c399-7f52-9146-4198e776f56c/skill-validation/observations.md)说明实际输入、结果和未穷尽范围。隔离候选的正式验收不适用于本项目；未更新全局安装，也未执行发布或生产操作。
- Verify producer: none
- Verdict: pass
- Acceptance: not requested
