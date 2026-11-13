# Release setup

Use when a project has no `RELEASE.md`, or the user asks to connect releases to CI. This is ordinary work: do it on a branch and get it merged through a PR like any other change. Don't cut a fake first release to test it.

## Find the facts

Look before asking. From manifests, lockfiles, existing workflows, and GitHub settings, find:

- the default branch and whether the user can push to it directly (check branch protection and rulesets, not just write access);
- where the version lives, and whether the repo releases one unit or several;
- the real install, check, test, and build commands;
- what gets deployed, and where.

Ask the user only what the repo can't tell you, usually the deploy target.

## Choose a deploy mode

| Mode         | Push to default branch             | Push a version tag                       |
| ------------ | ---------------------------------- | ---------------------------------------- |
| Version only | Quality checks                     | GitHub Release, nothing deploys          |
| Branch only  | Quality checks, deploy the one env | GitHub Release                           |
| Tag only     | Quality checks                     | Validate tag, build, deploy, light check |
| Dual         | Quality checks, deploy Preview     | Validate tag, build, deploy Production   |

PRs always run the full quality checks without deploy secrets. Tag runs don't rerun tests: the checks on the version commit already passed before tagging.

## Wire up CI

If the project uses a shared CI provider (for example the team's storminfra reusable workflows), follow that provider's own integration skill or docs; it knows its inputs and secrets. Pin it to a published tag, never a branch. Otherwise write the workflow in the repo.

Before any tag-triggered deploy, a gate job must check the tag matches the version format, the tagged commit is on the default branch, and the version in the repo at that commit matches the tag. Every deploy job depends on that gate and builds the tagged commit.

Map secrets by name; never `secrets: inherit`. Never write a secret value anywhere.

## Write RELEASE.md

Short prose and tables, in the user's language, covering: default branch; version source and tag format; version rule (with the 0.y.z / 1.0.0 stage); which checks each event runs; deploy mode, targets, and how to check each deploy; who can push version commits; what to do when a release fails halfway. No credentials and no per-release log.

## Done when

The rules and workflows are merged and a real push to the default branch has run the checks (and deployed Preview, in dual mode). Production stays "waiting for the first release" until a real release proves it.
