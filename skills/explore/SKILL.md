---
name: explore
description: 'Build a working, fact-level understanding of a project or unfamiliar module so downstream work (shape / implement / check) starts from reliable context — read the key docs (README / ARCHITECTURE / PRODUCT / DESIGN / specs / docs) and map the structure. Use when entering a new repo, facing an unfamiliar module, or the user says "look at this project" / "先看看" / "整体了解一下". Not for debugging (use shape fix mode), proposing a plan (use shape), or a plain API-usage question (just grep the code).'
when_to_use: "explore, understand, codebase, project structure, entry point, how to run, 看项目, 项目结构, 入口, 怎么跑, 整体了解, 不熟悉的模块"
dispatch_intent: "Build project context for downstream work; read key docs and map the structure"
---

# Explore

Explore isn't an end in itself — it's the front end for other skills, building a working, fact-level understanding for shape / implement / check. Every rule here exists to make the context downstream skills inherit **trustworthy**: grounded in what was actually read and in the code's current state, not in guesses or stale assumptions.

Explore reads, never writes:

- Modify no file — strictly read-only.
- Don't check whether the docs match the code — that's the doctor skill's job.
- Don't guess — "didn't find it / doesn't exist" beats inventing "it's probably X".

When you cite a doc, **mark the source**: `per README` / `per ARCHITECTURE` / `the docs claim`. This tells downstream skills that something is "what the docs say", not "what the code does". The two are often out of sync, and downstream needs the attribution to resolve the conflict.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: a working, fact-level understanding of the project, with the key docs and structure recorded explicitly in a report that downstream skills can build on
- Done when: the Project Identity / Structure / Docs Inventory sections are filled; the Scoped Deep-dive section too when the user named a scope
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

**First read `references/memory-catalog.md` in full** — this is a required read, not optional, and not the same as reading the artifacts it lists. The catalog is the _rules_: for each kind of durable memory it defines what it holds, who it's for, where its authority comes from, and its boundary. You need those definitions to judge what counts as durable memory in _this_ project — and the more the project's layout differs from the catalog's defaults, the more it matters, because that's exactly when guessing does the most damage.

Then **read in full every memory artifact that exists**: `README` / `ARCHITECTURE` / `PRODUCT` / `DESIGN` / `WORKFLOW` / `ROADMAP` / every `.md` under `specs/`. Beyond the catalog's artifacts, also read any other docs present:

- `CLAUDE.md` / `AGENTS.md`
- every `.md` under `docs/`
- `.cursorrules` / `.windsurfrules` / other IDE rules
- other `.md` files at the root

For each doc you read, record: the path + a one-line summary (based on what you actually read).

### Step 3: Project structure

Top-level directory responsibilities (one line each) + key modules (judged from directory size, doc references, and entry-file dependencies).

### Step 4: Emit the Overview report

Organize it per the template below.

## Scoped Deep-dive Phase

**Precondition**: the Overview Phase is done.

The deep-dive's job is to make the scope the user named (module / directory / file) genuinely understood, not just located. Dig along seven dimensions — together they answer the questions downstream work will actually ask. The list is one unified set: how much of it you cover varies with the depth signal below, and a dimension that doesn't apply to this scope gets an explicit `N/A` — padding an irrelevant dimension is guessing in a nicer costume.

**Core dimensions** (every deep-dive):

1. **Responsibility & boundary** — what the scope owns and what it explicitly does not. Downstream scoping starts here; most scope creep traces back to a boundary nobody stated.
2. **Interface & usage** — entry points, public API, and the config surface (options / env vars / flags), each with `file:line`. This is the part callers — and the next change — actually touch.
3. **Internal structure** — the core logic paths and the key data structures moving through them (traced via grep / read). Logic and data are read together; splitting them yields two half-pictures.
4. **Dependencies & blast radius** — what it depends on, and who depends on it (reverse dependencies). The reverse direction is what tells shape / implement how far a change will ripple.
5. **Related docs** — where the docs covering this scope live and what they claim, with source attribution (`per README` etc.), so downstream can tell "documented" from "observed".

**Extended dimensions** (only on an explicit depth signal):

6. **Quality picture** — which behaviors the tests actually cover (and how to run them), plus the error / edge handling paths.
7. **History & known issues** — recent change hotspots in git history, TODO / FIXME markers, known limitations, ROADMAP mentions.

**Depth has no flag.** Default coverage is the five core dimensions — enough for downstream to start shaping. When the user's own language asks for depth ("深度探索 X" / "彻底搞明白 X" / "deep dive into X"), cover all seven — the extra digging pays off only when the scope is about to undergo real surgery. Judge from the user's words, not your own enthusiasm.

## Budget awareness

Explore slips easily into "the more I read the better" — reading 100 files burns tokens and still yields no sense of structure. **Scan the directories and list the docs first, then decide what to read deeply**; don't re-read the same file.

## Report template

The report is the deliverable, and it is also the end. Explore suggests no next step and no follow-up entry points — the user came with their own purpose, and what to do next is theirs to decide; an "entry suggestion" is a next-step recommendation wearing a report section's costume.

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

> only when the user named a scope; core dimensions always, extended ones on an explicit depth signal; a dimension that doesn't apply → `N/A`

- responsibility & boundary (what / what-not)
- interface & usage (`file:line`)
- internal structure: core logic paths + key data structures
- dependencies & blast radius (both directions)
- related docs (with source attribution)
- quality picture: test coverage + error handling — extended
- history & known issues: hotspots / TODOs / limitations — extended
```

## When to stop

Like review, explore's failure mode is "acting / overstepping". Stop in these cases:

- **Guessing at the architecture before reading the key docs** — Step 2 is mandatory; scan for existence first, then read in full every doc that exists.
- **The user says "look at auth" and you want to skip Overview straight to the deep-dive** — always do Overview first, or downstream loses the skeleton.
- **You want to run doc-vs-code drift detection** — not explore's job (leave it to `/doctor`); when you suspect drift, record it in the report for downstream to judge, don't verify it yourself.
- **You want to invent "it's probably X"** — "didn't find it / doesn't exist / this project has no X" beats inventing; a guess pollutes downstream skills' judgment.
- **A deep-dive dimension doesn't apply but you want to fill it anyway** — force-filling an irrelevant dimension is inventing; mark it `N/A` and move on.
- **You want to modify a file** — explore is strictly read-only; write what you find into the report, and route fixes back to the right skill (`/shape` / `/implement`).
