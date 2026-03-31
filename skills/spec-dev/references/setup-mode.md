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
docs/
├── product/                    # WHY layer
│   ├── vision.md               # Product positioning, users, core value
│   └── scope.md                # MVP boundary: P0/P1/P2, explicit exclusions
│
├── modules/                    # WHAT layer — module behavior contracts
│   ├── README.md               # Module dependency map
│   └── {module-name}.md        # One file per module
│
├── specs/                      # WHAT+VERIFY layer — feature specs
│   └── {feature-name}.md       # Behavior constraints + AC + BDD + TDD pointers
│
├── decisions/                  # HOW layer — ADRs
│   └── NNN-{title}.md
│
├── guides/                     # HOW layer — implementation guides
│   ├── conventions.md          # Coding conventions
│   ├── design-system.md        # Visual design rules (if frontend)
│   ├── data-model.md           # Data structures and state shape
│   ├── testing.md              # Testing strategy and pyramid
│   └── dev-workflow.md         # SDD→TDD→BDD development process
│
└── CLAUDE.md                   # Agent entry point (project root)
```

Not every project needs every document. Decision guide:

| Document | Create when |
|----------|-------------|
| `product/vision.md` | User can articulate what the product does and for whom |
| `product/scope.md` | Need to define MVP boundaries |
| `modules/*.md` | Project has 3+ distinct modules |
| `specs/*.md` | Planning a feature before implementing |
| `decisions/*.md` | Making architectural or technology choices |
| `guides/conventions.md` | Codebase has patterns an agent might violate |
| `guides/design-system.md` | Frontend with custom visual rules |
| `guides/data-model.md` | Complex state, API data, or database models |
| `guides/testing.md` | Always — create alongside first spec (defines where tests live, naming conventions, and test↔AC mapping strategy) |
| `guides/dev-workflow.md` | Always — create alongside first spec (defines the SDD→TDD→BDD cycle) |

## 3. Write progressively

Don't create all documents at once. Follow this rhythm:

| Stage | Create |
|-------|--------|
| **Day 0** (before code) | `CLAUDE.md`, `guides/conventions.md` (basics), `product/vision.md` if user can describe the product |
| **First feature** | `guides/testing.md` (basics: test locations, naming, AC↔test mapping), `guides/dev-workflow.md` (SDD→TDD→BDD cycle), then `specs/{feature}.md` with AC + BDD scenarios |
| **After code exists** | `modules/*.md` (now you know the real architecture) |
| **Agent keeps making mistakes** | Add correction to `guides/conventions.md` |
| **Major technical decision** | ADR in `decisions/` |
| **Integrating APIs** | `guides/data-model.md` |
| **Visual bugs recur** | `guides/design-system.md` |

## 4. Write each document

Read templates in `references/templates.md` for full structure. Key principles:

**CLAUDE.md** — Agent entry point. Concise, declarative, scannable. Under 150 lines. Link to detailed docs.

**product/vision.md** — Why the product exists, who uses it, core value proposition. No implementation details.

**product/scope.md** — What's in MVP, what's explicitly out. Priority tiers (P0/P1/P2). Under 100 lines.

**modules/{name}.md** — Module behavior contract. Defines: responsibilities (what it does and doesn't do), public API (TypeScript signatures), consumed interfaces (dependencies), state machine (if stateful), invariants (conditions that must always hold), error scenarios. No UI details, no implementation specifics — those belong in HOW layer.

**specs/{name}.md** — Feature behavior spec. Defines: one-line goal (user perspective), behavior constraints (precondition/behavior/postcondition triples), state machine, Acceptance Criteria (each one testable), BDD Gherkin scenarios (derived from AC, for E2E tests), TDD unit test pointers (what to test, not how), out of scope. This is the most important document type in SDD — it drives both development and testing.

**decisions/NNN-{title}.md** — Standard ADR: Status → Context → Options → Decision → Consequences.

**guides/testing.md** — Testing pyramid, layer responsibilities, naming conventions, coverage targets, data-testid conventions. Read `references/testing-strategy.md` for the full guide.

**guides/dev-workflow.md** — The SDD→TDD→BDD development process. Read `references/dev-workflow.md` for the full guide.
