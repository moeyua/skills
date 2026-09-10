# Skills

[English](./README.md) | 简体中文

> 面向软件开发与项目持久记忆的聚焦、轻量能力集。

Skills 为现代 coding agent 提供清晰的能力接口、项目特有判断、按条件加载的深层资料，以及高后果副作用边界；它不强加固定全局工作流。

产品原则见 [PRODUCT.md](./PRODUCT.md)，context flow 与内部结构见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 13 个 Skill

| Skill       | Outcome                                                             |
| ----------- | ------------------------------------------------------------------- |
| `explore`   | 只读建立项目/模块理解；固定 Overview 后再 scoped deep-dive          |
| `shape`     | 通过可回答的追问澄清意图与关键设计，形成可审阅的方向                |
| `plan`      | 本地计划、问题 Issues 或成对产物，生成后审计一轮并修订已授权问题    |
| `debug`     | 从预期与实际偏差出发定位原因，明确证据与未知                        |
| `implement` | 完成已授权变更，以相称证据验证并保持直接受影响的 durable truth 准确 |
| `review`    | 对设计、计划或改动给出有证据、可操作的审阅结论                      |
| `verify`    | 判断指定结果是否有足够证据，按需独立正式验收                        |
| `docs`      | 把既定 truth 写入六类 catalog memory 或用户指定文档                 |
| `publish`   | 从当前状态完成缺失的 commit、push 与 pull request                   |
| `release`   | 已确认 release set、一个完整发布元数据提交、tags 与 Releases        |
| `converge`  | 幂等地把整个 catalog 对齐到当前 memory formats                      |
| `doctor`    | 只读的全项目文档漂移与健康审计                                      |
| `handoff`   | 紧凑、host-neutral 的继续工作摘要                                   |

## 安装

```bash
npx skills add .
```

`skills` 是外部安装 CLI；本仓库只提供能力内容。

常用参数：

- `-g` 全局安装；否则为 project 级。
- `-a claude-code` 或 `-a codex` 选择 agent。
- `-y` 跳过安装器确认。
- `--copy` 避免默认 shared-store symlink 布局。

安装结果是快照；源码变更后需要重新安装。Shape 需要 Explore；Plan 需要 Review，以及能建立独立审计上下文的宿主。请一并安装或更新各自的支持 Skill。Plan 缺少审计能力时会保留产物，报告 `inconclusive` 及具体缺口。

## 使用方式

直接进入与请求 outcome 匹配的 Skill，无需先走固定链路。Frontmatter description 负责路由，主指南只在需要时加载深层 reference。每次 Shape 都先使用 Explore context 探索当前目标项目，复用仍有效的事实并补齐缺口，再形成方向。无需单独调用 Explore：上下文返回后，Shape 继续讨论，最终提交 Design Summary 审阅。

Plan 支持 `local`、`issue` 和默认的 `both`。生成产物后自动进行一轮独立 Review，在所选 target 的权限内修订明确问题并定向核对；生成结果、审计结论和修订结果分别报告，未决取舍与证据缺口继续保留。新本地计划保持 `draft`，规划审计不授予实施权限。

Shape 每轮一起提出当前可回答、互不依赖的问题；用户不知道如何选择时，用具体情境帮助判断。Debug 建立原因证据，Implement 继续负责已授权修复、回归验证和受影响的 truth。Review 判断哪里需要纠正及原因，Verify 判断原主张是否有足够证据；两者都可读代码或运行检查，修订仍由有权限的调用方完成。普通审阅或验证不等于独立验收。

路由差异见 [Resolver](./skills/RESOLVER.md)，context topology 与副作用归属见 [Architecture](./ARCHITECTURE.md)。

## 持久记忆

Catalog 恰好包含六类：domain Specs、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README。Docs 只从权威来源记录既定 truth。详见 [rules/memory-catalog.md](./rules/memory-catalog.md)。

## 开发

```bash
pnpm check
pnpm test
pnpm lint
node skills/doctor/scripts/checker.ts . --json
```

以 GPT-6 Astra 为主要行为验收模型，Codex 与 Claude Code 使用同一套 Skills，通过实际会话验证行为；普通实现/检查简要报告，正式验收保留独立证据。

## 致谢

- [Waza](https://github.com/tw93/Waza)
- [superpowers](https://www.skills.sh/obra/superpowers/brainstorming)
- [Shape Up](https://basecamp.com/shapeup)
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev)
- [design.md](https://github.com/google-labs-code/design.md)

## License

MIT
