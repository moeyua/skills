# Skills

[English](./README.md) | 简体中文

> Focused skills for software development and durable project memory.

Skills 是一套服务于软件开发与项目持久记忆的克制指令系统。它提供 11 个由用户按需调用的聚焦 skill；上下文可以在能力之间传递，但不会因此变成强制流水线。

产品原则与边界见 [PRODUCT.md](./PRODUCT.md)，内部结构与数据流见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 11 个 skill

| Skill       | 结果                                                                     |
| :---------- | :----------------------------------------------------------------------- |
| `explore`   | 只读建立项目/模块理解；可输出报告，也可作为内嵌上下文                    |
| `shape`     | 在对话中形成 grounded、边界清楚的设计方向；不写文件、不产生 mutation     |
| `plan`      | 一份可执行本地方案，以及尽力创建的同范围 GitHub Issue                    |
| `implement` | 工作代码/测试，以及自动的 implement ↔ check 修复闭环                     |
| `check`     | 可独立调用的 review/test/e2e 裁决；只读                                  |
| `docs`      | 把既定 truth 写入 spec、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP 或 README |
| `publish`   | 从当前状态完成缺失的 commit、push 与 GitHub pull request                 |
| `release`   | 经验证的 git tag 与使用 generated notes 的 GitHub Release                |
| `converge`  | 幂等地把整套项目记忆对齐到当前格式                                       |
| `doctor`    | 只读的全项目漂移与健康审计                                               |
| `handoff`   | 供新会话继续工作的自包含只读摘要                                         |

公共名称取开发者已经在用的词。被移除的旧能力不保留 alias；安装后的完整表面就是上表。

## 安装

```bash
npx skills add .
```

这里的 `skills` 是外部安装 CLI；本仓库提供 skill 内容，并不发布这个 CLI。

常用参数：

- `-g` 全局安装；否则是 project 级安装。
- `-a claude-code` 指定 agent；不加则由 CLI 询问。
- `-y` 跳过确认。
- `--copy` 使用复制布局；默认使用共享 store 的 symlink 布局。

共享 store 是安装时快照。修改仓库后需要重新运行安装命令。

安装后可调用 `/explore`、`/shape`、`/plan`、`/implement`、`/check`、`/docs`、`/publish`、`/release`、`/converge`、`/doctor` 或 `/handoff`。

## 能力如何连接

```text
                              explore
                                 ·
                                 ▼
shape · · ·▶ plan · · ·▶ implement ⇄ check · · ·▶ docs · · ·▶ publish · · ·▶ release

converge / doctor / handoff 保持正交，按需调用。
```

虚线表示常见的上下文交接，不是前置门禁。只要当前请求足以完成某个 skill 的 outcome，就可以直接调用它。唯一自动闭环位于 `implement` 内部：它调用独立、只读的 `check`，修复授权范围内的 blocker，再次 check，直到通过或触及意图/范围/依赖/无进展边界。

三个组合被刻意限制在局部：

- `shape` 缺事实时可以取得只读的 `explore` 上下文。
- `plan` 永远先写本地方案，再尽力创建至多一个匹配的 GitHub Issue；GitHub 失败不使方案失败，也不阻塞后续工作。
- `publish` 有 canonical Issue 关联时把 closing reference 带入 PR；没有 Issue 是正常发布状态。

系统没有全局 orchestrator。每个公开 outcome 完成后，由用户决定下一次调用什么。

## 变更类型

`fix`、`feat`、`refactor`、`perf` 是 change 的共享属性：

| Type       | 证据重点                          |
| :--------- | :-------------------------------- |
| `fix`      | 正确行为、根因、回归保护          |
| `feat`     | 可观察接口与 acceptance scenarios |
| `refactor` | 行为不变量与 regression coverage  |
| `perf`     | baseline、数值目标、可比测量      |

shape 用它聚焦思考，plan 用它决定方案结构与可选 Issue label，implement 用它选择 TDD、不变量或测量纪律。Brainstorm 只是 shape 的一种对话用途，不是持久 mode。

## 持久记忆

默认 memory catalog 恰好包含六类：domain specs、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README。`docs` 只有在用户或 shape 对话已经决定产品 truth 后才能记录 PRODUCT，不能替用户作出这个决定。详见 [rules/memory-catalog.md](./rules/memory-catalog.md)。

## 开发

```bash
pnpm check
pnpm test
pnpm lint
```

仓库另含开发期工具 [bench/](./bench/README.md)，用于评估 shape 是否事实充分、交互相称、能识别实质决定、保持会话式且无副作用；bench 不随 skill 安装。

## 致谢

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
