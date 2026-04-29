---
name: spec-dev
description: "Spec-Driven Development documentation system (SDD+TDD+BDD) — manages the full lifecycle of WHAT (architecture, modules, specs), HOW (ADRs, code conventions), and VERIFY (testing strategy, AC↔test mapping) layered docs. Self-contained: works on its own without dependence on any other skill or implementation tool. Seven modes cover the lifecycle: Write, Sync, Rewrite, Verify, Status, Setup, Audit. Sync vs Rewrite enforces anchoring discipline (Sync for mechanical local edits, Rewrite for structural changes via sequential isolation). Verify gives [x] AC markers factual backing by reverse-checking code. A Node script layer (scripts/) handles mechanical checks (dead links, AC state drift, literal blacklists, Public API drift) so the prompt layer doesn't sample-scan. Product context (PRODUCT.md) and visual design system (DESIGN.md) live at project root and are upstream context, not maintained here. Triggers when the user wants to write or refine feature specs, update AC status after coding, audit or restructure docs, verify implementation matches specs, convert legacy docs to SDD, create module contracts, or check project progress — e.g. 'write a spec', 'sync docs', 'rewrite this section', 'verify implementation', 'audit my docs', 'create module contract', '精简文档', '看一下进度', '接下来做什么', 'legacy 文档转 SDD'. Also triggers on mentions of acceptance criteria, BDD scenarios, spec-first development, or the WHAT/HOW/VERIFY layered doc architecture."
metadata:
  author: Moeyua
  version: "2026.4.29"
  source: Manual
---

# Spec-Dev — Spec-Driven Development Documentation System

## Core Concepts

This skill integrates **SDD + TDD + BDD** around a single invariant: `Spec → AC → Test`. Every AC carries a three-state marker (`[x]` tested, `[~]` untested debt, `[ ]` pending), and every document spec-dev produces belongs to one of three layers (WHAT / HOW / VERIFY). Product context (`PRODUCT.md`) and visual design system (`DESIGN.md`) are expected at the project root as upstream context, but are out of spec-dev's scope.

Read [concepts](references/concepts.md) once before using any mode — it defines the invariant, the three-state system, the WHAT/HOW/VERIFY layering, and how SDD/TDD/BDD divide responsibilities. The mode files reference it instead of redefining it.

## Positioning

spec-dev is **self-contained**. It owns one job: keeping the WHAT/HOW/VERIFY documentation layer honest across the full feature lifecycle.

```
Write Mode  →  [any implementation process]  →  Sync / Verify Mode
   ↑                                                    ↓
   └─── spec defines behavior        AC status reflects code reality
```

What happens in the middle — whether you write code by hand, with an agent, with another skill, in a different IDE — is **not spec-dev's concern**. spec-dev only requires that when implementation changes, you run Sync (to flip AC states) or Verify (to confirm `[x]` markers are backed by real tests / code).

### What spec-dev owns

| Concern | Mode |
|---------|------|
| Define feature behavior before code | Write |
| Update AC status after code changes | Sync |
| Restructure / convert / replace doc sections | Rewrite |
| Verify `[x]` AC markers are backed by real implementation + tests | Verify |
| Show project progress | Status |
| Initialize WHAT/HOW/VERIFY skeleton for a project | Setup |
| Compliance + drift report (read-only) | Audit |

### What spec-dev does NOT own

- **Implementation** — writing code, debugging, refactoring
- **Code review** — quality of the implementation
- **Product strategy** — lives in `PRODUCT.md` (root, upstream)
- **Visual design** — lives in `DESIGN.md` (root, upstream)
- **Issue / task tracking** — use git, GitHub Issues, Linear, etc.

## Architecture

spec-dev has two layers:

```
┌─────────────────────────────────────────────────────┐
│  Prompt layer (this skill)                         │
│  SKILL.md + references/ — modes, templates, rules  │
│  LLM does: judgment, narrative, collaborative flow │
└────────────────────┬────────────────────────────────┘
                     │ calls
┌────────────────────▼────────────────────────────────┐
│  Script layer (scripts/*.mjs)                       │
│  Pure Node, no dependencies                         │
│  Does: mechanical checks (dead links, AC drift,    │
│        Public API drift, literal blacklists)        │
│  Outputs: human-readable, --json optional           │
│  Exit codes: 0=clean, 1=ERROR found, 2=internal     │
└─────────────────────────────────────────────────────┘
```

**Why two layers**: LLM sample-scans and judges inconsistently. Anything that can be a fact (does this link target exist? does this `[x]` AC have a corresponding test file?) goes to the script layer for 100% coverage and reproducibility. The LLM only handles things that genuinely require judgment (is this AC well-written? does this restructure preserve intent?).

The script layer is invoked from the prompt layer (Audit and Verify modes call into it) and can also be invoked directly from a git hook to catch drift at push time without requiring a skill session.

## Modes

| Mode | When to trigger | Produces |
|------|-----------------|----------|
| **Write** | Defining a new feature | `docs/specs/{feature}.md` with Scope + AC + Verification |
| **Sync** | Small mechanical changes after code change — anchoring on existing content is OK | AC status flips, new contract rows, ADR suggestions, link repairs |
| **Rewrite** | Structural changes — format conversion, restructure, replace section | New doc produced from scratch via sequential isolation; old version is a facts pool, never a template |
| **Verify** | After implementation — confirm `[x]` markers are backed by real code + tests | Per-AC verdict report; downgrades unfounded `[x]` to `[~]` or `[ ]` |
| **Status** | User wants to see progress or decide what's next | Read-only progress report across all specs |
| **Setup** | New project or no docs exist | Full WHAT/HOW/VERIFY doc skeleton |
| **Audit** | Docs exist, want compliance + drift report | Pass/fail report + drift findings, with per-finding fix-mode recommendation |

### Choosing a mode

The three read-only modes (Status, Audit, Verify) are always safe to run. The decision tree for the modifying modes:

```
No docs/ directory yet                    → Setup
Defining a new feature                    → Write
Small mechanical change (status, link, row)
  — anchoring on existing content is fine → Sync
Structural change (restructure, convert,
  replace section, fundamental rewrite)
  — anchoring would corrupt the result    → Rewrite
```

Audit recommends the right fix mode per finding. Verify checks whether `[x]` is real. Running Audit + Verify before any modifying action is the most reliable path.

---

Each mode has a dedicated reference file with the full procedure and output format:

- **Write** → [write-mode](references/write-mode.md)
- **Sync** → [sync-mode](references/sync-mode.md)
- **Rewrite** → [rewrite-mode](references/rewrite-mode.md)
- **Verify** → [verify-mode](references/verify-mode.md)
- **Status** → [status-mode](references/status-mode.md)
- **Setup** → [setup-mode](references/setup-mode.md)
- **Audit** → [audit-mode](references/audit-mode.md)

---

## Preflight (before any modifying action)

Before Write / Sync / Rewrite touches files, self-check and state the result:

```
SPEC_DEV_PREFLIGHT: project_root=ok|missing docs_dir=ok|missing
  mode=<chosen> scope=<file-paths> decisions_loaded=ok|none|n-a
```

If any gate is missing, resolve it first (or ask the user) instead of proceeding. Setup Mode and Audit Mode do not require this gate; Status and Verify are read-only.

---

## Principles

Conceptual principles live in [concepts](references/concepts.md). Cross-mode writing rules:

- **Text-first**: No images. Use text and Mermaid (Mermaid source is structured text agents understand).
- **Behavior over UI**: Specs define what the system does, not what it looks like. **No pixel values, color codes, Tailwind classes, CSS functions in AC** — these belong in `DESIGN.md`. The script layer enforces this with a literal blacklist.
- **Behavior over implementation**: Specs do not name specific functions, files, or classes. Those are implementation choices that change without changing observable behavior.
- **Keep docs alive**: Outdated docs are worse than no docs. When implementation changes, update the spec's AC status immediately — Sync mode automates this; Verify mode catches missed updates.
- **Don't duplicate code**: Reference file paths instead of pasting code. Module APIs and data models point to source files, not copied signatures.
- **Language**: Match existing docs. If starting fresh, use the language the user communicates in.

---

## References

| Topic | When to read | File |
|-------|-------------|------|
| Core concepts (invariant, three-state AC, WHAT/HOW/VERIFY layering, scope vs PRODUCT.md/DESIGN.md, SDD/TDD/BDD) | Always, before first use | [concepts](references/concepts.md) |
| CLAUDE.md template | Writing the agent entry file | [templates-claude](references/templates-claude.md) |
| WHAT layer templates (architecture, module contract, feature spec) | Defining structure and behavior | [templates-what](references/templates-what.md) |
| HOW layer templates (ADR, code conventions) | Documenting implementation rules | [templates-how](references/templates-how.md) |
| SDD→TDD→BDD workflow | Setting up dev process or onboarding | [dev-workflow](references/dev-workflow.md) |
| Testing strategy | Defining test pyramid and conventions | [testing-strategy](references/testing-strategy.md) |
| Write mode | Writing feature specs or module contracts | [write-mode](references/write-mode.md) |
| Sync mode | Mechanical doc updates after a code change | [sync-mode](references/sync-mode.md) |
| Rewrite mode | Structural rewrites with sequential isolation (incl. legacy → SDD format conversion) | [rewrite-mode](references/rewrite-mode.md) |
| Verify mode | Confirm `[x]` markers are backed by code + tests | [verify-mode](references/verify-mode.md) |
| Status mode | Checking project progress | [status-mode](references/status-mode.md) |
| Setup mode | Initializing project documentation | [setup-mode](references/setup-mode.md) |
| Audit mode | Compliance + drift detection with per-finding fix-mode recommendation | [audit-mode](references/audit-mode.md) |
| Open research problems | Long-horizon issues neither spec-dev nor OpenSpec solves | [ROADMAP](ROADMAP.md) |

## How you actually use it

You don't run scripts by hand. Three entry points cover everything:

| Entry point | When | What you do |
|---|---|---|
| **In Claude Code** | Daily — writing / syncing / auditing | Say `audit my docs`, `verify the spec`, `/spec-dev audit`, etc. The corresponding mode runs the relevant scripts in the background and gives you a report. |
| **git pre-push hook** | Every `git push` | Install once (see `scripts/templates/git-hooks/`). After that, drift is caught automatically before code leaves your machine. |
| **`spec-dev` CLI shim** | CI, debugging, sanity checks (rare) | Add `~/.claude/skills/spec-dev/bin` to `PATH`, then `spec-dev audit` / `spec-dev verify` / `spec-dev literals` from any project root. |

The script layer below is the implementation detail Claude Code modes and the hook call into. You never need to type the long `node {skill-path}/scripts/…` form.

## Script layer (implementation reference)

The mechanical checks. Pure ESM Node, no dependencies. Default human-readable output, `--json` available, exit code `1` on any ERROR.

| Script | Purpose | Called by |
|--------|---------|-----------|
| `audit-mechanical.mjs` | Dead links, AC format, missing sections, Public API drift, Test↔AC mapping | Audit mode, git pre-push, `spec-dev audit` |
| `verify.mjs` | Reverse-check each `[x]` AC against test annotations | Verify mode, `spec-dev verify` |
| `check-literals.mjs` | UI / implementation literal blacklist on spec files | Audit mode, `spec-dev literals` |
| `lib/*.mjs` | Shared helpers (markdown walking, table parsing, source export extraction, report formatting) | Internal |
| `schema/*.mjs` | Declarative section / AC / module-contract rules | Internal |

Mode prompts (in `references/`) tell the LLM exactly when and how to invoke each script. Users invoke modes; modes invoke scripts.
