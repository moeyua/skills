---
mode: feat
title: Scoped Deep-dive 升级为 7 维度统一体系(5 核心 + 2 扩展)
created: 2026-06-11
status: done
---

# Feat: Scoped Deep-dive 升级为 7 维度统一体系

> 本 plan 是同名被放弃分支(原 commit 0da0a67,9 维度平铺方案)的重做。意图沿用,实现重来——旧方案的维度是平铺清单、无逻辑层次,默认覆盖按列表顺序切「前 5-6 个」;本方案按「理解一个模块要回答的问题」重组。

## Building

把 explore 的 Scoped Deep-dive Phase 从 4 条简单条目升级为一套统一的 7 维度体系:5 个核心维度(默认覆盖)+ 2 个扩展维度(用户有明确深度信号时覆盖)。维度定义只有一套;深度由用户自然语言信号决定,不引入 flag。SKILL.md、报告模板、specs/explore/spec.md 同步更新,ROADMAP 对应条目当场删除。

## Not building

- 不加 `--deep` / `--quick` 等命令行 flag(用户明确约束)
- 不分默认版/深度版两套维度定义(用户明确约束:统一一套)
- 不改 Overview Phase——它已工作良好,本次只动 Scoped Deep-dive
- 不做文档↔代码漂移检测(doctor 的职责,explore 只记录疑点)
- 不改 explore 的只读边界、来源标注、不猜原则——它们原样适用于新维度

## Approach

按「理解一个模块要回答的问题」组织 7 个维度,而不是平铺 9 项:

**核心维度(默认覆盖)**:

1. **职责与边界** — 模块管什么、明确不管什么(What / What not)
2. **接口与用法** — 入口点、公开 API、配置面(config / env / flags),带 `file:line`
3. **内部结构** — 核心逻辑路径 + 关键数据结构及流转(合并旧方案的 Logic 与 Data Structures——读代码时两者本就一起看)
4. **依赖与影响面** — 它依赖什么 + 谁依赖它(反向依赖 / blast radius——旧方案缺失,而它是下游 shape/implement 最需要的)
5. **相关文档** — 这个 scope 的文档在哪、说了什么(带 per-doc 来源标注)

**扩展维度(深度信号触发)**:

6. **质量图景** — 测试覆盖(哪些行为有测、怎么跑)+ 错误/边界处理路径
7. **历史与已知问题** — 近期 git 变更热点、TODO/FIXME、已知限制、ROADMAP 提及

切分理由:核心 5 维回答「它是什么、怎么用、怎么运作、动它会波及什么、文档说了什么」——足够下游开始 shape;扩展 2 维回答「它怎么被验证、哪里已知有坑」——只在要对模块动大手术时才值得花 token。

两个正交调节钮:

- **相关性**:不适用的维度标 N/A,不硬凑——硬填不相关维度等同于猜(写进 When to stop)
- **深度**:无信号 → 核心 5 维;明确深度语言(「深度探索 xx」「彻底搞明白 xx」等)→ 全 7 维

SKILL.md 写法遵循 PRODUCT 哲学 #1/#5:每个维度解释「为什么下游需要它」,对话式 prose,不是干列 checklist。

## Premise collapse

本 plan 假设一套固定维度清单能套各种形态的模块(UI 组件 / CLI / 基础设施配置 / 库)。兜底已内建:维度定义为「要回答的问题」而非「要填的小节」,不适用即 N/A——假设塌了也只是多标几个 N/A,方案不塌。

## Key decisions

1. **7 维度而非旧方案的 9 维度** — 合并 Logic + Data Structures(读代码时一体),新增反向依赖(下游最需要、旧方案缺失);维度按理解逻辑分层而非平铺。
2. **核心/扩展按问题层次切,不按列表顺序切** — 「默认覆盖前 N 个」依赖排序是脆弱设计;按「开始 shape 够不够用」切核心,语义自明。
3. **深度看自然语言信号,不加 flag** — 用户明确约束;对话式体验,不引入新命令语法。
4. **统一一套维度定义** — 用户明确约束;两套定义必漂移(PRODUCT 哲学 #4 的精神)。
5. **ROADMAP 条目在本次实施中当场删除** — 上次执行把这步推迟到 docs,违反「改动完成即清理」;列为实施步骤,docs 阶段无剩余工作(WORKFLOW 认可此模式)。

## Public surface changes

- `skills/explore/SKILL.md`:Scoped Deep-dive Phase 全文重写;报告模板的 Scoped Deep-dive 节同步;When to stop 增加「不硬凑维度」一条。
- `specs/explore/spec.md`:见 Spec delta。
- 无 API / CLI / config 变化——explore 是 prose skill,公开面就是 SKILL.md 本身。

## Spec delta

```markdown
## ADDED Requirements

### Requirement: Scoped Deep-dive 按 7 维度组织

用户指定探索范围时,explore 必须按统一的 7 维度体系组织深挖:职责与边界 / 接口与用法 / 内部结构 / 依赖与影响面 / 相关文档(核心),质量图景 / 历史与已知问题(扩展)。不适用的维度标 N/A,不硬凑。
Verify: manual(integration)

### Requirement: 深度由自然语言信号决定

explore 必须根据用户的自然语言判断深挖覆盖范围:无明确深度信号时覆盖 5 个核心维度;用户明确表达深度需求(如「深度探索 xx」)时覆盖全部 7 维。不提供命令行 flag。
Verify: manual(integration)

## MODIFIED Requirements

### Requirement: 产出结构化报告

explore 必须产出含 Project Identity、Structure、Docs Inventory、Where to Start 的报告;用户指定范围时,Scoped Deep-dive 节按 7 维度体系组织(核心 5 维默认,深度信号时全 7 维)。(Previously: Scoped Deep-dive 节只要求 entry points / data flows / docs / follow-up 4 条。)
Verify: manual(integration)
```

注意:落到 `specs/explore/spec.md` 时只写当下契约,**不带 ADDED/MODIFIED 标签**——delta 标签只存在于本节(上次执行的问题 #2)。

## Implementation steps

1. 重写 `skills/explore/SKILL.md` 的 Scoped Deep-dive Phase(当前 L72-79)
   - change: 4 条条目 → 7 维度体系;每个维度一段对话式说明(是什么 + 为什么下游需要);深度信号识别说明(无信号 → 核心 5 维,明确深度语言 → 全 7 维);不适用标 N/A
   - verify: 通读改后全文,对照本 plan 的 Approach 节逐维核对
2. 同步 SKILL.md 报告模板的 Scoped Deep-dive 节(当前 L114-121)
   - change: 模板小节改为 7 维度结构,标注核心/扩展与 N/A 约定
   - verify: 模板与 Phase 描述逐项一致
3. 更新 SKILL.md 的 When to stop
   - change: 增加一条——不硬凑不相关维度,硬填等同于猜,标 N/A
   - verify: 通读 When to stop 与新 Phase 无矛盾
4. 同步 `specs/explore/spec.md`
   - change: 按 Spec delta 落地(2 增 1 改),正文不带 delta 标签
   - verify: `pnpm test`(checkSpecPairing 等 smoke 必须绿)
5. 删除 `ROADMAP.md` 的「explore 局部深度探索强化」条目(当前 L9)
   - change: 删该行;若「Core Loop 强化」节因此只剩 shape 条目,节结构保持不动
   - verify: grep ROADMAP 无 "局部深度探索" 残留
6. 全量验证
   - change: 无(纯验证步)
   - verify: `pnpm test` 全绿

## Verification

- command: `pnpm test`(单元测试 + 整库 smoke:frontmatter / Outcome Contract / 触发词 Jaccard / markdown links / skill↔spec 配对)
- checklist (manual):
  - [ ] SKILL.md 的 Scoped Deep-dive Phase、报告模板、When to stop 三处一致
  - [ ] spec.md 正文无 ADDED/MODIFIED/「已添加」字样
  - [ ] ROADMAP 条目已删
  - [ ] 在 squire 自身某模块(如 skills/doctor)手跑 `/explore doctor` 看核心 5 维报告成形
  - [ ] 加「深度探索 doctor」表述重跑,确认覆盖全 7 维

## Rollback

单 commit 改动,`git revert` 即回到 4 条条目版本;spec.md 与 ROADMAP 同 commit 回滚,无外部状态。

## Risks & Unknowns

- **SKILL.md 篇幅膨胀**:7 维度逐段解释可能把 SKILL.md 推向臃肿,违背「SKILL.md 全文加载——必须精简」(ARCHITECTURE)。缓解:每维度控制在 1-2 句;若仍超重,把维度详解拆 `references/`(shape 已有先例),SKILL.md 只留清单 + 指针——实施时按实际篇幅判断,超过 ~200 行即拆。
- **深度信号误判**:「自然语言信号」无法穷举,agent 可能漏判。缓解:SKILL.md 给 2-3 个示例表述而非穷举清单,交给 judgment(PRODUCT 哲学 #1)。

## Interface boundary

- **Public API**:无代码 API。「接口」即 SKILL.md 对 agent 的指令面:Scoped Deep-dive Phase 的 7 维度定义、深度信号规则、N/A 约定。
- **Inputs**:用户的 scope 指定(`/explore <module>` 或自然语言点名模块)+ 可选深度语言信号。
- **Outputs**:Explore Report 的 Scoped Deep-dive 节,核心 5 维或全 7 维,各维有内容或 N/A。
- **Side effects**:无——explore 严格只读,本次不触碰该边界。
- **Not exposed**:不提供 flag 语法;不承诺维度可由用户逐个点选(全凭 agent judgment 按需调整)。

## Acceptance scenarios

1. Given 用户在不熟悉的项目里,when 说 `/explore skills/doctor`,then 报告先有完整 Overview,Scoped Deep-dive 节覆盖核心 5 维,每维有 `file:line` 证据或 N/A。
2. Given 同上,when 说「深度探索 skills/doctor」,then Scoped Deep-dive 覆盖全 7 维,含测试覆盖与 git 历史热点。
3. Given 被探索模块没有测试与配置面,when 深度探索,then 对应维度标 N/A 而非编造。
4. Given 用户只说 `/explore`(无 scope),when 运行,then 只出 Overview 报告,不出现 Scoped Deep-dive 节(现行为保持)。
