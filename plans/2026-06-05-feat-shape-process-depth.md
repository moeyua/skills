---
mode: feat
title: shape 过程深度——two altitudes / 决策点交回 / grounding
created: 2026-06-05
status: done
---

# shape 过程深度——two altitudes / 决策点交回 / grounding

> 记录顺序说明:本 plan 在 build 之后补写(原会话从 skill-creator 直接落地,跳过了 shape 的 plan artifact)。内容如实反映对话中定稿的 approved approach 与已完成的 build/verify。

## Building

给 [skills/shape/SKILL.md](../skills/shape/SKILL.md) 外科式新增三块内容,落地 ROADMAP 的三条 shape 过程深度规划(思考深度对标 brainstorm / 先锁整体再下钻 / 不该一路自顾推进)。把 shape 从"线性管道(唯一闸门在末尾)"改成"两条横切纪律统辖的循环",共同根因是 shape 收敛太快、进细节后不回整体、内部自动串联不给用户决策点。

## Not building

- 不新增 reference 文件、不新增 Phase、不动现有 section 的好内容(one-question-at-a-time / fragile-assumption naming / When to stop 等保留)。
- 不把 two altitudes / hand-the-wheel-back 扩散到其他 skill——ROADMAP 把 scope 限定在 shape;"squire #3 递归"虽理论上对别的 skill 也成立,本次不扩。
- 不动 [specs/shape/spec.md](../specs/shape/spec.md) 与 [ROADMAP.md](../ROADMAP.md)——spec 同步与 ROADMAP 收口归 persist。
- 不 commit——交给用户经 commit/propose 决定。

## Approach

三个动作一一对应三条 roadmap,均为现有结构上的小段落新增,用 squire 的对话式+解释 why 风格,不堆 ALWAYS/NEVER(哲学 #1 ceiling 不是 floor、#5):

1. `## Two altitudes`(Outcome Contract 之后、Phase 1 之前)——whole→detail→whole 往返,含"别被用户带跑"补充。
2. `## Hand the wheel back at each decision`(紧跟前者)——把哲学 #3 递归进 shape 内部,界线是"绝不把判断悄悄塞进 plan",非"每步都批准"。
3. Phase 1 Clarify 补两段 grounding——读项目打地基 + 外部定义/工具/API 查权威文档不靠训练记忆(接 anti-patterns)。

放在 Outcome Contract 之后当横切纪律,而非塞进单个 Phase——因为它们要同时统辖 Clarify 与 Propose。这是本方案的关键结构判断。

## Premise collapse

本方案假设 shape 收敛太快的根因是**结构缺停靠点**(线性管道只有末尾闸门),而非单纯 prose 不够。若根因其实是模型不读 prose(规则在却不照做),那加 prose 收效有限,真正该做的是机械层(如 checks 或 marker)。缓解:三块都解释 why 而非堆命令,让模型有 theory of mind 去执行;若后续观察到行为仍不变,再考虑机械手段(ROADMAP 的 Marker)。

## Key decisions

1. 三条 roadmap 合成一个干预而非三处独立改动 —— 它们是同一根因(收敛太快)的三张脸。
2. 两条纪律做成横切 section 放在 Phase 之前 —— 它们统辖所有 Phase,塞进单个 Phase 会限制作用域。
3. "决策点交回"界线划在"别把判断悄悄塞进 plan",不是"每步批准" —— brainstorming 的 HARD-GATE 是 floor,撞 squire 哲学 #1。
4. grounding 显式接 anti-patterns 第 1 条 —— 外部事实查权威文档,呼应用户补充。
5. prose 用英文 —— 与现有 SKILL.md 一致。

## Public surface changes

shape skill 的行为契约(SKILL.md)变更:新增两条贯穿全程的过程纪律 + Clarify 的 grounding 要求。frontmatter / description / 命令名不变。结构 invariant(checks.ts 9 项)不变,仍全过。

## Spec delta

shape 的可观察过程行为变化,供 persist 记入 [specs/shape/spec.md](../specs/shape/spec.md):

```markdown
## ADDED Requirements

### Requirement: 整体↔细节高度往返

shape SHALL 在下钻细节前点明其服务的整体,并在解决后回到整体复核整体是否仍成立,再进入下一个细节;当下钻由用户发起时,shape SHALL 在答完细节后主动重新提出仍未合上的整体方向问题,且不把用户在钻细节当作整体已清楚的信号。

#### Scenario: 用户挑细节往下钻

- GIVEN 整体方向尚未确认 / WHEN 用户从一大段里挑某个细节问题往下钻 / THEN shape 跟进回答该细节,并在回答后重新拎出未确认的整体方向问题

### Requirement: 决策点把串联交回用户

shape SHALL 在每个真决策(mode / approach / 已解决的 fragile assumption / 划定的 scope)处命名该决策、说明它如何移动整体并停下,绝不把判断无声地并入 plan;用户不反对即视为同意。

#### Scenario: clarify 后进入出方案

- GIVEN clarify 刚结束 / WHEN shape 准备进入下一步 / THEN shape 不一口气自动串到 plan,而是在决策点 surface 后等待用户

### Requirement: clarify 的 grounding

shape SHALL 在 clarify 期间读相关代码/文档/历史以打地基,并对 plan 依赖的任何外部定义/工具/库/API 对照权威文档核实而非凭训练记忆。

#### Scenario: plan 依赖外部工具

- GIVEN 方案要用到某外部库/工具/API / WHEN shape 写进 plan 前 / THEN shape 查权威文档核实其行为,而非凭记忆断言
```

## Implementation steps

1. 新增 Two altitudes + Hand the wheel back 两个 section
   - change: [skills/shape/SKILL.md](../skills/shape/SKILL.md) Outcome Contract 之后、Phase 1 之前插入两个 section
   - verify: `pnpm test`(smoke 结构 check 全过)
2. Phase 1 Clarify 补两段 grounding
   - change: [skills/shape/SKILL.md](../skills/shape/SKILL.md) "you decide" 段之后插入两段
   - verify: `pnpm test` + `pnpm format` 无改动

## Verification

- command: `pnpm test` → 60 passed(含 9 项结构 check:description 仍 40-500、Outcome Contract 四字段、链接有效等)
- command: `pnpm format` → 无改动(prose 已合 oxfmt)
- checklist (manual):
  - [x] 三块内容就位、不动现有 section
  - [x] 无 ALWAYS/NEVER 堆砌,每块带 why
  - [x] 在 feat-shape-process-depth 分支,未 commit

## Rollback

未 commit,改动仅在工作树/分支。回退:`git checkout skills/shape/SKILL.md`(撤改动)或删分支 `git branch -D feat-shape-process-depth`。无外部状态变更。

## Risks & Unknowns

- **prose 加了但行为不变**:见 Premise collapse;缓解为解释 why + 后续观察。
- **spec 漂移**:shape 行为变了,specs/shape/spec.md 未同步——已记入上方 Spec delta,owner: persist,blocker: no。

## Interface boundary

- **暴露**:shape 的过程契约新增两条横切纪律(two altitudes / hand the wheel back)+ Clarify 的 grounding 要求,体现在 agent 触发 shape 时全文加载的 SKILL.md。
- **不暴露**:frontmatter `name` / `description` / `when_to_use` / `dispatch_intent` 不变;命令名 `/shape` 不变;无新增文件接口。
- **副作用**:无(纯文档内容);不改 checks.ts、不改其他 skill。

## Acceptance scenarios

- Given 用户在 shape 会话里挑细节往下钻,when shape 答完该细节,then shape 重新提出未合上的整体方向问题(对应 spec 场景 1)。
- Given clarify 刚结束,when shape 要进入出方案,then 不自动一口气串到 plan,在决策点 surface 后等用户(对应 spec 场景 2)。
- Given 方案依赖某外部工具/API,when 写进 plan 前,then shape 查权威文档核实而非凭记忆(对应 spec 场景 3)。
- Given 任意改动落地,when 跑 `pnpm test`,then 9 项结构 check 全过(happy path)。
