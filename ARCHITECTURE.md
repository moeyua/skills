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

## Intent fidelity and attestation flow

[PRODUCT.md](./PRODUCT.md) is the canonical source for Intent, Authority, Evidence, Invalidation, their fail-close and clean-break consequences, and the Attestation constraint over their claims. This architecture records only how those states move and which capability can attest each outcome: capabilities exchange artifacts and conversational context without treating either as undifferentiated truth; main Skills carry their stage-specific projection, while artifacts preserve the source, producer, stable basis, and status of claims they pass on. The states do not require a runtime ledger.

```text
user statements + authoritative project intent
                    |
                    v
      Intent · Authority · Evidence
                    |
          +---------+----------+
          |                    |
          v                    v
 reviewed Shape summary   direct Skill entry
          |              (minimal reconstruction)
          +---------+----------+
                    v
       capability outcome or artifact
                    |
        producer-bounded attestation
                    |
          correction / new evidence
                    v
        invalidate actual dependents

Handoff snapshots the current state for another context;
the snapshot does not create authority.
```

Shape and Handoff are visible checkpoints, not mandatory upstream stages. Shape ends by presenting a Design Summary for review; agreement settles that direction but does not select another public capability. Handoff preserves continuation-critical state when context moves. Every other capability remains directly enterable and reconstructs only the state its outcome needs from the current request and authoritative project facts.

| capability | intent-fidelity and attestation responsibility                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Explore    | keep documentation claims, observed facts, and source conflicts distinguishable                             |
| Shape      | expose the active outcome, failed or unresolved conditions, continuity choices, and recommendations         |
| Plan       | persist settled direction without inventing authority, success, or an unrequested continuity path           |
| Implement  | produce a candidate and local evidence, removing superseded paths when the authorized outcome replaces them |
| Check      | independently attest only inspected evidence and reject masked failure or unauthorized continuity           |
| Docs       | record authoritative current truth without carrying a superseded design through a clean break               |
| Publish    | attest exact commit/push/PR state without upgrading implementation assurance                                |
| Release    | attest the exact authorized release state without substituting for implementation acceptance                |
| Converge   | preserve authored meaning and stop on source conflict or missing authority                                  |
| Doctor     | separate deterministic facts from model judgment and evidence                                               |
| Handoff    | carry active, superseded, candidate, evidenced, and pending-attestation state without settling it           |

Fail-close and clean-break do not create stages or a generic recovery framework. Each capability applies the canonical boundary only to its own claim, artifact, or side effect.

## Composition and side-effect topology

The product rationale for adaptive composition lives in [PRODUCT.md](./PRODUCT.md). Technically, each capability is independently invokable, and a capability may use another capability's output or bounded behavior without transferring ownership of external state. The exact public routes live in [skills/RESOLVER.md](./skills/RESOLVER.md).

| mutation                                                                                                        | owning authorization               |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| local plan                                                                                                      | Plan target `local` or `both`      |
| GitHub Issue                                                                                                    | Plan target `issue` or `both`      |
| project implementation/docs                                                                                     | explicit authorized change outcome |
| commit, push, PR                                                                                                | Publish outcome                    |
| version/dependency and version-bound repository release metadata, default-branch release commit, tags, Releases | Release outcome                    |

Check remains read-only and Docs remains authority-bound when composed; neither grants implementation repair, Publish, or Release. A caller may mechanically project only an exact Check result whose producer and stable candidate basis remain applicable, but cannot reinterpret or manufacture any field.

## Progressive reference topology

Notable reference families:

- Explore: scoped deep-dive and report interface.
- Plan: one target contract (`local`, `issue`, or `both`); local plans load the selected change-type/template, every Issue uses the shared problem-record schema, and `both` additionally loads the managed-envelope rules for paired synchronization.
- Check: review, test, and e2e methods load independently.
- Docs: the memory catalog indexes six target-specific formats.
- Publish: git state, PR construction, and recovery.
- Release: release-set model, execution, and recovery.
- Converge: per-document state/action model plus sibling Docs/Doctor assets.

Shared symlinks remain only for true semantic sources: `change-types.md` is consumed by Shape, Plan, and Implement; `memory-catalog.md` is consumed by Explore and Docs.

## Artifact and state flow

| artifact/state                              | producer      | useful consumers                | absence/failure                                                                 |
| ------------------------------------------- | ------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| reviewed conversational direction           | Shape + user  | Plan, Implement, Docs, Handoff  | absent for direct entry; agreement does not authorize another public outcome    |
| local implementation plan                   | Plan          | Implement, Publish, Docs        | clear requests may proceed without it                                           |
| canonical Issue problem record/URL          | Plan/user     | Plan `both`, Publish            | omit closing reference if absent; unmanaged or conflicted content is not edited |
| identifiable candidate + local evidence     | Implement     | Check, Docs, Publish, Handoff   | valid lower-assurance result; does not imply independent acceptance             |
| Check result: basis + producer + pair       | Check         | Implement, Publish, Handoff     | findings deny acceptance but do not authorize repair                            |
| durable memories                            | Docs/Converge | all fact-gathering capabilities | load only applicable targets                                                    |
| branch/upstream/PR state                    | Publish       | reviewers                       | partial success is preserved                                                    |
| release basis/metadata commit/tags/Releases | Release       | users/GitHub                    | resume from verified canonical state                                            |

An associated local plan projects this flow without becoming its authority source:

```text
draft --explicit implementation request--> approved
approved --Implement candidate-----------> candidate
candidate --Check findings---------------> candidate
candidate --Check inconclusive-----------> candidate
candidate --Check acceptance pass--------> done
candidate --active/new Implement auth----> approved
```

Without a plan, the same candidate basis, evidence producer, limitations, and Check producer + verdict + acceptance-field pair stay in the result report or Handoff; Implement does not create an artifact merely to track assurance. Only an independent Check `pass` paired with `attested for the exact current candidate` and the same stable basis is an acceptance pass. Findings leave the candidate unaccepted; a still-active Implement authorization or a new explicit implementation request—not the finding—authorizes repair and moves an associated plan to `approved`. Any repair produces a new basis and invalidates the old result.

A plan's Assurance is the last authorized, time-scoped projection for its exact basis, not a globally current acceptance oracle. A consumer must establish that the basis still matches and use the latest applicable Check result available in its current context before claiming current acceptance; otherwise it reports only the historical snapshot or obtains a new Check. A legacy `done` plan with no complete Assurance is historical implementation completion with acceptance not established; consumers never invent or backfill its missing basis, producer, verdict, or acceptance. A later finding against a closed done plan supersedes the older result in any context or Handoff that carries it, but Check remains read-only: the finding neither rewrites the plan, reopens it, nor authorizes repair. Persisting globally latest validity would require a separate authorized writer or ledger, which this architecture intentionally does not provide.

Plan target semantics are stable: omitted target is `both`; `both` writes local before Issue mutation; `issue` accepts 1–20 explicitly bounded same-repository problems; no target silently falls back to another. Every Issue projection rendered by Plan remains a problem record even when paired with a local plan, and only the local artifact carries implementation decisions, path-level scope, ordering, and verification. A paired Issue created by `both` wraps its Plan-owned title/type/body projection in a versioned SHA-256 managed envelope. Later `both` revisions keep the canonical URL stable, skip implementation-only changes, update a validated projection for the same bounded problem, preserve content outside the block and unrelated labels, and fail closed on ownership, digest, or identity conflicts. `local` never mutates GitHub, and pure `issue` reuse remains read-only.

Release models authoritative version sources as release units, project-tool coordination as version groups, exact tag/GitHub mappings as release identities, and any existing version-bound repository release metadata as an optional part of the confirmed release set. Derived or substantively expanded sets wait for next-turn confirmation. Every path re-resolves from the fetched default branch, runs one verified non-tagging/non-committing/non-publishing release metadata transaction, creates one commit containing the complete set, and publishes each identity recoverably. The same semantic predicate governs fresh execution, local recovery, and remote reuse without imposing one metadata filename, schema, or tool.

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
10. Artifacts preserve but do not create intent authority; capability outcomes cannot manufacture upstream authority or downstream acceptance; corrections reopen actual dependents, and completion claims do not exceed outcome-relevant evidence.
11. Shape's reviewed Design Summary and Handoff's continuation snapshot improve state visibility without becoming mandatory upstream artifacts or a fixed capability chain.
12. Each capability preserves fail-close and clean-break at its own boundary: no claim manufactures success from a required failure, ambiguity, or missing state, and no authorized replacement retains an unapproved continuity path.

## Key decisions

### 2026-08-20: paired Issue identity is stable while its managed problem record is revisable

The earlier create/reuse-only rule protected canonical identity by making every existing Issue body immutable. That left a paired Issue stale when a pre-implementation plan revision changed the underlying problem, constraints, or observable result. `both` now distinguishes identity from content: it may synchronize only a versioned, digest-verified managed problem block for the same bounded problem, while preserving human-owned content and returning a conflict instead of overwriting unknown or externally changed state. The GitHub edit surface has no compare-and-swap guarantee, so every edit receives one read-back and the attestation remains a time-scoped observation; `local` and pure `issue` retain their previous mutation boundaries.

### 2026-08-18: intent fidelity and completion attestation are producer-bounded

The suite now carries intent source, consequential authority, outcome-matched evidence, and correction invalidation across capability boundaries. Shape exposes a reviewed Design Summary before handoff, while direct entry remains valid. Implement produces an identifiable candidate and local evidence; only a fresh independent Check can attest acceptance for that basis. Findings deny acceptance without authorizing repair, and an authorized repair creates a new basis that must be checked again to regain acceptance. Local plans project `draft → approved → candidate → done`, but no artifact creates its own transition authority. This separates execution from acceptance without forcing every small Implement through Check or pretending Markdown is a host-enforced gate.

### 2026-08-11: release owns version-bound repository metadata

Some repositories make a user-facing changelog entry or another committed artifact an invariant of the target version. Release now includes such existing version-bound repository release metadata in its release set and commit instead of requiring a separate implementation/PR handoff. Repository instructions, specifications, code, tests, and release tooling establish whether that surface exists; absence never causes Release to invent one. Agent-derived substantive content uses the existing set-expansion confirmation judgment, while deterministic or already-matching content does not add a mandatory round trip.

### 2026-08-05: lightweight context architecture

The previous generation used long main prompts, repeated shared context, uniform body templates, and fixed capability chains. The maintainer chose a full context-engineering shift: re-author every main Skill as a lightweight guide, move deep knowledge behind conditional references, let the agent compose around the authorized outcome, preserve a fixed Explore Overview and on-demand TDD, and retain strict boundaries only where consequences justify them.

### 2026-07-23: release sets support monorepos

Release separates units, version groups, and tag identities so one transaction and commit can safely describe single-package, fixed/linked, independent, propagated, and aggregate release state. Project policy outranks generic SemVer, and agent-derived sets require visible cross-turn confirmation.

### 2026-07-21: 11 independent public capabilities

The public surface was consolidated into the current 11 outcomes and removed mandatory upstream artifacts. The 2026-08-05 decision replaces its remaining fixed internal chains with adaptive composition while preserving the same public names and external side-effect owners.

### 2026-06-04: bounded durable memory

Specs alone could not hold positioning, architecture, visual identity, future decisions, and user entry information. The six-type catalog gives each durable claim a purpose, authority, and boundary without turning Docs into open-ended content creation.

Future decisions already deferred by the maintainer live in [ROADMAP.md](./ROADMAP.md).
