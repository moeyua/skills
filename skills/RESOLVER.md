# Squire Skill Resolver

> A trigger-to-skill routing table. Claude Code matches automatically via each SKILL.md's `description`; this doc is the human-facing central index, and also the basis `tests/smoke/verify-skills.test.ts` checks against. When you change a skill's scope, update this in sync.

## Routing by workflow stage

### 0. Understand

| trigger                                                                                                                                       | skill                     |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| new repo / unfamiliar module / "look at this project" / "整体了解一下" / "look at the X module" / `/explore` / building a base for later work | `skills/explore/SKILL.md` |

### 1. Design

| trigger                                                                                                                                                                            | skill                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| "think it through" / "how should we do this" / "出方案" / "should we" / brainstorm / error diagnosis / new feature / refactor / perf optimization / `/shape` / shape before acting | `skills/shape/SKILL.md` |

### 2. Execute

| trigger                                                                                                          | skill                   |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------- |
| "implement" / "build it" / "apply the plan" / "实现" / "落实" / `/build` / land code after shape produces a plan | `skills/build/SKILL.md` |

### 3. Verify

| trigger                                                                                                                                             | skill                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| "review" / "run the tests" / "check it works" / "把关" / "验证" / `/verify` / review + test + e2e gate before merge, verdict only — no code changes | `skills/verify/SKILL.md` |

### 4. Record

| trigger                                                                                                                                                                         | skill                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| "record this" / "persist the spec" / "update ARCHITECTURE / specs/X" / `/persist` / record a built change into the right memory artifact per the catalog, or correct / backfill | `skills/persist/SKILL.md` |

### 5. Land / Push

| trigger                                                                                                          | skill                     |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------- |
| "commit" / "stage and commit" / "入库" / `/commit` / land code after editing                                     | `skills/commit/SKILL.md`  |
| "open a PR" / "push it" / "提评审" / `/propose` / push to the remote and open a PR after committing; GitHub-only | `skills/propose/SKILL.md` |

## Disambiguation

> Rules for resolving when multiple skills could match. TODO: fill in after each SKILL.md is finalized.

## Chaining

Skills don't chain automatically. Each one stops when done and waits for the user to decide the next step.

Base loop:

```
explore → shape → build → verify → persist → commit → propose
```

shape branches internally by intent: default / fix / feat / refactor / perf. verify checks one of three ways: review / test / e2e.

persist runs at the tail when a change produces durable memory worth recording — it records into the right catalog artifact (spec / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README) per `rules/memory-catalog.md`, or corrects an existing one. It's conditional, not every change touches it. The orthogonal `health` audit (drift/gaps) is planned — see ROADMAP.
