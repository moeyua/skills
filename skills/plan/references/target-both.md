# Target: both

Use this contract only when the resolved target is `both`.

## Boundary

Persist one coherent change as a local implementation plan and at most one GitHub Issue companion. The order is fixed: local before Issue. Issue failure never removes, invalidates, or blocks implementation from the completed local plan; it makes the result partial. Do not manage Projects, status, milestones, assignees, dependencies, or sub-issues, and never edit an existing Issue.

## Procedure

1. Confirm the request is one coherent change and select one change type.
2. Read `references/plan-template.md`, the matching `references/mode-*.md`, and `references/issue-formats.md`.
3. Ground both artifacts from the same settled intent without adding scope.
4. Write and validate the local plan with `status: draft` and no `issue:` field.
5. Authenticate with GitHub using `gh auth status --active --hostname github.com`, then resolve repository identity in this order: explicit repository, repository carried by a canonical Issue URL, current repository. Failure leaves the plan valid and ends partial.
6. If the user supplied a canonical Issue URL, verify it belongs to that repository. Reuse it without editing; failure ends partial and never triggers title search or replacement.
7. Otherwise preflight one exact lowercase change-type label, matching Issue schema in the user's language, and write access. Reject case-only label collisions. Record any label created by this run.
8. Create exactly one Issue from a safe temporary body file. Remove the temporary body file after the attempt on success, failure, or an ambiguous result. Do not retry an ambiguous result.
9. Only after a definitive create or verified reuse, add the canonical URL to plan frontmatter and read both identities back.

Return the plan path, change type, labels created, and Issue state: `created`, `reused`, `failed`, or `unknown`. Overall state is `success` for created/reused, `partial` for every Issue failure or ambiguity after the local plan, and `failed` only when the local plan cannot be completed.
