---
mode: fix
title: Simplify shape into an outcome-first adaptive protocol
created: 2026-07-21
status: done
---

# Simplify shape into an outcome-first adaptive protocol

## Building

Replace shape's fixed clarification → alternatives → grill → `Design Summary` ceremony with an outcome-first policy centered on a **material frontier**: ground facts, infer what is already settled, ask only the currently answerable decisions that could materially change scope, behavior, architecture, risk, or acceptance, recommend a direction, and synthesize an executable plan once the user's intent authorizes it. Keep the existing modes and `plans/` handoff so the rest of squire's core loop remains compatible.

The regression evidence is session `019f695e-6db7-7c91-b508-38fe6855e4dc`: already-settled consequences were repeatedly returned to the user, and an additional fixed confirmation was requested after the user had said there was nothing else to resolve.

## Not building

- No new public skill, mode, CLI flag, or automatic cross-skill chain.
- No change to the `brainstorm / fix / feat / refactor / perf` taxonomy or the `shape → implement` handoff.
- No free-form plan format that removes implementation outcomes, path-level scope, verification, or mode-specific quality bars.
- No exhaustive decision-tree interview by default; rigorous grilling remains an explicit user-requested behavior.
- No vendored content from `mattpocock/skills` and no committed copy of the user's private session transcript.
- No rewrite of bench drivers, transcript normalizers, fixture isolation, or report storage beyond what the evaluator contract requires.

## Approach

1. **Recommended — outcome-first adaptive rewrite.** Keep shape as one compatible entrypoint, replace stage choreography with a small decision policy, make plan sections conditional, and retarget bench toward grounding, proportionality, decision completeness, and implementation readiness. This fixes the observed interaction cost without weakening the important output boundaries.
2. **Surgical rollback.** Remove only the one-question grill threshold and the extra summary confirmation while retaining mandatory alternatives and the full plan template. This has a smaller diff but leaves the same stage-oriented model and would continue to manufacture work for simple or already-converged requests.
3. **Radical decomposition.** Split interviewing, design, and plan synthesis into separate public skills. This maximizes local freedom but increases routing and user cognitive load, and would require broader changes to the core loop and downstream documentation.

## Premise collapse

This plan assumes current frontier models can reliably infer obvious consequences when given clear outcome constraints and mode-specific quality bars. If forward tests show a repeatable missed-decision class, add the narrowest scenario-backed criterion at that decision boundary; restoring a global mandatory ceremony would invalidate the approach.

## Root cause

> The root cause is the ordered state machine in `skills/shape/SKILL.md:29-36` and `skills/shape/references/shaping-protocol.md:17-63`, reinforced by ceremony checks in `bench/src/checks/index.ts:94-115,169-214` and fixed-stage scoring in `bench/src/judge/prompt.ts:14-39`, forcing every request through the same questions, alternatives, grill, and confirmation even when the conversation has already settled the design.

## Key decisions

1. **Preserve the shape interface and mode taxonomy.** Simplification changes runtime judgment, not routing or downstream ownership.
2. **Use a material frontier as the question policy.** Ask the independent, currently answerable decisions whose answers materially change the result; batch related frontier questions with a recommendation for each, and defer only questions that depend on an unsettled answer.
3. **Treat facts and decisions differently.** Retrieve repository, history, test, and authoritative external facts; infer routine consequences from those facts and the user's prior statements; ask the user only for material choices they have not already delegated.
4. **Prefer synthesis over interview when intent has converged.** A detailed request, accumulated agreement, “continue,” or agreement with the recommended direction counts as authorization to produce the named-mode plan. A fixed heading, fixed wording, or second confirmation is not required.
5. **Expose alternatives only for real trade-offs.** One recommended direction is enough when the evidence strongly favors it; compare multiple approaches for consequential, hard-to-reverse, or genuinely close choices.
6. **Keep strictness at the outcome boundary.** Shape may write a named-mode plan but never implementation files or invoke implementation work; brainstorm remains conversational and writes no plan or design file.
7. **Retain mode-specific quality bars.** Fix still requires root cause and regression coverage, feat an interface boundary and acceptance scenarios, refactor behavior invariants and regression coverage, and perf a baseline, target, and measurement method.
8. **Make the plan template conditional.** Scope, implementation outcomes, verification, and the matching mode bar remain required; architecture, public surface, spec delta, rollback, alternatives, assumptions, and risks appear only when their trigger exists, with no padding sections containing `None`.
9. **Evaluate behavior quality rather than stage presence.** Bench keeps deterministic checks for write boundaries and plan completeness, while the judge assesses grounding, proportionality, material-decision coverage, recommendation quality, settled-decision reuse, and plan readiness.
10. **Keep repository source canonical.** Edit `skills/shape/` only, verify it, then refresh installed snapshots through the repository install command rather than patching `~/.agents` directly.

## Architecture

### Current → target structure

```text
Current
user → SKILL.md → shaping-protocol fixed stages → mode reference → full template → plan
                         │
                         └→ spec + checker + fixed-phase judge reward ceremony

Target
user + repository evidence
          │
          ▼
     shape/SKILL.md ──conditional──> mode reference + conditional plan template
          │                                      │
          └──────────── transcript / plan ───────┘
                                 │
scenario intent + shape spec ────┴──> outcome checks + quality judge → report
```

### Components and data flow

- `skills/shape/SKILL.md` owns the adaptive runtime policy, materiality test, authorization semantics, mode routing, and write boundary.
- `skills/shape/references/mode-*.md` own only mode-specific evidence and completion bars.
- `skills/shape/references/plan-template.md` owns the minimal required plan surface and conditional section triggers.
- `specs/shape/spec.md` records observable behavior without prescribing turn choreography.
- `bench/src/checks/` enforces mechanically knowable output boundaries; `bench/src/judge/` evaluates semantic quality against the spec and scenario intent.
- README and architecture documents explain the public flow; installed skill snapshots are refreshed from repository source after verification.

### Migration

The skill contract, shape spec, evaluator, scenarios, and durable documentation land atomically because a new runtime policy judged by the old rubric would produce misleading regressions. The targeted forward tests passed. The remaining judge calibration could not run because its fixed model, `claude-fable-5`, was retired; the maintainer explicitly accepted shipping this change uncalibrated because substituting another model would not produce a comparable baseline. This is a skipped gate, not a calibration pass.

## Public surface changes

- **Unchanged:** `/shape`, automatic triggering scope, five modes, brainstorm's conversational output, named modes' `plans/YYYY-MM-DD-<slug>.md` output, and the next-step suggestion to use implement.
- **Changed interaction contract:** shape can ask several related independent material questions in one round; it can ask none when the request is already resolved; it does not require a fixed sequence, mandatory alternative count, load-bearing checklist, or standalone summary confirmation.
- **Changed plan artifact:** core implementation steps and verification remain stable, while non-applicable sections are omitted instead of filled mechanically.
- **Changed bench contract:** reports measure outcome-oriented requirements and retain turn count as a diagnostic, but absence of a named phase is not itself a failure.

## Spec delta

```markdown
## ADDED Requirements

### Requirement: 按收敛状态自适应塑形

shape 必须先判断当前意图是已收敛、存在实质决策、缺少可检索事实,还是需要用户明确要求的严格推敲。意图已收敛时直接综合;缺少事实时先检索;只有未解决的实质决策才进入提问。

### Requirement: 只处理实质决策前沿

shape 的问题必须对应会改变 scope、外部行为或接口、难以逆转的架构、风险或验收结果的决策。当前彼此独立且前提已满足的问题可以在一轮中成批提出,每项附推荐答案;依赖未决答案的问题留到后续。

### Requirement: 已定内容直接作为输入

shape 必须把用户既有表态、已同意方向和明确授权作为后续综合的输入。用户委托判断时,shape 给出并采用有依据的推荐,同时暴露必要假设;只有新证据使旧决定失效时才重新打开该决定。

### Requirement: 真实取舍才展开 alternatives

shape 只有在存在会显著改变结果的可行路径时才比较多个 approaches;否则直接给出一个有依据的推荐。多个方案用于解释真实 trade-off,不用于满足数量格式。

### Requirement: named mode 保持专属质量门槛

named mode 的计划除公共可执行性要求外,必须满足对应门槛:fix 的根因与回归覆盖、feat 的接口边界与验收场景、refactor 的行为不变量与回归覆盖、perf 的 baseline、target 与 measurement。

## MODIFIED Requirements

### Requirement: 出方案前不写代码

shape 在整个会话中只允许产出对话结论或 named-mode plan,不得写实现、脚手架或其他项目文件,也不得调用实现工作。plan 落盘不会解锁 shape 自己继续实施。

### Requirement: brainstorm mode 不写方案文件

brainstorm 在对话中探索和收敛方向,不写 plan、design 或 spec 文件;用户明确要求进入 named mode 或产出计划后,已收敛内容可以直接成为 named-mode plan 的输入。

### Requirement: named mode 产出可执行方案文件

named mode 在意图收敛且已有用户授权时写入 `plans/YYYY-MM-DD-<slug>.md`。每一步包含 outcome、path-level scope 和 verify,不留下意图缺口;公共核心段与 mode-specific 段必需,其余段按触发条件出现。

### Requirement: 跨结构变更产出 Architecture 段

跨模块边界、引入新层或服务、或更换技术依赖时,plan 必须记录 current → target structure、组件职责与数据流以及可验证的迁移方式;未触发时省略该段。

## REMOVED Requirements

### Requirement: 一次只问一个澄清问题

由“只处理实质决策前沿”替代。

### Requirement: named mode 先展开 approaches 再写 plan

由“真实取舍才展开 alternatives”替代。

### Requirement: 逐枝 grill 推荐方案

默认塑形不再穷举所有决策分支;严格 grill 只在用户明确要求时启用。

### Requirement: plan 前 design summary gate

由“已定内容直接作为输入”和已有用户授权替代。

### Requirement: 点名最脆弱假设

假设与风险改为按实际存在与影响记录。

### Requirement: 整体与细节之间往返

该推理启发不再作为可观察流程要求。

### Requirement: 决策点把串联交回用户

由实质性、委托判断和已定内容复用规则替代。
```

## Regression tests

- `bench/src/checks/checks.test.ts`
  - Replace the current “implementation after plan is allowed” case with a case proving any implementation-file write in a shape session is a hard violation.
  - Add a case proving multiple independent questions in one user-facing round are not mechanically penalized.
  - Add a case proving a plan write does not require a literal `Design Summary` marker.
- `bench/src/judge/judge.test.ts`
  - Validate the simplified verdict schema without fixed phase segmentation.
  - Assert the prompt grades against scenario intent, materiality, redundant confirmation, and plan readiness rather than named stages.
- `bench/src/cli.test.ts` and `bench/src/report.test.ts`
  - Update fixture verdicts to the phase-free schema while preserving requirement matrices, scores, turn counts, violations, and baseline comparison.
- `bench/scenarios/feat-already-specified-plan.md`
  - Add a notes-app scenario whose initial request already fixes behavior, boundaries, persistence, search semantics, and acceptance, and explicitly asks for a plan. The expected behavior is repository grounding followed by synthesis, with no interview or second confirmation unless evidence reveals a material conflict.
- `bench/golden/case-3-redundant-confirmation/`
  - Add a synthetic normalized transcript that reproduces the generic failure shape—detailed intent, agreement, repeated summary confirmation—without copying project-specific session content.
- `bench/golden/case-1-tapnow-qrcode/manual.json`, `bench/golden/case-2-skland-token/manual.json`, and `bench/golden/README.md`
  - Regrade the existing evidence against the new requirement names and score rubric, preserve the old contract history in notes, and record the new calibration run.
- Existing repository smoke tests continue to prove all shape references resolve after `shaping-protocol.md` is removed and that shape/spec pairing remains valid.

## Implementation steps

1. Establish the interaction-cost regression surface.
   - outcome: a fully specified feature scenario and a synthetic redundant-confirmation gold case make “synthesize settled intent” and “do not reconfirm” directly observable without committing private conversation content.
   - scope: `bench/scenarios/feat-already-specified-plan.md`, `bench/golden/case-3-redundant-confirmation/`, `bench/src/scenario.test.ts`, `bench/golden/README.md`
   - verify: `pnpm test -- bench/src/scenario.test.ts`; run the new scenario once against the current skill and retain the gitignored report as the before-fix baseline.
2. Replace ceremony-oriented mechanical checks with output-boundary checks.
   - outcome: the checker allows dependency-aware question batches and plans without a literal summary marker, removes `multi-question` and `design-gate-skipped`, and flags every write outside the allowed shape output surfaces even after a plan exists.
   - scope: `bench/src/checks/index.ts`, `bench/src/checks/checks.test.ts`
   - verify: `pnpm test -- bench/src/checks/checks.test.ts`
3. Rewrite the installed source contract around outcome-first judgment.
   - outcome: `SKILL.md` uses the material frontier, convergence detection, delegated judgment, conditional alternatives, and accumulated authorization; `shaping-protocol.md` is removed; mode references contain only their quality bars; the plan template has a small required core and conditional sections.
   - scope: `skills/shape/SKILL.md`, `skills/shape/references/shaping-protocol.md`, `skills/shape/references/plan-template.md`, `skills/shape/references/mode-fix.md`, `skills/shape/references/mode-feat.md`, `skills/shape/references/mode-refactor.md`, `skills/shape/references/mode-perf.md`
   - verify: `pnpm test`; manually confirm no live reference points to `shaping-protocol.md` and the source skill states no fixed question, approach, or confirmation count.
4. Move the persistent contract and judge to outcome quality.
   - outcome: the shape spec contains the added, modified, and removed requirements above; the judge no longer segments fixed phases and scores evidence-grounding, proportionality, material-decision coverage, recommendation quality, settled-decision reuse, and executable output; the report and CLI keep their existing public fields other than the internal phase list.
   - scope: `specs/shape/spec.md`, `bench/src/judge/prompt.ts`, `bench/src/judge/schema.ts`, `bench/src/judge/index.ts`, `bench/src/judge/judge.test.ts`, `bench/src/cli.test.ts`, `bench/src/report.test.ts`, `bench/src/report.ts`, `bench/README.md`
   - verify: `pnpm test`; the planned `node bench/src/calibrate.ts --repeat 3` was skipped, not passed, after `claude-fable-5` was retired and the maintainer rejected a non-comparable replacement model.
5. Align human-facing documentation and remove rejected future work.
   - outcome: README in both languages and ARCHITECTURE describe adaptive synthesis and material-frontier questioning; ROADMAP no longer proposes stronger anchors for the deleted ceremony; the historical architecture section records why process compliance was replaced with outcome quality.
   - scope: `README.md`, `README.zh-CN.md`, `ARCHITECTURE.md`, `ROADMAP.md`
   - verify: `rg -n "one question|2-3 approaches|load-bearing|Design Summary|design summary gate|逐枝 grill|一次只问" skills/shape specs/shape README.md README.zh-CN.md ARCHITECTURE.md ROADMAP.md bench/README.md` returns only explicitly historical or rejected references.
6. Forward-test the adaptive policy and refresh installed snapshots.
   - outcome: simple settled intent completes without redundant user turns, unresolved independent material decisions are batched with recommendations, richer scenarios still resolve their actual risks, all repository checks pass, and the verified source is reinstalled for the configured agents.
   - scope: whole repository plus the configured skill installation targets produced by the repository install script
   - verify: `pnpm test`; `pnpm check`; targeted Codex-driver forward runs for `feat-already-specified-plan` and `feat-note-pinning`; `pnpm run install`

## Verification

- passed: `pnpm test`
- passed: `pnpm check`
- skipped, not passed: `node bench/src/calibrate.ts --repeat 3` — fixed judge model `claude-fable-5` was retired; another model would not provide a comparable calibration.
- passed via the Codex driver with the unavailable Claude judge excluded:
  - `feat-already-specified-plan` × 2
  - `feat-note-pinning` × 2
- checklist (manual):
  - [x] A complete request can go directly from repository grounding to a named-mode plan.
  - [x] Related independent material questions appear in one comprehensible round with recommendations.
  - [x] Repo-answerable facts are retrieved instead of asked.
  - [x] “You decide” produces an explicit recommendation and assumption, not another approval loop.
  - [x] Settled decisions are reopened only when new evidence invalidates them.
  - [x] Multiple approaches appear only where a real consequential trade-off exists.
  - [x] Shape never writes implementation files, including after writing a plan.
  - [x] Brainstorm still writes no plan or design file.
  - [x] Every named mode still satisfies its mode-specific evidence and verification bar.
  - [x] Bench score is defined around a grounded, proportionate, implementation-ready result rather than named stage coverage; live judge calibration remains skipped as recorded above.

## Rollback

Land the runtime contract, spec, evaluator, scenarios, gold rubric fixtures and calibration record, and docs as one reversible change. If forward tests show materially worse under-questioning or plan readiness, revert that change as a unit and run `pnpm run install` again to restore installed snapshots. `bench/results/` remains gitignored, so generated comparisons require no repository cleanup.

## Risks & Unknowns

- **Under-questioning replaces over-questioning:** mode-specific bars and scenarios ensure root cause, interface, invariants, or measurement evidence is still present when the mode requires it.
- **Batching becomes overwhelming:** only the current independent material frontier is batched; dependent or low-impact questions are excluded rather than accumulated.
- **Semantic judge remains uncalibrated:** three gold cases, evidence-turn requirements, schema tests, and the existing score tolerance define the intended contract, but live variance is unknown because `claude-fable-5` was retired. The calibration record and PR test plan must keep this limitation explicit.
- **Historical scores stop being directly comparable:** record the rubric transition in `bench/golden/README.md` and start a new baseline series instead of comparing scores across contracts.
- **Conditional plan sections hide data needed by docs:** retain `## Key decisions` and `## Spec delta` whenever their triggers exist, and keep docs' current stop behavior when either required source is absent.
- **Installed snapshots drift from repository source:** source remains canonical and installation is the final verified step.
- No blocking unknowns remain.
