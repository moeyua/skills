---
name: concepts
description: "Core concepts shared across all spec-dev modes — the Spec→AC→Test invariant, three-state AC, four-layer architecture, and the SDD+TDD+BDD integration. Read once; the mode files reference it."
---

# Core Concepts

All spec-dev modes share the same conceptual foundation. This document is the single source of truth — the mode files reference it instead of redefining it.

## The Core Invariant: Spec → AC → Test

```
Every feature has a spec.
Every spec has Acceptance Criteria.
Every AC maps to exactly one test.
```

A feature is not done until every AC is `[x]` — meaning a test exists and passes. This invariant is enforced at every stage:

- **Write** defines AC + its test direction
- **Update** verifies implementation and test against each AC
- **Audit** checks compliance
- **Status** reports progress
- **Refine** repairs drift

If spec and code disagree, the spec wins or gets updated. Silent divergence is the worst state — it makes every future session start from a false premise.

## Three-State Acceptance Criteria

Each AC carries one of three states. The state reflects both implementation AND test coverage:

| State | Meaning | Implication |
|-------|---------|-------------|
| `[x]` | Implemented AND has a passing test | Complete |
| `[~]` | Implemented but NO test exists | Technical debt — a promise without proof |
| `[ ]` | Not yet implemented | Pending work |

`[~]` is **debt, not progress**. Sync Mode flags it, Status Mode surfaces it, Audit Mode fails on it. The three-state system prevents the common anti-pattern where "implemented but untested" masquerades as "done".

To determine the state, check both conditions:
- Is the behavior present in the codebase? → if no, `[ ]`
- Does a test verify it (unit / integration / E2E / manual checklist entry)? → if no, `[~]`; if yes, `[x]`

## The Four-Layer Architecture

Every document belongs to exactly one layer. Layers depend downward only:

| Layer | Question | Contents | Change frequency |
|-------|----------|----------|------------------|
| **WHY** | Why does this exist? | Vision, scope, glossary | Quarterly |
| **WHAT** | What does each module/feature do? | Architecture, module contracts, feature specs, BDD scenarios | Per feature |
| **HOW** | How is it built? | ADRs, conventions, design system | Per implementation |
| **VERIFY** | How do we prove it works? | Testing strategy, AC↔test mapping | With WHAT |

The VERIFY layer is embedded inside WHAT-layer specs — each spec contains its own AC, BDD scenarios, and TDD pointers — plus a standalone testing strategy guide in HOW. This keeps verification co-located with the behavior it verifies.

BDD scenarios can be verified by automated E2E tests or a manual test checklist. The project decides which and records it in `docs/guides/testing.md`.

## SDD + TDD + BDD

This skill integrates three practices. They are **not** layered alternatives — they operate together on the same spec, each owning a different question:

| Practice | Question | Role in this skill |
|----------|----------|--------------------|
| **SDD** (Spec-Driven Development) | What should the system do? | Write specs with behavior constraints and AC before any code exists. Specs are the single source of truth. |
| **TDD** (Test-Driven Development) | How do we prove each unit works? | Every AC maps to exactly one test, tracked via three-state. |
| **BDD** (Behavior-Driven Development) | How do we prove it works from the user's perspective? | Derive Gherkin scenarios from AC. These drive E2E and integration tests. Scenarios describe user-visible behavior, not implementation. |

SDD owns the spec; TDD owns unit-level verification; BDD owns user-visible verification. A complete feature touches all three.
