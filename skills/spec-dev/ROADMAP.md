---
name: spec-dev-roadmap
description: Long-horizon open problems for spec-dev that neither spec-dev nor OpenSpec currently solves. Recorded for future research, not active work.
---

# spec-dev Roadmap — Open Problems

These are deep problems in keeping specs honest. Recorded so we don't lose track.
None are blocked by tactical work; all need research before implementation. Tactical
work (mechanical audit scripts, git hooks, verify mode, decision ledger, cross-tool
packaging) is tracked separately and is **not** in this file.

---

## 1. Semantic-level drift

**Problem.** Spec says `WHEN empty password THEN 401`, code returns `400`. Text
scanners see no string mismatch and report clean.

**Why neither tool solves it.** OpenSpec's `verify` greps for endpoint existence,
not behavioral equivalence. spec-dev's Audit is a Markdown structure check.

**What it would take.**
- Link each scenario to an executable test case (WHEN/THEN → automated test), let
  CI run them, reverse-mark AC state from results.
- Or LLM semantic comparison of spec scenarios against runtime behavior — slow and
  brittle, but covers cases tests miss.

**Status.** Open. Path 1 is the realistic one but needs a discovery layer
(scenario ↔ test mapping format).

---

## 2. Reverse traceability — spec → code

**Problem.** When a `### Requirement:` is edited, what code, tests, modules need
revisiting? No machinery for this today.

**Why neither tool solves it.** Both flow code → docs. Neither indexes the inverse.

**What it would take.** A bidirectional index: AC ↔ source files ↔ test files.
Either derived (grep `AC-XX` annotations in tests + git blame for code paths) or
declared (spec carries `implemented-in:` / `tested-by:` metadata).

**Status.** Open. Cheap first step: extend the inline TDD pointer block in specs
to include code paths, not just test paths.

---

## 3. Structural rot — module boundaries going stale

**Problem.** Initial split was `users/` `orders/`. Six months later business reality
is `merchants/` `buyers/` `platform/`. Content stays consistent within each module,
but the **organization** is wrong.

**Why neither tool solves it.** Both audit content within a structure; neither
challenges the structure itself.

**What it would take.** Heuristics that watch module-level signals:
- Module size diverging (one swallows the others)
- Cross-module calls dominating intra-module ones
- Frequent renames that hint at conceptual drift

Triggers a "consider restructuring" notice — not a fix. Rewrite Mode is still the
surgery; this is the trigger that decides when to call for surgery.

**Status.** Open.

---

## 4. Cross-spec contradictions

**Problem.** Spec A says "user must log in"; Spec B says "anonymous users can
checkout". Both pass single-spec audit; together they contradict.

**Why neither tool solves it.** OpenSpec validates per-change; spec-dev audits
per-doc. Neither extracts SHALLs into a global table.

**What it would take.** Extract every SHALL/MUST clause from every spec, group by
subject (user, order, etc.), surface candidate conflicts (rule-based or LLM-judged).

**Status.** Open. Tractable as a periodic batch job, less so as inline lint.

---

## 5. Decision staleness — ADR liveness probes

**Problem.** ADR-003 says "we use React 16". Project is on React 19. ADR is correct
as historical record, misleading as guidance. No one supersedes it.

**Why neither tool solves it.** ADRs are append-only by convention; neither tool
checks whether the ADR's premise still holds.

**What it would take.** Each ADR carries a probe — a one-line check the system can
run periodically (`grep "react" package.json`, file existence, version range).
Probe fails → flag ADR for review.

**Status.** Open. Schema design needed (probe DSL? plain shell? regex over fixed
files?). Probably the smallest of the five to prototype.
