---
name: templates-why
description: "WHY layer templates — product vision, scope, and glossary. Stable documents that define purpose, boundaries, and shared language."
---

# WHY Layer Templates

The WHY layer answers "why does this exist?". These documents are stable — they change quarterly at most. They drive product decisions and resolve ambiguity.

Contents:
1. [Product Vision](#product-vision-template) — positioning and core value
2. [Product Scope](#product-scope-template) — feature prioritization and boundaries
3. [Glossary](#glossary-template) — domain terminology shared across all docs

---

## Product Vision Template

```markdown
# Product Vision

## Positioning

{One sentence: what is this product?}

## Target Users

- {User type 1}: {their pain point, what they need}
- {User type 2}: {their pain point, what they need}

## Core Value

Why users choose this over alternatives:

1. {Value 1}
2. {Value 2}
3. {Value 3}

## Success Metrics

- {Metric 1: e.g., user can complete core workflow in under 3 minutes}
- {Metric 2}
```

---

## Product Scope Template

Defines boundaries. Under 100 lines.

```markdown
# Product Scope

## P0 — Must have (MVP)

- {Feature A}: {one-sentence description}
- {Feature B}: {one-sentence description}

## P1 — Should have

- {Feature C}: {one-sentence description}

## P2 — Nice to have

- {Feature D}: {one-sentence description}

## Explicitly Out of Scope

These are intentionally excluded. Do not implement them:

- {Thing X}: {why excluded}
- {Thing Y}: {why excluded}

## Non-functional Requirements

| Item | Requirement |
|------|-------------|
| Browser support | {e.g., Chrome, Edge, Safari latest} |
| Responsive | {e.g., Desktop-first, min 1280px} |
| Performance | {e.g., smooth at 100+ nodes on canvas} |
| Theme | {e.g., Dark theme only for MVP} |
| Persistence | {e.g., localStorage for MVP} |
```

---

## Glossary Template

Defines domain terminology used across all documents. Prevents miscommunication between team members and agents. Update when a new domain concept is introduced.

```markdown
# Glossary

| Term | Definition | Context |
|------|-----------|---------|
| {Term} | {Precise definition in this project's context} | {Where this term is used — e.g., specs, module contracts, UI} |
| {Term} | {Definition} | {Context} |
```

Keep entries sorted alphabetically. If a term has a different meaning in general usage vs. this project, note the distinction explicitly.
