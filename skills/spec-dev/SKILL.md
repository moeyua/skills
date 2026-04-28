---
name: spec-dev
description: "Spec-Driven Development workflow (SDD+TDD+BDD) used as bookends around feature-dev — write specs before development, sync docs after. Six modes cover the lifecycle: Write, Sync, Rewrite, Status, Setup, Audit. The Sync vs Rewrite split enforces anchoring discipline — Sync for mechanical local edits where anchoring on existing content is fine, Rewrite for structural changes via sequential isolation (old version is a facts pool, never a template). Triggers when the user wants to write or refine feature specs, update AC status after coding, audit or restructure docs, convert legacy docs to SDD, create module contracts, or check project progress — e.g. 'write a spec', 'sync docs', 'rewrite this section', 'audit my docs', 'create module contract', '精简文档', '看一下进度', '接下来做什么', 'legacy 文档转 SDD'. Also triggers on mentions of acceptance criteria, BDD scenarios, spec-first development, or the four-layer doc architecture (WHY/WHAT/HOW/VERIFY)."
metadata:
  author: Moeyua
  version: "2026.4.28"
  source: Manual
---

# Spec-Dev — Spec-Driven Development Documentation System

## Core Concepts

This skill integrates **SDD + TDD + BDD** around a single invariant: `Spec → AC → Test`. Every AC carries a three-state marker (`[x]` tested, `[~]` untested debt, `[ ]` pending), and every document belongs to one of four layers (WHY / WHAT / HOW / VERIFY).

Read [concepts](references/concepts.md) once before using any mode — it defines the invariant, the three-state system, the four-layer architecture, and how SDD/TDD/BDD divide responsibilities. The mode files reference it instead of redefining it.

## How This Skill Fits Your Workflow

This skill is designed to work as **bookends around feature-dev** — you use it before development to define what to build, and after development to update documentation.

```
spec-dev(Write) → feature-dev(全部7阶段) → spec-dev(Sync) → commit-push-pr
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
| Update docs after dev | Sync mode | — |
| Project-level doc setup | Setup / Audit / Rewrite | — |

## Modes

| Mode | When to trigger | Produces |
|------|-----------------|----------|
| **Write** | Before feature-dev — user wants to define a feature | `docs/specs/{feature}.md` with Scope + AC + Verification |
| **Sync** | After feature-dev, or any local doc update — small mechanical changes | AC status flips, new contract rows, ADR suggestions, link repairs (anchoring on existing content is OK) |
| **Rewrite** | Structural changes — format conversion, restructure, replace section | New doc produced from scratch via sequential isolation; old version is a facts pool, never a template |
| **Status** | User wants to see progress or decide what's next | Read-only progress report across all specs |
| **Setup** | New project or no docs exist | Full four-layer doc skeleton, written progressively |
| **Audit** | Docs exist, want compliance + drift report | Pass/fail report **plus drift findings**, with per-finding fix-mode recommendation (Sync vs Rewrite) — does not modify files |

### Choosing a mode

The two read-only modes (Status, Audit) are always safe to run. The decision tree for the modifying modes:

```
No docs/ directory yet                    → Setup
Defining a new feature                    → Write
Small mechanical change (status, link, row)
  — anchoring on existing content is fine → Sync
Structural change (restructure, convert,
  replace section, fundamental rewrite)
  — anchoring would corrupt the result    → Rewrite
```

The **Sync vs Rewrite boundary** is the critical decision: if you'd describe the change as "fix this row" or "add this row", Sync. If you'd describe it as "redo this section" or "restructure this doc", Rewrite. See [sync-mode](references/sync-mode.md) and [rewrite-mode](references/rewrite-mode.md) for details — they explicitly enforce different anchoring discipline.

Audit recommends the right fix mode per finding, so running Audit before any modifying action is the most reliable path.

---

Each mode has a dedicated reference file with the full procedure and output format:

- **Write** → [write-mode](references/write-mode.md) — 7-step collaborative flow, scaling guide, module contracts
- **Sync** → [sync-mode](references/sync-mode.md) — git-diff or audit-driven mechanical updates with anchoring permission
- **Rewrite** → [rewrite-mode](references/rewrite-mode.md) — three-pass sequential isolation procedure (design structure → port facts → completeness check); covers format conversion as a special case
- **Status** → [status-mode](references/status-mode.md) — scope + spec scan, feature classification
- **Setup** → [setup-mode](references/setup-mode.md) — scan checklist, progressive rhythm, per-doc guidance
- **Audit** → [audit-mode](references/audit-mode.md) — structural checks + drift detection, per-finding Sync/Rewrite recommendation

---

## Principles

Conceptual principles (Spec→AC→Test, three-state AC, four-layer architecture, WHY/WHAT/HOW change frequencies) live in [concepts](references/concepts.md). The rules below apply to *how you write* across all modes:

- **Text-first**: No images — agents can't read them. Use text and Mermaid for diagrams (Mermaid source is structured text that agents understand).
- **Behavior over UI**: Specs define what the system does, not what it looks like. No pixel values, colors, or button labels in AC.
- **Keep docs alive**: Outdated docs are worse than no docs. When implementation changes, update the spec's AC status immediately — this is what Sync Mode automates.
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
| Sync mode | Mechanical doc updates after a code change | [sync-mode](references/sync-mode.md) |
| Rewrite mode | Structural rewrites with sequential isolation (incl. legacy → SDD format conversion) | [rewrite-mode](references/rewrite-mode.md) |
| Status mode | Checking project progress | [status-mode](references/status-mode.md) |
| Setup mode | Initializing project documentation | [setup-mode](references/setup-mode.md) |
| Audit mode | Compliance + drift detection with per-finding fix-mode recommendation | [audit-mode](references/audit-mode.md) |
