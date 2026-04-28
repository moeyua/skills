---
name: templates-claude
description: "Template for CLAUDE.md — the agent entry point that indexes upstream context (PRODUCT.md, DESIGN.md) and the spec-dev managed docs"
---

# CLAUDE.md Template

CLAUDE.md is the agent's entry point. It doesn't belong to the layers spec-dev manages (WHAT / HOW / VERIFY) — it points to them, plus to the upstream `PRODUCT.md` and `DESIGN.md` (when present). Keep it concise, declarative, scannable. Under 150 lines.

```markdown
# {Project Name}

{One sentence: what this project does.}

## Tech Stack

- Language: {e.g., TypeScript}
- Framework: {e.g., Nuxt 4 / Next.js 15 / SvelteKit}
- UI: {e.g., Nuxt UI v4 / shadcn}
- State: {e.g., Pinia / Zustand}
- Testing: {e.g., Vitest + Playwright}
- Styling: {e.g., Tailwind CSS 4}
- Package Manager: {e.g., pnpm 10}
- Node: >= {version}

## Project Structure

{Minimal tree showing key directories and their purpose}

## Development Commands

{Essential commands only: install, dev, build, test, lint}

## Coding Conventions

{Top 5-7 rules. Link to docs/guides/conventions.md for full list.}

## Development Methodology

This project follows SDD (Spec-Driven Development) with TDD and BDD:
- Every feature starts with a spec in `docs/specs/`
- Specs contain Acceptance Criteria that map 1:1 to tests
- Module contracts in `docs/modules/` define interface boundaries

See docs/guides/dev-workflow.md for the full process.

## Documentation Index

| Document | When to read |
|----------|-------------|
| ./PRODUCT.md | Product positioning, target users, brand, design intent |
| ./DESIGN.md | Visual design system — tokens, typography, components, named rules (frontend only) |
| docs/architecture.md | System structure and module overview |
| docs/modules/ | Module responsibilities and interfaces |
| docs/specs/ | Feature behavior and test criteria |
| docs/decisions/ | Before proposing architectural changes |
| docs/guides/conventions.md | Before writing new code |
| docs/guides/testing.md | Writing tests |
| docs/guides/dev-workflow.md | SDD development process |
```
