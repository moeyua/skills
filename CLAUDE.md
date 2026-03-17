# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal skills repository for AI coding assistants, inspired by [antfu/skills](https://github.com/antfu/skills). Skills are structured reference documents that AI agents consume to gain domain expertise.

## Commands

```bash
pnpm install              # Install dependencies
pnpm lint                 # Run ESLint
pnpm start init           # Initialize git submodules (sources/ and vendor/)
pnpm start sync           # Update submodules and sync vendor skills into skills/
pnpm start check          # Check submodules for available updates
pnpm start cleanup        # Remove submodules/skills not defined in meta.ts
pnpm start <cmd> -y       # Skip confirmation prompts
```

## Architecture

Three skill source types, all output to `skills/{name}/`:

1. **Generated** — OSS doc repos cloned as submodules in `sources/`, AI reads docs and generates skills following `AGENTS.md` guidelines + `instructions/{project}.md` constraints. Tracked via `GENERATION.md`.
2. **Synced** — Projects with existing skills cloned as submodules in `vendor/`, copied into `skills/` by `pnpm start sync`. Tracked via `SYNC.md`.
3. **Manual** — Hand-written directly in `skills/`.

All three types are registered in `meta.ts` (`submodules`, `vendors`, `manual` exports respectively). The CLI in `scripts/cli.ts` manages submodule lifecycle and sync operations.

### Skill file structure

Each skill has a `SKILL.md` index (with YAML frontmatter: name, description, metadata) and a `references/` directory with one file per concept, named `{category}-{topic}.md` (categories: `core`, `features`, `best-practices`, `advanced`, `integrations`). See `AGENTS.md` for the full specification.

## Code Conventions

- ESLint with `@antfu/eslint-config`: single quotes, no semicolons, no Prettier
- ESLint ignores `vendor/`, `sources/`, `skills/` directories
- TypeScript strict mode, ESNext target, `verbatimModuleSyntax`
- Pre-commit hook runs `lint-staged` on `*.{js,ts}` files

## Adding a New Skill

**Manual:** Add the skill name to `manual` array in `meta.ts`, then create `skills/{name}/SKILL.md` and `skills/{name}/references/` following the spec in `AGENTS.md`.

**Generated:** Add the doc repo URL to `submodules` in `meta.ts`, create `instructions/{name}.md` with project-specific constraints, run `pnpm start init`, then generate the skill following `AGENTS.md`.

**Synced:** Add entry to `vendors` in `meta.ts` with source URL and skill name mapping, run `pnpm start init` then `pnpm start sync`.

## Gotchas

- `meta.ts` is the single source of truth — any skill/submodule not registered there will be flagged for removal by `pnpm start cleanup`
- `pnpm start sync` destructively replaces the target `skills/{name}/` directory each time
- The CLI runs `.ts` files directly via Node.js (requires Node >= 22 with native TS strip support)
