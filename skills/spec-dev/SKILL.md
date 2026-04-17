---
name: spec-dev
description: "Spec-Driven Development workflow (SDD+TDD+BDD) used as bookends around feature-dev — write specs before development, sync docs after. Seven modes cover the lifecycle: Write, Update, Status, Setup, Audit, Migrate, Refine. Triggers when the user wants to write or refine feature specs, update AC status after coding, audit or restructure docs, create module contracts, or check project progress — e.g. 'write a spec', 'sync docs', 'audit my docs', 'create module contract', '精简文档', '看一下进度', '接下来做什么'. Also triggers on mentions of acceptance criteria, BDD scenarios, spec-first development, or the four-layer doc architecture (WHY/WHAT/HOW/VERIFY)."
metadata:
  author: Moeyua
  version: "2026.4.8"
  source: Manual
---

# Spec-Dev — Spec-Driven Development Documentation System

## Methodology: SDD + TDD + BDD

This skill integrates three practices into one workflow. Each owns a different question:

| Practice | Question | This skill's role |
|----------|----------|-------------------|
| **SDD** (Spec-Driven Development) | What should the system do? | Write specs with behavior constraints and AC before any code exists. Specs are the single source of truth — if spec and code disagree, the spec wins or gets updated. |
| **TDD** (Test-Driven Development) | How do we prove each unit works? | Every AC maps to exactly one test. AC status uses three states: `[x]` implemented + tested, `[~]` implemented but untested, `[ ]` not yet implemented. `[~]` is technical debt, not progress. |
| **BDD** (Behavior-Driven Development) | How do we prove the feature works from the user's perspective? | Derive Gherkin scenarios (Given/When/Then) from AC. These drive E2E and integration tests. Scenarios describe user-visible behavior, not implementation. |

The core invariant across all modes:

```
Spec → AC → Test
```

A feature is not done until every AC is `[x]` — meaning a test exists and passes. This invariant is enforced at every stage: Write defines it, Update verifies it, Audit checks it, Status reports it, Refine repairs it.

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
| **WHY** | Why does this exist? | Vision, scope, glossary | Product decisions |
| **WHAT** | What does each module/feature do? | Architecture, module contracts, feature specs, BDD scenarios | Developers writing code, testers writing tests |
| **HOW** | How is it built? | ADRs, conventions, design system | Developers making implementation choices |
| **VERIFY** | How do we prove it works? | Testing strategy, AC↔test mapping | Test runners, CI, manual testers |

The VERIFY layer is embedded inside WHAT-layer specs (each spec contains its own AC, BDD scenarios, and TDD pointers) plus a standalone testing strategy guide. BDD scenarios can be verified by automated E2E tests or manual testing — the project decides which method to use and documents it in `docs/guides/testing.md`. This keeps verification co-located with the behavior it verifies.

## Modes

| Mode | When | What to do |
|------|------|------------|
| **Write** | Before feature-dev: user wants to define a feature | Write spec with behavior constraints + AC + BDD + TDD pointers |
| **Update** | After feature-dev: development is done, docs need updating | Read code changes → update AC status → update module contracts → suggest ADRs |
| **Status** | User wants to see progress or decide what to work on next | Scan scope + specs → compute status from AC checkboxes → report |
| **Setup** | New project or no docs exist | Scan → plan → write docs progressively |
| **Audit** | Docs exist but may not follow SDD | Evaluate against SDD principles → report → fix |
| **Migrate** | Existing docs need restructuring to SDD layers | Map old docs to new layers → migrate → clean up |
| **Refine** | Docs have drifted from code reality, need restructuring | Read code → cross-reference docs → split / merge / delete / migrate |

---

## Write Mode

Collaborative step-by-step conversation to define a feature spec or module contract before development. Produces `docs/specs/{feature-name}.md` with behavior constraints, AC, BDD scenarios (verified by automated E2E or manual testing), and TDD pointers. Scales by feature size — large features get the full treatment, small ones just need a goal + AC.

Read [write-mode](references/write-mode.md) for the 8-step process, scaling guide, module contract steps, and quality checklist.

---

## Update Mode

Closes the loop after feature-dev — reads git diff, verifies each AC against both implementation AND tests (three-state: `[x]` tested, `[~]` untested, `[ ]` not implemented), updates BDD scenarios, updates module contracts (name/purpose tables, not copied signatures), suggests ADRs, and updates CLAUDE.md.

Read [update-mode](references/update-mode.md) for the 7-step process and output format.

---

## Status Mode

Read-only progress report. Scans scope and specs using three-state AC (`[x]` tested, `[~]` untested, `[ ]` pending), classifies features as Done / Implemented Untested / In Progress / Ready for Dev / Needs Spec. Includes test health summary.

Read [status-mode](references/status-mode.md) for the process and output format.

---

## Setup Mode

Initialize project documentation from scratch. Scans the codebase (including existing tests), plans the doc structure across four layers (WHY/WHAT/HOW/VERIFY), then writes documents progressively. Includes glossary for domain terminology and architecture document for system structure. Testing guides (`testing.md`, `dev-workflow.md`) are created alongside the first spec, not deferred.

Read [setup-mode](references/setup-mode.md) for the scan checklist, target structure, progressive rhythm, and per-document guidance.

---

## Audit Mode

Binary pass/fail doc linter. Checks specs (structure + TDD: every `[x]` AC has a test + BDD: scenarios exist with automated E2E or manual test records), module contracts (API source paths, invariants, boundary, errors), cross-references (scope coverage, orphan specs, dead links), and accuracy (API source files exist, AC status matches reality).

Read [audit-mode](references/audit-mode.md) for all check tables and output format.

---

## Migrate Mode

Restructure existing docs to SDD four-layer architecture. Scans existing tests to set initial AC status (`[x]`/`[~]`/`[ ]`), maps old docs to target layers (old data-model docs are removed — data models reference code files directly), executes migration in dependency order, then runs Audit Mode to verify.

Read [migrate-mode](references/migrate-mode.md) for the mapping table, test scan step, execution order, and verification.

---

## Refine Mode

Restructure doc **content** to match code reality — split, merge, delete, migrate docs so they reflect what the code actually does. Unlike Audit (reports only) or Migrate (restructures format), Refine changes which docs exist and what they cover.

Read [refine-mode](references/refine-mode.md) for detailed steps. Summary:

1. **Build code truth map** — scan modules, features, tests, dependencies to understand what exists
2. **Build doc map** — scan all docs to understand what's documented
3. **Cross-reference** — identify splits, merges, deletes, migrations, missing docs, stale ADRs
4. **Present plan** — show all proposed actions with reasons, wait for confirmation
5. **Execute** — apply changes one by one with user approval, then run Audit Mode to verify

---

## Principles

- **Spec → AC → Test**: The core invariant. No feature starts without a spec, no spec exists without testable AC, no AC is `[x]` without a passing test.
- **Text-first**: No images — agents can't read them. Use text and Mermaid for diagrams (Mermaid source is structured text that agents understand).
- **Behavior over UI**: Specs define what the system does, not what it looks like. No pixel values, colors, or button labels in AC.
- **`[~]` is debt, not progress**: An implemented but untested AC is a promise without proof. Update Mode flags it, Status Mode surfaces it, Audit Mode fails on it.
- **Keep docs alive**: Outdated docs are worse than no docs. When implementation changes, update the spec's AC status immediately — this is what Update Mode automates.
- **Don't duplicate code**: Reference file paths instead of pasting code that will go stale. Module APIs and data models point to source files, not copied signatures or type definitions.
- **Progressive detail**: WHY is stable (changes quarterly), WHAT changes per feature, HOW changes per implementation.
- **Language**: Match existing docs. If starting fresh, use the language the user communicates in.

---

## References

| Topic | When to read | File |
|-------|-------------|------|
| CLAUDE.md template | Writing the agent entry file | [templates-claude](references/templates-claude.md) |
| WHY layer templates (vision, scope, glossary) | Defining product purpose | [templates-why](references/templates-why.md) |
| WHAT layer templates (architecture, module contract, feature spec) | Defining structure and behavior | [templates-what](references/templates-what.md) |
| HOW layer templates (ADR, conventions, design system) | Documenting implementation rules | [templates-how](references/templates-how.md) |
| SDD→TDD→BDD workflow | Setting up dev process or onboarding | [dev-workflow](references/dev-workflow.md) |
| Testing strategy | Defining test pyramid and conventions | [testing-strategy](references/testing-strategy.md) |
| Write mode | Writing feature specs or module contracts | [write-mode](references/write-mode.md) |
| Update mode | Syncing docs after development | [update-mode](references/update-mode.md) |
| Status mode | Checking project progress | [status-mode](references/status-mode.md) |
| Setup mode | Initializing project documentation | [setup-mode](references/setup-mode.md) |
| Audit mode | Linting docs for SDD compliance | [audit-mode](references/audit-mode.md) |
| Migrate mode | Restructuring to SDD layers | [migrate-mode](references/migrate-mode.md) |
| Refine mode | Restructuring docs to match code reality | [refine-mode](references/refine-mode.md) |
