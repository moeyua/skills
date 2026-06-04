# Squire

> 一套用于 Agent 辅助开发的 Skills，把完整的代码开发闭环沉淀成 Agent 可调用的技能。

> 设计哲学和产品边界见 [PRODUCT.md](./PRODUCT.md)。

## Skills

7 个 skill、6 支柱，覆盖「开发 + 记忆」闭环：

| Skill     | 支柱 | 作用                                                                       |
| :-------- | :--- | :------------------------------------------------------------------------- |
| `explore` | 理解 | 理解项目结构、技术栈、入口、相关代码和运行方式                             |
| `shape`   | 设计 | 意图澄清 + 出方案（多 mode）                                               |
| `build`   | 改造 | 按方案做最小、可控、符合项目风格的代码修改；含写测试（TDD + 补覆盖/回归）  |
| `verify`  | 校验 | review / test / e2e 三模式确认改动立得住，只裁决不改                       |
| `persist` | 记忆 | 照记忆目录维护项目持久真源（行为契约 / 架构 / 设计 / 流程 / ROADMAP / README） |
| `commit`  | 交付 | 整理变更，生成清晰的 commit message，必要时拆分提交                        |
| `propose` | 交付 | 推送分支、准备 PR 描述与 test plan                                         |

> 校验支柱还规划了正交的 `health`（项目体检 / 文档↔代码漂移检测），见 [ROADMAP.md](./ROADMAP.md)。

## Install

```bash
npx skills add .
```

常用 flag：

- `-g` 全局（`~/.claude/skills/`），不加是 project 级（`.claude/skills/`）
- `-a claude-code` 指定 agent，不加会询问
- `-y` 跳过确认
- `--copy` 改为复制；默认是 symlink，编辑仓库内 SKILL.md 立刻生效

装完后触发命令：`/explore` / `/shape` / `/build` / `/verify` / `/persist` / `/commit` / `/propose`。

**注意冲突**：squire 的 `/verify` 会遮蔽 Claude Code 内置 `/verify`（personal skill 优先级高于 command）；想用内置的先卸载 squire verify。`/commit` 跟 `commit-commands` plugin 不撞（plugin 命令有 namespace `/commit-commands:commit`），但用户级 `/commit` 仍走 squire。

## 工作流

```
explore → shape → build → verify → persist → commit → propose
```

每个 skill 完成后**默认停下，等用户决定下一步**。技能不自动串联——技能之间的转移是用户的明确动作。`persist` 是条件环节——变更产生了值得记的持久记忆（行为契约 / 架构 / …）时才介入，照记忆目录写进真源。

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

- 默认无 mode 即是探索状态——brainstorm / 价值判断 / 头脑风暴都落在默认状态，不需要单独 skill
- mode 由 agent 在 clarify 过程中识别，不是用户指定
- 知道意图 ≠ 不需要澄清
- 出方案前不写任何代码

详细的 mode 设计、数据流、目录结构见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 致谢

Squire 的架构思路参考了 [Waza](https://github.com/tw93/Waza)，shape 的 default mode 设计受 [superpowers/brainstorming](https://www.skills.sh/obra/superpowers/brainstorming) 启发。

## License

MIT
