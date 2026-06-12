# Plan File Template

The structure shape writes to `plans/YYYY-MM-DD-<slug>.md` when it enters a named mode.

Every named mode follows this common skeleton; mode-specific fields are detailed in the matching mode reference.

## File structure

````markdown
---
mode: fix | feat | refactor | perf
title: <one-line topic>
created: YYYY-MM-DD
status: draft
---

# <Title>

## Building

[one paragraph on what this plan delivers]

## Not building

[explicit out-of-scope list; prevents scope creep during implement]

## Approach

[the chosen approach + why. If there's a close-tradeoff alternative, list it briefly; otherwise omit]

## Premise collapse

[the most fragile assumption. "This plan assumes X. If X doesn't hold, Y happens."]

## Key decisions

1. <decision> — <reasoning>
2. ...

## Architecture

Required when the change crosses module boundaries, introduces a new layer or service, or swaps a tech dependency. If no trigger applies → "None" — filling it for a single-module change is padding, not rigor.

- **Current → target structure**: the shape of the system before and after. More than 3 components exchanging data → draw an ASCII diagram and look for cycles (fewer needs no diagram; drawing one is noise).
- **Components & data flow**: each touched component's responsibility and what moves between them.
- **Phased migration**: the stages from current to target, each independently shippable — they become the spine of the implementation steps (a phase that can't ship on its own is a plan red flag).

The architecture decisions this change makes belong here, explicitly — not buried inside implementation steps, and not pushed off to another mode. An unrelated drive-by refactor is still split out; this section carries only this change's own structure.

## Public surface changes

Changes to API / schema / config / CLI / file interfaces. If none → "None".

## Spec delta

If this change alters externally observable behavior, state the change to the persistent `specs/<domain>/spec.md` as a delta, for the docs skill to record after implement. If it changes no observable behavior (pure refactor / perf holding behavior) → "None".

```markdown
## ADDED Requirements

### Requirement: <name>

The system SHALL <observable behavior>.

#### Scenario: <name>

- GIVEN ... / WHEN ... / THEN ...

## MODIFIED Requirements

### Requirement: <existing name>

The system SHALL <new behavior>. (Previously: <old behavior>)

## REMOVED Requirements

### Requirement: <name>

(Deprecated because ...)
```
````

## Implementation steps

A step states the **outcome**, not the edit. Intent decisions are settled in the plan; locating the exact line, phrasing the final change, and ordering the micro-edits belong to implement. Line numbers and pre-written wording are the fastest-rotting content in a plan — any commit in between invalidates them — and they duplicate the reading implement will do anyway.

Each step must:

- state an outcome that is true once the step lands
- name its scope at path level (the files / modules it touches)
- be independently verifiable — the verify line, not edit precision, carries this
- not depend on a step not yet written
- contain no intent-level placeholder ("TBD" / "TODO" / "implement later" are all red flags; "implement locates the exact line" is not)

1. <step>
   - outcome: <what is true after this step>
   - scope: <paths / modules touched>
   - verify: <specific command or check>
2. ...

## Verification

Overall acceptance.

- command: `<specific cmd>`
- checklist (manual):
  - [ ] ...

## Rollback

If the plan turns out to be the wrong direction once built, how do you roll back? Every step that changes external state must have a rollback path.

## Risks & Unknowns

- **<risk>**: impact / mitigation
- **Unknown**: <question> — owner: <who clarifies>, blocker: yes/no

If none → "None".

## Mode-specific

Add extra fields per mode; see the matching reference:

- fix: `## Root cause` + `## Regression tests`
- feat: `## Interface boundary` + `## Acceptance scenarios`
- refactor: `## Behavior invariants` + `## Regression coverage`
- perf: `## Baseline` + `## Target` + `## Measurement`

```

## Naming the slug

Derived from the plan topic; short, readable, kebab-case:

| plan topic             | slug                     |
| ---------------------- | ------------------------ |
| fix the login loop     | `fix-login-loop`         |
| add RBAC permissions   | `feat-rbac`              |
| refactor storage layer | `refactor-storage-layer` |
| optimize first paint   | `perf-initial-load`      |

## Status field

Semantics of the frontmatter `status` field:

- `draft`: shape just wrote it, waiting for the user to approve
- `approved`: changed after the user says "implement this plan"
- `done`: changed after implement + check + commit complete (updated by the implement skill)

In v1, support `draft` / `approved` first; leave `done` to v2, handled by the implement skill.
```
