---
name: persist
description: "Maintain the project's persistent memory — what the project currently is. Record a built change into the right memory artifact (spec / ARCHITECTURE / DESIGN / ROADMAP / README), or correct / backfill. Use when a change has landed and its contract / architecture / decision should be recorded, or an existing memory is wrong. Not for one-off change plans (use shape), implementation (use build), or project-wide drift detection (a future health skill)."
when_to_use: "persist, record, source of truth, behavior contract, architecture memory, roadmap, 记忆, 持久化, 真源, 记录, 沉淀, 行为契约, 更新文档"
dispatch_intent: "Record and maintain the project's persistent memory from change deltas and authoritative sources"
---

# Persist

Persist maintains the project's **persistent memory** — the source of truth for what the project _currently is_, not how any one change got made. The recommended memory set lives in one place, `references/memory-catalog.md`: spec (behavior contracts in `specs/`), ARCHITECTURE, DESIGN, WORKFLOW, ROADMAP, README. Every rule here exists so that **memory stays trustworthy**: each artifact records what an authoritative source actually says, never a contract or a structure reverse-engineered from a guess. Persist runs at the tail of the loop, after a change is built and validated; it records what landed, it doesn't redesign it.

Unfamiliar project? Run `/explore` first — writing memory for a system you haven't mapped invents a truth nobody agreed to.

The memory catalog is the single source for **which** artifacts to maintain, **what** each holds, **where** its content comes from, and **what** it must not hold. Read `references/memory-catalog.md` and act per the target's entry; don't carry a hardcoded list in your head.

For the **spec** target (`specs/`), the requirement **sentences** — including the RFC 2119 modal verb (SHALL/MUST → 必须, SHOULD → 应当, MAY → 可以) — are written in the target project's language; literal code, paths, and identifiers stay as-is. Only the **structural labels** stay English as scannable anchors: the `## Requirements` / `### Requirement:` headers, the `Verify:` field, and the delta's `ADDED` / `MODIFIED` / `REMOVED` section names. (squire's own `specs/` are for the maintainer, so their sentences are Chinese like README/ARCHITECTURE, under English structural labels.)

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: the catalog artifact(s) reflect the project's current truth, after a change or a correction
- Done when: record → the change is merged into the right artifact per the catalog; correct → the named item reads as intended; backfill → an existing capability gets memory from its authoritative source; each artifact follows its catalog format
- Evidence: the plan's `## Spec delta` / `## Key decisions` / the authoritative source read / the code whose behavior is being recorded / the before-and-after of the artifact
- Output: the files written + what was ADDED / MODIFIED / REMOVED (or which section) + anything that couldn't be written and why

## Three modes (routed by the message)

| cue in the user's message                                            | mode     |
| -------------------------------------------------------------------- | -------- |
| "record this" / "persist the spec" / right after a feat/fix is built | record   |
| "the memory for X is wrong / out of date" / "update ARCHITECTURE …"  | correct  |
| "backfill the spec for X" / onboarding a capability that exists      | backfill |

record and correct run **after** shape — you record a change shape already planned, or correct an artifact you've realized (shaped) is wrong. backfill onboards a capability that predates any squire plan, reading an authoritative source. In no mode does persist author truth from raw, un-shaped intent or from guessing at implementation.

## Pick the target, then load its format

The catalog (`references/memory-catalog.md`, the index) tells you **which** artifacts exist, **when** each is needed, and **where** its content comes from. Once you know the target, **load its format spec — the matching file under `references/formats/` (spec / architecture / design / workflow / roadmap / readme) — and follow its Sections / Source / Boundary.** Load only the target you're writing; the formats are split per document precisely so you read one, not six.

**Anti-invention is per target and absolute**: write from the Source the format names; if that source is absent, stop and ask — don't reverse-engineer from code, don't fill from imagination. If the target doesn't exist yet, create it (create-if-missing), born with real content from its source.

**PRODUCT is special** — persist does not author its content (it has no format file); a change to philosophy/boundaries is shape's job. Persist may at most create an empty skeleton and route back to `/shape`.

## Record: merge a spec delta

shape writes a `## Spec delta` into the plan when a change alters behavior worth recording. Merging is mechanical, by requirement name:

| delta section              | merge action on `specs/<domain>/spec.md`                                      |
| -------------------------- | ----------------------------------------------------------------------------- |
| `## ADDED Requirements`    | append the requirement to the domain spec                                     |
| `## MODIFIED Requirements` | replace the existing same-named requirement (keep a `(Previously: ...)` note) |
| `## REMOVED Requirements`  | delete the named requirement from the domain spec                             |

If the domain spec doesn't exist, create it with a `## Purpose` and the ADDED requirements. Read the landed code alongside the delta to confirm the contract matches what was built. Each requirement carries its own `Verify:` line.

When the plan has **no** spec delta, or a MODIFIED/REMOVED names a requirement that isn't there, stop and ask — don't reverse-engineer a contract from the code.

## Correct: edit an existing artifact

When an artifact is wrong or stale and someone has named what it should say, edit it directly. No delta, no drift detection — a deliberate, human-aware correction. Keep the catalog format; if the change is large enough to reshape the contract, that reshaping is shape's job first. (PRODUCT content corrections route to `/shape`.)

## Backfill: record an existing capability

When a capability already exists with no plan or delta — onboarding a brownfield codebase, or recording squire's own skills — author its memory from an **authoritative behavior source**: an established SKILL.md, API docs, or the maintainer's stated intent. Not reverse-engineering: record what the behavior is _defined_ to be, not what you guess the implementation does. If the only source is implementation you'd have to infer from, stop and ask. When backfilling many at once, confirm domain split and granularity with the user first, and keep each spec Lite.

## Restraint — earn the place before adding

Before adding anything to any artifact, judge whether it earns a place. Content that isn't memory-worthy gets no new section, no new artifact, no new entry — across every target (spec / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README), not only spec. Padding an artifact with sub-worthy content is how a memory system decays into an unmaintained second copy of the code; when in doubt whether something earns its place, it doesn't — say so and skip it. This restrains _whether_ to add; for _how_ to edit once you do, reshape to the whole instead of bolting on a patch (see `references/anti-patterns.md`).

**Spec rigor (the spec target's instance)** — use the lightest level that still makes the truth verifiable:

- **Lite (default)** — a few short, behavior-first requirements, each with a `Verify:`, plus scope and non-goals. **Most stay here.**
- **Full (higher risk only)** — API/contract changes, migrations, security/privacy, or cross-module changes where ambiguity causes expensive rework.
- **When not to record at all** — a change with no externally observable effect (internal refactor, a rename, a perf tweak that holds behavior) has nothing to add to spec memory — skip it rather than pad `specs/` with entries that rot.

## Boundaries

- **vs shape's plan** — the plan is _this change's how_ (ephemeral, archived); memory is _the project's what_ (persistent, maintained). Don't restate implementation steps into memory.
- **vs build** — build writes code and its tests; persist writes the project's durable memory. Persist never touches code or runs git.
- **vs verify** — verify checks a change holds up (review / test / e2e); persist records what the change established. Persist doesn't judge correctness.
- **vs a future health skill** — health _detects_ drift/gaps across the whole project (read-only); persist _writes_ the correction. Persist acts on awareness — from health or a person — it never owns detection.
- **vs README / interface docs** — README is in the catalog (its entry projection); changelog / release notes / API reference docs are out (PRODUCT.md boundary #2/#3).

## When to stop

Persist's failure mode is writing truth that wasn't earned — guessed, or copied from implementation. Stop and report in these cases:

- **In record mode the plan has no spec delta** (spec target) / **no Key decisions or stated source** (other targets) — ask what to record; don't reverse-engineer from code.
- **A MODIFIED/REMOVED requirement isn't in the spec** — report it; don't silently create it.
- **The content doesn't earn a place in its target** (a change with no externally observable behavior for spec, a sub-worthy detail for any other artifact) — there's nothing to add; say so.
- **The target is PRODUCT's content** — that's philosophy work; route to `/shape`.
- **The target is outside the catalog** (changelog / release notes / API reference) — refuse and say it's out of scope (PRODUCT.md boundary #2/#3).
- **You'd need to reshape, not just record** — that's intent work; route back to `/shape`.
