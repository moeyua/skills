---
name: test
description: '测试相关工作的统一入口：跑测试、补覆盖、调试失败。Use when 用户说 "跑测试" / "加测试" / "补回归" / "这个 test fail 帮我看"。Not for plan 要求的最小测试集（在 implement 内 TDD 写）、非测试代码改动（用 implement）、纯 review 不写测试（用 review）。'
when_to_use: "test, 测试, 跑测试, 加测试, 补测试, 单元测试, 回归, 覆盖, flaky, 测试 fail"
dispatch_intent: "跑 / 补 / 调试测试的统一入口"
---

# Test

> **Prerequisite**：你应该知道项目的测试 framework 和命令。陌生项目先 `/explore`。

测试相关工作的入口。**不重新发明测试基础设施**，跟项目走。

## Outcome Contract

- Outcome: 测试 suite 跑通 / 覆盖按要求补齐 / 失败诊断清晰
- Done when: 跑测试 → pass/fail 全报告；补测试 → 新测试 green + 覆盖意图清晰；调试 → root cause 已识别
- Evidence: 实际跑测试命令的输出 / Read 过的被测代码 / 失败信息全文
- Output: 见每类场景的"完成后输出"

## 三类工作场景（看消息分流）

| 用户消息线索                                           | 工作   |
| ------------------------------------------------------ | ------ |
| `/test` / "跑测试" / "test 通过吗"                     | 跑测试 |
| "加测试" / "补 X 的回归" / "覆盖 Y 模块"               | 补覆盖 |
| "这个 fail 帮我看" / "flaky 排查" / "为什么这个测试挂" | 调试   |

不需要 mode 系统——消息内容自然分流。

## 跑测试流程

```bash
# 检测 framework + command
cat package.json | grep -A 5 scripts     # JS/TS
ls Cargo.toml pyproject.toml go.mod ...  # 其他生态

# 找到测试命令后跑
pnpm test / npm test / pytest / cargo test / go test ./... / ...
```

报告：

- 总数 + pass/fail
- 失败的测试：文件 + 测试名 + 第一条 assertion 失败信息
- 多个失败时按"看起来相关 / 看起来独立"分组
- 给下一步建议：跑 `/test 调试 X` / 看是否要回 think 修 plan / 等

**Flaky 怀疑**：如果某个测试看起来时序 / 资源敏感，**只 retry 一次**；仍 fail 就不算 flaky，就是 fail。

## 补覆盖流程

按顺序：

1. clarify 要补哪里（用户消息给的范围，或问"覆盖 X 的哪类场景：happy / error / edge / 集成？"）
2. Read 被测代码——看清楚**真实行为**（不是猜应该怎样）
3. 列覆盖计划：要测哪些场景，每条一句话
4. 按项目测试风格写（目录结构 / naming / assertion 风格 / mock 用法跟现有走）
5. 跑新测试 → 必须 green
   - 一开始就 red 但不是 pre-existing bug → 测试本身错了
   - 一开始就 green → 测试没真覆盖（Hard Stop）
6. 报告新增测试数 + 覆盖了什么

## 调试流程

```
1. Read 失败测试代码 + 完整报错信息
2. Read 被测代码
3. 判断三种可能：
   - 测试错了（assertion 写错 / mock 不对 / 期望与实现不一致）
   - 代码错了（真 bug，应该回 fix mode）
   - Flaky（时序 / 资源 / 全局状态 / random seed）
4. 给诊断：root cause + 修复方向
5. 不"修补"让测试通过：
   - 测试错 → 修测试
   - 代码错 → 不在这里改；建议回 think (fix mode)
   - Flaky → 报告 root cause；如果是 race，标 TODO 让用户决定
```

## 工程约束

- **不绕过失败**：不 `--no-verify` / `--force` / `// @ts-ignore` / `it.skip` / `xtest` 让代码"通过"
- **不删既有测试**让代码"通过"——测试 fail 是信号
- **补测试 ground 在真实代码**：写之前必须 Read 被测代码，看真实行为；不能写"看起来合理但其实没测真行为"的测试
- **测试风格跟项目走**：目录结构 / naming / assertion API / mock 风格 / fixture 习惯
- **不发明测试基础设施**：项目没装 framework → 报告 + 让用户决定要不要引入，不静默 `pnpm add vitest`
- **不写未来场景的测试**：测试的代码必须已经存在
- **不重复覆盖**：补测试前 grep 已有测试，相同 case 已有就不重写
- **mock 节制**：只 mock 必要的外部依赖（网络 / 文件系统 / 时间）；不要 mock 到测试不验证真实行为

## Hard Stops

- 没找到测试 framework / command（且不是空项目）→ 报告，让用户指定命令或先装 framework
- 补测试时新测试一开始就 green → 测试没真覆盖
- 测试 retry 1 次仍 fail → 不再 retry，按 fail 处理
- 用户要求"让 X 测试通过"但 X 反映的是真实 bug → 拒绝；建议回 think (fix mode)
- 项目没装 framework，用户没说要装，但要"跑测试" → 报告状态，问要不要 `/think feat` 引入测试

## 完成后输出

**跑测试**：

```
Test run: <command>
Total: N | Pass: N | Fail: N | Skipped: N

Failures:
- <file>::<test-name>
  → <assertion or error first line>
- ...

下一步：调试单个 fail 用 /test <file::name> / 修代码回 /think fix
```

**补覆盖**：

```
Coverage added: <area>

New tests:
- <test-file>: <case 1>
- <test-file>: <case 2>
- ...

Verify: <command> → pass (N new green)

下一步：跑全套 /test 看有没有 regression / 调 commit 入库
```

**调试**：

```
Failure: <file>::<test-name>

Root cause: <一段话>

Category: test-bug / code-bug / flaky

修复方向：
- <action>

下一步：<具体下一个 skill / 动作>
```

## Gotchas

| 情况                                    | 规则                                                      |
| --------------------------------------- | --------------------------------------------------------- |
| 测试 fail 后用 `.skip` 或删测试让它通过 | 永远不绕过；fail 是信号                                   |
| 补测试时测试一开始就 green              | 没真覆盖；改测试再确认                                    |
| 补测试时凭直觉写没 Read 被测代码        | 必须 ground 在真实行为                                    |
| Flaky 测试 retry 多次跑通就当通过       | 只 retry 一次；仍 fail = fail                             |
| 用 mock 屏蔽掉所有真实依赖              | mock 节制；只 mock 必要的边界                             |
| 静默 `pnpm add` 新测试 framework        | 不发明基础设施；让用户决定                                |
| 补 X 的测试时顺手重构 X 的代码          | scope creep；test 不改非测试代码（要改回 think refactor） |
| 写 N 个相似的测试覆盖同一个 case        | grep 已有测试；同 case 已有则不重写                       |
| 调试失败时直接"修补"测试通过            | 区分 test-bug / code-bug / flaky；不修补                  |
| 写测试 assert 一个还没实现的功能        | 测试的代码必须已存在                                      |
