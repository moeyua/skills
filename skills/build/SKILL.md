---
name: build
description: 'Execute an approved plan into code that fits the project''s style; run TDD when the project has tests. Use when the user says "implement" / "build it" / "apply the plan" / "实现" / "落实" / "按方案做", or right after shape produces a plan. Not for coding before a plan exists (run shape first), writing prose docs, or changing code outside the plan.'
when_to_use: "implement, build, write code, apply the plan, execute plan, 实现, 落实, 写代码, 按方案做, 开始动手"
dispatch_intent: "Execute an approved plan file into code, strictly"
---

# Build

Build turns an approved plan into code that fits the project. The intent work is already done in shape; here you only execute — no redesigning, no drive-by fixes, no drifting from the plan. Every rule below exists to stop you from reopening intent decisions mid-execution.

No plan yet? Run `/shape` first.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: every implementation step in the plan is done, verification passes, and the changes match the project's style
- Done when: every step's verify passes and the plan's frontmatter `status` is set to `done`
- Evidence: each file you changed + the actual output of the plan's verification commands
- Output: a change list + verify results + any deviation, surfaced

## Preflight: get the plan, confirm it runs

Do these in parallel:

1. **Locate the plan**: if the user's message has a path, use it; otherwise take the newest `status: approved` plan under `plans/` (sorted by YYYY-MM-DD). If there is none, report the state and ask the user to point to one or run `/shape` first — don't guess the goal.
2. **Read the whole plan**: the plan is the only ground truth for this run; starting without reading it is guessing.
3. **Scan the project skeleton**: `git status --short` for a dirty tree, `git branch --show-current` for the current branch, `git log --oneline -5` to learn the commit style, `ls package.json pnpm-lock.yaml Cargo.toml ...` to identify the project type and test framework.

If any of these conditions fails, report the state and stop — let the user decide, don't push through:

- **Plan status is `approved`** — if it is `draft` and build was triggered by an approval signal (`/build`, "apply the plan", "按方案做"), set the status to `approved` and continue; the command itself is the user's approval. `done` means it already ran — stop and ask the user.
- **No placeholders** (`TBD` / `TODO` / `implement later` / `similar to step N`) — these signal an unfinished plan; go back to shape to complete it.
- **Clean working tree** — a dirty tree may hide unsaved changes that a blind run would overwrite; let the user decide whether to commit or discard first.
- **The files and interfaces the plan assumes still exist** — grep the paths and function names the plan names. Drift means the plan is out of sync with the code; go back to shape to fix the plan.

## Branch setup: don't build on a protected branch

Before the first edit, check `git branch --show-current`. If it's a protected branch (`main` / `master` / `develop`) or empty (detached HEAD), create a working branch: `git checkout -b <plan-slug>`, where the slug is the plan filename minus the `YYYY-MM-DD-` date prefix (`plans/2026-06-01-feat-rbac.md` → `feat-rbac`). If that branch name already exists, `git checkout` it instead of failing — a name collision is almost always the same plan resumed. If you're already on a non-protected branch, keep it.

This keeps the work off the mainline so the later commit and PR have a branch to live on — propose refuses to push a protected branch, so landing the work there just forces a detour later. Building on a clean working tree (Preflight already required it) means `git checkout -b` carries nothing unexpected across. Report which branch you're on before editing.

## Standard flow

Run the plan's implementation steps in order; each one verifies independently. First check whether the project has a test framework (`package.json`'s `scripts.test*`, or the presence of `tests/` / `__tests__/` / `*.test.*` / `*.spec.*` / `*_test.go`), then pick a path.

**Framework present and plan mode is fix / feat → run TDD**:

1. Write or update tests from the plan's regression tests / acceptance scenarios.
2. Run them; they must be red. Green from the start means the test doesn't actually cover that scenario — stop and fix the test.
3. Write the implementation code.
4. Run them; they must be green. If you can't get to green, report the failure and let the user decide; don't retry many times, delete tests, or add `--no-verify`.
5. Move to the next step.

**No framework, or plan mode is refactor / perf → no TDD**:

1. Change the code.
2. Run the commands in the plan's verification section to prove the step is done.
3. Move to the next step.

Surface each step's red→green / verify output as you go — don't run every step silently and report only at the end. Problems that surface mid-run get decided mid-run.

When every step is done → run the full plan verification → set the plan's `status: done` → write the report.

### TDD applicability matrix

| plan mode  | TDD        | how                                                       |
| ---------- | ---------- | --------------------------------------------------------- |
| `fix`      | strong fit | regression test red first → fix to green                  |
| `feat`     | strong fit | acceptance scenarios red first → implement to green       |
| `refactor` | no fit     | existing tests guard the invariant; keep them green       |
| `perf`     | no fit     | baseline → optimize → measure again to target             |

Refactor and perf skip TDD because their invariant is "behavior unchanged" or "a performance number" — neither is expressible as "write a red test, then go green." Existing tests are the better guard net.

## Engineering constraints

These all share one root: don't re-judge intent while implementing. Intent was judged in shape; reopening it here is where scope creep starts.

- **Match the project's code style** (indentation, naming, import order, error handling). The existing style reflects the team's real choices, including many implicit conventions that no lint rule captures; a new style forces the reviewer to absorb it all over again.
- **Don't touch dependencies**: unless the plan says so, add no new dependency, bump nothing up or down, leave the lockfile alone. Adding a dependency is a product decision and belongs to shape.
- **Hold scope to the plan**: change no file outside it, fix no unrelated bug along the way, refactor nothing on the side. Note anything you spot in the final report, but don't act on it — acting takes it out of the reviewer's view.
- **No comments by default**: good names beat comments; write one only when the why isn't obvious (a hidden constraint, a counterintuitive tradeoff, the reason for a workaround). Don't write "this function does X", and don't write the plan path or issue number — those belong in the commit message.
- **Handle only real error cases**: don't add try/catch or null checks for cases that can't happen. Redundant defense hurts readability and masks the root cause when something really fails.
- **Don't bypass quality gates**: no `--no-verify`, `--force`, `// @ts-ignore`, or `// eslint-disable`. Forcing past a tool that stopped you throws away the signal it gave.
- **A failing test is a signal, not a nuisance**: don't delete, weaken, or skip an existing test to make the code "pass" — the cost is the test's whole point.
- **Secrets go through config**: don't hardcode tokens, API keys, or passwords; use environment variables or the project's usual config.
- **Test code is code too**: every constraint above applies to it as well; cover the plan's acceptance scenarios, no more and no less.

## When to stop

Build's most common failure is pushing through where it should stop. In these cases, report the state and let the user decide — don't find a way around them:

- **The plan doesn't match the code** (wrong path, missing function, assumption broken) — that's plan drift; go back to shape to fix the plan, don't quietly adjust a path to make it line up.
- **You'd need a dependency the plan didn't name** — go back to shape to fix the plan, or use what the project already has. Never run a silent `pnpm add`.
- **A TDD test is green the moment you write it** — it doesn't really cover that scenario; fix the test and try again.
- **Verify fails and one retry still fails** — don't silently skip it or delete the test; report the failure output and let the user decide.
- **You want to edit the plan to make implementation easier** — build never changes plan content, only `status: done`. To change the plan, go back to shape.
- **The project has no test framework but you want to force TDD** — follow the plan's verification instead; don't conjure test infrastructure from nothing.
- **You're about to write an API, call syntax, or framework feature from memory** — grep the project's existing usage or check the docs first; see `references/anti-patterns.md`.

## When done, report

```
Built plans/<path>.md (now status: done)

Branch: <name> (created from <protected-branch> / existing)

Changes:
- <file>: <one-line description>
- ...

Tests:
- <test-file>: N tests added/changed (TDD: red → green)

Verify: <command> → pass

Next: run review to check it / run commit to land it / continue to the next plan
```
