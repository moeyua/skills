# Target: issue

Use this contract only when the resolved artifact target is `issue`.

## Mutation boundary

Persist 1–20 explicitly separated bounded development problems as problem-oriented Issues in the same repository. Each newly created Issue is a problem record, not an implementation handoff; a verified canonical Issue is reused without editing its existing body. This target guarantees zero project writes: do not create or modify plans, source files, documentation, tests, configuration, or other worktree content. Safe temporary Issue-body files outside the project are allowed during a create call and must be removed afterward.

Each input item maps to at most one Issue. Preserve the user's item boundaries and order. Never auto-split prose, combine adjacent items, or move an item to another repository.

Zero items, more than 20 items, or items spanning multiple repositories make the batch `blocked` before any mutation. Never split the input into smaller batches automatically.

## Batch preflight

Complete preflight for the entire batch before the first mutation:

1. Validate that there are 1–20 explicit item boundaries and enough factual context to identify each bounded development problem and distinguish it from adjacent items. A missing solution, target architecture, or complete acceptance criteria is not a blocker. If the repository, item boundary, or problem itself is materially unclear, return `blocked`.
2. Run `gh auth status --active --hostname github.com`.
3. Resolve one canonical repository in this order: an explicit `OWNER/REPOSITORY`; otherwise the repository named by all explicitly supplied canonical Issue URLs when they agree; otherwise the current repository through `gh repo view --json nameWithOwner -q .nameWithOwner`. Verify repository read and Issue-write access. Every item and canonical URL must target that same repository.
4. Classify every item independently as `fix`, `feat`, `refactor`, or `perf`.
5. For every explicitly supplied canonical Issue URL, verify that it belongs to the resolved repository. A verified URL is `reused`; an invalid or unverifiable identity blocks the entire batch. Never search by title.
6. Read `references/issue-formats.md`; render and validate every not-yet-associated title and body in the user's current language. The required problem statement must be present; every included section must follow schema order, be non-empty, factual, placeholder-free, and free of implementation prescriptions. Omit unsupported optional sections instead of inventing facts or tasks.
7. List repository labels once. Reuse exact lowercase labels. Reject case-only collisions. Determine the complete set of missing change-type labels and their metadata before mutation.
8. Generate one unpredictable batch identifier. Give each create candidate a unique hidden batch marker derived from the batch identifier and its zero-padded input position, for example `<!-- codex-plan-issue-batch: UUID/03 -->`.

If one or more item-specific checks fail preflight, mutate nothing. Mark every item that failed a check as `blocked` and every otherwise valid item as `not-attempted`. If a batch-global prerequisite such as authentication, repository identity, access, or item-count validity fails, mark every row `blocked` with that shared stage and reason.

## Sequential transaction

After preflight succeeds:

1. Order required missing labels by the first input item that depends on each label, then create them using the centralized metadata. If a label create fails, attribute `failed` to the first input-order create candidate that needs that label, retain `reused` for already verified canonical rows, mark every other create candidate `not-attempted`, report any labels already created by this run, and stop before creating Issues.
2. Process items sequentially in input order. Emit `reused` without editing a verified canonical Issue. For a create candidate, write its body and hidden marker to a safe temporary file, create the Issue with its one lowercase type label, capture the returned canonical URL, and remove the temporary file.
3. On the first definite failure, stop. Mark that item `failed` and every later pending item `not-attempted`.
4. On the first ambiguous create result, stop the batch permanently. Perform exactly one read-only reconciliation using that item's exact hidden batch marker and repository. If exactly one matching Issue exists, mark the current item `created`; otherwise mark it `unknown`. Mark every later pending item `not-attempted`. Never reconcile by title and never retry the create automatically.

Marker reconciliation determines only the ambiguous item's ledger status; it never resumes the batch.

Maintain a batch-level side-effect record throughout the transaction. Report the exact labels created by this run on every termination path, including success, definite Issue failure, reconciled or unresolved ambiguity, and label-creation failure; use an empty list when none were created.

## Transaction table

This table is normative. `remote-call suffix` lists only the event-specific call after successful shared preflight; every row guarantees zero project writes.

| event                        | current row | later create candidates | remote-call suffix               | continue |
| ---------------------------- | ----------- | ----------------------- | -------------------------------- | -------- |
| `canonical-reuse`            | `reused`    | `unchanged`             | `issue-view`                     | `yes`    |
| `create-success`             | `created`   | `unchanged`             | `issue-create`                   | `yes`    |
| `create-definite-failure`    | `failed`    | `not-attempted`         | `issue-create`                   | `no`     |
| `create-ambiguous-one-match` | `created`   | `not-attempted`         | `issue-create,marker-query-once` | `no`     |
| `create-ambiguous-not-one`   | `unknown`   | `not-attempted`         | `issue-create,marker-query-once` | `no`     |
| `label-create-failure`       | `failed`    | `not-attempted`         | `label-create`                   | `no`     |
| `preflight-item-failure`     | `blocked`   | `not-attempted`         | `none`                           | `no`     |
| `preflight-global-failure`   | `blocked`   | `blocked`               | `none`                           | `no`     |

## Ledger

Return the batch-level created-label list plus one ordered row per input item with its index, change type, status, and canonical URL or exact stage/error where applicable. The only item statuses are:

- `created` — this run definitively created the Issue;
- `reused` — a user-supplied canonical Issue was verified and left unchanged;
- `blocked` — preflight rejected this item before any mutation;
- `failed` — a definite label or Issue operation failed;
- `unknown` — one marker-based reconciliation could not determine whether an ambiguous create succeeded;
- `not-attempted` — processing stopped before this item.

The overall result is `success` when every row is `created` or `reused`; `partial` when at least one row is `created` or `reused` and at least one row is not; `failed` when mutation began and no row is `created` or `reused`; and `blocked` when preflight stopped the batch without mutation.
