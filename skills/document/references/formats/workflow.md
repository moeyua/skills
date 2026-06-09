# Workflow format — `WORKFLOW.md`

The project's development workflow, written so an agent can clearly know it and follow it. Audience is the agent (and contributors). Only for projects with workflow conventions worth stating.

## Sections

- **流程阶段 / Stages** — the ordered steps a change goes through (e.g. branch → implement → test → review → merge → release). _(per GitHub flow)_
- **各阶段约定与门禁 / Per-stage conventions & gates** — for each stage, the rules to follow and the gate that must pass to advance: the branching/naming policy (a per-project variable — record what _this_ project uses), the commit-message convention, the review gate (approval / LGTM), and what "done / mergeable" means (tests pass, CI green, no open change-requests). _(commit convention per Conventional Commits; the gate/Definition-of-Done notion is well-attested)_
- **构建与命令 / Build & commands** — exact, copy-runnable invocations with flags for setup/build, test (including how to run a _single_ test), lint/format, and release — not just tool names. _(per the AGENTS.md convention, the highest-value section for an agent audience)_

There's no single canonical "dev-workflow file" schema to copy wholesale; these three sections assemble the strongest individual anchors — GitHub flow (stages), Conventional Commits + Definition-of-Done (conventions & gates), and AGENTS.md (commands).

## Source

The maintainer's stated process. Don't infer a workflow from scattered config — record what the maintainer says the process is, or stop and ask.

## Boundary

This is the **development** workflow, not the product's user-facing flow (that leans external and isn't a memory artifact). No future / aspirational process — those go to `ROADMAP.md`.
