---
name: shape
description: 'Clarify intent and key design through questions that help the user form a judgment. Use when an idea is uncertain, the user says "想想" / "我也不知道" / "怎么设计", or consequential choices remain unresolved. Not for investigating a known malfunction (use debug), writing a plan or Issue (use plan), or implementing changes.'
---

# Shape

Shape helps the user work out what they want and why a design serves it. Success is a shared judgment the user can explain and evaluate, not merely a plausible proposal. Match the conversation to what is still uncertain; clear intent needs no forced interview.

## Explore the target project first

Every Shape entry must use [Explore](../explore/SKILL.md) in context mode before proposing project-specific directions, alternatives, or a Design Summary. Resolve the target project from the user's request and context; the Skill installation directory is not the target by default. Load the co-installed Explore first, or locate it among the host's available Skills if that path is missing.

Complete Explore's fixed Overview, then deepen for the current question. Familiarity, a small request, or an already-settled direction never waives this prerequisite. Reuse already-read facts that remain current and fill gaps rather than mechanically rereading them; refresh affected context when the project, scope, or evidence changes during the discussion. Explore owns the investigation method—do not duplicate it here.

If Explore cannot be found or the target project cannot be identified or accessed, expose that specific gap. Do not reconstruct the missing Skill from memory, install it automatically, claim exploration is complete, or settle directions that depend on missing facts. Continue independent intent clarification and ask only for information unavailable from the environment.

Explore returns facts, source paths, and missing evidence to Shape. Continue shaping without a separate Explore report or an exploration approval turn; this supporting call is not a handoff to another public outcome.

## Understand the difficulty before choosing the mechanism

Start from the concrete difficulty, desired experience, and constraints already present in the conversation. A proposed split, rewrite, feature, or tool may be the user's tentative explanation of the problem. Distinguish that suggestion from the result they want without discarding choices they have actually settled. When the difficulty is still vague, a specific recent situation and what should have been different are often more useful than asking the user to define an architecture.

Only the user's statements, accepted decisions, and authoritative project intent settle a consequential preference. Keep Agent recommendations and interpretations visibly provisional; a summary, plan, code change, merged artifact, or silence does not make one a user decision. When the user rejects a premise, discard it and revisit the conclusions that actually depended on it before continuing.

Investigate discoverable facts left open by Explore yourself. Ask about intent, experience, preference, or authority that the available evidence cannot establish. Continue useful investigation that does not depend on a pending answer.

## Ask in rounds that advance the judgment

Find the unresolved choices that could change the outcome, scope, observable behavior, hard-to-reverse architecture, risk, or acceptance. Separate questions answerable now from those that depend on an earlier answer. Routine implementation details do not belong in this discussion.

Each round asks all mutually independent, currently answerable material questions together. Do not drip-feed independent questions one at a time or include dependent questions the user cannot yet answer. There is no fixed question count or required number of rounds.

Make each question easy to respond to: connect it to the user's situation, explain what the answer changes, and show concrete consequences when options differ. When viable choices exist, recommend one with a reason while leaving room for correction. Do not ask the user to invent the options, understand your taxonomy, or design the solution before they can answer.

Treat “I don't know,” hesitation, or “I can't respond to this” as evidence that more help forming the judgment is needed. Use a concrete scenario, counterexample, consequence comparison, or a practical reference/preview if seeing it would change the decision. Explain your current recommendation and ask for a reaction to that concrete consequence. Do not relabel the same abstract question or treat uncertainty as consent. If the user delegates the choice, make it and state consequential assumptions.

After each answer, say what it establishes or changes, update the provisional direction, and revisit only affected dependencies. Challenge a contradiction with a concrete example instead of silently choosing which statement to ignore. Once goals and constraints support a direction, propose it provisionally and examine the key design through relevant usage and failure cases. This is progressive design, not a complete solution before intent is understood or an obligation to exhaust every imaginable edge case.

Stop asking when the goal and consequential design choices are clear enough to judge the direction and its evidence. If they were already clear, synthesize them directly.

A failed, ambiguous, or missing required condition stays visible rather than becoming a resolved direction or an unrequested alternate path. Fallbacks, compatibility layers, migrations, dual paths, and legacy paths are consequential continuity choices, not mechanical safety; an authorized replacement is a clean break unless explicit user authority or authoritative project intent requires continuity.

Explicit user instructions take precedence over skill guidance within host constraints. Do not turn an interpreted guideline into an extra approval gate. When a skill rule causes a pause, link its source, quote the relevant instruction, and explain its actual effect.

Read `references/change-types.md` only when classifying a concrete change as `fix`, `feat`, `refactor`, or `perf` sharpens the evidence or boundary. Do not force a type onto open-ended exploration.

## Boundaries and Design Summary

Shape is read-only. It may gather facts, but it does not write plans, Issues, specs, code, or project files and does not advance into implementation or delivery.

Before Shape ends or hands off to another public outcome, present a visible **Design Summary** and stop for the user's review. Connect the concrete goal, reasons for the choices, and the key design that serves that goal. Include the applicable horizon, included/excluded scope, genuinely unresolved material choices, evidence that would demonstrate success, and current authorization. Distinguish settled decisions from Agent recommendations. Lead with the direction in concise prose; omit empty categories rather than filling a template.

If the user corrects the Summary, invalidate its dependent conclusions and present the revised Summary before finishing. Agreement with a Design Summary settles that direction only; it does not authorize Plan, Implement, or delivery. A later user message may both accept the shown direction and explicitly request another public outcome, in which case that capability has its own authorization. Mention Plan only as an optional way to persist settled work.
