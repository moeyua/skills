---
name: release
description: 'Create a package-version release commit on the remote default branch, then an exact tag and GitHub Release with generated notes. Use when the user says "release" / "tag and release" / "发布版本" and supplies an exact target tag. Not for multi-version workspaces, deployment, rollback, changelogs, artifacts, registry publishing, automatic PRs, or non-GitHub release systems.'
when_to_use: "release, create release, tag release, github release, publish version, 发版, 发布版本, 打 tag, release notes"
dispatch_intent: "Prepare and push one default-branch version commit, then publish its exact tag and GitHub Release"
---

# Release

Release turns an explicit version tag into one ordered, recoverable GitHub release: synchronize the remote default branch, put that version in one authoritative root package, push the release commit, then create the exact tag and GitHub-generated Release notes.

<HARD-GATE>
Release requires one authoritative root package and a verified package-manager command that changes its version without creating a git tag. It never guesses a version or package policy, force-pushes, rewrites history, moves/deletes a tag or Release, creates a PR, deploys, rolls back, uploads artifacts, writes changelog/release-note files, or publishes a registry package.
</HARD-GATE>

Read `references/anti-patterns.md` and `references/durable-context.md` once per session when they are not already in context.

## Outcome Contract

- Outcome: the remote default branch contains one package-version release commit, one verified tag points at that commit, and one GitHub Release for the tag exists with generated notes
- Done when: an existing matching Release is returned, or every missing release-commit/branch/tag/Release stage is completed and its canonical state reported
- Evidence: clean git state, explicit tag-to-version mapping, package-manager/version diff, default-branch ancestry, commit/tag target comparisons, push output, and `gh release` output
- Output: default branch + package version + release commit + branch push + tag state + Release URL + generated-notes state, including precise partial failure

## Resolve the release identity before mutation

Gather:

```bash
git status --short
git branch --show-current
git remote -v
git tag --list --sort=-version:refname
git ls-remote --heads --tags origin
gh auth status --active --hostname github.com
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
gh release view <tag> --json url,tagName,isDraft,isPrerelease
```

Require an explicit target tag. Map it to one exact package version by following the repository's established tag prefix; if the prefix or mapping is ambiguous, ask before mutation. Never derive the next version from the current package, commits, change type, or earlier tags.

Identify exactly one authoritative root package and its established package manager. The first-version boundary is a single root package: multiple independently versioned packages, workspace-wide ambiguity, a missing version field, or an unverified non-tagging version command stops the release instead of choosing a policy. Verify command semantics from the installed CLI or authoritative documentation rather than assuming similar package managers behave alike.

Examples of supported non-tagging version commands when the repository declares the matching manager are:

```bash
pnpm version <version> --no-git-tag-version
npm version <version> --no-git-tag-version
```

The version command may update the root manifest and package-manager-owned version metadata only. Resolve the expected paths before running it; never accept an unrelated diff as release metadata.

Define one release-commit predicate before accepting any fresh or existing commit. A commit matches only when all of these facts hold:

- it is a normal single-parent commit whose subject is exactly `chore(release): <tag>`;
- the authoritative package version in its committed tree is exactly `<version>`;
- its changed paths against its parent are non-empty and all belong to the resolved package-manager version paths;
- its semantic diff against its parent changes only the authoritative and package-manager-owned version metadata from the parent's version to exactly `<version>`, with no other field or content change.

Path matching alone is insufficient because an unrelated field can share the same manifest or lockfile. Apply this release-commit predicate to every fresh commit, local-ahead recovery, and remote commit reuse.

Require an `origin` GitHub remote, working `gh` authentication, and a resolvable remote default branch before any mutation. Query an existing tag and Release before preparing a new version:

- Release already exists → verify its tag target and package version, then return the existing Release URL; report historical mismatch without rewriting anything.
- local and/or remote tag exists → reuse an existing tag only when its target matches a remote-default-reachable commit whose package version matches the target; a mismatch stops without moving the tag.
- matching remote tag without a Release → create only the missing Release after verifying the peeled target.
- historical tag package version differs from the tag → report the inconsistency and stop; never create a compensating commit for an immutable release.

## Return to or recover on the remote default branch

A dirty tree or diverged default branch stops before mutation unless the tree is the narrow version-diff recovery state below. Do not stash, discard, broadly commit, or carry user changes merely to release.

One validated version diff may resume after a previous version command succeeded but its release commit failed. Accept it only when all of these facts hold after fetching the default branch:

- the caller is already on `<default-branch>` and the local default-branch `HEAD` equals the fetched remote tip;
- the index and working tree have no conflict or untracked path, and every changed path is one of the previously resolved package-manager version paths;
- the semantic diff changes only the authoritative version metadata from the remote-tip value to exactly `<version>`.

When every condition holds, reuse the diff and resume at staged-diff verification and commit. Any extra path, field change, target mismatch, remote movement, or different branch is ordinary dirty state and stops; provenance is never inferred merely from a convenient filename.

For a clean tree with an existing local default branch:

```bash
git fetch origin <default-branch>
git switch <default-branch>
```

Resolve `<default-branch>` from GitHub; never hardcode `main`. If the local branch is absent or checkout is unsafe, stop. Switching away from a clean feature branch is allowed because release publishes the reviewed remote default branch, not the caller's current `HEAD`.

Classify the local branch against the fetched remote tip before merging:

- equal → continue;
- strictly behind → run `git merge --ff-only origin/<default-branch>` and require the resulting commit to equal the fetched tip;
- one validated local release commit ahead → allow recovery only when its parent is the fetched remote default tip and it satisfies the release-commit predicate; reuse it and retry only the default-branch push;
- any other ahead or diverged history → stop before changing metadata, pushing, or tagging.

This narrow one-commit exception is the recovery path for a prior branch-push failure, not permission to publish arbitrary local default-branch work.

## Reconcile or create the release commit

Read the target package version on the synchronized default branch:

- one validated version diff exists → do not rerun the version command; continue with complete-diff and staged-diff verification;
- version differs from `<version>` → run the verified non-tagging version command;
- version equals `<version>` in the validated local release-commit recovery state → reuse `HEAD` and proceed directly to the branch push;
- version already equals `<version>` → locate a unique remote-default-reachable commit that satisfies the release-commit predicate, and reuse it;
- version matches but no unique release commit exists → stop on ambiguous state rather than creating an empty or guessed commit.

After a version command or validated version-diff recovery, inspect the complete diff. Stop if it contains anything beyond the resolved package-manager version paths or if the resulting package version is not exactly `<version>`. Stage only those explicit paths, inspect the staged diff, and create one normal commit without bypassing hooks:

```bash
git commit -m "chore(release): <tag>"
```

After `git commit`, validate `HEAD` with the release-commit predicate before any push. For a fresh commit, also require its parent to equal the fetched remote default tip and require that the index and working tree are clean after the commit. A hook may alter the committed index, message, or post-commit tree, so the pre-commit staged check is not evidence of what was actually committed. If any post-commit condition fails, retain and report the local commit and exact status, but stop before branch push or tag creation; never amend, discard, or normalize it automatically.

Push the default branch directly as the release outcome explicitly authorized by the user:

```bash
git push origin <default-branch>:<default-branch>
```

Never force, change upstream/configuration, or translate a rejected push into an automatic PR. Fetch/query the remote branch once after push and verify that `<release-commit>` is reachable from its tip. Never create the tag until the remote default branch contains `<release-commit>`.

## Reconcile and publish the tag

Check local and remote tag state independently after the remote release commit is verified:

- matching local and remote tag → reuse it;
- matching local tag without remote tag → push only the exact tag ref;
- remote-only tag → fetch it for verification and reuse it;
- local and remote targets differ, or either points elsewhere → stop without moving, overwriting, deleting, or force-pushing it;
- no tag anywhere → create one annotated local tag at `<release-commit>`.

For a new tag:

```bash
git tag -a <tag> <release-commit> -m "Release <tag>"
git push origin refs/tags/<tag>
```

Compare the remote peeled target with `<release-commit>` before creating a Release. Push the exact ref only; never push branches together with the tag.

## Create the GitHub Release

Create exactly one normal Release from the verified tag:

```bash
gh release create <tag> --verify-tag --generate-notes --title <tag>
```

GitHub-generated notes are the release notes. Do not compose a repository file or synthesize a changelog. If the user explicitly requested a prerelease, add `--prerelease`; otherwise do not infer state from naming alone. An existing draft/prerelease is returned with its actual state and never silently converted.

## Partial failure and recovery

Every mutation is a durable recovery point:

- version command succeeds but commit fails → keep and report the exact version diff;
- release commit succeeds but post-commit validation fails → keep and report the local commit/status and do not push or tag it;
- release commit succeeds but default-branch push fails → keep and report the local release commit and do not create a tag;
- branch push succeeds but tag creation/push fails → keep the remote release commit and report local/remote tag state;
- tag push succeeds but `gh release create` fails → do not delete the tag; report the exact completed state and the command/error needed to resume;
- an external result is ambiguous → query that canonical branch/tag/Release identity once and never blindly retry.

On a retry, one validated version diff resumes at commit preparation, while the one validated local release commit ahead state retries only the default-branch push. Fresh, recovered, and remote commits all use the same release-commit predicate; a verified remote release commit means do not repeat the version bump or release commit. A verified tag or Release is likewise reused. Never fake atomic rollback: the safe recovery is to resume from canonical state, not erase already-published history.

Return:

```text
Release: created | existing | partial | no-op
Default branch: <branch> (local/remote state)
Version: <old → target | existing target>
Release commit: <commit/state>
Branch push: <verified | failed/skipped reason>
Tag: <tag> → <commit> (local/remote state)
GitHub Release: <URL/state> | failed <stage and error>
Notes: generated | existing | not created
Excluded: no deployment, rollback, changelog, artifact upload, registry publish, or automatic PR
```

Stop after the Release outcome. Do not merge a PR, deploy, publish a package, or start another skill.
