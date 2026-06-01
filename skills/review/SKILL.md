---
name: review
description: 'Pre-merge code review. Scans 5 dimensions (plan consistency / code quality / error handling / test coverage / simplification), filters by confidence ≥ 80, outputs graded suggestions. Use when the user says "review" / "look at the changes" / "check before merge" / "把关" / "评审". Not for proactive refactoring (use shape refactor), fixing bugs (use shape fix), or adding tests (use test) — review only looks, never touches.'
when_to_use: "review, code review, pre-merge check, 评审, 把关, 合并前检查, 看变更"
dispatch_intent: "5-dimension code review, confidence-filtered, suggestions only — no code changes"
---

# Review

Review is the last gate before merge — find the changes that could trip up a reviewer, a user, or production, give the author a direction, and let **the author** decide how to handle it. Every rule here exists to preserve the author's agency, keeping the judgment with them. The moment review edits a file, the author loses the chance to see their own review feedback.

Unfamiliar project? Run `/explore` first — a review without knowing the project's context produces "suggestions" that become noise.

**Review only looks, never touches.** Specifically, what it doesn't do:

- changes no file (code / tests / plan / SKILL.md / none of them)
- gives no full code patch — only a direction ("there's a race condition here, look at where to lock"); the author writes the code
- doesn't call other skills to do the work for the author (no auto-jump to fix / refactor / test)
- doesn't change plan status / doesn't commit / doesn't push

These constraints look like they weaken review's force; in fact they make review actually useful — a report that names problems without touching them is worth far more to the author than a PR that "fixed it all along the way" (with the latter, the author never had a chance to understand what happened).

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: a severity-graded findings report, each with file:line and a suggested direction
- Done when: all 5 dimensions (or the specified aspect) are scanned, every finding with confidence ≥ 80 is listed, and positive acknowledgment is given too
- Evidence: `git diff` / project guidelines (CLAUDE.md / AGENTS.md) / the plan file (if any) / the code actually Read
- Output: Critical / Important / Suggestion / Strengths sections + a next-step recommendation

## The 5 dimensions

| dimension                  | focus                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **plan** (plan consistency) | are the changes within plan scope / scope creep / a dependency the plan didn't name    |
| **quality** (code quality) | bugs / logic errors / project guidelines (CLAUDE.md/AGENTS.md) compliance / naming / dead code |
| **errors** (error handling) | silent failures / over-broad catch / improper fallback / mock in production code / missing logging |
| **tests** (test coverage)  | are the plan's acceptance scenarios covered / edge cases / are tests grounded in real behavior / duplicate coverage |
| **simplify** (simplification) | complexity / nesting / duplication / over-abstraction / over-engineering             |

## Aspect Filter

When the user's message contains a specific keyword, review only that dimension; with none specified, run all 5. Keywords are case-insensitive: `plan` / `quality` / `errors` / `tests` / `simplify`.

```bash
/review                       # all 5 dimensions
/review tests errors          # only tests + errors
/review plan                  # only plan consistency
```

Map Chinese / near-synonyms to the nearest dimension by meaning ("测试" → tests, "错误处理" → errors). If genuinely unsure, default to all 5 and note "aspect keyword not recognized, running all dimensions" — don't stop just because you're not certain.

## Confidence + grading

Give each finding a 0-100 confidence. **Aggressive filter — quality over quantity**: a review with 5 high-confidence findings is far more useful than 30 mixed ones. Mixing in low-confidence findings is a slow killer of reviewer trust.

| grade          | confidence | what this grade looks like                                                          |
| -------------- | ---------- | ----------------------------------------------------------------------------------- |
| **Critical**   | 91-100     | will definitely break: critical bug, clear project-guideline violation, silent failure in production code |
| **Important**  | 80-89      | strongly suspected but not merge-blocking: likely to break, the author should respond |
| **Suggestion** | 60-79      | suggested but optional: style / minor duplication / local simplification; the author can take it or leave it |
| —              | < 60       | not reported — high false-positive risk / noise; a miss costs less than a false alarm, so let it go rather than pad |

**"Style preference" is Suggestion at most**, unless it violates an explicit project-guideline rule — treating taste as Critical is abuse of authority.

## Flow

Gather context (in parallel):

```bash
git status --short
git diff <base>...HEAD       # change scope (base prefers origin/main, else the previous commit)
git log -5 --oneline         # recent commit style
cat CLAUDE.md AGENTS.md      # project guidelines (if present)
ls plans/                    # the most recent done/approved plan (if the plan dimension is in scope)
```

Decide which dimensions to run per the aspect filter. Scan each dimension independently, draft findings first, then filter by confidence ≥ 80 and output grouped by severity.

**Always give a Strengths section**, even just 1-2 items — a purely negative review makes the author close down their defensive absorption, cutting its value sharply.

When running the plan dimension and no plan file is found, skip it and note "no plan file, skipped plan-consistency scan"; don't guess the plan content.

When you find a class of problem, point the author to the matching skill instead of taking over:

- simplification opportunity → suggest `/shape refactor`
- test gap → suggest `/test add coverage`
- bug → suggest `/shape fix`
- scope creep → flag it and let the user decide (revert the out-of-plan change / accept it / go back to shape to change the plan)

## When done, report

```
# Review Summary

Reviewed: <git diff base..HEAD or specified scope>
Aspects: <plan, quality, errors, tests, simplify> or a subset
Confidence threshold: ≥ 80

## Critical (X)
- [<dim>] <file:line> — <issue> (confidence: NN)
  → suggestion: <direction>

## Important (X)
- [<dim>] <file:line> — <issue> (confidence: NN)
  → suggestion: <direction>

## Suggestions (X)
- [<dim>] <file:line> — <issue> (confidence: NN)
  → suggestion: <direction>

## Strengths
- <one or two positive acknowledgments>

## Recommended Next
- Critical first: <specific action, e.g. /shape fix>
- Important next: <...>
- Suggestion as appropriate
```

With no high-confidence findings, still produce the report: write "None" under each of Critical / Important / Suggestion, give full positive acknowledgment under Strengths, and mark "Ready to commit/push".

## When to stop

Review differs from the other skills — its failure mode isn't "forcing through", it's "touching". Stop and report in these cases:

- **The working tree matches HEAD exactly (no diff to look at)** — report "no changes to review"; don't force a review of historical commits; the user didn't ask to review history, so don't overstep.
- **detached HEAD / rebase or merge in progress** — git state is unusual and the diff range may be inaccurate; report the state and let the user decide.
- **An obvious aspect spelling error** (e.g. `/review xxx` where `xxx` is neither a known aspect nor a reasonable Chinese / synonym) — report "can't recognize aspect 'xxx', available: plan / quality / errors / tests / simplify" and let the user re-pick; don't silently fall back to all dimensions.
- **The urge to "just fix it real quick" during review** — stop immediately, write the finding instead of touching it. The moment review touches, it loses its standing as review.
