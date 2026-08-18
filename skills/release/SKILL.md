---
name: release
description: "Create exact GitHub release sets from the remote default branch, including repository-required version-bound release metadata when present. Use when the user requests a tag or release. Derived or expanded sets require visible next-turn confirmation; fully determined exact sets may execute directly. Not for deployment, rollback, registry publishing, artifacts, automatic PRs, or non-GitHub releases."
---

# Release

Release turns one exact, authorized release set into a verified default-branch release metadata commit plus its tags and GitHub Releases. Its strictness protects public, difficult-to-reverse state; routine model and execution detail stays in conditional references.

## Resolve the release set

Inspect the remote default branch and repository-owned release/version configuration before mutation.

- A supplied exact tag may execute in the current turn only when repository policy makes it a legal successor and its mapping visibly determines every unit, identity, and required version-bound repository release metadata. Existing, user-supplied, or project-deterministic metadata does not add confirmation by itself.
- Any derived or expanded unit, identity, or substantive user-visible repository metadata—including a propagated unit without its own tag—must be shown as a complete set and confirmed in the next user message.
- A missing identity requires a project-policy-first candidate. Show every unit, identity, applicable repository metadata, reason, and canonical basis with `Mutation: none`, then stop.
- A repository without version-bound release metadata keeps the version-only path; never invent a changelog system merely to release.
- Existing or partial state is reusable only when it satisfies the same release predicates.

Read `references/model.md` whenever identity, topology, version selection, propagation, repository release metadata, or confirmation basis is not a trivial repository-defined mapping.

## Revalidate and execute

Before any mutation, fetch the remote default branch and re-resolve the exact set from that commit. A cross-turn candidate requires its recorded basis to be unchanged exactly; a current-turn exact tag may continue only when refreshed mapping and successor validity still determine the same complete set.

After authorization and revalidation, read `references/execution.md`. It owns the verified non-tagging, non-committing, non-publishing release metadata transaction, release commit, branch push, tags, and GitHub Releases.

Read `references/recovery.md` when any release metadata diff, commit, push, tag, or Release may already exist or a stage fails. Preserve valid partial success and resume only verified missing state.

## Boundaries and result

Never guess an ambiguous release identity or repository metadata contract, invent a repository changelog where none exists, mutate before required confirmation, force-push, rewrite history, move/delete a tag or Release, create a PR, deploy, roll back, upload artifacts, or publish a registry package. A verified tag or GitHub Release attests exact release state only; it does not supply missing implementation acceptance or a Check pass.

Report proposed, created, existing, partial, or no-op state; units and identities; policy and basis; repository release metadata state; confirmation state; metadata transaction; release commit/branch push; each tag and Release URL/GitHub-notes state; exact recovery point; and bounded exclusions. Stop after this release outcome.
