---
name: cruft-sweep
description: "Detect and clean up code that doesn't belong in the project — architectural violations, dead code, duplicate implementations, stale APIs, and speculative residue. Triggers when the user wants to clean up after a migration or long Agent session, audit accumulated cruft against the current architecture, find code that doesn't match conventions, or says things like '清理一下项目', '帮我看看哪些代码该删', '迁移后的残留', '审计一下 cruft', 'agent 改了好多次留下一堆痕迹', 'clean up dead code', 'post-migration cleanup', 'remove tech debt', 'find unused code', 'project is getting messy'. Use whenever the user wants to remove cruft, even if they don't use the word — phrases about messy/dirty projects, leftover code, or 'lots of duplicated stuff' should all trigger this. Runs as Diagnose → Clean with strict invariants designed to prevent Agents from introducing new cruft while removing old cruft."
metadata:
  author: Moeyua
  version: "2026.4.27"
  source: Manual
---

# Cruft-Sweep — Code Cleanup Against Current Architecture

Identify code that **shouldn't exist anymore** and produce safe cleanup actions. Scope is deletion, consolidation, and migration — never new feature work, refactoring for design improvement, or "while we're here" rewrites.

## Why This Skill Exists

Long-lived projects accumulate residue, especially after architecture migrations or extended Agent collaboration:

- Code that violates the current architecture
- Dead code that nothing references
- Multiple implementations of the same behavior
- Old APIs still being called despite replacements existing
- Speculative defensive code from trial-and-error

Each category has a different cleanup strategy. This skill reads the codebase against the *current* architecture as ground truth, classifies what doesn't fit, and walks the user through cleanup safely.

Read [concepts](references/concepts.md) before first use — it defines the five cruft types, the mechanical/judgment split, and the invariants that make this skill safe.

## Core Flow

Single workflow, two phases, one invocation:

```
Diagnose phase (read-only):
  1. Locate architecture reference + extract scannable rules digest
  2. Enumerate the source file inventory
  3. Per-file read pass (every source file, not grep)
  4. Cross-file analysis (unused exports, duplicates, multiple patterns)
  5. Rule-by-rule compliance scan from the digest
  6. Doc↔code consistency check
  7. Tool augmentation (knip, dependency-cruiser, etc., if installed)
  8. Write report — both findings AND verified-clean evidence

Confirm with user:
  9. Show summary, ask what to clean

Clean phase (modifies code, bounded by invariants):
 10. Selective cleanup (mechanical and/or judgment)
 11. Mark items done in report
```

Diagnose is read-only and re-runnable. The per-file read in Step 3 is what distinguishes a real scan from a shallow one — *no skipping files, no falling back to grep*. See [diagnose](references/diagnose.md) for details.

Clean modifies code and is bounded by the invariants below.

## Invariants

These are not preferences. They exist to prevent the failure mode this skill was designed against — *Agents introducing new cruft while removing old cruft*. If any invariant would be violated, stop and ask the user.

1. **Delete-only by default.** Mechanical cleanup deletes; judgment cleanup deletes or runs explicit codemods. No "while we're here" rewrites. No new abstractions. No "improvements" to surrounding code.
2. **One cruft type per task.** A cleanup task addresses exactly one category (dead code, OR architecture violations, OR duplicate implementations, etc). Mixing types makes the diff unreviewable.
3. **Diff is the evidence.** Every change must be reviewable as `git diff`. Don't summarize what was done in prose — show the diff.
4. **Scope cap per task.** A single cleanup task touches at most ~20 files or ~500 lines. If a section exceeds this, split into multiple tasks.
5. **Never invent a canonical.** When consolidating duplicates, the user picks which implementation is canonical. Never decide silently. Never invent a new third implementation.

## Architecture Reference

This skill is **decoupled from spec-dev**. It finds its own reference. See [reference-lookup](references/reference-lookup.md) for the full procedure. Lookup order:

1. `CLAUDE.md` (project + global)
2. `architecture.md` / `docs/architecture/`
3. `conventions.md` / `.conventions/`
4. ESLint / tsconfig / dependency-cruiser config (executable conventions)
5. README architecture section

If none of these exist, ask the user. **Do not infer architecture from current code** — that bakes existing cruft in as "the standard" and defeats the skill.

If only a partial reference is available, run only what the reference covers. Mechanical cleanup (dead code, lint violations) can proceed regardless of reference quality; judgment cleanup needs a reference.

## Phases

| Phase | What it does | Reference |
|-------|--------------|-----------|
| **Diagnose** | 7-pass read-only audit (file inventory, per-file read, cross-file, rule compliance, doc↔code, tools, write) | [diagnose](references/diagnose.md) |
| **Clean** | Read report, execute selected cleanup, mark items done | [clean](references/clean.md) |

The report file format and lifecycle live in [report-format](references/report-format.md).

## Depth Produces Two Outputs

A correctly-run Diagnose produces two things, not just findings:

1. **Findings** — cruft to clean (drives the Clean phase)
2. **Verified-clean evidence** — rules / paths / files confirmed compliant

On a messy project, output skews toward findings. On a healthy project, toward verified-clean evidence. Both are required in the report — see [concepts](references/concepts.md#depth-produces-two-things-not-one) for why this matters and [report-format](references/report-format.md#the-verified-clean-section) for how to present it.

This is why per-file reading is mandatory even when findings seem unlikely. Without the read pass, the report can't honestly claim verified-clean — only "didn't find anything".

## When the Report is Large

If Diagnose finds more than ~200 entries, do not dump them all into the conversation. Show the summary, point to the file, and **suggest scoping before clean**:

- Focus on a single directory (`src/api/`, `src/legacy/`)
- Focus on a single cruft type (mechanical-only first, often 60-80% of findings)
- Keep the full report and work in batches

A small slice with real progress beats a thousand-item list the user never acts on. This is the same attention-budget logic that applies to Agent context — pushed out to the human side.

## When NOT to Use This Skill

- **Refactoring for design improvement.** Use feature-dev. This skill *removes*; refactoring *restructures*.
- **Recent diff review.** Use the `simplify` skill — it focuses on recently changed code, not whole-project state.
- **Pre-merge code review.** Use code-review skills. This skill audits a whole project, not a PR.
- **Doc cleanup.** Use spec-dev's Refine Mode. This skill operates on code only.
- **Initial project setup.** No existing code, no cruft.

## References

| Topic | When to read | File |
|-------|-------------|------|
| Five cruft types, mechanical/judgment split, invariant rationale | Always, before first use | [concepts](references/concepts.md) |
| How to find the architecture reference | When starting Diagnose | [reference-lookup](references/reference-lookup.md) |
| Diagnose procedure: scan, classify, report | Running Diagnose | [diagnose](references/diagnose.md) |
| Clean procedure: mechanical and judgment cleanup | Running Clean | [clean](references/clean.md) |
| Report file structure, location, lifecycle | Reading or writing the report | [report-format](references/report-format.md) |
