---
name: audit-mode
description: "Detailed instructions for Audit Mode: binary pass/fail doc linter checking specs, module contracts, cross-references, and accuracy"
---

# Audit Mode — Detailed Instructions

Audit is a doc linter — every check is binary pass/fail, no subjective judgment. Run each check, report the results.

**Audit reports problems; it does not fix them.** To restructure docs based on audit findings (split, merge, delete, migrate), use Refine Mode. To convert legacy docs into the SDD four-layer format, use Migrate Mode.

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

Uses the three-state AC system — see [concepts](concepts.md#three-state-acceptance-criteria) for state definitions.

| Check | Pass condition |
|-------|---------------|
| AC has test | Every `[x]` AC has a corresponding test (unit, integration, or E2E) that verifies it |
| No `[~]` items | No AC is marked `[~]` — all test debt is resolved |
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
| AC status correct | Each AC's marker matches the observed state (see [concepts](concepts.md#three-state-acceptance-criteria)) |

## Output format

Summary-first: the reader should see pass/fail at a glance, then drill into failures only. Do not emit a wide per-file matrix — that scales badly and hides the actual problems under visual noise.

```markdown
## Audit Report — 22/30 passed

### ❌ Failures (8)

**specs/drag-sort.md**
- Out of Scope section missing
- AC-02 `[x]` but no corresponding test found
- AC-03 `[x]` but implementation not found in code

**specs/auth.md**
- AC-05 `[~]` implemented but untested
- BDD scenario "Login with expired token" has no E2E test or manual test record

**specs/search.md**
- BDD scenarios cover only happy path, no error scenario

**modules/list.md**
- Boundary ("Does NOT own") section missing
- Public API source `src/list/index.ts` exists but `reorder` export not found

### ⚠️ Cross-reference issues
- Scope coverage: 4/6 features have specs (missing: `export`, `import`)
- Dead link: CLAUDE.md → docs/guides/design-system.md

### 🗑️ Orphan tests
- `tests/utils/helpers.test.ts` tests `formatDate()` — no AC references this behavior (add AC or delete test)

### ✅ Passed (22)
<details>
<summary>Expand to see which checks passed</summary>

- specs/{other files}.md: all structural + TDD + BDD checks passed
- modules/{other files}.md: all contract checks passed
- No `[~]` items outside flagged files
- All CLAUDE.md doc links valid except the one flagged above
</details>
```

**Rules for writing the report:**

- Group failures by the affected file so the reader has one place to fix per file, not one row per check
- Use one-line findings with enough context to act ("AC-02 `[x]` but no corresponding test found" — not just "AC has test ❌")
- Put the headline pass count in the title so the reader knows scale before reading
- Collapse the "passed" list into a `<details>` block — it's there for auditability but doesn't belong on the critical path
