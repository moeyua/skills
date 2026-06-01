# Plan File Template

The structure think writes to `plans/YYYY-MM-DD-<slug>.md` when it enters a named mode.

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

## Public surface changes

Changes to API / schema / config / CLI / file interfaces. If none → "None".

## Spec delta

If this change alters externally observable behavior, state the change to the persistent `specs/<domain>/spec.md` as a delta, for the spec skill to crystallize after build. If it changes no observable behavior (pure refactor / perf holding behavior) → "None".

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

Each step must:

- be independently verifiable
- not depend on a step not yet written
- contain no placeholder ("TBD" / "TODO" / "implement later" are all red flags)

1. <step>
   - change: <file:line or description>
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

- `draft`: think just wrote it, waiting for the user to approve
- `approved`: changed after the user says "implement this plan"
- `done`: changed after implement + review + commit complete (updated by the implement / review skill)

In v1, support `draft` / `approved` first; leave `done` to v2, handled by the review skill.
```
