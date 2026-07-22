# Plan File Template

Write plans to `plans/YYYY-MM-DD-<slug>.md`. A plan is an implementation handoff: include what implement cannot infer and omit sections whose trigger is absent.

## Required core

Every plan contains:

```markdown
---
mode: fix | feat | refactor | perf
title: <one-line topic>
created: YYYY-MM-DD
status: draft
issue: <canonical GitHub Issue URL; include only after success>
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

Omit the entire `issue:` line until an Issue has been created or an explicitly supplied Issue has been verified. Never write the angle-bracket example into a real plan.

Add the matching change-type sections:

- fix: `## Root cause` + `## Regression tests`
- feat: `## Interface boundary` + `## Acceptance scenarios`
- refactor: `## Behavior invariants` + `## Regression coverage`
- perf: `## Baseline` + `## Target` + `## Measurement`

## Conditional sections

Include a section only when its trigger exists; omit it otherwise.

- `## Approach` — viable paths create a consequential trade-off. Record the recommendation and why it wins.
- `## Key decisions` — non-obvious choices or constraints must survive the conversation.
- `## Assumptions & risks` — a consequential assumption, risk, or non-blocking unknown affects implementation or verification.
- `## Architecture` — the change crosses module boundaries, introduces a layer/service, or swaps a technical dependency. Describe current → target structure, responsibilities, data flow, and safe migration. Draw an ASCII diagram when more than three components exchange data.
- `## Public surface changes` — API, schema, configuration, CLI, file format, or another caller-facing interface changes.
- `## Spec delta` — externally observable behavior changes. Express `ADDED`, `MODIFIED`, or `REMOVED` requirements by persistent spec name so docs can merge them mechanically.
- `## Rollback` — external state, persistent data/schema, deployment configuration, or a migration needs prepared reversal.

Do not emit a conditional heading merely to write `None`.

## Implementation-step bar

Each step states an outcome, names path-level scope, carries an independent verification signal, follows only listed prerequisites, and contains no unresolved intent decision. Exact line locating, final wording, and micro-edit order belong to implement.

## Naming and status

Derive a short kebab-case slug such as `fix-login-loop`, `feat-rbac`, `refactor-storage-layer`, or `perf-initial-load`.

- `draft`: plan wrote the file
- `approved`: the user authorized implementation
- `done`: implement completed the work and final check loop
