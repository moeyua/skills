---
name: audit-mode
description: "Detailed instructions for Audit Mode: binary pass/fail doc linter checking specs, module contracts, cross-references, and accuracy"
---

# Audit Mode — Detailed Instructions

Audit is a doc linter — every check is binary pass/fail, no subjective judgment. Run each check, report the results.

## Spec checks

For each file in `docs/specs/`:

| Check | Pass condition |
|-------|---------------|
| Has Goal | Goal section exists and is non-empty |
| Has AC | At least one `- [ ]` or `- [x]` item |
| AC numbered | Every AC uses `AC-NN` format |
| No UI details | No pixel values, color codes, or button labels in AC |
| Has Out of Scope | Out of Scope section exists |

## Module contract checks

For each file in `docs/modules/` (excluding README.md):

| Check | Pass condition |
|-------|---------------|
| Has Public API | Public API section exists with source file path |
| Has Invariants | Invariants section exists |
| Has boundary | "Does NOT own" or equivalent section exists |
| Has error scenarios | Error Scenarios section exists |

## Cross-reference checks

| Check | Pass condition |
|-------|---------------|
| Scope coverage | Every feature in `docs/product/scope.md` has a matching file in `docs/specs/` |
| No orphan specs | Every file in `docs/specs/` has a corresponding entry in scope |
| File paths valid | File paths referenced in module contracts exist in the codebase |
| CLAUDE.md links valid | Every doc link in CLAUDE.md points to an existing file |

## TDD checks

| Check | Pass condition |
|-------|---------------|
| AC has test | Every `[x]` AC has a corresponding test (unit, integration, or E2E) that verifies it |
| No `[~]` items | No AC is marked `[~]` (implemented but untested) — these are test debt |
| Orphan tests | No test file exists that tests behavior not described by any AC (sign of undocumented behavior — either add AC or delete the test) |

How to find corresponding tests: search test directories for imports from the relevant module, test names matching AC descriptions, or `describe`/`it`/`test` blocks referencing the feature name.

## BDD checks

| Check | Pass condition |
|-------|---------------|
| Specs have scenarios | Every spec with 3+ AC has at least one BDD Gherkin scenario |
| Scenarios derived from AC | Each scenario's Then clause maps back to a specific AC (not invented independently) |
| Scenarios have verification | Each BDD scenario has either: (a) a corresponding E2E/integration test file, OR (b) an entry in a manual test checklist with a recorded pass/fail result. Check `docs/guides/testing.md` to determine which verification method the project uses |
| Happy + error coverage | Scenarios cover at least one happy path and one error path per spec |

## Accuracy checks

| Check | Pass condition |
|-------|---------------|
| Public API source exists | Source file path in module contract's Public API section exists in the codebase, and listed exports exist in that file |
| AC status correct | `[x]` items are implemented AND tested, `[~]` items are implemented but untested, `[ ]` items are not yet implemented |

## Output format

```markdown
## Audit Report

### Specs (N files)
| File | Goal | AC | AC# | No UI | OOS | AC↔Test | BDD |
|------|------|----|-----|-------|-----|---------|-----|
| drag-sort.md | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ 1 untested | ✅ |

### Module Contracts (N files)
| File | API | Invariants | Boundary | Errors |
|------|-----|------------|----------|--------|
| list.md | ✅ | ✅ | ❌ | ✅ |

### Cross-references
- Scope coverage: 4/6 features have specs
- Orphan specs: none
- Dead links: CLAUDE.md → docs/guides/design-system.md (file missing)

### TDD
- specs/drag-sort.md: AC-02 [x] but no corresponding test found
- specs/auth.md: AC-05 [~] implemented but untested
- tests/utils/helpers.test.ts: tests `formatDate()` but no AC references this behavior

### BDD
- specs/search.md: scenarios only cover happy path, no error scenario
- specs/auth.md: scenario "Login with expired token" has no E2E test or manual test record

### Accuracy
- modules/list.md: Public API source `src/list/index.ts` exists but `reorder` export not found
- specs/drag-sort.md: AC-03 marked [x] but not implemented

### Summary: 22/30 checks passed
```
