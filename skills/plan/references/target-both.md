# Target: both

Use this contract only when the resolved artifact target is `both`.

## Mutation boundary

Persist one coherent change as a local implementation plan and at most one GitHub Issue companion. The Issue is a problem record; the local plan owns technical approach, architecture, path-level scope, ordering, and verification. A new paired Issue is created with a Plan-managed problem block. A verified paired Issue may synchronize that managed content while its canonical identity remains stable. The local plan must exist and validate before any Issue create or edit mutation. This order is fixed: local before Issue mutation.

An Issue failure or conflict makes the overall result `partial`; it never removes, invalidates, or blocks implementation from the completed local plan. Do not fall back, retry automatically, search by title, or create a replacement after a failed or ambiguous result. Do not manage comments, Projects, status, milestones, assignees, dependencies, sub-issues, Issue Type, or human-owned labels and body content.

## Projection and ownership

Ground both artifacts from the same settled bounded problem, but keep their responsibilities separate. Neither artifact may introduce new scope. The managed problem projection contains what is wrong or missing, why it matters, known evidence, external constraints and non-goals, and the observable resolved state when known. Technical approach, target architecture, path-level changes, dependency or migration design, implementation ordering, and verification stay excluded from the Issue and belong only in the local plan.

Render the projection through `references/issue-formats.md`. For every Issue newly created by `both`, wrap that projection in the versioned managed block and SHA-256 envelope defined there. The canonical title, the one change-type label named in the marker, and the managed body are Plan-owned. Preserve text outside the managed block byte-for-byte, preserve comments and unrelated labels, and never send flags for other project-management fields.

An implementation-only revision leaves the problem projection identical and returns `unchanged` without an edit call. When the problem projection changes but remains the same bounded problem and canonical identity, a valid managed envelope authorizes synchronization and returns `updated` after verification. If the revision is a different problem, split, or merge, stop before any remote mutation and report the identity conflict; never transform the old Issue into another work item.

A missing marker, unknown marker version, malformed or duplicate boundary, missing or additional change-type label, or digest mismatch returns `conflict` without editing. Association alone never proves write ownership. After a reported conflict, a later invocation may adopt that exact canonical Issue only when the user explicitly authorizes adoption; reconcile current Issue facts with the settled problem before establishing the first managed envelope.

## Procedure

1. Confirm the request is one coherent change. If it contains independent changes, stop before writing and ask which change should become the paired artifacts.
2. Select one shared change type. Read `references/plan-template.md`, the matching `references/mode-*.md`, and `references/issue-formats.md`.
3. Ground the implementation handoff and managed problem projection without letting either artifact introduce new scope. Use the user's current language for every user-visible Issue field. When replacing an existing plan, capture its recorded canonical URL before changing the file.
4. For an existing canonical URL, run `gh auth status --active --hostname github.com`. Resolve an explicit `OWNER/REPOSITORY` first, otherwise the repository named by an explicitly supplied canonical Issue URL, otherwise the current repository from `gh repo view --json nameWithOwner -q .nameWithOwner`; then verify read-only that the URL belongs to the resolved repository and that repository is readable. Read its exact `url,title,body,labels` before the local write. Verification failure does not authorize a replacement Issue.
5. Write and validate `plans/YYYY-MM-DD-<slug>.md` with `status: draft`. Include a previously verified canonical URL; otherwise omit `issue:`. The completed local write is required before the first label, Issue create, or Issue edit mutation.
6. If no canonical URL exists, start the GitHub portion by running `gh auth status --active --hostname github.com`, resolve a readable repository using an explicit `OWNER/REPOSITORY` first and otherwise the current repository, then preflight Issue-write access, the exact lowercase label, the Issue schema, and the managed envelope. Reuse an exact lowercase label. A case-only label collision finishes `partial`; do not create a label or Issue. Create a genuinely missing label only from the centralized metadata and record its exact name.
7. For a create, write the complete managed body to a safe temporary body file outside the project, create exactly one Issue, and remove the file after success, failure, or an ambiguous result. Do not retry an ambiguous create. Only after definitive Issue success, add `issue: <canonical URL>` to the local plan and read back both identities.
8. For an existing canonical URL, first decide whether the settled revision is still the same bounded problem. Identity uncertainty, a different problem, split, or merge finishes `partial` before remote mutation. Then validate exactly one managed envelope against the fetched title, declared type label, and body digest. Missing or invalid ownership finishes `partial` as `conflict` unless this invocation carries explicit adoption authority. During an explicitly authorized adoption, reconcile the fetched Issue facts with the settled problem, retain the entire fetched body byte-for-byte as outside human-owned content, and build the first managed block from the reconciled projection; never delete or reflow the prior body while establishing ownership.
9. Compare the desired projection with the validated current projection when one exists. If canonical title, type, and managed body are identical, make no mutation and return `unchanged`. Adoption has no `unchanged` path and uses the complete fetched remote state as its original read-back baseline. Otherwise preflight the desired exact lowercase label and case-collision rules, preserve the outside body and unrelated labels, write the complete resulting body to a safe temporary file outside the project, and call `gh issue edit` once with only the changed managed title/body/type fields. Remove the temporary file on every exit path.
10. Read the canonical Issue exactly once after every edit attempt. If its title, managed type label, body envelope, and desired digest all match the target projection, return `updated` even when the edit command result was ambiguous. If a non-success edit left the exact validated original state, return `failed`. Any partial or different observed state returns `unknown`. Never retry the edit, and never reinterpret a later title match without the desired digest as success.

Report every label created by this run on all results, including when a later create or edit fails; use an empty list when none were created.

## Result

Return the local plan path, change type, concise summary, labels created by this run, and exactly one Issue state in this order:

- `created <canonical URL>` — a new paired Issue was definitively created;
- `unchanged <canonical URL>` — the existing managed problem projection already matched;
- `updated <canonical URL>` — the same canonical Issue was verified at the desired managed projection;
- `conflict <canonical URL and stage>` — identity, ownership, version, or digest safety failed before edit;
- `failed <canonical URL, stage, and error>` — a definite operation failure left the original Issue unchanged;
- `unknown <canonical URL and observed stage>` — a create is ambiguous or an edit reconciliation observed neither the exact original nor desired state.

The overall result is `success` for `created`, `unchanged`, or `updated`; it is `partial` for `conflict`, `failed`, or `unknown` after the local plan succeeded. The overall result is `failed` only when the local plan itself could not be completed.

After an ambiguous create, do not add an unverified URL to the plan and do not retry. After an ambiguous update, read the canonical Issue exactly once, require the desired digest, and never retry. A read-back result is a time-scoped observation, not a host-level compare-and-swap guarantee.
