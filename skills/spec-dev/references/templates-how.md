---
name: templates-how
description: "HOW layer templates — ADRs, coding conventions, and design system. Documents that describe implementation choices and rules."
---

# HOW Layer Templates

The HOW layer answers "how is it built?". These documents change per implementation. They record choices (ADRs) and rules (conventions, design system) that agents and developers must follow when writing code.

Contents:
1. [ADR](#adr-template) — architectural decision records
2. [Conventions](#conventions-template) — coding rules agents must follow
3. [Design System](#design-system-template) — visual rules for frontend projects

---

## ADR Template

Records architectural decisions with enough context to understand them later.

```markdown
# ADR-{NNN}: {Decision Title}

## Status

{Accepted | Superseded by ADR-NNN | Deprecated}

## Context

{What situation led to this decision? What constraints exist?}

## Options Considered

### Option A: {Name}
- Pros: {advantages}
- Cons: {disadvantages}

### Option B: {Name}
- Pros: {advantages}
- Cons: {disadvantages}

## Decision

Chose **Option {X}**.

{1-3 sentences: the key tradeoff that made this the right choice.}

## Consequences

**Positive:**
- {benefit}

**Negative / Known risks:**
- {tradeoff}

**Follow-up actions:**
- {what needs to happen as a result}

## Revisit When

{Under what conditions should this decision be re-evaluated?}
```

---

## Conventions Template

Rules an agent must follow when writing code.

```markdown
# Coding Conventions

## File Naming

- Components: {pattern, e.g., `PascalCase.vue`}
- Composables/Hooks: {pattern, e.g., `useCamelCase.ts`}
- Stores: {pattern}
- Utils: {pattern}
- Tests: {pattern, e.g., `[name].test.ts` for unit, `[name].spec.ts` for E2E}

## Directory Placement

- {Rule 1: where new components go}
- {Rule 2: where new services go}
- {Rule 3: where tests go}

## Component Patterns

- {Rule: e.g., Use `<script setup lang="ts">`}
- {Rule: Props/Emits must be typed}
- {Rule: Max ~200 lines per component}

## State Management

- {When to use local state}
- {When to use global store}
- {When to use server state}

## Styling

- {Approach: e.g., utility-first with Tailwind}
- {Specific rules: e.g., use canonical class names}

## TypeScript

- {Strict mode rules}
- {interface vs type guidance}

## Import Order

{Groups and ordering rules}

## Testing Conventions

- Unit tests: AAA pattern (Arrange/Act/Assert), one assertion per behavior
- Integration tests: test public API of stores and composables
- E2E tests: map to BDD scenarios in specs, use `data-testid` attributes
- Test naming: `it('should {expected behavior} when {condition}')`

## Git

- Branch naming: {pattern}
- Commit messages: {convention, e.g., conventional commits}
```

---

## Design System Template

Only for frontend projects with custom visual rules.

```markdown
# Design System

## Style Direction

{1-2 sentences: overall visual feel}

## Colors

### Base Palette
{Primary, neutral, background colors with values}

### Semantic Colors
{Success, warning, error, info}

### Domain Colors (if applicable)
{Project-specific color assignments}

## Typography

{Font family, size scale, weight scale}

## Spacing & Radius

{Base unit, border radius scale}

## Shadows

{Shadow definitions by usage context}

## Animation

{Default transitions, motion preferences}

## Component Library Overrides

{Only document customizations beyond the library defaults}

## Responsive Strategy

{Breakpoints, minimum supported width}
```
