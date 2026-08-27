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
- `candidate`: Implement produced an identifiable change, evidence, and limitations; it may also carry findings and remains unaccepted
- `done`: an acceptance-scoped Check attested the same stable candidate basis

## Lifecycle transition matrix

| event                     | authority/source                                | from            | to        | verdict      | acceptance                               |
| ------------------------- | ----------------------------------------------- | --------------- | --------- | ------------ | ---------------------------------------- |
| plan-created              | Plan artifact authorization                     | none            | draft     | none         | not established                          |
| implementation-authorized | explicit user request or active Implement scope | draft/candidate | approved  | unchanged    | unchanged                                |
| candidate-produced        | Implement                                       | approved        | candidate | not run      | not established                          |
| scoped-pass               | Check                                           | candidate       | candidate | pass         | not requested                            |
| findings                  | Check                                           | candidate       | candidate | findings     | not established                          |
| inconclusive              | Check                                           | candidate       | candidate | inconclusive | not established                          |
| acceptance-pass           | independent Check                               | candidate       | done      | pass         | attested for the exact current candidate |

A status is a projection of its authorized producing event, not authority created by the plan itself. Check findings never produce implementation authorization. If Check runs inside an active Implement invocation, that existing authorization may resume repair; otherwise a new explicit implementation request is required before `candidate → approved`.

## Legacy status interpretation

| observed plan state | Assurance record                       | meaning                                   | acceptance                               |
| ------------------- | -------------------------------------- | ----------------------------------------- | ---------------------------------------- |
| done                | missing or incomplete                  | historical implementation completion only | not established                          |
| done                | complete basis-matched acceptance-pass | time-scoped exact-basis accepted snapshot | attested for the exact current candidate |

Never invent or backfill a missing candidate basis, producer, verdict, or acceptance from legacy status or artifact existence. Obtain a new Check when current acceptance is needed.

## Recorded assurance snapshot

While status is `candidate` or `done`, keep exactly one recorded `## Assurance` section in the plan:

- `Candidate basis`: a stable, independently recomputable identity for the complete claimed change;
- `Candidate producer`: Implement;
- `Evidence and limitations`: the evidence actually produced and material missing proof;
- `Check producer`: the independent Check reference when available, otherwise `none`;
- `Verdict`: `pass`, `findings`, `inconclusive`, or `not run`;
- `Acceptance`: `attested for the exact current candidate`, `not requested`, or `not established`.

The candidate basis must keep its referent after the conversation moves. In a git worktree, use the base revision plus a deterministic identity for the complete claimed diff, excluding this plan's own status and Assurance projection; use an equivalent immutable identity for another surface. Replace the recorded Assurance section when an authorized projection changes—do not append a history ledger. A `done` status records that its stored Check producer, basis, verdict, and acceptance fields formed the exact acceptance-pass row when projected.

`done` is a closed, time-scoped record for the exact accepted candidate, not proof of globally latest validity. Before claiming current acceptance, a consumer must establish that the basis still matches and use the latest applicable Check result available in its current context; if applicability cannot be established, report only the historical snapshot or obtain a new Check. A later finding supersedes the recorded pass in every context or Handoff that carries it, but read-only Check does not rewrite or reopen the plan and the finding does not authorize repair. A new explicit implementation outcome may proceed directly or use a new plan. Persisting globally latest validity would require a separately authorized writer or ledger and is outside this contract.
