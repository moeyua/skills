---
name: think
description: '把模糊想法澄清成可执行的 plan。多 mode：default（探索/brainstorm）/ fix / feat / refactor / perf。具名 mode 出 plan 文件到 plans/。Use when 用户说 "想想" / "出方案" / "怎么做" / 任何"需要先想清楚"的场景。Not for 已经有 plan 要落代码（用 implement）、价值判断"值不值得做"、纯回答 API 用法。'
when_to_use: "think, 想想, 头脑风暴, 出方案, 设计, 怎么做, 该不该, 值不值得"
dispatch_intent: "意图澄清 + 多 mode 方案制定，具名 mode 写 plan 文件"
---

# Think

> **Prerequisite**：think 假设你对当前项目已有基本理解。陌生项目或不熟悉的模块，先调 `/explore`。

直接给意见，take a position。避免 "这是个好问题" / "有很多种方式" / "你可以考虑"。说什么 evidence 会改变你的判断。

出方案前**不写任何代码**——没有 scaffolding、没有 pseudo-code、没有"先动手再改"。

## Outcome Contract

- Outcome: 一个 approved 的 plan（具名 mode）或一份探索结论（default mode）
- Done when: 具名 mode → plan 文件写到 `plans/`，每一步可执行不需要再决策；default mode → 探索方向和下一步明确
- Evidence: `git status` / 项目文件读取 / 用户回答的 clarify questions
- Output: 具名 mode → plan 文件路径 + 摘要 + after-approval 提示；default → 对话内的结论摘要

## Phase 1: Clarify

进 skill 第一步永远是 Clarify Phase。**一次只问一个问题**——多选优先（"A 还是 B？"），开放式备用。

判断够不够 clarify 的标准（满足才进 Phase 2）：

- 用户想达成的目标具体到一句话能描述
- 知道是 fix / feat / refactor / perf / 还是 default 探索
- 关键约束已知（接口边界 / 行为保留要求 / baseline 数字 / 不能动的地方）
- 没有阻塞性歧义（"两种合理解读 cost 差别巨大"必须先问清）

知道意图 ≠ 不需要 clarify。即使用户说 `/think 重构这块`，仍可能要问"保留哪些 API 行为？接受多少风险？跑哪些回归测试？"

## Phase 2: Mode Picker

基于 Clarify 结果定 mode：

| 用户线索                                      | Mode       | Plan 文件 |
| --------------------------------------------- | ---------- | --------- |
| 想法模糊 / 探索性 / "我想做..." / "该不该..." | (default)  | 不写      |
| 报错 / 异常 / 回归 / "为什么不工作"           | `fix`      | 写        |
| 新功能 / 新能力                               | `feat`     | 写        |
| 整理结构 / 不改外部行为                       | `refactor` | 写        |
| 性能 / 慢 / 卡顿                              | `perf`     | 写        |

含糊（"我想优化这块代码"——refactor 还是 perf？）→ clarify 多问一句：是为了**结构可读**（refactor）还是为了**数字变好**（perf）。

进入具名 mode 后加载对应 reference：

- [references/mode-fix.md](references/mode-fix.md)
- [references/mode-feat.md](references/mode-feat.md)
- [references/mode-refactor.md](references/mode-refactor.md)
- [references/mode-perf.md](references/mode-perf.md)

Plan 文件结构见 [references/plan-template.md](references/plan-template.md)。

## Default Mode（brainstorm）

意图未收敛——纯探索对话。允许多轮回合。不写 plan 文件，不进 implement。

输出形态：方向草案 / 选项对比 / 待澄清问题清单。

什么时候收敛进具名 mode：用户的目标变清晰（"OK 我决定做 X"）→ 切到对应 mode → Phase 3。

## Phase 3: Propose Approach（具名 mode）

给一个推荐方案。**只在 tradeoff 真正接近时（>40% 用户可能更倾向另一个）提第二个**。永远包含一个 minimal option。

识别**最脆弱的假设**（premise collapse）并显式写出：

> "这个 plan 假设 X。如果 X 不成立，会发生 Y。"

如果脆弱假设是 load-bearing 的，**变形设计让它即使失败也能 survive**。

阻塞性歧义不能默默选——明确说"两种解读冲突在 X 点上，选 A 还是 B？"

## Phase 4: Validate Before Handing Off

Plan 写完前 self-check：

- [ ] 超过 8 个文件 / 引入 1 个新服务 → 显式 acknowledge
- [ ] 超过 3 个组件交换数据 → 画 ASCII diagram，找环路
- [ ] 列了所有 meaningful 测试路径（happy / errors / edges）
- [ ] 能不动数据 rollback 吗？
- [ ] 每个外部 API key / token / 第三方账号都列了（不留到实施中途讨钥匙）
- [ ] 每个依赖的 MCP / 外部 API / CLI 已经验证可达

**Plan red flags（任意触发说明 plan 没写好，回头改）：**

- 有 placeholder（`TBD` / `TODO` / `implement later` / `similar to step N`）
- 任何 phase 不能独立 ship（必须等下一 phase 才有用）
- 存在 "Phase 0: investigate / spike"（调研属于 plan 之前，不在 plan 内）

## Phase 5: 写 plan 文件 + After Approval

具名 mode 出完 plan 后，写文件到 `plans/YYYY-MM-DD-<slug>.md`：

- `<slug>` 从 plan 主题派生（`fix-login-loop` / `feat-rbac` / `refactor-storage-layer`）
- 文件结构遵循 `references/plan-template.md`
- mode-specific 字段（参见对应 mode reference）

写完后输出：

```
Plan written to plans/YYYY-MM-DD-<slug>.md

[摘要 2-3 行]

要实施：说 "implement this plan"。实施完跑 review 把关。
```

**用户说 "implement this plan" / "可以干" / "按计划做" / "整" / "直接改" → 视为 approval。不要 re-litigate plan，直接转给 implement。**

## Gotchas

| 情况                                             | 规则                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| 一次问 3-5 个 clarify 问题轰炸用户               | 一次一题，多选优先                                                             |
| 没 clarify 完就跳到 propose                      | Phase 1 检查清单全过才进 Phase 2                                               |
| brainstorm 阶段就强行写 plan 文件                | default mode 不写文件；只有收敛到具名 mode 才写                                |
| Plan 里写 "TBD" / "之后再说"                     | Plan red flag；回头补完整                                                      |
| 用户批准后又改方向 "其实再想想..."               | 不要 re-litigate；明确说"你刚批了 plan，要改哪一点？"，最小修改而非重做        |
| "这是个有趣的问题" / "你可以考虑..."             | 反 hedging；直接 take position                                                 |
| `/think 重构这块` 跳过 clarify                   | 知道 mode 不等于不需要 clarify；仍问 1-2 个收敛性问题                          |
| 价值判断（"值不值得做"）                         | praxis 不做价值判断；如果用户问，明确说"这不在 praxis 范围"+ 给一句话观察      |
| 卡在 brainstorm 出不来                           | 提议收敛："基于讨论我倾向 X mode，要走这条路吗？"                              |
| 用 ASCII diagram 画 2 个组件的简单关系           | 只在 >3 组件交换数据时画                                                       |
| Plan 写"用 X 库的 Y API"，凭印象没 verify Y 存在 | 外部库 / 工具 / API 用法必须查文档或读现有代码；见 `rules/anti-patterns.md` #1 |
