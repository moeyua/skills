# Praxis Architecture

详细的架构、目录结构、技术栈选型、数据流、关键设计决策记录。面向**开发者和协作 agent**，不是给使用者看的。使用者看 [README.md](./README.md) 即可。

## 一句话

praxis 的架构 = **真源层 + 内容层 + 索引层 + 生成层 + 验证层 + 测试层 + 元文档层**。整体设计目标：**多份元数据不靠人工维护，靠机械保证一致**。

## 目录结构

```
praxis/
├── README.md                         # 给使用者
├── ARCHITECTURE.md                   # 本文件
├── LICENSE
├── package.json                      # private: true，纯 dev 工具用
├── tsconfig.json
├── pnpm-lock.yaml
├── skills/                           # 内容层（npx skills add 扫描这里）
│   ├── RESOLVER.md                   # 人类可读路由索引
│   ├── explore/SKILL.md
│   ├── think/
│   │   ├── SKILL.md                  # 主体 + clarify phase + mode picker
│   │   └── references/
│   │       ├── mode-fix.md
│   │       ├── mode-feat.md
│   │       ├── mode-refactor.md
│   │       └── mode-perf.md
│   ├── implement/SKILL.md
│   ├── test/SKILL.md
│   ├── review/SKILL.md
│   ├── commit/SKILL.md
│   └── push/SKILL.md
├── rules/                            # 跨 skill 的 always-on 约束
│   ├── anti-patterns.md
│   └── durable-context.md
├── scripts/                          # 全 TS（库代码，被 tests/ 调用）
│   ├── frontmatter.ts                # 手写 parser，零运行时依赖
│   └── checks.ts                     # 各种 check 函数
└── tests/
    ├── frontmatter.test.ts           # parser 单元测试
    ├── checks.test.ts                # check 函数单元测试
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
| Frontmatter parser | 手写，零运行时依赖          | praxis frontmatter 只有 4 个字段，不需要完整 YAML；手写还能给精确报错 |
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
skills/think/references/*.md    # 多 mode 时的子文件，按需加载
rules/anti-patterns.md          # 跨 skill 的 always-on 反模式
rules/durable-context.md        # 跨 skill 的 memory 前置规则
```

**SKILL.md vs references/**：

- SKILL.md 全文加载——必须精简
- 当 skill 超 ~200 行（比如 think 有 5 个 mode），mode-specific 内容拆 references/
- agent 读完 SKILL.md，根据 mode picker 决定**再加载哪个 reference**——按需加载省 token

**rules/ vs skills/**：

- skills/ 是"用户触发"的能力
- rules/ 是"always-on 背景行为"——agent 不管在做什么都遵守
- 例：rules/anti-patterns.md 的"不要在 commit message 加 AI 署名"——适用所有 skill

### 3. 索引/路由

```
skills/RESOLVER.md              # 给人看的路由索引
每个 SKILL.md 的 description    # 给 agent 自动路由用
```

**两套路由**：

- **Agent 路由**：Claude Code 读所有 SKILL.md 的 frontmatter `description`，匹配用户消息——隐式的
- **人类路由**：开发者查"X 场景该用哪个 skill"——看 RESOLVER.md，显式的

两份不一致会出问题（agent 实际匹配 A，文档说该用 B）。`tests/smoke/verify-skills.test.ts` 通过调用 `scripts/checks.ts` 强制两者锁步。

### 4. 生成（Codegen）

**v1 阶段：无**。没有生成目标。

**v2 可能加回来**：如果以后要做 Claude Code plugin marketplace 或 README 自动 pin 版本，再加 `scripts/build-metadata.ts`。

### 5. 验证（Lint）

```
scripts/frontmatter.ts          # parser，零依赖
scripts/checks.ts               # 各种 check 函数（库代码）
tests/smoke/verify-skills.test.ts  # 整库验证 smoke（CI 入口）
```

**为什么不要独立 CLI 入口**：

`scripts/` 下只有库代码，没有可执行 CLI。验证由 `tests/smoke/verify-skills.test.ts` 触发——一个 vitest 测试，跑当前 repo 的 skill 文件验证整体一致。这样：

- 单一入口（`vp test run` 一次跑完单元测试 + 整库验证）
- 单元测试和整库验证用同一份逻辑（`scripts/checks.ts`），没有 CLI 与 vitest 之间的同步成本
- 加新 check 时只在 `scripts/checks.ts` 加函数 + 在 smoke 里加 `it()`，不需要改 CLI

**v1 必含的检查**（精简自 Waza 13 项的 8 项）：

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
tests/smoke/verify-skills.test.ts  # 整库 smoke（替代旧的 verify-skills CLI）
```

全部 vitest（通过 `vp test run`）。run via `pnpm test`。

### 7. 元文档

```
README.md                       # 给使用者看
ARCHITECTURE.md                 # 给开发者和协作 agent 看（本文件）
LICENSE
```

v1 暂不写 `AGENTS.md` / `CLAUDE.md`——praxis 当前是单人项目，等多人协作或需要约束 agent 自身行为时再加。

## 数据流

```
              [真源]
   package.json + SKILL.md frontmatter
              │
              ▼
         [库代码层]
   scripts/frontmatter.ts + checks.ts
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

`think` 比其他 skill 多 **Clarify Phase** 和 **Mode Picker** 两个 section；mode-specific 内容拆到 `references/mode-*.md`。

## think 的 mode 系统（详细）

| Mode       | 触发条件                                   | Clarify 关注               | 输出结构                       |
| ---------- | ------------------------------------------ | -------------------------- | ------------------------------ |
| (default)  | 想法模糊、探索性、"我想做..."、"该不该..." | 想清楚要解决什么问题       | 设计草案 / 头脑风暴结论        |
| `fix`      | 报错、行为异常、回归                       | 复现条件、影响面           | 根因报告 + 修复方案            |
| `feat`     | 新功能、新能力                             | 用户场景、接口边界、验收   | 实施方案 + 影响范围 + 验证方式 |
| `refactor` | 整理结构、不改外部行为                     | 行为保留边界、回归测试覆盖 | 重构方案 + 行为保留验证        |
| `perf`     | 性能差、慢、卡顿                           | baseline、目标数字、瓶颈   | baseline + 优化方案 + 测量     |

**mode 识别流程**：

```
用户 /think <内容>
  ↓
think SKILL.md 加载
  ↓
Clarify Phase（共通）
  ├── 提问澄清意图
  ├── 收集背景
  └── 识别 mode 信号
  ↓
Mode Picker
  ├── 无明确 mode 信号 → 留在 default
  └── 明确 mode 信号 → 加载对应 references/mode-X.md
  ↓
按 mode 输出对应类型的 plan
```

**核心约束**：

- 默认无 mode 即是探索状态——不需要单独 brainstorm skill
- mode 不是用户指定，是 agent 在 clarify 过程中识别
- 知道意图 ≠ 不需要澄清（用户说 `/think 重构这块`，agent 仍可能问"重构成什么样？保留哪些 API？"）
- 出方案前不写任何代码 / scaffolding / pseudo-code
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
   └── 用户重新 `npx skills add .` 或 `npx skills add git@...:praxis.git` 拉最新
```

v1 阶段没有 codegen，版本号只在 package.json 一处。

### 场景 3：新增第 8 个 skill `inspect`

```
1. mkdir skills/inspect
2. 写 skills/inspect/SKILL.md（frontmatter + Outcome Contract + 内容）
3. 在 skills/RESOLVER.md 加一行
4. pnpm test
   ├── smoke 自动发现新 skill 并跑所有 check
   ├── 触发词 Jaccard 检查它跟现有 7 个不撞车
   └── 路由一致性检查（RESOLVER.md 是否列出）
5. git commit
```

## 安装机制

praxis 通过 [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI 安装到 Claude Code，**不用** Claude Code plugin marketplace、**不用** install.sh 脚本。

### 命令名 = 目录名

Personal/project skill 的触发命令**取目录名**，不是 frontmatter 的 `name` 字段（[Claude Code skills 文档](https://code.claude.com/docs/en/skills)）。

praxis 的 `skills/think/SKILL.md` 装到 `~/.claude/skills/think/` 后，触发命令是 `/think`。即使 frontmatter 写 `name: something-else` 也不改这点。

### 触发方式：auto + manual

Claude Code skill 触发是双轨：

- **Auto-routing**：Claude 看每个 skill 的 `description` 字段，根据当前对话语义匹配
- **Manual invocation**：用户输 `/<name>` 直接触发

两种默认都开。frontmatter 的 `disable-model-invocation` / `user-invocable` 可分别关闭。

### 优先级：skill > command

> "If a skill and a command share the same name, the skill takes precedence."

实际影响：

| 冲突                                                      | 行为                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `/review`（Claude Code 内置）vs praxis review skill       | praxis 接管 `/review`                                                                |
| `/commit`（commit-commands plugin）vs praxis commit skill | plugin 有 namespace（`/commit-commands:commit`），不冲突；用户输 `/commit` 走 praxis |

### 默认 symlink

`npx skills add .` 默认创建 symlink 而非 copy——编辑仓库内的 SKILL.md 全局立刻生效。需要纯 copy 加 `--copy` flag。

### 不在 description 里放 `/<name>` trigger phrases

`/<name>` 是 manual invocation 语法，**不走** description-based auto-routing。在 description / when_to_use 里写 `/think` / `/commit` 等关键词没意义（不影响自动匹配，也不影响手动触发）。只放自然语言关键词（"想想" / "出方案" / "提交"等）。

## 关键设计决策记录

### 为什么 7 个 skill，不是 13 个？

原始 demo.md 有 13 个 skill（explore / plan / implement / test / review / commit / diagnose / clarify / refactor / optimize / submit / document / release）。决策过程：

- `clarify` 并入 `think` 作为 Clarify Phase——澄清几乎不独立发生
- `refactor` / `optimize` / `diagnose` 并入 `think` 作为 mode——它们都是"出方案"的不同类型
- `plan` 改名 `think`——更承载"思考 + 探索"的语义
- `document` v2 再考虑——野心更大，需要想清楚
- `release` v2 再考虑——各项目差异大，需要提炼通用机制
- `submit` 改名 `push`——更贴 git 语义

最终：explore / think / implement / test / review / commit / push。

### 为什么 think 用 mode 而不是多个 skill？

设计 A（意图即 skill，每个独立）vs 设计 B（think 统一入口 + mode）的取舍：

- 设计 A 假设**用户主动声明意图**
- 设计 B 假设**意图是聊出来的**——"自己都不知道想要什么"

观察到很多开发是"边聊边明白"的，B 更贴合真实场景。

代价：think SKILL.md 不能太大，所以 mode-specific 内容拆 references/。

### 为什么默认 mode 没有名字？

默认状态承载"探索 / 头脑风暴 / 价值判断"——brainstorm 就是没有任何 mode 的 think。给它命名（比如 `brainstorm` mode）反而增加认知负担，不命名让"默认状态 = 探索"成为天然的事实。

### 为什么不做 Marker（Waza 的 🥷）？

Marker 的主要价值是"反 hallucination invariant"——强制 agent 输出来自 SKILL.md。对单人维护的项目而言收益有限。v1 不加，未来出现"搞不清 skill 是否触发"的体感问题时再加（可逆决策）。

### 为什么不发 npm 包？

`npx skills add` 走 GitHub 直拉，不依赖 npm 发布。发 npm 唯一额外好处是 Pi 集成（`pi.skills` 字段），但 praxis 不针对 Pi。少一个分发渠道少一份维护负担。

### 为什么不写 marketplace.json？

Claude Code plugin marketplace 是另一条独立的安装路径，需要维护 `.claude-plugin/marketplace.json`。`npx skills add` 已经能覆盖 Claude Code 安装，不需要额外渠道。v2 如果想做"一键安装到多个 host"再加。

### 为什么把 verify 合并到 vitest，没有独立 CLI？

原本设计是 `scripts/verify-skills.ts` 作为 CLI 入口 + `tests/*.test.ts` 跑单元测试，两条路径。问题：

- 同一份 check 逻辑（`scripts/checks.ts`）有两个调用入口，加新 check 要同步两处
- `pnpm test` 实际跑 `pnpm verify && vp test run`，两步骤难维护
- `tsx` 仅为这个 CLI 而引入，作为额外的运行时依赖

合并到 vitest 后：

- `scripts/` 下只有库代码，没有可执行入口
- 所有验证通过 `tests/smoke/verify-skills.test.ts` 触发，跟单元测试同管线
- `vp test run` 一个命令搞定全部，`tsx` 依赖可以移除

代价：失去独立 `pnpm verify` 命令——但 `vp test run --filter=verify-skills` 等价，且实际上很少需要分开跑。

## v2 规划

以下能力暂不进入 v1，待想清楚或有真实需求再加：

### Skill 层面

- `think` 的 `arch` mode：架构调整、技术选型、模块重组
- `document` skill：文档管理——野心更大，需要想清楚边界。explore 的"必读文档清单"在 document skill 落地后可能调整
- `release` skill：发布流程——各项目差异大，需要提炼跨项目的通用机制（参考 Waza `/check` 的 Project Context Extraction 思路）
- `health` skill：项目体检——文档与代码的漂移检测、依赖陈旧、CI 状态、文件大小热点等。explore 故意只读不验证，把"文档说的 vs 代码实际"的对照工作留给 health

### 架构层面

- `scripts/build-metadata.ts`：codegen，如果加 marketplace.json 或 README install URL 自动 pin
- `.claude-plugin/marketplace.json`：plugin marketplace 支持
- `AGENTS.md` / `CLAUDE.md`：协作 agent 的 contributor guide
- Marker（🥷 等价物）：反 hallucination invariant，如果出现体感问题
- `rules/praxis-routing.md`：可选注入 host 的路由提示（给 Codex / Pi 等没有自动路由的 agent）

### 分发渠道

- Codex / Pi / Claude Desktop 多 host 支持
- npm 发布
- Claude Code plugin marketplace
