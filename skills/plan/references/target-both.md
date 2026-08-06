# Target: both

Use this contract only when the resolved artifact target is `both`.

## Mutation boundary

Persist one coherent change as a local implementation plan and at most one GitHub Issue companion. The local plan must exist and validate before any Issue mutation. This order is fixed: local before Issue.

An Issue failure makes the overall result `partial`; it never removes, invalidates, or blocks implementation from the completed local plan. Do not fall back, retry automatically, or create a replacement Issue after an ambiguous result. Do not manage Projects, status, milestones, assignees, dependencies, or sub-issues, and never edit an existing Issue.

## Procedure

1. Confirm the request is one coherent change. If it contains independent changes, stop before writing and ask which change should become the paired artifacts.
2. Select one shared change type. Read `references/plan-template.md`, the matching `references/mode-*.md`, and `references/issue-formats.md`.
3. Ground both artifacts from the same settled intent. Render their target-specific structure without letting either artifact introduce new scope; use the user's current language for every user-visible Issue field.
4. Write and validate `plans/YYYY-MM-DD-<slug>.md` with `status: draft` and no `issue:` field.
5. Start the GitHub portion by running `gh auth status --active --hostname github.com`. Failure leaves the plan valid and finishes `partial`.
6. Resolve one canonical repository before URL verification or remote mutation: use an explicit `OWNER/REPOSITORY` first, otherwise the repository named by an explicitly supplied canonical Issue URL, otherwise the current repository from `gh repo view --json nameWithOwner -q .nameWithOwner`. Verify the resolved repository is readable. Failure leaves the plan valid and finishes `partial`.
7. If the user explicitly supplied an existing canonical URL, verify read-only that it belongs to the resolved repository. On success, reuse it without editing the Issue and add it to the plan. On failure, leave the plan unchanged and finish `partial`; never search by title or create a replacement.
8. Otherwise, preflight the exact lowercase label, matching Issue schema, and Issue-write access for the resolved repository. Reuse an exact lowercase label. A case-only label collision finishes `partial`; do not create a label or Issue. Create a genuinely missing label only from the centralized metadata and record its exact name.
9. Create exactly one Issue from a safe temporary body file outside the project. Remove the temporary body file after the attempt on success, failure, or an ambiguous result, and capture a canonical URL only on definitive success.
10. Only after definitive Issue success, add `issue: <canonical URL>` to the local plan frontmatter and read back both identities.

If an Issue create result is ambiguous, do not add an unverified URL to the plan and do not retry. Report the exact stage as `partial`.

Report the exact labels created by this run on every result, including when the later Issue create fails or remains unknown; use an empty list when none were created.

## Result

Return the local plan path, change type, concise summary, labels created by this run, and Issue state:

- `created <canonical URL>`;
- `reused <canonical URL>`;
- `failed <stage and error>`;
- `unknown <ambiguous stage>`.

The overall result is `success` for `created` or `reused`, `partial` for any Issue failure or unknown result after the local plan succeeded, and `failed` only when the local plan itself could not be completed.
