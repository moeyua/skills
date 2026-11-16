---
name: release
description: "Cut a version (tag a green commit, GitHub Release) following the project's RELEASE.md, then confirm CI deployed it. Use when the user says release / tag / 发版."
---

# Release

`RELEASE.md` is the project's release rulebook: the file the `Release rules` line in the `## Skills` section of `CLAUDE.md` or `AGENTS.md` points to, or `RELEASE.md` at the repo root without that line. It says how changes land, where the version lives (the tag alone by default), what a tag looks like, which checks must pass, what deploys where. Read it from the freshly fetched default branch every time. When it disagrees with the actual workflows or config, report the conflict instead of picking whichever side is convenient.

No `RELEASE.md`? Stop and tell the user to run `/setup` first. A release request doesn't skip setup.

## 1. Pick the version

Find the last released tag and list what landed since: `git log <last-tag>..origin/<default>`.

Propose a version using the rule in `RELEASE.md`. Without one, use SemVer by stage:

- **0.y.z**: breaking change → bump minor, anything else → bump patch.
- **1.0.0 and later**: breaking → major, feature → minor, fix → patch.
- Only the user declares `1.0.0`.

Show the version, the commits that justify it, and the commit you'll release from. If the user named an exact valid version, go ahead. Otherwise stop and wait for their OK.

That OK, or the exact version they named, also covers this release's pushes: the version commit if there is one, and the tag. Push nothing else.

## 2. Get the release commit

**By default the version lives only in the tag.** The release commit is the one the user agreed to, already on the default branch. No version commit. If the project builds or publishes something that needs the version (an npm package, an Electron app), the tag-triggered CI writes it in before building, as `RELEASE.md` describes; nothing is committed back.

The checks `RELEASE.md` requires must have passed **on the release commit** itself: a green parent or a later commit doesn't count. If it names a deploy to check first (a Preview, say), that too.

**Only if `RELEASE.md` requires a version commit** (for example a monorepo whose packages version together), from a clean default branch in sync with the remote:

1. Change the version with the tooling `RELEASE.md` names. The diff must be only the version fields it lists.
2. Commit as `chore(release): v<version>` and push it together with the tag (step 3), the way `RELEASE.md` says changes land. If the push is rejected, stop and say so. Don't change protection to get around it.
3. That commit is the release commit. Don't wait for its own checks: its parent must be green, and the tag-triggered CI checks that the version in the files matches the tag.

Push with the user's own credentials, never an Actions `GITHUB_TOKEN`: pushes made with that token don't trigger the next workflow.

## 3. Tag and release

1. Create an annotated tag in the format `RELEASE.md` gives on the release commit and push only that tag.
2. Check the remote tag points at the release commit.
3. If `RELEASE.md` says so, create the GitHub Release with notes from where `RELEASE.md` says:
   - **Changes pushed directly**: from the commit log, since GitHub's generated notes only list merged PRs. Write `git log --no-merges --format='- %s (%h)' <previous-tag>..<new-tag>` to a file, add a `**Full Changelog**: <compare URL>` line, and run `gh release create <tag> --verify-tag --title <tag> --notes-file <file>`.
   - **Changes land through PRs**: `gh release create <tag> --verify-tag --generate-notes --notes-start-tag <previous-tag>`.
4. If tags deploy (Production), watch that run and do the light check `RELEASE.md` describes: is the site up, does it serve this version.

## When something fails halfway

Keep what succeeded. Never move or delete a tag, force-push, or rewrite history.

- Checks on the release commit failed after the tag was pushed: keep the tag, fix forward the way `RELEASE.md` says changes land, then release a new version.
- Tag pushed but Release creation failed: create just the Release.
- An existing tag points somewhere else: stop and report.

## Report

Version, release commit, check run links, tag, Release link, and the deploy result for each environment. "Production: not checked" is a valid line; "deployed" without evidence is not.
