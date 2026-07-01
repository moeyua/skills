# Squire

[English](./README.md) | 简体中文

> Your AI agent has the horsepower. Squire gives it the road.

AI 的原始产出能力已经很强，但没有结构，这份能力会漂成泛泛、不精确的活儿。Squire 给它结构：把「理解 → 设计 → 实现 → 校验 → 文档化」这条开发主线拆成 9 个各司其职的 skill，每个只做好一件事。

它不只是工具集，而是一套**克制的指令系统**——每条 rule 都是 ceiling 不是 floor，Agent 只做指令允许的事，其余交还模型自己的 judgment。完整的设计哲学与产品边界见 [PRODUCT.md](./PRODUCT.md)。

## 9 个 Skill

Squire 把项目理解和变更闭环分开：`explore` 提供 context 或独立报告；`shape → implement → check → docs` 是 core loop；`commit` / `pr` 是由项目流程决定的交付阶段；`doctor` / `handoff` 保持正交。

| Skill       | 位置                   | 作用                                                           |
| :---------- | :--------------------- | :------------------------------------------------------------- |
| `explore`   | context / report       | 按需建立项目上下文；只有用户主动要求时才产出报告               |
| `shape`     | core loop              | 澄清意图 + 出方案（default / fix / feat / refactor / perf）    |
| `implement` | core loop              | 按方案做最小、可控、合项目风格的改动；含写测试（TDD + 补覆盖） |
| `check`     | core loop              | review / test / e2e 三模式确认改动立得住，只裁决不改           |
| `docs`      | core loop              | 默认照记忆目录维护项目持久真源；用户指定时也维护目录外文档     |
| `commit`    | workflow-managed stage | 整理变更、生成清晰 commit message，必要时拆分提交              |
| `pr`        | workflow-managed stage | 推送分支、综合分支历史准备 PR 描述与 test plan                 |
| `doctor`    | orthogonal tool        | 项目体检：文档↔代码漂移（主）+ 依赖/CI/文件陈旧；只读 advisory |
| `handoff`   | orthogonal tool        | 会话交接：只读收集当前状态，输出可粘贴到新会话的自包含摘要     |

命名统一在一条标准上——**每个名字都取开发者已有习惯里的通行叫法**：git 习惯（`commit` / `pr`）、CLI 习惯（`doctor` / `check` / `docs`）、agent 习惯（`explore` / `handoff`）、方法论与 PR 文化（`shape` 取 Shape Up 的 shaping、`implement`）。命名决策记录见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 安装

```bash
npx skills add .
```

常用 flag：

- `-g` 装到全局（`~/.claude/skills/`），不加则是 project 级（`.claude/skills/`）
- `-a claude-code` 指定 agent，不加会询问
- `-y` 跳过确认
- `--copy` 改用纯复制布局；默认走 symlink 进 `~/.agents` 共享 store，但 store 内容是**安装时的快照**——改完仓库需重跑 `npx skills add .` 才生效

装完即可触发：`/explore`、`/shape`、`/implement`、`/check`、`/docs`、`/commit`、`/pr`，以及正交工具 `/doctor`、`/handoff`。

## 工作流

Core loop 是一次变更走过的最小闭环：

```
shape → implement → check → docs
```

`explore` 不是默认 workflow 步骤。需要独立理解报告时由用户主动触发；否则 `shape`、`implement`、`check`、`docs`、`doctor` 可在内部把它作为 context preflight 使用，并把证据带入自己的输出。

交付阶段按项目的 `WORKFLOW.md` 决定是否接在后面：

```
commit → pr
```

`doctor` 与 `handoff` 不在线性环里——前者是按需触发的整体体检（与 `check` 的「合并前看一次改动」互补），后者在会话需要结束或交接时生成只读摘要。

每个 skill 完成后**默认停下，等用户决定下一步**。技能之间不自动串联，转移是用户的明确动作；完成报告里的「下一步」只是建议，串联权始终在用户。详见 [ARCHITECTURE.md](./ARCHITECTURE.md) 的「位置定模态」模型。

## shape 的 mode

`shape` 通过 mode 适配不同意图——mode 不由用户指定，而由 agent 在澄清过程中识别：

| Mode       | 何时进入                       | 输出                    |
| :--------- | :----------------------------- | :---------------------- |
| (default)  | 想法模糊，需要协作探索         | 设计草案 / 头脑风暴结论 |
| `fix`      | 报错、行为异常、回归（含诊断） | 根因报告 + 修复方案     |
| `feat`     | 新功能                         | 实施方案 + 影响范围     |
| `refactor` | 不改外部行为、整理代码         | 重构方案 + 行为保留验证 |
| `perf`     | 性能优化                       | baseline + 优化方案     |

默认无 mode 即是探索状态——brainstorm、tradeoff framing 都落在这里，不需要单独的 skill；真正「该不该做」的价值判断仍交回用户。详细的 mode 设计与数据流见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 设计哲学

所有设计决策都从 5 条派生——它们不是教条，是判断标尺：

- **克制** — rule 是 ceiling，不是 floor；给 why 比给命令更有效
- **聚焦开发 + 记忆** — 不只改代码，也记住代码持久地是什么
- **用户决定串联** — skill 间不自动跑，每个决策点都属于用户
- **机械保证一致** — 能让工具守的，不靠纪律
- **对话式 + 解释 why** — SKILL.md 讲清根目的，约束都补 why，不堆 MUST / NEVER

展开与 5 条产品边界见 [PRODUCT.md](./PRODUCT.md)。

## 致谢

以下项目对 Squire 有所启发，在此致谢（不分先后，欢迎补充）：

- [Waza](https://github.com/tw93/Waza)
- [superpowers](https://www.skills.sh/obra/superpowers/brainstorming)
- [Shape Up](https://basecamp.com/shapeup)
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev)
- [design.md](https://github.com/google-labs-code/design.md)
- [mattpocock/skills](https://github.com/mattpocock/skills)
- [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)

## License

MIT
