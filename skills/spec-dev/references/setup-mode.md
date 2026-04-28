---
name: setup-mode
description: "Detailed instructions for Setup Mode: scanning a project and progressively building SDD documentation from scratch"
---

# Setup Mode — Detailed Instructions

## 1. Scan the project

Before writing anything, understand what exists:

- **Tech stack**: `package.json`, config files, lock files
- **Project structure**: root and key directories
- **Existing docs**: any `.md` files, `CLAUDE.md`, `README.md`
- **Git history**: recent commits for active development areas
- **Modules**: identify distinct functional modules from code structure
- **Tests**: scan test directories (`__tests__/`, `*.test.*`, `*.spec.*`, `tests/`, `e2e/`) to understand existing test coverage, frameworks in use, and conventions

Only document what you can confirm from code. Never assume a library is in use — check `package.json` and config files.

## 2. Plan the documentation structure

Present to user for confirmation. Target structure:

```
{project root}/
├── CLAUDE.md                   # Agent entry point — points at all the docs below
├── PRODUCT.md                  # Product positioning + brand + design intent (NOT created by spec-dev)
├── DESIGN.md                   # Design system tokens + components (NOT created by spec-dev, frontend only)
└── docs/
    ├── architecture.md         # WHAT layer — system structure + module registry
    ├── modules/                # WHAT layer — module behavior contracts
    │   └── {module-name}.md    # One file per module
    ├── specs/                  # WHAT+VERIFY layer — feature specs
    │   └── {feature-name}.md   # Behavior constraints + AC + BDD + TDD pointers
    ├── decisions/              # HOW layer — ADRs
    │   └── NNN-{title}.md
    └── guides/                 # HOW layer — implementation guides
        ├── conventions.md      # Code conventions (NOT design rules — those are in DESIGN.md)
        ├── testing.md          # Testing strategy and pyramid
        └── dev-workflow.md     # SDD→TDD→BDD development process
```

**`PRODUCT.md` and `DESIGN.md` are out of scope for spec-dev.** If they don't exist yet, ask the user to create them or note that this project doesn't need them. Setup Mode does not scaffold them — they're authored upstream of code-mapping documentation.

Not every project needs every document. Decision guide:

| Document | Create when |
|----------|-------------|
| `architecture.md` | Project has 3+ modules or non-trivial layering |
| `modules/*.md` | Project has 3+ distinct modules |
| `specs/*.md` | Planning a feature before implementing |
| `decisions/*.md` | Making architectural or technology choices |
| `guides/conventions.md` | Codebase has patterns an agent might violate |
| `guides/testing.md` | Always — create alongside first spec (defines where tests live, naming conventions, test↔AC mapping strategy, and BDD verification method: automated E2E or manual) |
| `guides/dev-workflow.md` | Always — create alongside first spec (defines the SDD→TDD→BDD cycle) |

## 3. Write progressively

Don't create all documents at once. Follow this rhythm:

| Stage | Create |
|-------|--------|
| **Day 0** (before code) | `CLAUDE.md`, `guides/conventions.md` (basics). If `PRODUCT.md` / `DESIGN.md` are missing and the project needs them, flag for the user — they're upstream context, not Setup Mode's job. |
| **First feature** | `guides/testing.md` (basics: test locations, naming, AC↔test mapping, BDD verification method), `guides/dev-workflow.md` (SDD→TDD→BDD cycle), then `specs/{feature}.md` with AC + BDD scenarios |
| **After code exists** | `architecture.md` (system structure + module registry), `modules/*.md` (now you know the real architecture) |
| **Agent keeps making mistakes (code)** | Add correction to `guides/conventions.md` |
| **Agent keeps making mistakes (visual)** | Update `DESIGN.md` (out of spec-dev scope; flag to user) |
| **Major technical decision** | ADR in `decisions/` |

## 4. Write each document

Read the layer-specific templates for full structure — [templates-claude](templates-claude.md) for CLAUDE.md, [templates-what](templates-what.md) for architecture/module contracts/feature specs, [templates-how](templates-how.md) for ADRs/conventions. Key principles:

**CLAUDE.md** — Agent entry point. Concise, declarative, scannable. Under 150 lines. Links to `PRODUCT.md`, `DESIGN.md` (if present), and the docs/ tree below.

**architecture.md** — System-level structure: layer diagram, data flow, external integrations, module registry. Replaces the old Module Map — one file for both macro architecture and module index.

**modules/{name}.md** — Module behavior contract. Defines: responsibilities (what it does and doesn't do), public API (point to source file + name/purpose table, NOT copied signatures), consumed interfaces (dependencies), state machine (if stateful), invariants (conditions that must always hold), error scenarios. No UI details, no implementation specifics — those belong in HOW layer.

**specs/{name}.md** — Feature behavior spec. Defines: one-line goal (user perspective), behavior constraints (precondition/behavior/postcondition triples), state machine, Acceptance Criteria (each one testable), BDD Gherkin scenarios (derived from AC, verified by automated E2E or manual testing), TDD unit test pointers (what to test, not how), out of scope. This is the most important document type in SDD — it drives both development and testing.

**decisions/NNN-{title}.md** — Standard ADR: Status → Context → Options → Decision → Consequences.

**guides/conventions.md** — Code-level conventions (file naming, async patterns, error handling, anti-patterns). Visual / design conventions go in `DESIGN.md`, not here.

**guides/testing.md** — Testing pyramid, layer responsibilities, naming conventions, coverage targets, data-testid conventions, and BDD verification method (automated E2E or manual). Read `references/testing-strategy.md` for the full guide.

**guides/dev-workflow.md** — The SDD→TDD→BDD development process. Read `references/dev-workflow.md` for the full guide.
