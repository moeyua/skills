---
name: explore
description: 'Build a working, fact-level understanding of a project or unfamiliar module so downstream work (shape / build / review) starts from reliable context — read the key docs (README / ARCHITECTURE / PRODUCT / DESIGN / specs / docs) and map the structure. Use when entering a new repo, facing an unfamiliar module, or the user says "look at this project" / "先看看" / "整体了解一下". Not for debugging (use shape fix mode), proposing a plan (use shape), or a plain API-usage question (just grep the code).'
when_to_use: "explore, understand, codebase, project structure, entry point, how to run, 看项目, 项目结构, 入口, 怎么跑, 整体了解, 不熟悉的模块"
dispatch_intent: "Build project context for downstream work; read key docs and map the structure"
---

# Explore

Explore isn't an end in itself — it's the front end for other skills, building a working, fact-level understanding for shape / build / test / review. Every rule here exists to make the context downstream skills inherit **trustworthy**: grounded in what was actually read and in the code's current state, not in guesses or stale assumptions.

Explore reads, never writes:

- Modify no file — strictly read-only.
- Don't check whether the docs match the code — that's a future health skill's job.
- Don't guess — "didn't find it / doesn't exist" beats inventing "it's probably X".

When you cite a doc, **mark the source**: `per README` / `per ARCHITECTURE` / `the docs claim`. This tells downstream skills that something is "what the docs say", not "what the code does". The two are often out of sync, and downstream needs the attribution to resolve the conflict.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: a working, fact-level understanding of the project, with the key docs and structure recorded explicitly in a report that downstream skills can build on
- Done when: the Project Identity / Structure / Docs Inventory sections are filled; the Scoped Deep-dive section too when the user named a scope; Where to Start gives 2-3 entry suggestions
- Evidence: the full text of docs actually read + the output of `pwd` / `git ls-files` / `Read` / `Grep` and similar
- Output: a structured Explore Report (see the template)

## Phases

Every explore run **starts with the Overview Phase**. When the user named a scope ("look at the auth module" / `/explore <module>`), continue into the Scoped Deep-dive Phase after Overview. **Always finish Overview before going deep** — jumping straight to a deep-dive leaves the skeleton missing, so downstream sees partial context.

## Overview Phase

### Step 1: Confirm the path and project identity

- `pwd` or `git rev-parse --show-toplevel` to confirm the working directory.
- Read `README*` for the project name + a one-line positioning.
- Read the manifest file to identify the main language / framework (pick by ecosystem):
  - JS/TS: `package.json`
  - Rust: `Cargo.toml`
  - Python: `pyproject.toml` / `requirements.txt`
  - Go: `go.mod`
  - Java/Kotlin: `pom.xml` / `build.gradle`
  - Ruby: `Gemfile`
  - other ecosystems: find by convention
- Record where the run / test / build commands come from (`package.json` scripts, `Makefile`, `justfile`, a README section, etc.).

### Step 2: Inventory the key docs

Scan the root and the usual locations, and **read in full every doc that exists** — reading only titles is guessing at the contents, and downstream skills will act on the wrong thing.

> The recommended **memory artifacts** are defined once in `references/memory-catalog.md` (the shared memory catalog persist writes to) — read every one that exists: `README` / `ARCHITECTURE` / `PRODUCT` / `DESIGN` / `WORKFLOW` / `ROADMAP` / every `.md` under `specs/`. Beyond the catalog, also read any other docs present:
>
> - `CLAUDE.md` / `AGENTS.md`
> - every `.md` under `docs/`
> - `.cursorrules` / `.windsurfrules` / other IDE rules
> - other `.md` files at the root

For each doc you read, record: the path + a one-line summary (based on what you actually read).

### Step 3: Project structure

Top-level directory responsibilities (one line each) + key modules (judged from directory size, doc references, and entry-file dependencies).

### Step 4: Emit the Overview report

Organize it per the template below.

## Scoped Deep-dive Phase

**Precondition**: the Overview Phase is done.

For the scope the user named (module / directory / file):

- entry points and the public interface in scope (with `file:line` references)
- key data flows / call chains (traced via grep / read)
- where the docs relevant to this scope live
- entry-point suggestions for the follow-up work

## Budget awareness

Explore slips easily into "the more I read the better" — reading 100 files burns tokens and still yields no sense of structure. **Scan the directories and list the docs first, then decide what to read deeply**; don't re-read the same file.

## Report template

```markdown
# Explore Report: <project-name>

## Project Identity

- name / positioning (per README:Lx)
- main language / framework / key stack
- run / test / build commands (per <source>:Lx)

## Structure

- top-level directory responsibilities (one per line, with evidence `file:line` or `dir/`)
- key modules

## Docs Inventory

- README: one-line summary (path)
- ARCHITECTURE: one-line summary (path) — or `N/A`
- PRODUCT: one-line summary (path) — or `N/A`
- DESIGN: one-line summary (path) — or `N/A`
- CLAUDE.md / AGENTS.md: one-line summary (path) — or `N/A`
- specs/: N docs, key topics — or `N/A`
- docs/: N docs, key topics — or `N/A`
- other: ...

## Scoped Deep-dive: <module>

> only when the user named a scope

- entry points and public interface (`file:line`)
- key data flows / call chains
- where the relevant docs live
- follow-up entry points

## Where to Start

Based on the above, 2-3 entry suggestions for the follow-up work (each with `file:line`).
```

## When to stop

Like review, explore's failure mode is "acting / overstepping". Stop in these cases:

- **Guessing at the architecture before reading the key docs** — Step 2 is mandatory; scan for existence first, then read in full every doc that exists.
- **The user says "look at auth" and you want to skip Overview straight to the deep-dive** — always do Overview first, or downstream loses the skeleton.
- **You want to run doc-vs-code drift detection** — not explore's job (leave it to a future health skill); when you suspect drift, record it in the report for downstream to judge, don't verify it yourself.
- **You want to invent "it's probably X"** — "didn't find it / doesn't exist / this project has no X" beats inventing; a guess pollutes downstream skills' judgment.
- **You want to modify a file** — explore is strictly read-only; write what you find into the report, and route fixes back to the right skill (`/shape` / `/build`).
