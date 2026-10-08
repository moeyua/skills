# Skills Architecture

This document records the current structure, context flow, and durable technical decisions of Skills. Usage lives in [README.md](./README.md); product judgment lives in [PRODUCT.md](./PRODUCT.md).

## One sentence

Skills is a set of 13 directly invokable Markdown capabilities whose concise entry guides route agents to task-specific references and compose support inside the user's authorized outcome; Shape uses Explore, and Plan uses an independent Review to audit its generated artifacts.

## Repository layout

```text
skills/                              # repository root
├── README.md / README.zh-CN.md       # user entry points and category navigation
├── PRODUCT.md                       # positioning, principles, boundaries
├── ARCHITECTURE.md                   # current technical structure and decisions
├── ROADMAP.md                       # maintainer-decided future items
├── package.json                     # development commands and Node constraints
├── skills/
│   ├── RESOLVER.md                  # human-readable routing index
│   ├── engineering/
│   │   ├── README.md                # category navigation
│   │   ├── converge/
│   │   ├── debug/
│   │   ├── docs/
│   │   ├── doctor/
│   │   │   ├── SKILL.md
│   │   │   └── scripts/checker.ts   # installed deterministic health checker
│   │   ├── explore/
│   │   ├── implement/
│   │   ├── plan/
│   │   ├── publish/
│   │   ├── release/
│   │   ├── review/
│   │   ├── shape/
│   │   └── verify/
│   └── productivity/
│       ├── README.md                # category navigation
│       └── handoff/
├── rules/
│   ├── change-types.md               # shared fix/feat/refactor/perf vocabulary
│   └── memory-catalog.md             # six durable-memory definitions
├── specs/<name>/spec.md              # observable behavior contracts
├── plans/                           # point-in-time implementation handoffs
└── tests/                           # deterministic interface/invariant checks
```

Each skill owns its `skills/<category>/<name>/SKILL.md` entry and any `references/` or `scripts/` below it. Names remain globally unique across categories, and `specs/<name>/spec.md` pairs with that stable name. The two directory levels below `skills/` are category and skill; discovery does not descend into a skill's internal resources.

`engineering` contains development, software architecture, testing, and engineering project maintenance. `productivity` contains general work, learning, and information organization. `design` is a peer category for UI/UX, interaction, visual, brand, and design-system work; turning designs into code belongs in `engineering`. The peer categories `in-progress`, `misc`, and `deprecated` hold experimental, infrequently used, and retired skills respectively. Categories are created only when they contain actual skills, so none of these four additional categories exists in the current tree. These names do not introduce installer filtering. Additional categories follow the same depth and navigation pattern without a category whitelist.

The root READMEs link to the categories and every current skill. Each existing category has one English README with a link and a short description for every member. The Resolver retains the full capability map and routing distinctions.

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

Deliberate capability constraints preserve correctness rather than uniformity:

- Explore always completes a fixed Overview and reads necessary architecture/global documents before scoped depth.
- Shape always consumes Explore context for the current target project before forming project-related directions, comparisons, or its Design Summary; Explore remains the sole source of the exploration method.
- Plan audits generated artifacts once through Review in an independent context, then owns authorized revisions and targeted verification; the audit does not change the implementation lifecycle.
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

Shape and Handoff are visible checkpoints, not mandatory upstream stages. Shape first obtains Explore context, then ends by presenting a Design Summary for review; agreement settles that direction but does not select another public capability. Its internal Explore support call returns to the same outcome and does not trigger an early Summary or review. Handoff preserves continuation-critical state when context moves. Every other capability remains directly enterable and reconstructs only the state its outcome needs from the current request and authoritative project facts.

| capability | intent-fidelity and attestation responsibility                                                      |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Explore    | keep documentation claims, observed facts, and source conflicts distinguishable                     |
| Shape      | expose the active outcome, failed or unresolved conditions, continuity choices, and recommendations |
| Plan       | persist settled direction; audit outputs and revise within authority without upgrading the verdict  |
| Implement  | deliver behavior with proof; mark an associated plan `done` with its Assurance in the same delivery |
| Debug      | establish causal evidence without acquiring repair authority                                        |
| Review     | expose actionable problems against source intent and actual artifacts                               |
| Verify     | judge outcome evidence; run independently in a fresh context only when the user requests it         |
| Docs       | record authoritative current truth without carrying a superseded design through a clean break       |
| Publish    | attest exact commit/push/PR state; deliver an associated plan's status with the code in one PR      |
| Release    | attest the exact authorized release state without substituting for implementation evidence          |
| Converge   | preserve authored meaning and stop on source conflict or missing authority                          |
| Doctor     | separate deterministic facts from model judgment and evidence                                       |
| Handoff    | carry active, superseded, completed, evidenced, and pending state without settling it               |

Fail-close and clean-break do not create stages or a generic recovery framework. Each capability applies the canonical boundary only to its own claim, artifact, or side effect.

## Composition and side-effect topology

The product rationale for adaptive composition lives in [PRODUCT.md](./PRODUCT.md). Technically, each capability is independently invokable, and a capability may use another capability's output or bounded behavior without transferring ownership of external state. The exact public routes live in [skills/RESOLVER.md](./skills/RESOLVER.md).

Shape locates Explore in the same installed skill collection first, then searches host-provided skill locations if needed. It uses Explore's context mode on the project targeted by the discussion, not the skill installation directory. Existing facts may satisfy the Overview where they remain current; gaps and project or scope changes require investigation. Familiarity, a simple request, or a settled direction cannot skip this support call. If Explore or the target project cannot be found or accessed, Shape reports the concrete gap and continues only work that does not depend on it; it neither recreates Explore from memory nor installs it automatically.

Shape groups material questions by current answerability: questions that depend on an unanswered choice wait for that answer, while independent questions share a round. It explains consequences and grounded recommendations, uses concrete situations when the user is unsure, and updates only conclusions affected by new answers. Once intent is clear, it develops and tests the key design before a reviewable Design Summary; it does not force a fixed interview or infer implementation authority.

Debug investigates expected versus actual behavior using local contracts, observable fault signals, falsifiable hypotheses, and discriminating experiments. In an authorized repair, Implement applies that method and retains edits, regression checks, original-path replay, and directly affected documents. Standalone Debug reports evidence and unknowns within its requested diagnosis scope. Temporary probes use existing task authority; there is no mandatory agent handoff or extra edit permission from invoking Debug.

Review and Verify distinguish questions rather than tools. Review identifies corrections and reasons; Verify establishes evidence for the original outcome claim and may compose Review when necessary. Either may inspect code or execute relevant observations. Neither writes a repair, weakens evidence, or narrows the original claim merely to report success.

After its selected target's generation phase ends, Plan locates Review in the same installed collection first, then in host-provided skill locations. It supplies original requirements and decisions, relevant project evidence, target, actual artifact versions, and generation results to a fresh independent context, without a full-history fork. Review reads the source evidence and artifacts and returns one read-only verdict. Plan retains write ownership, resolves clear authorized findings, and checks only those findings and affected content afterward. Missing Review, independent execution, artifact access, or required evidence yields `inconclusive`; no readable artifact yields an explicit not-run result. Partial generation still permits review of readable outputs. No path installs support automatically, recursively calls Plan, or starts a second full audit.

| mutation                                                                                                        | owning authorization               |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| local plan                                                                                                      | Plan target `local` or `both`      |
| GitHub Issue                                                                                                    | Plan target `issue` or `both`      |
| project implementation/docs                                                                                     | explicit authorized change outcome |
| commit, push, PR                                                                                                | Publish outcome                    |
| version/dependency and version-bound repository release metadata, default-branch release commit, tags, Releases | Release outcome                    |

Review and Verify remain read-only and Docs remains authority-bound when composed; neither grants new implementation repair, Publish, or Release. The active caller retains its existing authorization and continues applicable work after a support result. Plan's audit verdict covers the inspected artifact version; its own subsequent verification cannot turn that verdict into a new independent pass. A caller records a Verify result as reported, without reinterpreting or manufacturing any field. Ordinary Review and Verify do not require a separate agent merely because Plan's audit does; a user-requested independent Verify has its own fresh-context requirement.

## Progressive reference topology

Notable reference families:

- Explore: scoped deep-dive and report interface.
- Plan: one target contract (`local`, `issue`, or `both`); local plans load the selected change-type/template, every Issue uses the shared problem-record schema, and `both` additionally loads the managed-envelope rules for paired synchronization. All targets load `references/audit.md` for the final audit and revision boundary. Remote transaction mechanics live in the target references and shared audit reference: targets define ownership and generation transactions, while the audit reference defines remote corrections and their outcomes.
- Implement: associated plan state and optional independent Verify load from `references/assurance.md` only when triggered.
- Verify: test and e2e methods load when needed; review evidence may be composed from Review. Only a user-requested independent verification loads `references/acceptance.md`.
- Docs: the memory catalog indexes six target-specific formats.
- Publish: git state, PR construction, and recovery.
- Release: release-set model, execution, and recovery.
- Converge: per-document state/action model plus sibling Docs/Doctor assets.

Five source symlinks share two semantic sources in root `rules/`: `change-types.md` is consumed by Shape, Plan, and Implement; `memory-catalog.md` is consumed by Explore and Docs. From each engineering skill's `references/` directory, these links traverse four levels to the root before entering `rules/`.

## Artifact and state flow

| artifact/state                                | producer      | useful consumers                       | absence/failure                                                                 |
| --------------------------------------------- | ------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| reviewed conversational direction             | Shape + user  | Plan, Implement, Docs, Handoff         | absent for direct entry; agreement does not authorize another public outcome    |
| local implementation plan                     | Plan          | Implement, Publish, Docs               | clear requests may proceed without it                                           |
| canonical Issue problem record/URL            | Plan/user     | Plan `both`, Publish                   | omit closing reference if absent; unmanaged or conflicted content is not edited |
| implementation + plan `done` and Assurance    | Implement     | Review, Verify, Docs, Publish, Handoff | without a plan, evidence is reported in the conversation only                   |
| causal evidence + remaining unknowns          | Debug         | Implement, user                        | does not turn a hypothesis into a root cause or grant repair authority          |
| scoped review findings + actual evidence      | Review        | Plan, Implement, Verify, Handoff       | covers the inspected version; does not authorize repair                         |
| scoped verification verdict + actual evidence | Verify        | Implement, Publish, Handoff            | covers the specified claim; recorded in Assurance, never gates `done`           |
| durable memories                              | Docs/Converge | all fact-gathering capabilities        | load only applicable targets                                                    |
| branch/upstream/PR state                      | Publish       | reviewers                              | partial success is preserved                                                    |
| release basis/metadata commit/tags/Releases   | Release       | users/GitHub                           | resume from verified canonical state                                            |

An associated local plan projects this flow without becoming its authority source:

```text
draft --explicit implementation request--> approved
approved --Implement delivered + checks---> done   (same PR as the code)
```

Plan's generation audit and automatic revisions leave a new local plan at `draft`. They produce no `approved` or `done` state and do not enter the implementation-only `## Assurance` record. The final planning report keeps the generation result, original audit verdict, revision checks, unresolved findings, and uncovered scope separate.

Without a plan, results and Handoff retain only relevant behavior, actual verification and limitations; no assurance form is required. Implement marks an associated plan `done` once the implementation is complete and the project's required automated verification passes; the status and its Assurance record (`Evidence and limitations`, `Verify`) sit beside the code and Publish delivers them in the same PR. Nothing changes the status after merge: there is no merge hook, bot commit, or separate acceptance. Observations that cannot be automated stay known limitations, and cross-platform evidence is the PR CI. A user-requested independent Verify runs in a fresh context and is recorded in Assurance; its findings inform an authorized repair in the same delivery and never authorize repair by themselves.

A legacy `approved` or `candidate` plan whose implementation has merged—shown by git history or a merged PR—reads as `done`; an unmerged `candidate` reads as `approved`. Missing records never make a plan incomplete, and consumers do not rewrite or backfill legacy files.

Plan target semantics are stable: omitted target is `both`; `both` writes and validates local before Issue mutation, including audit revisions; `issue` accepts 1–20 explicitly bounded same-repository problems; no target silently falls back to another. Every Issue projection rendered by Plan remains a problem record even when paired with a local plan, and only the local artifact carries implementation decisions, path-level scope, ordering, and verification. A paired Issue created by `both` wraps its Plan-owned title/type/body projection in a versioned SHA-256 managed envelope. Later `both` revisions keep the canonical URL stable, skip implementation-only changes, update a validated projection for the same bounded problem, preserve content outside the block and unrelated labels, and fail closed on ownership, digest, or identity conflicts. Audit revisions additionally require the current managed projection to match the audit baseline and preserve the outside content observed immediately before writing.

`local` never mutates GitHub. Pure `issue` reuse remains read-only; after an explicitly successful original batch, each Issue definitively created by that invocation may receive at most one audit revision, only when its canonical title, complete body, and one change-type label match the invocation's write snapshot. Its batch marker establishes invocation identity, not permanent ownership. Both remote targets keep the original transaction and audit revisions bounded separately: a stopped original transaction never resumes through audit, every eligible Issue receives at most one additional edit and one canonical read-back, and the first revision conflict, failure, or ambiguous call stops later remote revisions even if read-back confirms the target. The original generation ledger, labels created in either phase, completed revisions, and unattempted revisions remain visible. These reads establish time-scoped observations, not an atomic GitHub compare-and-swap.

Release models authoritative version sources as release units, project-tool coordination as version groups, exact tag/GitHub mappings as release identities, and any existing version-bound repository release metadata as an optional part of the confirmed release set. Derived or substantively expanded sets wait for next-turn confirmation. Every path re-resolves from the fetched default branch, runs one verified non-tagging/non-committing/non-publishing release metadata transaction, creates one commit containing the complete set, and publishes each identity recoverably. The same semantic predicate governs fresh execution, local recovery, and remote reuse without imposing one metadata filename, schema, or tool.

## Truth and verification

`specs/<name>/spec.md` records each public capability's observable contract. Specs may be detailed high-fidelity references because they are not injected into every runtime call. Historical plans remain point-in-time records and are not rewritten as current interfaces.

Verification has three layers:

1. structure and interface tests: two-level category/skill discovery, globally unique names, frontmatter, public inventory, references, resolver, Skill↔Spec pairing, memory formats, and Markdown links;
2. deterministic project checks: Doctor's checker for Spec shape, links/anchors, placeholders, and file size;
3. direct behavior observation: actual sessions establish whether a capability follows its contract; static tests alone do not prove model behavior.

Development commands come from `package.json`:

```bash
pnpm check
pnpm test
pnpm lint
node skills/engineering/doctor/scripts/checker.ts . --json
```

## Installation

`npx skills add .` discovers `skills/<category>/<name>/SKILL.md` with the existing installer; no extra depth flag is needed. The repository root, `skills/` root, and category directories contain no `SKILL.md`, so a parent entry cannot hide the individual skills. Category READMEs and the Resolver are navigation documents, not installable skills.

Installation retains the original skill names without category prefixes; `npx skills add . --skill handoff` selects Handoff by name. The default shared-store symlink layout and `--copy` remain available. Installation is a snapshot; source changes require reinstalling.

Shape requires Explore, and Plan requires Review plus a host capable of an independent audit context; install or update each support pair together. Missing Plan audit support produces an explicit `inconclusive` result with retained artifacts.

## Architecture invariants

1. The installed surface is exactly the 13 Resolver entries and their 13 matching Specs; each skill has one canonical `skills/<category>/<name>/` directory and a globally unique name.
2. Every capability is independently enterable; upstream artifact history is optional context.
3. Main Skills remain capability guides and conditional routers, not copies of deep references or fixed global stages.
4. Explore retains its fixed Overview and owns Shape's required project context; Review owns Plan's one independent planning audit; Release retains its high-consequence safety predicates.
5. Agent-owned composition stays inside the user's authorized outcome and preserves each supporting capability's boundary.
6. Plan target and artifact semantics, Publish history safety, and Release confirmation/recovery identities do not drift.
7. The durable-memory catalog contains exactly six types.
8. `change-types.md` and `memory-catalog.md` each have one shared source.
9. No `SKILL.md` exists at the repository root, `skills/` root, or category level; categories are created only with actual skills and provide a README linking to every member.
10. Artifacts preserve but do not create intent authority; capability outcomes cannot manufacture upstream authority or a downstream independent verdict; corrections reopen actual dependents, and completion claims do not exceed outcome-relevant evidence.
11. Shape's reviewed Design Summary and Handoff's continuation snapshot improve state visibility without becoming mandatory upstream artifacts or a fixed capability chain.
12. Each capability preserves fail-close and clean-break at its own boundary: no claim manufactures success from a required failure, ambiguity, or missing state, and no authorized replacement retains an unapproved continuity path.

## Key decisions

### 2026-10-08: a plan is done when its implementation lands

Requiring an independent, post-merge Verify attestation before `done` left delivered plans permanently at `candidate` or `approved`, forced an extra PR just to change a status stored in the repository, and turned real-device or platform observations into blockers. The lifecycle is now `draft → approved → done`: Implement marks `done` once the implementation is complete and required automated checks pass, and the status lands with the code in the same PR. Assurance keeps tests, CI, Review, optional Verify results, and known limitations as a record, not a gate. Independent Verify runs only on request. Legacy plans whose implementation merged read as `done` without rewriting.

Earlier dated decisions below record their original terminology and sources. Their former capability names and producer fields are historical; current calls and newly written Assurance records follow the contracts above. Historical plans and attestation records retain their original provenance and do not supply a current acceptance claim without the present basis and evidence.

### 2026-09-10: clarification, diagnosis, review, and verification have distinct responsibilities

Shape now uses answerable rounds to help form judgments about intent and key design, retaining Explore and its read-only Design Summary boundary. Debug supplies diagnosis while Implement retains authorized repair ownership. Review and Verify replace the prior combined entry: Plan uses independent Review for artifact quality, and formal acceptance is produced by independent Verify with `Verify producer` provenance. The public surface has 13 entries and no compatibility route for the removed capability.

### 2026-09-07: Astra calibration and conditional acceptance

One shared skill set now uses proportional ordinary results and conditionally loaded formal acceptance. The plan lifecycle and formal attestation schema are unchanged; ordinary Check no longer requires their fields. Supporting calls return to the authorized owner, and local missing evidence is reported without stopping unrelated work. Behavior claims require actual sessions; static tests alone do not establish model improvement.

### 2026-08-20: paired Issue identity is stable while its managed problem record is revisable

The earlier create/reuse-only rule protected canonical identity by making every existing Issue body immutable. That left a paired Issue stale when a pre-implementation plan revision changed the underlying problem, constraints, or observable result. `both` distinguishes identity from content: it may synchronize only a versioned, digest-verified managed problem block for the same bounded problem, while preserving human-owned content and returning a conflict instead of overwriting unknown or externally changed protected state. The GitHub edit surface has no compare-and-swap guarantee, so every edit receives one read-back and the attestation remains a time-scoped observation.

### 2026-08-18: intent fidelity and completion attestation are producer-bounded

The suite now carries intent source, consequential authority, outcome-matched evidence, and correction invalidation across capability boundaries. Shape exposes a reviewed Design Summary before handoff, while direct entry remains valid. Implement produces an identifiable candidate and local evidence; only a fresh independent Check can attest acceptance for that basis. Findings deny acceptance without authorizing repair, and an authorized repair creates a new basis that must be checked again to regain acceptance. Local plans project `draft → approved → candidate → done`, but no artifact creates its own transition authority. This separates execution from acceptance without forcing every small Implement through Check or pretending Markdown is a host-enforced gate.

### 2026-08-11: release owns version-bound repository metadata

Some repositories make a user-facing changelog entry or another committed artifact an invariant of the target version. Release now includes such existing version-bound repository release metadata in its release set and commit instead of requiring a separate implementation/PR handoff. Repository instructions, specifications, code, tests, and release tooling establish whether that surface exists; absence never causes Release to invent one. Agent-derived substantive content uses the existing set-expansion confirmation judgment, while deterministic or already-matching content does not add a mandatory round trip.

### 2026-08-05: lightweight context architecture

The previous generation used long main prompts, repeated shared context, uniform body templates, and fixed capability chains. The maintainer chose a full context-engineering shift: re-author every main Skill as a lightweight guide, move deep knowledge behind conditional references, let the agent compose around the authorized outcome, preserve a fixed Explore Overview and on-demand TDD, and retain strict boundaries only where consequences justify them.

### 2026-07-23: release sets support monorepos

Release separates units, version groups, and tag identities so one transaction and commit can safely describe single-package, fixed/linked, independent, propagated, and aggregate release state. Project policy outranks generic SemVer, and agent-derived sets require visible cross-turn confirmation.

### 2026-07-21: 11 independent public capabilities

The public surface was consolidated into 11 outcomes at that time and removed mandatory upstream artifacts. The 2026-08-05 decision replaces its remaining fixed internal chains with adaptive composition while preserving the same public names and external side-effect owners.

### 2026-06-04: bounded durable memory

Specs alone could not hold positioning, architecture, visual identity, future decisions, and user entry information. The six-type catalog gives each durable claim a purpose, authority, and boundary without turning Docs into open-ended content creation.

Future decisions already deferred by the maintainer live in [ROADMAP.md](./ROADMAP.md).
