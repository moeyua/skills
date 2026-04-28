---
name: report-format
description: "Specification for the cleanup report file: location, structure, checkbox conventions, lifecycle, and a worked example."
---

# Report Format

The report file is the source of truth for a cleanup session. Both Diagnose (writes) and Clean (reads + updates) operate on it.

## Location

`.claude/cleanup/report.md` (project root)

This directory should be in `.gitignore` by default — cleanup reports are working memory, not project artifacts. If the user wants long-running cleanup tracks visible to the team, they can opt into committing them.

If `.claude/` doesn't exist, create the directory. If `.gitignore` doesn't already exclude `.claude/cleanup/`, **suggest** adding it (don't auto-modify `.gitignore` — that's a file the user owns).

## Lifecycle

- **Diagnose overwrites** `report.md`. Before overwriting, archive the existing one to `.claude/cleanup/archive/{YYYY-MM-DD}.md`.
- **Clean updates** `report.md` in place, marking items `[x]` (done) or `[-]` (skipped).
- Items are **never deleted** from the report once written — the audit trail of what was found and what was done is part of the value.

## Status Markers

- `[ ]` — Pending (not yet acted on)
- `[x]` — Done (cleanup executed)
- `[-]` — Skipped or deferred (with a one-line reason on the same item)

## Structure

```markdown
# Cleanup Report — {YYYY-MM-DD}

**Project:** {project name}
**Reference:** {one-line summary of the architecture reference used}
**Total findings:** {N}

## Summary

| Section | Count |
|---------|-------|
| Mechanical: Dead code | {N} |
| Mechanical: Architecture violations | {N} |
| Judgment: Duplicate implementations | {N} |
| Judgment: Stale APIs | {N} |
| Judgment: Speculative residue | {N} |

---

## Mechanical (auto-cleanable)

### Dead code

- [ ] `src/foo.ts:42` — unused export `formatLegacy` (no references in repo)
- [ ] `src/bar/old-helpers/` — entire directory unreferenced

### Architecture violations

- [ ] `src/api/user.ts:88` — imports from `internal/db/raw` (forbidden: api → infra direct)
- [ ] `src/domain/order.ts:15` — imports from `ui/components` (wrong direction: domain should not depend on ui)

---

## Judgment (user decision required)

### Duplicate implementations

- [ ] `formatDate` defined 3× — pick canonical:
  - `src/utils/date.ts:12` (oldest, most tests, used by 8 callers)
  - `src/lib/format.ts:45` (used by 3 callers, simpler logic)
  - `src/helpers/index.ts:8` (newest, only 1 caller)

### Stale APIs

- [ ] `useOldAuth` (deprecated since v2) — 4 usages in `src/api/legacy/`
  - Migration target per ADR-005: `useAuth` from `src/auth/`

### Speculative residue

- [ ] `src/auth/middleware.ts:120` — outer try already wraps this; inner catch unreachable
- [ ] `src/api/handler.ts:88` — checks `user === null` but route guarantees user
- [ ] `src/utils/parser.ts:45` — TODO from 2025-08, "remove once feature-flag X" — flag was removed in commit abc123

---

## Verified Clean

Evidence from passes that produced no findings. This section is part of the value, not filler — it tells the reader what was actually checked.

**Convention compliance (rule-by-rule):**
- ✓ Rule "no Combine" — checked 30 Swift files, zero `import Combine` / `AnyPublisher` / `@Published`
- ✓ Rule "Core exposes protocols" — all 8 Core public APIs are protocols
- ✓ Rule "kebab-case file naming" — checked 47 source files, all conform
- ✗ Rule "no cross-layer imports" — see Architecture violations above

**Doc↔code consistency:**
- ✓ 25 CLAUDE.md links resolve
- ✓ 6 module contract source paths exist
- ✓ 10 ADR cross-references match files in `docs/decisions/`

**File-internal scan:**
- ✓ 30 Swift sources passed L2 checks (no unused imports, no debug leftovers, no commented-out code)
- ✓ 14 TS test files passed L2 checks

---

## Not Checked

- Naming conventions: no rules in reference
- Canonical implementations: only date utilities specified
- Outdated dependencies: out of scope (use `pnpm outdated`)
```

## Per-Item Format

Every item must include:

- **File path with line number** when applicable
- **One-line description** of what's wrong
- **Enough context** that the user can verify without re-running diagnose

Don't truncate. Don't summarize multiple items into one. Each row is one actionable finding.

For items that need user choice (Type C duplicates, Type D migrations), include the **observations** the user needs to decide:

```markdown
- [ ] `parseDate` defined 2× — pick canonical:
  - `src/lib/date.ts:8` — uses date-fns, has tests, 12 callers
  - `src/utils/parsing.ts:33` — manual regex, no tests, 2 callers
```

The user reads this and picks `src/lib/date.ts` without needing to open both files.

## Per-Section Ordering

Within each section, sort by:

1. **Confidence** (high → low) — known dead code before "probably unused"
2. **Scope** (small → large) — single-line fixes before whole-file deletions
3. **File path** (alphabetical) — for stable diffs across re-runs

Stable ordering matters: if the user runs diagnose twice, items they've already considered should appear in the same place.

## Cross-References Within the Report

When an item depends on another (e.g., "delete this file once X is gone"), use a back-reference:

```markdown
- [ ] `src/api/old-handler.ts` — file becomes dead once `legacy-routes.ts` is removed (see Architecture violations item 1)
```

This makes the report navigable without losing the dependency information.

## The Verified Clean Section

This section is required even on healthy projects with few findings — arguably *especially* on healthy projects, since that's where the report's value shifts from "what to fix" to "what was confirmed".

What belongs in Verified Clean:

- **Rule-by-rule scan results from Step 5** — every digest rule, even the ones that passed silently
- **Doc↔code resolution counts from Step 6** — how many links / paths / cross-references checked out
- **Per-file scan summary from Step 3** — which files passed L2 checks (number per package)
- **Tool runs from Step 7** — which tools ran, with summary outputs

What does NOT belong:
- Vague claims like "code looks good" — needs specific evidence
- Things that weren't actually checked — those go in "Not Checked"
- Process commentary — only stated facts about the codebase

The format uses `✓` and `✗` markers; `✗` items must cross-reference where the failure is reported above.

Keep entries terse but specific: "checked X files for Y, Z matches" beats "scanned for Y" — the count makes the claim verifiable.

## Coverage Gaps

If the architecture reference was partial, end the report with a "Not Checked" section listing what wasn't scanned and why. This is honest about scope and tells the user how to expand coverage:

```markdown
## Not Checked

- Naming conventions: no rules in reference
- Canonical implementations: only date utilities specified

To include these checks, add the rules to CLAUDE.md or architecture.md and re-run diagnose.
```

## Updating the Report During Clean

When Clean executes an item, edit the report file directly:

```diff
- - [ ] `src/foo.ts:42` — unused export `formatLegacy`
+ - [x] `src/foo.ts:42` — unused export `formatLegacy`
```

For skipped items, add the reason:

```diff
- - [ ] `src/legacy/api.ts` — entire file unreferenced
+ - [-] `src/legacy/api.ts` — 跳过，等待 ADR-007 决定是否保留 legacy 层
```

Commit the report file alongside the code change so the audit trail tracks together.
