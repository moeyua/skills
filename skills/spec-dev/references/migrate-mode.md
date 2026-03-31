---
name: migrate-mode
description: "Detailed instructions for Migrate Mode: restructuring existing docs to SDD four-layer architecture"
---

# Migrate Mode — Detailed Instructions

For restructuring existing docs to SDD four-layer architecture.

## 1. Map existing docs to layers

Read every existing doc and classify:

| Existing doc | Target layer | Action |
|-------------|-------------|--------|
| PRD.md | WHY | Split into `product/vision.md` + `product/scope.md` |
| architecture.md | WHAT | Split into `modules/*.md` contracts |
| conventions.md | HOW | Move to `guides/conventions.md` |
| design-system.md | HOW | Move to `guides/design-system.md` |
| data-model.md | HOW | Move to `guides/data-model.md` |
| specs/*.md | WHAT+VERIFY | Rewrite: remove UI details, add AC + BDD + TDD |
| decisions/*.md | HOW | Keep in place |
| tasks.md | — | Delete (use issue tracker instead) |

## 2. Scan existing tests

Before rewriting specs, scan test directories to understand what's already verified:

- Map each test file to the module/feature it covers (based on imports and file path)
- Identify test frameworks and conventions in use
- This informs AC status in the rewritten specs: behavior with a passing test → `[x]`, behavior implemented but untested → `[~]`, behavior not implemented → `[ ]`

## 3. Execute migration

Order matters — migrate in dependency order:

1. Create directory structure (`product/`, `modules/`, `guides/`)
2. Move HOW-layer docs (no content changes, just path)
3. Supplement missing ADRs for undocumented decisions
4. Split WHY-layer docs (extract vision and scope from PRD)
5. Rewrite WHAT-layer: module contracts from architecture docs, specs with AC + BDD scenarios + TDD pointers. Set AC status using test scan results from step 2
6. Create VERIFY-layer guides (`testing.md`, `dev-workflow.md`)
7. Update CLAUDE.md and doc site config
8. Delete obsolete files

## 4. Verify migration

Run Audit Mode on the migrated docs. This covers all structural, TDD, BDD, cross-reference, and accuracy checks. Additionally verify:

- Every old doc is either migrated, split, or intentionally deleted
- No orphan links in CLAUDE.md or doc site sidebar
