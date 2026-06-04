---
name: verify
description: 'Verify a change holds up before merge — by code review, by running the test suite, or by driving the app end-to-end. Use when the user says "review" / "run the tests" / "check this works" / "把关" / "验证", or before committing. Not for fixing the bugs it finds (use shape fix), writing the implementation or its tests (use build), or recording what landed (use persist).'
when_to_use: "verify, review, code review, run tests, e2e, end to end, check it works, 验证, 评审, 把关, 跑测试, 端到端, 合并前检查"
dispatch_intent: "Confirm a change holds up before merge — review / test / e2e; verdicts and directions, no code changes"
---

# Verify

Verify is the last gate before merge — confirm a change holds up, then hand the author a verdict and a direction. It checks three ways: **review** (read the diff with judgment), **test** (run the suite for ground truth), **e2e** (drive the real app and watch it behave). Every rule here exists to keep verify's word **trustworthy**: it reports what it actually found — never a fix slipped in along the way, never a flaky pass dressed up as green. The moment verify edits a file, the author loses the chance to see their own feedback.

Unfamiliar project? Run `/explore` first — verifying a project you haven't mapped produces noise, not signal.

**Verify confirms, it doesn't change.** Specifically: it changes no source / tests / plan; it gives no full patch (only a direction); it doesn't call other skills to do the work for the author; it doesn't commit or push. The `test` and `e2e` modes _execute_ code (run the suite, launch the app) to observe behavior — but observing is not editing.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: a verdict (holds up / doesn't) plus graded findings or observed behavior, with the decision left to the author
- Done when: review → the dimensions (or specified aspect) are scanned and findings ≥ 80 confidence listed with Strengths; test → the suite ran and pass/fail is fully reported; e2e → the app ran and the observed behavior is reported against the expectation
- Evidence: `git diff` / the actual test output / the running app's observed behavior / project guidelines (CLAUDE.md / AGENTS.md) / the plan (if any)
- Output: a verdict + findings/observations + a next-step recommendation

## Three modes (routed by the message)

| cue in the user's message                                                   | mode  |
| --------------------------------------------------------------------------- | ----- |
| "review" / "look at the changes" / "把关" / an aspect keyword                | review |
| "run the tests" / "do the tests pass" / "flaky?"                            | test  |
| "check it works" / "verify the feature" / "screenshot it" / "does X behave" | e2e   |

The message routes naturally; modes can combine ("review + verify it runs"). When more than one mode is requested, **run each in its own subagent, in parallel** — the modes are independent (review only reads; test/e2e run), so there's no shared state to serialize, and the wall-clock cost is the slowest mode, not their sum. Then synthesize the subagents' results into one combined verdict. A single mode runs inline — don't pay subagent overhead for one.

## review mode

Find the changes that could trip up a reviewer, a user, or production; give a direction; leave the decision with the author. Scan 5 dimensions (or the specified aspect):

| dimension                     | focus                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| **plan** (plan consistency)   | within plan scope / scope creep / a dependency the plan didn't name                            |
| **quality** (code quality)    | bugs / logic errors / project-guideline (CLAUDE.md/AGENTS.md) compliance / naming / dead code  |
| **errors** (error handling)   | silent failures / over-broad catch / improper fallback / mock in production code / missing logging |
| **tests** (test coverage)     | acceptance scenarios covered / edge cases / tests grounded in real behavior / duplicate coverage |
| **simplify** (simplification) | complexity / nesting / duplication / over-abstraction / over-engineering                        |

**Aspect filter**: a recognized keyword (`plan` / `quality` / `errors` / `tests` / `simplify`, case-insensitive, map Chinese/synonyms by meaning) scopes the scan to that dimension; none → run all 5. If a keyword is unrecognizable, report the available aspects and let the user re-pick.

**Confidence + grading** (aggressive filter — quality over quantity; mixing in low-confidence findings is a slow killer of trust):

| grade          | confidence | what it looks like                                                                  |
| -------------- | ---------- | ----------------------------------------------------------------------------------- |
| **Critical**   | 91-100     | will definitely break: critical bug, clear guideline violation, silent prod failure |
| **Important**  | 80-89      | strongly suspected, not merge-blocking: likely to break; the author should respond  |
| **Suggestion** | 60-79      | optional: style / minor duplication / local simplification                          |
| —              | < 60       | not reported — a miss costs less than a false alarm                                  |

"Style preference" is Suggestion at most, unless it violates an explicit project-guideline rule. **Always give a Strengths section**, even 1-2 items — a purely negative review makes the author stop absorbing it. When a plan dimension is in scope but no plan file is found, skip it and note so; don't guess plan content.

Gather context in parallel: `git status --short`, `git diff <base>...HEAD` (base prefers origin/main, else previous commit), `git log -5 --oneline`, project guidelines, the most recent plan (if plan dimension in scope).

## test mode

Detect the framework + command (`package.json` scripts / `Cargo.toml` / `pyproject.toml` / `go.mod` …) and run it. Report: total / pass / fail / skipped, and group failures by "looks related / looks independent" — shared-root-cause failures are faster handled together.

**Flaky suspicion**: when a test looks timing- or resource-sensitive, **retry once only**; still failing means it's failing, not flaky. Passing after many retries and calling it green is waiting for luck, not verifying.

A failure that reflects a real bug routes to `/shape fix` — verify reports it, it doesn't fix it. Never `.skip` / delete a test / add `--no-verify` to make it pass; the failure is the signal.

## e2e mode

Confirm the change actually works by running the real app and observing behavior — the check that neither reading nor unit tests give.

**First look for a project skill that already covers launching the app** (a `run`/`dev` skill, a documented command); only if none exists, fall back to per-project-type patterns: CLI (invoke it), server (start + hit an endpoint), TUI (drive it), Electron/desktop (launch), browser-driven (open + interact, screenshot), library (a small harness). Drive the relevant path, observe, and report observed-vs-expected. Don't edit source to make it run; if it won't start, report that as the finding.

## Boundaries

- **vs build** — build writes code and its tests; verify runs and reads them, never edits.
- **vs shape fix** — verify finds and reports a bug; shape fix diagnoses root cause and plans the fix.
- **vs persist** — verify judges whether a change holds up; persist records what it established.

When you find a class of problem, point the author to the matching skill instead of taking over: bug → `/shape fix`; missing/weak tests → `/build` (add coverage); simplification → `/shape refactor`; scope creep → flag it, let the user decide.

## When done, report

```
# Verify Summary

Modes: <review / test / e2e (or a subset)>   Scope: <git diff base..HEAD / suite / app path>
Verdict: holds up / needs work

## Critical (X) / Important (X) / Suggestions (X)        ← review
- [<dim>] <file:line> — <issue> (confidence: NN) → <direction>

## Test run                                              ← test
<command> → Total N | Pass N | Fail N | Skipped N  (+ grouped failures)

## Observed behavior                                     ← e2e
<what ran> → <observed vs expected>

## Strengths
- <1-2 positives>

## Recommended Next
- <Critical first: e.g. /shape fix> / <commit if clean>
```

With no high-confidence findings and a clean run, say so plainly and mark "Ready to commit/push".

## When to stop

Verify's failure mode isn't "forcing through", it's "touching" — and "faking a pass". Stop and report in these cases:

- **The urge to "just fix it real quick"** — write the finding instead; the moment verify touches, it loses its standing.
- **The working tree matches HEAD (nothing to review)** / **detached HEAD or rebase in progress** — report the state; don't review history the user didn't ask for.
- **A test still fails after one retry** — treat it as failing; don't `.skip`, delete, or retry to luck.
- **A failure reflects a real bug** — report it and route to `/shape fix`; don't patch the test to pass.
- **No test framework (and not an empty project)** — report it; don't conjure test infrastructure.
- **The app won't launch in e2e** — report that as the finding; don't edit source to force it up.
