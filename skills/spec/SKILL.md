---
name: spec
description: "Maintain the persistent specs/ source of truth — record a built change's spec delta into the persistent specification, and correct existing specs on demand. Use when a feature has landed and its behavior contract should be recorded, or when an existing spec has drifted and needs correcting. Not for one-off change plans (use shape), implementation (use build), or project-wide drift detection (a future health skill)."
when_to_use: "spec, specification, behavior contract, source of truth, record behavior, record spec, update spec, 规格, 规格说明, 行为契约, 真源, 记录规格, 更新规格"
dispatch_intent: "Record and maintain the persistent specs/ source of truth from change deltas"
---

# Spec

Spec maintains a persistent `specs/` source of truth — the behavior contract for what the system _currently is_, not how any one change gets made. Every rule here exists so that **the spec stays a trustworthy contract**: it records observable behavior a reader can verify, never implementation detail that rots the moment the code is refactored. Spec runs at the tail of the loop, after a change is built and validated; it records what landed, it doesn't redesign it.

Unfamiliar project? Run `/explore` first — writing a spec for a system you haven't mapped invents a contract nobody agreed to.

Spec follows the project the way any technical doc does. The requirement and scenario **sentences** — including the RFC 2119 modal verb (SHALL/MUST → 必须, SHOULD → 应当, MAY → 可以) — are written in the target project's language; literal code, paths, and identifiers stay as-is. Only the **structural labels** stay English, as scannable anchors: the `## Requirements` / `### Requirement:` / `#### Scenario:` headers, the GIVEN/WHEN/THEN bullet prefixes, and the delta's `ADDED` / `MODIFIED` / `REMOVED` section names. Don't weld an English modal into a localized sentence (`The system SHALL 做X` reads broken); write the whole sentence in one language under the English label. (squire's own `specs/` are for the maintainer, so their sentences are Chinese like README/ARCHITECTURE, under English structural labels.)

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: the persistent `specs/<domain>/spec.md` reflects the system's current behavior contract, after a change or a correction
- Done when: record → the plan's spec delta is merged into `specs/`; correct → the named requirement reads as intended; backfill → an existing capability gets a spec from its authoritative behavior source; the file follows the spec format
- Evidence: the plan's `## Spec delta` section / the code whose behavior is being recorded / the before-and-after of the spec file
- Output: the spec files written + which requirements were ADDED / MODIFIED / REMOVED + anything that couldn't be merged and why

## Three modes (routed by the message)

| cue in the user's message                                                | mode     |
| ------------------------------------------------------------------------ | -------- |
| "record this" / "record the spec" / right after a feat/fix is built      | record   |
| "the spec for X is wrong / out of date" / "update specs/auth to say ..." | correct  |
| "backfill the spec for X" / onboarding a capability that already exists  | backfill |

record and correct run **after** shape — you record a change shape already planned, or correct a spec you've realized (shaped) is wrong. backfill is different: it onboards a capability that predates any squire plan, so it has no preceding shape — but it reads an authoritative behavior source, never invents a contract. In no mode does spec author a contract from raw, un-shaped intent or from guessing at implementation.

## Spec format

A persistent spec lives at `specs/<domain>/spec.md`, organized by domain — a logical grouping (`auth/`, `payments/`, `search/`), by feature area, component, or bounded context.

```markdown
# <Domain> Specification

## Purpose

One or two lines: what this domain is.

## Requirements

### Requirement: <name>

The system SHALL <observable behavior>.

#### Scenario: <name>

- GIVEN <precondition>
- WHEN <action>
- THEN <observable outcome>
- AND <...>
```

- **Requirements are the "what"** — observable behavior, inputs, outputs, error conditions, external constraints (security / privacy / reliability / compatibility). RFC 2119 keywords carry intent: **SHALL/MUST** absolute, **SHOULD** recommended, **MAY** optional. (This is the target system's contract — it is not the squire prose style; SKILL.md prose still avoids MUST walls.)
- **Scenarios are the "when"** — concrete, testable examples in GIVEN/WHEN/THEN, covering happy path and the edges that matter.
- **The test for what belongs**: if the implementation can change without changing externally visible behavior, it does not belong in the spec. Internal class/function names, library choices, and step-by-step implementation are out — those live in the plan or the code.

## Record: merge a delta

shape writes a `## Spec delta` into the plan when a change alters behavior worth recording. The delta is structured the same way, in three sections, and merging is mechanical — by requirement name:

| delta section              | merge action on `specs/<domain>/spec.md`                                      |
| -------------------------- | ----------------------------------------------------------------------------- |
| `## ADDED Requirements`    | append the requirement to the domain spec                                     |
| `## MODIFIED Requirements` | replace the existing same-named requirement (keep a `(Previously: ...)` note) |
| `## REMOVED Requirements`  | delete the named requirement from the domain spec                             |

If the domain spec doesn't exist yet, create it with a `## Purpose` and the ADDED requirements. Read the landed code alongside the delta to confirm the contract matches what was actually built — the delta states intent, the code is the reality.

When the plan has **no** spec delta, or a MODIFIED/REMOVED names a requirement that isn't there, stop and ask — don't reverse-engineer a contract from the code or silently create what was meant to be a modification. Guessing here writes a contract nobody agreed to.

## Correct: edit an existing spec

When a spec is wrong or stale and someone has named what it should say, edit the requirement directly. This needs no delta and no drift detection — it's a deliberate, human-aware correction. Keep the format; if the change is large enough to reshape the contract, that reshaping is shape's job first.

## Backfill: spec an existing capability

When a capability already exists with no plan or delta — onboarding a brownfield codebase, or recording squire's own skills — author its spec from an **authoritative behavior source**: an established SKILL.md, API docs, or the maintainer's stated intent. This is not reverse-engineering: you record what the behavior is _defined_ to be, not what you guess the implementation does. If the only available source is implementation you'd have to infer from, stop and ask instead. When backfilling many at once, confirm the domain split and granularity with the user first, and keep each spec Lite.

## Progressive rigor — keep it lightweight

Use the lightest level that still makes the behavior verifiable:

- **Lite (default)** — short behavior-first requirements, clear scope and non-goals, a few concrete acceptance scenarios. **Most specs stay here.**
- **Full (higher risk only)** — API/contract changes, migrations, security/privacy concerns, or cross-module changes where ambiguity causes expensive rework.

**When not to write a spec at all**: a change with no externally observable effect (internal refactor, a rename, a perf tweak that holds behavior) has nothing to record — skip it rather than pad `specs/` with entries that rot. Over-fine granularity is how a spec system decays into an unmaintained second copy of the code.

## Boundaries

- **vs shape's plan** — the plan is _this change's how_ (ephemeral, archived); the spec is _the system's what_ (persistent, maintained). Don't restate implementation steps in the spec.
- **vs a future health skill** — health _detects_ drift across the whole project (read-only); spec _writes_ the correction. Spec acts on awareness — from health or from a person — it never owns detection.
- **vs README / interface docs** — those are audience-facing docs for users (out of scope, per PRODUCT.md boundary #2). A spec is a behavior contract for the loop, not a how-to-use guide.

## When to stop

Spec's failure mode is writing a contract that wasn't earned — guessed, or copied from implementation. Stop and report in these cases:

- **In record mode the plan has no spec delta** — ask which domain and what behavior to record; don't reverse-engineer it from the code. (Backfill is the deliberate no-delta mode, and even it reads an authoritative source, never guesses from implementation.)
- **A MODIFIED/REMOVED requirement isn't in the spec** — report it; don't silently create it (it was likely meant as ADDED, or the name is wrong).
- **The change has no externally observable behavior** — there's nothing to spec; say so rather than manufacture an entry.
- **You'd need to reshape the contract, not just record it** — that's intent work; route back to `/shape` instead of redesigning inside spec.
- **You want to write implementation detail into the spec** — library names, function names, steps belong in the plan or code; keep the spec to observable behavior.
