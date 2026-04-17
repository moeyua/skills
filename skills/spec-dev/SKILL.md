---
name: spec-dev
description: "Spec-Driven Development workflow (SDD+TDD+BDD) used as bookends around feature-dev — write specs before development, sync docs after. Seven modes cover the lifecycle: Write, Update, Status, Setup, Audit, Migrate, Refine. Triggers when the user wants to write or refine feature specs, update AC status after coding, audit or restructure docs, create module contracts, or check project progress — e.g. 'write a spec', 'sync docs', 'audit my docs', 'create module contract', '精简文档', '看一下进度', '接下来做什么'. Also triggers on mentions of acceptance criteria, BDD scenarios, spec-first development, or the four-layer doc architecture (WHY/WHAT/HOW/VERIFY)."
metadata:
  author: Moeyua
  version: "2026.4.17"
  source: Manual
---

# Spec-Dev — Spec-Driven Development Documentation System

## Core Concepts

This skill integrates **SDD + TDD + BDD** around a single invariant: `Spec → AC → Test`. Every AC carries a three-state marker (`[x]` tested, `[~]` untested debt, `[ ]` pending), and every document belongs to one of four layers (WHY / WHAT / HOW / VERIFY).

Read [concepts](references/concepts.md) once before using any mode — it defines the invariant, the three-state system, the four-layer architecture, and how SDD/TDD/BDD divide responsibilities. The mode files reference it instead of redefining it.

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

## Modes

| Mode | When to trigger | Produces |
|------|-----------------|----------|
| **Write** | Before feature-dev — user wants to define a feature | `docs/specs/{feature}.md` with Scope + AC + Verification |
| **Update** | After feature-dev — development is done, docs need syncing | Updated AC status, module contracts, ADR suggestions |
| **Status** | User wants to see progress or decide what's next | Read-only progress report across all specs |
| **Setup** | New project or no docs exist | Full four-layer doc skeleton, written progressively |
| **Audit** | Docs exist but compliance is unclear | Pass/fail report — does not modify files |
| **Migrate** | Existing docs need restructuring to SDD layers | Old docs mapped and migrated to four-layer format |
| **Refine** | Docs have drifted from code reality | Split / merge / delete / create docs to match code |

### Choosing a mode

Three modes operate on existing docs and are easy to confuse. Use this quick decision:

```
No docs/ directory yet               → Setup
Docs exist, old structure (pre-SDD)  → Migrate   (one-shot format conversion)
Docs follow SDD, want compliance     → Audit     (reports only, no changes)
Docs follow SDD, but don't match code → Refine    (changes what docs exist)
```

Write and Update are the high-frequency modes — they bookend each feature. Status is read-only and safe to run anytime.

---

Each mode has a dedicated reference file with the full procedure and output format:

- **Write** → [write-mode](references/write-mode.md) — 7-step collaborative flow, scaling guide, module contracts
- **Update** → [update-mode](references/update-mode.md) — git-diff driven AC/contract/ADR sync
- **Status** → [status-mode](references/status-mode.md) — scope + spec scan, feature classification
- **Setup** → [setup-mode](references/setup-mode.md) — scan checklist, progressive rhythm, per-doc guidance
- **Audit** → [audit-mode](references/audit-mode.md) — all check tables and report format
- **Migrate** → [migrate-mode](references/migrate-mode.md) — old→new layer mapping, execution order
- **Refine** → [refine-mode](references/refine-mode.md) — code-truth map, cross-reference, split/merge/delete/migrate actions

---

## Principles

Conceptual principles (Spec→AC→Test, three-state AC, four-layer architecture, WHY/WHAT/HOW change frequencies) live in [concepts](references/concepts.md). The rules below apply to *how you write* across all modes:

- **Text-first**: No images — agents can't read them. Use text and Mermaid for diagrams (Mermaid source is structured text that agents understand).
- **Behavior over UI**: Specs define what the system does, not what it looks like. No pixel values, colors, or button labels in AC.
- **Keep docs alive**: Outdated docs are worse than no docs. When implementation changes, update the spec's AC status immediately — this is what Update Mode automates.
- **Don't duplicate code**: Reference file paths instead of pasting code that will go stale. Module APIs and data models point to source files, not copied signatures or type definitions.
- **Language**: Match existing docs. If starting fresh, use the language the user communicates in.

---

## References

| Topic | When to read | File |
|-------|-------------|------|
| Core concepts (invariant, three-state AC, four layers, SDD/TDD/BDD) | Always, before first use | [concepts](references/concepts.md) |
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
