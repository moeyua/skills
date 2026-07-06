---
mode: feat
title: converge skill——把项目的 memory catalog 文档收敛到最新规范
created: 2026-07-03
status: approved
---

# converge skill:目录文档逐份收敛器

## Building

新增 `converge` skill:对 memory catalog 里的每份文档逐一判定状态(缺失 / 非规范格式 / 半成品 / 旧版格式 / 内容漂移 / 已达标),按状态选动作(访谈新建 / 保留内容重排 / 补缺 / 结构对齐 / 修漂移 / 跳过)。不做项目级「有/无」二分:空项目跑一遍即初始化,squire 升级后跑一遍即对齐,写了一半的项目跑一遍即补全;幂等,紧接复跑应全部跳过。

## Not building

- 不装 host 侧任何东西:skills 安装、pre-commit / CI 等机械门禁、CLAUDE.md / AGENTS.md 入口文件都不管(用户裁决:只有文档目录)
- 不碰 catalog 之外的文档(catalog 外文档仍走 docs 的 explicit-document lane)
- 不取代 doctor(全科体检、依赖/CI/尺寸检查)与 docs(单目标修正);零散发现仍走 doctor → 用户 → /docs 老路
- 不带 scope 参数——MVP 只有全量一遍;按文档名过滤留给有真实需求后再加
- 不复制格式规范进自身 references(会制造第二份漂移源)

## Approach

**选定:一个 skill、逐份收敛模型**——不区分 init / update 两个 lane,统一为「逐份状态判定 + 按状态动作」;格式权威来源直接读同装 docs skill 的 `references/formats/*`,机械扫描复用 doctor 的 `scripts/checker.ts`(读同伴随装资产是资产复用,不是 skill 串联,不违反哲学 #3)。理由:两个场景共享同一批格式规范与扫描逻辑;「项目有没有用过 squire」在真实项目里不是二值(README 写了一半算什么?),逐份判定天然覆盖所有中间态。

替代 1:拆成 init / align 两个 skill——路由触发词更直白,但两份 SKILL.md + 两份 spec 共享 80% 逻辑,且「上车」和「升级对齐」在用户口中常是同一句话,拆开反而更难路由。
替代 2:扩展 docs 加 batch lane——省一个 skill 的配对成本,但 docs 契约是「单目标、被动、依 awareness 行动」,塞进访谈式初始化与全库批量重写会撑破它,也搅乱 doctor→docs 的检测/写作分离。

## Premise collapse

本方案假设「格式规范(docs formats)+ 机械 checker 足以判定文档状态」。若 formats 写得太松、状态判定退化成模型拍脑袋,收敛就会变成一轮大重写。缓解:状态判定优先机械信号(checker conformance 输出、文件存在性、节标题匹配),模型判定只兜「内容漂移」一档,且该档必走逐份确认,不给静默重写留通道。

## Key decisions

1. 命名 `converge` — Chef 配置管理的收敛语义与模型逐字吻合(期望态 = 格式规范,实际态 = 项目文档,幂等);不撞 Claude Code 内置 `/init`;路由由 when_to_use 触发词兜底(初始化/对齐/补文档)。
2. 逐份收敛器,无模式探测 — 项目级有/无二分不成立;状态表见 Building。用户对「写了一半的 README 算不算」的追问直接击落了双 lane 设计。
3. 反发明豁免收窄为「初次创作豁免」 — 维护者访谈是 PRODUCT / specs 从无到有的唯一权威来源,代码只印证陈述、不反推;文档一旦存在,修改权回归 shape(PRODUCT)与 docs(specs delta)。converge 不成为第二常驻写手。
4. 三方边界按批量分工 — 成批收敛归 converge,doctor 保持 read-only 全科体检、docs 保持单目标修正,两者职责不裁减;各加一句边界(spec delta)。
5. 分级确认 — 动内容(重排用户所写、修内容漂移、访谈补缺)逐份先给「改什么 + 为什么」再写;纯格式对齐批量执行 + 事后总览,git 单 commit 兜底回滚。
6. 同级资产引用、缺失即停 — 按 `${CLAUDE_SKILL_DIR}/../docs/references/formats/`、`../doctor/scripts/checker.ts` 读;缺就停下报「需与 docs / doctor 同装」,不降级不编造格式。
7. 已有用户内容永远是权威来源 — 只重排、只补缺,不推倒重写;内容与代码矛盾时列出矛盾交用户裁决,不擅自选边。

## Architecture

现状 9 个平级 skill;新增 converge 后 10 个,无新层。converge 运行时读两个同伴的随装资产:

- docs `references/formats/*` → 每份 catalog 文档的期望结构(唯一格式权威)
- doctor `scripts/checker.ts` → 机械 conformance 扫描(唯一确定性信号源)

数据流:checker 输出 + 文件存在性 + 节标题匹配 → 逐份状态 → 动作(访谈/重排/补缺/对齐/修漂移/跳过) → 分级确认 → 写文件 → 收敛报告。不新增共享库、不改 docs / doctor 的任何代码,只各改一句边界文本。

## Public surface changes

- 新增 `skills/converge/SKILL.md`(含 frontmatter:name / description / when_to_use / dispatch_intent)
- `skills/RESOLVER.md` 增 converge 路由条目
- 新增 `specs/converge/spec.md`(checkSpecPairing 强制配对)
- `skills/docs/SKILL.md`、`skills/doctor/SKILL.md` 各加一句边界(批量收敛归 converge;PRODUCT 初次创作可由 converge 访谈产出)

## Spec delta

```markdown
## ADDED Requirements(specs/converge/spec.md,新域)

### Requirement: 逐份状态判定与幂等收敛

converge 必须对 memory catalog 的每份文档逐一判定状态(缺失 / 非规范格式 / 半成品 / 旧版格式 / 内容漂移 / 已达标)并按状态选动作;状态判定优先机械信号(checker 输出、文件存在性、节标题匹配),模型判定只用于内容漂移档。对已收敛项目紧接复跑,必须全部跳过且不产生任何文件改动。
Verify: 双端验收 + 幂等复跑(工作树零 diff)

### Requirement: 已有内容为权威来源

converge 对已存在的用户内容只重排结构、只补空缺,必须不推倒重写;内容与代码矛盾时必须列出矛盾交用户裁决。
Verify: init 端验收(既有 README 内容保留)

### Requirement: 初次创作豁免

PRODUCT 与 specs 从无到有时,converge 以维护者访谈为权威来源实填,代码仅用于印证陈述、不得反推;访谈答不上的节留骨架并注明来源缺失。文档一旦存在,内容修改权回归 shape(PRODUCT)与 docs(specs)。
Verify: init 端验收(访谈发生;无来源的节留骨架)

### Requirement: 分级确认

动内容的改动(重排用户所写、修内容漂移、访谈补缺)必须逐份先呈现「改什么 + 为什么」并获确认;纯格式对齐可批量执行,完成后必须给出总览。
Verify: align 端验收

### Requirement: 同级资产引用、缺失即停

converge 的格式权威来源是同装 docs skill 的 references/formats/\*,机械扫描复用同装 doctor 的 scripts/checker.ts;任一缺失必须停下报依赖,不得降级或凭记忆编造格式。checker 缺 Node 24 时沿用 doctor 契约:注明跳过,模型判定继续。
Verify: manual(卸载 docs 后运行应停)

### Requirement: 只管 catalog 文档的批量收敛

converge 只收敛 memory catalog 文档;不装 host 侧任何东西,不碰 catalog 外文档,不做依赖/CI 检查(doctor),不做单目标零散修正(docs)。
Verify: manual(integration)

## MODIFIED Requirements

### Requirement: 守默认目录边界、PRODUCT 指回 shape(specs/docs/spec.md)

增补:PRODUCT 与 specs 的「从无到有初次创作」由 converge 以访谈产出,属边界的显式例外;既有文档的内容变更仍指回 shape / docs 本身。

### Requirement: 只读、只指路、不接管(specs/doctor/spec.md)

增补:doctor 发现成批 catalog 格式漂移时,指路对象增加 /converge(批量收敛);doctor 自身仍不动手。
```

## Interface boundary

- **调用**:`/converge`,无参数;在目标项目根目录运行。
- **输入**:项目文件系统 + 维护者访谈回答。有效输入是任意项目(含空项目);squire 仓库自身也是合法目标。
- **输出**:成功 → 收敛报告(逐份文档:判定状态 → 采取动作 / 跳过原因)+ 被确认后写入的文档;失败/中止 → 停下时的明确原因(缺同装依赖 / 用户拒绝确认 / 访谈无来源)。
- **副作用**:只写 memory catalog 文档与 plans/ 目录骨架;不 git、不装东西、不改代码、不调其他 skill 行动。
- **不暴露**:scope 过滤参数、catalog 外文档、host 配置——均不经外部接口表达。

## Acceptance scenarios

1. Given 复制出的 notes-app fixture(brownfield,无 squire 文档、有既有 README),when 运行 /converge 并配合访谈,then catalog 文档补齐、PRODUCT/WORKFLOW 内容来自访谈、README 原内容全部保留且被重排进规范结构。
2. Given squire 仓库自身且人为把一处文档退回旧格式,when 运行 /converge,then 该处被收敛回规范且只动这一处,动内容前有逐份确认。
3. Given 刚收敛完的项目,when 紧接再运行 /converge,then 报告全部「跳过」,`git status --porcelain` 零 diff。
4. Given 未安装 docs 或 doctor skill 的环境,when 运行 /converge,then 停下报「需与 docs / doctor 同装」,不写任何文件。
5. Given 访谈中维护者答不上某节,when converge 写该文档,then 该节留骨架并注明来源缺失,不出现编造内容。

## Implementation steps

1. skills/converge/SKILL.md
   - outcome:SKILL.md 完整落地——frontmatter(name/description/when_to_use 中英触发词/dispatch_intent)、Outcome Contract、状态判定表与动作映射、分级确认规则、同级资产引用与缺失即停、初次创作豁免边界、When to stop(拒绝确认 / 缺依赖 / 无来源 / 想碰 catalog 外文档)
   - scope:`skills/converge/SKILL.md`
   - verify:`pnpm test`(frontmatter / Outcome Contract / 触发词 Jaccard invariant 全绿)
2. RESOLVER 路由
   - outcome:`skills/RESOLVER.md` 含 converge 条目,与既有 9 条同格式,触发语覆盖「初始化 / 上车 / 对齐 / 补文档 / 升级后更新」
   - scope:`skills/RESOLVER.md`
   - verify:`pnpm test`(checkResolverConsistency)
3. specs/converge/spec.md
   - outcome:新域 spec 按上方 Spec delta 的 ADDED 六条落地,每条带 Verify 行
   - scope:`specs/converge/spec.md`
   - verify:`pnpm test`(checkSpecPairing)
4. doctor / docs 边界句与其 spec 的 MODIFIED
   - outcome:`skills/docs/SKILL.md` 与 `skills/doctor/SKILL.md` 的 Boundaries 各加一句批量收敛归 converge;两份 spec 按 MODIFIED delta 更新(保留 Previously 注)
   - scope:`skills/docs/SKILL.md`、`skills/doctor/SKILL.md`、`specs/docs/spec.md`、`specs/doctor/spec.md`
   - verify:`pnpm test` + 人读边界句无自相矛盾
5. 重装并双端验收
   - outcome:`npx skills add . -g -a claude-code -y` 重装后,Acceptance scenarios 1-3 逐条通过(场景 4、5 人工核)
   - scope:运行验证,不改仓库文件(fixture 复制件在临时目录)
   - verify:三条场景的实际运行记录 + 幂等轮 `git status --porcelain` 输出

## Verification

- command: `pnpm test`
- command: `node skills/doctor/scripts/checker.ts . --json`(期望 `[]`)
- checklist (manual):
  - [ ] 验收场景 1(brownfield init 端,含 README 保留)
  - [ ] 验收场景 2(squire 自身 align 端,单处收敛)
  - [ ] 验收场景 3(幂等复跑零 diff)
  - [ ] 场景 4(缺同装依赖即停)、场景 5(无来源留骨架)人工核

## Rollback

新增文件(skills/converge/、specs/converge/)整目录删除;docs / doctor 各一句边界与两处 spec MODIFIED revert 即可。无数据迁移、无外部状态。

## Risks & Unknowns

- **访谈式验收成本**:场景 1 需要维护者真人配合访谈,一轮约十几个问题;缓解:访谈问题在 SKILL.md 里按文档分组,可分次进行。
- **checker 对非 squire 格式文档的信号有限**:checker 只认 squire 格式 spec 的 conformance,对散文文档状态判定主要靠节标题匹配;缓解:散文文档的判定结果一律走「动内容逐份确认」档,不批量。
- **Unknown**:notes-app fixture 是否足够代表真实 brownfield(它是 bench 造的玩具项目)— owner:维护者验收时判断,blocker:no。
