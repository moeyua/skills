---
name: check
description: 'Check a change holds up before merge — by code review, by running the test suite, or by driving the app end-to-end; with no mode named it runs the full gate (review + test, e2e when applicable). Use when the user says "review" / "run the tests" / "check this works" / "把关" / "验证", or before committing. Not for fixing the bugs it finds (use shape fix), writing the implementation or its tests (use implement), or recording what landed (use docs).'
when_to_use: "check, verify, review, code review, run tests, e2e, end to end, check it works, 验证, 评审, 把关, 跑测试, 端到端, 合并前检查"
dispatch_intent: "Confirm a change holds up before merge — review / test / e2e; verdicts and directions, no code changes"
---

# Check

Check is the last gate before merge — confirm a change holds up, then hand the author a verdict and a direction. It checks three ways: **review** (read the diff with judgment), **test** (run the suite for ground truth), **e2e** (drive the real app and watch it behave). Every rule here exists to keep check's word **trustworthy**: it reports what it actually found — never a fix slipped in along the way, never a flaky pass dressed up as green. The moment check edits a file, the author loses the chance to see their own feedback.

Unfamiliar project? Run `/explore` first — checking a project you haven't mapped produces noise, not signal.

**Check confirms, it doesn't change.** Specifically: it changes no source / tests / plan; it gives no full patch (only a direction); it doesn't call other skills to do the work for the author; it doesn't commit or push. The `test` and `e2e` modes _execute_ code (run the suite, launch the app) to observe behavior — but observing is not editing.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: a verdict (holds up / doesn't) plus graded findings or observed behavior, with the decision left to the author
- Done when: review → the dimensions (or specified aspect) are scanned and findings ≥ 80 confidence listed with Strengths; test → the suite ran and pass/fail is fully reported; e2e → the app ran and the observed behavior is reported against the expectation; in all cases every mode in the run's set either ran or is named as skipped with its reason
- Evidence: `git diff` / the actual test output / the running app's observed behavior / project guidelines (CLAUDE.md / AGENTS.md) / the plan (if any)
- Output: a verdict + findings/observations + a next-step recommendation

## Three modes (routed by the message)

| cue in the user's message                                                   | mode                                          |
| --------------------------------------------------------------------------- | --------------------------------------------- |
| "review" / "look at the changes" / "把关" / an aspect keyword               | review                                        |
| "run the tests" / "do the tests pass" / "flaky?"                            | test                                          |
| "check it works" / "verify the feature" / "screenshot it" / "does X behave" | e2e                                           |
| no mode cue (bare `/check` / "验证一下" with no lean)                       | full gate: review + test, e2e when applicable |

The message routes naturally; an explicit cue narrows to its mode ("跑下测试" runs test alone), and modes can combine ("review + verify it runs"). **No cue means the full gate** — a gate whose width depends on how the author happened to phrase the request isn't a gate. Review and test always run: one is judgment, the other is ground truth, and both are cheap. e2e joins when the change touches user-visible behavior and the project has a way to launch — against a docs-only change it's noise, not signal. Every mode that doesn't run is named in the report with the reason, so the author sees the gate's actual width instead of assuming it.

**Each mode runs in its own subagent, in parallel; the main session only routes, collects, and synthesizes one combined verdict.** Two reasons beyond wall-clock. Objectivity: the most common sequence is implement → check, and a context that just wrote the code reviewing that same code tends to confirm itself — a clean-context subagent has to rebuild the judgment independently. Isolation: the full diff, a failing suite's output, and an e2e tool transcript stay in the subagent; the main session keeps only the verdict. The subagent can't see the session, so the spawning prompt carries everything its mode needs: the mode's rules from this file, the diff and the plan, the test command or app launch path, and any constraints the author stated along the way. If the host can't spawn subagents, run the same mode set sequentially inline and note that in the report — the gate's width never depends on the execution model.

## review mode

Find the changes that could trip up a reviewer, a user, or production; give a direction; leave the decision with the author. Scan 5 dimensions (or the specified aspect):

| dimension                     | focus                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| **plan** (plan consistency)   | within plan scope / scope creep / a dependency the plan didn't name                                |
| **quality** (code quality)    | bugs / logic errors / project-guideline (CLAUDE.md/AGENTS.md) compliance / naming / dead code      |
| **errors** (error handling)   | silent failures / over-broad catch / improper fallback / mock in production code / missing logging |
| **tests** (test coverage)     | acceptance scenarios covered / edge cases / tests grounded in real behavior / duplicate coverage   |
| **simplify** (simplification) | complexity / nesting / duplication / over-abstraction / over-engineering                           |

**Aspect filter**: a recognized keyword (`plan` / `quality` / `errors` / `tests` / `simplify`, case-insensitive, map Chinese/synonyms by meaning) scopes the scan to that dimension; none → run all 5. If a keyword is unrecognizable, report the available aspects and let the user re-pick.

**Confidence + grading** (aggressive filter — quality over quantity; mixing in low-confidence findings is a slow killer of trust):

| grade          | confidence | what it looks like                                                                  |
| -------------- | ---------- | ----------------------------------------------------------------------------------- |
| **Critical**   | 91-100     | will definitely break: critical bug, clear guideline violation, silent prod failure |
| **Important**  | 80-89      | strongly suspected, not merge-blocking: likely to break; the author should respond  |
| **Suggestion** | 60-79      | optional: style / minor duplication / local simplification                          |
| —              | < 60       | not reported — a miss costs less than a false alarm                                 |

"Style preference" is Suggestion at most, unless it violates an explicit project-guideline rule. **Always give a Strengths section**, even 1-2 items — a purely negative review makes the author stop absorbing it. When a plan dimension is in scope but no plan file is found, skip it and note so; don't guess plan content.

Gather context in parallel: `git status --short`, `git diff <base>...HEAD` (base prefers origin/main, else previous commit), `git log -5 --oneline`, project guidelines, the most recent plan (if plan dimension in scope).

## test mode

Detect the framework + command (`package.json` scripts / `Cargo.toml` / `pyproject.toml` / `go.mod` …) and run it. Report: total / pass / fail / skipped, and group failures by "looks related / looks independent" — shared-root-cause failures are faster handled together.

**Flaky suspicion**: when a test looks timing- or resource-sensitive, **retry once only**; still failing means it's failing, not flaky. Passing after many retries and calling it green is waiting for luck, not verifying.

A failure that reflects a real bug routes to `/shape fix` — check reports it, it doesn't fix it. Never `.skip` / delete a test / add `--no-verify` to make it pass; the failure is the signal.

## e2e mode

Confirm the change actually works by running the real app and observing behavior — the check that neither reading nor unit tests give.

**First look for a project skill that already covers launching the app** (a `run`/`dev` skill, a documented command); only if none exists, fall back to per-project-type patterns: CLI (invoke it), server (start + hit an endpoint), TUI (drive it), Electron/desktop (launch), browser-driven (open + interact, screenshot), library (a small harness). Drive the relevant path, observe, and report observed-vs-expected. Don't edit source to make it run; if it won't start, report that as the finding.

## Boundaries

- **vs implement** — implement writes code and its tests; check runs and reads them, never edits.
- **vs shape fix** — check finds and reports a bug; shape fix diagnoses root cause and plans the fix.
- **vs docs** — check judges whether a change holds up; docs records what it established.

When you find a class of problem, point the author to the matching skill instead of taking over: bug → `/shape fix`; missing/weak tests → `/implement` (add coverage); simplification → `/shape refactor`; scope creep → flag it, let the user decide.

## When done, report

```
# Check Summary

Modes: ran <review, test, ...> / skipped <mode> (reason)   Scope: <git diff base..HEAD / suite / app path>
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
- <findings → route by class, Critical first: e.g. /shape fix>
- <clean + durable memory worth recording → /docs>
- <clean + nothing to record → core loop complete; delivery per the project's workflow (commonly /commit)>
```

The three branches are exclusive — the verdict picks the edge. With no high-confidence findings and a clean run, say so plainly and mark the core loop complete — delivery proceeds per the project's workflow. A mode that belonged to this run's set — requested, or part of the default gate — but didn't run is listed as skipped with its reason; silence reads as "checked" when it wasn't. A mode the author explicitly narrowed away isn't "skipped", it was never in the set.

## When to stop

Check's failure mode isn't "forcing through", it's "touching" — and "faking a pass". Stop and report in these cases:

- **The urge to "just fix it real quick"** — write the finding instead; the moment check touches, it loses its standing.
- **The working tree matches HEAD (nothing to review)** / **detached HEAD or rebase in progress** — report the state; don't review history the user didn't ask for.
- **A test still fails after one retry** — treat it as failing; don't `.skip`, delete, or retry to luck.
- **A failure reflects a real bug** — report it and route to `/shape fix`; don't patch the test to pass.
- **No test framework (and not an empty project)** — report it; don't conjure test infrastructure.
- **The app won't launch in e2e** — report that as the finding; don't edit source to force it up.
