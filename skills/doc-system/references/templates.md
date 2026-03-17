---
name: templates
description: "Full markdown templates for all documentation types including CLAUDE.md, PRD, architecture, conventions, design-system, data-model, api-spec, business-rules, ADR, feature spec, and module CLAUDE.md"
---

# Document Templates

This file contains full templates for each document type. When creating documents, adapt these templates to the specific project — don't copy them verbatim. Remove sections that don't apply and add sections that are needed.

---

## Table of Contents

1. [CLAUDE.md Template](#claudemd-template)
2. [PRD Template](#prd-template)
3. [architecture.md Template](#architecturemd-template)
4. [conventions.md Template (Frontend)](#conventionsmd-template-frontend)
5. [design-system.md Template](#design-systemmd-template)
6. [data-model.md Template](#data-modelmd-template)
7. [api-spec.md Template](#api-specmd-template)
8. [business-rules.md Template](#business-rulesmd-template)
9. [ADR Template](#adr-template)
10. [Feature Spec Template](#feature-spec-template)
11. [Module CLAUDE.md Template](#module-claudemd-template)

---

## CLAUDE.md Template

```markdown
# [Project Name]

[One sentence describing what this project does]

## Tech Stack

- Language: TypeScript [version]
- Framework: [e.g., Vue 3.5 / React 19 / Nuxt 4 / Next.js 15]
- Build Tool: [e.g., Vite 6]
- Styling: [e.g., UnoCSS / Tailwind CSS 4 / CSS Modules]
- State Management: [e.g., Pinia / Zustand / Jotai]
- Package Manager: [e.g., pnpm 10]
- Node: >= [version]
- Testing: [e.g., Vitest + Playwright]

## Project Structure

src/
├── components/    # Shared UI components
├── composables/   # Shared logic (Vue) / hooks/ (React)
├── pages/         # Route pages
├── stores/        # Global state
├── services/      # API layer
├── types/         # TypeScript type definitions
└── utils/         # Pure utility functions

## Development Commands

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm lint --fix

## Coding Conventions

- [Rule 1: e.g., Use `<script setup lang="ts">` for all Vue components]
- [Rule 2: e.g., Extract shared logic into composables, not mixins]
- [Rule 3: e.g., API calls go through services/ — components never call fetch directly]
- [Rule 4: e.g., Use TypeScript strict mode — no `any` types]
- [Rule 5: e.g., CSS class names use utility-first approach with UnoCSS]

See docs/conventions.md for the full list.

## Architecture

[2-3 sentences summarizing the architecture]

See docs/architecture.md for details.

## Business Context

[1-2 sentences about the domain if non-obvious]

See docs/business-rules.md for domain terminology and rules.

## Documentation Index

| Document | When to read |
|---|---|
| docs/PRD.md | Understanding product scope, what to build and what not to |
| docs/architecture.md | Understanding module boundaries or data flow |
| docs/conventions.md | Before writing new code or unsure about patterns |
| docs/design-system.md | Implementing UI, choosing colors/spacing/styles |
| docs/data-model.md | Working with API data or global state |
| docs/api-spec.md | Adding or modifying API integrations |
| docs/business-rules.md | Domain logic questions or edge cases |
| docs/specs/ | Implementing a specific feature |
| docs/decisions/ | Before proposing architectural changes |
```

---

## PRD Template

```markdown
# [Product Name]

## Product Positioning

[One sentence: what is this product?]

## Target Users

- [User type 1]: [their pain point]
- [User type 2]: [their pain point]

## Core Value

- [Value 1: why users choose this over alternatives]
- [Value 2]
- [Value 3]

## MVP Scope

### P0 — Must have
- [Feature A]: [one-sentence description]
- [Feature B]: [one-sentence description]

### P1 — Should have
- [Feature C]: [one-sentence description]

### P2 — Nice to have
- [Feature D]: [one-sentence description]

## Explicitly Out of Scope

- [Thing X]: [why it's excluded — prevents Agent from building it]
- [Thing Y]: [reason]

## Non-functional Requirements

| Item | Requirement |
|---|---|
| Browser support | [e.g., Chrome, Edge, Safari latest] |
| Responsive | [e.g., Desktop-first, min 1280px] |
| Theme | [e.g., Dark theme primary] |
| Performance | [e.g., 100+ nodes smooth on canvas] |
| i18n | [e.g., Chinese only for MVP] |
```

The PRD should stay under 100 lines. Detailed feature descriptions belong in `docs/specs/[feature].md`. Version the PRD via git — don't maintain multiple copies. When making major direction changes (dropping a module, pivoting users), also write an ADR in `decisions/` explaining why.

---

## design-system.md Template

```markdown
# Design System

## Style Direction

[1-2 sentences describing the overall visual feel. e.g., "Dark-first, minimal, inspired by Linear and Vercel. Clean edges, subtle shadows, muted colors with bright accents for interactive elements."]

## Colors

### Base Palette
- Primary: [e.g., blue-500 (#3b82f6)]
- Neutral: [e.g., zinc scale]
- Background: [e.g., zinc-950 for dark, white for light]

### Semantic Colors
- Success: [color]
- Warning: [color]
- Error: [color]
- Info: [color]

### Custom Mappings
[Project-specific color assignments, e.g.:]
- Text port: blue-500
- Image port: green-500
- Video port: purple-500

## Spacing

[e.g., Base unit: 4px. Use multiples: 4, 8, 12, 16, 24, 32, 48, 64.]

## Border Radius

[e.g., Default: 8px. Buttons: 6px. Cards: 12px. Modals: 16px.]

## Shadows

[e.g., Cards: `0 1px 3px rgba(0,0,0,0.12)`. Modals: `0 8px 30px rgba(0,0,0,0.24)`.]

## Typography

[e.g., Font: system-default (Inter if loaded). Scale: 12/14/16/20/24/32px.]

## Responsive Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## Dark / Light Mode

[e.g., Dark mode is default. Toggle via CSS class on `<html>`. Use CSS variables for all theme-dependent values.]

## Component Library Overrides

[Only list customizations beyond the default component library theme. e.g.:]
- Button: rounded-lg, font-medium
- Input: bg-zinc-800 border-zinc-700 in dark mode

## Animation

[e.g., Default transition: 150ms ease. Page transitions: 200ms. Avoid animations on reduce-motion preference.]
```

Note: if the project uses a component library (Nuxt UI, shadcn, etc.), most of these values are already defined. Only document project-specific overrides — don't repeat what the library provides. For projects with minimal custom styling, this file can be as short as 20 lines.

---

## architecture.md Template

```markdown
# Architecture

## Overview

[What the system does at a high level. 2-3 sentences.]

## Module Map

### [Module A] — [purpose]
- Location: `src/modules/a/`
- Responsibilities: [what it owns]
- Dependencies: [what it depends on]

### [Module B] — [purpose]
...

## Data Flow

### [Flow Name, e.g., "User Authentication"]
1. User submits credentials on `LoginPage`
2. `authService.login()` sends POST to `/api/auth/login`
3. Response token stored in `authStore`
4. Router guard checks `authStore.isAuthenticated` on navigation
5. Token attached to requests via axios interceptor

### [Flow Name, e.g., "Data Fetching Pattern"]
...

## Component Hierarchy

[Describe the main layout structure]

App
├── Layout
│   ├── Header (navigation, user menu)
│   ├── Sidebar (route-based, collapsible)
│   └── Main
│       └── RouterView (page content)
└── GlobalModals

## State Architecture

- **Local state**: Component-scoped, use `ref`/`reactive` (Vue) or `useState` (React)
- **Shared state**: [Store library] for cross-component state
- **Server state**: [e.g., TanStack Query / SWR / custom composables] for API data
- **URL state**: Router params and query strings for shareable state

## Third-party Dependencies

| Service | Purpose | Docs |
|---|---|---|
| [e.g., Firebase Auth] | Authentication | [internal link if any] |
| [e.g., S3] | File storage | - |

## Build and Deploy

- Build output: `dist/`
- Deployment target: [e.g., Vercel / Cloudflare Pages / Docker]
- Environment variables: loaded from `.env` files, validated at startup
```

---

## conventions.md Template (Frontend)

```markdown
# Coding Conventions

## File Naming

- Components: `PascalCase.vue` / `PascalCase.tsx`
- Composables/hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Types: `camelCase.types.ts` or co-located in the file that uses them
- Tests: `[filename].test.ts` or `[filename].spec.ts`
- Styles: `[filename].module.css` (if using CSS modules)

## Directory Placement

- New page → `src/pages/[route-name]/`
- Shared component used in 2+ pages → `src/components/`
- Component used in only one page → co-locate in that page's directory
- New API integration → `src/services/[resource].ts`
- New global state → `src/stores/[storeName].ts`

## Component Patterns

- [Framework-specific patterns, e.g.:]
- Use `<script setup lang="ts">` (Vue) / function components (React)
- Props must be typed — use `defineProps<{}>()` (Vue) / interface (React)
- Emit events must be typed — use `defineEmits<{}>()` (Vue)
- Prefer composition over inheritance
- Max component size: ~200 lines. If larger, extract sub-components.

## State Management

- **When to use local state**: data used only within one component
- **When to use global store**: data shared across 3+ components or persisted across routes
- **When to use server state cache**: data fetched from API that multiple components need

## Styling

- [e.g., Utility-first with UnoCSS/Tailwind — avoid custom CSS unless necessary]
- [e.g., Use design tokens for colors, spacing, typography]
- [e.g., Responsive breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)]
- [e.g., Dark mode: use CSS variables, toggle via class on `<html>`]

## TypeScript

- Strict mode enabled — no `any`, no `@ts-ignore` without explanation
- Prefer `interface` for object shapes, `type` for unions/intersections
- API response types go in `src/types/` or co-located with the service
- Use `as const` for literal constants, avoid enum (use union types instead)

## Error Handling

- API errors: caught in service layer, transformed to typed error objects
- UI errors: ErrorBoundary components for unexpected crashes
- Form validation: [library, e.g., zod / valibot] schemas
- Loading states: every async operation must have loading + error UI

## Import Order

1. Framework imports (`vue`, `react`)
2. Third-party libraries
3. Internal modules (absolute paths: `@/...`)
4. Relative imports
5. Type imports (at the bottom, using `import type`)

## Git

- Branch naming: `feat/xxx`, `fix/xxx`, `refactor/xxx`
- Commit messages: conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
```

---

## data-model.md Template

```markdown
# Data Model

## Core Entities

### [Entity Name, e.g., User]

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  createdAt: string  // ISO 8601
}

- Source: `GET /api/users/:id`
- Store: `userStore.currentUser`
- Notes: [any nuances]

### [Entity Name, e.g., Project]
...

## State Shape

### Global Stores

[storeName]
├── currentUser: User | null
├── isAuthenticated: boolean
└── preferences: UserPreferences

[anotherStore]
├── items: Item[]
├── selectedId: string | null
└── filters: FilterState

## Key Transformations

- API returns `snake_case`, frontend uses `camelCase` — transformed in service layer
- Dates stored as ISO strings, formatted at display time using [library]
- [Any other important transformations]
```

---

## api-spec.md Template

```markdown
# API Specification

## Base Configuration

- Base URL: `[e.g., /api/v1]`
- Auth: Bearer token in `Authorization` header
- Content-Type: `application/json`

## Error Format

All errors return:

{
  "code": "ERROR_CODE",
  "message": "Human-readable description",
  "details": {}  // optional
}

Common codes: `UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`

## Endpoints

### [Resource: e.g., Users]

#### List users
- `GET /users`
- Query params: `page`, `limit`, `search`, `role`
- Response: `{ data: User[], total: number }`

#### Get user
- `GET /users/:id`
- Response: `User`

#### Create user
- `POST /users`
- Body: `{ name: string, email: string, role: string }`
- Response: `User` (201)

### [Resource: e.g., Projects]
...

## Pagination

All list endpoints support:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- Response includes `total` count

## Rate Limits

[If applicable]
```

---

## business-rules.md Template

```markdown
# Business Rules

## Domain Terminology

| Term | Definition |
|---|---|
| [Term] | [Precise meaning in this project's context] |

## Workflows

### [Workflow Name, e.g., Order Lifecycle]

States: draft → submitted → approved → completed
                         ↘ rejected → draft (can resubmit)

- **draft → submitted**: requires all mandatory fields filled
- **submitted → approved**: requires manager role
- **approved → completed**: automatic after delivery confirmed
- **submitted → rejected**: requires rejection reason

### [Workflow Name]
...

## Permission Model

| Role | Can do | Cannot do |
|---|---|---|
| admin | everything | - |
| editor | create, edit, submit | approve, delete, manage users |
| viewer | read only | - |

## Validation Rules

- [e.g., Username: 3-30 chars, alphanumeric + underscore only]
- [e.g., Project name must be unique within organization]
- [e.g., Max file upload size: 10MB, allowed types: jpg/png/pdf]

## Edge Cases

- [e.g., When a user is deleted, their projects transfer to org admin]
- [e.g., Timezone handling: all dates stored in UTC, displayed in user's local timezone]
```

---

## ADR Template

```markdown
# ADR-NNN: [Short Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-NNN]

## Context

[What is the problem or decision we're facing? What constraints exist?]

## Options Considered

### Option A: [name]
- Pros: [...]
- Cons: [...]

### Option B: [name]
- Pros: [...]
- Cons: [...]

## Decision

[What we decided and why]

## Consequences

- [Positive consequence]
- [Negative consequence / trade-off]
- [What this means for future development]
```

---

## Feature Spec Template

```markdown
# Feature: [Name]

## Goal

[What problem does this solve? Who benefits?]

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Constraints

- [Technical limitations]
- [Business rules that apply]
- [Timeline if relevant]

## Design

### Components
- [Component structure and responsibilities]

### Data Flow
- [How data moves through the feature]

### State Changes
- [What state is created/modified]

### API Dependencies
- [Endpoints needed]

## Out of Scope

- [Explicitly list what this feature does NOT do]

## References

- [Related code paths]
- [Design mockups]
- [Related features or ADRs]
```

---

## Module CLAUDE.md Template

```markdown
# [Module Name]

## Purpose
[What this module does — 1-2 sentences]

## Key Files
- `index.ts` — module entry point
- `[key-file]` — [purpose]

## Patterns specific to this module
- [Any conventions that differ from or extend the project-level conventions]

## Common tasks
- To add a new [X]: [steps]
- To modify [Y]: [steps]
```
