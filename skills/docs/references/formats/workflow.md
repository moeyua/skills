# Workflow format — `WORKFLOW.md`

The project's development workflow, written so an agent can clearly know it and follow it. Audience is the agent (and contributors). Only for projects with workflow conventions worth stating.

## Sections

- **流程阶段 / Stages** — the ordered steps a change goes through. Seed this from the squire skill pipeline as the default backbone: shape → implement → check → docs → commit → pr. Handle explore outside that backbone: explicit explore may happen before the loop when the maintainer wants a report, while context-mode explore may run inside shape / implement / check / docs / doctor when those skills need grounding. Neither is a default workflow stage.

  Don't free-list the stages from memory — that's how steps get dropped (docs especially) and the order comes out random. Elicit by **subtract-and-add**: present the backbone with every stage defaulted in as a _proposal_, then ask the maintainer (1) which of these stages this project drops, (2) whether explicit explore is part of their process before the loop, and (3) which extra stages it adds (e.g. release, deploy) and where they slot in. The backbone is a prompt to interview against, **not a template to fill**: a default-in stage earns its place only once the maintainer confirms it — keeping it without that confirmation, or presenting it as settled fact, is the invention this guards against. _(backbone per this repo's own `WORKFLOW.md`; the ordered-stages notion per GitHub flow)_

- **各阶段约定与门禁 / Per-stage conventions & gates** — for each stage, the rules to follow and the gate that must pass to advance: the branching/naming policy (a per-project variable — record what _this_ project uses), the commit-message convention, the review gate (approval / LGTM), and what "done / mergeable" means (tests pass, CI green, no open change-requests). _(commit convention per Conventional Commits; the gate/Definition-of-Done notion is well-attested)_
- **构建与命令 / Build & commands** — exact, copy-runnable invocations with flags for setup/build, test (including how to run a _single_ test), lint/format, and release — not just tool names. _(per the AGENTS.md convention, the highest-value section for an agent audience)_

There's no single canonical "dev-workflow file" schema to copy wholesale; these three sections assemble the strongest individual anchors — GitHub flow (stages), Conventional Commits + Definition-of-Done (conventions & gates), and AGENTS.md (commands).

The backbone only guarantees the **Stages** section's completeness and order. The other two sections — per-stage conventions & gates, and build & commands — can't be seeded from it; elicit each from the maintainer per the Source below. Keep the structure identical across projects (same three sections, same stage backbone); legitimate per-project difference lives in the _content_ of conventions & commands (branch naming, commit convention, exact commands), never in a redrawn skeleton.

## Source

The maintainer's stated process. Don't infer a workflow from scattered config — record what the maintainer says the process is, or stop and ask.

## Boundary

This is the **development** workflow, not the product's user-facing flow (that leans external and isn't a memory artifact). No future / aspirational process — those go to `ROADMAP.md`.
