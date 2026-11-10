# Publish Recovery

Treat commit, push, PR, current checks, and merge as independent recovery points.

- Relevant commits already exist: reuse them; do not manufacture another commit.
- Branch already matches its upstream: skip push.
- An open PR exists for the exact head: reuse it.
- Commit succeeds and push fails: keep the local commits and stop at push.
- Push succeeds and PR creation fails: keep the remote branch and report manual/degraded state.
- PR creation is ambiguous: query exactly once by head branch; never blindly retry a create that may have succeeded.
- Checks fail or wait: retain the PR; inspect its current head and the relevant run attempt before resuming, without redoing publication.
- PR head changes before merge: discard old check evidence and inspect the new head; never force the old merge through.
- Rebase rejected because the PR cannot be rebased or the repository disallows rebase, with the PR still open at the same head: squash once under the same authorization. An ambiguous rebase result is not a rejection: query the PR once and do not fall back to squash.
- Merge is ambiguous: query that exact PR once. Reuse a confirmed merge; an open, queued, or unknown state is not success and does not justify another merge call in the same ambiguous attempt.
- PR is already merged: report the confirmed merge and resulting commit; do not publish a replacement PR or rewrite local history to imitate it.

Return the applicable commit range, branch/upstream relation, verified PR/head, check results, requested merge state, error stage, and remaining working-tree paths. Never delete or rewrite completed state to fake an all-or-nothing transaction.
