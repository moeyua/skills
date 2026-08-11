---
mode: fix
title: 修正 Plan 的 Issue 问题记录边界
created: 2026-08-11
status: done
issue: https://github.com/moeyua/skills/issues/36
---

# 修正 Plan 的 Issue 问题记录边界

## Building

让 Plan 创建的 GitHub Issue 成为稳定的问题记录：描述发生了什么、为什么需要处理、已有证据和解决后应观察到的结果，但不选择技术方案或规定实现步骤。纯 `issue` target 只需问题、仓库与条目边界足够可靠即可创建，不再要求解决方案、架构或完整验收已经确定；`both` 继续把具体实现交给本地 plan，其 Issue companion 使用同一问题记录语义。

## Not building

- 不改变 `local` / `issue` / `both` 的选择方式、默认 `both`、cardinality 或禁止 target fallback 的规则。
- 不改变 GitHub 认证、仓库解析、canonical Issue identity、label、批次 marker、逐项 ledger、首错停止、模糊结果 reconciliation 或临时文件清理语义。
- 不新增独立 Issue skill、第二套 `both` 专用 Issue schema，也不编辑既有 GitHub Issues。
- 不削弱本地 plan 的实施交接质量；路径级 scope、方案取舍、实施顺序和验证方法仍由 `local` / `both` 的本地 plan 承载。

## Root cause

`skills/plan/SKILL.md:24` 把面向实施交接的 settled outcome、scope、architecture 与 acceptance 要求共同施加给三个 target，`skills/plan/references/target-issue.md:17` 和 `:22` 又要求纯 Issue 具备 settled intent、observable acceptance 及完整非空 schema，而 `skills/plan/references/issue-formats.md:8-11`、`:52`、`:66` 没有禁止方案性内容并要求填写重构目标和测量工具，因此 agent 为通过 preflight 和 schema 校验时会阻塞尚未定方案的问题，或补入本应只存在于本地 plan 的实现方式；`tests/plan.test.ts:18-32` 和 `:316-324` 进一步锁定了这组字段而没有保护问题记录边界。

## Approach

把“问题记录”定义为 GitHub Issue artifact 的统一不变量，而不是只给纯 `issue` target 增加一套特例。主 Skill 按 target 区分成熟度：`local` / `both` 仍要求可实施方向，纯 `issue` 只要求可以准确陈述的 bounded problem。共享 Issue format 允许背景、现象或能力缺口、证据、影响、期望的可观察结果、外部约束和已知验收，但明确排除推荐方案、目标架构、待修改路径或 symbol、依赖选择、迁移设计、实施顺序和测试实施计划。已知复现或测量结果可以作为问题证据；未知方案保持未知，不转写成待执行实现步骤。

## Key decisions

- “只记录问题”采用 `what / why / observable done` 边界；用户已经确定的外部结果、约束和非目标仍可记录，因为它们定义问题而不是规定 `how`。
- 纯 `issue` 不因 solution、architecture 或完整 acceptance 尚未确定而阻塞；只有 repository、item boundary 或问题事实不足以可靠落盘时才阻塞。
- `issue` 与 `both` 共用一套 problem-oriented Issue contract；`both` 的本地 plan 是唯一承载具体实现的 artifact。
- 保留四种 change type 及单一 lowercase label，但让 schema 强调各类型的问题证据：fix 的 expected/actual，feat 的 current gap/user outcome，refactor 的 structural problem/invariants，perf 的 observed metric/baseline。不得用 target structure 或未来工具选择填充 schema。
- 测试保护产物语义和禁止项，不再把一组方案倾向明显的精确 section 顺序当作产品不变量。

## Public surface changes

- `/plan issue` 可以直接记录一个或一批边界清楚的问题，即使尚未选择实现方案或形成完整验收。
- Plan 新建的所有 GitHub Issues 都只陈述问题及可观察结果，不包含 agent 推导出的实现路径。
- `/plan local` 与 `/plan both` 的本地 plan 仍要求 settled direction；`both` 的 Issue 与本地 plan 分别承担问题记录和实施交接职责。

## Spec delta

- MODIFIED `plan 不要求先运行 shape`：`local` / `both` 以 implementation-ready change 为直接持久化门槛，`issue` 以可准确记录的 bounded development problem 为门槛；两者都不要求 shape artifact。
- MODIFIED `issue target 零项目写入并支持同仓批量`：preflight 校验可靠的问题事实、repository 和 item boundary，不把 solution、architecture 或完整 acceptance 设为创建门槛。
- MODIFIED `四种共享变更类型决定产物证据`：change type 继续决定 label 和问题证据重点，但 Issue schema 不规定目标内部结构、工具或实施方法。
- MODIFIED `产物共享意图且不重复确认`：`both` 从同一问题和期望结果渲染两个职责分离的 artifact；Issue 只投影问题，本地 plan 承载实现。
- ADDED `Issue 只记录问题而不规定实现`：所有新建 Issue 允许事实、证据、影响、外部约束和可观察完成结果，禁止推荐方案、路径级修改、技术选型、迁移设计、步骤顺序及测试实施计划。

## Regression tests

- `tests/plan.test.ts` 新增或改写 `accepts a bounded issue without a settled solution`：以当前 `target-issue.md` 的 settled intent/acceptance 门槛作为失败信号，修复后要求 solution 与完整 acceptance 不再是纯 Issue preflight 条件。
- `tests/plan.test.ts` 新增 `keeps every GitHub Issue problem-oriented`：同时读取 `target-issue.md`、`target-both.md` 与共享 format，要求二者使用同一问题记录边界，且只有本地 plan 被声明为 implementation handoff。
- `tests/plan.test.ts` 把精确 section-order 锁定替换为语义契约：四种 label/schema 仍完整存在，但共享规则明确允许的问题内容并禁止 approach、architecture、path/symbol、dependency、migration、step order 与 test-plan prescription；refactor/perf schema 不再要求 target structure 或未来工具选择。
- 保留 `tests/plan-issue-harness.test.ts` 的事务 transcript、零项目写入和临时文件清理覆盖，证明内容语义修正没有改变 GitHub mutation 状态机。

## Implementation steps

1. 先把问题记录边界固化为会对当前行为失败的 Plan 契约测试。
   - outcome: 测试直接表达纯 Issue 的较低成熟度门槛、所有 Issue 的 problem-oriented 语义、四种 change type 保留以及实现内容只属于本地 plan；旧的精确 section-order 断言被移除。
   - scope: `tests/plan.test.ts`
   - verify: `pnpm test -- tests/plan.test.ts` 在 runtime contract 尚未修改时因现有 settled acceptance、`refactor_goal` 或工具要求而失败。
2. 分离主 Plan 路由中的 target 成熟度与 artifact 职责。
   - outcome: frontmatter、主说明与 `issue` / `both` target contracts 明确 bounded problem 可以进入纯 Issue，所有 Issue 只记录问题，而 `local` / `both` 的本地文件独占实施方案；既有 target、identity 和 transaction 边界保持原样。
   - scope: `skills/plan/SKILL.md`, `skills/plan/references/target-issue.md`, `skills/plan/references/target-both.md`
   - verify: `pnpm test -- tests/plan.test.ts` 通过 target maturity 与 artifact ownership 相关断言，既有 target/ledger 断言仍通过。
3. 将共享 Issue format 收敛成 problem-oriented schema。
   - outcome: 四种 change type 继续产出事实充分、使用用户当前语言的 Issue，但 schema 不再强制发明未知信息或携带方案、目标内部结构、未来工具和实施步骤；已知 evidence 与 observable outcome 仍可保留。
   - scope: `skills/plan/references/issue-formats.md`
   - verify: `pnpm test -- tests/plan.test.ts` 通过四种 schema、label metadata、允许内容和禁止内容断言。
4. 同步 Plan 的行为规格和长期项目说明。
   - outcome: Spec 记录 target-specific maturity 与 Issue/local plan 的职责分离；Resolver、README、PRODUCT 和 ARCHITECTURE 不再把纯 Issue 描述为必须 settled 的 implementation work，并把 GitHub Issue 标为 problem record。
   - scope: `specs/plan/spec.md`, `skills/RESOLVER.md`, `README.md`, `README.zh-CN.md`, `PRODUCT.md`, `ARCHITECTURE.md`
   - verify: `node skills/doctor/scripts/checker.ts . --json` 不报告格式、链接或文档结构问题；`rg -n "settled work|Issue work items|intake Issue|implementation" skills/plan specs/plan skills/RESOLVER.md README.md README.zh-CN.md PRODUCT.md ARCHITECTURE.md` 的每个剩余命中都符合新的职责边界。
5. 验证内容修正没有破坏 Plan 的机械与事务不变量。
   - outcome: Plan 的全部契约、Issue 批次 harness、仓库 lint 和全量测试通过，且改动范围内没有保留相互矛盾的旧描述。
   - scope: `skills/plan/`, `specs/plan/`, `tests/plan.test.ts`, `tests/plan-issue-harness.test.ts`, directly affected durable documents
   - verify: 依次运行 `pnpm test`, `pnpm lint`, `node skills/doctor/scripts/checker.ts . --json`。

## Verification

- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/doctor/scripts/checker.ts . --json`
- checklist (manual):
  - [x] 一个只有可靠问题描述、但没有技术方案或完整验收的 `/plan issue` 请求不会因此被判定为 `blocked`。
  - [x] fix、feat、refactor、perf 的新建 Issue 均只包含问题事实、证据、影响、外部约束和已知的可观察结果，不出现 agent 推导的具体实现。
  - [x] `/plan both` 的 Issue 与纯 `issue` 使用同一语义，而 path-level scope、approach、architecture 和 implementation steps 只存在于本地 plan。
  - [x] 默认 `both`、target cardinality、canonical identity、label、batch ledger、首错停止和 ambiguous reconciliation 行为保持不变。
