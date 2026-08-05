# Target: issue

Use this contract only when the resolved target is `issue`.

## Boundary

Persist 1–20 explicitly separated work items as GitHub Issues in one repository, preserving item boundaries and order. Make no project write; temporary body files must live outside the project and be removed. Each item maps to at most one Issue. Do not manage Projects, status, milestones, assignees, dependencies, or sub-issues, and never edit an existing Issue.

Zero items, more than 20, unclear item boundaries, or multiple repositories block the batch before mutation. Never split, combine, regroup, or reroute items to make them fit.

## Whole-batch preflight

Before the first mutation:

1. Confirm every item has settled intent, scope, and observable acceptance.
2. Authenticate with the active GitHub account using `gh auth status --active --hostname github.com`.
3. Resolve one canonical repository from an explicit `OWNER/REPOSITORY`, agreeing canonical URLs, or the current repository; verify read and Issue-write access.
4. Classify each item independently as `fix`, `feat`, `refactor`, or `perf`.
5. Verify supplied canonical Issue URLs belong to that repository. Verified items are `reused` and are never edited; an invalid identity blocks the batch.
6. Read `references/issue-formats.md`; render every create candidate in the user's language with complete ordered sections and observable acceptance checkboxes.
7. List labels once, reject case-only collisions, and resolve all missing change-type labels before Issue creation.
8. Give each create candidate an unpredictable batch identifier plus zero-padded input position in a hidden marker.

If preflight fails, mutate nothing. Mark failed items `blocked` and otherwise valid items `not-attempted`; a global prerequisite marks every row `blocked`.

## Sequential creation

Create required labels in first-use order, then process items in input order. Use a safe temporary body file and one lowercase change-type label per Issue.

If label creation fails, the first create candidate requiring that label is `failed`; preserve all `reused` rows, mark every other create candidate `not-attempted`, stop before Issue creation, and report any labels already created.

- A verified canonical item is `reused` without mutation.
- A definite create failure is `failed`; later create candidates become `not-attempted`.
- After an ambiguous create, query exactly once using the hidden marker. Exactly one match is `created`; otherwise the row is `unknown`. Stop either way and never retry or reconcile by title.

Record every label created by this run on success and failure.

## Result ledger

Return one ordered row per input item with index, type, status, canonical URL or exact stage/error. Allowed statuses are `created`, `reused`, `blocked`, `failed`, `unknown`, and `not-attempted`.

Overall state is `success` when every row is created/reused; `partial` when at least one completed and at least one did not; `failed` when mutation began but none completed; `blocked` when preflight stopped without mutation.
