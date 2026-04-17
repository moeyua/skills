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
| PRD.md | WHY + WHAT | Split WHY content into `product/vision.md` + `product/scope.md` + `product/glossary.md`; extract feature-level behavior descriptions into individual `specs/*.md` files; extract tech decisions into `decisions/*.md` |
| architecture.md | WHAT | Migrate to `architecture.md` (system structure + module registry) |
| conventions.md | HOW | Move to `guides/conventions.md` |
| design-system.md | HOW | Move to `guides/design-system.md` |
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
4. Split WHY-layer docs (extract vision, scope, and glossary from PRD or existing docs)
5. Create `architecture.md` (system structure + module registry) from existing architecture docs
6. Rewrite WHAT-layer: module contracts (with source file pointers, not copied signatures), specs with Scope + AC + Verification (BDD scenarios + TDD pointers). Set AC status using test scan results from step 2
7. Create VERIFY-layer guides (`testing.md` including BDD verification method, `dev-workflow.md`)
8. Update CLAUDE.md and doc site config
9. Delete obsolete files (including old `data-model.md` — data models should be referenced via code paths)

## 4. Verify migration

Run Audit Mode on the migrated docs. This covers all structural, TDD, BDD, cross-reference, and accuracy checks. Additionally verify:

- Every old doc is either migrated, split, or intentionally deleted
- No orphan links in CLAUDE.md or doc site sidebar
