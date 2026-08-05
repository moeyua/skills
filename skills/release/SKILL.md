---
name: release
description: "Create exact GitHub release sets from the remote default branch for single-package or monorepo repositories. Use when the user requests a tag or release. Derived or expanded release sets require visible next-turn confirmation; fully determining exact tags may execute directly. Not for deployment, rollback, registry publishing, artifacts, automatic PRs, or non-GitHub releases."
---

# Release

Release turns one exact, authorized release set into a verified default-branch version commit plus its tags and GitHub Releases. Its strictness protects public, difficult-to-reverse state; routine model and execution detail stays in conditional references.

## Resolve the release set

Inspect the remote default branch and repository-owned release/version configuration before mutation.

- A supplied exact tag may execute in the current turn only when repository policy makes it a legal successor and its mapping visibly determines every unit target and identity.
- Any derived or expanded unit/identity—including a propagated unit without its own tag—must be shown as a complete set and confirmed in the next user message.
- A missing identity requires a project-policy-first candidate. Show every unit, identity, reason, and canonical basis with `Mutation: none`, then stop.
- Existing or partial state is reusable only when it satisfies the same release predicates.

Read `references/model.md` whenever identity, topology, version selection, propagation, or confirmation basis is not a trivial repository-defined single-package mapping.

## Revalidate and execute

Before any mutation, fetch the remote default branch and re-resolve the exact set from that commit. A cross-turn candidate requires its recorded basis to be unchanged exactly; a current-turn exact tag may continue only when refreshed mapping and successor validity still determine the same complete set.

After authorization and revalidation, read `references/execution.md`. It owns the verified non-tagging, non-committing, non-publishing version transaction, release commit, branch push, tags, and GitHub Releases.

Read `references/recovery.md` when any version diff, commit, push, tag, or Release may already exist or a stage fails. Preserve valid partial success and resume only verified missing state.

## Boundaries and result

Never guess an ambiguous release identity, mutate before required confirmation, force-push, rewrite history, move/delete a tag or Release, create a PR, deploy, roll back, upload artifacts, generate changelog files, or publish a registry package.

Report proposed, created, existing, partial, or no-op state; units and identities; policy and basis; confirmation state; version transaction; release commit/branch push; each tag and Release URL/state; exact recovery point; and bounded exclusions. Stop after this release outcome.
