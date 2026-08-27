---
name: check
description: 'Check a change by review, tests, or end-to-end observation with depth matched to the question and risk. Use when the user says "review" / "run the tests" / "check this works" / "把关" / "验证", or asks for a pre-merge gate. Not for fixing findings, writing implementation/tests, or recording what landed.'
---

# Check

Check answers whether a change holds up. Its credibility comes from reporting only evidence it actually inspected or ran.

## Select the evidence

An explicit request selects review, test, e2e, or a combination. A full or pre-merge gate normally combines relevant review and tests, adding e2e when user-visible behavior and a runnable path make it valuable.

For a bare or ambiguous request, inspect the scope and choose the smallest combination that can support a trustworthy verdict. Do not automatically expand to every mode or force separate agents for an ordinary scoped check. A clean-context or independent review is useful when change size, risk, or prior authorship makes confirmation bias material.

Treat compatibility as a constraint only when it belongs to the selected claim or, for acceptance, the original outcome or an authoritative project contract. Within that selected scope, a masked failure, any unauthorized fallback, compatibility layer, migration, dual path, or legacy path, and any superseded path retained after an authorized replacement are findings. When the selected claim depends on this boundary and the evidence cannot establish whether it holds, return `inconclusive`; do not broaden an ordinary scoped check merely to prove its absence.

## Attest acceptance independently

When the requested claim is `accepted` or `done`, Check is the attestation boundary rather than another Implement self-check. Use a fresh context independent of the implementation trajectory. Independently establish the stable, recomputable basis for the complete claimed change; read the original outcome and authorization boundary, the candidate's evidence and producer, and known limitations; then choose review, test, and e2e depth independently. A legacy `done` status without complete Assurance is not prior acceptance and supplies no missing evidence. If the basis cannot be kept stable after the conversation moves, or fresh independent judgment or evidence sufficient for the claim is unavailable, return `inconclusive` instead of a pass.

Return exactly one verdict for the checked candidate:

- `pass` — the inspected scope and evidence support the claimed outcome;
- `findings` — actionable defects or scope/intent conflicts prevent acceptance;
- `inconclusive` — the required judgment could not be established with available evidence.

Also report exactly one acceptance field: `attested for the exact current candidate`, `not requested`, or `not established`. Only an acceptance-scoped `pass` may use the first value; an ordinary scoped pass uses `not requested`, while findings, inconclusive evidence, or incomplete candidate coverage use `not established`.

An acceptance attestation covers only the exact candidate and stable basis checked. Report that basis and the Check producer/reference with the verdict and acceptance field. A repair or other relevant change creates a new basis and requires another Check to regain acceptance. Check findings deny acceptance but do not authorize repair or produce an `approved` plan state. Check does not update a plan; the caller may project only a basis-matched `pass` + `attested for the exact current candidate` pair mechanically, without reinterpreting it. A recorded plan attestation is a time-scoped snapshot: a later Check result supersedes it wherever that result is available, and plan-only consumers must obtain the latest applicable result before claiming current acceptance.

Use fresh project context. Gather missing facts directly or use Explore context for an unfamiliar project; this is evidence gathering, not a mandatory preflight.

Load only the method needed:

- `references/review.md` for diff review;
- `references/test.md` for automated verification;
- `references/e2e.md` for real application behavior.

## Read-only boundary

Check does not edit source, tests, plans, or docs; it does not stage, commit, push, or fix a finding. Test and e2e may execute the project only to observe it. If the app cannot launch or a test fails, that result is evidence—not permission to modify the project.

Use “holds up” only for the scope actually checked. Report the stable candidate basis, Check producer/reference, exact verdict and acceptance field; actionable findings before the summary; tight paths/lines where applicable; real command output or observed behavior; and material evidence that could not run. Filter speculative and purely stylistic noise.

An authorized repair belongs to Implement; unresolved correctness or scope belongs to Shape. Stop after the verdict.
