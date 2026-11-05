# First Release Setup

Read when `RELEASE.md` is missing, CI connection is requested, or prior setup is incomplete. Establish the project agreement and usable caller configuration; do not bootstrap it through a version commit or a test production release.

## Inspect and prepare

Read project-policy.md, inspect existing project files and GitHub state, and identify independently releasable units. Resolve the real install/check/test/build commands, artifact roots, version sources, current workflows, environments, targets and repository permissions. Ask only for material facts unavailable from those sources, such as the destination the user intends to use.

Read ci-contract.md and the selected published reusable workflow definitions when deployment is needed. Determine only this project's actual path. Preserve its framework, package manager, build tools, runtime configuration and persistent data. An unsupported target is a reported gap, not a reason to insert arbitrary deployment scripts.

Prepare `RELEASE.md` and the necessary caller/Docker/Compose changes on a work branch. Use existing project tools for versioning. Keep the initial rules and CI changes separate from the later version metadata transaction.

Configure checks that run for PRs and for the release commit on the default branch. PR quality checks must work without deployment credentials. Ensure version-only changes are not excluded by path or commit-message filters from a check or deployment that Release must observe.

Create the final branch/tag triggers immediately. A dual-mode caller maps branch updates to Preview and version tags to Production; enforce ref/identity validation before side effects. Do not start with manual-only callers, require a manual proof deployment, create a sacrificial release tag, or require a second PR to activate automation. Ordinary retry of a failed real run is not an onboarding stage.

## External readiness and publication

Check the actor's effective ability to push a version commit directly to the actual default branch, including branch protection and rulesets. Generic repository write access alone does not prove that permission. If the exception is absent or cannot be established, report the missing condition; do not turn version commits into PRs, broaden bypass privileges, or change protection silently.

Before an authorized merge that will trigger deployment, establish the required Secrets' existence and repository access, runner readiness, target configuration and trust. Never request or print Secret values. Configure only the external settings included in the user's setup authority; missing administrator authority leaves that preparation incomplete rather than creating a bypass. Preserve existing environment approval rules.

Validate the local changes with the project's real frozen install, checks, tests and build. Do not invent a test command; when no suite exists, record the skip and pass an empty test command only where the shared interface permits it. Check artifact containment and non-empty output, Docker/mini-program conditions when applicable, run actionlint on changed callers, and check the diff for placeholders, secret values and invalid public-CI references.

Compose Publish within the already-authorized commit/push/PR scope. Merge remains explicitly requested and uses Publish's current-head checks and rebase operation. A setup or release request alone is not merge authority. Continue authorized local preparation when an external prerequisite blocks the dependent merge or deployment.

## Verify through real events

Derive readiness from repository configuration, canonical PR state, workflow runs and the actual target; a file or green configuration check alone is not onboarding proof. Use deployment-evidence.md to correlate observations.

| Configuration            | Evidence after setup                                                      | Completion evidence                                             |
| ------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Branch only              | Final configuration merged                                                | Real branch event and actual target verified                    |
| Tag only                 | Final configuration merged; awaiting first release                        | First authorized real tag event and actual target verified      |
| Both                     | Real branch event and Preview verified; Production awaiting first release | First authorized real tag event and Production verified as well |
| Version publication only | Rules and version tooling verified and merged                             | No deployment requirement                                       |

Do not publish a first version merely to complete setup. Continue that release only when its exact set is authorized under the ordinary Release contract. On re-entry, preserve completed setup and resume the remaining configured path; do not recreate callers or redeploy to manufacture evidence.

Report the highest evidenced state, changed paths, chosen triggers/targets/public ref, checks and run URLs, actual target observations, and missing prerequisites. For dual mode, “Preview verified; Production awaiting first release” is a useful partial result, not full onboarding. Do not commit a status-only `RELEASE.md` update after every observation.
