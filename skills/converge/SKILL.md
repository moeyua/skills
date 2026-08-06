---
name: converge
description: "Converge a project's six durable memories (spec / PRODUCT / ARCHITECTURE / DESIGN / ROADMAP / README) to the current Skills formats: judge each document's state, apply the matching action per document, idempotently. Use when onboarding a project to Skills, completing a half-covered doc set, or realigning docs after a Skills upgrade. Not for single-target doc fixes (use docs), read-only checkups (use doctor), or making product decisions (use shape)."
allowed-tools: "Bash(node *), Bash(git status*)"
---

# Converge

Converge aligns a project's whole durable-memory catalog with the currently installed Docs formats. It judges and acts per document; an empty, partial, hand-written, or previously converged project uses the same idempotent model.

## Load sibling truth

Resolve the co-installed Docs memory catalog and format files, plus Doctor's deterministic checker, relative to this Skill. They are assets, not chained outcomes. If Docs or Doctor is missing, stop without writing rather than reconstructing its contract from memory. If Node 24+ is unavailable, report the checker skip and continue with other evidence.

Read `references/states.md` for the per-document state model and action mapping.

## Preserve content and authority

Existing authored content is authoritative. Re-shell format without losing it, fill only from an allowed source, and surface content-versus-code conflicts for the maintainer instead of choosing silently.

When PRODUCT or Specs do not exist at all, maintainer answers may supply initial truth; code only corroborates it. Missing authority stays visibly missing. Once a document exists, focused maintenance belongs to Docs and new product intent belongs to Shape.

When the source is explicit and no authored meaning can be lost, re-shelling and gap filling are mechanical parts of the authorized convergence outcome and may proceed across the catalog. Stop for maintainer direction only when sources conflict, an edit could lose authored content, a claim would introduce new product intent, or the required authority is missing; unaffected files may continue.

## Boundary and finish

Converge writes only applicable catalog documents and, when needed, a `plans/` directory skeleton. It does not install host configuration, touch catalog-external docs, audit dependencies/CI, or perform delivery.

Immediately rerunning a completed convergence must produce no diff. Report each document's state, action or skip reason, declined/stopped files, and the idempotence evidence.
