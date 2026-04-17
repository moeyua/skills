---
name: templates-claude
description: "Template for CLAUDE.md — the agent entry point that indexes the rest of the four-layer documentation"
---

# CLAUDE.md Template

CLAUDE.md is the agent's entry point. It doesn't belong to the four layers (WHY/WHAT/HOW/VERIFY) — it points to them. Keep it concise, declarative, scannable. Under 150 lines.

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
| docs/product/vision.md | Understanding product goals |
| docs/product/scope.md | What's in/out of scope |
| docs/product/glossary.md | Understanding domain terminology |
| docs/architecture.md | System structure and module overview |
| docs/modules/ | Module responsibilities and interfaces |
| docs/specs/ | Feature behavior and test criteria |
| docs/decisions/ | Before proposing architectural changes |
| docs/guides/conventions.md | Before writing new code |
| docs/guides/design-system.md | Implementing UI |
| docs/guides/testing.md | Writing tests |
| docs/guides/dev-workflow.md | SDD development process |
```
