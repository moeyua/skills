# Squire

> 一套用于 Agent 辅助开发的 Skills，把完整的代码开发闭环沉淀成 Agent 可调用的技能。

> 设计哲学和产品边界见 [PRODUCT.md](./PRODUCT.md)。

## Skills

9 个 skill，分为 core loop、workflow-managed stages 和 orthogonal tools：

| Skill       | 分层                   | 作用                                                                            |
| :---------- | :--------------------- | :------------------------------------------------------------------------------ |
| `explore`   | core loop              | 理解项目结构、技术栈、入口、相关代码和运行方式                                  |
| `shape`     | core loop              | 意图澄清 + 出方案（default / fix / feat / refactor / perf）                     |
| `implement` | core loop              | 按方案做最小、可控、符合项目风格的代码修改；含写测试（TDD + 补覆盖/回归）       |
| `check`     | core loop              | review / test / e2e 三模式确认改动立得住，只裁决不改                            |
| `docs`      | core loop              | 默认照记忆目录维护项目持久真源；用户明确指定时可维护 catalog 外具体项目文档     |
| `commit`    | workflow-managed stage | 整理变更，生成清晰的 commit message，必要时拆分提交                             |
| `pr`        | workflow-managed stage | 推送分支、准备 PR 描述与 test plan                                              |
| `doctor`    | orthogonal tool        | 项目体检：文档↔代码漂移（主）+ 依赖/CI/文件陈旧；只读 advisory，loop 外正交审计 |
| `handoff`   | orthogonal tool        | 会话交接：只读收集当前会话与项目状态，输出可粘贴到新会话的自包含摘要；不写文件  |

> 命名统一在一条标准上：**每个 skill 名 = 开发者已有习惯里的通行叫法**——git 习惯（`commit` / `pr`）、CLI 习惯（`doctor` / `check` / `docs`）、agent 习惯（`explore` / `handoff`）、方法论与 PR 文化（`shape` 取 Shape Up 的 shaping、`implement`）。详见 ARCHITECTURE 的命名决策记录。
>
> `doctor` 是 loop 外的整体项目体检（与 `check` 的「合并前看一次改动」互补）。它机械层带一个随 skill 装的零依赖脚本，只检测、只报告，修正交回 `docs` / `shape fix`。
>
> `handoff` 同为 loop 外正交工具——会话需要结束、压缩或换 agent 时生成交接摘要，服务会话连续性而非项目文档（项目文档走 `/docs`）。

## Install

```bash
npx skills add .
```

常用 flag：

- `-g` 全局（`~/.claude/skills/`），不加是 project 级（`.claude/skills/`）
- `-a claude-code` 指定 agent，不加会询问
- `-y` 跳过确认
- `--copy` 改为纯复制布局；默认 symlink 进 `~/.agents` 共享 store，但 store 内容是**安装时的快照**——改仓库后需重跑 `npx skills add .` 才生效

装完后触发命令：`/explore` / `/shape` / `/implement` / `/check` / `/docs` / `/commit` / `/pr`，以及正交工具 `/doctor` / `/handoff`。

**命名冲突**：当前名单经核与 Claude Code 内置命令无同名（旧名时代 `/verify` 曾遮蔽内置 verify，改名 `/check` 后解除）。`/commit` 跟 `commit-commands` plugin 不撞（plugin 命令有 namespace `/commit-commands:commit`），但用户级 `/commit` 仍走 squire。若你的机器装有同名 personal skill，规则是 skill > command，最坏是遮蔽、装时即见。

## 工作流

Core loop：

```
explore → shape → implement → check → docs
```

Workflow-managed stages（按项目的 `WORKFLOW.md` 或维护者流程决定是否出现、何时出现）：

```
commit → pr
```

每个 skill 完成后**默认停下，等用户决定下一步**。技能不自动串联——技能之间的转移是用户的明确动作。`docs` 是条件环节——变更产生了值得记的持久记忆（行为契约 / 架构 / …）时才介入，照记忆目录写进真源；用户明确指定时，它也可维护 catalog 外具体项目文档。`doctor` 不在线性环里——它是按需触发的整体体检，照出哪份记忆漂了，再交回 `docs` 修。`handoff` 同样在环外——会话需要结束或交接时生成只读摘要，由用户带去新会话继续。

## shape 的 mode

`shape` 通过 mode 系统适配不同意图：

| Mode       | 何时进入                       | 输出                    |
| :--------- | :----------------------------- | :---------------------- |
| (default)  | 想法模糊，需要协作探索         | 设计草案 / 头脑风暴结论 |
| `fix`      | 报错、行为异常、回归（含诊断） | 根因报告 + 修复方案     |
| `feat`     | 新功能                         | 实施方案 + 影响范围     |
| `refactor` | 不改外部行为整理代码           | 重构方案 + 行为保留验证 |
| `perf`     | 性能优化                       | baseline + 优化方案     |

**核心设计**：

- 默认无 mode 即是探索状态——brainstorm / tradeoff framing / 头脑风暴都落在默认状态，不需要单独 skill；真正的“该不该做”价值判断仍交回用户
- mode 由 agent 在 clarify 过程中识别，不是用户指定
- 知道意图 ≠ 不需要澄清
- 出方案前不写任何代码

shape 取 Shape Up（Basecamp）的 shaping——把模糊想法捏成 rough / solved / bounded 的可开工方案；它的跨度（澄清、探索、诊断、成案）正是这个词的跨度。

详细的 mode 设计、数据流、目录结构见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 致谢

Squire 的架构思路参考了 [Waza](https://github.com/tw93/Waza)，shape 的 default mode 设计受 [superpowers/brainstorming](https://www.skills.sh/obra/superpowers/brainstorming) 启发，shape 之名取自 [Shape Up](https://basecamp.com/shapeup)。

## License

MIT
