---
name: spec-dev
description: "Spec-Driven Development documentation system that serves as bookends around feature-dev. Builds a four-layer doc architecture (WHY → WHAT → HOW → VERIFY) where specs drive development and tests verify specs. Use this skill whenever the user wants to: write a spec or feature spec before development, set up SDD/TDD/BDD workflows, sync or update docs after development (update AC status, module contracts, ADRs), initialize project documentation, audit or restructure existing docs, create module contracts, check project status or progress, or says things like 'write a spec', 'update the spec', 'sync docs', 'set up docs', 'audit my docs', 'restructure docs', 'create module contract', 'add BDD scenarios', 'status', '看一下进度', '接下来做什么'. Also trigger when the user mentions spec-first development, behavior-driven development, acceptance criteria, or wants documentation that drives their testing strategy. This skill complements feature-dev: use spec-dev before feature-dev to define what to build, and after feature-dev to update documentation."
metadata:
  author: Moeyua
  version: "2026.3.25"
  source: Manual
---

# Spec-Dev — Spec-Driven Development Documentation System

Specs are the single source of truth. Code implements specs. Tests verify specs. If a spec and code disagree, the spec wins or gets updated — never silently ignored.

## How This Skill Fits Your Workflow

This skill is designed to work as **bookends around feature-dev** — you use it before development to define what to build, and after development to update documentation.

```
spec-dev(Write) → feature-dev(全部7阶段) → spec-dev(Update) → commit-push-pr
```

**Why this order matters:** feature-dev excels at codebase exploration, architecture design, and implementation — but its outputs live only in the conversation and vanish when the session ends. spec-dev captures the durable knowledge: what the feature does (spec), how modules interact (contracts), and why decisions were made (ADRs). Without spec-dev after feature-dev, every future session starts from zero.

### What each tool owns

| Concern | spec-dev | feature-dev |
|---------|----------|-------------|
| Define feature behavior | Writes spec with AC + BDD | — |
| Explore codebase | — | code-explorer agents |
| Design architecture | — | code-architect agents |
| Write code | — | Implementation phase |
| Review code | — | code-reviewer agents |
| Update docs after dev | Update mode | — |
| Project-level doc setup | Setup / Audit / Migrate | — |

## Core Architecture: Four Layers

Every document belongs to exactly one layer. Layers depend downward only.

| Layer | Question | Contents | Consumers |
|-------|----------|----------|-----------|
| **WHY** | Why does this exist? | Vision, scope | Product decisions |
| **WHAT** | What does each module/feature do? | Module contracts, feature specs, BDD scenarios | Developers writing code, testers writing tests |
| **HOW** | How is it built? | ADRs, conventions, design system, data model | Developers making implementation choices |
| **VERIFY** | How do we prove it works? | Testing strategy, AC↔test mapping | Test runners, CI |

The VERIFY layer is embedded inside WHAT-layer specs (each spec contains its own AC, BDD scenarios, and TDD pointers) plus a standalone testing strategy guide. This keeps verification co-located with the behavior it verifies.

## Modes

| Mode | When | What to do |
|------|------|------------|
| **Write** | Before feature-dev: user wants to define a feature | Write spec with behavior constraints + AC + BDD + TDD pointers |
| **Update** | After feature-dev: development is done, docs need updating | Read code changes → update AC status → update module contracts → suggest ADRs |
| **Status** | User wants to see progress or decide what to work on next | Scan scope + specs → compute status from AC checkboxes → report |
| **Setup** | New project or no docs exist | Scan → plan → write docs progressively |
| **Audit** | Docs exist but may not follow SDD | Evaluate against SDD principles → report → fix |
| **Migrate** | Existing docs need restructuring to SDD layers | Map old docs to new layers → migrate → clean up |

---

## Write Mode

This is the most common mode — used before starting feature-dev to define what a feature should do.

### What Write Mode produces

A feature spec file at `docs/specs/{feature-name}.md` that serves as structured input for feature-dev. When the user later runs feature-dev, they can point it to this spec so the agent has clear behavior constraints and acceptance criteria to work against.

### For a feature spec

Write Mode is a collaborative, step-by-step conversation — not a one-shot generation. Each step requires the user's confirmation before moving to the next. This matters because specs define what gets built; assumptions made here propagate through development and testing.

**Step 1: Confirm the goal** — Ask the user what the feature should accomplish from the user's perspective. Propose a one-line goal statement. Wait for the user to confirm or refine it. No technology names in the goal.

**Step 2: Define behavior constraints together** — Propose behavior constraints as precondition/behavior/postcondition triples. Present them to the user and ask: are these complete? Any missing edge cases? Any constraints that don't belong? Revise based on feedback. Only proceed when the user confirms.

**Step 3: Define state machine** (if the feature has stateful behavior) — Not every feature needs one. Use judgment: a login flow has states (unauthenticated → authenticating → authenticated → error), a simple data transform does not. If applicable, propose the states and transitions, confirm with the user.

**Step 4: Write Acceptance Criteria** — Propose AC based on the confirmed behavior constraints. Each AC must be verifiable by a single test. Present the list and ask the user to review: any missing? Any too vague? Any that should be split or merged? Mark each as `[ ]` (not yet implemented).

**Step 5: Derive BDD Gherkin scenarios from AC** — Propose scenarios that drive E2E / integration tests. Focus on user-visible behavior, cover both happy path and error paths. Confirm with the user.

**Step 6: List TDD unit test pointers** — Propose what pure logic to test, which module — not the full test code. Confirm with the user.

**Step 7: Define out of scope** — Propose what this spec explicitly does NOT cover. This prevents scope creep during development. Confirm with the user.

**Step 8: Write the spec file** — Only after all steps are confirmed, write the complete spec to `docs/specs/{feature-name}.md`.

### Scaling by feature size

Not every feature needs the full treatment. Use judgment:

| Feature size | What to write | What to skip |
|-------------|---------------|--------------|
| **Large** (new module, cross-cutting) | Full spec: goal, behavior constraints, state machine, AC, BDD, TDD pointers, out of scope | Nothing |
| **Medium** (new feature in existing module) | Goal, behavior constraints, AC, BDD scenarios | State machine (unless stateful), TDD pointers (obvious from AC) |
| **Small** (enhancement, UI tweak) | Goal, AC | Behavior constraints, state machine, BDD, TDD pointers |
| **Bug fix** | Skip spec entirely — write a test, fix the bug | Everything |

The scaling guide is about pragmatism, not laziness. A small feature with 2 AC doesn't need 5 BDD scenarios and a state machine. But a large feature without behavior constraints will lead to ambiguous implementations.

### For a module contract

Module contracts define what a module does and doesn't do — its boundary, public API, and invariants. Write or update a contract when:

- A new module is being created
- An existing module's public API is changing
- Multiple developers (or agents) need to understand module boundaries

Steps:
1. Read the module's source code (or discuss with user if the module doesn't exist yet)
2. Define the module's single responsibility
3. List what it owns and what it does NOT own
4. Extract public API (TypeScript signatures from actual code, or proposed signatures for new modules)
5. Identify dependencies consumed (what other modules it calls)
6. Define invariants (conditions that must always hold — violation = bug)
7. Document error scenarios and expected behavior
8. If stateful, define the state machine

### Quality checklist before finishing

- Every AC can be verified by a single test?
- No UI details in the spec (pixel values, colors, button labels)?
- No implementation technology mentioned in behavior constraints?
- BDD scenarios cover both happy path and error paths?
- Module contract lists what it does NOT do?

---

## Update Mode

This is the mode that closes the loop — used after feature-dev completes, before commit-push-pr.

### Why Update Mode exists

feature-dev produces working code but doesn't update documentation. Without this step, specs drift from reality, AC status becomes meaningless, and module contracts describe interfaces that no longer exist. Every future conversation then starts without accurate project context, and the agent makes worse decisions.

### What Update Mode does

1. **Identify what changed** — Read git diff (staged + unstaged) or ask the user what was developed. Understand which features were implemented and which modules were touched.

2. **Find related specs** — Look in `docs/specs/` for specs that correspond to the developed feature. If no spec exists (the user skipped Write Mode), note this but don't block — help them create one retroactively if they want.

3. **Update AC status** — For each spec found, go through the AC list:
   - Read the implementation code to verify whether each AC is satisfied
   - Mark implemented AC as `[x]`
   - Keep unimplemented AC as `[ ]`
   - Add new AC if the implementation revealed behaviors not in the original spec

4. **Update module contracts** — For each module that was modified:
   - Check if the public API changed (new functions, changed signatures, removed methods)
   - Check if new dependencies were introduced
   - Check if invariants still hold or need updating
   - Update `docs/modules/{module}.md` accordingly
   - If a new module was created and no contract exists, offer to create one

5. **Check for ADR candidates** — During development, architectural decisions are often made implicitly. Look for:
   - New dependencies added to package.json
   - New architectural patterns introduced (e.g., first use of a state machine, new data fetching pattern)
   - Technology choices made (e.g., chose library X over library Y)
   - Significant refactoring of existing patterns
   - If any are found, ask the user if they want to record an ADR in `docs/decisions/`

6. **Update CLAUDE.md if needed** — If the project structure changed significantly (new directories, new key files), update the project structure section and documentation index in CLAUDE.md.

### Update Mode output

Present a summary to the user:

```markdown
## Update Report

### Specs Updated
- docs/specs/{feature}.md: AC-01 ✓, AC-02 ✓, AC-03 still pending

### Module Contracts Updated
- docs/modules/{module}.md: added `newMethod()` to public API

### ADR Candidates
- Chose {library} for {purpose} — want to record this? (y/n)

### CLAUDE.md
- No changes needed / Updated project structure
```

---

## Status Mode

This mode computes project progress by scanning existing documentation. It does not generate or modify any files — it reads scope and specs, then reports what's done, what's in progress, and what needs attention.

### How it works

1. **Read scope** — Read `docs/product/scope.md` to get the list of planned features and their priority (P0/P1/P2).

2. **Scan specs** — List all files in `docs/specs/`. For each spec, count AC checkboxes: how many `[x]` vs `[ ]`.

3. **Cross-reference** — Match features in scope against spec files. Classify each feature:

| Status | Condition |
|--------|-----------|
| **Done** | Spec exists, all AC are `[x]` |
| **In Progress** | Spec exists, some AC `[x]` and some `[ ]` |
| **Ready for Dev** | Spec exists, all AC are `[ ]` (spec written but no implementation) |
| **Needs Spec** | Listed in scope but no matching spec file in `docs/specs/` |

4. **Report** — Present the status grouped by category, with links to specs and AC progress counts. For "In Progress" features, list the remaining unchecked AC so the user can see what's left.

### Output format

```markdown
## Project Status

### Done
- ✅ {feature} → [spec](docs/specs/{feature}.md) | AC: N/N

### In Progress
- 🔧 {feature} → [spec](docs/specs/{feature}.md) | AC: X/N
  - Remaining: AC-04 {description}, AC-05 {description}, ...

### Ready for Dev
- 📋 {feature} → [spec](docs/specs/{feature}.md) | AC: 0/N

### Needs Spec
- ⬜ {feature} (P0)
- ⬜ {feature} (P1)

### Summary
| Status | Count |
|--------|-------|
| Done | N |
| In Progress | N |
| Ready for Dev | N |
| Needs Spec | N |
```

---

## Setup Mode

### 1. Scan the project

Before writing anything, understand what exists:

- **Tech stack**: `package.json`, config files, lock files
- **Project structure**: root and key directories
- **Existing docs**: any `.md` files, `CLAUDE.md`, `README.md`
- **Git history**: recent commits for active development areas
- **Modules**: identify distinct functional modules from code structure

Only document what you can confirm from code. Never assume a library is in use — check `package.json` and config files.

### 2. Plan the documentation structure

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
| `guides/testing.md` | Project uses TDD/BDD workflow |
| `guides/dev-workflow.md` | Team follows SDD process |

### 3. Write progressively

Don't create all documents at once. Follow this rhythm:

| Stage | Create |
|-------|--------|
| **Day 0** (before code) | `CLAUDE.md`, `guides/conventions.md` (basics), `product/vision.md` if user can describe the product |
| **First feature** | `specs/{feature}.md` with AC + BDD scenarios |
| **After code exists** | `modules/*.md` (now you know the real architecture) |
| **Agent keeps making mistakes** | Add correction to `guides/conventions.md` |
| **Major technical decision** | ADR in `decisions/` |
| **Integrating APIs** | `guides/data-model.md` |
| **Visual bugs recur** | `guides/design-system.md` |
| **Starting TDD/BDD** | `guides/testing.md`, `guides/dev-workflow.md` |

### 4. Write each document

Read templates in `references/templates.md` for full structure. Key principles:

**CLAUDE.md** — Agent entry point. Concise, declarative, scannable. Under 150 lines. Link to detailed docs.

**product/vision.md** — Why the product exists, who uses it, core value proposition. No implementation details.

**product/scope.md** — What's in MVP, what's explicitly out. Priority tiers (P0/P1/P2). Under 100 lines.

**modules/{name}.md** — Module behavior contract. Defines: responsibilities (what it does and doesn't do), public API (TypeScript signatures), consumed interfaces (dependencies), state machine (if stateful), invariants (conditions that must always hold), error scenarios. No UI details, no implementation specifics — those belong in HOW layer.

**specs/{name}.md** — Feature behavior spec. Defines: one-line goal (user perspective), behavior constraints (precondition/behavior/postcondition triples), state machine, Acceptance Criteria (each one testable), BDD Gherkin scenarios (derived from AC, for E2E tests), TDD unit test pointers (what to test, not how), out of scope. This is the most important document type in SDD — it drives both development and testing.

**decisions/NNN-{title}.md** — Standard ADR: Status → Context → Options → Decision → Consequences.

**guides/testing.md** — Testing pyramid, layer responsibilities, naming conventions, coverage targets, data-testid conventions. Read `references/testing-strategy.md` for the full guide.

**guides/dev-workflow.md** — The SDD→TDD→BDD development process. Read `references/dev-workflow.md` for the full guide.

---

## Audit Mode

Evaluate existing docs against SDD principles on five dimensions:

1. **Layer separation** — Is each doc clearly WHY, WHAT, HOW, or VERIFY? Or are layers mixed?
2. **Spec completeness** — Do specs have testable AC? BDD scenarios? TDD pointers?
3. **Contract clarity** — Do modules have defined interfaces, invariants, error scenarios?
4. **Accuracy** — Does documentation match current codebase? (verify by reading code)
5. **Actionability** — Can a developer write tests directly from the specs?

Present findings as:

```markdown
## SDD Audit Report

### Layer Analysis
- WHY: [status — missing/partial/complete]
- WHAT: [status]
- HOW: [status]
- VERIFY: [status]

### Spec Quality
- [spec]: AC count [N], BDD scenarios [N], testable [yes/no]

### Module Contracts
- [module]: interface defined [yes/no], invariants [yes/no]

### Critical Issues
1. [issue]: [impact on SDD workflow]

### Migration Priority
1. [highest impact action]
```

---

## Migrate Mode

For restructuring existing docs to SDD four-layer architecture:

### 1. Map existing docs to layers

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

### 2. Execute migration

Order matters — migrate in dependency order:

1. Create directory structure (`product/`, `modules/`, `guides/`)
2. Move HOW-layer docs (no content changes, just path)
3. Supplement missing ADRs for undocumented decisions
4. Split WHY-layer docs (extract vision and scope from PRD)
5. Rewrite WHAT-layer (module contracts from architecture, specs with AC+BDD)
6. Create VERIFY-layer guides (`testing.md`, `dev-workflow.md`)
7. Update CLAUDE.md and doc site config
8. Delete obsolete files

### 3. Verify migration

- Every old doc is either migrated, split, or intentionally deleted
- No orphan links in CLAUDE.md or doc site sidebar
- Each spec has at least one AC with BDD scenario

---

## Principles

- **Spec-first**: No feature starts without a spec. No spec exists without testable AC.
- **Text-first**: Agents can't read images or diagrams. Describe everything in text.
- **Behavior over UI**: Specs define what the system does, not what it looks like.
- **AC = Test**: Every Acceptance Criterion maps to exactly one test. No exceptions.
- **Keep docs alive**: Outdated docs are worse than no docs. When implementation changes, update the spec's AC status immediately — this is what Update Mode automates.
- **Don't duplicate code**: Reference file paths instead of pasting code that will go stale.
- **Progressive detail**: WHY is stable (changes quarterly), WHAT changes per feature, HOW changes per implementation.
- **Language**: Match existing docs. If starting fresh, use the language the user communicates in.

---

## References

| Topic | When to read | File |
|-------|-------------|------|
| All document templates | Creating any document | [templates](references/templates.md) |
| SDD→TDD→BDD workflow | Setting up dev process or onboarding | [dev-workflow](references/dev-workflow.md) |
| Testing strategy | Defining test pyramid and conventions | [testing-strategy](references/testing-strategy.md) |
