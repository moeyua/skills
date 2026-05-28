---
name: review
description: '合并前的代码 review。5 维度扫描（plan 一致性 / 代码质量 / 错误处理 / 测试覆盖 / 简化机会），按 confidence ≥ 80 过滤，分级输出建议。Use when 用户说 "review" / "看看变更" / "把关" / "合并前检查"。Not for 主动重构（用 think refactor）、修 bug（用 think fix）、补测试（用 test）——review 只看不动。'
when_to_use: "review, 评审, 把关, 合并前, 看看变更, code-review"
dispatch_intent: "5 维度代码 review，confidence 过滤，只输出建议不改代码"
---

# Review

> **Prerequisite**：你应该知道项目背景。陌生项目先 `/explore`。

合并前的代码 review。**只看不动**——不改任何文件、不写代码、不补测试、不修 bug。所有发现都是建议，由用户决定回哪个 skill 处理。

## Outcome Contract

- Outcome: 一份按 severity 分级的 finding 报告，每条带 file:line 和建议方向
- Done when: 5 个维度（或指定 aspect）都扫过，confidence ≥ 80 的 finding 全部列出，正面 ack 也给了
- Evidence: `git diff` / 项目 guidelines (CLAUDE.md / AGENTS.md) / plan 文件（如有）/ 实际 Read 过的代码
- Output: Critical / Important / Suggestion / Strengths 四段 + 下一步建议

## 5 个维度

| 维度                    | 关注                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **plan** (plan 一致性)  | 改动是否在 plan 范围内 / scope creep / plan 没说的依赖被引入                            |
| **quality** (代码质量)  | bugs / 逻辑错误 / 项目 guidelines (CLAUDE.md/AGENTS.md) compliance / 命名 / 死代码      |
| **errors** (错误处理)   | silent failures / 过宽 catch / 不当 fallback / 生产代码用 mock / 缺少 logging           |
| **tests** (测试覆盖)    | plan acceptance scenarios 是否覆盖 / edge cases / 测试是否 ground 在真实行为 / 重复覆盖 |
| **simplify** (简化机会) | 复杂度 / nesting / 重复 / 过度抽象 / over-engineering                                   |

## Aspect Filter

用户消息含特定关键词 → 只 review 对应维度。没指定 → 全 5 维度。

```bash
/review                       # 默认全 5 维度
/review tests errors          # 只 tests + errors
/review plan                  # 只 plan 一致性
/review simplify              # 只简化机会
```

关键词识别（不区分大小写）：`plan` / `quality` / `errors` / `tests` / `simplify`。其他英文/中文表述按语义就近映射（"测试" → tests，"错误处理" → errors）。

## Confidence + 分级

每个 finding 给 0-100 confidence：

- **91-100 Critical**：critical bug / 项目 guidelines 明确违反 / 生产代码 silent failure
- **80-89 Important**：valid 重要问题但非阻塞合并
- **60-79 Suggestion**：建议但非必须
- **< 60**：不报告（false positive 风险高 / 噪音）

**aggressive filter——quality over quantity**。一个 review 输出 5 条 high-confidence finding 比 30 条混杂 finding 有用得多。

## 流程

```bash
# 1. 收集 context（并行）
git status --short
git diff <base>...HEAD       # 改动范围（base 优先 origin/main，否则上一个 commit）
git log -5 --oneline         # 最近的 commit 风格

# 2. 找项目 guidelines（如有）
cat CLAUDE.md AGENTS.md      # 如果存在

# 3. 找 plan（如果 plan 维度在 scope 里）
ls plans/                    # 最近 done/approved 的 plan
```

按 aspect filter 决定要跑哪些维度。每个维度独立扫，发现都先打草稿，最后用 confidence 过滤。

按 severity 分组输出。永远给 Strengths 段，即使是 1-2 条——纯负面的 review 信号差。

## 严格"只看不动"

review **绝对不做**：

- 修改任何文件（包括 SKILL.md / 项目代码 / 测试代码 / plan 文件）
- 写代码补丁（给方向，不给 code block）
- 调其他 skill（不自动跳 fix/refactor/test）
- 跑测试改修测试
- 改 plan status
- commit / push

发现问题 → **报告 + 建议方向**：

- 发现简化机会 → 建议用户回 `/think refactor`
- 发现测试 gap → 建议用户回 `/test 补覆盖`
- 发现 bug → 建议用户回 `/think fix`
- 发现 scope creep → 标出来让用户决定（撤回 plan 之外的改动 / 接受 / 回 think 改 plan）

## Hard Stops

- 工作树和 HEAD 完全一致（无 diff 可看）→ 报告"无改动可 review"
- 用户指定 aspect 但 spelling 错（如 `/review xxx`）→ 报告识别失败，列可用 aspect
- 当前 detached HEAD / 进行中 rebase / merge → 报告，可能拿不到准确 diff
- review 过程中诱发改动文件的冲动（"我顺手改一下"）→ 立刻 stop，写进 finding 而不是动手

## 完成后输出

```
# Review Summary

Reviewed: <git diff base..HEAD or 指定 scope>
Aspects: <plan, quality, errors, tests, simplify> 或子集
Confidence threshold: ≥ 80

## Critical (X)
- [<dim>] <file:line> — <issue> (confidence: NN)
  → 建议：<direction>

## Important (X)
- [<dim>] <file:line> — <issue> (confidence: NN)
  → 建议：<direction>

## Suggestions (X)
- [<dim>] <file:line> — <issue> (confidence: NN)
  → 建议：<direction>

## Strengths
- <一两条正面 ack>

## Recommended Next
- Critical 优先：<具体动作，如 /think fix>
- Important 次之：<...>
- Suggestion 视情况
```

无 high-confidence finding → 仍出报告，Critical/Important/Suggestion 各写 "None"，Strengths 给完整正面 ack，标 "Ready to commit/push"。

## Gotchas

| 情况                                       | 规则                                                           |
| ------------------------------------------ | -------------------------------------------------------------- |
| review 过程中顺手修了 bug                  | 永远不动；写进 Critical/Important，建议回 think fix            |
| 给的"建议"包含完整代码 patch               | 给方向不给代码；reviewer 给建议，作者自己实现                  |
| 把所有发现都报（confidence 都不过滤）      | ≥ 80 才报；低于的丢弃（避免噪音 / 培养 reviewer 信任）         |
| 没给 Strengths 段                          | 永远 ack 正面，哪怕 1-2 条；纯负面 review 信号差               |
| 报告里没 group by severity                 | 必须 Critical/Important/Suggestion 三段                        |
| 跟 plan 维度跑但找不到 plan 文件           | 跳过 plan 维度并标注"无 plan 文件，跳过 plan 一致性扫描"       |
| simplify 维度发现机会然后自己 refactor 了  | 简化也是建议，回 think refactor                                |
| 测试 gap 发现后自己补测试                  | review 不补测试，回 test                                       |
| aspect filter 没识别用户的意图（中文表述） | 按语义就近映射；实在不确定就默认全 5 维度并标注"未识别 aspect" |
| 把"风格偏好"当 Critical                    | 风格偏好最多 Suggestion，除非违反项目 guidelines 明文规则      |
