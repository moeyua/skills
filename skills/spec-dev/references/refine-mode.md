---
name: refine-mode
description: "Detailed instructions for Refine Mode: reading the codebase, cross-referencing docs, and executing split/merge/delete/migrate operations"
---

# Refine Mode — Detailed Instructions

**Refine vs. Audit vs. Migrate:** Audit only *reports* doc problems (pass/fail). Migrate converts legacy docs into the SDD four-layer *format* (one-shot structural conversion). Refine changes *which docs exist and what they cover* based on code reality — it's the mode you reach for when the code has moved but the docs haven't.

## Why Refine Mode exists

Projects evolve. Features get merged, split, or dropped. Modules get refactored. Over time, docs drift: a spec covers three features that are now separate modules, two specs describe the same thing from different angles, a module contract describes an interface that was deleted months ago. Refine brings docs back in sync with what the code actually does.

---

## Step 1: Build the code truth map

Scan the codebase to understand the current reality. Follow these concrete steps:

1. **Identify modules** — Read `src/` (or project root) top-level directories. For each directory, check if it has a barrel export (`index.ts`, `index.js`, `mod.rs`, `__init__.py`). Directories with barrel exports are modules. Also check `package.json` workspaces for monorepo packages.

2. **Map module boundaries** — For each module, read its barrel export to get the public API surface. Then scan its internal imports (`grep` for cross-module imports) to build a dependency graph: which modules import from which.

3. **Identify features** — Scan for user-facing entry points: route definitions, CLI command registrations, exported React/Vue components, API endpoint handlers, event listeners. Each entry point is a feature candidate.

4. **Map tests** — Scan test directories (`__tests__/`, `*.test.*`, `*.spec.*`, `tests/`, `e2e/`). For each test file, identify what module/feature it covers based on its imports and file path.

5. **Read dependencies** — `package.json`, lock files, config files. Note technology choices.

Output: an internal map of `module → public API → features → tests` representing what actually exists.

## Step 2: Build the doc map

Scan all documentation:

- `docs/specs/*.md` — feature specs with AC
- `docs/modules/*.md` — module contracts
- `docs/architecture.md` — system structure and module registry
- `docs/product/scope.md` — planned features
- `docs/product/glossary.md` — domain terminology
- `docs/decisions/*.md` — ADRs
- `docs/guides/*.md` — implementation guides

For each doc, extract: what it describes, which code modules/features it references, and AC status (`[x]` vs `[ ]` counts).

Output: an internal map of `doc → what it describes → AC status`.

## Step 3: Cross-reference and identify actions

Compare code truth map against doc map. Classify each doc and each code unit:

| Situation | Action | Reason |
|-----------|--------|--------|
| One spec covers multiple modules that are now independent | **Split** | One concept per spec, mirrors code boundaries |
| Multiple specs describe overlapping behavior of the same feature | **Merge** | Eliminate duplication, single source of truth |
| Spec describes a feature that no longer exists in code | **Delete** | Dead docs are worse than no docs |
| Module contract describes an API that was refactored into a different module | **Migrate** | Doc should follow the code it describes |
| Code module exists with no corresponding doc | **Create** | Flag as candidate for new spec or contract |
| Test exists but no AC describes the tested behavior | **Create** | Undocumented behavior — add AC to relevant spec, or create new spec |
| AC marked `[x]` or `[~]` but no test covers it | **Flag** | Untested promise — either write the test or downgrade AC to `[ ]` |
| Spec AC is fully implemented but not marked | **Update** | AC status should reflect reality |
| ADR documents a decision that was later reversed | **Archive** | Mark status as "Superseded by ADR-NNN", keep file for history |

## Step 4: Present the refine plan

Do NOT execute changes without user confirmation. Present a plan:

```markdown
## Refine Plan

### Split
- docs/specs/user-management.md → split into:
  - docs/specs/user-auth.md (covers: login, logout, session)
  - docs/specs/user-profile.md (covers: profile CRUD, avatar)
  Reason: code has separate auth/ and profile/ modules with no shared logic

### Merge
- docs/specs/search-basic.md + docs/specs/search-filters.md → docs/specs/search.md
  Reason: both describe the same search module, filters are not a separate feature

### Delete
- docs/specs/legacy-export.md
  Reason: export feature removed in commit abc123, no code references remain
- docs/modules/old-cache.md
  Reason: module replaced by new-cache, ADR-005 documents the decision

### Migrate
- docs/specs/notifications.md → move AC-03..AC-05 to docs/specs/email.md
  Reason: email sending was extracted into its own module

### Archive
- docs/decisions/003-use-redis.md → mark as "Superseded by ADR-007"
  Reason: Redis replaced by Valkey in commit def456

### Create (candidates)
- src/workers/ has no module contract — create docs/modules/workers.md?
- src/api/webhooks/ has tests but no spec — create docs/specs/webhooks.md?
- tests/utils/rate-limiter.test.ts tests rate limiting logic but no AC covers it — add AC to specs/api.md?

### Test Gaps
- specs/auth.md AC-03 [x] "session expires after 30min" — no test found
- specs/search.md AC-05 [~] "handles empty query" — implemented but untested

### Summary
| Action | Count |
|--------|-------|
| Split | 1 |
| Merge | 1 |
| Delete | 2 |
| Migrate | 1 |
| Archive | 1 |
| Create candidates | 3 |
| Test gaps | 2 |
```

## Step 5: Execute with confirmation

Walk through the plan action by action. For each:

1. Show the specific change (diff-style for content changes, file ops for structural changes)
2. Wait for user confirmation
3. Execute
4. Update any cross-references (CLAUDE.md links, scope.md entries, architecture.md module registry)

After all actions complete, run Audit Mode to verify the result is consistent.
