# Skills

[English](./README.md) | 简体中文

> 面向软件开发与项目持久记忆的聚焦、轻量能力集。

Skills 为现代 coding agent 提供清晰的能力接口、项目特有判断、按条件加载的深层资料，以及高后果副作用边界；它不强加固定全局工作流。

产品原则见 [PRODUCT.md](./PRODUCT.md)，context flow 与内部结构见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 11 个 Skill

| Skill       | Outcome                                                             |
| ----------- | ------------------------------------------------------------------- |
| `explore`   | 只读建立项目/模块理解；固定 Overview 后再 scoped deep-dive          |
| `shape`     | 在对话中形成 grounded、边界清楚的方向                               |
| `plan`      | 本地实施计划、只记录问题的 GitHub Issues 或二者                     |
| `implement` | 完成已授权变更，以相称证据验证并保持直接受影响的 durable truth 准确 |
| `check`     | 按问题与风险选择 review/test/e2e 的只读 verdict                     |
| `docs`      | 把既定 truth 写入六类 catalog memory 或用户指定文档                 |
| `publish`   | 从当前状态完成缺失的 commit、push 与 pull request                   |
| `release`   | 已确认 release set、一个默认分支版本提交、tags 与 Releases          |
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

安装结果是快照；源码变更后需要重新安装。

## 使用方式

直接进入与请求 outcome 匹配的 Skill，无需先走固定链路。Frontmatter description 负责路由，主指南只在需要时加载深层 reference。

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

开发期 [Shape bench](./bench/README.md) 用于评估对话质量与副作用边界，不随 Skill 安装。

## 致谢

- [Waza](https://github.com/tw93/Waza)
- [superpowers](https://www.skills.sh/obra/superpowers/brainstorming)
- [Shape Up](https://basecamp.com/shapeup)
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev)
- [design.md](https://github.com/google-labs-code/design.md)

## License

MIT
