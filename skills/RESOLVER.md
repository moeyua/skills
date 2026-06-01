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

| trigger                                                                                                                                  | skill                  |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| "run the tests" / "add tests" / "add a regression" / "coverage" / "this test is failing" / "flaky?" / `/test` / run, add, or debug tests | `skills/test/SKILL.md` |

### 4. Gate

| trigger                                                                                                                                      | skill                    |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| "review" / "look at the changes" / "把关" / "check before merge" / `/review` / 5-dimension scan, look-don't-touch; supports an aspect filter | `skills/review/SKILL.md` |

### 5. Crystallize

| trigger                                                                                                                                                                | skill                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| "record this behavior" / "crystallize the spec" / "update specs/X" / `/spec` / merge a built change's spec delta into the source of truth, or correct an existing spec | `skills/spec/SKILL.md` |

### 6. Land / Push

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
explore → shape → build → test → review → spec → commit → propose
```

shape branches internally by intent: default / fix / feat / refactor / perf.

spec runs at the tail when a change alters behavior worth recording — it crystallizes the plan's spec delta into the persistent `specs/` source of truth, or corrects an existing spec. It's conditional, not every change touches it.
