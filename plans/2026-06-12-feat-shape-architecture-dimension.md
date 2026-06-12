---
mode: feat
title: shape 的架构产出 — 跨 mode 的 Architecture 段,否决独立 arch mode
created: 2026-06-12
status: done
---

# shape 的架构产出 — 跨 mode 的 Architecture 段

## Building

给 shape 加「架构产出」能力,承载形态是 **plan 共享骨架的条件段**,不是第五个 mode:plan-template 新增条件必填的 `## Architecture` 段(现状结构 → 目标结构、组件职责与数据流、分阶段迁移),触发条件为变更跨模块边界 / 引入新层或新服务 / 更换技术依赖;同时修掉 mode-feat 与 mode-refactor 之间把架构决策互相外推的反模式矛盾。ROADMAP 里「shape 的 `arch` mode」一项就此关闭——以「否决 mode 读法、落地维度读法」的方式。

## Not building

- 不新增 `arch` mode、不改 Mode Picker、不加消歧规则——架构是意图的正交维度(规模/结构),不是第五种意图。
- 不新增 reference 文件——Architecture 段的规范住进 plan-template.md,一处。
- 不取 feature-dev 的逐文件 Implementation Map 粒度——与 2026-06-12 plan 粒度决策(决策级)一致,只取其维度清单(组件设计 / 数据流 / 构建序列)。
- 不给「技术选型」开新归宿——选型服务于某个 feat/refactor 时收敛进该 mode;纯决策无实施的走 default mode 结论 + 既有的 `Key decisions → docs → ARCHITECTURE.md` 通道,不新增行为。
- 不动 mode-fix / mode-perf——核查(grep)显示二者无架构相关表述,perf 的架构手段(如加缓存层)由模板层触发条件覆盖,无需逐 mode 改。

## Approach

问题面实证(本仓三次架构级变更:记忆支柱重构、core loop 收窄、rules symlink 化)表明缺口是**路由矛盾 + 字段标准化缺失,不是能力缺失**——三案都有合法 mode 归宿(feat、feat、refactor),但架构字段(目标结构、分阶段迁移)每次即兴。曾考虑独立 `arch` mode(方案 A),被否:四个现有 mode 是互斥的意图类型,而架构与它们全部相交;refactor-vs-perf 消歧问的是「目标不同」,arch-vs-refactor 只能问「规模大小」——切分轴不同构。故选跨 mode 的模板段(原方案 B):一处定义、所有 named mode 共用、触发条件与 mode 无关。

最小替代:只修两处反模式措辞、不加模板段——能解矛盾但架构字段继续即兴,放弃。

## Premise collapse

本方案假设**架构工作总能归宿到现有四 mode 之一**(架构是维度,非意图)。若未来出现既非新能力、又不保行为、纯以结构变更为目的而四 mode 都接不住的意图,Architecture 段救不了路由。对冲:触发条件挂在模板层、与 mode 无关——即便那天真的加 mode,本段照用不废;且 ARCHITECTURE 决策记录写明否决理由,重开有据。

## Key decisions

1. **架构 = 正交维度,不是第五意图** — 大型 feat 需要架构、结构性 refactor 就是架构调整、perf 可经架构;与互斥的意图轴不同构。ROADMAP 的「arch mode」读法被否决而非实现。
2. **承载在 plan-template 共享骨架,不在各 mode reference** — 触发条件(跨模块边界 / 新层新服务 / 换技术依赖)按变更性质判断,与 mode 无关;放模板一处定义,避免四份 mode 文件重复漂移。
3. **触发即必填、未触发写 None** — 与 Public surface changes / Spec delta 的「If none → None」惯例一致;硬凑不适用的段是另一种发明。
4. **踢皮球的根因是反模式措辞,不是缺 mode** — mode-feat 把架构决策推给 refactor、mode-refactor 把改行为的推回 feat;改为「本变更自身的架构决策显式进 Architecture 段」,同时保留「无关顺手重构仍拆分」的原有告诫(两者是不同的事)。
5. **feature-dev 只取维度清单不取粒度** — 其 blueprint 的逐文件 Implementation Map 恰是 06-12 粒度决策从 plan 收走的内容;取组件设计 / 数据流 / 构建序列三维度作为段内容参考。
6. **SKILL.md Phase 4 的「>3 组件画 ASCII 图」并入新段规则** — 它本是「产出架构」的薄版本,孤立存在;升级为 Architecture 段内的画图阈值,自检条目改为指向该段。

## Architecture

None — 触发条件未命中:纯 prose/模板内容变更,不跨模块边界、不引入新层或新服务、不更换技术依赖。

## Public surface changes

shape 产出的 plan 文件骨架新增条件段 `## Architecture`(触发时必填、未触发写 None)。无新命令、无新文件、无 CLI/config 变化。

## Spec delta

```markdown
## ADDED Requirements

### Requirement: 跨结构变更产出 Architecture 段

named mode 的 plan 在变更跨模块边界、引入新层或新服务、或更换技术依赖时,必须含 `## Architecture` 段:现状结构 → 目标结构(超过 3 个组件交换数据时附 ASCII 图)、组件职责与数据流、分阶段迁移(每阶段可独立 ship);未触发时该段写 None,不硬凑。本变更自身的架构决策必须显式出现在该段,不得埋进实施步骤、也不得以「拆去别的 mode」为由外推;无关的顺手重构仍按原反模式拆分。
Verify: manual(integration)
```

## Implementation steps

1. plan-template 骨架加 `## Architecture` 条件段
   - outcome: 模板含三条触发条件(跨模块边界 / 新层新服务 / 换技术依赖)、段内容规范(现状→目标结构、组件职责与数据流、分阶段迁移、>3 组件交换数据附 ASCII 图)、None 规则,并说明分阶段迁移与 Implementation steps「每阶段可独立 ship」red flag 的衔接
   - scope: skills/shape/references/plan-template.md
   - verify: 骨架中段落存在、三触发条件齐全;`pnpm test` 绿

2. SKILL.md Phase 4 自检条目升级
   - outcome: 原「more than 3 components exchange data → draw an ASCII diagram」独立条目不再存在,替换为「命中架构触发条件 → `## Architecture` 段已填(画图阈值见模板)」
   - scope: skills/shape/SKILL.md
   - verify: `grep "more than 3 components" skills/shape/SKILL.md` 无孤立旧行,新条目指向 Architecture 段;`pnpm test` 绿

3. mode-feat 反模式改写
   - outcome: 「Burying an architecture decision … split it out into refactor mode」改为:本 feature 自身的架构决策进 `## Architecture` 段;「顺手重构无关代码要拆分」的告诫保留为独立反模式
   - scope: skills/shape/references/mode-feat.md
   - verify: 文中不再出现把架构决策外推给 refactor mode 的指引;无关重构拆分告诫仍在

4. mode-refactor 补结构性重构指引
   - outcome: 结构性重构(模块重组 / 引入层)命中模板触发条件时填 `## Architecture` 段的指引存在;Behavior invariants / Regression coverage 两字段及「行为不变」核心不动
   - scope: skills/shape/references/mode-refactor.md
   - verify: 文内出现对 Architecture 段的指引;原有两个 required 字段无改动

5. spec delta 合并进 shape spec
   - outcome: specs/shape/spec.md 含上述 ADDED requirement
   - scope: specs/shape/spec.md
   - verify: `pnpm test` 绿(含 checkSpecPairing)

6. ROADMAP 关闭已决项 + ARCHITECTURE 记决策
   - outcome: ROADMAP 不再含「shape 的 `arch` mode / 产出架构」条目;ARCHITECTURE「关键设计决策记录」新增 2026-06-12 条目(架构=正交维度、否决 arch mode 的理由、指向本 plan)
   - scope: ROADMAP.md, ARCHITECTURE.md
   - verify: `grep -i "arch" ROADMAP.md` 无该条目残留;ARCHITECTURE 新决策段存在;`pnpm test` 绿

## Verification

- command: `pnpm test`(单元测试 + 整库 smoke:markdown links / SKILL.md 结构 / RESOLVER 一致性 / skill↔spec 配对)
- checklist (manual):
  - [ ] 用一个跨模块的假想 feat 走一遍模板:Architecture 段触发、三块内容可填、未触发场景写 None 顺畅
  - [ ] mode-feat 与 mode-refactor 对架构决策的指引不再互推
  - [ ] ROADMAP 无 arch mode 残留,ARCHITECTURE 决策记录可追溯到本 plan

## Rollback

全部为文档/模板内容变更,无状态、无迁移:`git revert` 对应 commit 即完全回退。ROADMAP 条目可从 git 历史原样恢复。

## Risks & Unknowns

- **段被当成例行公事硬凑**:触发条件写得不够 crisp 时,agent 可能给单模块小改也填一段空话。缓解:None 规则 + 「硬凑即发明」写进模板指引(与 explore 的 N/A 纪律同源)。
- **Unknown**: 无 — owner: N/A, blocker: no

## Interface boundary

- **Public API**: 无新命令、无新函数。变更面 = shape 产出的 plan 文件骨架(新增条件段)+ 三份 skill 文档措辞。
- **Inputs**: 不变(用户的自然语言意图)。
- **Outputs**: named mode 的 plan 在命中触发条件时多含 `## Architecture` 段;未命中时该段为 None。
- **Side effects**: 无运行时副作用;纯文档/模板。
- **Not exposed**: arch mode 命令、消歧规则、独立架构 reference 文件、feature-dev 式逐文件 blueprint。

## Acceptance scenarios

- Given 一个跨模块边界的 feat 在 shape 收敛, when 写 plan, then plan 含 `## Architecture` 段:现状→目标结构、组件职责与数据流、分阶段迁移,组件 >3 时附 ASCII 图。
- Given 一个单模块小 feat, when 写 plan, then `## Architecture` 为 None,不硬凑。
- Given 一个模块重组型 refactor, when 写 plan, then refactor plan 同样携带 `## Architecture` 段,且 Behavior invariants 照旧。
- Given 用户在 default mode 讨论技术选型且无实施意图, when 讨论收尾, then 不写 plan 文件,结论留对话,决策经既有通道待 docs 进 ARCHITECTURE。
- Given 阅读 mode-feat, when 查架构相关反模式, then 看到「架构决策进 Architecture 段」,且「无关顺手重构拆分」仍在;不再出现「架构决策拆去 refactor mode」。
- Given 阅读 ROADMAP, when 查 shape 相关项, then 「`arch` mode」条目已关闭,ARCHITECTURE 可查到否决记录。
