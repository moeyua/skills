# Squire

> 一套用于 Agent 辅助开发的 Skills，把完整的代码开发闭环沉淀成 Agent 可调用的技能。

> 设计哲学和产品边界见 [PRODUCT.md](./PRODUCT.md)。

## Skills

9 个 skill，分为 core loop、workflow-managed stages 和 orthogonal tools：

| Skill          | 分层                   | 作用                                                                            |
| :------------- | :--------------------- | :------------------------------------------------------------------------------ |
| `explore`      | core loop              | 理解项目结构、技术栈、入口、相关代码和运行方式                                  |
| `plan`         | core loop              | 意图澄清 + 出方案（default / fix / feat / refactor / perf）                     |
| `build`        | core loop              | 按方案做最小、可控、符合项目风格的代码修改；含写测试（TDD + 补覆盖/回归）       |
| `verify`       | core loop              | review / test / e2e 三模式确认改动立得住，只裁决不改                            |
| `document`     | core loop              | 默认照记忆目录维护项目持久真源；用户明确指定时可维护 catalog 外具体项目文档     |
| `commit`       | workflow-managed stage | 整理变更，生成清晰的 commit message，必要时拆分提交                             |
| `pull-request` | workflow-managed stage | 推送分支、准备 PR 描述与 test plan                                              |
| `health`       | orthogonal tool        | 项目体检：文档↔代码漂移（主）+ 依赖/CI/文件陈旧；只读 advisory，loop 外正交审计 |
| `handoff`      | orthogonal tool        | 会话交接：只读收集当前会话与项目状态，输出可粘贴到新会话的自包含摘要；不写文件  |

> `health` 是 loop 外的整体项目体检（与 `verify` 的「合并前看一次改动」互补）。它机械层带一个随 skill 装的零依赖脚本，只检测、只报告，修正交回 `document` / `plan fix`。
>
> `handoff` 同为 loop 外正交工具——会话需要结束、压缩或换 agent 时生成交接摘要，服务会话连续性而非项目文档（项目文档走 `/document`）。

## Install

```bash
npx skills add .
```

常用 flag：

- `-g` 全局（`~/.claude/skills/`），不加是 project 级（`.claude/skills/`）
- `-a claude-code` 指定 agent，不加会询问
- `-y` 跳过确认
- `--copy` 改为复制；默认是 symlink，编辑仓库内 SKILL.md 立刻生效

装完后触发命令：`/explore` / `/plan` / `/build` / `/verify` / `/document` / `/commit` / `/pull-request`，以及正交工具 `/health` / `/handoff`。

**注意冲突**：squire 的 `/verify` 会遮蔽 Claude Code 内置 `/verify`（personal skill 优先级高于 command）；想用内置的先卸载 squire verify。`/commit` 跟 `commit-commands` plugin 不撞（plugin 命令有 namespace `/commit-commands:commit`），但用户级 `/commit` 仍走 squire。

## 工作流

Core loop：

```
explore → plan → build → verify → document
```

Workflow-managed stages（按项目的 `WORKFLOW.md` 或维护者流程决定是否出现、何时出现）：

```
commit → pull-request
```

每个 skill 完成后**默认停下，等用户决定下一步**。技能不自动串联——技能之间的转移是用户的明确动作。`document` 是条件环节——变更产生了值得记的持久记忆（行为契约 / 架构 / …）时才介入，照记忆目录写进真源；用户明确指定时，它也可维护 catalog 外具体项目文档。`health` 不在线性环里——它是按需触发的整体体检，照出哪份记忆漂了，再交回 `document` 修。`handoff` 同样在环外——会话需要结束或交接时生成只读摘要，由用户带去新会话继续。

## plan 的 mode

`plan` 通过 mode 系统适配不同意图：

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

详细的 mode 设计、数据流、目录结构见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 致谢

Squire 的架构思路参考了 [Waza](https://github.com/tw93/Waza)，plan 的 default mode 设计受 [superpowers/brainstorming](https://www.skills.sh/obra/superpowers/brainstorming) 启发。

## License

MIT
