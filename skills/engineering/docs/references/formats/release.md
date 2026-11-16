# Release format — `RELEASE.md`

How this project's changes reach the default branch and how its versions ship. The skills carry no policy of their own here: `implement` pushes and `release` cuts versions the way this file says. Whether to use PRs, whether there is a preview, whether the version lives in a file: all of that differs per project and lives here.

## Sections

Short tables and sentences, in the user's language. Leave out a section that doesn't apply, or write one line saying so ("No environments; nothing deploys.").

1. **Landing changes.** Push straight to the default branch, or open a PR (and how it merges: rebase, squash, merge). Name the default branch.
2. **Checks.** The exact commands to run locally before a push, covering the full suite, not a chosen subset. Which CI workflow runs on which event (push to the default branch, PR, tag).
3. **Environments.** One row per environment: what triggers its deploy (push to the default branch, a tag, manual) and how to confirm it deployed (URL, version endpoint, light check).
4. **Versions.** Where the version lives: by default the tag only, plus where the tag CI writes it before building (for example `package.json` before `npm publish`); or, if the project keeps a version commit, which files and fields. The tag format. The release unit (whole repo, or several packages). The version rule, including the stage: in 0.y.z a breaking change bumps minor; only the user declares 1.0.0.
5. **Cutting a release.** In order: which commit gets tagged, and the version commit if there is one; which checks (and which deploys) must be green on the release commit before tagging; whether a GitHub Release is created and where its notes come from (the commit log when changes are pushed directly, since GitHub's generated notes only list PRs).
6. **When a release fails halfway.** What to keep, what to redo, and what never to do (move a tag, rewrite history).
7. **Special cases.** Anything that overrides the above for some changes, in plain words. For example: "Database migrations go through a PR even though everything else is pushed directly."

## Template

```md
# Release rules

## Landing changes

Default branch `main`. Changes are pushed straight to `main`.

## Checks

Before a push: `pnpm check && pnpm test`.
CI: `quality.yml` runs on every push to `main`.

## Environments

| Environment | Deploys on     | Check                       |
| ----------- | -------------- | --------------------------- |
| Preview     | push to `main` | https://preview.example.com |
| Production  | tag `v*`       | https://example.com/version |

## Versions

Tag only, `v<x.y.z>`, annotated. One version for the whole repo. SemVer, currently 0.y.z.

## Cutting a release

No version commit. Tag a commit on `main` whose CI passed and whose Preview the user has checked. Create a GitHub Release with notes from the commit log since the previous tag.

## When a release fails halfway

Keep what succeeded. Never move or delete a tag. If the tag is pushed but the Release isn't, create just the Release.
```

## Source

Facts the repo can show (manifests, workflows, branch protection, deploy config) and choices the user made. Ask the user for anything the repo can't tell you, rather than picking a default.

## Boundary

No credentials or secret values, no per-release log, no changelog. Why a rule was chosen goes in an ADR, not here.
