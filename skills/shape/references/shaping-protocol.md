# Shared Shaping Protocol

Use this protocol for `brainstorm` and for every named mode. Mode references add extra requirements; they do not replace this flow.

## Explore project context

Check the current project state first. If the facts are missing, stale, or too shallow, use `explore` in context mode: Overview before deep-dive, depth matched to risk, no Explore Report. Carry the files and commands read into shape's evidence.

Do not duplicate explore's reading checklist here. `shape` decides when grounding is needed; `explore` defines how it is done.

Before asking detailed questions, assess scope. If the request describes multiple independent subsystems, flag that immediately and help the user decompose it before refining details. Shape the first coherent sub-project through the normal flow.

In existing codebases, follow existing patterns. Where existing code has problems that affect the work, include targeted improvements as part of the design. Do not propose unrelated refactoring.

## Ask clarifying questions

Ask one question at a time. Prefer multiple choice questions when possible, but use open-ended questions when the answer space is genuinely open. If a topic needs more exploration, break it into multiple questions.

Focus on understanding purpose, constraints, success criteria, and blocking ambiguity. Knowing the apparent mode is not enough; still clarify what must be preserved, how much risk is acceptable, what cannot be touched, and how success will be verified.

If the user says "you decide", give your recommended answer and one-line reasoning, then let them confirm or object. Do not silently fold a judgment into the plan.

If a question can be answered by reading code, docs, tests, history, or authoritative external docs, read those first. Asking what the repo already answers wastes the user's turn and weakens the design.

## Propose 2-3 approaches

Propose 2-3 different approaches with trade-offs. Lead with your recommended option and explain why. The approaches can be short for small changes, but they must still expose the meaningful design choice.

For each approach, cover:

- what it builds or changes
- what it does not build or change
- the main trade-off
- why it is or is not recommended

Do not treat this as a vote. The approaches create the design space; the next step is to pressure-test the recommended approach.

## Grill the recommended approach

Once the recommended approach is picked, the first action is mechanical: enumerate this design's load-bearing decisions — scope boundaries, public interface, data flow, error handling, rollback, tests, migration order, architecture triggers, fragile assumptions (only the ones actually present) — and show the list to the user. Every decision must pass through the list and the user's response to it before it may appear in the plan's Key decisions.

The list's length picks the mode, not your judgment:

- **≤3 items** — the list itself is the combined round: state each decision with your recommended answer and the reason, and let the user confirm or override per item.
- **≥4 items** — stop at the list: let the user react to its scope first, then walk the items one at a time — one question per turn, each with your recommended answer and the reason, waiting for feedback before the next.

If the user drills into a detail, answer it, then climb back to the whole and name what remains unsettled. If a question can be answered by exploring the codebase, explore the codebase instead. If answering it requires external API, library, or tool behavior, verify against authoritative docs before it enters the design.

## Present design

Once the decision list is settled, present the design as one standalone message that begins with the fixed heading `Design Summary`. Scale each section to its complexity: a few sentences if straightforward, more detail when nuanced.

Cover the sections that apply:

- goal and non-goals
- selected approach and why
- interface or behavior boundary
- architecture, components, and data flow when the change crosses structure
- error handling and edge cases
- tests, acceptance, or measurement
- risks and premise collapse

End that message with exactly one question: is this design confirmed? Only the user's answer to the `Design Summary` message unlocks writing a plan — an affirmative given to any other question is not design approval. If the user requests changes, go back to the relevant clarifying question or design branch; do not write the disputed judgment into the plan.

## Self-review before writing

Look at the design with fresh eyes:

1. Placeholder scan: any `TBD`, `TODO`, incomplete section, or vague requirement?
2. Internal consistency: do sections contradict each other?
3. Scope check: is this focused enough for one plan?
4. Ambiguity check: could a requirement be read two ways?
5. Evidence check: did repo-answerable questions get answered from the repo?

Fix issues in the design before writing the plan. A plan is only ready when the user-approved design is clear enough for implement without further intent decisions.
