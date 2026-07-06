---
name: doctor
description: "Audit a whole project's health — first whether its docs still match the code, then dependency/CI/file-size staleness and broken references. A bundled deterministic script does the mechanical checks; model judgment does the docs-vs-code part. Use when you want a project-wide checkup or to find what has drifted; read-only and advisory. Not for change-scoped pre-merge review (use check), writing the fixes it finds (use docs), or fixing flagged code (use shape fix)."
when_to_use: "doctor, health, audit, checkup, drift, doc drift, stale docs, dependency staleness, broken references, 体检, 健康, 漂移, 文档漂移, 陈旧, 审计"
dispatch_intent: "Project-wide read-only health audit — docs-vs-code consistency first, plus a bundled mechanical checker; advisory only"
allowed-tools: "Bash(node *), Bash(pnpm outdated*), Bash(npm outdated*), Bash(gh run list*), Bash(git log*)"
---

# Doctor

Doctor is a project checkup — it audits whether a project's memory still holds up against its code, then reports what has drifted, and stops there. It is the orthogonal-audit half of the check pillar: check gates one change before merge; doctor steps back and looks at the whole project, outside the loop. Every rule here exists to keep doctor's word **trustworthy and advisory**: it reports what it found and points you at the skill that fixes it — it never edits, commits, or chains onward itself.

Before auditing, decide whether the project and memory layout are reliable enough for drift judgment. If not, use `explore` in context mode first: Overview before deep-dive, depth matched to audit scope, no Explore Report. Auditing a project you haven't mapped produces noise, not signal, so the evidence must feed the Health Report.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: an advisory health report — what has drifted / gone stale, graded, each pointing at the skill that resolves it
- Done when: the mechanical checker has run (or its skip is noted), the main docs-vs-code pass is done, model findings ≥ 80 confidence are graded, and skipped checks are stated
- Evidence: context preflight files / commands when used + checker output + actual `pnpm outdated` / `gh run list` / `git log` output + the docs and code you read
- Output: a Health Report + a next-step per finding; never a file edit

**Doctor confirms drift, it doesn't fix it.** It writes no file, commits nothing, calls no other skill to act. It runs read-only observation commands (the bundled checker, `pnpm outdated`, `gh run list`, `git log`) — observing is not editing. The moment doctor touches a file, the author loses the chance to decide.

## Look here first: what the docs say vs what the code does

This is doctor's main check and the reason it exists. The rest of squire's loop keeps memory current as changes land (docs records each one); nothing checks whether the _accumulated_ memory still describes the code after many changes. Docs' own contract says it "acts on awareness from doctor" — doctor is the source of that awareness: the signal "which doc has drifted from the code".

This check is model judgment — mechanical checks can't tell whether prose still matches behavior. Method, to keep it bounded:

- **squire-format docs** (a `specs/<domain>/spec.md` with `### Requirement:` entries): take each requirement as one discrete claim and check the code still does it. Bounded, claim by claim.
- **prose docs** (README / ARCHITECTURE / design notes): pull out the behavior/architecture claims you _can_ check ("uses Redux", "auth issues a JWT") and verify them against the code. What you can't pin down, don't force a verdict on — say so.

Report a docs-vs-code finding only at confidence ≥ 80, graded Critical / Important / Suggestion, each routed (usually `/docs` to fix the doc, or `/shape fix` if the code is the wrong one).

## Two kinds of target

1. **The project's memory** — docs squire's docs skill maintains (specs/, ARCHITECTURE, README, …) in a known format. Here doctor checks both format conformance and drift-vs-code.
2. **The project itself** — any project, no squire assumption: stale dependencies, red CI, oversized files, references that no longer resolve. This is the **secondary** half.

"Any project" describes the second kind only; the first assumes squire's format. Doctor carries **no per-project-type logic** — it adapts a universal check to the local toolchain (detect the package manager, then run _its_ outdated command), it never grows a branch of checks special to one ecosystem. That branching is the trap that keeps a general auditor from ever being general.

## Running the mechanical checks

Mechanical first (cheap, deterministic), model only for what mechanical can't reach.

1. **The bundled deterministic checker** — pure filesystem checks ship with the skill in `scripts/checker.ts` (zero dependencies, runs on Node 24+ directly). Run it on the project root and read the structured findings:

   ```bash
   node ${CLAUDE_SKILL_DIR}/scripts/checker.ts <project-root> --json
   ```

   It covers: squire-format spec conformance (only when such specs exist), markdown links that don't resolve, dead internal anchors, leftover placeholders (TBD/TODO/FIXME), and oversized source files. If Node 24+ isn't on the machine, the checker won't run — say so in the report and fall back to the model pass plus the Bash probes below; don't error out.

2. **Environment probes (Bash)** — these query the toolchain, so they stay out of the checker (keeping it dependency-free):
   - dependency staleness: detect the manifest, run the ecosystem's outdated command (`pnpm outdated` / `npm outdated` / `cargo outdated` …)
   - CI status: with a GitHub remote, `gh run list` for the latest run; no remote → skip and note it
   - doc staleness: `git log` timestamps — a doc untouched while the code it describes kept changing

A probe whose dependency is absent (no manifest, no GitHub remote, no docs) is skipped and **noted in the report**, never faked or errored.

## Scope filter

No argument → full checkup. A recognized category (`docs` / `deps` / `ci`) or a path prefix narrows it: `docs` runs only the doc-facing checks, `deps` only dependency staleness, and so on. An unrecognized category → report the available ones and let the user re-pick.

## Report format

```
# Doctor Report — <project>
Scope: <full / docs|deps|ci / path>   Ran: docs-vs-code, checker, deps   Skipped: CI (no gh remote)

## Docs vs code (main)
- [Important] README says "uses Redux" but the code uses Context (conf 85) → confirm, then /docs or /shape fix

## Mechanical (deterministic)
- [fact] docs/foo.md:12 link [x](./gone.md) points at a missing file
- [fact] 3 dependencies are ≥1 major behind

## Next
- doc drift → /docs; code bug → /shape fix; nothing here is auto-fixed
```

Mechanical findings are stated as facts; model findings carry a confidence and a grade; skipped checks are listed.

## Boundaries

- **vs check** — check gates one change before merge (a diff); doctor checks the whole project, outside the loop. Different scope.
- **vs docs** — doctor _detects_ drift and reports it; docs _writes_ the correction. Doctor never owns the fix.
- **vs explore** — explore builds a map of an unfamiliar project; doctor audits a (mapped) project for drift. Doctor may reuse explore's reading, but its output is a drift report, not a map.
- **vs shape fix** — doctor reports a suspected code bug; shape fix diagnoses the root cause and plans the fix.

When you find a class of problem, point the author to the matching skill instead of taking over: doc drift → `/docs`; batch catalog format drift → `/converge`; code bug → `/shape fix`; simplification → `/shape refactor`; scope creep → flag it, let the user decide.

## When to stop

Doctor's failure mode is "touching" — fixing, or chaining onward, when it should only report. Stop and report in these cases:

- **The urge to "just fix the doc"** — write the finding and route to `/docs`; the moment doctor edits, it loses its standing.
- **The urge to auto-run the next skill** — give the recommendation; the user owns the chaining.
- **You want a check special to this project type** — don't; adapt a universal probe instead, or skip and note it.
- **A probe's dependency is missing** (no Node 24, no manifest, no remote, no docs) — skip it and say so; don't fake a result or error out.
- **A docs-vs-code claim you can't actually verify against the code** — say it's unverifiable; don't force a verdict.
