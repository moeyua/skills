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
| `implement` | 工作代码/测试、check 裁决、earned-docs 判定与完整总结                    |
| `check`     | 可独立调用的 review/test/e2e 裁决；只读                                  |
| `docs`      | 把既定 truth 写入 spec、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP 或 README |
| `publish`   | 从当前状态完成缺失的 commit、push 与 GitHub pull request                 |
| `release`   | 已确认 release set、一个默认分支版本提交、精确 tags 与 GitHub Releases   |
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
shape · · ·▶ plan · · ·▶ implement ⇄ check · · ·▶ publish · · ·▶ release
                                  │
                                  │ earned durable truth
                                  ▼
                                 docs ──▶ final check

converge / doctor / handoff 保持正交，按需调用。
```

虚线表示常见的上下文交接，不是前置门禁。只要当前请求足以完成某个 skill 的 outcome，就可以直接调用它。唯一自动完成闭环位于 `implement` 内部：独立、只读的初始 `check` 通过后，只有 plan Spec delta、显式文档 target 或 verified durable-claim drift 证明持久义务时才调用 `docs`。docs 有写入时，最终 `check` 覆盖完整 diff；无触发时报告 `Docs: not needed`，不重复相同 gate。

四个组合被刻意限制在局部：

- `shape` 缺事实时可以取得只读的 `explore` 上下文。
- `plan` 永远先写本地方案，再尽力创建至多一个匹配的 GitHub Issue；GitHub 失败不使方案失败，也不阻塞后续工作。
- `implement` 只在自身已授权 outcome 内组合 check 与 docs，不改变二者的独立入口和原有边界。
- `publish` 有 canonical Issue 关联时把 closing reference 带入 PR；没有 Issue 是正常发布状态。

`release` 通过拆分权威版本源（release unit）、项目定义的 fixed/linked 协调约束（version group）与 tag/GitHub Release 映射（tag identity），同时处理单 package 与 monorepo。用户显式 tag set 只有在自身声明的映射可见且完整决定 release set、新 identity 合法、每个 changed target 又是项目策略允许的 forward successor 时才直接执行；aggregate 中被策略明确标记 unchanged 的 member 可保留当前版本。group/dependency 规则派生的任何额外 unit target 或 identity（包括没有自有 tag 的传播 unit）都必须展示整组并等待下一轮确认。所有路径都在 fetch 后从确切远端 commit 重解 topology、policy、units 与 baselines。否则它只对不受 group 约束且映射唯一的 unit 回退通用 SemVer。全部 unit targets、tag identities、理由与 canonical 依据会在最终回复中展示，并等待下一条消息确认。依据未变时，一个已验证的 non-tagging/non-committing/non-publishing 版本事务更新 changed units、保持 declared unchanged units 不变且不改变 Git 状态，再由 `release` 创建一个默认分支 commit，并逐 identity 发布和恢复精确 tag/GitHub Release；部署、registry publish、artifact、changelog 文件与自动 PR 仍在范围外。

系统没有全局 orchestrator。条件性 docs 不会授权 publish 或 release；每个公开 outcome 完成后，由用户决定下一次调用什么。

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
