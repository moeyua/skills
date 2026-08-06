# Publish Recovery

Treat commit, push, and PR as independent recovery points.

- Relevant commits already exist: reuse them; do not manufacture another commit.
- Branch already matches its upstream: skip push.
- An open PR exists for the exact head: reuse it.
- Commit succeeds and push fails: keep the local commits and stop at push.
- Push succeeds and PR creation fails: keep the remote branch and report manual/degraded state.
- PR creation is ambiguous: query exactly once by head branch; never blindly retry a create that may have succeeded.

Return the exact commit range, branch/upstream relation, PR identity when verified, error stage, and remaining working-tree paths. Never delete or rewrite completed state to fake an all-or-nothing transaction.
