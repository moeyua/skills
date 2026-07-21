# Squire Architecture

详细的架构、目录结构、技术栈选型、数据流、关键设计决策记录。面向**开发者和协作 agent**，不是给使用者看的。使用者看 [README.md](./README.md) 即可。

## 一句话

squire 的架构 = **真源层 + 内容层 + 索引层 + 生成层 + 验证层 + 测试层 + 元文档层**。整体设计目标：**多份元数据不靠人工维护，靠机械保证一致**。

## 目录结构

```
squire/
├── README.md                         # 给使用者（英文，默认）
├── README.zh-CN.md                   # README 简体中文版
├── ARCHITECTURE.md                   # 本文件
├── PRODUCT.md                        # 定位 / 哲学 / 边界
├── ROADMAP.md                        # 搁置 / 未来项（record-only）
├── WORKFLOW.md                       # 本项目开发流程（agent 遵守；变更按大小分级）
├── LICENSE
├── package.json                      # private: true，纯 dev 工具用
├── tsconfig.json
├── pnpm-lock.yaml
├── skills/                           # 内容层（npx skills add 扫描这里）
│   ├── RESOLVER.md                   # 人类可读路由索引
│   ├── issue/                        # 可选入口：单条自然语言工作 → 强格式 GitHub Issue
│   │   ├── SKILL.md                  # 仓库解析、理解确认、label 与 gh mutation 边界
│   │   └── references/formats.md     # fix / feat / refactor / perf semantic section 真源
│   ├── explore/SKILL.md
│   ├── shape/
│   │   ├── SKILL.md                  # 主体 + clarify phase + mode picker
│   │   └── references/
│   │       ├── mode-fix.md
│   │       ├── mode-feat.md
│   │       ├── mode-refactor.md
│   │       └── mode-perf.md
│   ├── implement/SKILL.md            # 改造：含写测试（TDD + 不挂 plan 的补覆盖/回归）
│   ├── check/SKILL.md                # 校验：review / test / e2e 三模式
│   ├── docs/SKILL.md                 # 文档化：照记忆目录维护持久真源；也处理用户指定文档
│   ├── converge/SKILL.md             # 按需批量收敛 memory catalog，项目接入与升级复用同一流程
│   ├── commit/SKILL.md
│   ├── pr/SKILL.md
│   ├── doctor/                       # 正交工具（loop 外，项目体检）
│   │   ├── SKILL.md
│   │   └── scripts/checker.ts        # 随 skill 装的零依赖确定性检查器（node 24 直跑 .ts）
│   └── handoff/SKILL.md              # 正交工具（loop 外，会话交接摘要）
├── specs/                            # 持久行为契约（document 的 spec 目标，按 domain 一份）
│   ├── issue/spec.md                 # issue 对外行为与 GitHub mutation 安全边界
│   ├── converge/spec.md              # converge 逐文档状态判断、动作边界与幂等契约
│   └── <domain>/spec.md              # 行为契约：Purpose + Requirements（各带 Verify）
├── bench/                            # shape 行为评测（仓库开发工具，不随 skill 安装）
│   ├── README.md                     # 用法 / 架构 / 行为契约 / 校准纪律
│   ├── src/                          # normalizer / checks / judge / driver / reporter / cli
│   ├── scenarios/                    # 场景卡（驱动器输入，格式经单测机械校验）
│   ├── fixtures/                     # 合成小项目（driver 复制到临时目录后现场 git init）
│   ├── golden/                       # 人工判卷基准 + rubric 修订记录
│   └── results/                      # 运行产物（gitignored）
├── rules/                            # 跨 skill 规则 / 共享真源（symlink 进相关 skill 的 references/）
│   ├── anti-patterns.md
│   ├── durable-context.md
│   └── memory-catalog.md             # 记忆目录：explore 读 / docs 写 / doctor 查
└── tests/                            # squire 自检：check 库 + 单测 + 整库 smoke（私有 CI，不随 skill 走）
    ├── checks.ts                     # 各种 check 函数（库代码，被下面的测试调用）
    ├── frontmatter.ts                # 手写 parser，零运行时依赖
    ├── frontmatter.test.ts           # parser 单元测试
    ├── checks.test.ts                # check 函数单元测试
    ├── memory-catalog.test.ts        # 记忆目录↔format 锁步检查单测（自带独立 fixture）
    ├── checker.test.ts               # health checker 单元测试（fixture）
    ├── issue.test.ts                 # issue label、semantic schema 与语言行为锁步测试
    └── smoke/
        └── verify-skills.test.ts     # 整库 smoke：跑当前 repo 过所有 check
```

**唯一硬性约束**：不要在根目录放 `SKILL.md`——会破坏 `npx skills add` 的嵌套 skill 扫描。

## 技术栈

| 选择               | 工具                        | 理由                                                                  |
| ------------------ | --------------------------- | --------------------------------------------------------------------- |
| 运行时             | Node.js                     | 协作者机器普遍装了 Node，TS 由 vite-plus 内部处理                     |
| 包管理             | `pnpm`                      | 磁盘友好、严格依赖、社区标准                                          |
| 工具链             | `vite-plus`                 | test / lint / fmt / typecheck 统一在 `vp` 命令下                      |
| 测试               | `vp test`（vitest 内核）    | TS 友好、快、API 类 jest                                              |
| Lint / Format      | `oxlint` + `oxfmt`（自带）  | vite-plus 默认集成，速度快                                            |
| Frontmatter parser | 手写，零运行时依赖          | squire frontmatter 只有 4 个字段，不需要完整 YAML；手写还能给精确报错 |
| 版本真源           | `package.json` 的 `version` | TS 项目里 package.json 天然是版本入口，少一个文件                     |

**不需要的**：

- `.claude-plugin/marketplace.json`——不用 Claude Code plugin marketplace
- 单独的 `VERSION` 文件——package.json 字段够了
- 发布到 npm——`private: true`
- `scripts/build-metadata.ts`（codegen）——目前没有生成目标
- `install.sh`——`npx skills add` 替代

## 七层职责详解

### 1. 真源（Source of Truth）

```
package.json 的 version 字段          # 版本号
skills/*/SKILL.md 的 frontmatter      # 每个 skill 的元数据
```

**为什么需要"真源"概念**：版本号、skill 元数据可能出现在多处——手动维护一定漂移。指定唯一真源，其他全由代码生成。

v1 因为不做 codegen，真源只是"开发者必须只编辑这里"的约定。v2 加 codegen 时，这条约定立刻有机械价值。

### 2. 内容（实际功能）

```
skills/<name>/SKILL.md          # skill 主体，agent 触发时全文加载
skills/shape/references/*.md    # 多 mode 时的子文件，按需加载
rules/anti-patterns.md          # 跨 skill 的反模式（单一真源，symlink 进各 skill references/）
rules/durable-context.md        # 跨 skill 的 memory 前置规则（同上）
rules/memory-catalog.md         # 记忆目录：explore 读 / docs 写 / doctor 查（symlink 进 explore/docs 的 references/）
```

**SKILL.md vs references/**：

- SKILL.md 全文加载——必须精简
- 当 skill 超 ~200 行（比如 shape 有 5 个 mode），mode-specific 内容拆 references/
- agent 读完 SKILL.md，根据 mode picker 决定**再加载哪个 reference**——按需加载省 token
- `issue` 只在确认 `fix` / `feat` / `refactor` / `perf` 分类后读取一个集中格式 reference；格式与主流程不重复维护

**rules/ vs skills/**：

- skills/ 是"用户触发"的能力——Claude Code 扫 skills/，触发时加载对应 SKILL.md
- rules/ 是跨 skill 规则的**单一真源**。它们不靠独立安装，而是 **symlink 进每个 skill 的 `references/`**——`npx skills add` 装 skill 时会跟随 symlink、把规则内容当真文件一起装到所有 agent（实测：多 agent 的 `~/.agents` 共享 store + 外层 symlink 布局都能解析，删源仓库后仍自包含）。
- 每个 SKILL.md 顶部有一段统一指针：这两条规则适用于所有 squire 工作，本会话未读则读一次、读过别重读——第一个触发的 skill 加载，整会话共享，不随 skill 数翻倍。
- **Windows caveat**：repo 里存的是 symlink，Windows 上 `git clone` 可能不还原（需 `git config core.symlinks true`，或用 `npx skills add --copy`）。

### 3. 索引/路由

```
skills/RESOLVER.md              # 给人看的路由索引
每个 SKILL.md 的 description    # 给 agent 自动路由用
```

**两套路由**：

- **Agent 路由**：Claude Code 读所有 SKILL.md 的 frontmatter `description`，匹配用户消息——隐式的
- **人类路由**：开发者查"X 场景该用哪个 skill"——看 RESOLVER.md，显式的

两份不一致会出问题（agent 实际匹配 A，文档说该用 B）。`tests/smoke/verify-skills.test.ts` 通过调用 `tests/checks.ts` 强制两者锁步。

### 4. 生成（Codegen）

**v1 阶段：无**。没有生成目标。

**v2 可能加回来**：如果以后要做 Claude Code plugin marketplace 或 README 自动 pin 版本，再加 `scripts/build-metadata.ts`。

### 5. 验证（Lint）

```
tests/checks.ts                 # 各种 check 函数（库代码，被单测与 smoke 调用）
tests/frontmatter.ts            # parser，零依赖
tests/smoke/verify-skills.test.ts  # 整库验证 smoke（CI 入口）
```

**为什么 check 库住在 `tests/`、没有独立 CLI 入口**：

这套 check 库就是测试支撑代码——只被 `tests/` 调用，且（跟 `npx skills add` 不安装它一样）出不了仓、不是可移植的库，所以它跟自己的测试一起住在 `tests/`（`tests/checks.ts`），不再单列一个 `scripts/` 层。验证由 `tests/smoke/verify-skills.test.ts` 触发——一个 vitest 测试，跑当前 repo 的 skill 文件验证整体一致。这样：

- 单一入口（`vp test run` 一次跑完单元测试 + 整库验证）
- 单元测试和整库验证用同一份逻辑（`tests/checks.ts`），没有 CLI 与 vitest 之间的同步成本
- 加新 check 时只在 `tests/checks.ts` 加函数 + 在 smoke 里加 `it()`，不需要改 CLI

**v1 必含的检查**（8 项）：

1. frontmatter 解析与字段完整性
2. description 规范（"Use when" + "Not for"、长度 40-500）
3. Outcome Contract 四字段齐全
4. references 路径存在
5. markdown 链接有效
6. 触发词 Jaccard < 0.5（防止 skill 触发词撞车）
7. portable surface（无个人路径 / 无 AI 署名 / 无私有 context）
8. 路由一致性（RESOLVER.md 列出所有 skill）

**v2 可选**：marketplace 锁步、表格 pipe 转义、表格列对齐等。

### 6. 测试

```
tests/frontmatter.test.ts          # parser 单元测试
tests/checks.test.ts               # check 函数单元测试
tests/memory-catalog.test.ts       # 记忆目录↔format 锁步检查单测
tests/issue.test.ts                # issue label 词汇、四种 semantic schema 与语言行为
tests/smoke/verify-skills.test.ts  # 整库 smoke（替代旧的 verify-skills CLI）
```

全部 vitest（通过 `vp test run`）。run via `pnpm test`。

**tests/ vs bench/ 的分工**:`tests/` 验证仓库自身一致性(frontmatter、路由、spec 配对——机械、快、进 CI);`bench/` 评测 **skill 的行为遵守度**(把真实/驱动出的 shape 会话按 `specs/shape/spec.md` 逐条判定)——模型参与、有成本、手动触发,不进 CI。bench 的纯逻辑部分(normalizer / checker / schema 等)仍有单测,由 `vp test run` 一并覆盖(`bench/src/**/*.test.ts`)。详见 [bench/README.md](bench/README.md)。

### 7. 元文档

```
PRODUCT.md                      # 产品定位 / 设计哲学 / 边界
README.md                       # 给使用者看
ARCHITECTURE.md                 # 给开发者和协作 agent 看（本文件）
WORKFLOW.md                     # 本项目开发流程（变更分级:实质变更走 loop + PR,小修直 commit）
LICENSE
```

v1 暂不写 `AGENTS.md` / `CLAUDE.md`——squire 当前是单人项目，等多人协作或需要约束 agent 自身行为时再加。

## 数据流

`issue` 是 core loop 外的独立入口，没有指向 `shape` 的自动边：

```
自然语言 ──> issue/SKILL.md ──> 简短理解确认 ──> references/formats.md
                                                        │
                                                        ▼
                                              gh label / issue create
                                                        │
                                                        ▼
                                                  GitHub Issue URL
```

label 与 shape named modes 共享 `fix` / `feat` / `refactor` / `perf` 词汇，但不传递状态或自动启动下游 skill。正文格式由 reference 集中维护；运行时不引入 formatter/helper 层。

```
              [真源]
   package.json + SKILL.md frontmatter
              │
              ▼
         [库代码层]
   tests/frontmatter.ts + tests/checks.ts
              │
   ┌──────────┼──────────┐
   ▼          ▼          ▼
[单元测试]              [smoke 测试]
checks.test.ts          verify-skills.test.ts
frontmatter.test.ts     （跑整个 repo）
   │                     │
   └──────────┬──────────┘
              ▼
           vp test run
          ┌────┴────┐
          ▼         ▼
        PASS      FAIL
       继续      CI 阻塞
```

```
[内容层]                         [验证执行]
SKILL.md ─────────┐               vp test run
references/*.md   │                     │
rules/*.md        │                     ▼
       │          │              tests/ + smoke/
       ▼          │
   agent 触发时   │
   按需加载       ▼
                [索引层]
                RESOLVER.md
                       ▲
                       │
                  人类查阅
```

## SKILL.md 统一骨架

每个 skill 必须遵守的结构：

```yaml
---
name: <skill-name>
description: "40-500 字符，必含 'Use when ...' + 'Not for ...'"
when_to_use: "逗号分隔的触发关键词"
dispatch_intent: "一句话意图，给路由表用"
---

# <Title>: <一句话定位>

## Outcome Contract
- Outcome:
- Done when:
- Evidence:
- Output:

## <skill-specific sections>

## Gotchas
| What happened | Rule |
|---|---|
```

`shape` 比其他 skill 多 **context grounding / convergence assessment / material frontier / Mode Picker**。自适应策略集中在 `skills/shape/SKILL.md`，`references/mode-*.md` 只保留各 mode 的证据与完成门槛。

## shape 的 mode 系统（详细）

| Mode         | 触发条件                                   | 关键证据                        | 输出结构                       |
| ------------ | ------------------------------------------ | ------------------------------- | ------------------------------ |
| `brainstorm` | 想法模糊、探索性、"我想做..."、"该不该..." | 当前方向、约束、未决实质选择    | 会话内设计结论，不写文件       |
| `fix`        | 报错、行为异常、回归                       | 根因、复现与回归测试            | 根因报告 + 修复方案            |
| `feat`       | 新功能、新能力                             | 接口边界、用户场景与验收        | 实施方案 + 影响范围 + 验证方式 |
| `refactor`   | 整理结构、不改外部行为                     | 行为不变量与回归覆盖            | 重构方案 + 行为保留验证        |
| `perf`       | 性能差、慢、卡顿                           | baseline、target 与 measurement | baseline + 优化方案 + 测量     |

**mode 识别流程**：

```
用户 /shape <内容>
  ↓
shape SKILL.md 加载
  ↓
按当前决定所需风险做 Context grounding
  ├── 事实足够 → 带证据继续
  └── 事实缺失 / 过期 / 过浅 → 读项目来源或调用 explore context mode（无报告）
  ↓
判断收敛状态
  ├── 已收敛 → 直接综合
  ├── Evidence gap → 先调查
  ├── Material frontier → 解决当前可回答的实质选择
  └── 用户明确要求 grill → 全面压力测试
  ↓
Mode Picker
  ├── 模糊 / 探索性 → brainstorm 会话结论
  └── named mode → 加载对应 mode bar
                         ↓
              意图完备 + 已有授权 → conditional plan
```

**核心约束**：

- `brainstorm` 是 shape 的显式会话 mode，不是独立 skill，不写 plan/design/spec 文件
- shape 按当前决策的风险判断是否需要上下文探索；具体怎么探索由 explore context mode 定义
- mode 来自变更意图；用户可以点名，但 intentional behavior change 仍不能归到 `refactor`
- 只询问会改变 scope、外部行为/接口、难逆架构、风险或验收的 material frontier；独立问题可同轮带推荐处理
- 用户未表达偏好不等于委托；多个合理默认会产生不同可观察语义时，推荐只能降低决策成本，不能静默替用户授权
- 用户既有表态和授权直接进入综合；用户委托判断时由 shape 推荐并说明重要假设
- alternatives 只为真实且后果显著的 trade-off 展开，不设固定数量
- named mode 在意图完备且对话已授权时写 plan，不依赖固定标题、固定阶段或第二次确认
- shape 只写会话结论或 named-mode plan；plan 落盘也不允许继续写实现 / scaffolding / spec
- 不同 mode 的 plan 关注点不同：
  - fix 关注根因和回归测试
  - feat 关注接口和影响范围
  - refactor 关注行为保留
  - perf 关注 baseline 和测量

## 典型工作流

### 场景 1：改 SKILL.md 内容

```
1. 编辑 skills/<name>/SKILL.md
2. pnpm test  (= vp test run)
   ├── 单元测试（frontmatter / checks 函数）
   └── smoke：跑整个 repo 过 checks，发现 frontmatter / Outcome Contract / 链接问题
3. git commit
```

### 场景 2：发布 v0.2.0

```
1. 改 package.json version
2. pnpm test（CI 同样的检查跑一遍）
3. git tag v0.2.0
4. git push --tags
   └── 用户重新 `npx skills add .` 拉最新
```

v1 阶段没有 codegen，版本号只在 package.json 一处。

### 场景 3：新增下一个 skill `inspect`

```
1. mkdir skills/inspect
2. 写 skills/inspect/SKILL.md（frontmatter + Outcome Contract + 内容）
3. 在 skills/RESOLVER.md 加一行
4. pnpm test
   ├── smoke 自动发现新 skill 并跑所有 check
   ├── 触发词 Jaccard 检查它跟现有 skill 不撞车
   └── 路由一致性检查（RESOLVER.md 是否列出）
5. git commit
```

## 安装机制

squire 通过 [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI 安装到 Claude Code，**不用** Claude Code plugin marketplace、**不用** install.sh 脚本。

### 命令名 = 目录名

Personal/project skill 的触发命令**取目录名**，不是 frontmatter 的 `name` 字段（[Claude Code skills 文档](https://code.claude.com/docs/en/skills)）。

squire 的 `skills/shape/SKILL.md` 装到 `~/.claude/skills/shape/` 后，触发命令是 `/shape`。即使 frontmatter 写 `name: something-else` 也不改这点。

### 触发方式：auto + manual

Claude Code skill 触发是双轨：

- **Auto-routing**：Claude 看每个 skill 的 `description` 字段，根据当前对话语义匹配
- **Manual invocation**：用户输 `/<name>` 直接触发

两种默认都开。frontmatter 的 `disable-model-invocation` / `user-invocable` 可分别关闭。

### 优先级：skill > command

> "If a skill and a command share the same name, the skill takes precedence."

实际影响：

| 冲突                                                      | 行为                                                                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code 内置命令 vs squire skill 同名                 | 当前 11 个名字经核无内置同名（旧名时代 squire `/verify` 曾接管内置 verify，`verify→check` 后解除）；若未来出现同名，squire skill 接管 |
| `/commit`（commit-commands plugin）vs squire commit skill | plugin 有 namespace（`/commit-commands:commit`），不冲突；用户输 `/commit` 走 squire                                                  |

### 默认 symlink

`npx skills add .` 默认在 agent 目录(如 `~/.claude/skills/`)创建 symlink,指向 `~/.agents` 共享 store——但 store 里的内容是**安装时的拷贝快照**(这正是「删源仓库后仍自包含」成立的原因),编辑仓库内的 SKILL.md **不会**即时生效,需重跑 `npx skills add .`(实测 2026-06-10:仓库已改、装出的副本仍是旧版)。需要纯 copy 布局加 `--copy` flag。

### 不在 description 里放 `/<name>` trigger phrases

`/<name>` 是 manual invocation 语法，**不走** description-based auto-routing。在 description / when_to_use 里写 `/shape` / `/commit` 等关键词没意义（不影响自动匹配，也不影响手动触发）。只放自然语言关键词（"想想" / "出方案" / "提交"等）。

## 关键设计决策记录

### 为什么先做 7 个 skill，不是 13 个？（后增至 11）

原始 demo.md 有 13 个 skill（explore / plan / implement / test / review / commit / diagnose / clarify / refactor / optimize / submit / document / release）。决策过程：

- `clarify` 并入当前 `plan` 的 Clarify Phase——澄清几乎不独立发生
- `refactor` / `optimize` / `diagnose` 并入当前 `plan` 作为 mode——它们都是"出方案"的不同类型
- 设计入口最终收敛为 `plan`——直接表达"澄清后产出方案"的用户心智
- `document` v2 再考虑——野心更大，需要想清楚（其闭环内的一面后来收敛为 `spec` skill 落地，见下）
- `release` v2 再考虑——各项目差异大，需要提炼通用机制
- `submit` 改名 `push`（后再改名为当前 `pull-request`）——最终直接表达"开 PR"这一交付动作

最终（v1）：explore / plan / build / test / review / commit / pull-request。

后续新增 `spec`（第 8 个）——把"持久 spec 真源管理"纳入闭环（review 与 commit 之间的记录阶段），产物模型为 specs/ 真源 + plan 内 spec delta + 完成时合并。

### 2026-06-04 记忆支柱重构（8 → 7 skill，6 支柱）

把闭环重组成 **6 支柱**：理解 `explore` / 设计 `plan` / 改造 `build` / 校验 `verify` / 记忆 `document` / 交付 `commit`·`pull-request`。三处动作：

- **spec 升级为当前 `document`**——「持久 spec 真源」泛化为「持久记忆」：沿用 record/correct/backfill 三 mode，目标从 `specs/` 单一泛化到 `rules/memory-catalog.md` 里任一 artifact（行为契约 / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README）。记忆从此是一等支柱，而非 spec 一根半截柱。
- **校验合成 `verify`**——`review` + 原 `test` 的「跑」+ e2e 合为一个 skill 的三 mode（review / test / e2e）；review mode 承 code-review 的成熟做法，e2e mode 据内置 verify/run 设计。
- **解散 `test`**——它横跨改造与校验两柱：写测试归 `build`、跑/判测试归 `verify`、调失败根因归 `plan fix`。解散后支柱零跨柱。

同时重定 PRODUCT.md 哲学/边界 #2：从「只做代码闭环」到「开发 + 记忆」，记忆/文档（含 README）由记忆目录封顶进入 scope。详见 [plans/2026-06-04-feat-memory-pillar.md](plans/2026-06-04-feat-memory-pillar.md) 与 PRODUCT.md 边界 #2 的 2026-06-04 修订。

### 2026-06-09 core loop 收窄与命名重整

把当前产品分层拆成三类：

- **Core loop**：`explore -> plan -> build -> verify -> document`，只表达一次变更从理解、设计、实现、验证到文档化当前事实的最小闭环。
- **Workflow-managed stages**：`commit -> pull-request`，仍是 squire skills，但是否出现、何时出现由项目的 WORKFLOW 或维护者流程决定。
- **Orthogonal tools**：`health`，按需触发，不进入默认主线。

三处直接 rename，不保留旧 alias：`shape -> plan`、`persist -> document`、`propose -> pull-request`。`document` 的边界同时扩成两条 lane：默认维护 `rules/memory-catalog.md` 内的 durable memory；只有用户明确指定目标路径、文档类型或具体文档产物时，才维护 catalog 外项目文档。这样保留 core loop 的清晰度，同时不把发布、交接、项目特定流程硬写进默认闭环。

### 2026-06-10 handoff 作为 orthogonal tool

`handoff` 是第二个 orthogonal tool（第 9 个 skill）：只读收集当前会话与项目状态，在对话中输出可粘贴到新会话的 `HANDOFF CONTEXT` 纯文本摘要。定位结论：会话交接不依附于任何一次变更的闭环阶段，也不属于 `commit -> pull-request` 交付，所以与 `health` 同层、不进默认主线（ROADMAP 原留的「orthogonal tool 还是 workflow-managed stage」开放决策就此关闭）。关键边界：host-neutral（不绑定 OpenCode 等专属 API 或 TUI 步骤）、不写文件（摘要是临时物，写文件会制造持久文档的范围与清理问题）、敏感值只标注已省略、拿不到的 host 数据写 `Not available` 不猜测。PRODUCT 哲学 #2 的正交工具表述同步修订。详见 [plans/2026-06-09-feat-handoff-skill.md](plans/2026-06-09-feat-handoff-skill.md)。

### 为什么 shape 用 mode 而不是多个 skill？

设计 A（意图即 skill，每个独立）vs 设计 B（shape 统一入口 + mode）的取舍：

- 设计 A 假设**用户主动声明意图**
- 设计 B 假设**意图是聊出来的**——"自己都不知道想要什么"

观察到很多开发是"边聊边明白"的，B 更贴合真实场景。

代价：shape SKILL.md 不能太大，所以 mode-specific 内容拆 references/。

### 为什么把默认状态命名为 brainstorm？

旧设计把没有明确 mode 的状态视为无名 default；实践里这会让 agent 把 default 当成空档，而不是一条要执行的会话协议。现在把它显式命名为 `brainstorm`：它仍不是独立 skill，也不写文件；它的职责是在对话中收敛方向、约束、推荐与未决实质选择。想法收敛后，用户若已请求 plan、点名 named mode、同意方向或要求继续，授权已经成立；只有尚未授权时才询问是否进入 `fix` / `feat` / `refactor` / `perf`。

### 为什么不加 hallucination marker？

这种 marker 的主要价值是"反 hallucination invariant"——强制 agent 输出来自 SKILL.md。对单人维护的项目而言收益有限。v1 不加，未来出现"搞不清 skill 是否触发"的体感问题时再加（可逆决策）。

### 为什么不发 npm 包？

`npx skills add` 走 GitHub 直拉，不依赖 npm 发布。发 npm 唯一额外好处是 Pi 集成（`pi.skills` 字段），但 squire 不针对 Pi。少一个分发渠道少一份维护负担。

### 为什么不写 marketplace.json？

Claude Code plugin marketplace 是另一条独立的安装路径，需要维护 `.claude-plugin/marketplace.json`。`npx skills add` 已经能覆盖 Claude Code 安装，不需要额外渠道。v2 如果想做"一键安装到多个 host"再加。

### 为什么把 verify 合并到 vitest，没有独立 CLI？

原本设计是 `scripts/verify-skills.ts` 作为 CLI 入口 + `tests/*.test.ts` 跑单元测试，两条路径。问题：

- 同一份 check 逻辑（当时在 `scripts/checks.ts`，现已收进 `tests/checks.ts`）有两个调用入口，加新 check 要同步两处
- `pnpm test` 实际跑 `pnpm verify && vp test run`，两步骤难维护
- `tsx` 仅为这个 CLI 而引入，作为额外的运行时依赖

合并到 vitest 后：

- check 库只剩库代码、无可执行入口（这套库后来直接收进了 `tests/`——见上文「5. 验证」段）
- 所有验证通过 `tests/smoke/verify-skills.test.ts` 触发，跟单元测试同管线
- `vp test run` 一个命令搞定全部，`tsx` 依赖可以移除

代价：失去独立 `pnpm verify` 命令——但 `vp test run --filter=verify-skills` 等价，且实际上很少需要分开跑。

### 为什么 doctor 是带脚本的 skill，而不是把 checks.ts 做成可移植的？

squire 自己的 check 库（`tests/checks.ts`）是**私有 CI**：只在 `pnpm test` 时跑 squire 自己这个仓，`npx skills add` 只扫 `skills/`、不安装 `tests/`——它出不了 squire 仓，没法审计「用 squire 的别的项目」。凡是要落到消费项目上的检查，只能由唯一会装过去的东西承载——skill。所以 doctor 把确定性机械层做成一个**随 skill 一起装**的脚本 `skills/doctor/scripts/checker.ts`，在任何使用项目上由 agent `node` 直跑。（这也正是 squire 自己的 check 库住在 `tests/` 而非某个伪「库」目录的原因——它本就出不了仓。）

### 为什么 doctor 的脚本重新出现了"可执行入口"？

squire 自己的 check 库（`tests/checks.ts`）没有 CLI 入口——由 vitest 调用就够了。doctor 的 `checker.ts` 是**另一回事**：它在 skill 目录内，必须能被 agent 在消费项目上独立调用，所以带一个 CLI shim（`node checker.ts <root> [--json]`）；同时 `export` 各函数供 `tests/` 做 fixture 单测（查工具）。这**不是** codegen——`.ts` 原样发、Node 24 类型擦除直跑，无构建产物、不引入新依赖。

### 2026-06-11 命名统一到开发习惯轴

当时已有的 9 个 skill 名统一到一条标准：**每个名字 = 开发者已有习惯里的通行叫法**——git 习惯（`commit` / `pr`）、CLI 习惯（`doctor` / `check` / `docs`）、agent 习惯（`explore` / `shape 之于 plan mode 语境` / `handoff`）、方法论与 PR 文化（`shape` 取 Shape Up 的 shaping、`implement`）。6 改 3 留：`plan→shape`、`build→implement`、`verify→check`、`document→docs`、`pull-request→pr`、`health→doctor`；`explore` / `commit` / `handoff` 不动。不留旧 alias。后续新增的 `converge` 与 `issue` 沿用同一标准，当前共 11 个 skill。

本次显式修订 06-09 的三条 Key decisions：`shape→plan` 回退（06-09 自记的「plan 误导为只写计划文件」风险在维护者体感中兑现——plan 内不止是 plan）；`pull-request`、`document` 让位于开发者实际嘴里的叫法（`pr`、`docs`）。`build→implement` 修开发口语歧义（build = 编译打包）；`verify→check` 顺带解除对 Claude Code 内置 `/verify` 的遮蔽。曾考虑按词性（全动词）/音节（全短词）/隐喻（侍从主题）统一并拆分 brainstorm 独立 skill，均被否：统一定锚在「零陌生感」，拆分会恢复已否决的「意图即 skill」假设。详见 [plans/2026-06-11-feat-dev-convention-renames.md](plans/2026-06-11-feat-dev-convention-renames.md)。

### 2026-06-11 下一步推荐统一为「位置定模态」模型

各 skill 完成后的「下一步」建议从逐份手写的尾部文案,统一为可推导的模型:一次变更是一张状态图,skill 是节点,推荐 = 节点的出边,**位置定模态**。三类边:成功边(core loop 内,产品层硬编码)、失败边(问题类路由表:bug→shape fix、弱测试→implement、漂移→docs 等,原本就跨 skill 一致)、出口边(交付段,项目 WORKFLOW 定义,产品层只给默认值)。四种模态的分配:固定(shape named→implement、implement→check)/ 判断(check 按裁决、shape brainstorm、doctor 的 findings 路由)/ 默认可覆盖(docs→commit、commit→pr,覆盖源是项目 WORKFLOW 而非用户——用户的覆盖权由 PRODUCT 哲学 #3 的总规则保证)/ 不需要(issue、explore、pr、handoff)。

两个连带决策:**explore 全静默**——连报告模板的 Where to Start 段与 deep-dive 的 follow-up entry points 一并移除,它们是伪装成报告段落的下一步推荐,与「不需要」模态矛盾;**WORKFLOW.md 的 dogfood 链挪位**——`/docs` 从 `/pr` 之后挪到 `/check` 与 `/commit` 之间,因为本仓门禁 checkSpecPairing 要求 spec 与 skill 同 PR 同步,原顺序与自家门禁矛盾,挪位后持久记忆与代码原子合入。完整模型见 [skills/RESOLVER.md](skills/RESOLVER.md) 的 Chaining 段,决策过程见 [plans/2026-06-11-feat-next-step-modality.md](plans/2026-06-11-feat-next-step-modality.md)。

### 2026-06-12 plan 粒度定为决策级

shape 产出的 plan 从「行号级 edit 清单」收回到「决策级方案」,切分线按**决策类型**画,不按详细程度画:改意图的决定(做什么/不做什么、接口边界、验收场景、spec delta、关键取舍)留 shape;不改意图的机械决定(行级定位、最终措辞、改动微观顺序)移交 implement。步骤标准形态 = 结果描述 + 触及范围(路径级)+ verify;per-step verify 仍是硬要求——「步骤可独立验证」由 verify 承载,不由 edit 精度承载。implement 侧配套两条纪律:每步动手前先读 scope 内文件完成定位(定位先于编辑);scope 路径是意图层声明,结果要求改 scope 外文件即方案漂移回 shape,不算可自行拍板的机械决策。

理由:行号与预写措辞是 plan 中腐烂最快的内容(隔任何一次提交即失效),且 shape 为写出行号必须预做 implement 的阅读——双倍阅读买来的精确感只证明「当时文件长这样」,不证明决策是对的;粗粒度下 implement preflight 的漂移检测(grep 路径与函数名)照常成立。保留项:fix mode 的 Root cause `file:line` 不变——那是诊断证据(根因在哪),不是 edit 指令(去哪改)。这同时让 shape 与其命名出处自洽(Shape Up 的 shaping 即 rough / solved / bounded)。详见 [plans/2026-06-12-feat-plan-granularity.md](plans/2026-06-12-feat-plan-granularity.md)。

### 2026-06-12 架构产出定为跨 mode 维度,否决 arch mode

ROADMAP 原积「`shape` 的 `arch` mode / 产出架构」以否决 mode 读法的方式关闭:四个 named mode 是互斥的意图类型,而架构与它们全部相交(大型 feat 需要架构、结构性 refactor 即架构调整、perf 可经架构)——refactor-vs-perf 消歧问「目标不同」,arch-vs-refactor 只能问「规模大小」,切分轴不同构。本仓三次架构级变更(记忆支柱重构、core loop 收窄、rules symlink 化)的实证也指向缺口是字段标准化而非路由能力:三案都有合法 mode 归宿,即兴的只是架构字段。

承载形态改为 plan-template 的条件段 `## Architecture`(触发:跨模块边界 / 引入新层新服务 / 更换技术依赖;内容:现状→目标结构、组件职责与数据流、分阶段迁移;未触发写 None)。shape Phase 4 自检的「>3 组件画 ASCII 图」并入该段阈值;mode-feat 与 mode-refactor 互推架构决策的反模式同步修正(本变更自身的架构决策进段,无关顺手重构仍拆分)。技术选型不开新归宿——服务于 feat/refactor 时收敛进该 mode,纯决策走 `Key decisions → docs → ARCHITECTURE` 既有通道。该段只取维度清单(组件设计 / 数据流 / 构建序列),不取逐文件粒度(与 plan 粒度决策一致)。详见 [plans/2026-06-12-feat-shape-architecture-dimension.md](plans/2026-06-12-feat-shape-architecture-dimension.md)。

### 2026-07-01 shape 重写为 brainstorm-first 塑形协议

`shape` 从补丁式规则清单收束为一条共享协议：context grounding → Clarify → 2-3 approaches → grill 推荐方案 → design summary gate → plan。旧 `(default)` 改为 `brainstorm`：它是显式会话 mode，不写文件，只在方向收敛后请求进入 named mode。Named modes 仍是 `fix` / `feat` / `refactor` / `perf`，但写 plan 前必须展开可选 approaches、pressure-test 推荐项，并取得 design summary 确认。

主 `SKILL.md` 只保留入口、硬门禁、mode picker 和 reference routing；细节进 `skills/shape/references/shaping-protocol.md`，mode-specific bar 继续留在 `references/mode-*.md`。上下文探索不在 shape 内重写：shape 判断何时需要 grounding，explore context mode 定义如何 Overview / deep-dive / 无报告。详见 [plans/2026-07-01-feat-shape-brainstorming-protocol.md](plans/2026-07-01-feat-shape-brainstorming-protocol.md)。

### 2026-07-02 shape-bench:skill 行为遵守度可测化

「模型无法稳定遵守 shape 流程」此前只能靠人工判卷定性。新增顶层 `bench/`:对已有真实会话与驱动器自动跑出的会话,机械检查硬违规(HARD-GATE、brainstorm 写 plan、占位词、一轮多问)+ LLM judge 按 `specs/shape/spec.md` 逐条判定(阶段切分 → 逐 Requirement → 0-10 总分),经两个人工判卷 gold case 校准(分差 ≤0.5、判分抖动 ±0.5 已量化)。驱动器以 8 张场景卡 + 模拟用户跑完整会话:claude 侧 Agent SDK `canUseTool` 代答 AskUserQuestion,codex 侧 `exec`/`exec resume`。定位:仓库开发工具,与 `doctor`(消费项目体检)、`tests/`(仓库一致性)互不重叠;不进 specs/(`checkSpecPairing` 强制 specs↔skills 配对),对外契约固化在 [bench/README.md](bench/README.md)。首份真实基线:「逐枝 grill」6/6 fail、「design summary gate」与「决策交回用户」各 5/6 fail——反向优化 skill 文档的靶子。详见 [plans/2026-07-02-feat-shape-bench.md](plans/2026-07-02-feat-shape-bench.md)。

### 2026-07-21 shape 从流程遵守改为 outcome-first

真实回归显示，固定的 Clarify → 2–3 approaches → 逐枝 grill → `Design Summary` gate 会在意图已经收敛、用户已经同意时继续制造问题和重复确认。shape 因此改用 **material frontier**：先取得当前决定需要的事实，把用户已定内容当输入，只解决仍会改变范围、可观察行为/接口、难逆架构、风险或验收的选择；独立选择可成组附推荐，依赖选择后置，用户委托的判断由 agent 负责。用户没有表达偏好并不自动构成委托：若合理默认会产生不同的排序、搜索、持久化等可观察语义，选择仍留在 frontier。单一方向证据充分时直接推荐，只有真实后果取舍才展开 alternatives。授权从请求 plan、点名 mode、同意方向或“继续”等对话证据累积，不再要求固定 summary 标题或额外确认。

严格性移到结果边界：brainstorm 仍不写文件；named mode 仍产出 path-scoped、可验证且满足 fix / feat / refactor / perf 专属门槛的 plan；shape 在任何时点都不得写实现。原 `shaping-protocol.md` 删除，plan 核心段保持稳定，其余段按 Architecture、public surface、spec delta、rollback、风险等实际触发条件出现，未触发时直接省略。

bench 同步从 stage compliance 改为 outcome quality。机械 checker 只守写入边界、brainstorm 与占位符；judge 不再切固定 phases，改评 grounding、交互比例、实质决策覆盖、推荐质量、已定内容复用与 implementation readiness。场景扩为 9 张，并加入“完整请求直接写 plan”与“重复确认”回归证据。历史 rubric 分数保留但不可跨契约比较。详见 [plans/2026-07-21-fix-shape-outcome-first.md](plans/2026-07-21-fix-shape-outcome-first.md) 与 [bench/README.md](bench/README.md)。

### 2026-07-14 issue 作为 create-only 可选入口

第 11 个 skill `issue` 位于 core loop 外：它把一条自然语言开发工作压实为简短理解卡，用户确认后用当前 `gh` 身份按用户语言创建一个强格式 GitHub Issue，返回 URL 即停止。分类不再另造 taxonomy，而只复用 shape 的四个 named modes：`fix` / `feat` / `refactor` / `perf`；每个 Issue 恰好一个同名主 label，缺失时只按需创建当前 label，已有 label 不改元数据。

边界刻意封顶在 create-only：不使用 GitHub Projects、Draft、Issue Type、状态流、同步、拆票、仓库模板或跨 skill 自动化。主流程留在 `skills/issue/SKILL.md`，四种 semantic section key 与顺序集中在 `references/formats.md`，输出 heading 按用户语言自然本地化，仓库私有测试机械锁定 label、schema 与语言行为；v1 不引入 runtime helper。详见初版 [plans/2026-07-14-feat-issue-skill.md](plans/2026-07-14-feat-issue-skill.md) 与语言中立修订 [plans/2026-07-14-feat-language-neutral-issue-format.md](plans/2026-07-14-feat-language-neutral-issue-format.md)。

## 未来规划

搁置 / 未来项见 [ROADMAP.md](ROADMAP.md)（record-only）——设计文档只讲当下，未来项归 ROADMAP。主要待办：`release` skill，以及 marketplace / 多 host 分发等。（`doctor`、`handoff` 已落地——loop 外正交工具。）
