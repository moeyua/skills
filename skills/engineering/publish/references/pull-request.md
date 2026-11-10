# Pull Request

## Create or reuse

Resolve the repository default base and inspect the whole branch:

    git log <base>..HEAD --oneline
    git diff <base>...HEAD

Reuse an open PR for the current head branch; push new commits but do not overwrite authored title/body unless the user asks. An ambiguous create result may be queried once by exact head branch before deciding its state.

For a new PR, derive the title and body from every branch commit and the merge-base diff. Include:

```markdown
## Summary

- <whole-branch outcomes>

## Test plan

- [ ] <reviewer-verifiable checks and actual evidence>
```

Do not claim tests, Review, or Verify ran without evidence. Use the repository's normal PR state and do not change draft/readiness unless the user explicitly asks.

When a canonical same-repository Issue association is explicit or recorded in the plan, add `Closes #N`. No Issue association is a normal state: omit closing syntax and never search by title.

Use a safe temporary body file for the create call. Remove the temporary body file after the attempt on success, failure, or an ambiguous result. For a non-GitHub remote, complete the safe push and return a manual PR/MR title and body instead of pretending a PR exists.

## Check the current PR

Resolve the exact repository and PR from the request or canonical head, then read its current head SHA, base, draft/merged state, required checks, review requirements, and mergeability. Use repository rules and `RELEASE.md` when present to identify expected checks; the document cannot override GitHub's actual restrictions.

Inspect check runs and statuses for that head, including the run attempt and source where needed. Pending, failed, missing, stale, cancelled, or unavailable required evidence is not a pass. A skipped/neutral result only satisfies a check when the project's actual check contract permits it; do not infer successful execution. With no configured required checks, report that fact and evaluate the project's documented checks rather than inventing a green gate. Surface other failing checks with their significance.

Follow active runs with bounded waits while progressing other authorized work. If a failure or external wait prevents completion, return the exact PR/head, check or run URL, state, and remaining condition. Checking a PR does not authorize fixing code or rerunning a workflow that has deployment side effects.

## Merge when requested

Require explicit user authorization to merge this PR; existing authorization in the conversation is sufficient. It covers either merge method below without another confirmation. Immediately before mutation, refresh the head, base, checks, required reviews, draft state, and mergeability. A changed head invalidates the previous check result. Require the refreshed conditions to pass without an incompatible merge queue.

Select the method from the refreshed state: the repository's `rebaseMergeAllowed` and `squashMergeAllowed`, and the PR's GraphQL `canBeRebased`, `mergeable`, and `mergeStateStatus`. When `mergeable` is `UNKNOWN`, re-read within the bounded wait; if it stays unknown, report it rather than guessing.

Prefer rebase when the repository allows it and the PR can be rebased:

    gh pr merge <pr-url> --rebase --match-head-commit <checked-head-sha>

Use squash only when the repository does not allow rebase merging or GitHub reports the PR cannot be rebased (for example, a branch updated by merging the base replays into conflicts), every other condition passes, and the repository allows squash:

    gh pr merge <pr-url> --squash --match-head-commit <checked-head-sha>

Keep GitHub's configured squash title and body. If a rebase call is definitively rejected because rebase itself is unavailable and the PR is still open at the same head, switch to squash once in the same request. A rejection caused by reviews, checks, or branch protection is reported as a blocker, never switch to squash for it.

Do not use `--admin`, `--auto`, merge commits, branch deletion, or an implicit merge-queue route to evade an unmet condition. Do not update, rebase, or force-push the branch to make it rebaseable. A head mismatch requires fresh inspection. An actual conflict with the base (GitHub reports the PR not mergeable) blocks both methods: report it rather than repairing it or reconfiguring the repository. Report which method merged the PR and why squash was used when it was.

Read back the exact PR and resulting base state. Report merged only when GitHub confirms the merge and identifies the resulting commit. A queued, open, failed, or ambiguous result remains that state. Preserve the PR and existing commits; follow recovery.md for an ambiguous mutation. Any deployment caused by the base update belongs to the project's configured CI, not to a new manual Publish deployment.
