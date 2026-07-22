# Squire Architecture

本文记录 Squire 当前的技术结构、数据流与仍然有效的设计决策。面向开发者和协作 agent；使用方式见 [README.md](./README.md)，产品边界见 [PRODUCT.md](./PRODUCT.md)。

## 一句话

Squire 是一组以 Markdown 编写、可独立安装和按需调用的开发 skills。能力之间通过会话、文件和 git/GitHub 状态软连接；没有全局编排器，唯一自动闭环位于一次 `implement` outcome 内部。

## 目录结构

```text
squire/
├── README.md / README.zh-CN.md      # 使用者入口
├── PRODUCT.md                       # 产品定位、原则与边界
├── ARCHITECTURE.md                  # 当前技术架构与决策记录
├── ROADMAP.md                       # 已决定延后的未来项
├── package.json                     # 开发工具、命令与 Node 版本约束
├── skills/
│   ├── RESOLVER.md                  # 人类可读的公共路由索引
│   ├── explore/                     # 只读项目理解
│   ├── shape/                       # 会话内设计收敛
│   ├── plan/                        # 本地计划 + 尽力创建 Issue
│   ├── implement/                   # 实现 + 自动 check 修复闭环
│   ├── check/                       # 只读 review / test / e2e
│   ├── docs/                        # 聚焦维护持久记忆
│   ├── publish/                     # commit + push + pull request
│   ├── release/                     # tag + GitHub Release notes
│   ├── converge/                    # 批量收敛记忆目录
│   ├── doctor/                      # 只读全项目体检与 checker
│   └── handoff/                     # 会话交接摘要
├── rules/                            # 跨 skill 的共享语义真源
│   ├── anti-patterns.md
│   ├── durable-context.md
│   ├── change-types.md
│   └── memory-catalog.md
├── specs/<domain>/spec.md            # 每个公共 skill 的持久行为契约
├── plans/                             # 单次变更计划与历史决策上下文
├── tests/                             # 结构、契约、checker 与整库 smoke
└── bench/                             # shape 行为评测；开发工具，不随 skill 安装
```

`skills/*/references/` 同时容纳能力专属资料和指向 `rules/` 的相对 symlink。共享规则只有一个可编辑真源，安装后仍作为目标 skill 的自包含 reference 使用。

## 技术栈

| 层                | 选择                              | 原因                                                                   |
| ----------------- | --------------------------------- | ---------------------------------------------------------------------- |
| 能力定义          | Markdown `SKILL.md` + frontmatter | 由支持 skills 的 agent host 直接发现和加载，无运行时框架               |
| 安装              | `skills` CLI                      | 从 `skills/` 扫描独立能力，并安装到所选 agent                          |
| 开发运行时        | Node.js 24+、TypeScript           | checker 与测试工具可直接运行 `.ts`，保持零生产运行时包                 |
| 包管理            | pnpm                              | 严格、可复现的开发依赖与脚本入口                                       |
| 工具链            | Vite+                             | 统一 test、lint、format 与 typecheck；测试使用 Vitest 接口             |
| git/GitHub 副作用 | git 与 GitHub CLI                 | publish、release 以及 plan 的可选 Issue 投影复用项目已有身份和仓库状态 |

仓库不发布 npm 运行时包，也没有 codegen 或全局 workflow engine。`package.json` 为私有开发工具清单；skill 的真实产品表面是 Markdown、references 和 doctor 随装的确定性脚本。

## 能力图与数据流

```text
                              explore
                                 ·
                                 ▼
shape · · ·▶ plan · · ·▶ implement ⇄ check · · ·▶ docs · · ·▶ publish · · ·▶ release

converge / doctor / handoff 位于主图之外，按需正交使用。
```

虚线表示常见的上下文传递，不表示前置条件或自动流转。任何能力在自身输入足够时都可直接调用。图中只有三种刻意保留的内部组合：

1. `shape` 缺少项目事实时可取得只读 `explore` context；这不会额外产出 Explore Report。
2. `plan` 先写本地计划，再尽力创建至多一个同范围 GitHub Issue；远端失败不使计划失效。
3. `implement` 在实现验证后调用独立、只读的 `check`，修复已授权范围内的 blocker 并重新检查，直到通过或触及真实边界。

其余节点完成自身 outcome 后停止。用户决定是否进入下一个公共能力。

### 组件职责

| capability | 写入或结果                                             | 关键边界                                 |
| ---------- | ------------------------------------------------------ | ---------------------------------------- |
| explore    | 项目报告，或供调用方使用的事实 context                 | 只读，不判断 docs 是否漂移               |
| shape      | 会话内 grounded direction 与已决/未决事项              | 不写 plan、Issue、spec 或实现            |
| plan       | `plans/YYYY-MM-DD-<slug>.md`，可选 canonical Issue URL | 本地计划优先；Issue 失败非阻塞           |
| implement  | 代码、测试、验证证据、最终 check verdict               | 不自动进入 docs、publish、release        |
| check      | review findings、测试结果、e2e observation 与 verdict  | 可独立调用；永不修改文件                 |
| docs       | 六类 catalog memory 或用户明确指定的项目文档           | 只记录已有权威来源的 truth               |
| publish    | 有意图的 commit、已推送分支、已创建或复用的 PR         | 状态感知；不 merge、不 force、不 release |
| release    | 经过核验的 tag 与 GitHub-generated Release notes       | 不 bump version、不部署、不回滚          |
| converge   | catalog 每份文档的状态判定与幂等收敛                   | 只处理 catalog；内容改动保留确认边界     |
| doctor     | docs↔code 漂移与机械健康报告                           | 只读、只指路                             |
| handoff    | 可在新会话独立使用的上下文摘要                         | 只读，不写项目记忆                       |

### Artifact 流

| artifact / state                       | producer          | consumers                                | 缺失或失败时                                  |
| -------------------------------------- | ----------------- | ---------------------------------------- | --------------------------------------------- |
| 会话内 shape 结论                      | shape             | plan、implement、docs                    | 不是其他能力的有效性门槛                      |
| 本地 plan                              | plan              | implement、publish、docs                 | 明确请求仍可直接实现或发布                    |
| canonical Issue URL                    | plan              | publish                                  | 无 URL 时省略 closing reference；不按标题猜测 |
| 工作树、测试与 check 证据              | implement / check | docs、publish                            | 各消费者只要求自身 outcome 真正需要的证据     |
| 六类持久记忆                           | docs / converge   | explore、shape、implement、check、doctor | 按 catalog 的适用性读取，不制造空文档         |
| branch / upstream / PR state           | publish           | 人类评审、可选 release 前置工作          | 每个已完成副作用保留，失败点准确报告          |
| local tag / remote tag / Release state | release           | 使用者与 GitHub                          | 不做伪原子回滚；从已完成状态恢复              |

`publish` 和 `release` 都先读取当前状态，再只补缺失动作。外部副作用不是事务：push 失败不会删除本地 commit，PR 创建失败不会撤回已推送分支，Release 创建失败不会删除已经推送的 tag。模糊结果通过 canonical identity 查询一次，不靠盲重试制造重复对象。

## 真源与共享机制

### 公共 inventory 与路由

公共 inventory 是 `skills/` 下的 11 个能力目录。每个 `SKILL.md` frontmatter 的 `description` 供 agent runtime 路由；[skills/RESOLVER.md](skills/RESOLVER.md) 是给人看的同一表面。整库 smoke 机械要求 resolver、skill 目录和 `specs/<domain>/spec.md` 精确配对。

删除的公共名称不保留 alias。历史 plan 中出现旧名称只是当时决策的快照，不参与当前安装或路由。

### 共享规则

- `rules/anti-patterns.md` 与 `rules/durable-context.md` 是所有适用能力共享的行为边界。
- `rules/change-types.md` 唯一定义 `fix`、`feat`、`refactor`、`perf`；shape、plan、implement 通过 symlink 读取。
- `rules/memory-catalog.md` 唯一定义 spec、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README 六类持久记忆；explore/docs 通过 symlink 读取，converge 复用同装 docs 的 catalog 与 formats。
- `skills/docs/references/formats/` 定义六类记忆的结构；format 不是第二份产品 truth。

### 行为契约与历史记录

`specs/<domain>/spec.md` 记录每个公共 skill 当前可观察行为，每条 requirement 带 `Verify:`。`plans/` 记录一次变更的实施上下文和当时决策；旧 plan 不随架构迁移批量改写，因此不能被当作当前接口索引。

## 验证架构

验证分为三层：

1. **仓库结构与契约测试**：frontmatter、Outcome Contract、引用、Markdown 链接、路由、skill↔spec、公共 inventory、共享 symlink、memory catalog 和新能力的关键文本契约。
2. **确定性项目检查**：`skills/doctor/scripts/checker.ts` 检查 spec 格式、链接、placeholder 和文件规模等机械事实；doctor 再负责模型才能判断的 docs↔code 语义漂移。
3. **shape 行为评测**：`bench/` 用合成项目、场景、transcript normalizer、确定性边界检查和外部 judge 评估对话是否 grounded、proportional、decision-aware 且无写入。它手动运行、不进入 CI，历史 judge 结果只在同一契约和 judge 下可比。

开发门禁入口：

```bash
pnpm check
pnpm test
pnpm lint
node skills/doctor/scripts/checker.ts . --json
```

## 安装与可移植性

`npx skills add .` 从 `skills/<name>/SKILL.md` 发现能力。根目录不能出现 `SKILL.md`，否则安装器会把仓库误判成一个整体 skill，破坏 11 个独立入口。

共享 reference 在源码仓库中使用相对 symlink。默认安装布局会把所需内容带入 agent 的 skill store；对 symlink 支持受限的环境可使用 `--copy`。安装是快照，源码仓库变化后需要重新执行安装命令。

## 架构不变量

1. 公共表面恰好是 resolver 列出的 11 个 skill，并与 11 份 domain spec 一一对应。
2. 每个 skill 可独立由用户进入；缺少某个上游 artifact 本身永远不是拒绝工作的理由。
3. 虚线边只传递可用 context；不存在从 shape 一路自动推进到 release 的 orchestrator。
4. `implement ⇄ check` 是唯一自动修复闭环；直接调用 check 始终只读并在 verdict 后停止。
5. shape 只负责对话塑形，plan 才负责持久计划和可选 Issue 投影。
6. 默认 durable memory 恰好六类，不含项目工作流或 agent 自行发明的第七类文档。
7. plan 的 Issue、publish 的 git/GitHub 写入、release 的 tag/Release 是各自 outcome 内唯一授权的外部副作用；部分成功必须保留并如实报告。
8. 共享 change type、memory catalog 和跨 skill 规则各有单一真源；复制而非引用会造成漂移，不是可接受的扩展方式。
9. 不在仓库根目录放 `SKILL.md`。

## 关键设计决策记录

以下记录按发生时间保留架构理由；标为“历史、已被取代”的决定只解释演进，不描述当前行为。

### 2026-05-29：共享规则使用 symlink

上下文：多个 skill 都要遵守相同的反模式与持久上下文规则，复制会产生语义漂移。决定：规则留在 `rules/` 单一真源，通过相对 symlink 暴露到各 skill 的 references。后果：编辑点唯一、安装结果自包含，但源码 checkout 需要正确保留 symlink。详见 [rules-as-symlinked-references plan](plans/2026-05-29-refactor-rules-as-symlinked-references.md)。

### 2026-06-04：持久记忆成为独立支柱

上下文：行为 spec 无法承载产品定位、架构、设计与使用入口。决定：用有界 memory catalog 区分各类持久真源，并让读取、写入与审计能力共享目录。后果：docs 不再是泛化“写文档”，每类内容都有 Source 与 Boundary；当前目录已在 2026-07-21 收敛为六类。详见 [memory-pillar plan](plans/2026-06-04-feat-memory-pillar.md) 与 [memory-format-specs plan](plans/2026-06-04-feat-memory-format-specs.md)。

### 2026-06-09：固定 core loop（历史、已被取代）

上下文：早期能力名称和交接关系不清晰。决定：当时将开发动作组织为固定核心循环和项目管理的交付段。后果：短期提供了清晰路线，但把上下文关系误表达成阶段门禁；2026-07-21 的软连接架构明确取代该拓扑。历史理由见 [core-loop rename plan](plans/2026-06-09-feat-core-loop-workflow-renames.md) 和 [workflow-stage fix plan](plans/2026-06-24-fix-workflow-stage-backbone.md)。

### 2026-06-10 至 2026-07-01：校验与探索分离

上下文：只读判断既需要完整 gate，也需要可靠项目事实。决定：check 在无 mode 线索时运行 review + test，并在适用时加入 e2e；explore 同时支持用户报告和内嵌 context preflight，始终先总览再按风险深入。后果：check 的 verdict 有事实基础，但两个能力仍可独立调用且保持只读。详见 [default-gate plan](plans/2026-06-10-feat-verify-default-gate.md)、[explore deep-dive plan](plans/2026-06-11-feat-explore-deep-dive.md) 和 [context-preflight plan](plans/2026-07-01-feat-explore-context-preflight.md)。

### 2026-07-02 至 2026-07-03：行为 bench 与正交维护能力

上下文：结构测试不能证明模型真正遵守 shape 的会话边界，单目标 docs 也不适合项目接入时的批量格式迁移。决定：增加开发期 shape bench；增加幂等 converge，并保留 doctor 与 handoff 为图外正交能力。后果：模型行为与机械一致性分别验证，批量维护不污染主能力关系。详见 [shape-bench plan](plans/2026-07-02-feat-shape-bench.md)、[converge plan](plans/2026-07-03-feat-converge-skill.md) 和 [handoff plan](plans/2026-06-09-feat-handoff-skill.md)。

### 2026-07-14：独立 Issue 创建（历史、已被取代）

上下文：开发工作需要一个语言中立、强格式的 GitHub 追踪对象。决定：最初提供 create-only 的独立入口，并复用四种 change type。后果：Issue schema 与安全边界得到验证，但 plan 和 Issue 分成两个入口会产生重复意图与关联问题；2026-07-21 将其合入 plan，保留 best-effort、至多一个和语言中立的有效约束。历史见 [issue plan](plans/2026-07-14-feat-issue-skill.md) 与 [language-neutral format plan](plans/2026-07-14-feat-language-neutral-issue-format.md)。

### 2026-07-21：shape outcome-first

上下文：模型能力提升后，固定阶段、重复确认和固定格式会让对话服务流程而不是服务决策。决定：shape 只守 grounded、material frontier、推荐、边界和零写入结果约束，过程由模型按问题复杂度决定。后果：shape 更短、更自然；文件产出职责必须由独立 plan 承担。详见 [shape outcome-first plan](plans/2026-07-21-fix-shape-outcome-first.md)。

### 2026-07-21：软连接能力图（当前）

上下文：固定流程不能表达“能力可直接进入”“GitHub 失败不阻塞本地工作”和“已授权实现应自行闭环校验”。决定：公共表面改为 11 个独立 skill；shape 与 plan 分离，Issue 合入 plan，commit/push/PR 合入 publish，release 只负责通用 tag + generated notes，且只有 implement 自动组合 check。后果：用户保留宏观串联权，skill 可以在自身 outcome 内完成必要组合；缺失上游产物成为正常状态，外部副作用按阶段保留。完整设计见 [soft-linked architecture plan](plans/2026-07-21-feat-soft-linked-skill-architecture.md)。

## 未来项

已决定延后的事项只记录在 [ROADMAP.md](./ROADMAP.md)。
