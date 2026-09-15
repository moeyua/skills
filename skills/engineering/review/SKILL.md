---
name: review
description: 'Find evidence-backed problems in a design, planning artifact, or code change. Use when the user says "review" / "审阅" / "把关", asks what needs correction, or Plan requests its independent planning audit. Not for fixing findings, proving a claimed result (use verify), or formal implementation acceptance.'
---

# Review

Review answers what needs correction and why. Judge the actual artifacts against the original outcome and applicable contracts; a plausible proposal or passing test is evidence to examine, not proof that the whole change is sound.

## Inspect the change

Read the relevant project instructions, complete relevant diff or design, and enough surrounding sources to understand consequences. Include relevant untracked files. Reuse valid project facts and investigate gaps directly; Explore is available for unfamiliar structure, not a mandatory preflight. A plan is useful context when present, not an entry gate or a replacement for the user's request and corrections.

Concentrate on the risks the request and change actually introduce: correctness, failure and edge handling, intent and scope fidelity, coverage that distinguishes the behavior, and unnecessary complexity or duplication. These are judgment lenses, not a checklist of report sections. Run relevant tests or observe behavior when that can substantiate a suspected problem; choose the project's actual commands and preserve their results. Do not require a separate agent for ordinary review or run unrelated checks for completeness.

Treat compatibility as a constraint only when the requested outcome or authoritative contract establishes it. Within the inspected scope, report masked failures, unauthorized fallback, compatibility layer, migration, dual path or legacy path, and superseded paths retained after an authorized replacement. If a necessary boundary cannot be established, preserve that gap; do not expand a scoped review to prove a global absence.

## Review planning artifacts

For a local plan, Issue, or paired output, read the actual full artifacts even when untracked or outside a code diff. Compare them with the original request and corrections, settled decisions, relevant project sources, and generation results. Identify the inspected versions and missing or unattempted artifacts; partial generation permits review of the readable scope, not a claim about absent content.

Assess a local plan's factual grounding, decision fidelity, bounded scope, feasible dependencies and ordering, and verification that can distinguish the outcome. An Issue is a bounded problem record: assess its identity, evidence, constraints and observable resolved state when known, without demanding an unknown solution, technical approach or complete acceptance. Paired artifacts must describe the same problem while keeping implementation responsibilities in the plan. Judge whether proposed checks are applicable; do not run future implementation tests merely to produce a test count.

Plan's required audit uses a fresh context independent of authoring, with original evidence and actual artifacts. A full-history fork or the author's summary alone does not establish that independence. If this supporting call lacks independence, required source evidence or artifact access, return `inconclusive` for the affected scope. This requirement belongs to Plan's audit; ordinary Review does not require it. Return the result to Plan for authorized corrections and targeted verification. Those corrections do not extend the original verdict to a new version or create another independent pass.

## Findings and result

Return exactly one verdict for the inspected scope:

- `pass` — no actionable problem was found within the scope actually reviewed;
- `findings` — evidence establishes actionable defects or scope/intent conflicts;
- `inconclusive` — a required judgment could not be established.

Lead with high-confidence findings ordered by impact, or the bounded conclusion when there are none. Each finding identifies the consequence, a tight file/line location or other identifiable object, supporting evidence, and a correction direction without writing a patch. Include material gaps and actual commands or observations when relevant; omit speculative and purely stylistic noise. Preserve evidence-backed findings even when other parts remain uninspected.

Review is read-only: it does not edit source, tests, plans, Issues or docs, stage, commit, push, or repair findings. Running the project to observe it is permitted; startup failure does not authorize a configuration patch. Findings grant no repair authority. If guidance prevents requested work, link and quote the relevant instruction and explain the limitation while completing unaffected review.

A standalone Review ends with its scoped result. Inside Plan or Implement, return evidence to that caller so it can continue its already-authorized work. Review never recursively invokes Plan, upgrades a draft, establishes an implementation candidate, or produces `accepted` / `done`. Formal acceptance belongs to Verify; an ordinary review pass supplies only review evidence.
