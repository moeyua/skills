---
name: verify
description: 'Verify a feature by actually using it and comparing observed behavior with the requested outcome, supported by tests and review. Use when the user says "run the tests" / "check this works" / "验证", requests a pre-merge gate, or asks for independent verification. Not for fixing failures, writing implementation/tests, or standalone design/code review (use review).'
---

# Verify

Verify establishes whether a feature works by actually using it and comparing what happens with the requested outcome. Tests and review support that judgment. Keep the original claim visible: passing checks do not establish an unused feature's behavior.

## Use the feature

Start from the original expectation and affected behavior. Unless the user explicitly limits the request to running tests, load [the end-to-end method](references/e2e.md), run the feature through its real entry point, and observe the key normal path and relevant failure paths. Choose the smallest set of scenarios that covers the claim; that choice controls the extent of actual use, not whether it happens. Reuse current project facts and investigate missing context without a mandatory Explore preflight or separate agent for ordinary verification.

Load [the test method](references/test.md) for required checks and coverage of relevant risks. A full or pre-merge gate covers the requested breadth, normally with relevant review and tests as well as actual use. Existing end-to-end automation can provide actual use when it drives the same real entry point and observes the claimed result. Internal tests, mocks, plausible code, and earlier test reports do not substitute for that observation. When the user explicitly asks only to run tests, report those results without claiming the feature was used. Once the required observations and checks are complete, broaden or repeat only for changed evidence, failures, or unresolved concerns.

When the claim needs review evidence, compose [Review](../review/SKILL.md) from the same installed collection, then locate it among the host's available Skills if needed. Give it the relevant original claim, artifacts and evidence, and reconcile its findings with observations. Missing required Review support remains an explicit gap; do not install it automatically or invent its result. A review pass does not replace missing behavioral evidence. Review findings that contradict the claim prevent a pass even when tests pass.

Treat compatibility as a constraint only when the original outcome or authoritative contract establishes it. Within the selected scope, masked failures, unauthorized fallback, compatibility layer, migration, dual path or legacy path, and superseded paths retained after an authorized replacement are findings. When the claim depends on this boundary and evidence cannot establish it, return `inconclusive`; do not broaden an ordinary scoped verification to prove its global absence.

Read [independent verification](references/acceptance.md) only when the user requests independent verification. Ordinary verification, including a broad gate, needs no independent context or extra record form.

## Verdict and boundary

Return exactly one verdict for the selected claim:

- `pass` — actual use and comparison with expectations support the feature claim, with required supporting checks complete; when the request is limited to tests, those tests pass;
- `findings` — evidence establishes defects or scope/intent conflicts that prevent the claim;
- `inconclusive` — necessary evidence or judgment could not be obtained.

Report what was actually done, the expected and observed results, supporting checks, actionable findings, and material missing evidence. A demonstrated functional defect yields `findings` even when tests pass; if necessary use cannot be completed and no defect has been established, return `inconclusive`. Preserve both demonstrated failures and unavailable observations when present. Never shrink the user's original claim after evidence fails so that a narrower result can be called a pass. No verdict changes a plan's status; Implement records a requested independent result in the plan's Assurance.

Verify is read-only: it does not edit source, tests, plans, Issues or docs, stage, commit, push, or fix findings. Tests and user-path observations may run the project; startup failure is evidence, not permission to patch. If guidance prevents requested verification, link and quote the relevant instruction and explain the exact limitation while completing unaffected observations.

End a standalone Verify with its result. Inside an authorized outcome, return that result to the caller; Implement retains any existing authority to diagnose and repair, while Verify grants none.
