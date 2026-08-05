# Release Recovery

Read this reference when any version diff, release commit, branch push, tag, or GitHub Release may already exist.

## Reconcile canonical state

Query each local/remote tag and GitHub Release independently. Reuse only when peeled target, default-branch reachability, covered unit versions, and shared release commit all verify. Reuse matching tags and retain an existing Release's URL/state. Never move, delete, overwrite, or compensate for a mismatched historical identity.

A verified remote release commit means do not repeat the version transaction or commit. Verified tags and Releases are also reused.

## Accepted local recovery states

One validated version diff may resume after a prior transaction succeeded but commit failed only when local HEAD equals the fetched remote tip, the index/tree has no conflict or untracked path, every changed path is allowed metadata, and the semantic diff exactly produces the confirmed set. Resume at complete/staged-diff verification; do not rerun the transaction.

One validated local release commit ahead may resume after branch push failure only when its parent is the fetched remote default tip and it satisfies the release-commit predicate. Retry only the default-branch push.

Any other dirty, ahead, diverged, mixed-identity, or ambiguous state stops without additional mutation.

## Partial failure

Treat each mutation as a durable recovery point:

- transaction or commit validation failure: keep and report the exact diff or local commit/status;
- branch push failure: keep the commit and do not create tags;
- tag failure: keep the remote commit and prior identities;
- Release failure after tag push: do not delete the tag; report the exact completed identity and error;
- ambiguous external result: query the canonical identity once and do not blindly retry.

There is no destructive rollback. Resume only missing identities after all reused state satisfies the same predicates.

Report every identity as:

    <identity>: <tag> → <covered units> @ <commit>; tag <state>; Release <URL/state>; notes <state>

Always state the bounded exclusion: no deployment, rollback, changelog, artifact upload, registry publish, or automatic PR.
