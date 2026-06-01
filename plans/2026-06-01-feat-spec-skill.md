---
mode: feat
title: 新增 spec skill —— 持久规格真源的产出与维护
created: 2026-06-01
status: done
---

# 新增 spec skill —— 持久规格真源的产出与维护

## Building

给 squire 加第 8 个 skill `spec`:维护一个持久的 `specs/` 真源层,记录"系统当前该是什么"(行为契约)。它在一次变更**落地之后**(build/test/review 之后)介入,把 shape 写在 plan 里的 **spec delta**(ADDED / MODIFIED / REMOVED requirements)合并进 `specs/<domain>/spec.md`;也支持随时直接纠正已有 spec。格式与产物模型借鉴 [OpenSpec](https://github.com/Fission-AI/OpenSpec)(实证自其 `docs/concepts.md` 与真实 spec 文件),但**只取产物模型 + 格式 + progressive rigor,不引入它那套 propose/apply/archive 命令**——那些已被 squire 的 shape/build/commit 覆盖。

因为这个能力正面落在 PRODUCT.md 边界 #2(文档管理),plan 的第一步是**按 PRODUCT.md 自己规定的流程修订边界**(shape discussion → 改 PRODUCT.md),把"spec 真源管理"从"文档管理"里外科式切出,同时保留"对外文档(README / 接口文档 / changelog)仍不做"。

## Not building

- **自动漂移检测 / 批量同步**:"代码变了自动找出 spec 哪里过期"需要漂移检测,那是规划中的 v2 `health` skill 的内核。spec 只做"接到信号后写",不自己拥有检测。v1 的"更新"只含**人主动发起的纠正**。
- **OpenSpec 的命令机器**:不引入 `/propose` `/apply` `/archive` `/verify` 等——与 shape/build/commit 重叠,违背克制。
- **对外文档管理**:README / 接口文档 / changelog / release notes 仍在边界 #2 / #3 外,spec 不碰。
- **写满 squire 自己 8 个 skill 的 specs/**:那是"使用"这个 skill,属后续工作;本 plan 只产出**一份种子 spec** 作格式锚点。
- **机械化 spec 文件校验**(specs/\*/spec.md 的结构 lint):等 specs/ 有真实内容后再做,列入 Risks 的 v2。
- **shape 接管 plan 产出 / shape 退成只澄清**:plan 与 spec 共存,各管一段生命周期,不动 shape 现有职责。

## Approach

**分两段,第一段(改 PRODUCT.md)可独立交付且必须先行**——这是 PRODUCT.md 规定的顺序,不是可选。第二段才是 skill 本体。

squire 的 skill 是 prose 指令、不是可执行代码,所以"把 delta 按 requirement 名合并进 specs/"是 **agent 照 SKILL.md 规则执行**的机械动作,**不新增任何 TypeScript 运行时代码**。新 skill 自动被 `tests/smoke/verify-skills.test.ts` 的 8 个 check 覆盖(它遍历所有 `skills/*/SKILL.md`),无需改 `scripts/checks.ts`。

产物模型映射(确认 scope 不膨胀):

| OpenSpec                      | squire                               | 动作             |
| ----------------------------- | ------------------------------------ | ---------------- |
| proposal + design + tasks     | shape 的 `plans/<slug>.md`(本就合一) | 已有             |
| change 的 `specs/` delta      | plan 新增 `## Spec delta` 段         | plan-template 加 |
| 持久 `specs/<domain>/spec.md` | 新建 `specs/` 真源层                 | spec skill 维护  |
| `/opsx:archive` 合并 delta    | spec skill 的合并步骤(agent 执行)    | 新 skill 核心    |

**最小可行版**(衡量"几乎不做"的下界):只新增 `skills/spec/SKILL.md` + RESOLVER 一行,定义格式与合并规则,不碰 plan-template、不写种子 spec。否决理由:没有 plan 里的 delta 入口,合并步骤就得让 agent 逆向推导代码,可靠性差,违背"契约在前"。所以选完整版(含 plan-template delta 段 + 一份种子 spec)。

## Premise collapse

**这个方案赌的是"domain/capability 粒度切得准"。** 切太细 → spec 比代码还多、迅速腐烂成没人维护的第二份文档(比没有更糟);切太粗 → 一份 spec 啥都装、等于没契约。

不押注这个假设的设计:采用 OpenSpec 的 **Progressive Rigor**——SKILL.md 把"默认 Lite spec(behavior-first 短 requirement + scope/non-goals + 几条验收)、只有高风险(API/契约变更、迁移、安全、跨模块)才 Full"写成**显式约束**,并给出"何时根本不该建 spec"的判据(实现可变而对外行为不变 → 不进 spec)。把粒度决策交给规则兜底,而不是现场拿捏。

## Key decisions

1. **spec 用 RFC 2119(SHALL/MUST/SHOULD)+ Requirement + Scenario(GIVEN/WHEN/THEN)格式** —— 与 philosophy #5(SKILL.md 不堆 MUST)不冲突:#5 管的是"给 agent 的指令",spec 是"给目标系统的行为契约",是另一种文体,RFC 2119 正是其可验证性的来源。OpenSpec 实证此格式与 agent 配合良好。
2. **格式关键词锁英文,prose 内容跟目标项目语言走** —— Requirement / Scenario / GIVEN / WHEN / THEN / SHALL 是结构;具体行为描述跟被开发项目走(spec 是给别的项目用的产物,锁死英文不合理)。squire 自己 dogfood 时写英文。
3. **spec 位于闭环尾端(build/test/review 之后,commit 前后)** —— 它记录"已验证、已落地"的事实。RESOLVER 新增一个 stage 安放它。
4. **delta 三段 ADDED / MODIFIED / REMOVED,按 requirement 名合并** —— ADDED 追加、MODIFIED 替换、REMOVED 删除;合并机械可预测。
5. **不新增 TS 代码、不新增 check 函数** —— 合并由 agent 执行;新 skill 自动进 smoke 的 8 项检查。
6. **PRODUCT.md 边界 #2 做外科切割,不推翻哲学 #2** —— 论证"持久 spec 是闭环绕之运转的设计真源,属闭环内",对外文档仍排除。改动面尽量小、好辩护。

## Public surface changes

- **新目录** `specs/`:持久规格真源(`specs/<domain>/spec.md`)。
- **新 skill 命令** `/spec`(目录名即命令名)。
- **plan 文件新增可选段** `## Spec delta`(plan-template 契约变化)。
- **文档计数变化**:README / ARCHITECTURE 的"7 个 skill"→ 8;工作流图、目录树、v2 规划相应更新。
- 无 API / config / 既有 CLI 破坏性变化。

## Interface boundary

**`spec` skill 暴露**:

- **触发**:`/spec`,或自然语言("记录规格" / "更新 spec" / "record the behavior")。
- **输入**:
  - 记录模式:一个刚 build 完的 plan(读其 `## Spec delta` 段)+ 实际代码作核对。
  - 纠正模式:用户直接指出某 `specs/<domain>/spec.md` 的某 requirement 要改。
- **输出 / side effects**:**只写 `specs/<domain>/spec.md`**(新建或按 ADDED/MODIFIED/REMOVED 合并);不改源码、不改 plan、不动 README/ARCHITECTURE。
- **spec 文件结构**(固定):`# <Domain> Specification` → `## Purpose` → `## Requirements`(`### Requirement: <名>` + `#### Scenario: <名>` GIVEN/WHEN/THEN)。
- **delta 结构**(plan 内,固定):`## ADDED Requirements` / `## MODIFIED Requirements`(带 `(Previously: ...)`)/ `## REMOVED Requirements`。

**不暴露**(明确不通过外部接口表达):

- 漂移检测(health 的事);实现细节 / 库选型 / 步骤(那些在 plan / 代码里);对外文档生成。

**spec skill frontmatter(build 直接采用,无需再决策)**:

```yaml
name: spec
description: "Maintain the persistent specs/ source of truth — record a built change's spec delta into the persistent specification, and correct existing specs on demand. Use when a feature has landed and its behavior contract should be recorded, or when an existing spec has drifted and needs correcting. Not for one-off change plans (use shape), implementation (use build), or project-wide drift detection (a future health skill)."
when_to_use: "spec, specification, behavior contract, source of truth, record behavior, record spec, update spec, 规格, 规格说明, 行为契约, 真源, 记录规格, 更新规格"
dispatch_intent: "Record and maintain the persistent specs/ source of truth from change deltas"
```

(已核对:`when_to_use` 各逗号项与现有 7 个 skill 无重复 → Jaccard = 0,远低于 0.5 阈值。)

## Acceptance scenarios

1. **happy / 合并到已有 domain**:Given `specs/auth/spec.md` 已存在、且一个 plan 含 `## ADDED Requirements` 一条新 requirement,When 调 `/spec` 指向该 plan,Then 新 requirement 被**追加**进 `specs/auth/spec.md` 的 `## Requirements`,格式合规,其余 requirement 不动。
2. **新建 domain**:Given `specs/` 无 `payments/`,When plan 的 delta 针对 `payments`,Then 创建 `specs/payments/spec.md`,含 `## Purpose` + 该 requirement。
3. **MODIFIED 合并**:Given 某 requirement 已存在,When delta 的 `## MODIFIED Requirements` 同名条目,Then **替换**原条目(含其 scenarios),并保留 `(Previously: ...)` 痕迹。
4. **REMOVED 合并**:Given 某 requirement 存在,When delta 的 `## REMOVED Requirements` 同名,Then 从持久 spec **删除**该 requirement。
5. **主动纠正(无 delta)**:Given 用户说"specs/auth 的 Session Expiration 应是 15 分钟",When 调 `/spec`,Then 直接编辑该 requirement,不需要任何漂移检测、不依赖 plan。
6. **error / delta 缺失**:Given plan 无 `## Spec delta` 段,When 调记录模式,Then spec **停下并说明**"该 plan 没有 spec delta,请确认要为哪个 domain 记录什么",不擅自逆向代码猜测。
7. **error / MODIFIED 目标不存在**:Given delta `## MODIFIED` 一个 `specs/` 里不存在的 requirement,When 合并,Then 报"目标 requirement 不存在,应放入 ADDED 还是确有同名?",不静默新建。
8. **edge / progressive rigor**:Given 一个低风险小改动,When 产出 spec,Then 默认 **Lite**(短 requirement + non-goals + 少量验收),不强制 Full。
9. **机械一致**:When 任意步骤后跑 `pnpm test`,Then 8 个 check 全绿(新 skill 的 frontmatter / description / Outcome Contract / references / links / Jaccard / RESOLVER 一致性全过)。

## Implementation steps

> 交付单位:**第 1 步**单独一个 commit(PRODUCT.md 边界修订,先行);**第 2-7 步合为一个 commit**(skill 本体)——因为加了 `skills/spec/SKILL.md`(步 3)后,`checkResolverConsistency` 在 RESOLVER 更新(步 4)前必红,二者必须同 commit 落地。每步的 verify 标注的是"该步完成后**这一项**为真",整库 `pnpm test` 全绿以第 7 步为准。

1. **修订 PRODUCT.md(先行,可独立交付)**
   - change:`PRODUCT.md` 边界 #2 —— 从"不做文档管理"改为"不做**对外文档**(README / 接口文档 / changelog);但做**闭环内的 spec 真源管理**",补一句 why(spec 是闭环绕之运转的设计真源,属闭环内);相应松动哲学 #2"只做代码开发"的措辞,纳入 spec 真源。在改动处显式 acknowledge 这是对原边界的有意修订。
   - verify:`pnpm test`(markdown links / 结构 smoke 全绿);人读边界 #2 现在允许 spec、且对外文档仍排除。
2. **创建 spec skill 的 references symlink**
   - change:`skills/spec/references/anti-patterns.md` → `../../../rules/anti-patterns.md`;`skills/spec/references/durable-context.md` → `../../../rules/durable-context.md`(与其余 skill 一致)。
   - verify:`ls -la skills/spec/references/` 两个 symlink 解析到 rules/。
3. **写 `skills/spec/SKILL.md`**
   - change:用 Key decision 里的 frontmatter;主体含 Outcome Contract 四字段、统一的两条 rule 指针段(同其他 SKILL.md 顶部)、spec 与 delta 的格式定义、ADDED/MODIFIED/REMOVED 合并规则、Progressive Rigor(默认 Lite / 高风险 Full / 何时不建 spec)、与 shape(plan vs spec)和 health(检测 vs 写)的边界、记录模式与纠正模式两条流程、When to stop(无 delta 不逆向猜、MODIFIED 目标缺失不静默新建)。
   - verify:该步针对 SKILL.md 自身的 check 过(name=dir / description 规范 / Outcome Contract / references / links);整库 `pnpm test` 此时 **checkResolverConsistency 仍红**(spec 未进 RESOLVER),由步 4 转绿——故步 3、4 同 commit。
4. **更新 `skills/RESOLVER.md`**
   - change:新增一个尾端 stage(如 `### 4.5 Record` 或 `### 6. Spec`),加一行把 spec 的 trigger 映射到 `skills/spec/SKILL.md`;Chaining 段的 base loop 顺带提及 spec 的位置。
   - verify:`pnpm test` —— checkResolverConsistency(RESOLVER 恰好列出含 spec 在内的全部 skill)绿。
5. **plan-template 加 `## Spec delta` 段**
   - change:`skills/shape/references/plan-template.md` 的 File structure 加可选 `## Spec delta`(ADDED/MODIFIED/REMOVED 骨架 + 一句"无规格影响则写 None");`skills/shape/references/mode-feat.md`(及 fix/refactor)补一句"若改动改变对外行为,在 plan 写 Spec delta 供 spec 合并"。
   - verify:`pnpm test`(links 解析);plan-template 现含 delta 段。
6. **写一份种子 spec 作格式锚点**
   - change:`specs/spec/spec.md` —— 用 spec 自己的格式,描述 `spec` skill 这个能力(Purpose + 若干 Requirement + Scenario,取本 plan 的 Acceptance scenarios 改写)。这同时是 dogfood 与"格式范本"。
   - verify:人读符合 `# … Specification` / `## Purpose` / `## Requirements` / `### Requirement:` / `#### Scenario:` 结构;`pnpm test` 仍绿(specs/ 不影响现有 check)。
7. **更新 README.md 与 ARCHITECTURE.md**
   - change:README 的 skill 表 7→8、加 spec 行、工作流图加 spec;ARCHITECTURE 目录树加 `skills/spec/` 与 `specs/`、"7 个 skill"计数、数据流/典型工作流、v2 规划里 `document`/`health` 与 spec 的关系说明(spec 已落地,health 仍 v2)。
   - verify:`pnpm test`(links / Jaccard / RESOLVER 一致性全绿);人读 README 工作流含 spec。

## Verification

- command:`pnpm test`(= `vp test run`)—— 单元测试 + 整库 smoke 8 项 check 全绿,尤其 checkTriggerJaccard(spec vs 其余 7)与 checkResolverConsistency。
- checklist(manual):
  - [ ] `/spec` 在记录模式下能把示例 plan 的 delta 正确合并进 `specs/<domain>/spec.md`(happy + 新建 domain + MODIFIED + REMOVED 四场景)
  - [ ] 纠正模式无需 delta、无需漂移检测即可改已有 requirement
  - [ ] 无 delta / MODIFIED 目标缺失时 spec 停下发问,不擅自猜
  - [ ] PRODUCT.md 边界 #2 修订后:允许 spec 真源、仍排除对外文档
  - [ ] README/ARCHITECTURE 的 skill 计数与工作流含 spec,无残留"7 个"

## Rollback

每步都是新增文件或文档编辑,git 可逆:

- 删 `skills/spec/`、`specs/`,还原 `RESOLVER.md` / `plan-template.md` / `mode-feat.md` / `README.md` / `ARCHITECTURE.md` / `PRODUCT.md` 即可完全回退,无运行时代码、无数据迁移。
- 因不新增 TS 代码,不存在依赖或 build 产物需要清理。

## Risks & Unknowns

- **spec rot / 粒度失准**(见 Premise collapse):靠 Progressive Rigor + "何时不建 spec" 判据兜底;真实项目里若仍腐烂,退路是把 spec 降级为"仅高风险变更才写"。
- **plan 与 spec 在一次 feat 里都出现,认知负担**:接受"两份文档、各管一段生命周期(plan=临时怎么改 / spec=持久是什么)";若实测发现 spec 只是"持久化的 plan",更合理的是回退成扩 shape 而非独立 skill。
- **机械化 spec 文件校验缺位**:v1 不 lint `specs/*/spec.md` 结构;**v2**:在 `scripts/checks.ts` 加 spec-format check(Purpose/Requirements/Scenario 结构、RFC 2119 关键词),纳入 smoke。
- **自动漂移同步缺位**:依赖未来 `health` 提供"哪份 spec 漂了"的信号;在那之前"更新"只靠人主动发起。**owner**:health skill(v2),**blocker**:否(v1 不需要)。
- **Unknown**:RESOLVER 里 spec 这个 stage 叫什么、放第几位(4.5 还是并入 Land)—— owner:build 时按 RESOLVER 现有编号习惯定,**blocker**:否(不影响 check)。

## 实施修订(build / review 后)

记录与上文决策的偏离,以本节为准:

- **RESOLVER stage**:定为 stage 5 "Record",Land/Push 顺延为 6(上文 Unknown 已解)。
- **语言规则**(推翻 Key decision #2 的"格式关键词锁英文"):结构标签(`Requirement:` / `Scenario:` / GIVEN-WHEN-THEN / ADDED-MODIFIED-REMOVED)留英文作锚点;**句子与 RFC 2119 语气词跟项目语言**(必须/应当/可以),不把 SHALL 焊进中文句。squire 自身 specs 用中文句 + 英文标签——seed spec [specs/spec/spec.md](../specs/spec/spec.md) 即按此重写。
