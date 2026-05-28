---
name: implement
description: '按 think 出的 plan 文件严格执行代码改动；项目有测试就走 TDD。Use when 用户说 "实施" / "implement" / "按计划做" / "$implement" / "整" / "可以干" / "直接改" 或 think 出 plan 后切实施。Not for 还没 plan 就动手（先 think）、纯写文档、绕过 plan 改代码。'
when_to_use: "implement, 实施, 实现, 写代码, 按计划, 落实, 整, 可以干, 直接改, $implement"
dispatch_intent: "按 plan 文件严格执行代码改动"
---

# Implement

> **Prerequisite**：必须有一个 think 出的 plan 文件（`plans/YYYY-MM-DD-<slug>.md`，`status: approved`）。没有先调 `$think`。

把 plan 翻译成符合项目风格的代码。不重新判断意图、不偏离 plan、不顺手做无关的事。

## Outcome Contract

- Outcome: plan 的 implementation steps 全部完成，verification 通过，改动符合项目风格
- Done when: 所有 step 跑完 verify 通过，plan 文件 frontmatter `status` 改为 `done`
- Evidence: 改动过的每个文件 + plan.verification 命令的实际输出
- Output: 改动清单 + verify 结果 + 任何偏离 surface

## 找 plan 文件

- 用户消息含 plan 路径 → 用那个
- 否则 → 找 `plans/` 下最新 `status: approved` 的 plan（按文件名 YYYY-MM-DD 排序）
- 找不到 → Hard Stop，让用户指定路径或先调 `$think`

## 前置检查（并行执行）

```bash
git status --short                     # 工作树脏不脏
git log --oneline -5                   # 项目 commit 风格
ls package.json pnpm-lock.yaml ...     # 项目类型
cat <plan-path>                        # plan 全文
```

通过条件（任一不满足 → Hard Stop）：

- plan `status: approved`（不是 draft / done）
- plan 无 placeholder（`TBD` / `TODO` / `implement later`）
- 工作树 clean（防止覆盖未保存改动）
- plan 假设的关键文件 / 依赖 / 接口仍存在（grep 抽查）

**测试 framework 检测**：

- `package.json` 有 `scripts.test*`、或存在 `tests/` / `__tests__/` / `*.test.*` / `*.spec.*` / `*_test.go` 等
- 有 → fix/feat mode 走 TDD
- 没有 → 按 plan.verification 命令做（手工 spot check）

## 标准流程

按 plan 的 implementation steps 顺序执行（一气呵成，每步多 tool 并行）：

**TDD 适用时**（fix/feat mode + 测试 framework 存在）：

```
for each step:
  1. 写或更新测试（按 plan 的 acceptance scenarios / regression tests）
  2. 跑测试 → 必须 red
     (一开始就 green = Hard Stop：测试没覆盖到)
  3. 写实现代码
  4. 跑测试 → 必须 green
     (green 不了 → Hard Stop：报告失败信息)
  5. 进下一 step
```

**TDD 不适用时**（refactor / perf / 无测试 framework）：

```
for each step:
  1. 改代码
  2. 跑 plan.verification 命令证明 step 完成
  3. 进下一 step
```

所有 step 完成 → 跑 plan.verification 全套 → 改 plan `status: done` → 输出报告。

## TDD 适用矩阵

| plan mode  | TDD    | 怎么做                                          |
| ---------- | ------ | ----------------------------------------------- |
| `fix`      | 强适用 | regression test 先 red → 修复 green             |
| `feat`     | 强适用 | acceptance scenarios 先 red → 实现 green        |
| `refactor` | 不适用 | 既有测试是 invariant 守护，跑既有测试保持 green |
| `perf`     | 不适用 | baseline → 优化 → 再测量到 target               |

## 工程约束

- **代码风格**：跟项目走（缩进 / 命名 / import 顺序 / 错误处理）。不发明新规范
- **依赖**：plan 没明确写 → 不引新依赖、不升降级、不动 lockfile
- **Scope**：plan 之外不改文件；不顺手修无关 bug；不顺手 refactor
- **Comments**：默认不写。WHY 不明显才写（隐藏约束 / 反直觉取舍 / workaround）。不写 "this function does X" 或 plan path / issue 编号
- **错误处理**：不为不会发生的场景加 try/catch / null check
- **质量门**：不用 `--no-verify` / `--force` / `// @ts-ignore` / `// eslint-disable` 绕过工具
- **不为通过测试改测试**：测试 fail 是信号；不删 / 不弱化 / 不 skip 既有测试
- **Secrets**：不硬编码 token / API key / 密码；走环境变量或项目惯用配置
- **测试代码也是代码**：测试遵守以上所有约束；只覆盖 plan 的 acceptance scenarios，不多写也不少写

## Hard Stops

- 找不到 plan
- plan `status` 不是 `approved`（draft 没批 / done 已实施过）
- plan 含 placeholder
- 工作树脏
- TDD 写完测试一开始就 green（测试没真覆盖）
- 实施中发现 plan 跟代码不符（路径错 / 函数不存在 / 假设不成立）→ 报告偏离让用户回 think 修 plan
- verify 跑不通且 retry 一次仍失败 → 报告失败，不静默 skip / 不删测试
- 需要引入 plan 没写的新依赖 → 报告，让用户回 think 修 plan 或改用项目已有方案

## 完成后输出

```
Implemented plans/<path>.md (now status: done)

Changes:
- <file>: <一句话描述>
- ...

Tests:
- <test-file>: N tests added/changed (TDD: red → green)

Verify: <command> → pass

下一步：跑 review 把关 / 调 commit 入库 / 继续下一个 plan
```

## Gotchas

| 情况                                                | 规则                                                     |
| --------------------------------------------------- | -------------------------------------------------------- |
| 拿到 plan 直接动手没前置检查                        | status / placeholder / 工作树 / 测试 framework 都要先查  |
| TDD mode 写完测试一开始就 green                     | Hard Stop；测试没覆盖到 plan 的 scenario                 |
| verify fail 后用 `--no-verify` / 删测试让它通过     | 永远不绕过；report failure                               |
| 顺手修了 plan 之外的 bug                            | scope creep；可以在 report 里 note 你的发现，但不改      |
| plan 路径错（说 src/auth.ts:42 但代码不对）默默调整 | plan 漂移；Hard Stop 让用户回 think 修 plan              |
| 中间 step 跑测试不报告就过                          | 每个 step 的 red→green / verify 都要在 report 里 surface |
| 加了 plan 没说的 dependency                         | Hard Stop；回 think 修 plan 或改用项目已有方案           |
| 改了 plan 文件内容让自己更好实施                    | implement 永远不改 plan 内容（只改 `status: done`）      |
| 项目没测试 framework 还硬走 TDD                     | 没框架就按 plan.verification 走，不要凭空造测试基础设施  |
