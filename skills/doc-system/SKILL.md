---
name: doc-system
description: "Create, audit, and incrementally improve project documentation systems optimized for AI Agent-driven development. Use this skill whenever the user mentions documentation structure, wants to initialize project docs, asks to audit or improve existing documentation, mentions CLAUDE.md setup, asks about architecture docs, wants to add ADRs (architecture decision records), needs to document business rules or conventions, or says things like 'help me set up docs', 'what docs am I missing', 'improve my documentation', 'create project documentation'. Also trigger when the user mentions making their project more AI-friendly or agent-readable, asks 'how should I organize docs', wants to create a PRD or feature spec, asks about design system documentation, or mentions documentation for a new project. Primarily optimized for frontend projects but applicable to any codebase."
metadata:
  author: Moeyua
  version: "2026.3.17"
  source: Manual
---

# Doc System — Documentation System for AI Agent-Driven Development

Core philosophy: **every time you have to verbally correct an Agent, that correction should become documentation.**

## Modes

Determine which mode to use from the user's request. If ambiguous, start with Audit.

| Mode | When | What to do |
|------|------|------------|
| **Init** | New project or no docs exist | Scan project → generate plan → write documents |
| **Audit** | Docs already exist | Evaluate completeness/accuracy → report → fix |
| **Incremental** | User asks to create or update a specific doc | Read existing → verify against code → targeted edits |

---

## Init Mode

### 1. Scan the project

Gather context before writing anything:

- **Tech stack**: `package.json`, config files (`vite.config.*`, `next.config.*`, `nuxt.config.*`, `tsconfig.json`, etc.)
- **Project structure**: `ls` root and key directories (`src/`, `app/`, `pages/`, `components/`)
- **Existing docs**: any `.md` files, especially `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`
- **Git history**: recent commits to understand active development areas
- **Package manager**: `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, or `bun.lockb`

For frontend projects, also identify: UI framework, styling approach, state management, routing, build tool, component library.

**Only document what you can confirm.** Check `package.json` dependencies and config files to verify what's actually installed. Never assume a library is in use just because it's common for the stack — e.g., don't write "Pinia" in a Vue project unless you see `pinia` in `package.json`. Inaccurate tech stack info is worse than incomplete info because it misleads the Agent into importing non-existent packages.

### 2. Generate a documentation plan

Present a prioritized list to the user for confirmation before proceeding.

#### Target structure

```
project-root/
├── CLAUDE.md                  # Agent entry point (always create)
├── docs/
│   ├── PRD.md                 # Product requirements (always create)
│   ├── architecture.md        # System architecture
│   ├── conventions.md         # Coding conventions and patterns
│   ├── design-system.md       # Visual design rules in text (frontend)
│   ├── data-model.md          # Data model / state shape definitions
│   ├── api-spec.md            # API interface specifications (if applicable)
│   ├── business-rules.md      # Domain knowledge (if applicable)
│   ├── design/                # Visual references for humans (Agent ignores)
│   ├── decisions/             # ADRs — including technology selection decisions
│   └── specs/                 # Feature specifications (one per feature)
└── src/[module]/
    └── CLAUDE.md              # Module-level instructions (large modules only)
```

Not every project needs every document. Use this table to decide:

| Document | Recommend when |
|---|---|
| `CLAUDE.md` | Always |
| `PRD.md` | When user can describe what the product does and who it's for. Don't create a placeholder-only PRD — ask first, write after. |
| `architecture.md` | 3+ modules or non-obvious structure |
| `conventions.md` | Codebase has patterns an agent might violate |
| `design-system.md` | Frontend with custom visual rules beyond the component library |
| `data-model.md` | Complex state, API data, or database models |
| `api-spec.md` | Project consumes or provides APIs |
| `business-rules.md` | Domain logic that cannot be derived from code alone |
| `decisions/` | Team makes architectural or technology choices worth recording |
| `specs/` | Team plans features before implementing |

#### Key boundaries

**PRD vs Specs**: PRD is product-level (what to build, for whom, why — under 100 lines). Specs are feature-level (how exactly to implement — one file per feature in `specs/`). If you're writing interaction flows or component designs in the PRD, that belongs in a spec.

**decisions/ covers technology selection**: "Why Vue instead of React" is an ADR (`decisions/001-frontend-framework.md`), not a separate document. All significant technical choices — framework, styling, state management, deployment target — go here as ADRs.

**design-system.md vs design/**: `design-system.md` is Agent-readable text (colors, spacing, tokens). `design/` is for humans only (Figma, mockups, screenshots). Agents cannot read images.

### 3. Write documents progressively

Don't create all documents at once. Follow this rhythm — it's the most important guideline in this skill because premature documentation goes stale before it's useful:

| Project stage | Create |
|---|---|
| **Day 0** (before code) | `CLAUDE.md` (tech stack + commands), `conventions.md` (basics). For `PRD.md`: ask the user what the product does and who it's for before creating — a PRD full of placeholders adds no value. If the user can't answer yet, skip PRD and create it later. |
| **First feature** | `specs/[feature].md` |
| **After code exists** | `architecture.md` (now you actually know the architecture) |
| **Agent keeps making the same mistake** | Add correction to `conventions.md` or `business-rules.md` |
| **Major technical decision** | ADR in `decisions/` |
| **Integrating APIs** | `api-spec.md`, `data-model.md` |
| **Visual bugs keep appearing** | `design-system.md` |

### 4. Writing each document

Read the templates in `references/templates.md` for the full structure of each document type. Here are the key principles per document:

**CLAUDE.md** — The most important document. Concise, declarative, scannable.
- Declarative over narrative: "Use composables for shared logic" not "We decided to use composables because..."
- Specific over vague: "Name components PascalCase with max 3 words" not "Follow good naming practices"
- Every line should directly inform how to write code
- Under 150 lines — move details into linked documents
- No redundancy with README (CLAUDE.md is for agents, README is for humans)

**architecture.md** — Describe the system in text (agents can't see diagrams): module boundaries, data flow, key abstractions, third-party dependencies. For frontend: component hierarchy, routing structure, state flow.

**conventions.md** — Reduce agent guesswork: file naming, component patterns, state management patterns, styling conventions, TypeScript strictness, import ordering.

**PRD.md** — Product-level "what and why". Under 100 lines. Routine updates: edit directly. Major direction changes: edit AND write an ADR explaining why (prevents Agent from re-introducing removed features).

**decisions/** — Each ADR: Status → Context → Decision → Consequences. Technology choices belong here.

**specs/** — One file per feature: Goal → Acceptance Criteria → Constraints → Design → Out of Scope.

**design-system.md** — Text description of visual rules. If using a component library (Nuxt UI, shadcn), only document project-specific overrides.

**data-model.md** — API response shapes, global state structure, key transformations.

**api-spec.md** — Base URL, auth, endpoints, request/response formats, error structure.

**business-rules.md** — Knowledge that cannot be derived from code: domain terminology, workflows, permissions, edge cases, validation rules.

---

## Audit Mode

Evaluate each existing document on four dimensions:

1. **Completeness** — Does it cover the recommended sections?
2. **Accuracy** — Does it match the current codebase? (verify by reading code)
3. **Conciseness** — Is it scannable, or buried in narrative?
4. **Actionability** — Does every section help an agent make better decisions?

Present findings as:

```
## Documentation Audit Report

### Existing docs
- CLAUDE.md: [status] — [brief assessment]
- ...

### Missing docs (recommended)
- [doc]: [why it would help]

### Improvement suggestions
1. [specific suggestion with before/after example]

### Priority order
1. [highest impact improvement]
```

---

## Incremental Mode

1. Read the existing document
2. Read relevant source code to verify accuracy
3. Make targeted edits — don't rewrite sections that are already good
4. If the update reveals a gap covered by a different document, mention it but don't create unless asked

---

## Principles

- **Text-first**: Agents can't read images, flowcharts, or Figma links. Describe everything in text.
- **Keep docs alive**: Outdated docs are worse than no docs. Flag stale content when you notice it.
- **Don't duplicate code**: Reference file paths instead of pasting snippets that will go stale.
- **Respect existing structure**: If the project already has a docs setup, work within it.
- **Language**: Match the language of existing docs. If starting fresh, use the language the user is communicating in.

---

## References

Read the templates when creating specific documents:

| Topic | Description | Reference |
|-------|-------------|-----------|
| Document Templates | Full templates for all document types with inline guidance | [templates](references/templates.md) |
