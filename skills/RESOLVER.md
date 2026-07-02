# Squire Skill Resolver

> A trigger-to-skill routing table. Claude Code matches automatically via each SKILL.md's `description`; this doc is the human-facing central index, and also the basis `tests/smoke/verify-skills.test.ts` checks against. When you change a skill's scope, update this in sync.

## Context / Report

### Explore

| trigger                                                                                                                                       | skill                     |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| new repo / unfamiliar module / "look at this project" / "整体了解一下" / "look at the X module" / `/explore` / building a base for later work | `skills/explore/SKILL.md` |

## Core Loop

### 1. Shape

| trigger                                                                                                                                                                           | skill                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| "think it through" / "how should we do this" / "出方案" / "should we" / brainstorm / error diagnosis / new feature / refactor / perf optimization / `/shape` / plan before acting | `skills/shape/SKILL.md` |

### 2. Implement

| trigger                                                                                                              | skill                       |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| "implement" / "build it" / "apply the plan" / "实现" / "落实" / `/implement` / land code after shape produces a plan | `skills/implement/SKILL.md` |

### 3. Check

| trigger                                                                                                                                            | skill                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| "review" / "run the tests" / "check it works" / "把关" / "验证" / `/check` / review + test + e2e gate before merge, verdict only — no code changes | `skills/check/SKILL.md` |

### 4. Docs

| trigger                                                                                                                                                                                        | skill                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| "document this" / "record this" / "update ARCHITECTURE / specs/X" / "write docs/setup.md" / `/docs` / document a built change into catalog memory, or update a user-specified project document | `skills/docs/SKILL.md` |

## Workflow-Managed Stages

These are squire skills, but not part of the core loop. A project's WORKFLOW.md or maintainer process decides whether and when they run.

| trigger                                                                                                         | skill                    |
| --------------------------------------------------------------------------------------------------------------- | ------------------------ |
| "commit" / "stage and commit" / "入库" / `/commit` / land code after editing                                    | `skills/commit/SKILL.md` |
| "open a PR" / "pull request" / "push it" / "提评审" / `/pr` / push to the remote and open a PR after committing | `skills/pr/SKILL.md`     |

## Orthogonal Tools

| trigger                                                                                                                                               | skill                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| "health check" / "what has drifted" / "体检" / "审计" / `/doctor` / whole-project audit: docs-vs-code drift + dependency/CI/file staleness, read-only | `skills/doctor/SKILL.md`  |
| "hand over" / "continue in a new session" / "context summary" / "交接" / "新会话继续" / `/handoff` / read-only handoff summary to continue elsewhere  | `skills/handoff/SKILL.md` |

## Disambiguation

> Rules for resolving when multiple skills could match. Fill in after a conflict appears in real use.

## Chaining

Skills don't chain automatically. Each one stops when done and waits for the user to decide the next step.

`explore` has two positions:

- **User-facing report** — `/explore` or "look at this project" emits an Explore Report and has no outgoing edge.
- **Embedded context** — `shape`, `implement`, `check`, `docs`, and `doctor` may use explore in context mode when they lack reliable project facts. That preflight follows explore's reading rules, emits no Explore Report, and carries evidence into the current skill's output. It is not a workflow node and not workflow chaining.

**Next-step suggestions follow one rule: position determines modality.** A change walks a state graph — each skill is a node, its closing "next step" is that node's outgoing edge, and where the node sits decides how the suggestion is made:

- **Fixed** — the success edge inside the core loop is unique: shape (named mode) → implement; implement → check.
- **Judged** — the edge depends on this run's outcome: check routes by verdict (findings → the owning skill; clean → docs, or delivery when there's nothing to record); shape's brainstorm mode converges into a named mode or ends; doctor routes its findings.
- **Default-but-overridable** — past the core loop's exit the project's WORKFLOW owns the edge; the skill only supplies the common default: docs → commit, commit → pr.
- **None** — no outgoing edge: explore (the report is the end), pr, handoff.

Whatever the modality, a suggestion is only a suggestion — the user walks the graph.

Core loop:

```
shape → implement → check → docs
```

`explore` is omitted from this graph because it is either an explicit report before the loop or embedded grounding inside a node.

Workflow-managed stages commonly follow, but are project-specific:

```
commit → pr
```

Shape branches internally by intent: brainstorm / fix / feat / refactor / perf. Check gates one of three ways: review / test / e2e.

Docs runs at the loop's tail — after check passes, before delivery — when a change produces durable memory worth recording — it writes into the right catalog artifact (spec / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README) per `rules/memory-catalog.md`, or updates a concrete catalog-external project doc only when the user names that target.

`doctor` is the orthogonal audit — a read-only, whole-project checkup (docs-vs-code drift + dependency/CI/file staleness) that runs outside the core loop, on demand. It only detects and reports; docs writes any correction it surfaces.

`handoff` is the other orthogonal tool — a read-only, host-neutral session-handoff summary, generated on demand when a session ends or moves to another agent. It never chains onward and writes nothing; the user carries its output to the next session.
