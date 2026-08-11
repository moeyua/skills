# Skills Architecture

This document records the current structure, context flow, and durable technical decisions of Skills. Usage lives in [README.md](./README.md); product judgment lives in [PRODUCT.md](./PRODUCT.md).

## One sentence

Skills is a set of 11 independently installable Markdown capabilities whose concise entry guides route agents to task-specific references and allow adaptive composition inside the user's authorized outcome.

## Repository layout

```text
skills/
├── README.md / README.zh-CN.md      # user entry points
├── PRODUCT.md                       # positioning, principles, boundaries
├── ARCHITECTURE.md                  # current technical structure and decisions
├── ROADMAP.md                       # maintainer-decided future items
├── package.json                     # development commands and Node constraints
├── skills/
│   ├── RESOLVER.md                  # human-readable routing index
│   ├── <name>/SKILL.md              # lightweight capability entry
│   ├── <name>/references/           # conditionally loaded deep knowledge
│   └── doctor/scripts/checker.ts     # installed deterministic health checker
├── rules/
│   ├── change-types.md              # shared fix/feat/refactor/perf vocabulary
│   └── memory-catalog.md             # six durable-memory definitions
├── specs/<name>/spec.md              # observable behavior contracts
├── plans/                             # point-in-time implementation handoffs
├── tests/                             # deterministic interface/invariant checks
└── bench/                             # development-only Shape behavior evaluation
```

There is no production runtime package or generated workflow engine. The product surface is Markdown, conditional references, and Doctor's zero-dependency checker.

## Context architecture

```text
user outcome + surrounding context
               |
               v
     frontmatter description
        (routing interface)
               |
               v
       lightweight SKILL.md
   purpose · judgment · boundaries
               |
       trigger-specific routing
               |
               +----------> rich reference(s)
               |
               v
   agent composes needed capabilities
               |
               v
      evidence-backed outcome
```

A main Skill is not a miniature workflow program. Content stays there only when it is useful for most calls to that capability. Detailed schemas, target transactions, recovery predicates, method guides, and document formats live in references and load only when triggered.

Two deliberate exceptions preserve correctness rather than uniformity:

- Explore always completes a fixed Overview and reads necessary architecture/global documents before scoped depth.
- Release retains strict predicates for public, difficult-to-reverse state, but separates modeling, execution, and recovery into conditional references.

## Composition and side-effect topology

The product rationale for adaptive composition lives in [PRODUCT.md](./PRODUCT.md). Technically, each capability is independently invokable, and a capability may use another capability's output or bounded behavior without transferring ownership of external state. The exact public routes live in [skills/RESOLVER.md](./skills/RESOLVER.md).

| mutation                                                        | owning authorization               |
| --------------------------------------------------------------- | ---------------------------------- |
| local plan                                                      | Plan target `local` or `both`      |
| GitHub Issue                                                    | Plan target `issue` or `both`      |
| project implementation/docs                                     | explicit authorized change outcome |
| commit, push, PR                                                | Publish outcome                    |
| version metadata, default-branch release commit, tags, Releases | Release outcome                    |

Check remains read-only and Docs remains authority-bound when composed; neither grants Publish or Release.

## Progressive reference topology

Notable reference families:

- Explore: scoped deep-dive and report interface.
- Plan: one target contract (`local`, `issue`, or `both`); local plans load the selected change-type/template, while every Issue uses the shared problem-record schema.
- Check: review, test, and e2e methods load independently.
- Docs: the memory catalog indexes six target-specific formats.
- Publish: git state, PR construction, and recovery.
- Release: release-set model, execution, and recovery.
- Converge: per-document state/action model plus sibling Docs/Doctor assets.

Shared symlinks remain only for true semantic sources: `change-types.md` is consumed by Shape, Plan, and Implement; `memory-catalog.md` is consumed by Explore and Docs.

## Artifact and state flow

| artifact/state                     | producer        | useful consumers                | absence/failure                                           |
| ---------------------------------- | --------------- | ------------------------------- | --------------------------------------------------------- |
| conversational direction           | Shape           | Plan, Implement, Docs           | not a gate                                                |
| local implementation plan          | Plan            | Implement, Publish, Docs        | clear requests may proceed without it                     |
| canonical Issue problem record/URL | Plan/user       | Publish                         | omit closing reference if absent                          |
| working diff and verification      | Implement/Check | Docs, Publish                   | consumers require only evidence relevant to their outcome |
| durable memories                   | Docs/Converge   | all fact-gathering capabilities | load only applicable targets                              |
| branch/upstream/PR state           | Publish         | reviewers                       | partial success is preserved                              |
| release basis/commit/tags/Releases | Release         | users/GitHub                    | resume from verified canonical state                      |

Plan target semantics are stable: omitted target is `both`; `both` writes local before Issue; `issue` accepts 1–20 explicitly bounded same-repository problems; no target silently falls back to another. Every Issue body newly rendered by Plan remains a problem record even when paired with a local plan, and only the local artifact carries implementation decisions, path-level scope, ordering, and verification; verified canonical Issues are associated without body edits.

Release models authoritative version sources as release units, project-tool coordination as version groups, exact tag/GitHub mappings as release identities, and the confirmed combination as a release set. Derived/expanded sets wait for next-turn confirmation. Every path re-resolves from the fetched default branch, runs one verified non-tagging/non-committing/non-publishing version transaction, creates one release commit, and publishes each identity recoverably.

## Truth and verification

`specs/<name>/spec.md` records each public capability's observable contract. Specs may be detailed high-fidelity references because they are not injected into every runtime call. Historical plans remain point-in-time records and are not rewritten as current interfaces.

Verification has three layers:

1. structure and interface tests: frontmatter, public inventory, references, resolver, Skill↔Spec pairing, memory formats, and Markdown links;
2. deterministic project checks: Doctor's checker for Spec shape, links/anchors, placeholders, and file size;
3. behavior evaluation: the existing development-only Shape bench, run when its scope is affected.

Development commands come from `package.json`:

```bash
pnpm check
pnpm test
pnpm lint
node skills/doctor/scripts/checker.ts . --json
```

## Installation

`npx skills add .` discovers `skills/<name>/SKILL.md`. The repository root must not contain `SKILL.md`, or the installer can collapse the repository into one capability. Installation is a snapshot; source changes require reinstalling. Relative symlinks are used only for the two shared semantic sources, with `--copy` available where symlinks are unsuitable.

## Architecture invariants

1. The installed surface is exactly the 11 Resolver entries and their 11 matching Specs.
2. Every capability is independently enterable; upstream artifact history is optional context.
3. Main Skills remain capability guides and conditional routers, not copies of deep references or fixed global stages.
4. Explore retains its fixed Overview; Release retains its high-consequence safety predicates.
5. Agent-owned composition stays inside the user's authorized outcome and preserves each supporting capability's boundary.
6. Plan target and artifact semantics, Publish history safety, and Release confirmation/recovery identities do not drift.
7. The durable-memory catalog contains exactly six types.
8. `change-types.md` and `memory-catalog.md` each have one shared source.
9. No `SKILL.md` exists at the repository root.

## Key decisions

### 2026-08-05: lightweight context architecture

The previous generation used long main prompts, repeated shared context, uniform body templates, and fixed capability chains. The maintainer chose a full context-engineering shift: re-author every main Skill as a lightweight guide, move deep knowledge behind conditional references, let the agent compose around the authorized outcome, preserve a fixed Explore Overview and on-demand TDD, and retain strict boundaries only where consequences justify them.

### 2026-07-23: release sets support monorepos

Release separates units, version groups, and tag identities so one transaction and commit can safely describe single-package, fixed/linked, independent, propagated, and aggregate release state. Project policy outranks generic SemVer, and agent-derived sets require visible cross-turn confirmation.

### 2026-07-21: 11 independent public capabilities

The public surface was consolidated into the current 11 outcomes and removed mandatory upstream artifacts. The 2026-08-05 decision replaces its remaining fixed internal chains with adaptive composition while preserving the same public names and external side-effect owners.

### 2026-06-04: bounded durable memory

Specs alone could not hold positioning, architecture, visual identity, future decisions, and user entry information. The six-type catalog gives each durable claim a purpose, authority, and boundary without turning Docs into open-ended content creation.

Future decisions already deferred by the maintainer live in [ROADMAP.md](./ROADMAP.md).
