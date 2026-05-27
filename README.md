# Praxis

> 一套用于 Agent 辅助开发的 Skills，把完整的代码开发闭环沉淀成 Agent 可调用的技能。

## Why

每条 rule 都是一个 ceiling —— Agent 只能做指令允许的事。Praxis 走克制路线：每个 skill 只设清晰的目标和最关键的约束，剩下让模型发挥。

聚焦一件事：**代码开发闭环**。不做产品决策，不做文档管理，不做发布管理，不做 Agent 自审计。

## Skills

7 个 skill 覆盖开发闭环：

| Skill | 阶段 | 作用 |
| :--- | :--- | :--- |
| `explore` | 0. 理解 | 理解项目结构、技术栈、入口、相关代码和运行方式 |
| `think` | 1. 设计 | 意图澄清 + 出方案（多 mode） |
| `implement` | 2. 执行 | 按 think 出的方案做最小、可控、符合项目风格的代码修改 |
| `test` | 3. 验证 | 补充或执行测试，验证功能、修复和边界场景 |
| `review` | 4. 把关 | 检查代码质量、边界条件、安全、性能和无关改动 |
| `commit` | 5a. 入库 | 整理变更，生成清晰的 commit message，必要时拆分提交 |
| `push` | 5b. 推送 | 准备 PR/MR 描述、测试说明、风险说明和 review checklist |

## Install

```bash
npx skills add <your-github>/praxis -a claude-code -g -y
```

`-g` 全局安装到 `~/.claude/skills/`，`-a claude-code` 指定目标 agent。

## 工作流

```
explore → think → implement → test → review → commit → push
```

每个 skill 完成后**默认停下，等用户决定下一步**。技能不自动串联——技能之间的转移是用户的明确动作。

## think 的 mode

`think` 通过 mode 系统适配不同意图：

| Mode | 何时进入 | 输出 |
| :--- | :--- | :--- |
| (default) | 想法模糊，需要协作探索 | 设计草案 / 头脑风暴结论 |
| `fix` | 报错、行为异常、回归（含诊断） | 根因报告 + 修复方案 |
| `feat` | 新功能 | 实施方案 + 影响范围 |
| `refactor` | 不改外部行为整理代码 | 重构方案 + 行为保留验证 |
| `perf` | 性能优化 | baseline + 优化方案 |

**核心设计**：

- 默认无 mode 即是探索状态——brainstorm / 价值判断 / 头脑风暴都落在默认状态，不需要单独 skill
- mode 由 agent 在 clarify 过程中识别，不是用户指定
- 知道意图 ≠ 不需要澄清
- 出方案前不写任何代码

详细的 mode 设计、数据流、目录结构见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 边界：明确不做的

- 价值判断（"值不值得做"、Kill/Keep/Pivot）
- 文档管理（README / 接口文档 / 变更说明）
- 发布管理（上线检查 / release notes / 回滚）
- Agent 自审计（hooks / MCP / config 漂移）
- 内容输入处理（URL/PDF 抓取、深度研究）

## 致谢

Praxis 的架构思路参考了 [Waza](https://github.com/tw93/Waza)，think 的 default mode 设计受 [superpowers/brainstorming](https://www.skills.sh/obra/superpowers/brainstorming) 启发。

## License

MIT
