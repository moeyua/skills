---
name: test
description: '测试相关工作的统一入口：跑测试、补覆盖、调试失败。Use when 用户说 "跑测试" / "加测试" / "补回归" / "这个 test fail 帮我看"。Not for plan 要求的最小测试集（在 implement 内 TDD 写）、非测试代码改动（用 implement）、纯 review 不写测试（用 review）。'
when_to_use: "test, 测试, 跑测试, 加测试, 补测试, 单元测试, 回归, 覆盖, flaky, 测试 fail"
dispatch_intent: "跑 / 补 / 调试测试的统一入口"
---

# Test

test 是测试相关工作的统一入口——跑测试、补覆盖、调试失败。所有约束的根目的都是让**测试守住真相**：测试 fail 是信号不是麻烦，绕过它等于把信号丢掉；测试代码要 ground 在真实代码行为，凭直觉写的"看起来合理"的测试是噪音。

陌生项目先调 `/explore`——不知道项目的测试 framework 和命令就开干，容易发明不必要的基础设施。

test 跟项目走：测试 framework、命令、目录结构、naming、assertion 风格、mock 习惯——全部用项目现成的，不发明新规范。项目没装 framework 就报告状态让用户决定要不要引入，**绝不静默 `pnpm add`**。

## Outcome Contract

- Outcome: 测试 suite 跑通 / 覆盖按要求补齐 / 失败诊断清晰
- Done when: 跑测试 → pass/fail 全报告；补测试 → 新测试 green + 覆盖意图清晰；调试 → root cause 已识别
- Evidence: 实际跑测试命令的输出 / Read 过的被测代码 / 失败信息全文
- Output: 见每类场景结尾的输出模板

## 三类工作场景（看消息分流）

| 用户消息线索                                           | 工作   |
| ------------------------------------------------------ | ------ |
| `/test` / "跑测试" / "test 通过吗"                     | 跑测试 |
| "加测试" / "补 X 的回归" / "覆盖 Y 模块"               | 补覆盖 |
| "这个 fail 帮我看" / "flaky 排查" / "为什么这个测试挂" | 调试   |

不需要 mode 系统——消息内容自然分流。

## 跑测试

检测 framework + 命令（`package.json` scripts / `Cargo.toml` / `pyproject.toml` / `go.mod` 等），跑对应 test 命令，按下面格式报告：

```
Test run: <command>
Total: N | Pass: N | Fail: N | Skipped: N

Failures:
- <file>::<test-name>
  → <assertion or error first line>

下一步：调试单个 fail 用 /test <file::name> / 修代码回 /think fix
```

多个失败时按"看起来相关 / 看起来独立"分组——同根因失败一锅端比逐个看效率高得多。

**Flaky 怀疑**：某个测试看起来时序 / 资源敏感时**只 retry 一次**；仍 fail 就不是 flaky，就是 fail。多次 retry 跑通就当通过是测试守住真相的反向操作——你只是在等运气。

## 补覆盖

1. **Clarify 要补哪里**——用户消息给的范围，或问"覆盖 X 的哪类场景：happy / error / edge / 集成？"
2. **Read 被测代码**，看清**真实行为**而不是猜应该怎样。凭直觉写的测试常常是"测了一个不存在的 spec"。
3. **Grep 已有测试**——同 case 已有就不重写，N 份相似测试覆盖同一 case 是噪音。
4. **列覆盖计划**：要测哪些场景，每条一句话。
5. **按项目测试风格写**：目录结构 / naming / assertion API / mock 用法跟现有走，不发明新规范。
6. **跑新测试 → 必须 green**：
   - 一开始就 red 但不是 pre-existing bug → 测试本身错了
   - 一开始就 green → 测试没真覆盖（停下来改测试再试，不是改代码"凑"）
7. **Mock 节制**——只 mock 必要的外部边界（网络 / 文件系统 / 时间）；mock 到测试不验证真实行为就是自欺欺人。

```
Coverage added: <area>

New tests:
- <test-file>: <case 1>
- <test-file>: <case 2>

Verify: <command> → pass (N new green)

下一步：跑全套 /test 看有没有 regression / 调 commit 入库
```

**只覆盖讨论好的范围**——发现的 refactor 机会写进 report，要改回 `/think refactor`，不顺手动手。

## 调试

1. **Read 三样**：失败测试代码 + 完整报错信息 + 被测代码。三个都要读，缺一个都可能误诊。
2. **判断三种可能**：
   - **测试错了**（assertion 写错 / mock 不对 / 期望与实现不一致）→ 修测试
   - **代码错了**（真 bug）→ 不在这里改；建议回 `/think fix`
   - **Flaky**（时序 / 资源 / 全局状态 / random seed）→ 报告 root cause；race condition 时标 TODO 让用户决定
3. **不"修补"测试通过**——区分清楚是哪一类问题，按对应路径处理。直接改测试 assertion 让它过等于消除信号源。

```
Failure: <file>::<test-name>

Root cause: <一段话>

Category: test-bug / code-bug / flaky

修复方向：
- <action>

下一步：<具体下一个 skill / 动作>
```

## 什么情况下停下来

test 最常见的失败模式是"为了让测试通过而绕过信号"。下面这些情况停下并报告：

- **想 `.skip` / 删测试 / 加 `--no-verify` 让它过**——永远不绕过；fail 就是信号。
- **测试 retry 1 次仍 fail**——不再 retry，按 fail 处理；多次 retry 跑通就当通过是欺骗自己。
- **用户要求"让 X 测试通过"但 X 反映的是真实 bug**——拒绝；建议回 `/think fix`，让 bug 走正经修复路径。
- **没找到测试 framework / command**（且不是空项目）——报告，让用户指定命令或先装 framework。
- **项目没装 framework 但用户要"跑测试"**——报告状态，问要不要 `/think feat` 引入测试。
- **想写测试 assert 一个还没实现的功能**——测试的代码必须已经存在，否则就是 TDD 越界（TDD 是 implement 的事，不是 test）。
- **想顺手重构被测代码**——scope creep；refactor 机会写进 report 但不动手，要改回 `/think refactor`。
