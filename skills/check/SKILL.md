---
name: check
description: 'Check a change by review, tests, or end-to-end observation with depth matched to the question and risk. Use when the user says "review" / "run the tests" / "check this works" / "把关" / "验证", or asks for a pre-merge gate. Not for fixing findings, writing implementation/tests, or recording what landed.'
---

# Check

Check answers whether the requested claim holds up using evidence it actually inspects or runs. Its result covers that scope, not an implied larger outcome.

## Select the evidence

An explicit request selects review, test, e2e, or their combination. A full or pre-merge gate normally combines relevant review and tests, adding e2e when a runnable user path materially tests the claim. For a bare request, inspect the change and choose the smallest combination supporting a trustworthy verdict.

Reuse current project facts and gather missing evidence directly; Explore context is available for unfamiliar structure, not a mandatory preflight. When permitted and useful, delegate independent review areas with bounded context and deliverables. Ordinary scoped checks do not require separate agents. Keep related evidence together and reconcile disagreements against the artifacts.

Treat compatibility as a constraint only when it belongs to the selected claim or the authoritative outcome. Within that scope, a masked failure, any unauthorized fallback, compatibility layer, migration, dual path, or legacy path, and a superseded path retained after an authorized replacement are findings. When the selected claim depends on this boundary and evidence cannot establish it, return `inconclusive`; do not broaden an ordinary scoped check to prove its global absence.

Load only the methods needed: `references/review.md` for diff review, `references/test.md` for automated verification, and `references/e2e.md` for real behavior. Run the required checks; once they pass, broaden or repeat only for changed evidence, failures, or unresolved concerns.

Read `references/acceptance.md` when the request or authoritative project contract requires formal independent acceptance, `accepted`, or `done`. An ordinary test/review or broad check needs no complete-diff identity, producer form, or acceptance field. A pre-merge request determines the proof scope; formal attestation depends on the claim it asks to establish.

## Verdict and boundary

Return exactly one verdict for the inspected scope:

- `pass` — the evidence supports the selected claim;
- `findings` — actionable defects or scope/intent conflicts prevent that claim;
- `inconclusive` — the required judgment could not be established.

Lead with actionable findings, or the bounded conclusion when there are none. Include scope, concrete paths/lines when useful, actual commands or observations, and material missing evidence. Use concise prose; omit speculative or purely stylistic noise and unrelated report fields. Formal acceptance additionally reports the fields in `references/acceptance.md`. Ordinary pass cannot produce `accepted` or `done`.

Check is read-only: it does not edit source, tests, plans, or docs, stage, commit, push, or fix findings. Test and e2e may run the project to observe it; startup failure is evidence, not permission to patch. Check findings deny acceptance but do not authorize repair. If skill guidance prevents a requested check, link the source, quote the relevant instruction, and explain the exact limitation while completing unaffected checks.

End a standalone Check with its verdict. When composed inside an authorized implementation, return the result to that caller; the caller may continue already-authorized repair, while Check itself remains read-only.
