---
name: docs
description: "Document the project's durable truth or a user-specified project doc. Defaults to catalog-bound memory (spec / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README); can write catalog-external docs only when the user names the target. Use when a landed change should be documented, an existing doc is wrong, or the user asks for a specific project document. Not for planning (use shape), implementation (use implement), project checkups (use doctor), or agent-invented docs."
when_to_use: "document, docs, record, source of truth, behavior contract, architecture memory, roadmap, 记忆, 文档, 真源, 记录, 沉淀, 行为契约, 更新文档"
dispatch_intent: "Document durable project truth by default, or maintain a user-specified project document from authoritative sources"
---

# Docs

Docs maintains written project truth. By default it writes the durable memory catalog: spec (behavior contracts in `specs/`), ARCHITECTURE, DESIGN, WORKFLOW, ROADMAP, and README. When the user explicitly names a target path, document type, or concrete document artifact, it may also maintain catalog-external project docs. Every rule here exists so documentation stays trustworthy: it records an authoritative source, never a truth invented from vibes or guessed from implementation.

Before choosing or writing a documentation target, decide whether the project and memory context are reliable enough for that target. If not, use `explore` in context mode first: Overview before deep-dive, depth matched to the target, no Explore Report. This supplies evidence for source selection only; docs still writes from the target's authoritative source, not from inference.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: the target document reflects the project's current truth, after a change, correction, backfill, or explicit user request
- Done when: catalog target → the change is merged into the right artifact per the catalog; explicit doc target → the named document is written or updated from authoritative sources; correct → the named item reads as intended; backfill → an existing capability gets documentation from its authoritative source
- Evidence: context preflight files / commands when used + the plan's `## Spec delta` / `## Key decisions` / the user's explicit document request / the authoritative source read / documented code behavior / the before-and-after of the document
- Output: the files written + what was ADDED / MODIFIED / REMOVED (or which section) + anything that couldn't be written and why

## Two lanes

| cue in the user's message                                                                 | lane                     |
| ----------------------------------------------------------------------------------------- | ------------------------ |
| "document this change" / "record this" / right after a feat/fix is built                  | catalog-bound memory     |
| "the memory for X is wrong / out of date" / "update ARCHITECTURE …"                       | catalog correction       |
| "backfill the spec for X" / onboarding a capability that exists                           | catalog backfill         |
| "write docs/setup.md" / "update this migration guide" / "add a troubleshooting doc for X" | explicit document target |

The catalog-bound lane is the default. The catalog (`references/memory-catalog.md`) tells you **which** artifacts exist, **when** each is needed, and **where** its content comes from. Once you know the target, load the matching format spec under `references/formats/` (spec / architecture / design / workflow / roadmap / readme) and follow its Sections / Source / Boundary.

The explicit-document lane exists only when the user names the target path, document type, or concrete artifact. You may not decide on your own that the project "should have" a catalog-external doc. If the target is outside the catalog but unnamed, ask the user to name it before writing.

## Sources and anti-invention

**Anti-invention is per target and absolute**: write from an authoritative source. For catalog targets, use the Source named by the catalog/format. For explicit docs, use the user's stated intent, existing code, an approved plan, run output, or existing documentation. If that source is absent, stop and ask — don't reverse-engineer from code, don't fill from imagination.

For the **spec** target (`specs/`), the requirement sentences are written in the target project's language; literal code, paths, and identifiers stay as-is. Only structural labels stay English as scannable anchors: `## Requirements`, `### Requirement:`, `Verify:`, and the delta section names `ADDED` / `MODIFIED` / `REMOVED`.

**WORKFLOW is special** — its only authoritative source is the maintainer's own process. Use the squire pipeline as an interview scaffold: `shape → implement → check → docs → commit → pr`, with explicit explore offered as a possible pre-loop report step and context-mode explore treated as embedded grounding. Subtract-and-add per the workflow format spec; writing a full `WORKFLOW.md` without that interview is invention.

**PRODUCT is special** — docs does not author its content (it has no format file); a change to philosophy/boundaries is shape's job. Docs may at most create an empty skeleton and route back to `/shape`.

## Record: merge a spec delta

Shape writes a `## Spec delta` into the plan when a change alters behavior worth documenting. Merging is mechanical, by requirement name:

| delta section              | merge action on `specs/<domain>/spec.md`                                      |
| -------------------------- | ----------------------------------------------------------------------------- |
| `## ADDED Requirements`    | append the requirement to the domain spec                                     |
| `## MODIFIED Requirements` | replace the existing same-named requirement (keep a `(Previously: ...)` note) |
| `## REMOVED Requirements`  | delete the named requirement from the domain spec                             |

If the domain spec doesn't exist, create it with a `## Purpose` and the ADDED requirements. Read the landed code alongside the delta to confirm the contract matches what was built. Each requirement carries its own `Verify:` line.

When the plan has **no** spec delta, or a MODIFIED/REMOVED names a requirement that isn't there, stop and ask — don't reverse-engineer a contract from the code.

## Correct / backfill / explicit docs

When an artifact is wrong or stale and someone has named what it should say, edit it directly. No delta, no drift detection — a deliberate, human-aware correction. Keep the target's format; if the change is large enough to reshape the contract, that reshaping is shape's job first. PRODUCT content corrections route to `/shape`.

When a capability already exists with no plan or delta — onboarding a brownfield codebase, or documenting squire's own skills — author its memory from an authoritative behavior source: an established SKILL.md, API docs, or the maintainer's stated intent. Not reverse-engineering: record what the behavior is _defined_ to be, not what you guess the implementation does. If the only source is implementation you'd have to infer from, stop and ask.

When the user explicitly names a catalog-external document, keep the edit scoped to that document and the named purpose. Do not create sibling docs, indexes, changelogs, or release notes unless the user names them too.

## Restraint — earn the place before adding

Before adding anything to any catalog artifact, judge whether it earns a place. Content that isn't memory-worthy gets no new section, no new artifact, no new entry. For explicit docs, the user's named target earns the file's existence, but each section still needs an authoritative source and should not pad beyond the request. For how to edit once you do, reshape the touched range instead of bolting on a patch (see `references/anti-patterns.md`).

**Spec rigor (the spec target's instance)** — use the lightest level that still makes the truth verifiable:

- **Lite (default)** — a few short, behavior-first requirements, each with a `Verify:`, plus scope and non-goals. Most stay here.
- **Full (higher risk only)** — API/contract changes, migrations, security/privacy, or cross-module changes where ambiguity causes expensive rework.
- **When not to record at all** — a change with no externally observable effect has nothing to add to spec memory; skip it rather than pad `specs/`.

## When done: the core loop ends here

Once the write lands, the core loop is complete. Suggest `/commit` as the default next step — but the project's WORKFLOW owns that edge: when it defines a different delivery flow, defer to it. Docs supplies the common default, never the project's rule.

## Boundaries

- **vs shape** — the plan is _this change's how_ (ephemeral, archived); documentation is _the project's what_ (persistent, maintained). Don't restate implementation steps into durable memory.
- **vs implement** — implement writes code and tests; docs writes docs. Docs never touches code or runs git.
- **vs check** — check judges whether a change holds up; docs records what the change established. Docs doesn't judge correctness.
- **vs doctor** — doctor detects drift/gaps across the whole project (read-only); docs writes the correction. Docs acts on awareness — from doctor or a person — it never owns detection.
- **catalog vs explicit docs** — catalog docs are the default memory lane; catalog-external docs require the user to name the target.

## When to stop

Docs' failure mode is writing truth that wasn't earned — guessed, over-scoped, or copied from implementation. Stop and report in these cases:

- **In record mode the plan has no spec delta** (spec target) / **no Key decisions or stated source** (other catalog targets) — ask what to document; don't reverse-engineer from code.
- **A MODIFIED/REMOVED requirement isn't in the spec** — report it; don't silently create it.
- **The content doesn't earn a place in its catalog target** — there's nothing to add; say so.
- **The user did not name a catalog-external target** — don't invent one; ask for the target path/type/artifact.
- **The target is PRODUCT's content** — that's philosophy work; route to `/shape`.
- **You'd need to reshape intent, not just document it** — that's shape work; route back to `/shape`.
