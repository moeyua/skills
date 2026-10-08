# Plan File Template

Use this template only for the `local` and `both` targets. Write plans to `plans/YYYY-MM-DD-<slug>.md`. A plan is an implementation handoff: include what implement cannot infer and omit sections whose trigger is absent. Keep scope and detail proportional to `Building`, established acceptance, and necessary supporting work.

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
- `## Architecture` — the change crosses module boundaries, introduces a layer/service, or swaps a technical dependency. Describe current → target structure, responsibilities, and data flow. Describe a transition or migration only when the settled outcome or authoritative project contract requires one; otherwise keep the replacement a clean break. Draw an ASCII diagram when more than three components exchange data.
- `## Public surface changes` — API, schema, configuration, CLI, file format, or another caller-facing interface changes.
- `## Spec delta` — externally observable behavior changes. Express `ADDED`, `MODIFIED`, or `REMOVED` requirements by persistent spec name so docs can merge them mechanically.
- `## Rollback` — external state, persistent data/schema, deployment configuration, or a migration needs prepared reversal.

Do not emit a conditional heading merely to write `None`.

## Implementation-step bar

Every implementation step and conditional section must trace to `Building`, established acceptance, or necessary supporting work. Incidental findings and optional improvements must not become steps or sections.

Each step states an outcome, names path-level scope, carries an independent verification signal, follows only listed prerequisites, and contains no unresolved intent decision. Exact line locating, final wording, and micro-edit order belong to implement.

## Naming and status

Derive a short kebab-case slug such as `fix-login-loop`, `feat-rbac`, `refactor-storage-layer`, or `perf-initial-load`.

- `draft`: plan wrote the file
- `approved`: an explicit or still-active authorized Implement outcome is executing
- `done`: the implementation the plan describes is complete and lands with the same delivery (the same PR)

## Lifecycle transition matrix

| event                     | authority/source                                | from     | to       |
| ------------------------- | ----------------------------------------------- | -------- | -------- |
| plan-created              | Plan artifact authorization                     | none     | draft    |
| implementation-authorized | explicit user request or active Implement scope | draft    | approved |
| implementation-delivered  | Implement                                       | approved | done     |

A status is a projection of its authorized producing event, not authority created by the plan itself. Implement marks `done` once the implementation is complete and the project's required automated verification passes; the status and Assurance change sit in the working tree beside the code, and Publish delivers them in the same PR. No post-merge step, hook, bot commit, or separate acceptance changes the status. Review and Verify findings never produce implementation authorization. A `done` plan is never silently replayed or reopened.

## Legacy status interpretation

| observed plan state   | implementation merged | read as  |
| --------------------- | --------------------- | -------- |
| approved or candidate | yes                   | done     |
| candidate             | no                    | approved |
| done                  | any                   | done     |

`candidate` is a retired status; read it only through this table. Establish "merged" from git history or a merged PR; a linked Issue counts only when a merged PR closed it as completed, not when it was closed as not planned or duplicate. A missing or incomplete Assurance record never makes a plan incomplete. This is interpretation only: do not rewrite legacy plan files or backfill their records.

## Recorded assurance

When Implement marks a plan `done`, keep exactly one `## Assurance` section in the plan as a record, not a gate:

- `Evidence and limitations`: tests and checks actually run, Review results, and known limitations;
- `Verify`: the optional independent Verify reference and its verdict (`pass`, `findings`, or `inconclusive`), otherwise `not run`.

Observations that cannot be automated—real devices, real system UI, platform release gates—belong in known limitations and never block `done`. Cross-platform evidence is the PR CI; name it as the source rather than waiting for its result or adding a later commit. Never suggest moving a session to another machine to collect evidence. If CI or an optional Verify reports problems before merge and the repair is authorized, fix them in the same PR and update the Assurance record; the status stays `done`. Replace the section rather than appending a history ledger. An ordinary unplanned implementation does not create this record.
