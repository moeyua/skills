# Release Checks and Deployment Evidence

Read after the version commit is pushed, when observing initial setup, or when resuming a deployment-related partial result. Use the project's `RELEASE.md` and actual workflows to identify which checks, targets and verifications apply. CI performs deployments; Release correlates and reports their results.

## Before a new tag

Let R be the exact verified release commit already reachable from the remote default branch. Read the expected checks and deployment runs for R, recording repository, workflow, event/ref, head SHA, run ID/attempt, conclusion and relevant artifact/image identity. An unrelated workflow with the same display name, an older attempt, or a parent's checks cannot stand in for the expected result.

Require the recorded quality checks for R. Where the project has no hosted checks, use its declared validation commands against R and report that evidence accurately; unavailable required checks remain a gap. A pending, failed, cancelled, stale or missing required result blocks a new tag. A skipped/neutral conclusion is acceptable only under the check's actual project contract and never means that a test ran.

For dual mode, also require Preview deployment and actual target verification attributable to R. Follow the recorded smoke/health procedure and confirm the served content, deployment record or running image corresponds to R's artifact. A green workflow alone is not target verification. If newer main work has replaced Preview, reuse a recorded valid observation of R; without it, report the missing evidence and stop before tagging. Do not validate the current newer site as R, freeze development, or create a manual deployment workaround.

A single-trigger project follows its recorded checks and applicable branch-target verification without gaining a Preview environment. A version-only repository has no deployment gate. Setup observes its actual merged setup commit using the same attribution principles, without treating it as a version release.

## After tag push

Find the expected run for each exact tag/ref and peeled release commit, rather than simply taking the latest run for that SHA. A commit may have several tags, units, branch runs or attempts. Use event payload or checkout/ref/artifact evidence to disambiguate; if the service cannot establish the mapping, report it as unavailable.

Observe the pipeline through completion or an explicit external wait/failure. Validate the configured target using the documented procedure and correlate it with the immutable artifact/image identity. Main advancing after tagging does not change the release object; the tag run builds R. In a main-only mode, report the branch deployment already observed; do not invent a tag deployment.

Report release metadata/commit, each tag, GitHub Release, CI outcome and actual target verification separately, with their URLs and time scope. Environment approval, a queued run, a missing event, an inaccessible target or a failed verification is not deployed success. Keep the original outcome when a later rerun has not yet supplied new evidence.

## Resume

R checks or Preview failed before tagging: retain the valid remote commit and resume its missing evidence; do not repeat the version transaction. Already-pushed tags/Releases remain valid independently of a failed deployment. An authorized infrastructure rerun uses the same exact ref, commit, target and intended payload; revalidate those bindings before retrying, especially when a mutable shared workflow ref or environment configuration has changed. Do not rerun merely to make a result green.

If code changes are needed, use a new development PR and subsequent legal version; never move the old tag. An explicit same-version rerun request authorizes that bounded CI action, not arbitrary dispatch or rollback. Preserve matching release identities when default-branch history has advanced, and use recovery.md to reconcile the exact earlier set.
