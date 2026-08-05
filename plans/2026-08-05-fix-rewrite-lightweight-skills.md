---
mode: fix
title: 按 Claude 5 context engineering 原则重写轻量 Skills
created: 2026-08-05
status: done
issue: https://github.com/moeyua/skills/issues/34
---

# 按 Claude 5 context engineering 原则重写轻量 Skills

## Building

以 Anthropic 的 [The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models) 为方向真源，重新设计仓库自有的全部 11 个 skill。

这不是在现有 SKILL.md 上调整编排或继续追加规则，而是一次完整的 context-engineering 转向：从空白重写每个主 SKILL.md，使它成为轻量、聚焦、带明确观点的能力指南；把只在特定情境需要的深层知识放入渐进加载的 references；删除重复、显而易见、互相冲突或试图枚举模型错误的规则。

用户只需表达最终 outcome，Agent 运用周边上下文和判断，自主组合完成结果所需的能力、TDD/验证和直接受影响的文档工作。显式 skill 调用继续作为可选控制手段，而不是用户必须手动操作的流水线。

## Not building

- 不把本次事故转写成新的特殊规则或第 101 个例外。
- 不在旧 SKILL.md 上采用追加段落式修补。
- 不修改 Codex runtime、工具授权模型或宿主能力。
- 不承诺消除所有可能的语义错误。
- 不修改未经本次逐项确认的既有产品决策。
- 不新增执行遥测系统、evidence ledger、跨 skill workflow bench 或新的评测产品。
- 不批量改写历史 plans。
- 不弱化 plan、publish、release、secrets、用户改动等高后果边界。
- 不提交、推送、创建 PR、发布版本或覆盖全局已安装 skill 快照。

## Root cause

当前 skill 集合以旧一代 context engineering 假设构建：通过长主文件、强制阶段、重复边界、固定例子、统一共享前言和大量 ALWAYS/NEVER 来约束 Agent。随着规则和能力增加，不同来源开始互相冲突，模型必须先解释流程，再处理用户 outcome。

两个历史会话中，活跃执行时间分别约 7 小时 58 分和 5 小时 20 分，大部分成本集中在长 turn、重复验证和扩张后的工作范围。本次任务又出现未经授权批量修改、把自主串联误改成用户手动串联、以及读到 both 仍私自选择 local。继续在现有 skill 上增加规则只会扩大同一种失败面。

Anthropic 在 Claude 5 generation 模型上删除 Claude Code 超过 80% 的 system prompt，coding eval 未出现可测损失；其结论是解除过度约束，让新模型使用判断，并通过接口设计、渐进披露、简单描述和高保真 references 提供真正需要的上下文。本次修复必须采用同一方向，而不是给旧结构打补丁。

## Regression tests

- tests/skill-architecture.test.ts：11 个公共 skill 与 spec 仍精确配对，必要共享真源仍保持唯一；不为已删除的旧通用前言建立事故专用回归测试。
- tests/frontmatter.test.ts 与 tests/checks.test.ts：frontmatter 只保留 name/description 路由接口；移除重复路由字段及其 parser/Jaccard 机械检查，并移除强迫统一正文模板的结构检查。
- tests/implement.test.ts：TDD 保留但按需；check、docs 与最终验证由 outcome、风险和证据触发，而非固定无条件链路。
- tests/plan.test.ts、tests/publish.test.ts、tests/release.test.ts：既有 artifact target、外部副作用、幂等与恢复语义保持不变。
- tests/smoke/verify-skills.test.ts：references、Markdown links、resolver、spec pairing 与 memory catalog 等真实结构 invariant 继续通过。
- manual(integration)：本次修改任务完成 dogfood，确认 Agent 自主完成已授权 outcome、不重开已确认决定，并报告主 skill 上下文缩减、实际执行时间和未完成验证。

## Context-engineering turn

### Rules → judgment

删除试图预先覆盖所有错误角度的规则。主 skill 解释领域目标、关键取舍和极少数高后果边界，让模型结合用户请求、项目上下文和证据判断具体过程。

### Examples → interfaces

不依赖固定示例教 Agent 重放流程。frontmatter description、工具参数、artifact schema、reference 路由和能力边界共同形成清晰接口。现有 tests 检查接口和不变量，不锁死提示词措辞。

### Upfront context → progressive disclosure

主 SKILL.md 只保留进入能力时总是有价值的内容。长格式、provider 细节、复杂恢复协议和目标专属知识放入 references，并在触发条件出现时才读取。

explore 是已确认的领域例外：固定 Overview 依然需要，项目身份、manifest、项目指令及必要架构/全局文档仍依次完整阅读，再进入按范围和风险选择的 deep-dive。

### Repetition → simple descriptions

删除主文件、共享 rules、resolver 和项目文档之间重复表达的同一约束。每项语义保留一个权威位置；description 负责路由，正文负责领域判断，reference 负责深层知识。

### Generic memory preambles → deletion

删除 anti-patterns 与 durable-context 两个模块、全部 symlink、所有读取要求和相关架构测试。不迁移、不归档、不建立替代模块。

### Simple specs → rich references

保留 spec、代码、测试、格式文件、mockup 和 rubric 作为高保真 reference。复杂领域可以拥有丰富资料，但这些资料不默认加载进每次 skill 调用。

## Key decisions

- 这是全部 11 个主 SKILL.md 的重新编写，不是增量调整。
- 用户给 outcome，Agent 负责微观编排；移除固定串联，不移除自主串联。
- 所有既有产品决策默认保持不变；只有本计划逐项列出的语义变化获得修改授权。
- 不设置统一行数或压缩百分比；实现必须提供每个主 SKILL.md 与总加载上下文的 before/after 数据，并解释保留的长内容为何属于高重要领域。
- universal Outcome Contract、统一 HARD-GATE 形状和其他正文模板不再作为所有 skill 的机械要求；某个 skill 只有在该结构确实提高接口清晰度时才保留。
- anti-patterns 与 durable-context 直接删除，无替代。
- explore 固定 Overview 与必要全局文档阅读保留。
- shape 保留 outcome-first 和只读边界；高保真参考或预览仅在真正适用的主观任务中使用。
- implement 保留按需 TDD，并根据 outcome、风险和证据自主组合 check、docs 与最终验证。
- plan 的 local / issue / both、cardinality 和 Issue identity 语义保持不变。
- release 的复杂度来自真实难逆状态；采用渐进 references，但不删安全谓词。
- dogfood 使用本次修改任务与现有测试/bench；不新建 workflow bench 或时间基础设施。
- 执行时间作为 dogfood 观察与最终报告，不成为新的通用规则模块。

## Confirmed review repairs

- Converge 在来源明确且不会丢失 authored meaning 时自主 re-shell/fill；只在来源冲突、可能丢内容、新产品 intent 或 authority 缺失时停止。
- Release 的多 identity commit label 先服从项目策略；无策略时按稳定 unit 顺序组合 exact tags。
- Implement 在首次实现编辑前维护 draft→approved，禁止静默重放 done plan，并保留 credential value 不进入 code/tests/logs/plans/docs/reports 的边界。
- Plan 把 Issue mutation 细节下沉到 issue/both references，补 canonical Issue URL 的 repository 优先级、每 item schema/batch labels 和 label-create failure ledger；local 仅在显式 URL 存在时保留条件式只读验证。
- 11 个 Skill frontmatter 删除重复的 `when_to_use` / `dispatch_intent`；description 成为唯一运行时路由文字。
- Publish/Release 通过 reference 可达性与高后果 predicate 回归测试保护；不扩展为提示词正反语义挑刺测试。
- Shape bench 仅补 fixture working-tree 证据，能发现 transcript 未识别且最终仍为 Git-visible 的 shell 变更，或把证据不可用单列 warning；不声称捕获已恢复/忽略的瞬时写入，也不新建 bench 产品。
- PRODUCT 只保留 why/principles/boundaries，ARCHITECTURE 负责技术 topology 和 side-effect ownership，README 只给简明用法与链接，Resolver 只保留 route table 和必要差异。

## Architecture

    lightweight description
            |
            v
    lightweight SKILL.md
    - capability purpose
    - product-specific judgment
    - critical boundaries only
    - conditional reference routing
            |
            +------> rich reference, loaded only when triggered
            |
            v
    Agent combines capabilities around the user's outcome
            |
            v
    evidence-backed result

公共 skill 继续独立存在。图中不存在固定全局流水线，也不要求用户手动串联；组合由 Agent 围绕 outcome 完成。

## Public surface changes

### explore

从头重写主文件，但保留固定 Overview、必要全局文档依次完整阅读、来源标注、不猜测和只读边界。渐进披露发生在 Overview 之后的 scoped deep-dive，不取消全局骨架。

### shape

保留 outcome-first、只读、复用既定决定和只处理实质决策前沿。删除重复阶段描述和通用规则前言；主观任务按需使用高保真 reference 或 preview，不引入统一确认阶段。

### plan

保留 local / issue / both、默认 target、cardinality、canonical Issue 和副作用契约。主文件只解释目标选择与共同边界；本地模板、Issue schema 和各 target 过程继续作为按 target/type 加载的 rich references。

### implement

重写为 outcome ownership：实现、按需 TDD、比例验证、范围内修复和直接受影响的 durable truth 共同服务于已授权结果。check、docs 与最终 gate 继续可组合，但不再写成每次必走的固定顺序。

### check

保持只读。主文件描述如何按用户问题和风险选择 review/test/e2e；各 mode 的深层方法可拆入 references。完整 gate 只在明确要求或确有高风险时发生，不强制每个 mode 使用独立 subagent。

### docs

主文件聚焦目标选择和 authority。memory catalog 与各 format 作为 rich references 按目标加载；既可独立调用，也可由复合 outcome 按需组合，但不得自行决定产品 truth。

### publish

保留状态感知、显式 staging、secret 防护、非 force、部分失败和 PR identity。删除重复命令例子与通用 git 常识，保留真正项目特有或高后果的恢复边界。

### release

把当前长主文件重构为轻量入口和条件 references：常规单包路径、release topology/monorepo、执行协议、既有状态与恢复分别按需加载。release set、项目策略、跨轮确认、默认分支、version transaction、commit、tag、GitHub Release 和幂等恢复语义全部保持。

### converge

主文件只保留 catalog 适用性、权威来源、内容保护和幂等目标。具体格式从 docs rich references 读取；来源明确的收敛自主完成，来源冲突、内容丢失或新产品意图才形成确认点。

### doctor

保留项目级只读审计和 bundled checker。主文件负责范围选择、事实与判断区分；checker 能确定的内容不重复写成长流程，显式类别或路径控制 probe 范围。

### handoff

重写为轻量、host-neutral 的上下文压缩指南。保留 secrets 和只读边界，只输出继续工作真正需要的信息，不强制填满固定大模板。

## Spec delta

## MODIFIED Requirements

### Requirement: 所有主 skill 使用轻量上下文

每个主 SKILL.md 必须从领域 outcome、产品特有判断、关键边界和 conditional reference routing 出发重新设计；不得保留仅为重复、示例模仿、通用常识或枚举错误而存在的正文。
Verify: manual(integration)

### Requirement: 深层知识渐进加载

只有当前任务触发时才读取目标专属格式、复杂 provider 行为、恢复协议和其他长 references；高重要领域可以保留严格边界，但不得让所有 skill 默认加载无关上下文。
Verify: manual(integration)

### Requirement: explore 先建立固定全局骨架

explore 必须先完成固定 Overview，依次读取项目身份、manifest、项目指令和任务所需的架构/全局文档，再进入 scoped deep-dive；渐进披露不得取消该全局骨架。
Verify: manual(integration)

### Requirement: implement 自主完成已授权 outcome

implement 必须保留按需 TDD，并根据风险、证据和用户 outcome 自主组合 check、docs 与最终验证；不得机械执行固定链路，也不得要求用户手动串联这些能力。
Verify: tests/implement.test.ts

### Requirement: 所有公共能力保持独立且可自适应组合

11 个 skill 必须可独立调用；复合 outcome 由 Agent 自主组合所需能力，现有外部副作用和领域边界保持不变。
Verify: manual(integration)

## Assumptions & risks

- 当前工作树包含先前由 Agent 未经授权写入的草稿。实施时必须以仓库 HEAD 和本计划为权威基线，精确替换这些 assistant-authored paths，不覆盖其他用户改动。
- 安装到 /Users/moeyua/.agents/skills 的快照与源码 checkout 可能不同。源码仓库是实现目标；候选 dogfood 使用隔离加载方式，不覆盖全局快照。
- “彻底重写”描述 context architecture，不授权改变未列出的产品语义。
- 结构测试当前会奖励统一 Outcome Contract 和精确提示词片段；这些测试本身需要转向接口与行为 invariant，避免把旧 prompt 形状重新强加回来。
- Markdown skill 无法形式化保证模型判断，但可以减少冲突上下文、提高接口清晰度，并通过实际 dogfood 暴露偏差。
- release 等高风险 skill 仍可能拥有较多 references；轻量化衡量默认加载的主上下文，而不是机械追求仓库总字数最少。

## Implementation steps

1. 建立权威基线和轻量化审计
   - outcome: 未授权草稿被排除为设计真源；记录 HEAD 中每个主 SKILL.md 的行数/词数、必读 references、重复语义和高重要边界。
   - scope: git state、HEAD:skills/_/SKILL.md、skills/_/references/、rules/、当前计划。
   - verify: 产出 before inventory；逐路径确认 assistant-authored 草稿与其他用户改动的归属，不提交或丢弃用户工作。

2. 删除旧的通用上下文层
   - outcome: anti-patterns 与 durable-context 源文件、全部 symlink、读取要求、架构说明和相关测试完全删除，无替代模块。
   - scope: rules/anti-patterns.md、rules/durable-context.md、skills/_/references/、skills/_/SKILL.md、tests/、ARCHITECTURE.md。
   - verify: rg -n "anti-patterns|durable-context" rules skills tests ARCHITECTURE.md README.md README.zh-CN.md PRODUCT.md 无产品引用；symlink 与 Markdown reference 检查通过。

3. 重写 discovery、shaping 与 planning skills
   - outcome: explore、shape、plan 的主文件均按文章原则从头重写；固定 Overview、outcome-first 和 plan artifact 语义分别保持。
   - scope: skills/explore/、skills/shape/、skills/plan/ 及对应 specs/tests/references。
   - verify: 对照 Public surface changes；确认 plan target/cardinality/Issue identity 无语义漂移。

4. 重写 implementation、verification 与 durable-truth skills
   - outcome: implement、check、docs 成为轻量、可组合能力；implement 保留按需 TDD并拥有完整 outcome，check/docs 不再构成固定流水线。
   - scope: skills/implement/、skills/check/、skills/docs/ 及对应 specs/tests/references。
   - verify: pnpm test tests/implement.test.ts；人工核对无用户手动串联要求、无无条件完整 gate。

5. 重写 delivery 与 maintenance skills
   - outcome: publish、release、converge、doctor、handoff 的主上下文明显轻量化，复杂或高风险知识迁移到条件 references，既有领域边界保持。
   - scope: skills/publish/、skills/release/、skills/converge/、skills/doctor/、skills/handoff/ 及对应 specs/tests/references。
   - verify: pnpm test tests/publish.test.ts tests/release.test.ts tests/checker.test.ts；逐项核对外部副作用和恢复谓词。

6. 重塑 specs、tests 与公共文档
   - outcome: specs、tests、resolver、PRODUCT、ARCHITECTURE、README 双语描述完整转向；测试保护接口和产品 invariant，不保护冗长 prompt 形状。
   - scope: specs/\*/spec.md、tests/、skills/RESOLVER.md、PRODUCT.md、ARCHITECTURE.md、README.md、README.zh-CN.md。
   - verify: repo smoke、project identity、memory catalog、Markdown links 和 frontmatter checks 通过；历史 plans 不变。

7. Dogfood 本次重写任务
   - outcome: Agent 在一次已授权 implement outcome 内自主完成重写、按需 TDD/check/docs/最终验证，不要求用户逐个调用 skill；候选 skill 在可用的隔离加载方式中接受一次新鲜上下文检查。
   - scope: 完整 diff、现有 tests、适用的现有 shape bench、本次已确认计划。
   - verify: 对照 Key decisions 与 Public surface changes；报告偏差、每个高成本验证的实际耗时和无法在不新增基础设施条件下执行的 dogfood 部分。

8. 完成轻量化复核
   - outcome: 提供 11 个主 SKILL.md 的 before/after 行数与词数、默认加载 references 变化、删除的重复内容类别以及高重要例外说明。
   - scope: HEAD 与最终完整 diff。
   - verify: 每个保留段落都能归入 capability purpose、product-specific judgment、critical boundary 或 conditional reference routing；无法归类的内容删除或移入触发式 reference。

## Verification

- command: pnpm test
- command: pnpm lint
- command: pnpm check
- command: node skills/doctor/scripts/checker.ts . --json
- checklist (manual):
  - [x] 11 个主 SKILL.md 均为重新设计，而非在旧正文上追加规则。
  - [x] 每个 skill 和总主上下文都有 before/after 轻量化数据。
  - [x] anti-patterns 与 durable-context 已彻底删除且没有替代模块。
  - [x] universal Outcome Contract 等统一正文模板不再被机械强制。
  - [x] explore 仍有固定 Overview 和必要全局文档阅读。
  - [x] implement 仍支持按需 TDD并自主组合 check/docs/最终验证。
  - [x] 用户无需手动串联 skill 来完成本次修改。
  - [x] 没有新增 workflow bench、时间基础设施或 Codex runtime 变更。
  - [x] plan、publish、release 等既有产品语义与高后果边界没有被弱化。
  - [x] 最终 dogfood 报告包含实际执行时间、偏差和未完成验证。
