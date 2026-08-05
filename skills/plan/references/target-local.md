# Target: local

Use this contract only when the resolved target is `local`.

## Boundary

Persist exactly one coherent change as a local implementation plan. Make no GitHub mutation. Read-only verification of an explicitly supplied canonical Issue URL is allowed; failure to verify it does not block the local plan and must not trigger title search or replacement creation.

## Procedure

1. Confirm the request is one coherent change; do not auto-split independent work.
2. If a canonical Issue URL is supplied, authenticate before read-only verification and record it only when verified.
3. Select one change type. Read `references/plan-template.md` and the matching `references/mode-*.md`.
4. Ground path-level scope, implementation outcomes, acceptance, and verification from the conversation and repository.
5. Write `plans/YYYY-MM-DD-<slug>.md` with `status: draft` and no intent placeholders.
6. Read it back and verify frontmatter, required sections, path-level scope, and executable checks.

Return the plan path, change type, concise summary, and Issue association state. A local write failure does not authorize an Issue attempt.
