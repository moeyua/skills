---
name: review
description: '合并前的代码 review。5 维度扫描（plan 一致性 / 代码质量 / 错误处理 / 测试覆盖 / 简化机会），按 confidence ≥ 80 过滤，分级输出建议。Use when 用户说 "review" / "看看变更" / "把关" / "合并前检查"。Not for 主动重构（用 think refactor）、修 bug（用 think fix）、补测试（用 test）——review 只看不动。'
when_to_use: "review, 评审, 把关, 合并前, 看看变更, code-review"
dispatch_intent: "5 维度代码 review，confidence 过滤，只输出建议不改代码"
---

# Review

review 是合并前最后一道关——找出可能让 reviewer / 用户 / 生产环境出问题的改动，给作者建议方向，让**作者**决定怎么处理。所有约束的根目的是：保住作者的 agency，把判断权留给他。review 一旦动手改文件，作者就失去看见自己 review 反馈的机会。

陌生项目先调 `/explore`——不知道项目背景的 review 给出的"建议"会变成噪音。

**review 只看不动**。具体不做的事：

- 不改任何文件（代码 / 测试 / plan / SKILL.md / 都不动）
- 不给完整 code patch——只给方向（"这里有 race condition，看下加锁的位置"），代码由作者自己写
- 不调其他 skill 替作者干活（不自动跳 fix / refactor / test）
- 不改 plan status / 不 commit / 不 push

这些约束看起来限制 review 力度，实际上是让 review 真正 useful——一份给出问题但不动手的报告，比一份"顺手都修好了"的 PR 给作者价值大得多（后者作者根本没机会理解发生了什么）。

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

用户消息含特定关键词时只 review 对应维度，没指定就跑全 5 维度。关键词不区分大小写：`plan` / `quality` / `errors` / `tests` / `simplify`。

```bash
/review                       # 全 5 维度
/review tests errors          # 只 tests + errors
/review plan                  # 只 plan 一致性
```

中文 / 近义表述按语义就近映射（"测试" → tests，"错误处理" → errors）。实在不确定就默认全 5 维度并 note 一句"未识别 aspect 关键词，跑全维度"——别因为没把握就停下不干。

## Confidence + 分级

每个 finding 给 0-100 confidence。**aggressive filter——quality over quantity**：一份 review 给 5 条 high-confidence finding 比 30 条混杂 finding 有用得多。混入低 confidence 的 finding 是 reviewer 信任的慢性杀手。

| 分级           | confidence | 这一档是什么样的发现                                                                |
| -------------- | ---------- | ----------------------------------------------------------------------------------- |
| **Critical**   | 91-100     | 一定会出问题：critical bug、项目 guidelines 明确违反、生产代码 silent failure       |
| **Important**  | 80-89      | 高度怀疑但非阻塞合并：很可能出问题，作者得回应一下                                  |
| **Suggestion** | 60-79      | 建议但非必须：风格 / 微小重复 / 局部可简化；作者可以接受也可以驳回                  |
| —              | < 60       | 不报告——false positive 风险高 / 噪音；漏报比误报代价小，宁可放过也别灌水            |

**"风格偏好"最多 Suggestion**，除非违反项目 guidelines 明文规则——把审美当 Critical 是滥用职权。

## 流程

收集 context（并行）：

```bash
git status --short
git diff <base>...HEAD       # 改动范围（base 优先 origin/main，否则上一个 commit）
git log -5 --oneline         # 最近的 commit 风格
cat CLAUDE.md AGENTS.md      # 项目 guidelines（如果存在）
ls plans/                    # 最近 done/approved 的 plan（如果 plan 维度在 scope）
```

按 aspect filter 决定跑哪些维度。每个维度独立扫，发现先打草稿，最后用 confidence ≥ 80 过滤，按 severity 分组输出。

**永远给 Strengths 段**，即使只有 1-2 条——纯负面的 review 让作者关闭防御性吸收能力，价值大打折扣。

跑 plan 维度时找不到 plan 文件就跳过 plan 维度并 note "无 plan 文件，跳过 plan 一致性扫描"，不要硬猜 plan 内容。

发现某类问题时把作者引到对应 skill，而不是自己接管：

- 简化机会 → 建议回 `/think refactor`
- 测试 gap → 建议回 `/test 补覆盖`
- bug → 建议回 `/think fix`
- scope creep → 标出来让用户决定（撤回 plan 之外的改动 / 接受 / 回 think 改 plan）

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

无 high-confidence finding 时仍出报告，Critical / Important / Suggestion 各写 "None"，Strengths 给完整正面 ack，标 "Ready to commit/push"。

## 什么情况下停下来

review 跟其他 skill 不同——它的失败模式不是"硬上"，而是"动手"。下面这些情况停下并报告：

- **工作树和 HEAD 完全一致（无 diff 可看）**——报告"无改动可 review"，别强行 review 历史 commit；用户没要 review 历史就别越界。
- **detached HEAD / 进行中 rebase / merge**——git 状态特殊时 diff 可能拿不到准确范围，报告状态让用户决定。
- **明显的 aspect spelling 错**（如 `/review xxx`，`xxx` 不是任何已知 aspect 也不是合理的中文 / 近义表述）——报告"无法识别 aspect 'xxx'，可用：plan / quality / errors / tests / simplify"，让用户重选，别擅自 fallback 全维度。
- **review 过程中诱发"我顺手改一下"的冲动**——立刻停下，把发现写进 finding 而不是动手。review 一动手就丧失了 review 的位置。
