# Release Recovery

Read this reference when setup, release metadata, a commit/push, checks, a tag, a GitHub Release or a deployment may already exist. Incomplete setup resumes through onboarding.md without manufacturing a version commit or redoing completed configuration.

## Reconcile canonical state

Query each local/remote tag and GitHub Release independently. Reuse only when peeled target, default-branch reachability, covered unit versions, dependency propagation, applicable version-bound repository release metadata, and shared release commit all verify. Reuse matching tags and retain an existing Release's URL/state. Never move, delete, overwrite, or compensate for a mismatched historical identity.

A verified remote release commit means do not repeat the release metadata transaction or commit. Verified tags and Releases are also reused.

The default branch may have advanced beyond that commit. Verify reachability and the original release-commit predicate from its committed tree and expected parent; do not require remote tip equality for remote reuse or turn the older set into a new successor proposal. Preserve the existing identity-to-commit mapping. A current policy conflict that affects a remaining action must be resolved before that action, not hidden by regenerating metadata.

## Accepted local recovery states

One validated release metadata diff may resume after a prior transaction succeeded but commit failed only when local HEAD equals the fetched remote tip, the index/tree has no conflict or untracked path, every changed path is allowed metadata, and the semantic diff exactly produces the complete confirmed set, including applicable repository metadata. Resume at complete/staged-diff verification; do not rerun the transaction.

One validated local release commit ahead may resume after branch push failure only when its parent is the fetched remote default tip and it satisfies the release-commit predicate. Retry only the default-branch push.

Any other dirty, ahead, diverged, mixed-identity, metadata-mismatched, or ambiguous state stops without additional mutation.

## Partial failure

Treat each mutation as a durable recovery point:

- transaction or commit validation failure: keep and report the exact diff or local commit/status;
- branch push failure: keep the commit and do not create tags;
- R checks or Preview missing/failed: retain the remote commit and resume its required evidence before creating any new tag;
- tag failure: keep the remote commit and prior identities;
- Release failure after tag push: do not delete the tag; report the exact completed identity and error;
- target deployment failed or unverified: retain tags and Releases and report the exact run/attempt and target state; use deployment-evidence.md for a separately authorized same-ref infrastructure rerun;
- ambiguous external result: query the canonical identity once and do not blindly retry.

There is no destructive rollback. Resume only missing state after every reused object satisfies the same predicates.

An existing tag is not itself proof of CI or target verification. Reconcile missing GitHub Release metadata separately from deployment evidence; never require an unnecessary redeployment just to recreate missing GitHub notes. New tags still require R's pre-tag evidence. If the code needs a fix, it belongs to a new development PR and a subsequent legal version.

Report the shared repository state as:

    repository release metadata <state>; transaction/commit <state>

Report every identity as:

    <identity>: <tag> → <covered units> @ <commit>; tag <state>; Release <URL/state>; GitHub notes <state>; checks/target <evidence or pending/failure>

Keep the recovery boundary: no rollback, arbitrary changelog creation, independent artifact upload or registry publish, or automatic PR. Configured CI performs deployments; Release observes them and resumes only authorized actions with verified identities.
