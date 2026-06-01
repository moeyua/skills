# Squire

> 一套用于 Agent 辅助开发的 Skills，把完整的代码开发闭环沉淀成 Agent 可调用的技能。

> 设计哲学和产品边界见 [PRODUCT.md](./PRODUCT.md)。

## Skills

8 个 skill 覆盖开发闭环：

| Skill     | 阶段     | 作用                                                        |
| :-------- | :------- | :---------------------------------------------------------- |
| `explore` | 0. 理解  | 理解项目结构、技术栈、入口、相关代码和运行方式              |
| `shape`   | 1. 设计  | 意图澄清 + 出方案（多 mode）                                |
| `build`   | 2. 执行  | 按 shape 出的方案做最小、可控、符合项目风格的代码修改       |
| `test`    | 3. 验证  | 补充或执行测试，验证功能、修复和边界场景                    |
| `review`  | 4. 把关  | 检查代码质量、边界条件、安全、性能和无关改动                |
| `spec`    | 5. 记录  | 把变更的 spec delta 合并进持久 specs/ 真源，或纠正已有 spec |
| `commit`  | 6a. 入库 | 整理变更，生成清晰的 commit message，必要时拆分提交         |
| `propose` | 6b. 推送 | 准备 PR/MR 描述、测试说明、风险说明和 review checklist      |

## Install

```bash
npx skills add .
```

常用 flag：

- `-g` 全局（`~/.claude/skills/`），不加是 project 级（`.claude/skills/`）
- `-a claude-code` 指定 agent，不加会询问
- `-y` 跳过确认
- `--copy` 改为复制；默认是 symlink，编辑仓库内 SKILL.md 立刻生效

装完后触发命令：`/explore` / `/shape` / `/build` / `/test` / `/review` / `/spec` / `/commit` / `/propose`。

**注意冲突**：squire 的 `/review` 会遮蔽 Claude Code 内置 `/review`（personal skill 优先级高于 command）。如果想用内置 review，先卸载 squire review。`/commit` 跟 `commit-commands` plugin 不撞（plugin 命令有 namespace `/commit-commands:commit`），但用户级 `/commit` 仍走 squire。

## 工作流

```
explore → shape → build → test → review → spec → commit → propose
```

每个 skill 完成后**默认停下，等用户决定下一步**。技能不自动串联——技能之间的转移是用户的明确动作。`spec` 是条件环节——变更改变了对外行为时才介入，把行为契约记录进 `specs/` 真源。

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
