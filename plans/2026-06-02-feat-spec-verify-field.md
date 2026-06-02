---
mode: feat
title: spec 格式加 Verify 字段 —— 每条 Requirement 标明怎么验
created: 2026-06-02
status: done
---

# spec 格式加 Verify 字段 —— 每条 Requirement 标明怎么验

## Building

给 spec 的格式加一个 `Verify:` 字段:每条 `### Requirement:` 后跟一行,声明这条契约**怎么被验证**——要么一个指向测试的 **markdown 链接**(测试背书),要么 `manual(visual)` / `manual(integration)`(测不了的,标明)。这是把 spec 从"会漂的 prose 契约"变成"测试背书的契约"的那根线,也是这一整场讨论唯一落地的真知识(来自 Specification by Example:规格与测试合一才不漂)。

防漂移**不需要新机器**:squire 已有的 `checkMarkdownLinks`(`scripts/checks.ts`)会校验相对链接能否解析,所以测试文件被删/挪 → 链接断 → `pnpm test` 红。`manual(...)` 没有链接——"没链接"本身就是"这条没被自动验"的诚实信号。

## Not building

- **不挪 spec 的位置**(仍在现有 loop 位置,不改成 spec-before)。
- **不动 record/correct/backfill 模式,不动 delta/merge 结构**(delta 里的 Requirement 自然也带 Verify 行,仅此而已)。
- **不改 RESOLVER / plan-template / mode-feat / build / README / ARCHITECTURE**——这次只动 spec 的格式定义。
- **不批量重排其余 7 份 specs/**(explore/shape/build/test/review/commit/propose)——它们对齐到新格式是单独一趟,见 Risks。
- **不引入新 check、不引入 Cucumber、不引入 BDD/TDD 方法论的额外结构**——TDD 在 build、验收场景的 GWT 在测试里,都已存在。

## Approach

把格式里原来的内联 `#### Scenario:`(GIVEN/WHEN/THEN)**换成** `Verify:` 一行:

- GWT 是验证细节,按 SBE 它属于测试。能测的,GWT 活在被链接的那个测试里(`it("...")` 即 given-when-then),spec 不再抄一遍。
- 所以 spec 里一条 Requirement = 一句 RFC 2119 契约 + 一行 `Verify:`。更短、且每条都说清谁验它。

**最小可行版**(下界):只改 `skills/spec/SKILL.md` 的格式定义,连 seed spec 都不动。否决理由:不给一个改好的真实样例,build/读者无法确认新格式长什么样、`checkMarkdownLinks` 是否真的兜住。所以纳入 seed spec 的重排(1 份),其余 7 份明确 defer。

## Premise collapse

**这个 plan 赌的是"在不挪位置、不砍 delta 的前提下,单加 Verify 字段是自洽的"。** 若实际写起来发现 delta 的 ADDED/MODIFIED/REMOVED 跟 Verify 行配合别扭(比如 MODIFIED 一条时 Verify 要不要跟着改),那说明 delta/merge 这套本身才是该简化的,但**那是另一个 plan**;本 plan 不为它扩大范围,遇到别扭就在报告里记下、停在最小格式改动。

## Key decisions

1. **`Verify:` 取值有限,三选一**:`[<text>](<相对路径,可带 #Lnn>)` / `manual(visual)` / `manual(integration)`。不是自由文本——有限取值才好读、好查。
2. **链接用 markdown 原生语法**(不用自造符号),复用现成 `checkMarkdownLinks` 当防漂移线,不加新 check。
3. **`manual` 分两类**:`visual`(感知判断,不可约)/ `integration`(本可测,E2E 过慢或不稳,是"下沉成 test"的候选债)。两者区分开,因为处置不同。
4. **内联 `#### Scenario:` GWT 从 spec 格式移除**:能测的 GWT 在被链接的测试里;manual 的靠 Requirement 陈述本身说清,不另立 scenario 块。
5. **进不进 spec 看"要不要"(重要性),不看"能不能测"**——测不了的真契约用 `manual` 留住,不被踢出。
6. **范围锁死在 spec 格式**:位置、模式、delta、loop、其余 skill 一律不碰。

## Public surface changes

- **spec 文件格式**:每条 Requirement 新增一行 `Verify:`;移除内联 `#### Scenario:` 块。
- 无 API / config / CLI 变化。无新依赖。无新 check 函数。

## Interface boundary

**这次改动暴露的"接口" = spec 文件的格式契约**:

- 每个 `### Requirement: <name>` 下:一句 RFC 2119 陈述(`系统必须…`)+ **恰好一行** `Verify:`。
- `Verify:` 的三种合法形态:
  - `Verify: [<test 名/文件>](<相对路径>)` —— 指向验证它的测试;路径相对该 spec 文件;可带 `#Lnn`。
  - `Verify: manual(visual)` —— 感知判断,发版前肉眼过。
  - `Verify: manual(integration)` —— 暂时人工(E2E 过慢/不稳),标为下沉候选。
- delta 段(`## ADDED/MODIFIED/REMOVED Requirements`)里的 Requirement **同样**带 `Verify:` 行,格式一致,无特殊处理。

**不暴露 / 不变**:spec 的存放位置、domain 组织方式、record/correct/backfill 模式、merge 规则——都不变。

## Acceptance scenarios

1. **格式定义更新**:Given `skills/spec/SKILL.md` 的 `## Spec format` 段,When 读它,Then 代码块里每条 Requirement 显示 `Verify:` 行、不再有内联 `#### Scenario:`;且三种 `Verify:` 取值各有说明。
2. **test 链接形态**:Given 一条能测的 Requirement,Then 它的 `Verify:` 是一个指向测试文件的 markdown 链接。
3. **manual 两类**:Given 一条测不了的 Requirement,Then 它的 `Verify:` 是 `manual(visual)` 或 `manual(integration)`,二者语义在 SKILL.md 里写明区别。
4. **防漂移靠现成 check**:Given 某 spec 的 `Verify:` 链接指向一个不存在的测试路径,When 跑 `pnpm test`,Then `checkMarkdownLinks` 报红(无需新增 check)。
5. **seed spec 合规**:Given `specs/spec/spec.md`,When 读它,Then 每条 Requirement 都带合法 `Verify:`,无内联 scenario。
6. **整库绿**:When 跑 `pnpm test`,Then 42 项(frontmatter / description / Outcome Contract / references / links / Jaccard / RESOLVER)全过。

## Implementation steps

1. **改 `skills/spec/SKILL.md` 的格式定义**
   - change:`## Spec format` 代码块——把 `#### Scenario:` GWT 块替换为一行 `Verify:`(示例给三种取值各一);把下方解释 bullet 里"Scenarios are the when"那条改写成"Verify: 怎么验"的说明(三种取值 + manual 两类区别 + 测试链接由现成 checkMarkdownLinks 守);保留"Requirements are the what""what belongs"两条。
   - change:正文其余提到"scenario / GWT 写进 spec"的地方(如 Crystallize/record 段、Outcome Contract)统一改成"GWT 在测试里;spec 用 Verify 链接指过去"。delta 段补一句"其中 Requirement 同样带 Verify 行"。
   - verify:`pnpm test`(SKILL.md 自身的 frontmatter/description/Outcome/references/links/Jaccard 全过);人读格式段呈现 `Verify:` 三态、无内联 scenario。
2. **重排 seed spec `specs/spec/spec.md`**
   - change:每条 Requirement 去掉内联 `#### Scenario:`,补一行 `Verify:`。spec skill 的行为多为 agent prose、无单测 → 多数标 `manual(integration)` 或 `manual(visual)`;若某条恰由 smoke check 覆盖(如格式结构类),用 markdown 链接指向对应 `tests/` 文件。
   - verify:`pnpm test`(checkMarkdownLinks 对其中任何 test 链接生效);人读符合新格式。
3. **整库验证**
   - verify:`pnpm test` → 42 passed;`pnpm typecheck` → clean。

## Verification

- command:`pnpm test`(= `vp test run`)→ 42 全绿;`pnpm typecheck` → clean。
- checklist(manual):
  - [ ] `skills/spec/SKILL.md` 格式段:每条 Requirement 一行 `Verify:`,三态有说明,无内联 scenario
  - [ ] 故意把某 `Verify:` 链接指向不存在文件 → `pnpm test` 转红(验证现成 check 兜得住)→ 改回
  - [ ] `manual(visual)` 与 `manual(integration)` 的区别在 SKILL.md 写明
  - [ ] seed spec 合规、其余 7 份未动(确认本次范围未蔓延)

## Rollback

纯文档/格式编辑,git 可逆:还原 `skills/spec/SKILL.md` 与 `specs/spec/spec.md` 两个文件即可完全回退。无运行时代码、无数据迁移、无新依赖。

## Risks & Unknowns

- **其余 7 份 specs/ 暂与新格式不一致**:本 plan 只改 seed;explore/shape/build/test/review/commit/propose 的 spec 仍是旧 Scenario 格式。**owner**:后续单独一趟批量对齐,**blocker**:否(不影响 check,旧格式仍能读)。
- **squire 自己的 skill-行为 specs 多落 `manual`**:skill 行为是 agent prose、非单测可验,既非纯 visual 也非慢 E2E。本 plan 暂归入 `manual`(用着 skill / review 时验)。这暴露一个未决问题:`manual` 是否需要第三类(如 `manual(behavior)`)来描述"靠 agent 遵循指令"的验证。**owner**:未来 spec 用法稳定后再定,**blocker**:否。
- **delta 与 Verify 的配合可能别扭**(见 Premise collapse):遇到就记录、停在最小改动,不在本 plan 扩范围去动 delta/merge。
