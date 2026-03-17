# Skill Generation Guidelines

This document guides AI agents on how to generate skills for this repository.

## Skill Structure

Each skill lives in `skills/{name}/` with the following structure:

```
skills/{name}/
├── SKILL.md              # Index file (required) with frontmatter metadata
├── GENERATION.md         # Only for generated skills: source SHA info
├── SYNC.md               # Only for synced skills: source SHA info
└── references/           # Individual reference files
    ├── core-*.md
    ├── features-*.md
    ├── best-practices-*.md
    ├── advanced-*.md
    └── ...
```

## SKILL.md Format

```markdown
---
name: {kebab-case-name}
description: {brief description of when to use this skill}
metadata:
  author: Moeyua
  version: "{YYYY.M.DD}"
  source: {source URL or "Manual"}
---

> The skill is based on {project} v{version}, generated at {date}.

Brief project introduction / context.

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Topic Name | Brief description | [reference-name](references/reference-name.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| ... | ... | ... |

## Best Practices

| Topic | Description | Reference |
|-------|-------------|-----------|
| ... | ... | ... |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| ... | ... | ... |

## Quick Reference
(Optional: common code templates and imports)
```

## Reference File Format

```markdown
---
name: {reference-name}
description: {brief description}
---

# {Concept Name}

Brief description of what this reference covers.

## Usage

Code examples and practical patterns.

## Key Points

- Point 1
- Point 2

<!--
Source references:
- {source-url-1}
- {source-url-2}
-->
```

## Key Principles

1. **One concept per file** - Each reference file covers a single topic
2. **File naming**: `{category}-{topic}.md` (e.g., `core-config.md`, `features-mocking.md`)
3. **Categories**: `core`, `features`, `best-practices`, `advanced`, `integrations`, `preset`
4. **Rewrite for agents** - Don't copy docs verbatim; restructure for AI consumption
5. **Focus on practical examples** - Prioritize code snippets and patterns
6. **Source attribution** - Include source doc links in HTML comments at the end
7. **Keep it current** - Skills should reflect the latest stable version

## Generation Flow

1. Read the source documentation from `sources/{project}/`
2. Check `instructions/{project}.md` for project-specific guidelines
3. Identify core concepts, features, best practices, and advanced topics
4. Generate `SKILL.md` index and individual reference files
5. Write `GENERATION.md` with source SHA and generation date

## Instructions

Project-specific generation instructions are stored in `instructions/{project}.md`.
These provide constraints and preferences for the generated skills (e.g., prefer TypeScript, use Composition API).
