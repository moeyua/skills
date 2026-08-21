---
mode: fix
title: 修正 Plan 关联 Issue 永不更新的问题
created: 2026-08-20
status: candidate
issue: https://github.com/moeyua/skills/issues/44
---

# 修正 Plan 关联 Issue 永不更新的问题

## Building

让 `both` 在创建成对的本地 plan 与 Issue 后继续维护二者的职责一致性：重写本地 plan 时，只要 `what / why / observable done` 的问题记录投影发生变化且仍是同一个 bounded problem，就受控更新原 canonical Issue；仅有 implementation approach、路径级 scope、顺序或验证变化时保持 Issue 不变。Issue identity 保持稳定，远程内容不再被错误地视为不可修订。

Plan 创建的 paired Issue 使用带版本和内容摘要的隐藏 managed block 标识其可管理区域。修订前必须证明当前 title、change-type label 与 managed body 仍匹配 Plan 上次写入的摘要；只更新受管内容并保留 block 外正文、无关 labels、comments 及项目管理状态。缺少所有权标识、摘要不匹配或问题身份发生变化时不覆盖远程内容，而是返回可辨认的冲突结果。

## Not building

- 不改变 `local` 的零 GitHub mutation 保证；显式选择 `local` 时只修改本地 plan。
- 不把纯 `issue` target 扩成通用 Issue 编辑器；它仍创建新问题记录或只读复用用户提供的 canonical URL。
- 不根据标题搜索、替换 canonical Issue identity、把另一问题覆写进旧 Issue、自动拆分或合并 Issue，也不自动关闭被放弃的 Issue。
- 不管理 comments、Projects、status、milestone、assignee、dependencies、sub-issues、Issue Type 或非 Plan 所有的 labels。
- 不盲目合并人工改写的 managed content；发现并发或所有权冲突时保留双方现状并停止远程 mutation。
- 不改变 Issue 只记录问题、本地 plan 独占实施方案的内容边界。

## Root cause

`skills/plan/SKILL.md:3` 与 `skills/plan/references/target-both.md:7-9,19` 把“不得猜测或替换 canonical Issue identity”的安全要求扩大成“任何既有 Issue 都不得编辑”，导致 paired plan 的问题语义被驳回或修订后仍只能复用旧正文，同时现有契约没有 Plan-owned content、并发检测或 update reconciliation，因而无法安全区分应当保持不变的 implementation-only revision、应当同步的 problem-record revision 和必须停止的 identity change。

## Approach

1. **推荐：带摘要的 Plan-managed block + optimistic update。** `both` 新建 Issue 时把 problem-oriented 正文放入成对的隐藏边界标识，并在起始标识记录 schema version、managed change type 与由 canonical title、type、managed body 计算的 SHA-256。重写 paired plan 时读取 canonical Issue，验证标识及摘要，再比较新旧问题投影；一致则 `unchanged`，同一问题内的投影变化则通过一次 `gh issue edit` 更新 title、managed block 和 Plan 管理的 change-type label，并在每次 edit attempt 后回读一次完整目标摘要。block 外正文及其他 labels 原样保留。该方案复用仓库已有的 hidden marker 与 SHA-256 模式，并能机械地区分安全更新和已存在的外部编辑冲突。
2. **整段正文直接覆写。** diff 最小，但无法判断 Issue 是否由 Plan 创建，也会覆盖人工补充，因此不满足受控修订要求。
3. **只追加 revision comment。** 可以保留历史，却让 Issue 顶部 canonical problem record 持续过时，并把当前状态拆散到评论流中，因此不采用。

## Key decisions

- canonical URL 表示稳定身份，不表示 title、problem body 或 change-type label 永久不可变。
- 只有 `both` 拥有 paired Issue 的持续同步授权；`local` 和 `issue` 的既有副作用边界保持不变。
- 同步依据是 target-specific Issue projection，而不是整个 plan 的文本 diff。只有问题、重要性、外部约束、非目标、已有证据或可观察完成状态的变化进入 Issue。
- 新建 paired Issue 从首次写入起携带 managed block。用户显式提供的 Issue、旧版本创建且没有有效标识的 Issue均视为未受管；首次发现时返回 `conflict`，只有用户在后续请求中明确授权 adoption 才能把现有事实合并进受管区并建立摘要基线。
- managed block 的摘要覆盖 canonical title、记录在 marker 中的单一 change type 和 managed body；无关 labels、评论及 block 外正文不参与摘要，因此可由人继续维护。
- managed title、type 或 body 在 Plan 外被修改会使摘要失配；Plan 必须 fail closed，不做自动三方合并或覆盖。
- 同一 canonical Issue 内成功更新返回 `updated`，问题投影相同返回 `unchanged`，所有权或并发基线不满足返回 `conflict`。每次 edit attempt 后只按 canonical URL 回读一次：目标摘要匹配为 `updated`，非成功调用且原状态完整保留为 `failed`，部分或其他状态为 `unknown`，绝不盲目重试。
- 如果修订导致问题身份改变、拆分或合并，Plan 在任何远程 mutation 前停止；建立新 Issue identity、解除旧关联或关闭旧 Issue需要新的明确决定。

## Public surface changes

- `/plan` 与 `/plan both` 在重写已有 paired plan 时，可以让同一 canonical Issue 的问题记录跟随已确定的问题语义变化。
- 仅修改实施方案时，paired Issue 可观察结果为 `unchanged`，不会产生无意义的 GitHub edit。
- paired Issue 发生人工编辑、所有权不明或问题身份变化时，Plan 返回明确 `conflict`，不再把过时 Issue 静默报告为正常 `reused`。
- `both` 的 Issue 结果扩展为 `created`、`unchanged`、`updated`、`conflict`、`failed` 或 `unknown`；前三者为整体 `success`，后三者在本地 plan 已完成时为 `partial`。

## Spec delta

- MODIFIED `both target local-first 并建立唯一 Issue 关联`：保留 local-first 和唯一 canonical identity，但已有 paired Issue 在所有权、并发和同一问题条件成立时允许受控更新；失败或冲突仍保留有效本地 plan 并返回 `partial`。
- MODIFIED `一个 local plan 最多关联一个 Issue`：唯一性约束 canonical identity，不再禁止同一 identity 的 problem record 修订。
- MODIFIED `产物共享意图且不重复确认`：`both` 每次从同一 settled problem 生成当前 Issue projection，只在 projection 变化时更新受管内容。
- ADDED `paired Issue 受控同步且保护外部编辑`：Plan-created paired Issue 必须携带可验证 managed block；摘要匹配时才能编辑受管 title/type/body，缺失或失配返回 conflict，每次 edit 只允许一次 read-after-write reconciliation。
- MODIFIED `Issue 保持安全且范围有限`：删除绝对“不得编辑既有 Issue”，改为只有 `both` 可更新已证明由 Plan 管理的 paired Issue，并继续禁止其他 Issue 生命周期和项目管理 mutation。

## Regression tests

- `tests/plan-paired-issue.test.ts` 新增 `separates stable Issue identity from mutable managed problem content` 与 `updates only the Issue-owned projection`：当前 `never edit an existing Issue`、`reused without editing` 和 description exclusion 作为失败信号；修复后要求 `local`/`issue` 仍不编辑、`both` 支持 managed `unchanged`/`updated`/`conflict`，且 implementation-only revision、identity change 与 Issue-owned projection 的边界明确。
- `tests/plan-paired-issue.test.ts` 增加 paired sync transcript：覆盖新建 managed block、相同 projection 无 mutation、摘要匹配更新及回读、block 外人工内容保留、无关 labels 保留、managed 内容被人工修改后 conflict、legacy marker 缺失 conflict、change-type label 受控切换，以及失败、完整成功和部分远程状态的一次 reconciliation。
- `tests/plan-issue-harness.test.ts` 继续证明 `issue` target 零项目写入、首错停止与 create ambiguity 语义没有回归，并证明 paired update 的临时 body file 在全部终止路径清理。

## Implementation steps

1. 先把稳定 identity、可变 problem record 和 update safety 固化为会对当前绝对禁止编辑行为失败的契约测试。
   - outcome: tests 明确区分 `local`、纯 `issue` 和 `both`，锁定 paired create/no-op/update/conflict/ambiguous 状态与 implementation-only revision 不写远程的行为。
   - scope: `tests/plan.test.ts`, `tests/plan-issue-harness.test.ts`, `tests/plan-paired-issue.test.ts`
   - verify: `pnpm exec vp test run tests/plan.test.ts tests/plan-issue-harness.test.ts tests/plan-paired-issue.test.ts` 在 runtime contract 未修改时因缺少 update、managed marker 和 conflict 语义而失败。
2. 收窄主 Plan 的“不得编辑既有 Issue”边界，并把 paired revision 路由到 `both` 专属事务。
   - outcome: `skills/plan/SKILL.md` 将 canonical identity 与可修订内容分离；`target-local.md` 保持零 GitHub mutation，`target-issue.md` 保持 create/reuse-only，`target-both.md` 定义 existing paired plan 的读取、projection comparison、同一问题判断、managed ownership preflight 与完整结果语义。
   - scope: `skills/plan/SKILL.md`, `skills/plan/references/target-local.md`, `skills/plan/references/target-issue.md`, `skills/plan/references/target-both.md`
   - verify: `pnpm exec vp test run tests/plan.test.ts` 通过 target ownership、identity、result 与 no-fallback 契约断言。
3. 为 paired Issue 定义可验证且不覆盖人工扩展的 managed problem-record envelope。
   - outcome: `issue-formats.md` 保持四种 problem-oriented schema，并补充只供 `both` 包装的 versioned managed block、canonical digest 输入与受管/非受管字段边界；创建和更新都使用项目外安全 body file，`gh issue edit --body-file` 只在摘要校验成功后执行。
   - scope: `skills/plan/references/issue-formats.md`, `skills/plan/references/target-both.md`
   - verify: `pnpm exec vp test run tests/plan.test.ts tests/plan-issue-harness.test.ts tests/plan-paired-issue.test.ts` 通过 marker round-trip、外部内容保留、label preservation、冲突及 reconciliation fixtures。
4. 同步 Plan 的公开规格与长期架构说明，不改写历史计划。
   - outcome: Spec、Resolver、README、PRODUCT 和 ARCHITECTURE 说明 Issue identity 稳定而 paired problem record 可受控修订，保留三个 targets、问题/实施职责分离及外部 mutation 授权边界；历史 plans 继续作为 point-in-time records。
   - scope: `specs/plan/spec.md`, `skills/RESOLVER.md`, `README.md`, `README.zh-CN.md`, `PRODUCT.md`, `ARCHITECTURE.md`
   - verify: `rg -n "never edit|without editing|without body edits|不得编辑既有 Issue|reused without editing" skills/plan specs/plan skills/RESOLVER.md README.md README.zh-CN.md PRODUCT.md ARCHITECTURE.md` 的剩余命中只描述 `local`、纯 `issue` 或历史上下文；`node skills/doctor/scripts/checker.ts . --json` 无活动文档漂移。
5. 完成全量验证与隔离的 GitHub transcript 验收，不制造真实远程测试垃圾。
   - outcome: 格式、类型、contract tests、mock transaction、文档链接和 skill discovery 全部通过；受控更新只由 mock/临时 fixture 验证，真实 Issue edit 除非用户另行授权 disposable repository，否则准确标为 skipped。
   - scope: `skills/plan/`, `specs/plan/`, `tests/plan.test.ts`, `tests/plan-issue-harness.test.ts`, `tests/plan-paired-issue.test.ts`, directly affected durable documents
   - verify: `pnpm check && pnpm test && pnpm lint && node skills/doctor/scripts/checker.ts . --json && git diff --check`。

## Assumptions & risks

- GitHub CLI 已提供 `gh issue view --json title,body,labels,url` 和 `gh issue edit --title --body-file --add-label --remove-label`；实现不新增依赖，也不触碰 Projects scope。
- hidden managed block 是 Plan-owned remote format。schema version 允许未来改变摘要 canonicalization；未知版本必须 conflict，不能猜测升级。
- `gh issue edit` 没有可用的 compare-and-swap 前置条件；摘要能拒绝读取时已经存在的外部修改，单次回读能识别观察到的部分写入，但不能形式化排除读取与编辑之间的极短并发窗口。
- local-first 意味着远程 update 失败后新版本地 plan 仍有效但 paired Issue 暂时过时；`partial` 结果必须明确报告这一点，不得把 association 当作已同步证明。
- 旧 Issue 与用户显式关联的外部 Issue缺少可证明的写入基线；默认 conflict 会牺牲一次自动同步，但避免用新能力覆盖历史人工内容。
- Agent 对“仍是同一个 bounded problem”的判断可能出错；identity、拆分或合并存在实质不确定性时必须走 Plan 的 intent conflict gate，而不是把判断藏在 update transaction 中。

## Verification

- command: `pnpm exec vp test run tests/plan.test.ts tests/plan-issue-harness.test.ts tests/plan-paired-issue.test.ts`
- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [x] paired plan 只改变 implementation approach、路径、顺序或验证时，canonical Issue 无 edit 调用并返回 `unchanged`。
  - [x] 同一问题的事实、影响、外部约束、非目标或 observable done 改变时，只更新原 Issue 的 managed title/type/body，URL 不变。
  - [x] block 外正文、comments、无关 labels 和项目管理字段在同步前后保持不变。
  - [x] managed 内容被外部修改、marker 缺失/未知或摘要不匹配时不发生 Issue mutation，并返回 `conflict`。
  - [x] 问题身份变化、拆分或合并不会覆写旧 Issue，也不会自动创建替代 Issue。
  - [x] 每次 edit attempt 后只按 canonical URL 回读一次；目标摘要匹配为 `updated`，非成功调用且原状态完整保留为 `failed`，部分或其他状态为 `unknown`，不重试写入。
  - [x] `local` 仍为零 GitHub mutation，纯 `issue` target 仍为 create/reuse-only，Issue 内容继续不包含实现方案。

## Assurance

- `Candidate basis`: `HEAD 2564e7d7158fa3601797245ae9f864b2b77b26ba + sha256 9435d8732377d0ad04eb2bc42b5d246434767e11a951db08f324d5efd84053e9`. Canonical bytes are exactly `utf8("HEAD\0" + HEAD + "\0TRACKED\0") || git-diff-bytes || utf8("\0tests/plan-paired-issue.test.ts\0") || test-file-bytes || utf8("\0plans/2026-08-20-fix-plan-issue-revision-sync.md\0") || normalized-plan-bytes`, where `git-diff-bytes` is the exact stdout of `git diff --binary HEAD -- .`, and `normalized-plan-bytes` is exactly `plan.replace(/^status:.*$/m, "status: <projection>").replace(/\n## Assurance\n[\s\S]*$/, "\n")`; the normalized plan ends with exactly two LF bytes, representing one trailing blank line.
- `Candidate producer`: Implement
- `Evidence and limitations`: `pnpm check` passed; the focused Plan suite passed (3 files, 32 tests); `pnpm test` passed (23 files, 210 tests); `pnpm lint` passed; Doctor returned `[]`; `git diff --check` passed. GitHub create/edit/reconciliation behavior was verified with deterministic mocks and temporary fixtures only; no real Issue was edited. GitHub Issue edit exposes no compare-and-swap precondition, so the contract can reject already observed drift and reconcile one observed post-write state but cannot formally exclude a race between read and edit.
- `Check producer`: none
- `Verdict`: not run
- `Acceptance`: not established
