# Anti-Patterns: 跨技能 AI 行为约束

> Always-on 行为守则。这些约束适用于所有 skill，不管 agent 当前在干什么。
>
> 每条 anti-pattern 都应该来自真实失败，**不是预想的**。从空开始，每次遇到 agent 失误就 append 一条。

| #   | Pattern | Wrong | Right |
| --- | ------- | ----- | ----- |
| \_  | \_      | \_    | \_    |

## 何时增补

- agent 实际犯了某种错误，且该错误**不限于单个 skill**——这才是 anti-pattern 候选
- 如果错误只在一个 skill 中发生，写进那个 SKILL.md 的 Gotchas 表里

## 何时移除

- 如果某条 anti-pattern 已经在 6 个月内没有触发过，重新评估它是否仍然有意义
- 如果 agent 模型升级后某条不再是问题，移除并记录
