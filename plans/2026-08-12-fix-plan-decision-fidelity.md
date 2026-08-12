---
mode: fix
title: 修正 Plan 的决策与范围保真
created: 2026-08-12
status: done
issue: https://github.com/moeyua/skills/issues/40
---

# 修正 Plan 的决策与范围保真

## Building

让 Plan 把当前对话中已经明确或达成一致的决定、约束与非目标作为后续产物的强约束：常规仓库事实和可逆实现细节仍由 Plan 自主补全；只有经检查的新事实证明既定决定不可行、相互矛盾或带来实质风险时才重新打开，并在创建任何产物前向用户说明原决定、新证据及影响。与目标无关的旁支和可选优化不进入计划，每个实施步骤都能追溯到既定目标、验收结果或完成它所必需的支撑工作。

## Not building

- 不要求 Plan 对既定决定绝对服从；有实质新证据时仍允许重开，但不得静默修改。
- 不把仓库可回答的事实、既有实现惯例或可逆微观实现选择重新交给用户，也不增加固定的二次确认或理解卡。
- 不改变 `local`、`issue`、`both` 的选择、默认值、cardinality、GitHub identity、label、事务、失败或回退语义。
- 不改变 Issue 的 problem-record 边界，不要求纯 `issue` target 先确定解决方案或完整验收。
- 不新增 Plan 专用 bench、公共 skill 或通用决策账本格式；现有契约测试和一次针对性 dogfood 验证足以覆盖本次边界修正。

## Root cause

`skills/plan/SKILL.md:24-26` 把当前对话作为未分级证据并要求 Plan 补齐所有实施成熟度缺口，却没有把已定决定声明为约束或定义实质冲突的停止路径；`skills/plan/references/target-local.md:16` 的开放式 scope grounding 与 `skills/plan/references/plan-template.md:55-67` 缺少来源可追溯性的扩展入口因此允许 Plan 静默重做决定并放大局部问题，而 `tests/plan.test.ts` 现有断言只保护 target、Issue 内容和事务边界，无法使这些行为失败。

## Key decisions

- “既定决定”包括用户明确表态、已同意的 Shape 结论、明确的约束与非目标；Plan 自己从含糊上下文推测出的偏好不获得同等地位。
- “新证据”限于检查得到的仓库事实、现有契约或权威资料，且必须足以证明旧决定不可行、矛盾或存在实质风险；另一个看似更完整的方案、agent 偏好或可选优化都不算新证据。
- 新发现只有三种处理：与方向一致的必要事实按比例纳入；旁支或可选优化排除；实质冲突在产物写入前报告原决定、证据和影响并等待该决定重新收敛。
- 冲突停止是未解决意图门槛，不是已经明确 target 后额外增加的 prose approval gate；没有实质冲突时仍直接完成所选 artifact。
- `local` 与 `both` 使用同一范围保真门槛；`issue` 继续允许方案未知，但不得改变用户给定的问题、条目边界或可观察结果。
- 每个实施步骤和条件段都必须服务于 `Building`、已知验收或必要支撑工作；偶然发现和“顺便完善”不得因为模板存在对应段落就获得计划篇幅。

## Public surface changes

- Plan 不再静默推翻当前对话中已确定的结论，也不再以实施完整性为理由扩大已定范围。
- 发现会实质挑战既定决定的新证据时，Plan 在创建本地计划或 Issue 前暴露冲突；普通事实补全和可逆实现选择仍无需确认。
- 本地计划的步骤与条件段具有目标可追溯性，局部问题只获得完成既定结果所需的篇幅。

## Spec delta

- ADDED `plan 保持既定决策与范围`：Plan 把用户明确决定、已同意方向、约束与非目标作为 artifact 约束；只有实质新证据可使其重开，且重开前必须报告冲突并停止产物写入；旁支和可选优化不得进入范围。
- MODIFIED `产物共享意图且不重复确认`：已明确 target 与同范围意图时仍不得增加审批门槛，但发现会改变既定结果、范围、公开行为、难逆架构或验收的证据不属于重复确认，必须在 artifact mutation 前解决。
- MODIFIED `仅 local 与 both 产出本地方案`：每个实施步骤与条件段必须可追溯到既定目标、验收或必要支撑工作，不能把偶然发现或可选完善提升为计划范围。

## Regression tests

- `tests/plan.test.ts` 新增 `preserves settled decisions and surfaces material conflicts before artifacts`：当前合同会因缺少 settled-decision 约束、有效新证据定义、禁止静默修改及冲突前置停止而失败；修正后同时证明常规仓库事实和可逆实现选择不会触发冗余确认。
- `tests/plan.test.ts` 新增 `keeps local plan scope proportional and traceable`：当前 `local` contract 和模板会因没有禁止新增范围、步骤与条件段无法追溯到 Building/验收/必要支撑而失败；修正后要求 `local` 与 `both` 的范围纪律一致。
- 保留现有 target、Issue projection 与 transaction tests，证明决策保真修正没有改变默认 `both`、纯 Issue 成熟度、canonical identity、label 或事务状态机。
- 完成源码安装后执行一次针对性 dogfood：给定已经确定的方向并诱导一个可选优化时，Plan 必须排除该优化；给定与既定决定冲突的仓库事实时，Plan 必须先报告冲突且不创建 artifact。

## Implementation steps

1. 先把决策保真与比例边界固化为会对当前合同失败的测试。
   - outcome: 测试明确区分既定决定、可自主补全的实现事实、可排除旁支和必须前置暴露的实质冲突，并要求本地计划内容可追溯且不新增范围。
   - scope: `tests/plan.test.ts`
   - verify: `pnpm test -- tests/plan.test.ts` 在运行合同未修改时因缺少 decision fidelity、conflict stop 和 traceability 条款而失败。
2. 修正 Plan 的运行合同和本地 target 范围门槛。
   - outcome: 主合同保留已有 Shape 结论而不要求 Shape artifact，按三类处理新发现，并把实质冲突停止与冗余审批区分开；`local` 与 `both` 都禁止引入新范围。
   - scope: `skills/plan/SKILL.md`, `skills/plan/references/target-local.md`
   - verify: `pnpm test -- tests/plan.test.ts` 通过 settled-decision、new-evidence、conflict-stop、target parity 断言，现有 artifact 与 target tests 仍通过。
3. 收紧本地计划模板的比例与可追溯性。
   - outcome: 每个 implementation step 和 conditional section 都能指向 Building、既定 acceptance 或必要支撑工作，偶然发现与可选优化不能触发额外步骤或大段展开。
   - scope: `skills/plan/references/plan-template.md`
   - verify: `pnpm test -- tests/plan.test.ts` 通过 scope traceability 断言，现有 required core 与 mode-specific section 断言保持通过。
4. 把修正后的行为写入 Plan 的持久规格。
   - outcome: Plan spec 记录既定决定默认锁定、新证据的重开条件、冲突前置报告、非实质事实自主补全及计划内容可追溯性；现有 PRODUCT 原则无需改写。
   - scope: `specs/plan/spec.md`
   - verify: `node skills/doctor/scripts/checker.ts . --json` 不报告 Skill/Spec 配对、链接或持久文档问题；`rg -n "既定决策|新证据|静默|可追溯" skills/plan specs/plan tests/plan.test.ts` 的行为描述一致。
5. 验证完整仓库并刷新当前使用的技能快照。
   - outcome: Plan 的契约、事务和仓库检查全部通过，当前 Codex/Claude 配置读取到与仓库源码一致的新规则，并通过两类 dogfood 场景。
   - scope: `skills/plan/`, `specs/plan/`, `tests/plan.test.ts`, repository-configured global skill snapshots
   - verify: 依次运行 `pnpm test`, `pnpm lint`, `node skills/doctor/scripts/checker.ts . --json`, `pnpm run install`；安装后比较活动 Plan skill 与 `skills/plan/`，再执行 Regression tests 中的两个 dogfood 场景。

## Verification

- command: `pnpm test -- tests/plan.test.ts`
- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `pnpm run install`
- checklist (manual):
  - [x] Plan 在没有实质冲突时直接复用既定决定，不重新权衡、不改写，也不增加确认。
  - [x] 可从仓库回答的必要事实和可逆实现选择由 Plan 自主补全，但不会被放大成新的目标。
  - [x] 旁支问题和可选优化被排除，不进入 implementation steps 或无关 conditional sections。
  - [x] 新证据实质挑战既定决定时，Plan 在任何 artifact mutation 前报告原决定、证据与影响。
  - [x] 每个计划步骤都能追溯到 Building、既定验收或必要支撑工作。
  - [x] `issue` 仍可在解决方案未知时记录边界明确的问题，默认 `both` 与 GitHub 事务语义保持不变。
