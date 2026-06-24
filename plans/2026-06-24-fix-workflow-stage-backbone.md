---
mode: fix
title: 给 WORKFLOW.md 生成补上阶段骨架与减/加访谈协议
created: 2026-06-24
status: done
---

# 给 WORKFLOW.md 生成补上阶段骨架与减/加访谈协议

## Building

修 docs 生成 WORKFLOW.md 时「不问就写、漏阶段、每个项目格式不一样」这一组缺陷。做法:把 squire 自己的 skill pipeline(explore 条件性 → shape → implement → check → docs → commit → pr)定为「流程阶段」section 的**骨架底稿**,并把访谈规定成**减法 + 加法**两问——「这几步你项目不要哪些?」「要额外加哪些(如 release)、加在哪?」。完整与有序由骨架结构性保证,docs 步在骨架里就不会再被漏掉。改动落在 `skills/docs/references/formats/workflow.md`(加骨架 + 访谈协议 + section 范围澄清),docs SKILL.md 补一句把这道访谈定为 WORKFLOW target 的写前硬门槛,并把契约写进 `specs/docs/spec.md`。

## Not building

- 不动 WORKFLOW.md 以外的任何记忆 artifact(spec / ARCHITECTURE / DESIGN / ROADMAP / README)的生成方式——本次范围由维护者锁死在 WORKFLOW.md 这一个产物。
- 不引入「通用变更生命周期」之类 squire 之外的抽象骨架——骨架就取 squire 现成的 skill 清单。
- 不自动生成「各阶段约定门禁」与「构建与命令」两段的内容——它们仍各自向维护者求源,本次只澄清边界、不替它们造内容。
- 不加机械测试去断言「docs 是否访谈了维护者」——该行为是 manual(integration),无法机械背书。

## Approach

骨架取自 squire 自己的 skill pipeline,而非发明一套通用生命周期——这有现成实证:squire 仓自己的 [WORKFLOW.md](../WORKFLOW.md) 的流程阶段写的就是「完整 core loop:`/shape` → `/implement` → `/check` → `/docs` → `/commit` → `/pr`,不熟悉的模块先 `/explore`」。这套 dogfood 做法从未沉淀进格式规范,所以换个项目 agent 就重新拍。把它写进 [workflow.md 格式规范](../skills/docs/references/formats/workflow.md),让骨架成为「逐条问的提纲、默认全在、维护者来删」,而不是「模板硬填」——既堵住漏/乱,又不踩反 invention(加阶段必须出自维护者,不凭空塞)。

最小可行版本(供对照):只在 docs SKILL.md 写一句「WORKFLOW 要先问流程再写」,不引入骨架。否决——「列全 + 有序」是结构性保证,靠话术更严拿不到,开放式访谈天然会漏会乱(「连 docs 自己都被漏掉」就是漏项活证据)。所以骨架是本方案的承重件。

## Premise collapse

本方案假设:**用 squire 的 `/docs` 生成 WORKFLOW.md 的项目,其开发流程本就以 squire skill pipeline 为主干**,所以拿 squire 的 skill 清单当骨架是贴合的。若不成立(某项目用 squire 写文档、但开发流程完全不走 squire skills),骨架会显得别扭——但减法访谈兜底:维护者可逐条删掉不用的 squire 步、加上自己的真实阶段,骨架退化为「一份默认提纲」,不会强加。即假设失败时退化优雅,不是崩塌。

## Key decisions

1. **骨架 = squire skill pipeline,不发明通用生命周期** — 现成、清晰、已 dogfood;发明通用骨架正是上一轮被否的凭空抽象。
2. **访谈是减法 + 加法,默认全选** — 完整性靠「默认全在、你来删」保证,而非「你来列、agent 收」;后者就是现在漏项的根。
3. **骨架只覆盖「流程阶段」一个 section** — 另两段(约定门禁、构建与命令)骨架填不了,仍各自求源;「每个项目不一样」的合法差异收进这两段的**内容**,结构(section 骨架 + 阶段骨架)全项目统一。这是 complaint #3 的正解:该一致的是结构,该不同的是内容。
4. **写前硬门槛落在 docs SKILL.md,详细协议落在格式规范** — SKILL.md 是 docs 先读的地方,适合放「WORKFLOW 必须先访谈再写」这条行为闸;骨架与减/加步骤的细节放格式规范(docs 写该 target 时按需加载),分工与现有「SKILL 指 target、format 给细节」一致。
5. **explore 在骨架里标条件性** — 与 squire 自己的 WORKFLOW 一致(「不熟悉的模块先 explore」),不是每次变更必跑;doctor/handoff 是正交工具、不进线性骨架,正确地不列入。

## Architecture

None — 改动限于两份既有文档(格式规范 + SKILL.md)与一份 spec,不跨模块边界、不引入新层、不换依赖。

## Public surface changes

None — 无 API / schema / config / CLI 接口变化。WORKFLOW.md 产物的 section 骨架不变(仍是流程阶段 / 约定门禁 / 构建与命令),只补「流程阶段」段的生成协议。

## Spec delta

本次改变 docs 在 WORKFLOW target 上的契约行为,记入 `specs/docs/spec.md`:

```markdown
## ADDED Requirements

### Requirement: WORKFLOW 流程阶段以 squire skill pipeline 为骨架访谈

docs 生成或更新 WORKFLOW.md 的「流程阶段」section 时,必须以 squire 的 skill pipeline 为骨架底稿(explore 条件性 → shape → implement → check → docs → commit → pr),并以减法 + 加法访谈维护者:逐条确认哪些步骤不要、要额外加哪些(如 release)及加在何处,默认全部在册由维护者删减。骨架结构性保证该 section 的完整与顺序——不得漏列既有 skill 步骤(含 docs 自身),不得凭空发明骨架外的阶段。骨架只约束「流程阶段」一段;「各阶段约定与门禁」「构建与命令」两段仍须各自向维护者求源,不得由骨架代填。未访谈即写整篇 WORKFLOW.md 属凭空发明,必须停下先访谈。
Verify: manual(integration)
```

## Implementation steps

1. 在 workflow.md 格式规范的「流程阶段」section 写入 squire skill pipeline 骨架与减/加访谈协议
   - outcome: 该 section 规范除现有「ordered steps」描述外,明确给出骨架底稿(explore 条件性 → shape → implement → check → docs → commit → pr)、规定访谈为「默认全在、问维护者删哪些 + 加哪些(如 release)及位置」、并说明骨架是「问的提纲非写的模板」以守反 invention。
   - scope: `skills/docs/references/formats/workflow.md`
   - verify: 阅读确认骨架七步齐全且有序、减/加两问俱在、反 invention 表述在场;`pnpm test` 全绿(尤其 checkMemoryCatalog 不因正文改动而 fail)。

2. 在 workflow.md 格式规范澄清骨架的 section 边界
   - outcome: 规范明确「骨架只保证『流程阶段』段的完整与顺序;约定门禁与命令两段仍各自求源,项目间差异只落在这两段内容里」。
   - scope: `skills/docs/references/formats/workflow.md`
   - verify: 阅读确认三段的来源边界清楚,不会被读成「骨架也填后两段」。

3. 在 docs SKILL.md 把 WORKFLOW 访谈定为写前硬门槛
   - outcome: docs SKILL.md 含一条简短规则:目标是 WORKFLOW 时,必须先按格式规范的骨架做减/加访谈再写,不得凭空落整篇;指回格式规范取细节。表述为行为约束(docs 先问再写),不堆 MUST。
   - scope: `skills/docs/SKILL.md`
   - verify: 阅读确认该规则在场且与既有 prose 风格一致;`pnpm test` 全绿。

4. 把契约 delta 合入 docs spec
   - outcome: `specs/docs/spec.md` 含上文 Spec delta 的 ADDED requirement,`Verify: manual(integration)`。
   - scope: `specs/docs/spec.md`
   - verify: `pnpm test` 全绿(checkSpecPairing 等结构 invariant 通过)。

> 注:步骤 4 的 spec 合入按本仓门禁(spec 与 skill 同 PR 同步)与 WORKFLOW 的 dogfood 链,实际由 `/docs` 在 implement + check 之后承接;此处列出是为让方案完整、范围可见。

## Verification

- command: `pnpm test`
- checklist (manual):
  - [ ] 拿一个干净项目跑 `/docs` 生成 WORKFLOW.md:agent 先以骨架做减/加访谈,而非直接落整篇。
  - [ ] 产出的「流程阶段」含 docs 步、顺序与骨架一致、无漏项。
  - [ ] 「约定门禁」「命令」两段的内容仍来自对维护者的提问,未被骨架代填。
  - [ ] 同一骨架在两个不同项目上产出的 WORKFLOW.md 结构一致,差异只在后两段内容。

## Rollback

改动是三份文档的文本编辑,无外部状态变更。回滚 = `git revert` 对应提交即恢复原 workflow.md / SKILL.md / spec.md;无数据迁移、无副作用。

## Risks & Unknowns

- **骨架被读成「模板硬填」而非「问的提纲」**:impact——agent 跳过访谈、直接把七步全写进去,等于把「漏项」换成「强加」。mitigation——格式规范用「默认全在、维护者删」的措辞,并显式写「问的提纲,不是写的模板」;步骤 1 的 verify 专门核这条表述在场。
- **非 squire 流程项目的贴合度**:见 Premise collapse——减法访谈兜底,骨架退化为默认提纲,不强加。blocker: no。

## Root cause

> 根因是 [workflow.md 格式规范](../skills/docs/references/formats/workflow.md) 的「流程阶段」section 规范(L7 只给「ordered steps」一句、Source 在 L13-16 只说「记维护者所说或停下发问」)**既无 squire skill 骨架、也无减/加访谈协议**,使 docs 在按其通用流程(知道 target + 有源 → 写)生成 WORKFLOW 时只能即兴拍——这一条同时解释三个症状:没真访谈就写整篇(无协议)、漏掉 docs 等阶段(无骨架保完整)、每个项目结构飘(无骨架保一致与顺序)。

三个 observed 症状全部由这一句覆盖,非症状级猜测。

## Regression tests

squire 的机械测试只覆盖结构 invariant(frontmatter / 链接 / catalog↔format 锁步 / RESOLVER / spec 配对),无法断言「docs 是否访谈维护者」——该行为标 manual(integration)。故回归以**手动复现**承载:

- 复现(改前):在一个未写过 WORKFLOW.md 的干净项目跑 `/docs` 生成 WORKFLOW.md → 观察到 agent 不做减/加访谈直接落整篇、流程阶段漏 docs、顺序无规律。
- 期望(改后):同一步骤 → agent 先按骨架做减/加访谈;产出的流程阶段七步齐全(含 docs)、顺序同骨架;约定门禁/命令两段内容来自对维护者的提问。
- 机械护栏(改前后均须绿):`pnpm test`——确认编辑 workflow.md 正文未破坏 checkMemoryCatalog,合入 spec delta 后 checkSpecPairing 等仍通过。
- 契约回归:`specs/docs/spec.md` 新增的 ADDED requirement(`Verify: manual(integration)`)记录改后契约,后续靠实跑 `/docs` 验。
