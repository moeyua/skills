---
mode: fix
title: 在开发全程保持显式失败与彻底切换
created: 2026-08-26
status: done
issue: https://github.com/moeyua/skills/issues/46
---

# 在开发全程保持显式失败与彻底切换

## Building

把 fail-close 与 clean-break 纳入 Skills 对 Agent 开发行为的长期约束，并保持现有轻量上下文架构：必要条件失败、结果歧义或状态缺失时保留其真实状态，不把它们升级成成功或擅自切换路径；已授权 outcome 明确替换旧设计时，删除被取代的实现、契约与文档，不以“更安全”为由自行增加 fallback、兼容层、迁移、双路径或 legacy path。

这两项语义在 `PRODUCT.md` 的 Intent / Authority / Evidence 边界中定义一次，`ARCHITECTURE.md` 只记录跨能力投影与不变量。Shape、Plan、Implement、Check、Docs 各自保留与本能力 outcome 直接相关的短投影及匹配 Spec：连续性机制是需要 authority 的重大范围选择，Plan 不把它们补成安全默认，Implement 执行完整切换，Check 拒绝失败掩盖和未授权旧路径，Docs 只保留切换后的当前 truth。

## Not building

- 不讨论或改变 Skills 自身的版本兼容政策，也不机械删除历史 artifact 中用于准确解释状态的 `legacy` 语义。
- 不禁止由用户决定或权威项目契约明确要求的兼容、迁移、恢复或回退；缺少该 authority 时才不得自行增加。
- 不新增共享规则模块、根 `SKILL.md`、第十二个 Skill、状态 ledger、固定能力流水线、fallback 层级或事故例外清单，也不把完整原则复制进全部 11 个主 Skill。
- 不改写历史 plans、README、Resolver 或与本次 Agent 开发行为约束无直接关系的 Plan / Publish / Release 领域事务。

## Root cause

`PRODUCT.md:30-41` 只约束 intent、authority、evidence 与 attestation 的来源和声明上限，却没有明确失败、歧义或缺失状态必须保持非成功，也没有把 fallback、兼容、迁移和 legacy path 定义为需要 authority 的额外范围；同时 `skills/plan/references/plan-template.md:58` 对架构变化默认要求 “safe migration”，`skills/check/references/review.md:7` 又把 compatibility 作为无条件 review lens，使 Agent 仍可把保留旧设计解释为机械安全选择，并在 Shape、Plan、Implement、Check、Docs 之间得到不一致结果。

## Key decisions

- Fail-close 与 clean-break 是现有 Intent / Authority / Evidence 的开发行为边界，不是第五种状态、新工作流或宿主级机械 gate。
- Fail-close 按声明粒度保真：已成功部分可以准确报告，失败、歧义、缺失证据以及 `partial`、`candidate`、`inconclusive` 等较低保证状态不得被改写成更高层成功。
- Clean-break 只在已授权 outcome 明确替换或删除旧设计时生效；fallback、兼容层、迁移、双路径和 legacy path 都是额外产品范围，只有显式用户决定或权威项目契约可以建立其 authority。
- PRODUCT 保留唯一完整定义；Architecture 记录责任拓扑；主 Skill 与 Spec 只表达本能力必须采取或拒绝的行为。现有已充分表达 fail-close 的局部契约复用而不重复扩写。
- 自动化测试只保护公共契约覆盖和架构不变量；fresh-context 行为回归验证 Agent 是否真的保留失败状态并完成 clean break，不以关键词命中冒充行为证明。

## Architecture

```text
PRODUCT: fail-close + clean-break canonical boundary
                         |
                         v
ARCHITECTURE: invariant + capability responsibility
                         |
          +--------------+--------------+
          |              |              |
      Shape/Plan     Implement/Check     Docs
      settle scope    execute/attest   current truth
          |              |              |
          +--------------+--------------+
                         v
               matching Specs + evidence
```

这次变更直接替换相关能力中的含糊旧表述，不建立兼容前言、共享 fallback reference 或旧新两套契约并存路径。

## Public surface changes

- Shape 把 fallback、兼容、迁移、双路径和 legacy path 视为会改变 scope、behavior 或 architecture 的重大连续性决定；事实或 authority 不足时保持未决，已确定为替换时输出 clean-break 方向。
- Plan 只持久化已有 authority 的连续性要求；本地计划模板不再把每次架构变化都描述为需要 “safe migration”，而是只有既定契约要求时才规划 transition / migration。
- Implement 在已授权替换范围内删除 superseded code、configuration、tests 与直接受影响的 durable truth，不用 fallback 或兼容层掩盖失败，也不把失败的必要验证转换成 candidate 以上的声明。
- Check 按原始 outcome 与权威连续性契约判断 compatibility；失败掩盖、未授权替代路径或应删除而残留的旧设计产生 `findings`，证据不足保持 `inconclusive`，不得给出 acceptance pass。
- Docs 记录切换后的当前 truth 并移除 superseded claim，不以并列记录新旧设计的方式制造 legacy documentation path。

## Spec delta

- MODIFIED `Shape — 只处理实质决策前沿`：连续性机制是重大选择；缺少 authority 时不得由 Agent 以安全名义决定，已授权替换必须以 clean break 表达。
- MODIFIED `Plan — plan 保持既定决策、来源与范围`：失败、歧义和缺失状态保持可见；fallback、兼容、迁移、双路径或 legacy path 只有来自既定方向或权威项目契约时才可进入本地 plan。
- MODIFIED `Plan — 仅 local 与 both 产出本地方案`：Architecture / Rollback 等条件段只描述已授权或契约必需的 transition，不把 safe migration 当成默认完整性要求。
- MODIFIED `Implement — Agent 承接机械决策`：连续性机制不是可由 Agent 擅自决定的机械安全选择；clean-break outcome 要求移除 superseded path。
- MODIFIED `Implement — 完成状态和报告真实`：失败、歧义、缺失证据与未完成切换不得被 fallback、局部成功或较低保证 evidence 升级为完成。
- MODIFIED `Check — verdict 只覆盖实际证据`：失败掩盖与违反授权边界的旧/替代路径阻止 pass；无法判断时返回 inconclusive。
- MODIFIED `Docs — touched range 形成一致文档`：当前 truth 不保留被 clean break 取代的旧设计叙述，除非权威契约明确要求并存。

## Regression tests

- `tests/development-integrity.test.ts`（新增）建立跨能力公共契约检查：当前 PRODUCT 缺少 canonical fail-close / clean-break 边界、Implement 缺少彻底切换责任、Plan template 无条件要求 safe migration、Check review 无条件偏向 compatibility 时测试失败；修复后验证唯一产品真源、Architecture 投影、五个相关 Skill / Spec 的职责覆盖以及没有新增共享规则或根 Skill。该测试只证明 Markdown 接口存在，不声称证明 Agent 行为。
- `manual(integration) — failure remains failure`：fresh context 中让必要命令失败、必要状态缺失或外部结果歧义；Agent 必须报告 exact failed / unknown / partial / inconclusive 状态，停止依赖该状态的成功声明，并且不改走未请求的替代路径。
- `manual(integration) — authorized replacement is a clean break`：fresh context 中明确要求新设计取代旧设计且不给连续性 requirement；Shape / Plan 不补兼容或迁移，Implement 删除旧路径及直接受影响的 tests / docs，Check 把任何残留 fallback、双路径或 legacy behavior 作为 finding。
- `manual(integration) — authority controls continuity`：当用户决定或权威项目契约明确要求兼容或迁移时，Agent 可以把该要求纳入 outcome，但必须按其实际 evidence 报告失败，不得把这条 authority 扩张成其他 legacy path。

## Implementation steps

1. 先建立会对当前行为缺口失败的跨能力契约测试，并完成同类措辞扫描。
   - outcome: regression 明确区分 canonical product principle、capability projection 与 behavior evidence；当前无统一原则、默认 safe migration、无条件 compatibility lens 和缺少 clean-break execution / verification responsibility 均成为失败信号。
   - scope: `tests/development-integrity.test.ts`, `PRODUCT.md`, `ARCHITECTURE.md`, `skills/{shape,plan,implement,check,docs}/`, `specs/{shape,plan,implement,check,docs}/`
   - verify: `pnpm exec vp test run tests/development-integrity.test.ts` 在产品与能力契约未修改时因上述缺口失败；`rg -n -i "fallback|compatib|migration|legacy|fail closed|fail-close|clean break|clean-break" PRODUCT.md ARCHITECTURE.md skills specs` 的每个相关命中都被按 authority 和用途分类，不做机械关键词清理。
2. 在现有 intent-fidelity 真源中加入唯一原则，并记录轻量责任拓扑。
   - outcome: PRODUCT 用一个紧凑段落定义 fail-close 与 clean-break；Architecture 增加一条不变量并更新 Shape / Plan / Implement / Check / Docs 的责任投影，不新建状态模型、公共前言或共享 reference。
   - scope: `PRODUCT.md`, `ARCHITECTURE.md`
   - verify: `tests/development-integrity.test.ts` 证明 canonical 定义、投影和 architecture invariants 可达；`tests/skill-architecture.test.ts` 继续证明公共 Skill 集合、共享真源和无根 Skill 不变。
3. 让 Shape 与 Plan 在方向和工件阶段拒绝未授权连续性设计。
   - outcome: Shape 把 continuity path 作为 consequential choice；Plan 保留真实失败与既定 clean-break，并把 plan template 的无条件 “safe migration” 改为仅在已有 authority / contract 触发时描述 transition 或 migration。
   - scope: `skills/shape/SKILL.md`, `specs/shape/spec.md`, `skills/plan/SKILL.md`, `skills/plan/references/plan-template.md`, `specs/plan/spec.md`
   - verify: `pnpm exec vp test run tests/development-integrity.test.ts tests/plan.test.ts` 通过；人工核对 local / issue / both target、cardinality、canonical Issue 和 partial / failed / unknown 语义零漂移。
4. 让 Implement、Check 与 Docs 执行、验证并记录完整切换。
   - outcome: Implement 删除已授权替换范围内的 superseded path 且不制造 fallback；Check 的 compatibility lens 服从原始 outcome / authoritative contract，并拒绝失败掩盖或残留旧路径；Docs 只保留 authoritative current truth。
   - scope: `skills/implement/SKILL.md`, `specs/implement/spec.md`, `skills/check/SKILL.md`, `skills/check/references/review.md`, `specs/check/spec.md`, `skills/docs/SKILL.md`, `specs/docs/spec.md`
   - verify: `pnpm exec vp test run tests/development-integrity.test.ts tests/implement.test.ts` 通过；执行三组 fresh-context manual regressions 并分别记录 Agent output、candidate basis 与 Check verdict。
5. 完成全量一致性与行为验证，确认原则没有扩成规则森林或兼容政策。
   - outcome: 11 个公共能力、既有 side-effect owners、Plan / Publish / Release 的显式恢复语义和六类 durable memory 保持不变；变更只留下一个产品真源和必要的阶段投影。
   - scope: 完整 diff、受影响 Skills / Specs / tests、`PRODUCT.md`, `ARCHITECTURE.md`
   - verify: `pnpm check`; `pnpm test`; `pnpm lint`; `node skills/doctor/scripts/checker.ts . --json`; `git diff --check`；人工复核不存在 fallback 例外目录、共享前言、新 Skill、固定流水线或未授权 legacy path。

## Assumptions & risks

- 仓库产品面是 Markdown、Specs 与确定性 checker，无法提供宿主级强制；自动化契约测试与 fresh-context regressions 可以验证明确边界和观察行为，但不能证明所有模型调用都不会偏离。
- `legacy done`、Plan target failure、Publish / Release partial recovery 及 Release 已定义的通用版本策略是用于准确表达历史或权威领域事务的现有契约，不等于 Agent 为当前用户项目擅自增加 legacy implementation path；实现必须按语义判断，不能全仓替换关键词。
- 当前分支 `fix/plan-issue-revision-sync` 属于另一项已完成 candidate。后续 Implement 必须先核对 intended base 与分支归属，避免把两个 implementation candidate 混成一个 basis；本计划的创建不授权实施或交付。

## Verification

- command: `pnpm exec vp test run tests/development-integrity.test.ts tests/plan.test.ts tests/implement.test.ts`
- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [x] 失败、歧义或必要状态缺失在每个相关 capability 中保持其 exact non-success 语义，不触发未请求 fallback。
  - [x] 已授权 replacement 在 plan、implementation、tests、Check 与 directly affected docs 中形成 clean break，没有遗留双路径或 legacy behavior。
  - [x] 兼容、迁移或恢复只有在用户决定或权威项目契约建立 authority 后出现，且不会扩张成其他连续性工作。
  - [x] PRODUCT 只定义一次完整原则；Architecture 和五个相关 Skill / Spec 只投影自身责任。
  - [x] 没有新增共享规则模块、根 Skill、公共能力、固定流水线、状态 ledger、事故例外清单或 Skills 版本兼容政策。

## Assurance

- `Candidate basis`: `HEAD 5f73981bdc0c06f13fdf7ef6073f1faca49a3e46 + sha256 8e1c485d7770ce60e2a20bd2dc181b6e552bd48d70d898e4926f4875c1c2b138`. Canonical bytes are `utf8("HEAD\0" + HEAD + "\0TRACKED\0") || git-diff-bytes || utf8("\0tests/development-integrity.test.ts\0") || test-file-bytes || utf8("\0plans/2026-08-26-fix-fail-close-clean-break.md\0") || normalized-plan-bytes`, where `git-diff-bytes` is `git diff --binary HEAD -- .` excluding this plan and the untracked test, and `normalized-plan-bytes` replaces the status line with `status: <projection>`, removes `## Assurance` and everything after it, and ends with exactly two LF bytes.
- `Candidate producer`: `/root` Implement on branch `fix/fail-close-clean-break`.
- `Evidence and limitations`: `pnpm check` passed; focused development-integrity, Plan, Implement, and skill-architecture tests passed; `pnpm test` passed (24 files, 214 tests); `pnpm lint` passed; Doctor returned `[]`; `git diff --check` passed. Three read-only fresh-context behavior regressions passed: fail-close preserved exact non-success without an alternate path; authorized replacement required clean removal and made any surviving old route a finding; authoritative migration was allowed only to its stated extent, while a failed migration remained non-success and created no broader legacy path. Independent Check reread the complete diff and authoritative sources, reran focused tests (4 files, 32 tests), full tests (24 files, 214 tests), `pnpm exec vp check`, lint, Doctor, and diff checks, confirmed the old regression basis differs only by the projected verification checklist, and found no findings. Remaining limitation: Markdown contracts, structural tests, and finite fresh-context scenarios cannot guarantee every future model call follows the constraints.
- `Check producer`: `/root/acceptance_check`
- `Verdict`: pass
- `Acceptance`: attested for exact current candidate
