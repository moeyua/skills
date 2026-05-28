# Plan File Template

think 进入具名 mode 后写到 `plans/YYYY-MM-DD-<slug>.md` 的结构。

每个具名 mode 都遵守这个共通骨架；mode-specific 字段在对应 mode reference 里有详细说明。

## 文件结构

```markdown
---
mode: fix | feat | refactor | perf
title: <一句话主题>
created: YYYY-MM-DD
status: draft
---

# <Title>

## Building

[1 段话讲这个 plan 要交付什么]

## Not building

[显式 out-of-scope 列表；防止 implement 阶段 scope creep]

## Approach

[选定方案 + 为什么。如果有 close tradeoff 备选，简短列；否则不提]

## Premise collapse

[最脆弱的假设。"这个 plan 假设 X。如果 X 不成立，会 Y"]

## Key decisions

1. <decision> — <reasoning>
2. ...

## Public surface changes

API / schema / config / 命令行 / 文件接口的变化。如无 → "None"。

## Implementation steps

每个 step 必须：

- 可独立 verify
- 不依赖未写的下一步
- 不含 placeholder（"TBD"/"TODO"/"implement later" 都是 red flag）

1. <step>
   - 改动：<file:line 或描述>
   - verify：<具体命令或检查>
2. ...

## Verification

整体验收。

- 命令：`<具体 cmd>`
- 检查清单（手工）：
  - [ ] ...

## Rollback

如果 plan 实施完发现方向错了，怎么回退？外部状态有变化的 step 必须有 rollback 路径。

## Risks & Unknowns

- **<risk>**：影响 / mitigation
- **Unknown**：<问题> — owner: <谁负责澄清>，blocker: yes/no

如无 → "None"。

## Mode-specific

按 mode 增加额外字段，详见对应 reference：

- fix：`## Root cause` + `## Regression tests`
- feat：`## Interface boundary` + `## Acceptance scenarios`
- refactor：`## Behavior invariants` + `## Regression coverage`
- perf：`## Baseline` + `## Target` + `## Measurement`
```

## 命名 slug

从 plan 主题派生，短、可读、kebab-case：

| Plan 主题    | Slug                     |
| ------------ | ------------------------ |
| 修登录死循环 | `fix-login-loop`         |
| 加 RBAC 权限 | `feat-rbac`              |
| 重构存储层   | `refactor-storage-layer` |
| 优化首屏加载 | `perf-initial-load`      |

## 状态字段

frontmatter `status` 字段语义：

- `draft`: think 刚写出来，等用户 approve
- `approved`: 用户说 "implement this plan" 后改成 approved
- `done`: implement + review + commit 完成后改成 done（由 implement / review skill 更新）

v1 阶段先支持 `draft` / `approved`；`done` 留 v2 由 review skill 处理。
