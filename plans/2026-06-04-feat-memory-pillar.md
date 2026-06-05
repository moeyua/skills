---
mode: feat
title: squire 支柱重构 — 记忆(spec→persist) + 校验(verify) + test 解散
created: 2026-06-04
status: done
---

# squire 支柱重构

把 squire 从「8 个 skill / 只做代码闭环」重构成清晰的 **6 支柱**模型,做三件咬合的事:补上**记忆**支柱、把**校验**收成 `verify`、解散横切的 `test`。它们共改同一套真源(PRODUCT 的 scope、ARCHITECTURE 的结构模型),故合一份 plan;两大半(记忆 / 校验+改造)各自可独立 ship,需要时可拆。

重构后支柱 / skill:

| 支柱 | skill                                                                 |
| ---- | --------------------------------------------------------------------- |
| 理解 | explore                                                               |
| 设计 | shape                                                                 |
| 改造 | **build(含写测试)**                                                   |
| 校验 | **verify(test/review/e2e,线性)** + **health(正交审计,后续独立 plan)** |
| 记忆 | **persist(由 spec 升级)**                                             |
| 交付 | commit + propose                                                      |

线性 loop(7 站):explore → shape → build → **verify** → **persist** → commit → propose
正交:**health**(按需审计,findings 喂回 shape/persist/build)

skill 数:本 plan 后 8 → 7(`test`+`review`→`verify`;`spec`→`persist`);health 落地后 → 8。

## Building

1. **重定 scope**:改 PRODUCT.md 哲学 #2 与边界 #2——记忆/文档(含 README)进 scope、由记忆目录封顶;闭环表述改 6 支柱。其余 4 哲学、其余 4 边界不动。
2. **记忆目录**:新建 `rules/memory-catalog.md` 共享真源(7 artifact:behavior/ARCHITECTURE/DESIGN/PRODUCT/WORKFLOW/ROADMAP/README,每项 装什么/受众/何时需要/源/怎么写/怎么更新/边界)。收编 explore 内嵌清单。
3. **spec 升级为 persist**:三动作 mode(record/correct/backfill)不变,目标从 specs/ 泛化到目录任一 artifact;行为契约逻辑原样保留为其一目标。
4. **校验合成 verify**:把 `review` + test-run + e2e 合成一个 `verify` skill,三 mode:`review`(code-review)/`test`(跑套件)/`e2e`(跑起来观察真实行为)。设计**参考内置 `verify`/`run` 与 `code-review`**(见 Approach)。
5. **解散 test**:跑→`verify` 的 test mode;写测试/补覆盖→build(改造);调失败根因→shape fix。删 `skills/test`,把写测试纪律迁进 build、跑/判测试纪律迁进 verify。
6. **squire 自食其用**:ARCHITECTURE 改写成 6 支柱、只讲当下;新建 ROADMAP 收 `## v2 规划`;RESOLVER/README 反映 persist/verify、删 test/review。

## Not building

- **health skill** —— 下一份独立 plan。它是**正交审计**(文档↔代码漂移、依赖陈旧、CI、热点),不在线性 loop;test 解散与 verify 都**不依赖**它。
- **改其余哲学 / 边界(#1/#3/#4/#5)** —— 只审 #2。
- **给 plan 模板加「架构 delta」段** —— persist 各目标的源由目录定义。
- **codegen / 目录做成可校验 schema**。

## Approach

**unify(spec→persist)、consolidate(校验→verify)、dissolve(test)、目录作共享真源。**

### verify 怎么写——参考既有 skill(用户硬要求)

> 参考基础:`code-review` 插件命令 + `code-reviewer` agent 的**完整真源**已读;内置 `verify`/`run` 编译在 claude 二进制里、源不可读,故 e2e mode **据其官方描述设计、不抄内部**。

- **`review` mode**(承 code-review 成熟做法,亦是 squire 现 review 的血统):默认 scope `git diff`;多维(CLAUDE.md 合规 / bug / git 历史 blame / 既往 PR 评论 / 代码注释);**0-100 置信、滤 <80**;假阳性纪律(预存问题、nitpick、linter/typecheck 能抓的、未改的行——不报);Critical/Important 分级 + 引 file:line + 具体修法;不自己跑 build/typecheck(CI 管)。保留 squire review 的 Strengths 段与「指向对应 skill 不接管」。
- **`e2e` mode**(据内置 `verify`+`run`):跑起来、驱动、**观察真实行为**确认改动生效,push 前验证;**先找项目自带「怎么启动」的 skill,没有再按项目类型兜底**(CLI/server/TUI/Electron/browser/library)。
- **`test` mode**(原 test 的跑):跑套件、判 pass/flaky/真失败;flaky 最多重试一次;真失败→shape fix;不 `.skip`/不删。

三 mode 输出一致(一个「过/不过 + 问题(分级)」的裁决),方法不同——同 shape 用 mode 统一 fix/feat/refactor/perf 的结构。消息可只触发其一(只 review / 只 e2e),也可组合(用户实践常 review+e2e 一起)。

### 记忆 / test 同前

- 记忆 unify:spec + 兄弟 = 两根半截柱;合 `persist`、动作 mode 不变、目标由目录泛化。
- test dissolve:test 是唯一跨柱 skill,纪律 build/verify 早有重复;解散后支柱零跨柱。

**Minimal 选项(对照)**:只加目录 + explore 引用,不动 spec/test/review——记忆仍半截、校验仍散三处。不够。

## Premise collapse

三个脆弱假设,各自重塑使其失败也不塌:

1. **泛化 spec→persist 稀释行为记录严谨度。** 重塑:行为目标沿用今天 spec 硬规矩(无 `## Spec delta` 即停问),泛化只新增目标不降旧门槛;anti-invention 逐目标且绝对。
2. **解散 test 丢掉测试纪律。** 重塑:解散 ≠ 删除——跑/判纪律迁进 verify(test mode)、写纪律迁进 build;迁移清单进 Acceptance + Spec delta,smoke 兜底。
3. **合成 verify 会让 review 的把关质量打折(三 mode 混杂)。** 重塑:review mode **逐条照搬** code-review 的置信≥80 + 假阳性纪律 + 维度,不因并入 verify 而放松;三 mode 各有独立纪律,只共享「输出裁决」这层壳。

## Key decisions

1. **unify:spec → persist** —— 记忆一根整柱,目标由目录泛化;`persist` 名「持久化」点出目的,且不再跟 `record` mode 撞名。
2. **consolidate:校验 → verify**,三 mode(review/test/e2e);**review mode 参考 code-review、e2e mode 参考内置 verify/run**(用户硬要求,已读真源/描述)。
3. **dissolve:test**(横切非支柱;跑→verify、写→build、调→shape fix;纪律分迁 verify/build)。
4. **health 正交、单列下一 plan**(审计,不在线性 loop;verify/test 解散均不依赖)。
5. **目录进 `rules/` 作共享真源**(explore 读 / persist 写 / 将来 health 查;symlink 进这三个 references/;收编 explore 内嵌清单,消漂移,哲学 #4)。
6. **改 #2 外科手术**:哲学 #2「只做代码闭环」→「开发 + 记忆」;边界 #2「对外文档全排除」→「维护有界目录(含 README),照目录写、不发明定位、不做产品判断」。**打破理由**:原 #2 根因「替别项目管对外文档会失控」,目录把 scope 锁死(固定清单 + anti-invention + 不裁决),封顶恢复,克制不破。仍排除:changelog/release notes(#3)、API 文档、非目录条目。
7. **接受命令遮蔽**:squire `/verify` 遮蔽内置 `verify`(同当年 `/review` 遮蔽内置 review);squire 不再有 `/review`(并入 verify)、`/test`(解散)、`/spec`(改名 persist)。

## Public surface changes

- **命令**:`/spec`→`/persist`;`/review`、`/test` 取消;**新增 `/verify`(遮蔽内置)**。均破坏性。
- **新增共享件**:`rules/memory-catalog.md` schema。
- **PRODUCT.md #2** 哲学 + 边界措辞;闭环改 6 支柱。
- **RESOLVER.md / README.md**:spec→persist、review/test→verify、build 作用扩含写测试;闭环改 6 支柱。
- **build scope 扩**:显式含不挂 plan 的写测试工作 + 迁入写测试纪律。

## Interface boundary

**persist**:命令 `/persist`;mode record/correct/backfill;目标由消息+目录决定(behavior→specs/、architecture→ARCHITECTURE.md、…)。写记忆文件(create-if-missing/update);不碰代码/git/目录外文档;PRODUCT 内容指回 shape。

**verify**:命令 `/verify`;mode review/test/e2e(可单可组合)。

- 输入:diff(默认)/ 指定 scope;e2e 需可启动的 app。
- 输出:裁决(过/不过)+ 问题按 Critical/Important + file:line + 修法方向;review 只给方向不接管、指向对应 skill。
- Side effects:test/e2e **执行**代码/起 app(只读式观察,不改源);review 纯读。不改文件、不 git、不替作者调用别的 skill。
- Not exposed:不修 bug(指向 shape fix)、不写测试(指向 build)、不漂移审计(health)。

**build(scope 扩)**:仍以执行 plan 为主;新增承接不挂 plan 的写测试工作(补覆盖/回归);写测试红→绿、基于真实行为、无框架不硬造基建;真失败回 shape fix。

## Acceptance scenarios

1. **(记忆/不回归)** plan 带 `## Spec delta` → `/persist`(record 模式·behavior 目标)→ 按名合并进 `specs/`,同今天 spec。
2. **(记忆/新目标)** 架构变更 + Key decisions → `/persist`(architecture 目标)→ 更新 ARCHITECTURE,无 v2;无文件则 create-if-missing。
3. **(记忆/anti-invention)** persist architecture 无源 / behavior 无 delta → 停下发问。
4. **(记忆/边界)** persist 目录外 artifact(CHANGELOG)→ 拒绝(边界 #3)。
5. **(verify/review)** 有 diff → `/verify` review → 多维扫、只报置信≥80、Critical/Important 分级、引 file:line、不报 linter 能抓的。
6. **(verify/test)** 疑似 flaky → `/verify` test → 重试一次,再失败按失败,不 skip;真 bug → 指向 shape fix。
7. **(verify/e2e)** 改了某 UI 流程 → `/verify` e2e → 先找项目启动 skill、否则按类型起 app、驱动、观察真实行为给裁决。
8. **(改造/写测试)** 「给 auth 补覆盖」(无 plan) → `/build` 接管,补的测试红→绿、基于真实行为。

`## Spec delta`(改 squire 自己的 specs/):

```markdown
## MODIFIED Requirements

### Requirement: 合并 spec delta

persist 的 behavior 目标必须按 requirement 名把 plan 的 `## Spec delta` 合并进 `specs/<domain>/spec.md`(ADDED 追加 / MODIFIED 替换 / REMOVED 删除;domain 不存在则新建)。(Previously: 隶属 spec skill,仅行为契约)
Verify: manual(integration)

### Requirement: 有测试框架且 fix/feat 走 TDD（build,扩后）

build 在有测试框架时:fix/feat 走 TDD(红→绿,一写就绿即停下修测试);承接不挂 plan 的写测试工作(补覆盖/回归同样红→绿、基于真实行为)。(Previously: 仅 plan 内 TDD,测试工作另属 test skill)
Verify: manual(integration)

## ADDED Requirements

### Requirement: 目录驱动的多目标记忆

persist 必须按 `rules/memory-catalog.md` 决定写哪份 artifact 及如何写;目标缺失则 create-if-missing。
Verify: manual(integration)

### Requirement: 逐目标 anti-invention

persist 写任一目标必须依据该目标在目录声明的权威源;源缺失必须停下发问,不逆推、不凭空创作;behavior 的「无 delta 即停问」门槛不因泛化降低。
Verify: manual(integration)

### Requirement: 设计记忆不含未来、ROADMAP 只记不裁决

persist 写 ARCHITECTURE/DESIGN 必须不含未来/搁置项(归 ROADMAP);写 ROADMAP 只记维护者已决定搁置的项,不排优先级、不排期、不裁决。
Verify: manual(integration)

### Requirement: verify 三 mode 与裁决

verify 必须支持 review/test/e2e 三 mode(可单可组合):review 照 code-review 做法多维扫、只报置信≥80、Critical/Important 分级、不报 linter 可抓项、给方向不接管;test 跑套件、flaky 最多重试一次、真失败指向 shape fix、不 skip;e2e 先找项目启动 skill 否则按类型起 app、观察真实行为。verify 只读式校验,不改源、不修 bug(指向 shape fix)、不写测试(指向 build)。
Verify: manual(integration)

## REMOVED Requirements

### Requirement: （specs/test/spec.md 全部）

(Deprecated：test 解散——跑→verify test mode、写→build、调→shape fix)

### Requirement: （specs/review/spec.md 全部）

(Migrated：并入 verify 的 review mode,要求逐条保留)
```

## Implementation steps

> 六个 Phase 各自可独立 ship。Group 记忆(A–C)与 Group 校验/改造(D–E)相互独立,F 收口文档。

### Phase A — 重定 scope(PRODUCT.md)

1. 改 [PRODUCT.md](../PRODUCT.md) 哲学 #2:「只做代码开发」→「开发 + 记忆」;闭环列表改 6 支柱(记忆一等;校验=verify+health;test 并入 build)。verify: 人读;`pnpm test`。
2. 改 [PRODUCT.md](../PRODUCT.md) 边界 #2:改为「有界记忆目录(含 README)…仍排除 changelog/release/API/非目录条目」+ `2026-06-04 边界修订` + 打破理由。verify: 人读含「目录/README/封顶/仍排除」。

### Phase B — 记忆目录 + explore 收编

3. 建 `rules/memory-catalog.md`(7 artifact × 7 字段)。verify: 齐全。
4. symlink `skills/explore/references/memory-catalog.md` → `../../../rules/memory-catalog.md`。verify: `ls -l`;`pnpm test`。
5. 改 [skills/explore/SKILL.md](../skills/explore/SKILL.md):内嵌清单改为引用目录。verify: `pnpm test`。

### Phase C — spec 升级为 persist

6. `git mv skills/spec skills/persist`;改写 SKILL(`name: persist`、触发词泛化避撞;三动作 mode record/correct/backfill 不变;merge-delta 泛化为多目标;各目标源引目录;逐目标 anti-invention;create-if-missing;Boundaries vs explore/verify/health/shape/build)。verify: `pnpm test` frontmatter/Jaccard。
7. symlink `skills/persist/references/memory-catalog.md` → `../../../rules/memory-catalog.md`。verify: `pnpm test`。
8. `git mv specs/spec specs/persist`;按 Spec delta 改写 `specs/persist/spec.md`。verify: `pnpm test` spec 格式。
9. RESOLVER/README:spec→persist。verify: `pnpm test` 路由一致性。
10. 扫残留 `skills/spec`/`specs/spec`/`/spec`/`spec skill`(plan-template「→ spec」改「→ persist」)。verify: grep 无残留。

### Phase D — 校验合成 verify(吸收 review + test-run + e2e)

11. 建 `skills/verify/SKILL.md`:三 mode(review/test/e2e),按 Approach 写:
    - review mode 移植 [skills/review/SKILL.md](../skills/review/SKILL.md) 全部(5 维 / 置信≥80 / Critical/Important / Strengths / 指向对应 skill),并对齐 code-review 的假阳性纪律与默认 `git diff` scope;
    - test mode = 原 test 的跑(flaky 重试一次 / 真失败→shape fix / 不 skip);
    - e2e mode 据内置 verify/run 描述(先找项目启动 skill、否则按类型起 app、观察真实行为)。
    - frontmatter `name: verify`、触发词避撞、Outcome Contract、两条 rules 指针。
      verify: `pnpm test` frontmatter/description/Outcome/Jaccard。
12. `git mv specs/review specs/verify`;改写 `specs/verify/spec.md`:迁入 review 全部 requirement + test 跑相关 + e2e requirement(各带 Verify)。verify: `pnpm test` spec 格式。
13. `git rm -r skills/review`。verify: smoke 不再发现 review;`pnpm test`。
14. RESOLVER/README:review→verify、补 e2e/test 触发词、Verify 阶段表述改 verify。verify: `pnpm test` 路由一致性。

### Phase E — 解散 test

15. 扩 [skills/build/SKILL.md](../skills/build/SKILL.md):scope 显式含「不挂 plan 的写测试工作」;TDD 段并入「补覆盖也红→绿、基于真实行为」;真 bug 回 shape fix。verify: 人读;`pnpm test`。
16. 改 [specs/build/spec.md](../specs/build/spec.md):按 Spec delta MODIFIED「TDD（扩后）」。verify: `pnpm test` spec 格式。
17. `git rm -r skills/test specs/test`。verify: smoke 不再发现 test。
18. RESOLVER/README:删 test 行;测试触发词路由到 verify(跑)/build(写)/shape fix(调)。verify: `pnpm test` 路由一致性。
19. 扫残留 `skills/test`/`specs/test`/`/test`/`test skill`/`skills/review`/`/review`。verify: grep 无残留。

### Phase F — squire 自食其用

20. 建 [ROADMAP.md](../ROADMAP.md),迁入 [ARCHITECTURE.md](../ARCHITECTURE.md) 的 `## v2 规划` + 散落 v2(含「health」)。verify: 人读;ARCHITECTURE 无未来段。
21. 改写 [ARCHITECTURE.md](../ARCHITECTURE.md):顶层改 6 支柱;结构树补 `skills/persist/`、`skills/verify/`、`rules/memory-catalog.md`,去 `skills/spec`、`skills/review`、`skills/test`;决策记录补「spec→persist / 校验合成 verify(参考 code-review/内置 verify) / test 解散 / 重定 #2」;删 `## v2 规划`。verify: 人读;`pnpm test` 链接。

## Verification

- command: `pnpm test`(frontmatter / Outcome / description / Jaccard / references / 链接 / 路由一致性 / spec 格式)
- checklist(manual,对应 Acceptance):
  - [ ] persist record-behavior 合并 = 旧 spec(1);architecture 无 v2、缺源停问、可惰性出生(2);目录外被拒(4)
  - [ ] verify review 只报置信≥80、不报 linter 项(5);test flaky 重试一次、真 bug→shape fix(6);e2e 起 app 观察(7)
  - [ ] build 接管补覆盖红→绿(8)
  - [ ] squire 自身:ARCHITECTURE 6 支柱无未来段、ROADMAP 含全部 v2、全仓无 `skills/spec`/`skills/review`/`skills/test` 残留

## Rollback

逐 Phase `git revert`:A 恢复 #2;B 删 catalog+还原 explore;C/D 的 `git mv` 反向恢复 spec/review;E 恢复 test;F 删 ROADMAP+v2 回 ARCHITECTURE。三处破坏性面向已安装用户(`/spec`→`/persist`、`/review`+`/test`→`/verify`):靠重装同步,无不可逆外部状态;README/ROADMAP 写明迁移。

## Risks & Unknowns

- **命令大改名**(spec→persist;review/test→verify)破坏肌肉记忆:squire 仍 private、面小;README/ROADMAP 写明。
- **verify review mode 把关打折**:已由 Premise collapse #3(逐条照搬 code-review 纪律)消解。
- **解散 test 留测试缺口**:Phase D/E 把跑迁 verify、写迁 build,场景 5–8 兜住;review 验收若发现遗漏补进对应 skill。
- **e2e mode 据描述设计(内置源不可读)**:可能与内置 verify 行为不完全一致;以 squire 自定义为准(已接受遮蔽),后续按实跑校准。
- **触发词 persist/verify/build 扩后撞车**:`pnpm test` Jaccard < 0.5 兜底。
- **Unknown**:squire 要不要 `WORKFLOW.md`/`DESIGN.md`?owner: 你;blocker: no。

## Mode-specific

见 `## Interface boundary` 与 `## Acceptance scenarios`。
