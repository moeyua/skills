---
mode: feat
title: build 在受保护分支上自动开工作分支
created: 2026-06-01
status: done
---

# build 在受保护分支上自动开工作分支

## Building

给 build 加一个分支前置：开始第一处编辑前，若当前在受保护分支（main/master/develop）或处于 detached HEAD，自动 `git checkout -b <plan-slug>` 切到一个从 plan 文件名派生的工作分支；已在普通分支上则沿用。报告里写明落在哪个分支。目的是让 build→commit→propose 正常流里，propose 几乎不再撞上「在 main 上」而被迫停下——问题在源头化掉。

## Not building

- propose 不动：它现有的 "on main → 停下"、"脏树 → 停下" 行为原样保留。build 开分支只覆盖**走 build 的路径**；直接在 main 上 `/commit` 再 `/propose` 的情况不在本计划内。
- 不做 propose→commit 委托、不改 PRODUCT.md 哲学 #3（上一轮 shape 已决定放弃）。
- build 不 push、不设 upstream、不碰远端——那是 propose 的活。
- 不把受保护分支名做成可配置；沿用 propose 已硬编码的 main/master/develop 同一份清单。

## Approach

把分支创建放在 Preflight **之后**、Standard flow **之前**的一个独立小节，而不是塞进 Preflight。Preflight 是只读的「确认计划能跑」，创建分支是写操作，分开更清楚。分支名取 plan 文件名去掉日期前缀的 slug（`2026-06-01-feat-build-auto-branch.md` → `feat-build-auto-branch`），天然可追溯到对应 plan。

Preflight 已要求「工作树干净」才继续，所以 `git checkout -b` 时没有未提交改动会被带走，安全。

## Premise collapse

这个计划假设**每次 build 都有一个文件名含可解析 slug 的 plan**——build 的 Preflight 本就强制 plan 存在（否则停下让用户指 plan 或先 `/shape`），所以这个假设由 build 现有约束兜底，成立。若哪天 build 允许无 plan 运行，分支名将无来源——但那需要先改 Preflight，超出本计划。

## Key decisions

1. 分支名 = plan slug（去日期）——可追溯、稳定；不引入随机或时间戳，避免 build 脚本里用到被禁的 `Date.now()` 类来源，也让重跑同一 plan 落到同一分支。
2. 目标分支名已存在 → `git checkout` 复用而非报错——同名分支几乎必然是「同一个 plan 续做」，复用最贴合直觉；与不相关分支撞名是可接受的边缘情况（MVP）。
3. detached HEAD（`git branch --show-current` 为空）也视作需要开分支——否则后续 commit 无处落。
4. 受保护清单硬编码 main/master/develop，跟 propose 对齐——两处用同一口径，未来要改一起改。

## Public surface changes

build 的可观测行为新增一个 git 副作用（`git checkout -b`）和报告里的一行分支信息。frontmatter / description / Outcome Contract 不变。

## Implementation steps

1. Preflight 加分支探测
   - change: `skills/build/SKILL.md` Preflight 第 3 条的并行 scan，补 `git branch --show-current`，与 `git status --short` / `git log --oneline -5` 并列。
   - verify: 读一遍确认命令并入；`pnpm test` 仍绿。

2. 新增「Branch setup」小节
   - change: `skills/build/SKILL.md` Preflight 的 stop 条件之后、`## Standard flow` 之前，插入一节：开始第一处编辑前，若 `git branch --show-current` 是受保护分支（main/master/develop）或为空（detached HEAD），`git checkout -b <plan-slug>`（slug = plan 文件名去掉 `YYYY-MM-DD-` 前缀）；该名已存在则 `git checkout` 复用；已在普通分支则沿用。编辑前报告落在哪个分支。措辞补 why（不在 main 上动手，让 propose 不必再处理「推 main」）。
   - verify: 读一遍；`pnpm test` 仍绿。

3. 报告模板加分支行
   - change: `skills/build/SKILL.md` 的 report 代码块，在 `Built plans/...` 之后加一行 `Branch: <name> (created from <protected> / existing)`。
   - verify: 读一遍。

## Verification

- command: `pnpm test` — smoke 跑整库 checks，确认 build/SKILL.md 改完仍过 frontmatter / Outcome Contract / 链接 / 触发词 / portable surface 全部结构 invariant。
- checklist（manual）:
  - [ ] Branch setup 小节明确覆盖三种输入：受保护分支 / detached HEAD / 已在普通分支
  - [ ] 报告模板含分支行
  - [ ] 没有引入个人路径 / AI 署名 / 私有 context（portable surface check）
- live acceptance：build 本计划时当前正在 main 上，会真实触发——build 应自动切到 `feat-build-auto-branch` 再开始编辑，自我演示。

## Rollback

纯单文件 prose 改动。`git checkout skills/build/SKILL.md` 还原，或 revert 对应 commit。无外部状态变更。

## Interface boundary

build 不暴露代码 API；这里的「接口」是 agent 的可观测行为 + 报告输出。

- **Public（可观测）**:
  - Inputs：当前 git 分支状态（`git branch --show-current` 的结果）。
  - Outputs：编辑开始前报告所在分支；最终报告含 `Branch:` 行。
  - Side effects：在受保护分支 / detached HEAD 时执行 `git checkout -b <slug>`（或对已存在的同名分支 `git checkout`）。这是 build 新增的唯一 git 写操作。
- **Not exposed**：不 push、不设 upstream、不删分支、不碰远端、不改 git config；受保护清单不可配置。

## Acceptance scenarios

- Given 当前在 `main`、有一个 `approved` plan，when build 开始，then 它在第一处编辑前 `git checkout -b <slug>` 并报告新分支。
- Given 当前在 `master` 或 `develop`，when build 开始，then 同样触发开分支（清单三个都覆盖）。
- Given 当前已在 `feat-x` 这类普通分支，when build 开始，then 不开新分支、沿用 `feat-x` 并报告。
- Given detached HEAD（`git branch --show-current` 为空），when build 开始，then 创建工作分支，避免后续 commit 无处落。
- Given 目标分支名 `<slug>` 已存在，when build 要开分支，then `git checkout` 复用该分支而非报错中断。

## Risks & Unknowns

- **撞上不相关的同名分支**：决策 2 选择复用而非报错，极小概率复用到一个跟本 plan 无关的同名分支。影响有限（工作树干净，切过去不丢东西），且同名几乎必然是同一 plan 续做。MVP 接受。
- **非常规默认分支名**（如 `trunk`）：硬编码清单不覆盖，那种 repo 上 build 不会自动开分支。与 propose 当前局限一致；要改两处一起改。非 blocker。
