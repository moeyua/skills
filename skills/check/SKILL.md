---
name: check
description: 'Check a change by review, tests, or end-to-end observation with depth matched to the question and risk. Use when the user says "review" / "run the tests" / "check this works" / "把关" / "验证", or asks for a pre-merge gate. Not for fixing findings, writing implementation/tests, or recording what landed.'
---

# Check

Check answers whether a change holds up. Its credibility comes from reporting only evidence it actually inspected or ran.

## Select the evidence

An explicit request selects review, test, e2e, or a combination. A full or pre-merge gate normally combines relevant review and tests, adding e2e when user-visible behavior and a runnable path make it valuable.

For a bare or ambiguous request, inspect the scope and choose the smallest combination that can support a trustworthy verdict. Do not automatically expand to every mode, and do not force separate agents. A clean-context or independent review is useful when change size, risk, or prior authorship makes confirmation bias material.

Use fresh project context. Gather missing facts directly or use Explore context for an unfamiliar project; this is evidence gathering, not a mandatory preflight.

Load only the method needed:

- `references/review.md` for diff review;
- `references/test.md` for automated verification;
- `references/e2e.md` for real application behavior.

## Read-only boundary

Check does not edit source, tests, plans, or docs; it does not stage, commit, push, or fix a finding. Test and e2e may execute the project only to observe it. If the app cannot launch or a test fails, that result is evidence—not permission to modify the project.

Use “holds up” only for the scope actually checked. Report actionable findings before the summary, with tight paths/lines where applicable, real command output or observed behavior, and material evidence that could not run. Filter speculative and purely stylistic noise.

An authorized repair belongs to Implement; unresolved correctness or scope belongs to Shape. Stop after the verdict.
