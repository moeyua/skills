---
name: debug
description: "Investigate why observed behavior differs from an established expectation using reproducible signals and causal evidence. Use when a bug, failure, regression, or unexplained result needs diagnosis. Not for deciding intended behavior (use shape), owning persistent repairs (use implement), or judging whether a claimed outcome is sufficiently verified (use verify)."
---

# Debug

Debug turns an observed deviation into a supported explanation and a way to distinguish the fault from correct behavior. It is usable for a standalone diagnosis or within an authorized repair. Implement owns completing the repair; using Debug does not transfer that responsibility or require another agent.

## Establish the deviation

Separate the expected behavior, what actually happened, and the conditions under which they differ. Use the user's report, project contracts, relevant source and types, and applicable documentation or change history before editing. A familiar symptom is a hypothesis, not proof that a familiar cause applies here. Obtain missing facts directly; ask the user only for consequential intent or evidence unavailable from the environment.

If the expected behavior itself is undecided, use Shape for that material choice while continuing independent investigation. Do not turn a product decision into an assumed bug. Reuse current Explore facts when useful; diagnosis does not require a fixed project preflight.

Find the smallest useful feedback signal that distinguishes the reported fault from expected behavior: a test, request, command, log observation, or user action. Reproduce the original conditions when available, retaining the relevant input, environment, and observed result. Distinguish a failure of the observation setup from a failure of the target; an unavailable check does not establish a cause.

## Narrow the cause with evidence

Reduce the failing case enough to separate explanations without removing the conditions that matter. Trace where actual behavior first diverges from the expectation. Form plausible, falsifiable hypotheses from that evidence, and choose the next observation or experiment by which explanations it can distinguish. Hypothesis counts and response-time targets are not gates.

Before an experiment, identify the observation that would support or refute the hypothesis. Prefer the smallest probe that changes one relevant factor. Inspect the result before selecting another change; update or discard explanations when evidence contradicts them. Do not stack speculative fixes, confuse correlation with cause, or call a changed symptom a confirmed repair.

When reliable reproduction is unavailable, narrow what can still be established through source, traces, configuration, history, or targeted observations. State what remains unproven and the specific missing evidence. Do not invent a reproduction, declare a root cause from intuition, or stop useful investigation merely because the ideal signal is unavailable.

## Return evidence to the authorized work

Use only the active task's existing permissions for probes and experimental changes. A diagnosis request does not itself authorize persistent source/test fixes, dependency changes, or external mutations. Prefer read-only observations; if a needed experiment requires unavailable authority, explain that exact need and continue unaffected investigation. Track temporary changes and remove only your own probes when their purpose is complete, preserving unrelated work and useful authorized regression coverage.

Give a supported causal explanation when one is established, the observations that distinguish it from rejected explanations, and a regression scenario that would expose the original fault. Otherwise report the strongest supported conclusion, remaining hypotheses, and the next discriminating evidence without presenting them as settled facts.

In a standalone diagnosis, end with that bounded result. Within an authorized repair, return it to Implement and continue the same task: Implement owns the source fix, durable regression test when appropriate, and directly affected docs. Verify the correction against the diagnostic signal and replay the original trigger; a passing reduced case alone cannot prove the reported behavior is fixed. If evidence still contradicts the explanation, resume diagnosis inside the existing repair authority rather than requesting that same authority again.
