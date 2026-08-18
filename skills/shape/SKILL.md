---
name: shape
description: 'Shape an uncertain idea into a grounded, bounded direction through conversation. Use when the user says "think it through" / "how should we do this" / "想想" / "出方案", or when material product or design choices remain unresolved. Not for writing a plan or Issue (use plan), implementing the change, or deciding whether the work is worth doing.'
---

# Shape

Shape turns uncertainty into a direction the user can evaluate. Match investigation and discussion to uncertainty, reversibility, and stakes; do not manufacture stages or questions to make the process look complete.

## Work from the actual decision frontier

Start with the user's active outcome, current horizon, and every decision already settled in the conversation. Do not silently replace the outcome with a named mechanism, local task, artifact, or intermediate result.

Only the user's statements, accepted decisions, and authoritative project intent settle a consequential preference. Keep Agent recommendations and interpretations visibly provisional; a summary, plan, code change, merged artifact, or silence does not make one a user decision. When the user rejects a premise, discard it and revisit the conclusions that actually depended on it before continuing.

- If the direction is already determined, synthesize it directly.
- If a discoverable fact blocks judgment, investigate it; use Explore context when the project is unfamiliar.
- If viable choices would materially change scope, observable behavior, hard-to-reverse architecture, risk, or acceptance, compare them and recommend one.
- If the user delegates a choice, make it and state only consequential assumptions.

Ask the user about genuine intent, preference, and authority—not facts available from the repository or an authoritative source. Compare alternatives only when they expose a real trade-off.

For subjective outcomes, prefer the highest-fidelity practical reference or preview over additional abstract prose. Apply this only when seeing the result can change the decision; it is not a universal review stage.

Read `references/change-types.md` only when classifying a concrete change as `fix`, `feat`, `refactor`, or `perf` sharpens the evidence or boundary. Do not force a type onto open-ended exploration.

## Boundaries and Design Summary

Shape is read-only. It may gather facts, but it does not write plans, Issues, specs, code, or project files and does not advance into implementation or delivery.

Before Shape ends or another public capability begins, present a visible **Design Summary** and stop for the user's review. Include only applicable content: the active outcome and horizon; included and excluded scope; settled consequential decisions; Agent recommendations kept distinct from those decisions; genuinely unresolved material choices; evidence that would demonstrate the outcome; and the currently authorized outcome. Omit empty categories rather than filling a template.

If the user corrects the Summary, invalidate its dependent conclusions and present the revised Summary before finishing. Agreement with a Design Summary settles that direction only; it does not authorize Plan, Implement, or delivery. A later user message may both accept the shown direction and explicitly request another public outcome, in which case that capability has its own authorization. Mention Plan only as an optional way to persist settled work.
