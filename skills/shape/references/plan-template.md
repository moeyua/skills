# Plan File Template

Write named-mode plans to `plans/YYYY-MM-DD-<slug>.md`. A plan is an implementation handoff, so include what implement cannot infer and omit sections whose trigger is absent.

## Required core

Every plan contains:

```markdown
---
mode: fix | feat | refactor | perf
title: <one-line topic>
created: YYYY-MM-DD
status: draft
---

# <Title>

## Building

<the outcome this plan delivers>

## Not building

<explicit scope boundaries>

## Implementation steps

1. <step>
   - outcome: <what is true after the step>
   - scope: <paths or modules touched>
   - verify: <specific command or check>

## Verification

- command: `<overall command>`
- checklist (manual):
  - [ ] <observable acceptance check>
```

Add the matching mode sections:

- fix: `## Root cause` + `## Regression tests`
- feat: `## Interface boundary` + `## Acceptance scenarios`
- refactor: `## Behavior invariants` + `## Regression coverage`
- perf: `## Baseline` + `## Target` + `## Measurement`

## Conditional sections

Include a section only when its trigger exists; omit it otherwise.

- `## Approach` — multiple viable paths create a consequential trade-off. Record the recommendation and why it wins.
- `## Key decisions` — the design contains non-obvious choices or constraints that later maintainers need to understand.
- `## Assumptions & risks` — a consequential assumption, risk, or non-blocking unknown affects implementation or verification.
- `## Architecture` — the change crosses module boundaries, introduces a layer/service, or swaps a technical dependency. Describe current → target structure, component responsibilities and data flow, and a safe migration. Draw an ASCII diagram when more than three components exchange data.
- `## Public surface changes` — API, schema, configuration, CLI, file format, or other caller-facing interfaces change.
- `## Spec delta` — externally observable behavior changes. Express `ADDED`, `MODIFIED`, or `REMOVED` requirements by their persistent spec names so docs can merge them mechanically.
- `## Rollback` — the plan changes external state, persistent data/schema, deployment configuration, or uses a migration whose reversal needs preparation.

Do not emit a conditional heading merely to write `None`.

## Implementation-step bar

Each step:

- states an outcome rather than a micro-edit
- names path-level scope
- has an independent verification signal
- follows only steps already listed
- contains no unresolved intent decision

Exact line locating, final wording, and micro-edit order belong to implement. Fix-mode root-cause locations remain diagnostic evidence, not edit instructions.

## Naming and status

Derive a short kebab-case slug from the topic, such as `fix-login-loop`, `feat-rbac`, `refactor-storage-layer`, or `perf-initial-load`.

- `draft`: shape wrote the plan
- `approved`: the user invoked implement for the plan
- `done`: implement completed every step and verification
