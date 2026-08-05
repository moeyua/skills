# Target: local

Use this contract only when the resolved artifact target is `local`.

## Mutation boundary

Persist exactly one coherent change as a local implementation plan. This target guarantees zero GitHub mutation: do not create or change Issues, labels, Projects, or any other remote state.

Read-only GitHub access is allowed only to verify an existing canonical Issue URL explicitly supplied by the user or already present in the plan being replaced. Never discover an association by title. If the URL verifies, record it; if verification is unavailable or fails, omit the association and report the exact read-only result.

## Procedure

1. Confirm the request is one coherent change. If it contains independent changes, stop before writing and ask which change should become the local plan.
2. When an existing canonical Issue URL is available, run `gh auth status --active --hostname github.com` before any URL or repository lookup, then perform the read-only verification described above. Verification failure does not block the local plan.
3. Select one shared change type and read `references/plan-template.md` plus the matching `references/mode-*.md`.
4. Ground path-level scope, implementation order, acceptance, and change-type evidence from the conversation and repository.
5. Write `plans/YYYY-MM-DD-<slug>.md` with `status: draft`. Include no unresolved intent placeholders.
6. Read the file back and verify its frontmatter, required sections, path-level scope, and executable checks.

## Result

Return `success` with the plan path, change type, concise summary, and association state. Return `failed` only when the local file cannot be written or reliable facts cannot bound the change. No local failure authorizes an Issue attempt.
