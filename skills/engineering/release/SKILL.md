---
name: release
description: "Cut a version (bump, tag, GitHub Release) following the project's RELEASE.md, then confirm CI deployed it. Use when the user says release / tag / 发版."
---

# Release

`RELEASE.md` at the repo root is the project's release rulebook: where the version lives, what a tag looks like, which checks must pass, what deploys where. Read it from the freshly fetched default branch every time. When it disagrees with the actual workflows or config, report the conflict instead of picking whichever side is convenient.

No `RELEASE.md`? Stop and tell the user to run `/setup` first. A release request doesn't skip setup.

## 1. Pick the version

Find the last released tag and list what landed since: `git log <last-tag>..origin/<default>`.

Propose a version using the rule in `RELEASE.md`. Without one, use SemVer by stage:

- **0.y.z**: breaking change → bump minor, anything else → bump patch.
- **1.0.0 and later**: breaking → major, feature → minor, fix → patch.
- Only the user declares `1.0.0`.

Show the version, the commits that justify it, and the commit you'll release from. If the user named an exact valid version, go ahead. Otherwise stop and wait for their OK.

## 2. Bump and push the version commit

From a clean default branch in sync with the remote:

1. Change the version with the project's own tooling (for npm: `npm version <v> --no-git-tag-version --ignore-scripts`). The diff must be only the version fields `RELEASE.md` names.
2. Commit as `chore(release): v<version>` and push straight to the default branch. Version commits don't go through PRs. If branch protection blocks the push, stop and say so. Don't open a PR or change protection to get around it.
3. Wait for the checks `RELEASE.md` requires to pass **on that exact commit**. A green parent or a later commit doesn't count. In a dual-environment project this includes the Preview deploy.

Push with the user's own credentials, never an Actions `GITHUB_TOKEN`: pushes made with that token don't trigger the next workflow.

## 3. Tag and release

1. Create an annotated tag `v<version>` on the version commit and push only that tag.
2. Check the remote tag points at the version commit.
3. Create the GitHub Release with notes generated from the previous tag: `gh release create v<version> --verify-tag --generate-notes --notes-start-tag <previous-tag>`.
4. If tags deploy (Production), watch that run and do the light check `RELEASE.md` describes: is the site up, does it serve this version.

## When something fails halfway

Keep what succeeded. Never move or delete a tag, force-push, or rewrite history.

- Version commit pushed but checks failed: don't tag. The fix goes through a normal PR, then release a new version.
- Tag pushed but Release creation failed: create just the Release.
- An existing tag points somewhere else: stop and report.

## Report

Version, version commit, check run links, tag, Release link, and the deploy result for each environment. "Production: not checked" is a valid line; "deployed" without evidence is not.
