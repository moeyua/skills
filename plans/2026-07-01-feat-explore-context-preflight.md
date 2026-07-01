---
mode: feat
title: Explore context mode + downstream preflight
created: 2026-07-01
status: done
---

# Explore context mode + downstream preflight

## Building

Give `explore` two explicit axes: output mode (`report` for user-triggered `/explore`, `context` for embedded use by another skill) and depth (`core` / `deep`). Then make the skills that need project understanding (`shape`, `implement`, `check`, `docs`, `doctor`) use `explore` in context mode when their task lacks reliable project context, choosing core or deep from the task risk.

## Not building

- Not changing explicit `/explore` into an auto-chaining step; user-triggered explore still ends with an Explore Report and no next-step recommendation.
- Not adding CLI flags like `--deep` or `--context`; mode and depth are chosen from invocation context and natural-language/task signals.
- Not duplicating explore's Overview / Scoped Deep-dive rules inside every consumer skill; consumers call the explore skill in context mode so explore remains the single source of truth.
- Not changing each skill's final WORKFLOW next-step wording; that is the separate roadmap item for workflow handoff.
- Not changing `handoff`, `commit`, or `pr`; they do not need project-structure understanding before doing their own jobs.

## Approach

Treat `explore` as both a standalone skill and a reusable grounding procedure:

- **Report mode**: when the user explicitly invokes `/explore` or asks to understand a repo/module, run the existing Overview-first flow and emit the structured Explore Report. This preserves the user's active explore workflow.
- **Context mode**: when another skill needs reliable project facts, it invokes explore's rules internally, reads the same categories of evidence, but does not emit an Explore Report. The consumer skill carries the evidence forward in its own Evidence / output.
- **Core depth**: full Overview plus the five core scoped dimensions when a scope is known.
- **Deep depth**: core plus quality picture and history/known issues. Explicit user depth language still triggers deep in report mode; in context mode, the consumer skill chooses deep when the task is high-risk, cross-module, touches durable truth, or otherwise depends on more than structural orientation.

Consumer behavior:

- `shape`: context preflight happens before Clarify questions, so questions are based on code/docs instead of asking what the repo already answers.
- `implement`: context preflight happens before plan execution when the project/module is not already understood, but it does not replace per-step locating inside the plan scope.
- `check`: context preflight happens before review/test/e2e routing when the project is unfamiliar, so the gate is based on the project's actual structure and conventions.
- `docs`: context preflight happens before choosing/writing a memory target when the project is unfamiliar or the named target's authority/source is unclear.
- `doctor`: context preflight happens before docs-vs-code audit when the project memory layout is unfamiliar, so doctor knows what claims and artifacts exist before judging drift.

## Premise collapse

This plan assumes a prose skill can "call" another skill by naming it as required preflight and relying on the host agent to load and follow that skill. If a host cannot actually load another skill from inside the current one, the fallback is still workable: each consumer states that the agent must load `explore` and run it in context mode before proceeding. If even that is unreliable, a later mechanical layer can enforce it, but this plan keeps the first implementation at the skill-contract level because this repo's skills are prose contracts, not executable orchestrators.

## Key decisions

1. **`report` / `context` is one explore feature, not two tasks**: context mode without downstream consumers is only half an interface; the consumers define what "embedded explore" means in practice.
2. **Include `check` even though the original user list named shape / docs / doctor / implement**: `check` already has the same "unfamiliar project? run `/explore` first" smell and is explicitly listed as an explore downstream in `explore`'s description, so leaving it out would preserve the same failure mode.
3. **Keep `handoff` out**: handoff carries session state, not project understanding, and its current boundary explicitly says a project index belongs to explore.
4. **Keep explicit `/explore` report behavior stable**: preserving the user's active explore path avoids replacing an intentional report with hidden preflight.
5. **Depth is task-driven in context mode**: downstream skills may need deep exploration even when the user did not say "deep"; this matches the complaint that agents should inspect deeply when the task demands it.

## Architecture

This change crosses skill boundaries but does not introduce a new runtime layer. The target structure is a shared prose contract:

```text
explicit user request --------------> explore(report, core|deep) --> Explore Report

shape / implement / check / docs / doctor
  when context is missing or stale --> explore(context, core|deep)
                                      `-> facts stay inside the consumer skill's work/output
```

- **Components & data flow**: `skills/explore/SKILL.md` defines the mode/depth contract; consumer skills define when they invoke context mode and how they carry evidence forward; specs record the observable behavior for each skill.
- **Phased migration**: one implementation pass updates explore first, then consumers, then specs/resolver/roadmap, with tests at the end. Each pass is independently reviewable, but the feature is complete only when consumers are updated.

## Public surface changes

- `skills/explore/SKILL.md`: adds report/context modes, core/deep depth axis, and context-mode output rules.
- `skills/shape/SKILL.md`: replaces "run `/explore` first" with context preflight before Clarify when project/module context is missing.
- `skills/implement/SKILL.md`: adds context preflight to the existing preflight without weakening plan-status, clean-tree, and per-step locate rules.
- `skills/check/SKILL.md`: replaces "run `/explore` first" with context preflight before gate routing when context is missing.
- `skills/docs/SKILL.md`: replaces "run `/explore` first" with context preflight before target/source selection when context is missing.
- `skills/doctor/SKILL.md`: replaces "run `/explore` first" with context preflight before audit when context is missing.
- `skills/RESOLVER.md`: clarifies that explicit explore is a standalone report, while downstream context preflight is embedded and not a workflow node.

## Spec delta

```markdown
## MODIFIED Requirements

### Requirement: 产出结构化报告

explore 在 report mode 下必须产出含 Project Identity、Structure、Docs Inventory 的结构化报告；用户指定范围时补 Scoped Deep-dive 节，其维度组织与覆盖范围遵循 Scoped Deep-dive 与深度规则。report mode 是用户主动 `/explore` 的默认输出，报告即终点，不含下一步推荐。(Previously: explore 总是产出结构化报告。)
Verify: manual(integration)

## ADDED Requirements

### Requirement: 支持 context mode

explore 在被其他 skill 作为前置理解步骤调用时必须以 context mode 运行：遵循同一套 Overview-first、文档来源标注、不猜、Scoped Deep-dive 规则，但不产出独立 Explore Report；读取到的事实作为调用 skill 的上下文与 evidence 继续使用。
Verify: manual(integration)

### Requirement: 输出模式与深度正交

explore 必须把输出模式(report / context)与探索深度(core / deep)作为正交选择；report mode 的 deep 由用户明确深度语言触发，context mode 的 deep 由调用 skill 按当前任务风险和影响面判断触发。不提供命令行 flag。
Verify: manual(integration)
```

Consumer specs delta:

```markdown
## ADDED Requirements

### Requirement: 缺少项目上下文时先做 explore context preflight

<skill> 在自身主要工作开始前，若当前项目/模块上下文缺失、过期或不足以支撑本次判断，必须调用 explore 的 context mode 建立事实基础；调用时根据任务风险选择 core 或 deep，并把读取证据纳入本 skill 的 Evidence / 输出，而不是产出独立 Explore Report。
Verify: manual(integration)
```

Apply the consumer requirement to `specs/shape/spec.md`, `specs/implement/spec.md`, `specs/check/spec.md`, `specs/docs/spec.md`, and `specs/doctor/spec.md`, with each spec wording adapted to that skill's existing phase names and boundaries.

## Implementation steps

1. Update `skills/explore/SKILL.md`
   - outcome: explore defines report/context output modes, core/deep depth selection, and context-mode no-report behavior while preserving explicit `/explore` reports.
   - scope: `skills/explore/SKILL.md`
   - verify: read the whole file and confirm Outcome Contract, Phases, Budget awareness, Report template, and When to stop do not contradict the new mode matrix.
2. Update downstream consumer skills
   - outcome: `shape`, `implement`, `check`, `docs`, and `doctor` invoke explore context preflight when project/module facts are insufficient, each at the correct phase boundary and without auto-running later workflow skills.
   - scope: `skills/shape/SKILL.md`, `skills/implement/SKILL.md`, `skills/check/SKILL.md`, `skills/docs/SKILL.md`, `skills/doctor/SKILL.md`
   - verify: grep no affected skill still says plain "Run `/explore` first" as an external prerequisite; read each Outcome Contract/Evidence section for consistency.
3. Update specs for explore and consumers
   - outcome: behavior contracts record report/context mode, depth selection, and consumer context preflight; spec wording stays in current Chinese style with `Verify:` lines.
   - scope: `specs/explore/spec.md`, `specs/shape/spec.md`, `specs/implement/spec.md`, `specs/check/spec.md`, `specs/docs/spec.md`, `specs/doctor/spec.md`
   - verify: `pnpm test` covers skill/spec pairing and format smoke; manual read confirms no spec overclaims executable orchestration.
4. Update resolver and roadmap
   - outcome: `skills/RESOLVER.md` explains embedded context preflight as not a separate workflow node, and `ROADMAP.md` removes the completed explore/preflight item while leaving the shape rewrite and WORKFLOW handoff items.
   - scope: `skills/RESOLVER.md`, `ROADMAP.md`
   - verify: `rg 'explore.*preflight|context mode|WORKFLOW handoff|shape 重写' ROADMAP.md skills/RESOLVER.md` shows the roadmap item was only removed for this feature, not for the separate handoff item.
5. Run full verification
   - outcome: repository invariants still pass after skill/spec/resolver updates.
   - scope: whole repo
   - verify: `pnpm test`

## Verification

- command: `pnpm test`
- checklist (manual):
  - [ ] explicit `/explore` still produces a structured report and stops
  - [ ] context mode produces no standalone report
  - [ ] core/deep depth is defined once in explore and referenced by consumers
  - [ ] each consumer's preflight sits before its own judgment/execution phase
  - [ ] `implement` still locates files per step before editing
  - [ ] no skill auto-runs the next workflow step
  - [ ] roadmap still contains the separate `shape` rewrite and WORKFLOW handoff items

## Rollback

Single feature change; revert the skill/spec/resolver/roadmap edits together. Since the change is prose contract only and strictly read-only behavior, there is no external state to undo.

## Risks & Unknowns

- **Host may not truly support nested skill loading**: impact is that "invoke explore context mode" becomes an instruction the model may skip. Mitigation: consumer skills must state the preflight directly and point to explore as the source of rules; if behavior remains unreliable, a later mechanical enforcement layer belongs in a separate plan.
- **Context mode could become invisible work**: if no evidence is surfaced, users may still feel the model guessed. Mitigation: consumer skills carry the files/commands read into their Evidence or concise output, without emitting a full Explore Report.
- **Deep trigger may be overused**: agents may deep-dive by enthusiasm rather than task need. Mitigation: explore defines deep as task-risk driven in context mode and keeps report-mode deep tied to explicit user language.

## Interface boundary

- **Public API**: no code API. The public interface is prose skill behavior: `/explore` remains explicit report mode; consumer skills may invoke `explore(context, core|deep)` as preflight.
- **Inputs**: user-triggered `/explore`; downstream skill invocation with project/module context missing or stale; optional task scope; optional explicit depth language.
- **Outputs**: report mode emits Explore Report; context mode emits no report and passes evidence into the invoking skill's work/output.
- **Side effects**: none beyond reads/commands already allowed by the invoking skill; explore remains read-only.
- **Not exposed**: no flags, no user-facing subcommand syntax, no ability to pick individual deep-dive dimensions.

## Acceptance scenarios

1. Given 用户显式说 `/explore`, when explore runs, then it emits the standard Explore Report and stops without recommending the next workflow step.
2. Given 用户在陌生 repo 里说 `/shape feat X`, when shape starts Clarify, then it first invokes explore context mode, reads overview/scope facts, asks grounded clarify questions, and emits no Explore Report.
3. Given an approved plan touches a module the session has not mapped, when implement starts, then it invokes explore context mode before execution, and still reads each implementation step's scoped files before editing.
4. Given a change is ready for `/check` in an unfamiliar project, when check runs, then it invokes explore context mode before review/test/e2e routing and uses the project facts in its verdict.
5. Given `/docs` is asked to update a catalog artifact in an unfamiliar project, when docs starts, then it invokes explore context mode to understand the memory catalog/artifacts before target selection, but still writes only from authoritative sources.
6. Given `/doctor` audits a project whose memory layout is unfamiliar, when doctor starts, then it invokes explore context mode before docs-vs-code judgment and still remains read-only.
7. Given a downstream task crosses module boundaries or depends on test/history confidence, when context preflight runs, then it selects deep depth and covers quality picture plus history/known issues.
