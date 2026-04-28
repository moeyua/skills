---
name: concepts
description: "Core concepts for cruft-sweep — the five cruft types, the mechanical/judgment split, why architecture must be external to the code, and the rationale behind each invariant."
---

# Core Concepts

## What "Cruft" Means Here

Code that **shouldn't exist anymore** given the current architecture. Distinct from:

- **Refactoring opportunities** — code that could be better designed (out of scope)
- **Bugs** — code that's wrong (use feature-dev or debugging)
- **Tech debt that's still load-bearing** — code that's ugly but doing real work (out of scope)

Cruft has three common origins, but the cleanup logic is the same:

- **Migration residue** — old patterns left behind after architecture changes
- **Agent residue** — speculative or duplicated code from long trial-and-error sessions
- **General accumulation** — slow drift in any long-lived project

## The Five Cruft Types

Every cruft item falls into one of these. The user never sees these labels — they're internal classification. The user sees the two-layer split (Mechanical / Judgment) below.

| Type | Description | Example | Detection |
|------|-------------|---------|-----------|
| **A. Architecture violation** | Code that breaks current architectural rules | Cross-layer import, wrong dependency direction, forbidden pattern | Lint rules, dependency graph |
| **B. Dead code** | Code that nothing references | Unused exports, unreachable branches, orphan files, dead feature flags | Static analysis (`knip`, `ts-prune`, `unimported`) |
| **C. Duplicate implementation** | Same behavior implemented in multiple places | `formatDate` defined in 3 files, two HTTP clients, two date libraries | Pattern matching, dependency overlap |
| **D. Stale API** | Old API still in use though replaced | Calls to deprecated functions, legacy middleware still imported | Cross-reference deprecated symbols |
| **E. Speculative residue** | Defensive or speculative code handling cases that can't occur | Try/catch wrapping a try/catch, validators for impossible states, half-implemented features, "remove once X" TODOs where X already happened | Manual judgment + flow analysis |

## Two-Layer Presentation

The five types collapse into two cleanup modes for the user:

**Mechanical (A + B)** — Tools verify; cleanup is mostly automated:
- Run linters and dead-code analyzers
- High-confidence: either the code is unused or it isn't
- Can be batched and auto-PR'd after one confirmation

**Judgment (C + D + E)** — Requires user input per item:
- C needs the user to pick a canonical
- D needs the user to confirm the migration target
- E needs the user to verify the case really can't happen

Never run Judgment cleanup on autopilot.

## Architecture Must Be External

Cruft is defined by deviation from architecture. Without a reference, "cruft" is just opinion.

The reference must be **external to the current code** — if the reference is "whatever the code does now", every wrong thing becomes "the standard". This is why this skill never infers architecture from code; it requires an explicit reference (CLAUDE.md, architecture doc, lint config, or direct user input).

When no reference exists, mechanical cleanup can still proceed (dead code and lint violations are universally bad). Judgment cleanup cannot — without a canonical, it would just be reshuffling.

## Why the Invariants Exist

The signature failure mode of code cleanup with Agents is **producing new cruft while removing old cruft**:

- Replacing a removed `try/catch` with a "safer" alternative
- Inventing a third implementation while consolidating two duplicates
- Completing a half-finished feature instead of removing it
- Adding "just in case" comments to deleted code's callers
- "Improving" surrounding code while making the deletion

Each invariant blocks one of these:

- **Delete-only** stops Agent from sneaking in rewrites disguised as cleanup
- **One type per task** keeps diffs reviewable; mixed-type diffs hide bad changes inside good ones
- **Diff is evidence** prevents Agent from describing changes inaccurately in prose
- **Scope cap** keeps tasks small enough to actually review
- **Never invent canonical** stops Agent from "helpfully" creating a new abstraction

Violating any invariant defeats the purpose of running the skill — you'd just be using an Agent to add new cruft.

## Why One Type Per Task

Mixing cleanup types makes the diff incoherent. A diff that contains "removed dead code AND consolidated duplicates AND fixed an architecture violation" is impossible to review safely — if any change is wrong, it gets buried in the others.

Single-purpose tasks also make the report's checkbox progress meaningful: "8/12 dead-code items removed" is informative; "8/12 mixed cleanups done" is not.

## Depth Produces Two Things, Not One

A common misconception is that running this skill on a healthy project is wasted work. It isn't, because **a deep scan produces two outputs**:

1. **Findings** — actual cruft to clean
2. **Verified-clean evidence** — rules and paths confirmed compliant

On a *messy* project, output skews toward findings. On a *healthy* project, it skews toward verified-clean evidence. Both are valuable:

- Findings drive cleanup (the obvious value)
- Verified-clean evidence supports audit, onboarding, PR review, and reduces "is this codebase actually healthy?" anxiety

A surface scan ("ran a few greps, looks fine") gives no real evidence either way. A deep scan that reads every file, scans rules one by one, and verifies doc↔code consistency tells you *what* was checked. That's the difference between "I think it's clean" and "30 Swift files, 6 conventions, 25 doc links — verified clean".

Because of this, [diagnose](diagnose.md) requires per-file reading even when no findings are likely, and [report-format](report-format.md) requires a "Verified Clean" section even on healthy projects. Skipping these reduces the skill to a glorified linter.
