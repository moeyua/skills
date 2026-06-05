---
mode: feat
title: persist 记忆格式按权威重订 + behavior→spec 改名
created: 2026-06-04
status: done
---

# persist 记忆格式按权威重订 + behavior→spec 改名

> 接 `plans/2026-06-04-handoff-persist-formats.md` 的欠账:6 份 format 的 section 是上一轮 AI 擅定、未经维护者确认。本轮逐份过、按查到的权威来源重订,并把 behavior 目标改名为 spec。

## Building

把 `skills/persist/references/formats/*.md` 6 份格式规范从「AI 拍脑袋」改为「有出处」:每份的 `## Sections` 据公认权威(或维护者明确决定)重订,`Sections / Source / Boundary` 三块骨架保持。同时把 behavior 目标按「目录条目名 = 文件名」的规律改名 spec(对齐 `specs/<domain>/spec.md`)。改完每份 section 都能指到一个来源,而不是「AI 说的」。

## Not building

- **不改 spec(原 behavior)的 section 内容**——它本就是查官方文档定的(RFC2119 + Verify,借鉴 OpenSpec),只改名、不改结构。
- **不改 PRODUCT.md / 哲学 / 边界**——本轮是格式落地,不动产品取舍(roadmap 那条仅澄清 persist 行为,不改 PRODUCT 边界文本)。
- **不改 checkMemoryCatalog 的逻辑**——它是通用正则,改名只需文件与指针同步。
- **不动 squire 自己的 ARCHITECTURE.md 正文结构**(它开头的文件树):仅改一处注释里的「behavior 目标」措辞。是否按新 architecture 格式重排 squire 自己那份,留作后续单独决定。
- **不引入对 design.md 外部 URL 的运行期依赖**:design 格式把 design.md 的模型**完整复述进 squire 仓内**(维护者要求),只把 design.md 标为来源/出处。

## Approach

逐份过(维护者选定),研究先行(已并行起 5 个 agent 查 architecture / design / workflow / roadmap / readme 的公认写法,各带可引用来源)。结论:研究**基本印证**了原 4 份(architecture/workflow/roadmap/readme)的方向、只做小修;**实质改写**的是 design(改用 Google Labs 的 `google-labs-code/design.md` 规范);**纠正**的是把 architecture 的「目录结构」留作目录(维护者拍板:代码地图易漂、维护贵)。

改名与内容改写互不依赖,拆两个独立可交付阶段:Phase 1 改名(结构性),Phase 2 内容重订。

## Premise collapse

本方案假设 **persist 的 spec(`specs/persist/spec.md`)只通过「照对应 format 规范写」这条 requirement 间接依赖各 format 文件**,所以改 format 的 `## Sections` 不动 persist 的行为契约。若此假设不成立(persist spec 里硬编码了某份 format 的具体 section),则 Phase 2 还需补 spec delta。已核对 [specs/persist/spec.md](../specs/persist/spec.md):各 requirement 只说「按目录决定写哪份、照 format 的 Sections/Source/Boundary 写」,不列具体 section——假设成立,Phase 2 无 spec delta。

## Key decisions

1. **behavior 改名 spec** — 目录其余条目「条目名 = 文件名」(ARCHITECTURE→ARCHITECTURE.md),只有 behavior 破例(文件是 spec.md)。改 spec 对齐既有规律与 `specs/<domain>/spec.md`,「行为契约」作为描述性 gloss 保留。
2. **architecture 保留「目录结构」,不改语义代码地图** — 维护者拍板:代码地图(模块+交互)比目录树更易漂、长期维护贵,反不如目录稳。补「架构不变量」为**可选**段(matklad 唯一夸的低维护、抗漂移元素),维护者可不要。
3. **design 改用 `google-labs-code/design.md`** — 它正是「给 AI agent 描述视觉身份」的外部权威规范,与 squire design 同类。采纳其两层模型(YAML token front matter + 固定段序),**完整复述进仓**不靠链接,标 design.md 为来源。
4. **design 拿掉「交互流程」** — design.md 只管视觉身份;交互属行为,归 spec。design 范围收窄为视觉身份。
5. **roadmap 的边界从「内容禁令」改为「persist 行为约束」** — 维护者纠正:persist 自己不排序/不排期/不裁决价值 ≠ 禁止用户这么写。重写 Boundary 表述为「persist 不主动加,但不挡用户」。
6. **workflow / readme 按研究小修** — workflow 第二块点明「门禁」、第三块收紧成确切命令(AGENTS.md);readme 标题并进定位、加可选层。

## Public surface changes

persist 对外「接口」即各 format 规范契约 + 记忆目录。变化:

- 记忆目录条目 `behavior` → `spec`(名 + Format 指针)。
- `references/formats/behavior.md` → `spec.md`(重命名 + 重定标题)。
- design 格式契约整体替换为 design.md 模型;design 目录条目 Purpose 收窄(去掉「交互」)、Source 增列 design.md。
- architecture / workflow / roadmap / readme 的 `## Sections`(及 roadmap 的 `## Boundary`)措辞调整。

## Spec delta

仅 Phase 1 改名触及 `specs/persist/spec.md`(术语级,把目标名 behavior→spec;「行为契约」描述保留)。Phase 2 内容重订**无 spec delta**(见 Premise collapse)。

```markdown
## MODIFIED Requirements

### Requirement: 合并 spec delta

record 模式写 spec 目标时,本 skill 必须按 requirement 名把 plan 的 `## Spec delta` 合并进 `specs/<domain>/spec.md`:ADDED 段追加、MODIFIED 段替换同名 requirement、REMOVED 段删除;domain 不存在则新建(含 `## Purpose`)。
Verify: manual(integration)
(Previously: 标题与正文称该目标为「behavior」)

### Requirement: 目录驱动的多目标记忆

本 skill 必须按 `rules/memory-catalog.md` 决定写哪份 artifact 及如何写;spec 写 `specs/`,architecture/design/workflow/roadmap/readme 写对应文档。目标不存在时 create-if-missing,出生即带来自其权威源的内容。
Verify: manual(integration)
(Previously: 「behavior 写 specs/」)

### Requirement: 默认产出轻量记忆

本 skill 写 spec 必须默认产出 Lite spec(behavior-first 的短 requirement、各带 `Verify:`、scope 与 non-goals),仅在高风险变更(API/契约变更、迁移、安全)时升到 Full;无对外可见行为的变更不记录。
Verify: manual(integration)
(Previously: 「写 behavior 必须默认产出 Lite spec」)
```

> 注:`## Purpose` 段与 Requirement「逐目标 anti-invention」里的「behavior」措辞同步改为「spec」(Purpose 非 requirement,直接编辑)。

## Interface boundary

每份 format 文件重订后的 `## Sections`(Source/Boundary 三块骨架不变):

- **spec**(原 behavior,`specs/<domain>/spec.md`):Domain(标题内)/ Purpose / Requirements(`### Requirement:` + `Verify:`)。**内容不变,仅改名 + 重定标题。**
- **architecture**(`ARCHITECTURE.md`):目录结构 / 技术栈与选型 / 数据流 / 关键设计决策记录(ADR 式)/ **(可选)架构不变量**(matklad:「绝不发生」类约束)。加一句 matklad 原则「只记不易变的、不指望跟代码逐行同步」。
- **design**(`DESIGN.md`):整体改用 design.md 模型——
  - **YAML front matter(规范值,normative)**:`name` / `description?` / `version?`,以及 `colors` / `typography` / `rounded` / `spacing` / `components`(token 取 hex/CSS 色、带单位尺寸、typography 对象、`{path.to.token}` 引用)。
  - **正文(讲 why + 怎么用,可省但出现须按序)**:Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Do's and Don'ts。
  - 一句:tokens 是规范值,prose 解释为何如此、如何应用;来源标 `google-labs-code/design.md`。
- **workflow**(`WORKFLOW.md`):流程阶段 / 各阶段约定**与门禁**(分支模型作为 per-project 变量塞此块) / **构建与命令**(确切可跑调用,含怎么跑单测;按 AGENTS.md)。
- **roadmap**(`ROADMAP.md`):record-only 引子 / 按主题「X — 因为 Y」一行流(不变);**Boundary 重写**为 persist 行为约束(persist 不主动排序/排期/裁决,但不禁止维护者自行加 now/next/later 或优先级)。
- **readme**(`README.md`):标题+一句话定位 / 上手 / 用法(非工具仓可并入上手或转可选)/ 链接 +**(可选)** License 链接、Contributing 链接、超 100 行加目录。营销话术/徽章不进。

**不暴露**:format 不规定段内措辞(沿用现有约定);不引入运行期外部依赖。

## Acceptance scenarios

- Given persist 写一份新 DESIGN.md,when 加载 design 格式,then 看到 design.md 两层模型(token front matter + 8 段)且仓内自包含、无需访问外链。
- Given 维护者要在 ROADMAP 标 now/next/later,when persist 写 roadmap,then 格式不阻止(只约束 persist 自己不主动加/不裁决)。
- Given 任一 persist 流程引用「记忆目录 + format」,when 提到该行为契约目标,then 名称为 `spec`、格式文件为 `references/formats/spec.md`、产物路径仍 `specs/<domain>/spec.md`。
- Given `pnpm test`,when 跑 checkMemoryCatalog,then 目录指针 ↔ formats 文件双向同步(spec.md 在两侧都在,无 MISSING/ORPHAN)。
- Given 全仓 grep `formats/behavior.md`,then 0 命中(改名彻底)。

## Implementation steps

### Phase 1 — behavior→spec 改名(独立可交付)

1. 重命名格式文件并重定标题
   - change: `git mv skills/persist/references/formats/behavior.md skills/persist/references/formats/spec.md`;首行 `# Behavior format — ...` → `# Spec format — \`specs/<domain>/spec.md\``;正文保留(其内描述性「behavior」措辞保留,因确指 observable behavior)
   - verify: `ls skills/persist/references/formats/spec.md` 存在、`behavior.md` 不存在
2. 改记忆目录条目
   - change: [rules/memory-catalog.md:15](../rules/memory-catalog.md#L15) `## behavior` → `## spec`;[:22](../rules/memory-catalog.md#L22) `Format:references/formats/behavior.md` → `spec.md`(Purpose 的「行为契约」保留)
   - verify: `grep -n "behavior.md" rules/memory-catalog.md` 0 命中
3. 改 persist SKILL 的枚举与术语
   - change: [skills/persist/SKILL.md:39](../skills/persist/SKILL.md#L39) 格式清单 `(behavior / architecture / ...)` → `(spec / architecture / ...)`;`## Record: merge a behavior delta` 标题及「behavior target / behavior delta」目标名措辞 → `spec`(行为契约 gloss 保留);description/when_to_use 中作为「条目名」的枚举改 `spec`,描述性「行为契约/behavior contract」保留
   - verify: 通读无残留把 spec 目标称作「behavior 目标/target」处
4. 改 persist 自身 spec(术语级 MODIFIED)
   - change: [specs/persist/spec.md](../specs/persist/spec.md) 按上文 Spec delta 改 3 条 requirement + Purpose + 「逐目标 anti-invention」中的「behavior」→「spec」
   - verify: `grep -n "behavior" specs/persist/spec.md` 仅剩描述性「行为契约/observable behavior」,无「behavior 目标」
5. 改 ARCHITECTURE 注释
   - change: [ARCHITECTURE.md:36](../ARCHITECTURE.md#L36) 注释「persist 的 behavior 目标」→「persist 的 spec 目标」
   - verify: 同行无 behavior
6. (可选)统一测试 fixture
   - change: [tests/checks.test.ts:442-463](../tests/checks.test.ts#L442-L463) fixture 里的 `behavior` / `behavior.md` → `spec` / `spec.md`(纯整洁,非必需——该 fixture 与真仓无关)
   - verify: `pnpm test` 绿
7. Phase 1 收口
   - verify: `pnpm test`(60 passed 不变、checkMemoryCatalog 绿)、`pnpm typecheck` 干净、`grep -rn "formats/behavior.md" .` 0 命中

### Phase 2 — 6 份 format 内容重订(独立可交付)

> 每份 Source/Boundary 三块骨架保持;只动 `## Sections`(及 roadmap 的 Boundary、design 的整体)。

8. architecture 格式
   - change: [skills/persist/references/formats/architecture.md](../skills/persist/references/formats/architecture.md) `## Sections` 保留目录结构/技术栈/数据流/决策,补**可选**「架构不变量」+ matklad 原则一句;决策段点明 ADR 式(context→decision→consequences),数据流注明「超 ~3 组件交互才画图」(已有,保留)
   - verify: 文件含 5 段(末段标可选);`pnpm test` 绿
9. design 格式(整体改写)
   - change: [skills/persist/references/formats/design.md](../skills/persist/references/formats/design.md) 重写为 design.md 两层模型(token front matter schema + Overview/Colors/Typography/Layout/Elevation & Depth/Shapes/Components/Do's and Don'ts),完整复述;Source 增列 `google-labs-code/design.md`;Boundary 去掉「交互」、注明 design 只管视觉身份(交互归 spec);保留「按项目需要取用、小 UI 可只留几段」
   - verify: 文件无「交互流程」段、含 token 层与 8 段;`checkMarkdownLinks` 不因外链报错(design.md 标为来源文字而非必访链接)
10. design 目录条目同步
    - change: [rules/memory-catalog.md](../rules/memory-catalog.md) DESIGN 条目 Purpose「UI 设计——界面、交互、视觉规范」去掉「交互」、收窄为视觉身份;Source 增 design.md
    - verify: 条目无「交互」
11. workflow 格式
    - change: [skills/persist/references/formats/workflow.md](../skills/persist/references/formats/workflow.md) 第二块改「各阶段约定与门禁」(分支模型作为 per-project 变量);第三块改「构建与命令」要求确切调用含单测;诚实加一句「无单一权威 WORKFLOW 模板,本三块是 GitHub flow + Conventional Commits + AGENTS.md 拼成」
    - verify: 文件含「门禁」「确切命令/单测」字样
12. roadmap 格式(改 Boundary)
    - change: [skills/persist/references/formats/roadmap.md](../skills/persist/references/formats/roadmap.md) `## Boundary` 从「内容禁令」改为 persist 行为约束:persist 不主动排序/排期/裁决价值,但不禁止维护者自行分 now/next/later 或标优先级;Sections 保持
    - verify: Boundary 不再读作「禁止该文件出现优先级/日期」
13. readme 格式
    - change: [skills/persist/references/formats/readme.md](../skills/persist/references/formats/readme.md) 第一段「标题+一句话定位」;用法注明非工具仓可并入上手/转可选;加可选层(License 链接、Contributing 链接、>100 行加目录);保留「不发明定位、无营销/徽章」
    - verify: 文件含「标题」「可选」分层
14. Phase 2 收口
    - verify: `pnpm test` 绿、`pnpm typecheck` 干净;逐份目视六份 `## Sections` 与本 plan Interface boundary 一致

## Verification

- command: `pnpm test && pnpm typecheck`
- checklist (manual):
  - [ ] 6 份 format 的 `## Sections` 与本 plan 一致,每份能指到来源
  - [ ] `formats/behavior.md` 全仓 0 命中,`spec.md` 在 catalog 与目录两侧
  - [ ] design 无「交互流程」、含 token 两层模型且仓内自包含
  - [ ] roadmap Boundary 是 persist 行为约束、非内容禁令
  - [ ] checkMemoryCatalog / checkMarkdownLinks 绿

## Rollback

纯文档/规范改动,无外部状态。整体回滚:`git revert` 本分支相应 commit(分阶段提交则按阶段 revert)。改名回滚:`git mv spec.md behavior.md` + 还原指针。每阶段独立提交,可单独回退。

## Risks & Unknowns

- **architecture「架构不变量」可能与维护者「只用目录」的极简倾向相左**:已标为可选;build 时若维护者要更精简可直接删该段。影响小。
- **design.md 外部规范会演进**:本方案选择复述进仓(维护者要求),代价是它升级时 squire 这份不会自动跟——可接受(自包含 > 自动跟随;漂了由后续 correct 处理)。
- **改名波及描述性「行为契约/behavior」措辞的边界判断**:规则是「作为目标名/条目名 → 改 spec;作为‘observable behavior/行为契约’描述 → 保留」。build 时按此规则逐处判断。
- **Unknown**: 无阻塞项。

## Mode-specific

见上文 `## Interface boundary` 与 `## Acceptance scenarios`(feat 必填,已填)。
