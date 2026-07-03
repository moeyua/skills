---
name: shape
description: 'Shape a fuzzy idea into a grounded design and executable plan. Modes: brainstorm / fix / feat / refactor / perf; brainstorm stays conversational, named modes write to plans/. Use when the user says "think it through" / "how should we do this" / "出方案" / "想想", or anything that needs design before coding. Not for executing an approved plan (use implement), deciding whether something is worth doing, or plain API-usage questions.'
when_to_use: "think, shape, plan, design, brainstorm, approach, 想想, 出方案, 设计, 怎么做, 头脑风暴"
dispatch_intent: "Clarify intent, shape a design, and produce a plan when a named mode is approved"
---

# Shape

Shape turns ideas into designs and, when the intent has converged, executable plans. Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what is being built or changed, propose approaches, pressure-test the recommended one, present the design, and get user approval before writing a plan.

<HARD-GATE>
Do NOT write code, scaffold projects, change implementation files, or invoke implementation work until the design has been presented and the user has approved the plan. This applies even when the change looks simple. Writing a `plans/` file has its own precondition: a standalone `Design Summary` message was presented and the user confirmed that message.
</HARD-GATE>

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

Read `references/shaping-protocol.md` before the first clarifying question. Load `references/plan-template.md` and the matching mode reference only when the work enters a named mode.

## Outcome Contract

- Outcome: a brainstorm conclusion, or an approved named-mode plan
- Done when: brainstorm → the direction, constraints, and next decision are clear; named mode → a plan file is written to `plans/` after design approval, with every step executable without further intent decisions
- Evidence: project files read, context preflight evidence when used, external docs checked when needed, and the user's answers
- Output: brainstorm → conversation summary; named mode → plan file path + summary + after-approval prompt

## Checklist

Work through these items in order:

1. **Explore project context** — if current facts are missing, stale, or too shallow, use `explore` in context mode. Do not rewrite explore's Overview or Scoped Deep-dive rules here; follow that skill and emit no Explore Report.
2. **Ask clarifying questions** — one at a time, focused on purpose, constraints, success criteria, and blocking ambiguity.
3. **Propose 2-3 approaches** — with trade-offs and your recommendation. Lead with your recommendation and explain why.
4. **Grill the recommended approach** — first enumerate the load-bearing decision list and show it; ≤3 items resolve as one combined round with recommendations, ≥4 stop at the list then one question at a time. If a question can be answered by exploring the codebase, explore the codebase instead.
5. **Present design** — one standalone `Design Summary` message ending with a single confirmation question; only the user's confirmation of that message unlocks the plan.
6. **Write the plan** — only for `fix` / `feat` / `refactor` / `perf`, after approval. `brainstorm` writes no file.

## Mode Picker

| user's cue                                                | mode         | plan file |
| --------------------------------------------------------- | ------------ | --------- |
| fuzzy idea / exploratory / "I want to..." / "should I..." | `brainstorm` | none      |
| error / exception / regression / "why doesn't it work"    | `fix`        | yes       |
| new feature / new capability                              | `feat`       | yes       |
| restructure / no external behavior change                 | `refactor`   | yes       |
| performance / slow / laggy                                | `perf`       | yes       |

When the mode is ambiguous, ask the next dependency-resolving question. Example: "optimize this code" can mean readable structure (`refactor`) or better numbers (`perf`).

On entering a named mode, load:

- [references/plan-template.md](references/plan-template.md)
- [references/mode-fix.md](references/mode-fix.md)
- [references/mode-feat.md](references/mode-feat.md)
- [references/mode-refactor.md](references/mode-refactor.md)
- [references/mode-perf.md](references/mode-perf.md)

Only load the mode reference that matches the selected mode.

## Brainstorm Mode

`brainstorm` is exploratory conversation. It does not write plan, design, or spec files. It ends with the direction, constraints, recommended approach, unresolved questions, and whether the next decision is to enter a named mode.

If the idea converges during brainstorm, hand the wheel back: "I think this is now `<mode>` and can become a plan. Continue?" Only write `plans/` after the user confirms.

Value judgments are out of scope. If the user asks whether something is worth doing, say that squire shapes how to do it, not whether to do it; give at most one observation about the trade-off.

## Named Modes

Named modes still follow the full shaping protocol: context, clarifying questions, 2-3 approaches, grilling the recommended approach, design approval, and then a plan file.

The mode reference adds the mode-specific bar:

- `fix`: root cause + regression tests
- `feat`: interface boundary + acceptance scenarios
- `refactor`: behavior invariants + regression coverage
- `perf`: baseline + target + measurement

Once the design is approved, write `plans/YYYY-MM-DD-<slug>.md` from `references/plan-template.md`. The plan settles intent decisions: what to build, what not to build, the interface boundary, acceptance, key trade-offs, and verification. Line-level locating, final phrasing, and edit order belong to implement.

After writing the plan, output:

```text
Plan written to plans/YYYY-MM-DD-<slug>.md

[2-3 line summary]

To implement it: say "implement this plan".
```

## When to Stop

Stop and surface the issue when:

- context is too thin and you have not run explore context preflight
- a blocking ambiguity remains but you want to propose or write a plan
- the user has not approved the design summary
- you want to write a plan during `brainstorm`
- the plan would contain an intent-level placeholder (`TBD` / `TODO` / `build later` / `similar to step N`)
- a dependency, API, library, or CLI fact is coming from memory instead of code or authoritative docs
- the user is asking for a value judgment rather than design work
