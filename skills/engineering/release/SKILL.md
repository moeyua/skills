---
name: release
description: "Set up project release rules and CI connection, then publish exact GitHub versions and observe deployment results. Use when the user requests first-time release setup, CI onboarding, a tag, or a release. Read or establish RELEASE.md; derived or expanded release sets need next-turn confirmation. Not for PR checks/merges (use publish), manual deployment, rollback, or standalone registry publishing."
---

# Release

Release establishes a project's release rules and CI connection, then turns an exact authorized release set into a verified default-branch metadata commit, tags, and GitHub Releases with separate deployment evidence. Project workflows map events to targets; the project's CI, or a public CI provider recorded in `RELEASE.md`, executes checks, builds and deployment.

## Resolve project readiness

Read `references/project-policy.md` and the project's `RELEASE.md` on every invocation. When the document is absent or setup is incomplete, read `references/onboarding.md`; for CI integration, also read `references/ci-connection.md`. Establish rules and final automatic triggers on a work branch, preserving the project's real toolchain. Setup changes use Publish within authorized PR/merge scope; a release request never silently authorizes a merge.

Initialize once, then resume from actual configuration and run evidence. In the dual-environment mode, default-branch updates deploy Preview and version tags deploy Production. Verify Preview through the real branch event and Production through the first real release, without an extra manual deployment phase. A document's existence is not proof of completed onboarding.

## Resolve the release set

Once project setup has landed, inspect the remote default branch's `RELEASE.md` and repository-owned release/version configuration before release mutation.

- A supplied exact tag may execute in the current turn only when repository policy makes it a legal successor and its mapping visibly determines every unit, identity, and required version-bound repository release metadata. Existing, user-supplied, or project-deterministic metadata does not add confirmation by itself.
- Any derived or expanded unit, identity, or substantive user-visible repository metadata—including a propagated unit without its own tag—must be shown as a complete set and confirmed in the next user message.
- A missing identity requires a project-policy-first candidate. Show every unit, identity, applicable repository metadata, reason, and canonical basis with `Mutation: none`, then stop.
- A repository without version-bound release metadata keeps the version-only path; never invent a changelog system merely to release.
- Existing or partial state is reusable only when it satisfies the same release predicates.

Read `references/model.md` whenever identity, topology, version selection, propagation, repository release metadata, or confirmation basis is not a trivial repository-defined mapping.

## Revalidate and execute

Before fresh release mutation, fetch the remote default branch and re-resolve the exact set from that commit. A cross-turn candidate requires its recorded basis to be unchanged exactly; a current-turn exact tag may continue only when refreshed mapping and successor validity still determine the same complete set. Reconcile already-published or partial state through recovery before proposing another version transaction.

An already-confirmed exact set needs no additional prose approval; unresolved or expanded identities still follow their stated confirmation rule. After authorization and revalidation, read `references/execution.md`. It owns the verified non-tagging, non-committing, non-publishing metadata transaction, direct default-branch release commit, tags, and GitHub Releases. Read `references/deployment-evidence.md` for the release commit's required checks, Preview verification before tags, and per-target deployment results.

Read `references/recovery.md` when any release metadata diff, commit, push, tag, or Release may already exist or a stage fails. Preserve valid partial success and resume only verified missing state.

## Boundaries and result

Never guess an ambiguous release identity or metadata contract, invent a changelog, mutate a release before required confirmation, force-push, rewrite history, move/delete a tag or Release, merge a PR, manually deploy or roll back, or independently upload artifacts or publish a registry package. Version commits never go through PRs. CI performs the project's configured build/upload/deployment effects. A verified tag or GitHub Release attests exact release state only; it does not establish deployment success, missing implementation evidence, or a Verify pass. Report upstream Review or Verify results as recorded, including conflicting later evidence. Preserve historical Check records with their original source and time scope; never relabel them as Verify evidence.

Lead with setup prepared, partially verified, proposed, created, existing, partial, or no-op state as applicable. Include the relevant project rules, release set/basis, commit, tags/Releases, exact checks and deployment observations, and recovery point. Report Production as awaiting first release until it has actually been verified. Omit inapplicable fields; a proposed set still includes its confirmation basis. When a rule requires a pause, link and quote it with the observed condition.
