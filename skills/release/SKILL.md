---
name: release
description: 'Create a generic version tag and a GitHub Release with generated notes. Use when the user says "release" / "tag and release" / "发布版本" and supplies a tag or the project has one authoritative version source. Not for version bumps, deployment, rollback, changelogs, artifact uploads, publishing a branch/PR (use publish), or non-GitHub release systems.'
when_to_use: "release, create release, tag release, github release, publish version, 发版, 发布版本, 打 tag, release notes"
dispatch_intent: "Resolve the release tag, push it safely, and create one GitHub Release with generated notes"
---

# Release

Release publishes one existing commit as a git tag plus a GitHub Release. GitHub-generated notes are the release notes; project-specific versioning and deployment stay outside this generic capability.

<HARD-GATE>
Release performs no version bump and no deployment, rollback, changelog, artifact upload, branch publish, or repository release-note file. It never moves/deletes a tag or Release to force the requested state.
</HARD-GATE>

Read `references/anti-patterns.md` and `references/durable-context.md` once per session when they are not already in context.

## Outcome Contract

- Outcome: one verified tag points at the intended remote commit and one GitHub Release for that tag exists with generated notes
- Done when: an existing matching Release is returned, or the tag and Release are created and their canonical state reported
- Evidence: clean git state, tag/commit comparisons, remote/default-branch reachability, push output, and `gh release` output
- Output: tag + target commit + tag state + Release URL + generated-notes state, including precise partial failure

## Resolve identity and target before mutation

Gather:

```bash
git status --short
git remote -v
git tag --list --sort=-version:refname
git ls-remote --tags origin
git rev-parse HEAD
gh auth status --active --hostname github.com
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
gh release view <tag> --json url,tagName,isDraft,isPrerelease
```

Resolve the tag with this precedence: explicit tag → authoritative project version source. An authoritative source is an unambiguous existing version field/file the project already treats as canonical; follow the repository's established `v` prefix pattern. If no single source or prefix is reliable, ask for the tag. Never edit a version file, derive the next version, or guess a release number.

The target defaults to `HEAD` unless the user explicitly names a commit. Require a clean working tree so the user can see exactly what the tag includes. Verify the target is reachable from the remote default branch; release does not push feature branches or unreviewed commits as a side effect.

Require an `origin` GitHub remote and working `gh` authentication before creating a tag. A non-GitHub remote, missing auth, inaccessible repository, or unresolved default branch stops before mutation because the full tag + GitHub Release outcome cannot be completed safely.

If the most recent existing Release/tag already points to the target and there are no new commits, report “nothing new to release” before mutation. A deliberately aliased tag on the same commit requires an explicit tag and explicit acknowledgment; do not infer it.

## Reconcile existing state

Check local tag, remote tag, and GitHub Release independently:

- Release already exists → verify the tag target and return the existing Release URL; do not recreate or rewrite notes.
- local and/or remote tag exists → reuse an existing tag only when its target matches the intended commit; fetch a remote-only tag when needed for verification.
- local and remote tag targets differ, or either points elsewhere → stop. Never move, overwrite, or force-push it.
- matching local tag without remote tag → push only the tag.
- no tag anywhere → create one annotated local tag, then push it.

An existing draft/prerelease is reported with that state rather than silently published or converted. The user must explicitly request a state change outside a normal new release.

## Create the missing tag

For a new tag:

```bash
git tag -a <tag> <target> -m "Release <tag>"
git push origin refs/tags/<tag>
```

Push the exact ref only. Never use force, delete another tag, push branches, or modify git configuration. After push, compare the remote peeled target with `<target>` before creating the Release.

## Create the GitHub Release

Create exactly one normal Release from the verified tag:

```bash
gh release create <tag> --verify-tag --generate-notes --title <tag>
```

The generated notes are authoritative for this generic outcome. Do not compose a repository file, synthesize a changelog, upload artifacts, edit package versions, or invoke project deployment steps. If the user explicitly requested a prerelease, add `--prerelease`; otherwise do not infer it from naming alone.

## Partial failure and report

External side effects are not atomic. If local tag creation succeeds but push fails, keep and report the local tag. If tag push succeeds but `gh release create` fails, do not delete the tag; report the exact completed state and the command/error needed to resume. An ambiguous Release result is queried once with `gh release view <tag>` and never blindly retried.

Return:

```text
Release: created | existing | partial | no-op
Tag: <tag> → <commit> (local/remote state)
GitHub Release: <URL/state> | failed <stage and error>
Notes: generated | existing | not created
Excluded: no version change, deployment, rollback, changelog, or artifact upload
```

Stop after the Release outcome. Do not merge a PR, deploy, or start another skill.
