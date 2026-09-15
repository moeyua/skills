# Release Execution

Read this reference only after one exact release set is authorized and post-fetch revalidation succeeds.

## Preflight

Require an origin GitHub remote, working GitHub CLI authentication, a resolvable remote default branch, and a clean tree. A dirty tree or diverged default branch stops before mutation except for the validated recovery states in recovery.md.

Switch to the resolved default branch and reconcile it with the fetched remote tip:

    git switch <default-branch>
    git merge --ff-only origin/<default-branch>

Continue only from equal/fast-forward state or a recovery state accepted by recovery.md.

Before returning any fully or partially existing set, require all existing identities to point to the same verified release commit and that committed tree to satisfy every confirmed unit target, group/propagation constraint, and applicable repository-metadata requirement.

## Release metadata transaction

Resolve a repository-declared command or deterministic sequence that produces the complete confirmed set:

- every confirmed unit target version;
- every required dependency propagation result;
- every applicable version-bound repository release metadata target and confirmed or project-determined content.

When the topology has no version-bound repository release metadata, the transaction must not create a changelog file, note entry, or placeholder. When it does, follow the repository's existing structure and semantics rather than imposing a common file type or schema. The sequence may combine established release tools with bounded edits when the repository itself has no generator.

It must be one verified non-tagging release metadata transaction. Every part must be non-committing and non-publishing, must not stage files, and must not change branches, tags, or other refs. Verify tool behavior from installed CLI help or authoritative documentation. Examples for an established single-package npm/pnpm repository include:

    pnpm version <version> --no-git-tag-version
    npm version <version> --no-git-tag-version

Before execution, resolve the expected paths and semantic result for versions, dependencies, and applicable repository metadata. Record canonical HEAD, index, and relevant refs; afterward require HEAD, index, and refs remain unchanged. Reject any extra path or content that is not part of the complete release set.

Run the repository-defined validation that materially covers the changed release metadata before staging. Choose the narrowest sufficient proof from project instructions, tests, and release tooling; a failing or unavailable required check stops at the transaction diff rather than being bypassed.

## Release commit and branch push

Create one normal single-parent commit with deterministic subject:

    git commit -m "chore(release): <release-set-label>"

For one identity the label is the exact tag:

    git commit -m "chore(release): <tag>"

For multiple identities, use the repository's authoritative release-label policy. If no policy exists, form the label deterministically in stable unit order from the exact tags, joined with `+`.

The release-commit predicate requires the expected parent and subject; every unit target; group and dependency-propagation invariants; applicable version-bound repository release metadata; non-empty allowed metadata paths; and a semantic diff against its parent that exactly produces the complete confirmed set without unrelated content.

After git commit, validate HEAD with that predicate and require the tree/index to be clean. Apply the predicate to every fresh commit, local-ahead recovery, and remote commit reuse. Do not bypass hooks, amend, discard, or normalize a failed result automatically.

Push and verify the exact default branch:

    git push origin <default-branch>:<default-branch>

Never create the tag until the remote default branch contains <release-commit>.

## Tags and GitHub Releases

For each release identity in deterministic order:

1. Reconcile local tag, remote tag/peeled target, and GitHub Release.
2. Reuse matching tags; stop on any target mismatch.
3. If absent, create one annotated tag at the release commit and push only its exact ref:

   git tag -a <tag> <release-commit> -m "Release <tag>"
   git push origin refs/tags/<tag>

4. Verify the remote peeled target.
5. Create a missing normal Release with generated notes:

   gh release create <tag> --verify-tag --generate-notes --title <tag> --notes-start-tag <identity-baseline-tag>

Omit `--notes-start-tag` only for a verified first release. GitHub-generated notes remain the GitHub Release notes; they neither replace nor duplicate version-bound repository release metadata. Add prerelease state only when explicitly requested or required by authoritative policy.

Record shared repository metadata and each identity independently. If one identity fails, preserve completed objects and resume only the missing state on a later run.
