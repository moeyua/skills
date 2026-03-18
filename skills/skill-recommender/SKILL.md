---
name: skill-recommender
description: "Detect the project's tech stack and recommend relevant skills to install. Use this skill when the user asks to find skills, wants skill recommendations, says things like 'what skills should I install', 'recommend skills for this project', 'find skills for my stack', starts a new project and wants to set up skills, or asks 'are there skills for X'. Also trigger when the user mentions npx skills, skills.sh, or wants to browse available skills."
metadata:
  author: Moeyua
  version: "2026.3.18"
  source: Manual
---

# Skill Recommender

Detect the project's tech stack and recommend skills from a curated list. Fall back to `npx skills find` for anything not covered.

---

## Step 1: Detect Tech Stack

Scan the project to build a tech profile. Go beyond package.json — look at the project holistically.

### 1.1 Package dependencies

Read `package.json` (and `package.json` files in workspace packages if monorepo). Extract:
- Frameworks: vue, nuxt, react, next, svelte, solid, astro, etc.
- Build tools: vite, webpack, turbopack, tsdown, tsup, rollup, etc.
- Testing: vitest, jest, playwright, cypress, etc.
- CSS: unocss, tailwindcss, etc.
- State management: pinia, vuex, zustand, jotai, etc.
- Utilities: vueuse, lodash, etc.
- Package manager: check for `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `package-lock.json`

### 1.2 Project-level signals

These are things package.json won't tell you:

| Signal | What it indicates |
|--------|-------------------|
| `pnpm-workspace.yaml` or `turbo.json` or `apps/` + `packages/` | Monorepo |
| `Dockerfile` or `docker-compose.yml` | Containerized deployment |
| `prisma/` or `drizzle.config.*` or `kysely` | Database / ORM |
| `.github/workflows/` | CI/CD pipelines |
| `e2e/` or `playwright.config.*` or `cypress.config.*` | E2E testing |
| `i18n/` or `locales/` or `**/[locale]/**` route patterns | Internationalization |
| `docs/` or `CLAUDE.md` or `vitepress` or `nextra` | Documentation system |
| `src/server/` or `server/` or `api/` | Backend / API layer |
| `src/components/` with many files | Component-heavy UI project |
| Open source indicators (LICENSE, detailed README, CONTRIBUTING.md) | OSS project conventions matter |
| `.vscode/` or `.cursor/` or `.claude/` | Editor/AI tooling setup |

### 1.3 Build the tech profile

Compile findings into a simple list, e.g.:
```
Detected: vue, nuxt, pinia, vueuse, unocss, vitest, pnpm, monorepo, typescript, e2e-testing
```

Present this to the user: "I detected the following tech stack in your project: ..." and ask if anything is missing or incorrect before proceeding.

---

## Step 2: Match Against Curated List

Read `recommendations.json` (in this skill's directory) to find matching skills.

The JSON maps tech keywords to skill install commands:
```json
{
  "vue": ["antfu/skills -s vue", "antfu/skills -s vue-best-practices"],
  "pnpm": ["antfu/skills -s pnpm"]
}
```

For each detected technology, collect all matching entries. Deduplicate (same repo may appear multiple times across different keys).

Present recommendations grouped by source:

```
Based on your tech stack, here are skills from my curated list:

From antfu/skills:
  - vue (Vue 3 Composition API core)
  - vue-best-practices (Vue best practices)
  - nuxt (Nuxt full-stack framework)
  - pinia (Vue state management)
  - unocss (Atomic CSS engine)
  - vitest (Unit testing framework)
  - vite (Build tool)
  - pnpm (Package manager)

From vueuse/vueuse:
  - vueuse-functions (VueUse composables)

Install all with:
  npx skills add antfu/skills -s vue,vue-best-practices,nuxt,pinia,unocss,vitest,vite,pnpm
  npx skills add vueuse/vueuse -s vueuse-functions
```

If curated list fully covers the detected stack, ask the user which ones to install and stop here.

---

## Step 3: Search for Uncovered Tech

If any detected technology has no match in the curated list, use `npx skills find` to search:

```bash
npx skills find <technology>
```

Present the search results to the user. For each useful result found, ask:

> "I found `owner/repo -s skill-name` for {technology}. Want me to:
> 1. Install it
> 2. Install it AND add it to my curated list for future recommendations
> 3. Skip it"

If the user chooses option 2, update `recommendations.json` by adding the new entry under the appropriate technology key.

---

## Step 4: Install

After the user confirms their selection, run the install commands:

```bash
npx skills add <repo> -s <skills> -a claude-code -a universal -y
```

Default to `-a claude-code -a universal` (install to `.agents/` with Claude Code symlink). Do NOT use `--all` — it installs to every detected agent directory and creates unwanted clutter. If the user wants to install globally, add `-g`.

---

## Updating recommendations.json

When adding a new entry:
1. Read the current `recommendations.json`
2. Add the new skill under the matching technology key (create the key if it doesn't exist)
3. Write back the file
4. Inform the user: "Added `owner/repo -s skill-name` to curated list under `{technology}`."

Keep entries sorted alphabetically by key for readability.
