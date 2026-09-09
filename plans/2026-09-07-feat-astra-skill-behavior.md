---
mode: feat
title: 以 GPT-6 Astra 校准全部 skills 的执行与验证行为
created: 2026-09-07
status: candidate
issue: https://github.com/moeyua/skills/issues/48
---

# 以 GPT-6 Astra 校准全部 skills 的执行与验证行为

## Building

围绕 GPT-6 Astra 的指令敏感性、持续执行、表达、委派和验证特征，检查仓库全部 11 个公共 skills 及其可达指令，消除会导致无谓确认、提前结束、重复检查和过重报告的含糊规则。保留一套通用 skills，以 Astra 作为主要优化和验收模型。

普通实现与检查使用与任务相称的证据和报告；正式独立验收保留完整协议。通过固定条件的修改前后会话比较证明行为变化，并保持现有高后果授权边界。

本计划记录用户在本会话中已同意的 Design Summary。用户随后显式调用 Implement，授权按本计划实施；不包含全局安装或 git 交付。

## Not building

- 不建立 Astra 专用分支、模型路由层或多套 skill 文本。
- 不修改 Codex/Claude Code 的系统提示词、权限、模型配置或 API runtime；不把 async tool calling、WebSocket 或 reasoning 参数配置写成 skill 具备的能力。
- 不更改 11 个公共名称、六类 memory catalog、Explore 固定 Overview、Shape 的只读设计审阅、Check 的只读职责，以及 Plan/Publish/Release 的外部副作用归属。
- 不放宽用户改动归属、secrets、clean break、Issue identity/ownership、git 历史或 Release 确认和恢复约束。
- 不把此次文本审查中的风险描述为已经复现的 Astra 缺陷，也不预设 token 或耗时改善百分比。
- 不新建评测产品、自动发布测试平台、通用编排引擎或全局规则前言；不升级无关依赖。
- 不批量改写历史 plans，不把动态评测记录写入新增的项目持久文档类别，不覆盖全局已安装 skills。

## Evidence and authority

- 用户已确认：一套通用 skills、Astra 优先；完整验收协议按需启用；普通实现与检查减轻报告负担；全面检查 11 个 skills 和关联内容，以行为评测验证且保留高后果边界。
- [官方 Astra 指南](https://developers.openai.com/api/docs/guides/latest-model) 已在 2026-09-07 读取。相关建议包括审查影响模型的指令、减少不必要暂停、明确写作与委派偏好、校准验证范围。该链接随最新模型变化，评测记录须注明本次依据为 GPT-6 Astra 章节和读取日期。
- [官方 Skills 文档](https://learn.chatgpt.com/docs/build-skills) 支持 description 路由及按需加载 SKILL.md/references。现有 [PRODUCT](../PRODUCT.md) 和 [ARCHITECTURE](../ARCHITECTURE.md) 已采用相同的轻量入口与自主组合方向。
- 规划时源码基线为 `56427bcf6496c3f9d73126d0374de59cd2486add`，工作树干净。它是 before 语料来源，不是行为已通过的证明。
- [Implement](../skills/implement/SKILL.md) 同时要求自主完成、允许范围内修复，并包含同一 finding 无新证据再次出现时停止的指令；其适用范围需要收窄为停止盲目重试，不能阻断可行的新调查。
- [Check](../skills/check/SKILL.md) 对普通 scoped pass 也要求稳定 candidate basis、producer 和 acceptance field；[Implement](../skills/implement/SKILL.md) 在没有 plan 时仍要求同类报告。用户已授权改变这些普通场景的可观察契约。
- [bench](https://github.com/moeyua/skills/blob/56427bcf6496c3f9d73126d0374de59cd2486add/bench/README.md) 当前仅评 shape；[Codex driver](https://github.com/moeyua/skills/blob/56427bcf6496c3f9d73126d0374de59cd2486add/bench/src/driver/codex.ts) 从全局安装路径读取 shape；[judge](https://github.com/moeyua/skills/blob/56427bcf6496c3f9d73126d0374de59cd2486add/bench/src/judge/spec.ts) 固定读取 shape spec。只改源码、只跑现有字符串断言或只换 `--model` 不能证明本次目标。

## Key decisions

1. 全面检查不等于每个文件必须重写。逐个记录入口、可达 references、暂停、验证、输出与组合条件的保留/调整结论；删除重复或失效规则，保留仍有领域价值的内容。不按统一行数、压缩比例或模板评价质量。
2. 授权判断服从当前用户请求、已定决定及适用的更高优先级宿主约束。Skill 指导不能覆盖明确用户指令，也不能赋予工具或操作权限。事实缺口主动调查，重大意图或未获授权的副作用才形成用户决策点。
3. 支持能力返回结果不等于整个任务结束。仍在执行的调用方继续完成已授权范围；单独调用 Shape、Check、Doctor 等能力仍止于各自结果，不自动修复或实施。
4. 拒绝同一命令的无证据循环，同时允许继续读日志、检查实现、改变诊断假设和修复。阻塞只限制依赖该条件的工作；已授权且不依赖该条件的工作继续推进。失败和不可得证据始终保持原状态。
5. 已有测试和必要检查通过后，只有新编辑、失败或未解决风险才扩大或重复验证。保留按需 TDD；不为低影响改动编写复述实现的测试。
6. 在宿主支持且允许时，独立、边界清楚、能节省时间或改善判断的子任务可委派；说明产物和修改归属，由主 Agent 汇总和验证。顺序依赖强、共享编辑冲突或协调成本更高的工作本地完成。不设固定 agent 数量，不把完整历史 fork 当作独立验收。
7. 主文保留目的、关键判断、边界及加载触发条件；复杂验收和生命周期说明移到能力自有的条件 reference。每个 skill 单独安装后的引用仍须可解析，不新增必须预读的全局通用前言。

## Interface boundary

输入仍为直接请求、显式 skill 调用、当前会话决定及可选已有 artifact。公共名称和 Plan 的 `local` / `issue` / `both` 目标不变。

### 普通实现与检查

- 没有关联 plan、未要求正式验收的实现，报告做成了什么、相关改动、实际验证及重要限制；不强制创建 artifact、计算完整 diff 摘要或输出 producer/acceptance 表单。完成实现不能声称独立验收。
- 普通 Check 输出选定 scope、一个 `pass` / `findings` / `inconclusive` 结论、可操作证据和重要限制；不强制 acceptance field 或完整 candidate 身份。可用自然语言表达这些状态，但不能含糊地把局部通过称为整体验收。
- 广泛或高风险改动仍需相称验证，也可需要独立判断；规模本身不把普通结果自动升级成 `accepted` / `done`。

### 正式验收与关联 plan

- 用户要求正式独立验收、`accepted` / `done`，或权威项目契约要求该结论时，加载完整 Check 验收 reference：独立于实现轨迹的上下文、完整稳定 basis、producer/reference、精确 verdict 与 acceptance field、证据和限制全部保留。
- “pre-merge gate”覆盖其要求的完整检查范围；是否 attested 由其实际验收 claim 决定，不把每一次运行测试解释为独立验收。
- 关联本地 plan 的 `draft → approved → candidate → done` 和 `Assurance` 记录维持现有字段与生产者约束。仅把维护这一 artifact 的细节从普通入口中移出；不能因报告简化而省略已触发的生命周期责任。
- 普通 scoped pass 缺少正式 acceptance pair 时不能投影 `done`。调用方不得凭缺字段补造 attestation；正式验收缺少独立判断或匹配 basis 时返回 `inconclusive`，不退回普通 pass 冒充完成。
- 后续修改使旧验收对新版本失效；历史 `done` 不产生当前 authority，read-only Check 不回写 plan。已存在的正式记录保持原解释，不增设迁移或双格式兼容层。

### 交互、失败与输出

沿用当前用户语言，结果先行、短段落优先，列表只承载真正并列的信息。只呈现当前结果需要的字段；Issue、release set 等真实结构化接口仍满足各自格式。因 skill 指令暂停时给出该指令所在文件链接、短引文和适用原因，区分明确要求与 Agent 自己的解释。

需要新意图、发布身份或额外授权时，先完成不依赖该决定的已授权准备，再展示具体待决项；不提前执行依赖批准的动作。接到修正时更新受影响部分，侧问不丢失主任务，已完成且仍有效的工作不重复执行。

## Architecture

继续使用现有 Markdown 产品和开发期 bench，无生产运行时。入口与深层资料按职责分配：

    用户请求与当前授权
            |
            v
    description -> SKILL.md 的领域判断
                         |
                         +-> 触发时读取验收/格式/恢复 reference
                         |
                         v
                选定能力结果 -> 已授权调用方继续

Check 的正式验收可下沉至 `skills/check/references/acceptance.md`；Implement 的关联 plan 与验收消费规则可下沉至 `skills/implement/references/assurance.md`。这些是预定实现路径，现阶段尚未创建。Plan template 继续拥有 artifact schema；各消费者只说明自己的生产/消费义务，不复制完整状态协议。

开发期优先复用现有 normalizer、judge、reporter、fixture 和 CLI 登录。第一版保留 shape 自动驱动，扩展已有会话判卷到其他公共 skills，并用可重复的隔离会话补全覆盖；不要求实现所有副作用能力的通用自动驱动。其具体范围如下：

- `bench:judge` 增加显式 `--skill <公共名称>`，按该 skill 的 spec 判卷；已有本地调用点和文档同步为显式选择，不保留猜测 skill 的旧路径。driver 已知 shape 时直接传递 shape。
- 机械边界按被检查能力判断，不能把 Implement/Docs 合法写入套入 Shape 的零写入规则。只对工具输出可证明的事实下结论，缺证据单列。
- shape runner 的输入改为显式可记录的源码快照，默认当前仓库 `skills/`，支持选择只读 before 快照。使用临时项目级 skill 装载，核验实际加载路径和内容身份；不修改全局安装目录。
- 其他 skills 的会话使用同样的临时源码装载和场景约束，归档原始 transcript 后通过 `--skill` 判卷。需要正式独立验收的场景保留独立检查者证据；多能力组合场景按 owner 和授权范围解释支持调用。
- 报告携带目标 skill、源码内容身份、实际模型/推理设置、宿主/工具条件、fixture/scenario 身份与 judge/rubric 身份；不可观察项明确不可得。比较时按 skill 和 requirement identity 对齐，不把同名 requirement 或旧 rubric 的分数混合。
- 评测产生的 Issue/Publish/Release 外部调用仅在已有 stub/隔离 fixture 中观察；不会为评测对真实仓库做发布。宿主阻止越界只证明阻止发生，不能判模型主动守住边界。

## Implementation steps

1. 建立可重复的 before 证据与普通/正式结果的回归场景。
   - outcome: 原始 skills 可在隔离环境中明确装载；现有 shape 和其他 skill 会话可用同一套目标契约评价；before 原始记录在改写前保留。
   - scope: `bench/src/driver/codex.ts`、`bench/src/driver/claude.ts`、`bench/src/driver/common.ts`、`bench/src/cli.ts`、`bench/src/judge/`、`bench/src/checks/`、`bench/src/report.ts`、`bench/scenarios/`、`bench/fixtures/`、相应测试与 `bench/README.md`。只扩展上述必要输入、归属和记录能力。
   - verify: 用注入/fixture 测试证明读取指定源码、传递目标 skill、选对 spec、区分合法写入/越界、缺证据不判成功；运行现有 shape gold 校准。保存基线会话和配置身份，不能以模拟结果代替实际 Astra 行为。
   - prerequisite: 无；可先建立评测，不改产品 skill 文本。
2. 实现普通结果与正式验收的条件边界。
   - outcome: 普通 Implement/Check 不再承受完整验收表单；正式 attestation 与关联 plan 的 schema、生产者和状态约束仍完整。
   - scope: `skills/implement/SKILL.md`、`skills/check/SKILL.md`、其验收/方法 references、`skills/plan/references/plan-template.md` 的必要消费者说明、`tests/implement.test.ts`、`tests/attestation.test.ts`、`tests/development-integrity.test.ts`、对应 specs。
   - verify: 对照 Acceptance scenarios 的普通检查、正式验收、缺独立证据、已有 plan 和版本变化场景；链接/安装引用检查通过，普通 pass 无法产生 done。
   - prerequisite: 步骤 1 的回归输入与 before 记录已经确定。
3. 校准全部 11 个 skills 的执行、暂停、委派、验证与表达。
   - outcome: 每个入口和可达 reference 均有明确检查结论；支持调用正常返回后继续已授权工作；没有跨能力复制的通用大段提示词或无条件验证链。
   - scope: 下表中的全部公共 skill 及相关 references、`skills/RESOLVER.md`；`rules/change-types.md` 与 `rules/memory-catalog.md` 仅核对交叉语义，除直接矛盾外不改其分类/目录定义。
   - verify: 每个 skill 至少一个真实代表会话，关键相反场景覆盖必要暂停与不必要暂停；保留测试证明 Plan/Publish/Release 与只读边界不变。检查结论与 before/after 数据留在 `bench/results/` 的本次报告中。
   - prerequisite: 步骤 2 的报告与验收边界已生效。
4. 同步直接受影响的契约和项目说明，移除失效断言。
   - outcome: descriptions、Resolver、spec、reference 和产品说明表达同一边界；测试保护接口和高后果不变量，不以一段旧措辞代替行为证明。
   - scope: 下文 Spec delta 指定的 `specs/`、`tests/` 对应测试、`PRODUCT.md`、`ARCHITECTURE.md`、`README.md`、`README.zh-CN.md`、`bench/README.md`。只有内容已失真时才编辑；ROADMAP 和历史 plans 不作批量同步。
   - verify: `pnpm test`、`pnpm lint`、`pnpm check` 和 Doctor checker；检查 `pnpm check` 的自动修复 diff 仍在授权范围内。每个 Spec requirement 恰好一个有效 Verify，11 个 skill/spec 仍精确配对。
   - prerequisite: 步骤 2、3。每个行为变更应在该步同步对应 spec；本步是全局一致性收口，不允许前面长期留下矛盾契约。
5. 完成 Astra 前后比较与独立验收。
   - outcome: 在相同模型、推理强度、工具、场景和评价契约下，证明新行为符合已确认目标；无法取得的证据如实保留，最终不超出已证明的范围。
   - scope: `bench/results/` 本次记录、必要的 `bench/golden/` 校准、此计划关联状态与 Assurance。
   - verify: 完成下面的 Acceptance scenarios 和 Verification；对关键普通/正式场景各重复三次，其他能力至少一次；独立 Check 核对完整候选变更和实际评测证据。只在修正或未解决风险要求时扩大复测。
   - prerequisite: 步骤 4；若判卷 prompt/schema 变化，先完成 gold 校准再比较。

### 全部 skill 的检查重点

| Skill     | 检查与调整重点                                               | 必须保留的边界                                                           |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| explore   | 复用仍有效的上下文；context 返回后调用方继续；按范围停止深入 | 固定 Overview、必要全局文档、只读、事实与文档 claim 可区分               |
| shape     | 只问实质决策；减少已定内容的重复确认；摘要只含适用内容       | 只读 Design Summary、同意不等于实施授权                                  |
| plan      | 沿用已定方向；明确本地/远程依赖的停止点；不增加二次文案批准  | 默认 both、local-first、cardinality、Issue identity/ownership 和失败状态 |
| implement | 主动完成、继续诊断、支持调用后修复、按风险验证、简洁结果     | 修改归属、工作分支、范围、证据真实、正式验收不能自签                     |
| check     | 普通 verdict 与正式 attestation 分开；方法/独立判断按需      | 只读、不授予修复权限、正式验收的完整 basis 与独立性                      |
| docs      | 只处理直接目标；无关 claim 缺 authority 不阻断其余有效工作   | 记录已有 truth、六类 catalog、不能以代码发明产品意图                     |
| publish   | 明确已授权阶段持续推进、状态已满足时不重复做；精简报告       | 显式 staging、保护历史和用户改动、部分成功、不能升级验收                 |
| release   | 清晰区分 exact 可执行与 derived 待确认；保留可恢复准备       | 既有所有发布 predicate、跨轮确认、无隐式扩大 release set                 |
| converge  | 来源明确的文件自主完成，阻塞只限相关文件，报告精简           | authored meaning、缺 sibling asset 即停、catalog 和幂等                  |
| doctor    | 按 scope 选择 probe；缺前置按契约 skip；报告可行动证据       | 全项目只读、docs-vs-code 主问题、不能自动修复                            |
| handoff   | 仅在继续工作确实依赖时携带验收详情；保留修正与授权           | 只读、host-neutral、不泄密、不重建不可见状态或创造 authority             |

## Spec delta

以下名称对应现有 requirement；MODIFIED 只替换这里明确变更的语义，保留原有条目其余高后果约束。每项落地时保留一个准确的 Verify，指向有意义的测试或 `manual(integration)`；不以包含关键词冒充模型行为验证。

### MODIFIED — implement

- `Agent 承接机械决策`：补充明确用户请求和已有授权的优先级、可调查事实由 Agent 完成、未受阻的授权工作继续；暂停时引用实际规则；不改变新增依赖、连续性选择和外部副作用的 authority 要求。
- `TDD 按需保留`：补充必要检查已通过后的停止扩测条件，区分无变化重试与有新证据的诊断/修复。
- `Implement 产生 candidate 而不自我验收`：普通无 plan 实现以相称证据报告完成，不强制稳定完整 diff 身份；关联 plan 或正式验收触发完整 basis/Assurance 责任；任何普通结果均不能自称独立验收。
- `自主组合验证、独立验收与持久 truth`：支持能力返回后由仍获授权的 Implement 继续；明确允许且有收益的委派条件；不强制固定链路或 agent 数。
- `组合不放宽能力边界`：完整结果 pair 仅在正式验收中要求；普通 scoped verdict 不产生 done，缺正式字段不得补造。保留原有修复授权与版本失效规则。
- `完成状态和报告真实`：普通报告按结果、相关改动、实际验证和重要限制组织；正式验收和关联 plan 按需携带完整 provenance；所有失败/缺证据语义不变。

### MODIFIED — check

- `evidence 由问题和风险决定`：补充验证结束条件、明确请求决定检查范围及相称并行；不以普通检查触发无关全面扫描。
- `项目上下文按缺口取得`：复用仍有效事实；委派只在可用且有独立价值时发生，正式验收仍需真正独立上下文。
- `各方法只加载相关 reference`：正式验收新增条件加载；普通 test/review/e2e 不加载未触发的状态协议。
- `verdict 只覆盖实际证据`：普通输出 scope/verdict/evidence/limitations；正式输出增加完整 basis、producer 和 acceptance field；不弱化 selected claim 的完整覆盖和失败暴露。
- `verdict 只读且由 caller 机械投影`：只有正式、独立且 basis 匹配的 pass pair 可以投影 done；普通 verdict 无此权力。
- `accepted 和 done 需要独立 Check attestation`：保持原语义，正文只同步正式触发与 reference 路由，不取消独立性或稳定 basis。

### MODIFIED — 其他直接受影响的契约

- explore：`报告与上下文使用同一事实基础`，明确 context 返回交还调用方，单独报告仍结束于只读结果。
- shape：`复用既定决定`、`事实缺口由 Agent 调查`、`只处理实质决策前沿`，补充精确暂停依据、边调查边推进不依赖未知项的工作；保留 Design Summary 审阅规则。
- plan：`local plan 区分实施授权、candidate 与独立验收`，只同步正式验收触发和普通 verdict 不能提升状态；artifact schema 及 target 语义保持。
- docs：`PRODUCT truth 必须已经决定`、`文档调用止于文档结果`，明确缺权威 claim 的局部阻塞及作为支持能力时返回调用方。
- converge：`来源明确时自主收敛`，保持原语义并与精确停止/继续规则一致。
- doctor：`报告区分事实、判断和 owner`，保留必要证据并去除不适用字段；不扩大审计范围。
- handoff：`只保留会改变下一步的内容`、`摘要保留来源但不创造 authority`，只在涉及正式验收/plan 状态时保留完整 provenance；普通任务不人为制造缺失字段。
- publish：`发布状态不升级实现验收`；release：`release state 不替代实现验收`。同步普通结果/正式验收的区别，保留交付状态不能证明验收这一约束。

bench 是开发工具，其新增选定 skill 判卷、源码身份与比较契约记录在 `bench/README.md`；不新建第十二个 public skill/spec。没有新增或删除公共 requirement identity 的必要时，使用以上已有名称完成语义替换。

## Acceptance scenarios

| ID               | Given / When                                                  | Then                                                                                                   |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A1 普通实现      | 明确的小改动、无 plan、未要求正式验收；调用 Implement         | 完成改动和必要验证，简要报告结果，不要求先 Shape/Plan 或填写验收表单，不声称独立验收                   |
| A2 普通检查      | 用户只要求运行指定测试或 review 小 diff                       | 范围不扩张，给出有证据的 scoped verdict；不强制完整 diff 摘要/acceptance field，不修复源文件           |
| A3 连续执行      | 同一已授权实现中 Check 发现缺陷、或一个依赖有阻塞             | Check 保持只读；调用方可诊断和范围内修复，完成不依赖阻塞的工作，不重复索要已有授权                     |
| A4 测试与诊断    | 所需检查已通过，或同一命令重复失败                            | 前者结束不必要扩测；后者停止盲目重试但继续可行调查，有新证据后可以修复再验证；不删除/弱化失败证据      |
| A5 正式验收      | 请求 accepted/done，有稳定完整候选和独立检查者                | 加载正式协议并保留完整结果；只有 basis 匹配且覆盖足够的 pass pair 能 attested                          |
| A6 验收不可得    | 缺独立上下文、证据不足或检查后变更了候选                      | 返回不确定/未建立验收，旧 pass 不覆盖新版本；不退回普通 pass、不填造字段、不自动重开 done              |
| A7 关联计划      | 有 draft/candidate plan，用户明确请求实现                     | 正确维护生命周期和 Assurance；普通 scoped pass 不能写 done，现有 schema 不因简报而丢失                 |
| A8 纠正与侧问    | 工作中收到用户修正或独立状态问题                              | 更新受影响结论、回答侧问并继续主任务；不恢复被否定前提，不重复仍有效的已完成工作                       |
| A9 支持/只读边界 | Explore/Docs 为实施提供支持；另有独立 Shape/Doctor/Check 请求 | 前者返回后调用方继续；后者只产出各自结果。Shape 同意不启动实现，Check finding 不授予独立修复权限       |
| A10 发布约束     | exact 与 derived Release、部分 Publish、Plan both 远程失败    | exact 满足条件可执行；derived 明确停在批准前；既有成功阶段保留，Issue 不重复创建，不以假设批准消除失败 |
| A11 文档与交接   | 只有一个缺 authority 的文档 claim，或普通任务需要交接         | 未受阻目标继续；不编造产品意图、不生成多余文档；交接只保留影响继续工作的状态与证据                     |
| A12 委派         | 可独立的调查/检查，宿主允许且提供 agent 工具                  | 按收益委派并明确归属，主任务继续可行工作并核验结果；顺序任务不强制拆分，正式独立检查不沿用完整实施轨迹 |
| A13 评测身份     | before/after 源码与全局安装版本不同                           | 使用指定源码且记录身份；版本或关键条件不可核实时不得声称可比；合法写入不被 shape-only checker 误判     |

A1、A2、A3、A5、A6 各在 Astra 上 before/after 重复三次，其余场景至少一次；所有 11 个公共 skill 均有可追溯的实际代表会话。Claude Code 使用同一份文本做代表性加载、普通结果与边界 smoke，不以其他模型分数替代 Astra 验收。外部发布场景使用隔离工具状态并明确其证明范围。

## Verification

- command: `pnpm test`
- command: `pnpm lint`
- command: `pnpm check`（该脚本包含自动修复；实现阶段执行后检查 diff，不在当前 Plan 阶段运行）
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `node bench/src/calibrate.ts --repeat 3`（judge prompt/render/schema 变更后运行并更新既有 gold 校准记录）
- 行为判卷使用完成扩展后的 `pnpm bench:judge`，通过 `--skill implement` 等参数选择实际能力，并传入已归档的真实 transcript 路径；具体 before/after 路径、模型配置、原始结果记录在本次 bench 报告，不写伪造的成功命令输出。
- 比较 outcome/requirement 通过情况、硬边界违规、可避免确认和重复检查次数、输出长度、可观察耗时/token 及波动；人工判定确认/检查是否可避免，不把轮次或字符数当成独立质量结论。
- before 和 after 使用同一份已确认目标 rubric；原版本与新版本各自 spec 用于解释契约变更，不能让每个版本按自己的标准得分后直接比较。若基线没有某个坏行为，只能报告该场景维持正确，不声称消除了未观察的问题。
- checklist (manual):
  - [x] 11 个 skill 与所有可达指令均完成检查，有保留/调整结论，未漏 description、references 或直接关联契约。
  - [ ] 普通结果负担降低，正式验收与关联 plan 的独立性、身份和状态约束完整。
  - [ ] 必要检查通过后及时结束；可行诊断与已授权工作不会被泛化 stop 规则中断。
  - [ ] 关键 A1/A2/A3/A5/A6 场景在 after 重复运行均满足目标，其余覆盖无已知未解决契约缺陷。
  - [ ] 已保留的高后果边界无新增违规；在新旧契约共同部分没有未解决退化。
  - [ ] 至少有可比场景证明已改变的普通报告/执行要求生效；若全部对照无可观测改善，明确证据不足，不能宣布优化效果成立。
  - [x] 评测记录实际版本、配置与缺失证据，未污染全局安装或真实远程发布状态。
  - [ ] 最终完整 diff 经独立 Check 验收；失败或条件不可得时诚实保留 candidate，不能自签 done。

## Assumptions & risks

- 官方行为描述是模型倾向，不是本仓库根因证明；完整效果声明依赖真实会话。文本压缩本身不是验收目标。
- 当前 headless runner 的问句收束启发式不能证明 mid-turn steering 或多 agent 独立性。相关场景通过实际支持的宿主会话观察；不可用时记录该项缺证据，不凭静态文案判 pass，也不为此建设新 runtime。
- CLI 登录、Astra 可用性或推理设置不可观察时，静态检查与其他不受影响工作仍可完成，但不能更换目标模型后声称 Astra 验证成功。
- 校准后的判卷器仍有噪声。硬边界和关键结果优先于总分，重复结果与人工证据复核共同决定验收；不得用多个分数平均掩盖越界。

## Assurance

- Candidate basis: `56427bcf6496c3f9d73126d0374de59cd2486add + sha256:095718ad07ee565802f5a85d819e40132e60e9827bc633cd58c7791b4f2b6326`；规范复算过程完整保存在下方“候选源码复算”，不依赖本地评测目录或预先生成的文件清单。
- Candidate producer: Implement，当前任务 `/root`；本地分支 `feat/astra-skill-behavior`。
- Evidence and limitations: 11 个 skill 与可达 references 已审查；252 项测试、格式/lint/type、11/11 skill 格式校验通过，候选产品文件 Doctor checker 无发现。隔离 v2 的 Astra before/after 各完成 37 场景、48 顶层轮次、3 个实际独立检查者，共 102 份原始记录，机械重放无装载缺失或已检出违规；不将机械结果视为语义判卷。普通结果长度与 A7 计划回写有实测变化，A6-unavailable 中新版两次增加重复测试。Gold 历史载荷发送待用户明确授权，Claude 默认模型 probe 返回无效模型标识，跨宿主 smoke 尚未运行，没有校准后的 judge 分数。完整记录在 `bench/results/astra-2026-09-07/REPORT.md`。手工清单中未勾选的综合效果与验收条目保留待核验，不以局部观察替代完整证明。
- Check producer: 独立只读 `/root/candidate_review`；结果引用 `bench/results/astra-2026-09-07/independent-review.md` 的“最终完整候选独立 Check”。已独立复算完整 candidate basis 与 evidence manifest，二者匹配。完整判卷、Gold、Claude smoke 仍缺证据；实际发布样本只覆盖前置边界，轮次间纠正不证明 mid-turn steering。未发现新的高置信实现缺陷不等于原目标已验收。
- Verdict: inconclusive
- Acceptance: not established

### 候选源码复算

在包含基线提交的仓库克隆中检出待核验候选，保持文件字节、符号链接和执行位不变，然后在仓库内运行以下只读命令。原独立 Check 对应提交 `6ae4dcd17daa7954d84f7bdcd7e1e6b0101350f3` 的候选内容；后续提交须复算后再判断是否仍匹配，不能只凭分支名沿用结论。

文件集合取基线到当前工作树的全部变化路径，加上所有未被 Git 忽略的未跟踪路径，去重并按 Python 字符串顺序排序。每项记录相对路径、当前 mode 和内容 SHA-256；删除项为 `mode: absent`、`sha256: null`，符号链接对链接目标字符串本身取哈希。只有本计划首个 `status` 行和完整 `## Assurance` 节被规范化排除，其余计划正文仍参与身份。最后对代码所示 payload 的规范 JSON 字节取 SHA-256；代码中的字段、排除说明字符串和序列化参数均属于算法。

```sh
python3 - <<'PY'
from pathlib import Path
import hashlib
import json
import re
import stat
import subprocess

root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
base = "56427bcf6496c3f9d73126d0374de59cd2486add"
plan = "plans/2026-09-07-feat-astra-skill-behavior.md"

def git(*args):
    return subprocess.check_output(["git", "-C", str(root), *args]).decode("utf-8")

changed = set(git("diff", "--name-only", "-z", base).split("\0"))
changed.update(git("ls-files", "--others", "--exclude-standard", "-z").split("\0"))
rows = []
for name in sorted(changed - {""}):
    path = root / name
    if not path.exists() and not path.is_symlink():
        rows.append({"path": name, "mode": "absent", "sha256": None})
        continue
    mode = "120000" if path.is_symlink() else (
        "100755" if path.stat().st_mode & stat.S_IXUSR else "100644"
    )
    content = str(path.readlink()).encode("utf-8") if path.is_symlink() else path.read_bytes()
    if name == plan:
        body = re.sub(r"(?m)^status: .*$", "status: <excluded projection>", content.decode("utf-8"), count=1)
        body = re.sub(r"(?ms)^## Assurance\n.*?(?=^## |\Z)", "", body)
        content = (body.rstrip() + "\n").encode("utf-8")
    rows.append({"path": name, "mode": mode, "sha256": hashlib.sha256(content).hexdigest()})

payload = {
    "baseRevision": base,
    "files": rows,
    "exclusions": [
        "associated plan status line and Assurance section",
        "git-ignored local evaluation evidence (separately identified)",
    ],
}
canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
print(base + " + sha256:" + hashlib.sha256(canonical).hexdigest())
PY
```

### 本地原始证据的独立限制

`bench/results/astra-2026-09-07/` 中的原始会话、独立报告与证据 manifest 未跟踪、未上传，仓库克隆不包含它们。上述源码复算不读取这个目录，也不能证明其中的评测记录或 Check 结论。历史证据清单身份为 `sha256:0c277d66b3e034d77fbb5ed0503f4f2b82344ebcad46158de025ef0012e57826`（2940 文件）；没有本地清单和原始文件的读者无法独立复核该证据身份。本次 Implement 已在不含该目录的临时仓库克隆中直接执行上方命令：结果与原 basis 一致，status 投影变化不改变结果，真实候选文件变化会改变结果。原独立 Check 未审阅后来补入的复算说明；这次可复现性验证不产生新的独立 attestation，验收仍未建立。
