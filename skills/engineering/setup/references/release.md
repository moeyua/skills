# Release setup

Use to write or update a project's `RELEASE.md`, in the format the `docs` skill gives, and to wire releases into CI when the project ships versions. Show the user the draft and write it only after they agree. Don't cut a fake first release to test it.

## Find the facts

Look before asking. From manifests, lockfiles, existing workflows, and GitHub settings, find:

- the default branch and whether the user can push to it directly (check branch protection and rulesets, not just write access);
- where the version lives, if anywhere, and whether the repo releases one unit or several;
- the real install, check, test, and build commands;
- what gets deployed, and where.

Then ask the user what only they can decide, one question each with your recommendation: whether changes are pushed straight to the default branch or go through PRs; whether the version lives only in the tag (recommend this) or needs a version commit; which environments exist and what triggers each; any special cases. Record their answers; don't fill these in with a default.

## Versions from the tag

When the version lives only in the tag but something built or published needs it:

- **npm package**: keep a placeholder `version` such as `0.0.0` in `package.json` (npm requires the field). In the tag workflow, before publishing: `npm version "${GITHUB_REF_NAME#v}" --no-git-tag-version`.
- **Electron app**: same for `package.json`, or with electron-builder pass `--config.extraMetadata.version=<version>` to the build. Auto-update compares the version built into the app, so it is unaffected.
- **Nothing reads it** (a private package, a site): remove the `version` field or leave it unused; say which in `RELEASE.md`.

Never commit the written version back. Packages in a monorepo that version together are the usual exception: there, a version commit (or a tool like changesets) is normal; record it under special cases.

## Choose a deploy mode

| Mode         | Push to default branch             | Push a version tag                       |
| ------------ | ---------------------------------- | ---------------------------------------- |
| Version only | Quality checks                     | GitHub Release, nothing deploys          |
| Branch only  | Quality checks, deploy the one env | GitHub Release                           |
| Tag only     | Quality checks                     | Validate tag, build, deploy, light check |
| Dual         | Quality checks, deploy Preview     | Validate tag, build, deploy Production   |

If changes land through PRs, PRs run the full quality checks without deploy secrets. Tag runs don't rerun tests: the checks on the tagged commit already passed before tagging.

## Wire up CI

If the project uses a shared CI provider (for example the team's storminfra reusable workflows), follow that provider's own integration skill or docs; it knows its inputs and secrets. Pin it to a published tag, never a branch. Otherwise write the workflow in the repo.

Before any tag-triggered deploy, a gate job must check the tag matches the version format, the tagged commit is on the default branch, and, if the project keeps a version commit, the version at that commit matches the tag. Every deploy job depends on that gate and builds the tagged commit.

Map secrets by name; never `secrets: inherit`. Never write a secret value anywhere.

## Done when

`RELEASE.md` and the workflows have landed the way `RELEASE.md` says, and a real push to the default branch has run the checks (and deployed Preview, if there is one). Production stays "waiting for the first release" until a real release proves it.
