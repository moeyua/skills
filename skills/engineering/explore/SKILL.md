---
name: explore
description: "Build an accurate picture of a project or module, docs first, then code. Use when entering a repo, facing an unfamiliar module, before shaping or planning project work, or when the user says 先看看 / 整体了解一下 / look at this project."
---

# Explore

## 1. Read what the project says about itself

In this order, skipping what doesn't exist:

1. `README.md`, `CLAUDE.md`, and `AGENTS.md`. They're often the same; read both anyway, and note where they differ.
2. The project's long-lived docs: `GLOSSARY.md` (or `GLOSSARY-MAP.md`), `PRODUCT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `ROADMAP.md`, `specs/`, and the ADRs in `docs/adr/` (titles first, then the ones touching your question). The `docs` skill says what each one is for.
3. The manifest (`package.json`, `pyproject.toml`, `Cargo.toml`, ...) for the stack and the run, test, and build commands.

Use the glossary's words from here on.

## 2. Read the code that matters

Map the top-level directories, the entry points, and how the main pieces connect. Then go deep only where the current question points. Search before opening files, and stop when more reading won't change the answer. For several independent modules, send subagents in parallel, one question each.

## 3. Keep sources apart

Say where each fact came from: "per ARCHITECTURE", "in `src/server.ts`", "from `package.json`". When a doc and the code disagree, report both and say which is newer. Don't decide which one is right; that's the user's call, and the fix is a separate change.

Explore only reads.

## Output

When another skill called you, hand back the relevant facts with their sources and what you couldn't find, then let that skill continue.

When the user asked to look at the project, report in their language:

- **What it is**: one or two sentences, with the source.
- **Stack and commands**: how to run, test, and build it.
- **Structure**: top-level parts and entry points, one line each.
- **Docs**: which long-lived docs exist, and any that contradict the code.
- **What I'm not sure about**: and where you looked.
