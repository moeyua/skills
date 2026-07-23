---
mode: feat
title: Let implement finish earned durable documentation
created: 2026-07-22
status: done
issue: https://github.com/moeyua/skills/issues/28
---

# 让 implement 按需完成持久文档与最终总结

## Building

把 `/implement` 的完成语义从“代码验证 + check”扩展为“代码验证与初始 check → 有证据的 durable-docs 判断/同步 → 完整 diff 的最终 check → 全 outcome 总结”。只有已经验证的变更确实产生持久文档义务时，implement 才自动调用独立 `docs` 能力；没有义务时明确报告 `not needed`，不为流程完整感制造文档。

最终结果必须让用户直接看见实现、测试、check 轮次、文档动作和未执行边界，而不是从过程日志中自行拼接发生了什么。

## Not building

- 不让每次 implement 都运行或修改 docs，也不因为 catalog 存在就制造 section/file。
- 不允许 implement 或 docs 从代码反推产品意图；需要新产品决定、范围扩展或无权威来源时仍停止交用户。
- 不改变 standalone `/docs` 的独立可调用性、catalog、source discipline 或 anti-invention 边界。
- 不改变 standalone `/check` 的只读边界，也不让 check 自己调用 implement/docs。
- 不从 implement 自动进入 publish、release、commit、push 或 PR。
- 不新增全局 orchestrator 或把其他 public skill 变成 implement 的前置门禁。

## Approach

采用“两次质量门之间同步 docs”的条件组合：实现验证后先运行现有 check 修复闭环，确保代码行为已经站得住；随后根据显式且可审计的触发条件决定是否调用 docs；若 docs 写入，再对代码、测试与文档组成的完整 diff 运行最终 check。若最后的 in-scope 修复改变了已记录 truth，重新评估并同步 docs 后再检查，直到完整状态 holds up 或触及既有边界。

这比“代码一写完就先记文档”更可靠，因为错误行为不会在初始 check 前被持久化；也比“结尾只建议 `/docs`”更完整，因为已授权且证据充分的持久化义务能在同一 implement outcome 内真正闭环。

## Key decisions

1. **docs 触发必须可解释。** 至少满足其一才自动调用：关联 plan 有 `## Spec delta`；当前请求显式包含 catalog/named document target；已验证变更使一个现有 durable claim 不再成立。其他情况报告 `Docs: not needed — <reason>`。
2. **权威来源不因自动调用而放宽。** docs 只可使用用户/shape 的既定决定、plan delta、已验证 landed behavior 和既有契约；触发成立但 authority 不足时，implement 在该 claim 停止而不是编造。
3. **初始 check 保护行为，最终 check 保护完整交付。** 第一次 check 沿用现有 implement repair loop；docs 改动后第二次 full gate 必须覆盖完整 diff。没有 docs 写入时，初始 holds-up verdict 就是最终 gate，不重复制造相同检查。
4. **修复改变 truth 时重新同步。** 最终 check 的 in-scope repair 若改变文档所述行为，implement 必须再次调用 docs 并重跑相关验证；相同 finding 无新证据重复时沿用 no-progress 边界。
5. **docs 仍是独立 public capability。** 自动组合只属于 implement 的扩展 outcome，不使直接 `/docs` 依赖 implement，也不允许其他 skill 自动跨入 publish/release。
6. **报告以结果为中心。** 最终输出保留 plan、branch、path、verification、check-round 证据，并新增明确 docs state 与末尾 `Summary`，总结真正完成和明确跳过的动作。

## Architecture

### Current

```text
implement ──▶ implementation verification ──▶ check ⇄ in-scope repair
                                                     │ holds up
                                                     ▼
                                                   report

docs 是完全由用户另行调用的软连接节点
```

### Target

```text
implement ──▶ implementation verification ──▶ initial check ⇄ repair
                                                        │ holds up
                                                        ▼
                                              durable-docs assessment
                                                │                 │
                                           not needed         trigger earned
                                                │                 ▼
                                                │               docs
                                                │                 │
                                                │          complete-diff check ⇄ repair
                                                │                 │ truth changed
                                                │                 └────▶ docs resync
                                                ▼
                                        final evidence summary
```

`implement` 负责编排和修复；`check` 始终只读并返回 verdict；`docs` 始终只从权威来源写 catalog/named target。三个 public skill 保持独立入口，但 implement 的公开 outcome 可以在证据触发时组合后二者。

## Interface boundary

- **Actor / entry:** 用户以足够明确请求或关联 plan 调用 `/implement`。
- **Docs triggers:** plan Spec delta、请求中显式文档目标、或 verified change 使现有 durable claim 失真；触发原因必须进入报告。
- **Docs success:** docs 按自身 catalog/authority 规则更新最小必要 targets，implement 对完整 diff 获得最终 holds-up verdict。
- **No-doc success:** 没有持久义务时不调用 docs、不写文档，并准确报告判定依据；现有 code/check 完成语义保持有效。
- **Boundary:** docs 需要新意图、未授权 scope/dependency、最终 check 无进展或验证失败时，以现有 stopped 语义返回具体决定/授权需求。
- **Output:** scope、branch、plan、changes、verification、所有 check rounds、docs state、最终 verdict，以及末尾完整工作总结。

## Public surface changes

- `implement` 的 hard gate 与 outcome 新增条件性 docs 调用；原“不进入 docs”边界收窄为“不无条件或无权威进入 docs，永不进入 publish/release”。
- `implement` 的 check loop 变为初始行为 gate，并在 docs 真正写入后增加完整 diff 的 final gate。
- 最终报告新增 `Docs:` 与 `Summary:`，明确 `updated | not needed | stopped` 及其证据。
- PRODUCT、ARCHITECTURE、RESOLVER 与双语 README 对自动组合和“用户拥有宏观串联”的描述相应更新；不存在全局流水线。

## Spec delta

### `specs/implement/spec.md`

**MODIFIED Requirements**

- `实现完成后自动运行 check`：实现验证后先运行独立 check；若后续 docs 产生 diff，必须再对完整 diff 运行最终 check，standalone check 仍只读。
- `实现范围内 findings 自动修复并重新 check`：覆盖初始行为 gate 与 docs 后 final gate；修复改变 durable truth 时必须重新同步 docs 后再检查。
- `意图或范围问题退出自动闭环`：docs 需要新产品意图、scope expansion、new dependency、authority 缺失或 no progress 时同样停止并准确报告。
- `plan 状态跟随真实完成`：只有实现、验证、初始 check、必要 docs、最终完整-diff check，以及每个 plan outcome/required acceptance 全部完成后才能标记 done；必需项未完成时保持 approved 并报告。

**ADDED Requirements**

- `满足持久化触发条件时自动运行 docs`：plan Spec delta、显式文档 target 或 verified change 推翻现有 durable claim 时，implement 必须按 docs 原有 authority/catalog 边界调用 docs；否则不得制造文档。
- `文档动作具有可见判定`：每次 implement 必须报告 docs 为 updated、not needed 或 stopped，并给出触发/跳过/边界依据。
- `文档后的完整状态必须通过最终 check`：docs 有写入时，最终 verdict 必须来自覆盖代码、测试和文档完整 diff 的 check；repair 改变 truth 时重新同步。
- `最终总结覆盖完整 outcome`：报告末尾必须总结实现、验证、check、docs 与明确未执行事项，不能把过程日志当作交付说明。

## Acceptance scenarios

### Scenario: plan 带 Spec delta

- **Given** implement 使用的 plan 含明确 Spec delta，代码验证和初始 check 已通过
- **When** implement 进入完成阶段
- **Then** 它以 plan delta 与 verified behavior 调用 docs，更新最小必要 spec/投影文档，对完整 diff 再 check，并在总结中列出文档结果

### Scenario: verified behavior 使现有文档失真

- **Given** plan 没有 Spec delta，但已验证改动明确推翻现有 catalog claim
- **When** implement 评估 durable-docs impact
- **Then** 它说明该 claim 是触发源、调用 docs 修正权威 target，并把文档 diff 纳入最终 gate

### Scenario: 普通内部改动不需要文档

- **Given** 改动没有 Spec delta、没有显式文档 target，也没有使现有 durable claim 失真
- **When** 初始 check holds up
- **Then** implement 不调用 docs、不创建文件，报告 `Docs: not needed` 与理由，并直接以已有 verdict 完成

### Scenario: docs 需要新的产品决定

- **Given** durable target 的正确内容无法从用户决定、shape、plan、verified behavior 或既有契约确定
- **When** docs 尝试记录该 claim
- **Then** implement 停止并报告缺少的具体决定，不从代码猜意图，也不把 plan 标记 done

### Scenario: final check 触发会改变 truth 的修复

- **Given** docs 已写入，但完整 diff check 发现授权范围内 blocker，修复会改变已记录行为
- **When** implement 完成修复
- **Then** 它重跑相关验证、重新同步 docs、再次检查完整 diff，直到 holds up 或 no-progress boundary

### Scenario: 最终报告覆盖整项工作

- **Given** implement 完成或在边界停止
- **When** 返回结果
- **Then** 用户能从同一报告看到 branch/plan、paths、verification、check rounds、docs state、最终 verdict 和完成/跳过事项总结

### Scenario: 必需验收仍未完成

- **Given** 实现、check 与 docs 已通过，但 plan 仍有一个 required command、manual check 或 observable outcome 未完成
- **When** implement 评估 plan final status
- **Then** 它保持 `status: approved`，在总结中列出具体缺项，不以其余 gate 通过代替该验收

## Implementation steps

1. 用契约测试锁定 docs triggers、完整 diff final gate 和总结接口，并取得旧行为的 red 证据。
   - outcome: 测试要求 implement 在三个持久化触发条件下调用 docs、无触发时不写、docs 后重跑 check，并输出 Docs/Summary；旧 `does not continue into docs` 契约使目标测试失败。
   - scope: `tests/implement.test.ts`
   - verify: `pnpm exec vp test run tests/implement.test.ts` 在 skill 改写前失败，失败只来自本计划新增契约。
2. 重塑 implement 的完成协议，使初始 check、docs assessment/sync、final check 与报告形成一个有证据的条件流程。
   - outcome: frontmatter、hard gate、Outcome Contract、Automatic check loop、plan done 条件、boundaries 与 Report 共同表达新接口；standalone check/docs 的原契约不被复制或放宽。
   - scope: `skills/implement/SKILL.md`
   - verify: `pnpm exec vp test run tests/implement.test.ts` 通过，且 `rg -n "does not continue into docs|Do not call them automatically" skills/implement/SKILL.md` 无活动契约命中。
3. 从已经验证的 implement 行为同步持久契约与公共入口。
   - outcome: implement spec 合并本计划 Spec delta；PRODUCT 将条件性 docs 定义为 implement outcome 内部组合而非全局 orchestrator；ARCHITECTURE 更新数据流、不变量与当前决策；RESOLVER 和双语 README 展示 docs assessment、final gate 与总结。
   - scope: `specs/implement/spec.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `skills/RESOLVER.md`, `README.md`, `README.zh-CN.md`
   - verify: `pnpm exec vp test run tests/implement.test.ts tests/project-identity.test.ts tests/smoke/verify-skills.test.ts && node skills/doctor/scripts/checker.ts . --json`
4. 对完整 implement 变更运行项目门禁与只读 check，修复授权范围内 blocker。
   - outcome: formatting/type/lint、完整测试、Markdown 链接与 acceptance review 覆盖两个 check gate、docs authority、no-doc path、循环退出和报告；计划仅在最终 check holds up 后标记 done。
   - scope: 本计划列出的全部路径
   - verify: `pnpm check && pnpm test && pnpm lint && node skills/doctor/scripts/checker.ts . --json && git diff --check`

## Verification

- command: `pnpm exec vp test run tests/implement.test.ts`
- command: `pnpm check`
- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [x] 三类 docs trigger 都有确定证据，未触发路径不会调用 docs 或制造文档。
  - [x] docs source discipline、catalog 与 standalone interface 未被 implement 放宽或复制成第二份真源。
  - [x] docs 有写入时最终 check 覆盖完整 diff；repair 改变 truth 时会重新同步。
  - [x] docs 无写入时不重复相同 check，只准确报告 not needed。
  - [x] 最终输出总结实现、验证、check、docs 与未执行边界，且不自动 publish/release。
  - [x] plan 只有在 every outcome/required acceptance 完成后才标记 done；必需缺项保持 approved 并报告。

## Assumptions & risks

- **自动组合扩大 implement outcome。** 这是用户已经明确接受的产品决定，但必须继续保护宏观授权：只有 docs 被条件吸收，publish/release 仍由用户单独调用。
- **“现有 claim 被推翻”需要高置信判断。** implement 应引用具体 durable target/claim；不能把“也许该写文档”当触发，更不能为了证明触发而扩展成 project-wide doctor audit。
- **最终 gate 可能形成跨能力循环。** 只有 repair 真正改变已记录 truth 才重跑 docs；同一 finding 无新证据重复时必须触发 no-progress，避免 check/docs 无限往返。
- **两次 check 不是固定 ceremony。** docs 未写入时初始 check 就是最终 verdict；第二次只由新的完整 diff 触发。
