# Workflow format — `WORKFLOW.md`

The project's development workflow, written so an agent can clearly know it and follow it. Audience is the agent (and contributors). Only for projects with workflow conventions worth stating.

## Sections

- **流程阶段 / Stages** — the steps a change goes through in this project, in order.
- **各阶段约定 / Per-stage conventions** — what's expected at each step (branching, tests, review gates, what blocks merge).
- **工具与命令 / Tools & commands** — the concrete commands the workflow runs on (build / test / lint / release).

## Source

The maintainer's stated process. Don't infer a workflow from scattered config — record what the maintainer says the process is, or stop and ask.

## Boundary

This is the **development** workflow, not the product's user-facing flow (that leans external and isn't a memory artifact). No future / aspirational process — those go to `ROADMAP.md`.
