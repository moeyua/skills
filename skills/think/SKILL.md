---
name: think
description: '把模糊想法澄清成可执行的 plan。多 mode：default（探索/brainstorm）/ fix / feat / refactor / perf。具名 mode 出 plan 文件到 plans/。Use when 用户说 "想想" / "出方案" / "怎么做" / 任何"需要先想清楚"的场景。Not for 已经有 plan 要落代码（用 implement）、价值判断"值不值得做"、纯回答 API 用法。'
when_to_use: "think, 想想, 头脑风暴, 出方案, 设计, 怎么做, 该不该, 值不值得"
dispatch_intent: "意图澄清 + 多 mode 方案制定，具名 mode 写 plan 文件"
---

# Think

think 是意图判断的舞台——把模糊想法澄清成清晰意图，再翻译成可执行的 plan。它不写代码、不动 scaffolding、不留 placeholder。所有约束的根目的都是让 plan 被批准时已经经得起 implement 严格执行，不会回头才发现"原来这件事还没想清楚"。

陌生项目或不熟悉的模块先调 `/explore`——think 假设你对项目已经有基本理解，没基础硬开容易 hallucinate。

直接给意见，take a position。避免 "这是个好问题" / "有很多种方式" / "你可以考虑"——hedging 是逃避判断，对方拿到模糊回应只能再问一遍，时间双输。如果不确定，说清楚什么 evidence 会改变你的判断，让对方知道这是 take position 而不是固执。

## Outcome Contract

- Outcome: 一个 approved 的 plan（具名 mode）或一份探索结论（default mode）
- Done when: 具名 mode → plan 文件写到 `plans/`，每一步可执行不需要再决策；default mode → 探索方向和下一步明确
- Evidence: `git status` / 项目文件读取 / 用户回答的 clarify questions
- Output: 具名 mode → plan 文件路径 + 摘要 + after-approval 提示；default → 对话内的结论摘要

## Phase 1: Clarify

进 skill 第一步永远是 Clarify。**一次只问一个问题**——多选优先（"A 还是 B？"），开放式备用。一次轰炸 3-5 个问题让对方负担过重，反而拿不到清晰回答。

判断够不够 clarify 的标准（满足才进 Phase 2）：

- 用户想达成的目标具体到一句话能描述
- 知道是 fix / feat / refactor / perf / 还是 default 探索
- 关键约束已知（接口边界 / 行为保留要求 / baseline 数字 / 不能动的地方）
- 没有阻塞性歧义（"两种合理解读 cost 差别巨大"必须先问清）

**知道意图 ≠ 不需要 clarify**。即使用户说 `/think 重构这块`，仍可能要问"保留哪些 API 行为？接受多少风险？跑哪些回归测试？"——mode 清楚不等于约束清楚。

如果用户说"你看着办"或"whatever you think is best"，先给推荐 + 一句话理由再让对方确认或反对，而不是默默替对方做决定——默默替对方决定剥夺了对方反对的机会。

## Phase 2: Mode Picker

基于 Clarify 结果定 mode：

| 用户线索                                      | Mode       | Plan 文件 |
| --------------------------------------------- | ---------- | --------- |
| 想法模糊 / 探索性 / "我想做..." / "该不该..." | (default)  | 不写      |
| 报错 / 异常 / 回归 / "为什么不工作"           | `fix`      | 写        |
| 新功能 / 新能力                               | `feat`     | 写        |
| 整理结构 / 不改外部行为                       | `refactor` | 写        |
| 性能 / 慢 / 卡顿                              | `perf`     | 写        |

含糊时（"我想优化这块代码"——refactor 还是 perf？）多问一句：是为了**结构可读**（refactor）还是**数字变好**（perf）。

进入具名 mode 后加载对应 reference：

- [references/mode-fix.md](references/mode-fix.md)
- [references/mode-feat.md](references/mode-feat.md)
- [references/mode-refactor.md](references/mode-refactor.md)
- [references/mode-perf.md](references/mode-perf.md)

Plan 文件结构见 [references/plan-template.md](references/plan-template.md)。

## Default Mode（brainstorm）

意图未收敛——纯探索对话。允许多轮回合，**不写 plan 文件**——写 plan 等于假装收敛了；意图没定型时落地的 plan 一定 churn。

输出形态：方向草案 / 选项对比 / 待澄清问题清单。

什么时候收敛进具名 mode：用户的目标变清晰（"OK 我决定做 X"）→ 切到对应 mode → Phase 3。卡在 brainstorm 出不来时，主动提议收敛："基于讨论我倾向 X mode，要走这条路吗？"——一直探索而不收敛也是一种逃避。

**价值判断不在 think 范围**。如果用户问"这件事值不值得做"/"该不该做"，明确说这不是 praxis 处理的——praxis 只决定怎么做，不决定该不该做。可以给一句话观察（"这看起来是 X 的取舍"），但不替对方下"该做 / 不该做"的结论。

## Phase 3: Propose Approach（具名 mode）

给一个推荐方案。**只在 tradeoff 真正接近时（>40% 用户可能更倾向另一个）才提第二个**——多方案是有用的稀缺信号；次次给三方案对比就成了噪音。永远包含一个 minimal option（最小可行的样子），让对方能把推荐跟"完全不做"做对比。

识别**最脆弱的假设**（premise collapse）并显式写出：

> "这个 plan 假设 X。如果 X 不成立，会发生 Y。"

这一步逼自己看见 plan 的脆弱点。如果脆弱假设是 load-bearing（一倒整个 plan 全垮），**变形设计让它即使失败也能 survive**——不要赌假设。

阻塞性歧义不能默默选——明确说"两种解读冲突在 X 点上，选 A 还是 B？"。默默选等于把判断责任压到 implement 阶段。

## Phase 4: Validate Before Handing Off

Plan 写完前自检——这一步防止"看起来完整但 implement 时才发现关键东西没说"。

- [ ] 超过 8 个文件 / 引入 1 个新服务 → 显式 acknowledge（scope 大了 implement 容易踩坑）
- [ ] 超过 3 个组件交换数据 → 画 ASCII diagram，找环路（少于 3 个不用画，画了反而是 noise）
- [ ] 列了所有 meaningful 测试路径（happy / errors / edges）
- [ ] 外部状态有变动的 step 都有 rollback 路径
- [ ] 每个外部 API key / token / 第三方账号都列了（不留到实施中途讨钥匙）
- [ ] 每个依赖的 MCP / 外部 API / CLI 已经验证可达——凭印象写"用 X 库的 Y API"是 `rules/anti-patterns.md` #1 的典型；动手前查文档或读已有代码

**Plan red flags**（任意触发说明 plan 没写好，回头改）：

- 有 placeholder（`TBD` / `TODO` / `implement later` / `similar to step N`）——是想清楚但还没写下来的标志，跟实施阶段才"现想"等价。
- 任何 phase 不能独立 ship（必须等下一 phase 才有用）——多 phase 串成一根，中间出问题只能整批回退。
- 存在 "Phase 0: investigate / spike"——调研属于 plan 之前，不该写进 plan 当 step。

## Phase 5: 写 plan 文件 + After Approval

具名 mode 出完 plan 后写文件到 `plans/YYYY-MM-DD-<slug>.md`：

- `<slug>` 从 plan 主题派生（`fix-login-loop` / `feat-rbac` / `refactor-storage-layer`）
- 文件结构遵循 `references/plan-template.md`
- mode-specific 字段参见对应 mode reference

写完后输出：

```
Plan written to plans/YYYY-MM-DD-<slug>.md

[摘要 2-3 行]

要实施：说 "implement this plan"。实施完跑 review 把关。
```

**用户说 "implement this plan" / "可以干" / "按计划做" / "整" / "直接改" → 视为 approval，直接转给 implement**。不要 re-litigate——刚批的 plan 又问"确定吗"是把判断责任推回去，对方刚下完决心又被踢回来很烦。

如果用户批准后改口"其实再想想..."，不要重做，明确问"你刚批了 plan，要改哪一点？"——锁定最小修改面，避免整 plan 重启。

## 什么情况下停下来

think 的失败模式都是"该停顿处理却继续推进"。下面这些情况停下来处理，不要硬上：

- **clarify 没满足检查清单就想跳到 propose**——Phase 1 是收敛入口，提早跳进 propose 等于猜对方意图。
- **brainstorm 阶段就想写 plan 文件**——default mode 不写 plan；强行写出来等于假装意图收敛了。
- **凭印象引用外部 API / 库 / CLI**——写进 plan 前查文档或读现有代码；见 `rules/anti-patterns.md` #1。
- **用户问值不值得做**——praxis 不在这个层面回答；明确说不是 praxis 范围，给一句话观察就好。
- **stuck 在 brainstorm 出不来**——提议收敛而不是继续探索；探索到一定深度还没收敛是个停顿信号。
