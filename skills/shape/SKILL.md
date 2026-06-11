---
name: shape
description: 'Shape a fuzzy idea into an executable plan. Modes: default (explore / brainstorm) / fix / feat / refactor / perf; named modes write a plan file to plans/. Use when the user says "think it through" / "how should we do this" / "出方案" / "想想", or anything that needs thinking through before coding. Not for executing an existing plan (use implement), value judgments ("is this worth doing"), or a plain API-usage question.'
when_to_use: "think, shape, plan, design, brainstorm, approach, 想想, 出方案, 设计, 怎么做, 头脑风暴"
dispatch_intent: "Clarify intent and produce a plan; named modes write a plan file"
---

# Shape

Shape is the stage for judging intent — clarify a fuzzy idea into clear intent, then translate that into an executable plan. It writes no code, touches no scaffolding, leaves no placeholders. Every rule here exists so that by the time a plan is approved, it already holds up to strict execution in implement — no discovering mid-implementation that "this part was never actually thought through".

Unfamiliar project or module? Run `/explore` first — shape assumes you already understand the project; forcing it without that base invites hallucination.

Give your opinion directly; take a position. Avoid "that's a great question" / "there are many ways" / "you could consider" — hedging dodges the judgment, and the other person, handed a vague answer, just has to ask again; you both lose time. If you're unsure, say what evidence would change your judgment, so they know it's a position, not stubbornness.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: an approved plan (named mode) or an exploration conclusion (default mode)
- Done when: named mode → a plan file written to `plans/`, every step executable without further decisions; default mode → the direction and next step are clear
- Evidence: `git status` / project files read / the user's answers to clarify questions
- Output: named mode → plan file path + summary + after-approval prompt; default → a conclusion summary in the conversation

## Two altitudes

Shape runs at two altitudes: the **whole** (what problem are we really solving, what's the overall shape of the answer) and the **detail** (this one decision). The failure mode isn't being shallow everywhere — it's dropping to detail altitude and never climbing back: you get snagged on one concrete question, settle it, start pushing toward the plan, and the overall intent has quietly drifted out of view.

So the rhythm is **whole → detail → whole**, on repeat. Before drilling a detail, say which whole it serves. After resolving it, climb back and say what it changed about the whole — does the overall shape still hold? — then drop into the next detail. A detail settled in isolation is a guess about the whole wearing the costume of progress.

That pull into detail often comes from the user — they pick a few specific points out of a larger idea and drill. Go down and answer, but you, not they, own knowing whether the overall direction is settled. So after answering the detail, resurface the whole-level questions still open ("settled — but we still haven't pinned down X about the direction"). Don't read the user's drilling as a signal that the whole is clear; treat it as clear only when they say so.

## Hand the wheel back at each decision

squire's #3 — the user owns the chaining, skills don't auto-run — applies _inside_ shape too, not just between skills. Within one session it's easy to auto-chain clarify → detail → plan in one breath, silently absorbing every judgment on the way. Don't. Each real decision — the mode, the approach, a fragile assumption you had to resolve, a scope line you drew — is a fork that belongs to the user. Name it as a decision, say how it moves the whole, and pause.

This is not "ask permission for every keystroke" — that's a floor, not a ceiling, and it's exhausting. The line is: never fold a judgment into the plan silently. A decision the user can't see is one they can't redirect. Surface it; if they don't object, that's assent, and you move on.

## Phase 1: Clarify

The first move on entering the skill is always Clarify. **Ask one question at a time** — multiple-choice first ("A or B?"), open-ended as backup. Firing 3-5 questions at once overloads the other person and gets you vaguer answers, not clearer ones.

The bar for "clarified enough" (meet it before Phase 2):

- the user's goal fits in one sentence
- you know whether it's fix / feat / refactor / perf / or default exploration
- the key constraints are known (interface boundary / behavior to preserve / baseline numbers / what can't be touched)
- no blocking ambiguity (two reasonable readings with a big cost difference must be resolved first)

**Knowing the intent ≠ not needing to clarify.** Even when the user says `/shape refactor this`, you may still need to ask "which API behavior stays? how much risk is acceptable? which regression tests run?" — a clear mode doesn't mean clear constraints.

If the user says "you decide" or "whatever you think is best", give a recommendation + a one-line reason and let them confirm or object, rather than silently deciding for them — silently deciding robs them of the chance to push back.

Clarify isn't only interviewing the user — it's grounding yourself. Read the code, docs, and history the idea touches, before and between questions, so the questions are sharp and the depth is real rather than performed. Asking what the repo already answers wastes the user's turn; accepting their first framing without probing the problem behind it is how shape stays shallow. Depth comes from pressure-testing the premise ("is the stated problem the real one?"), not from more rounds of surface questions.

Grounding extends past this repo. Any external definition, tool, library, or API the plan leans on gets verified against authoritative docs — not recalled from training memory, which is how plausible-but-wrong facts slip into a plan (see `references/anti-patterns.md`). "I need to check the docs" beats a confident guess that build later discovers was never true.

## Phase 2: Mode Picker

Set the mode from the Clarify result:

| user's cue                                                | mode       | plan file |
| --------------------------------------------------------- | ---------- | --------- |
| fuzzy idea / exploratory / "I want to..." / "should I..." | (default)  | none      |
| error / exception / regression / "why doesn't it work"    | `fix`      | yes       |
| new feature / new capability                              | `feat`     | yes       |
| restructure / no external behavior change                 | `refactor` | yes       |
| performance / slow / laggy                                | `perf`     | yes       |

When it's ambiguous ("I want to optimize this code" — refactor or perf?), ask one more: is it for **readable structure** (refactor) or **better numbers** (perf)?

On entering a named mode, load the matching reference:

- [references/mode-fix.md](references/mode-fix.md)
- [references/mode-feat.md](references/mode-feat.md)
- [references/mode-refactor.md](references/mode-refactor.md)
- [references/mode-perf.md](references/mode-perf.md)

Plan file structure: see [references/plan-template.md](references/plan-template.md).

## Default Mode (brainstorm)

Intent hasn't converged — pure exploratory conversation. Multiple rounds are fine, and you **write no plan file** — writing a plan pretends convergence happened; a plan landed before the intent sets will churn.

Output shapes: draft directions / option comparisons / a list of open questions.

When to converge into a named mode: the user's goal sharpens ("OK, I'll do X") → switch to the matching mode → Phase 3. When stuck in brainstorm with no exit, propose converging yourself: "Based on this I lean toward X mode — want to go that way?" — exploring forever without converging is also a form of dodging.

**Value judgments are out of shape's scope.** If the user asks "is this worth doing" / "should we do this", say plainly that squire doesn't handle that — squire decides how, not whether. You can offer a one-line observation ("this looks like a tradeoff between X and Y"), but don't reach a "should / shouldn't do it" verdict for them.

## Phase 3: Propose Approach (named mode)

Give one recommended approach. **Offer a second only when the tradeoff is genuinely close (>40% chance the user prefers the other)** — multiple options are a useful scarce signal; a three-way comparison every time becomes noise. Always include a minimal option (the smallest viable version), so they can weigh the recommendation against "do nothing".

Name the **most fragile assumption** (premise collapse) explicitly:

> "This plan assumes X. If X doesn't hold, Y happens."

This step forces you to see the plan's weak point. If the fragile assumption is load-bearing (one fall and the whole plan collapses), **reshape the design so it survives even if the assumption fails** — don't bet on the assumption.

A blocking ambiguity can't be chosen silently — say "the two readings conflict at X; A or B?". Choosing silently pushes the judgment down onto the implement stage.

## Phase 4: Validate Before Handing Off

Self-check before the plan is done — this prevents "looks complete but build hits a wall when a key thing was never stated".

- [ ] more than 8 files / introduces 1 new service → acknowledge it explicitly (large scope trips up build)
- [ ] more than 3 components exchange data → draw an ASCII diagram, look for cycles (fewer than 3 needs no diagram; drawing one is noise)
- [ ] listed every meaningful test path (happy / errors / edges)
- [ ] every step that changes external state has a rollback path
- [ ] every external API key / token / third-party account is listed (don't leave it to be sorted out mid-build)
- [ ] every dependency — MCP / external API / CLI — is verified reachable before it goes in the plan; check the docs or read existing code rather than writing it from memory (see `references/anti-patterns.md`)

**Plan red flags** (any one means the plan isn't done — go back and fix it):

- a placeholder (`TBD` / `TODO` / `build later` / `similar to step N`) — a sign of "thought through but not written down", which is equivalent to improvising at build time.
- any phase can't ship on its own (only useful once the next phase lands) — phases chained into one rope means a mid-chain problem forces a full rollback.
- a "Phase 0: investigate / spike" exists — investigation belongs before the plan, not inside it as a step.

## Phase 5: Write the plan file + After Approval

Once a named mode finishes the plan, write the file to `plans/YYYY-MM-DD-<slug>.md`:

- `<slug>` derived from the plan topic (`fix-login-loop` / `feat-rbac` / `refactor-storage-layer`)
- file structure follows `references/plan-template.md`
- mode-specific fields per the matching mode reference

Then output:

```
Plan written to plans/YYYY-MM-DD-<slug>.md

[2-3 line summary]

To implement it: say "implement this plan". After implementing, run check to gate it.
```

**The user saying "implement this plan" / "go ahead" / "按计划做" → treat it as approval and hand straight to implement.** Don't re-litigate — asking "are you sure?" about a plan they just approved pushes the judgment back onto them, and being bounced right after deciding is annoying.

If the user approves and then says "actually, let me reconsider...", don't redo it; ask "you just approved the plan — which one point do you want to change?" — lock down the smallest edit surface and avoid restarting the whole plan.

## When to stop

Shape's failure mode is always "should have paused, but pushed ahead". Stop and handle these, don't force through:

- **Clarify hasn't met the checklist but you want to jump to propose** — Phase 1 is the convergence gate; jumping early means guessing the intent.
- **You want to write a plan file during brainstorm** — default mode writes no plan; forcing one out pretends the intent converged.
- **Citing an external API / library / CLI from memory** — check the docs or read existing code before it goes in the plan; see `references/anti-patterns.md`.
- **The user asks whether it's worth doing** — squire doesn't answer at that level; say it's out of scope and give a one-line observation, no more.
- **Stuck in brainstorm with no exit** — propose converging instead of exploring further; exploring past a certain depth without converging is itself a stop signal.
