---
name: verify
description: 'Determine whether a claimed result has sufficient evidence through tests, real behavior, and relevant review. Use when the user says "run the tests" / "check this works" / "验证", requests a pre-merge gate, or requires formal acceptance. Not for fixing failures, writing implementation/tests, or standalone design/code review (use review).'
---

# Verify

Verify answers whether the requested outcome is supported by evidence actually inspected or produced. Keep the original claim visible: a passing subset does not establish an unobserved result.

## Choose evidence for the claim

Use the request and risk to select the smallest sufficient combination of tests, real user paths, and relevant review. An explicit test request can be answered by those tests; a full or pre-merge gate normally needs relevant review and tests, with a runnable user path when it materially tests the claim. Reading plausible code does not establish runtime behavior. Reuse current facts and valid evidence; investigate only missing context, without a mandatory Explore preflight or separate agent for ordinary verification.

Load [the test method](references/test.md) for automated checks and [the end-to-end method](references/e2e.md) for real behavior. Run required checks, then broaden or repeat only for changed evidence, failures or unresolved concerns. Unit, integration and end-to-end tests are evidence choices within this capability, not separate authority boundaries.

When the claim needs review evidence, compose [Review](../review/SKILL.md) from the same installed collection, then locate it among the host's available Skills if needed. Give it the relevant original claim, artifacts and evidence, and reconcile its findings with observations. Missing required Review support remains an explicit gap; do not install it automatically or invent its result. A review pass does not replace missing behavioral evidence. Review findings that contradict the claim prevent a pass even when tests pass.

Treat compatibility as a constraint only when the original outcome or authoritative contract establishes it. Within the selected scope, masked failures, unauthorized fallback, compatibility layer, migration, dual path or legacy path, and superseded paths retained after an authorized replacement are findings. When the claim depends on this boundary and evidence cannot establish it, return `inconclusive`; do not broaden an ordinary scoped verification to prove its global absence.

Read [independent acceptance](references/acceptance.md) only when the request or an authoritative project contract requires formal independent acceptance, `accepted`, or `done`. Ordinary verification, including a broad gate, needs no complete-candidate identity or attestation form unless the claim requires it.

## Verdict and boundary

Return exactly one verdict for the selected claim:

- `pass` — sufficient evidence supports the claim within the stated scope;
- `findings` — evidence establishes defects or scope/intent conflicts that prevent the claim;
- `inconclusive` — necessary evidence or judgment could not be obtained.

Report scope, actual commands and observations, actionable findings, and material missing evidence. Distinguish a demonstrated failure from an unavailable environment, preserving both when present. Never shrink the user's original claim after evidence fails so that a narrower result can be called a pass. A scoped pass cannot produce `accepted` or `done`; formal acceptance adds only the fields required by its reference.

Verify is read-only: it does not edit source, tests, plans, Issues or docs, stage, commit, push, or fix findings. Tests and user-path observations may run the project; startup failure is evidence, not permission to patch. If guidance prevents requested verification, link and quote the relevant instruction and explain the exact limitation while completing unaffected observations.

End a standalone Verify with its result. Inside an authorized outcome, return that result to the caller; Implement retains any existing authority to diagnose and repair, while Verify grants none.
