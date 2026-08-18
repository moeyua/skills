---
name: handoff
description: "Generate a self-contained handoff summary so work can continue in a fresh session or with another agent. Use when the current session is ending, context is getting long, or the user asks to preserve what matters for continuation. Not for project documentation (use docs), whole-project exploration (use explore), or automatically creating new sessions."
---

# Handoff

Handoff packages what a fresh session needs to continue without rereading the whole conversation. The output stays in the conversation and must remain trustworthy, portable, and compact.

## Select continuation-critical context

Start with current git/task state when relevant. Include only information that changes what the next session should understand or do:

- the user's active request and final goal;
- the current horizon and the authority attached to any pending next outcome;
- work completed or at candidate state, with evidence, its producer, and known limitations;
- current branch, working-tree state, and active artifact status;
- pending work in useful order;
- important decisions, explicit constraints, superseded premises whose removal affects continuation, and exact blockers;
- up to ten key workspace-relative files whose roles matter.

Keep settled decisions, Agent inferences, actual evidence, and unresolved authority distinguishable when collapsing them would change the next session's behavior. When acceptance remains relevant, preserve the current candidate's stable basis, its evidence and producer, the latest Check producer/reference and verdict + acceptance-field pair, whether the Check basis still matches the current candidate, findings or missing evidence, and pending acceptance; Implement self-report, artifact existence, or a legacy `done` plan without complete Assurance is not an independent attestation. Preserve the user's wording where nuance is consequential. A handoff is a continuation cache: its summary or an artifact it mentions does not create authority for an undisclosed preference, and a superseded premise does not become active again merely because it appears in history. Mark genuinely unavailable facts as unavailable and empty facts as none; do not reconstruct hidden turns, raw transcripts, host memory, or task state that cannot be observed.

Omit credential values and private configuration. Keep the non-sensitive fact that a secret is required or was intentionally omitted when continuation depends on it.

## Boundary and output

Handoff is read-only. It does not write a file, create a session, edit project memory, commit, push, or launch another capability. If there is no substantive work to transfer, say so instead of filling a template.

Use clear plain-text sections suited to the actual task rather than forcing a large fixed form. End with one host-neutral instruction: paste the summary into a fresh session and continue from the pending work.
