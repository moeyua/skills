# Project Release Rules

Read this on every Release entry. `RELEASE.md` at the target repository root records the project's release agreement; workflows and version tooling implement it. It is a human-readable document, not a new configuration language or an execution log.

## Establish the agreement

Read repository instructions, manifests/lockfiles, release tools, existing workflows, deployment docs, Git state, and GitHub's actual default branch and rules. Reuse discoverable facts before asking for missing intent. Resolve release units, identities, commands, existing environments and targets independently: an environment describes purpose, a mechanism describes delivery, and a target identifies the concrete destination.

If `RELEASE.md` is missing, use onboarding.md to establish it before a fresh version transaction. An exact tag request does not skip initial setup. If setup files exist only locally or in an unmerged PR, report that stage and continue only authorized setup work. Do not mix setup changes into a release metadata commit.

For daily releases, read the committed document from the fetched remote default branch, not an unrelated local draft. Compare it with the actual workflows, version sources, release identities, and permissions. A contradiction or missing required fact is an explicit gap, not permission to choose whichever source makes execution easier. Updating the agreement and its implementation is a setup change on a work branch.

## What the document records

Use concise prose and tables appropriate to the repository. Record the concrete values needed to operate this project:

- default branch; version sources and release units; version groups/propagation, tag mapping, version policy and allowed prereleases;
- existing version-bound metadata, transaction commands, allowed paths and relevant validation; omit a changelog contract when none exists;
- PR check identities and rebase merging only on user request; version commits pushed directly to the default branch, with the identity and permissions required for that exception;
- selected deployment triggers, environment purposes, mechanism, non-secret destination, environment-specific build configuration, and verification procedure for each target;
- project workflow/check identifiers, selected public CI ref, named Secret references and required runner/target access;
- how to attribute checks, deployed content, and target observations to a release commit; failure/resumption instructions without destructive rollback.

Do not record credential values. Do not append a per-release status ledger or create another document category. Report run URLs and current onboarding/release state in the result; update `RELEASE.md` when the agreement changes.

## Deployment choices

| Project choice | Default-branch update                          | Version-tag push                        |
| -------------- | ---------------------------------------------- | --------------------------------------- |
| Branch only    | Deploy the project's chosen environment        | No deployment                           |
| Tag only       | Run the recorded quality checks; no deployment | Deploy the project's chosen environment |
| Both           | Deploy Preview                                 | Deploy Production                       |

Preview in the dual mode is the shared default-branch environment, not per-PR preview instances. Public/private network location does not choose the mode. A single-trigger project does not gain a second environment. For a repository with no runtime deployment, record version publication only and keep deployment fields absent; do not create cloud resources or deployment workflows.

For example, a static dual-environment project records a default-branch event targeting its Preview bucket/URL and a version-tag event targeting its Production bucket/URL. The shared COS mechanism is the same; triggers, build configuration, and destinations are project-owned values.

Mini-program delivery is a developer-version upload. Record that actual output, AppID and verification, never relabel it as a website environment or completed Production publication. No CI path here submits a review or publishes the mini-program.

## Defaults and existing version behavior

Use established project policy before the bounded SemVer default in model.md. For an ungrouped unit with no established policy, record the chosen SemVer rule and tag mapping during setup; never infer complex group topology from naming. Keep repository-defined manifests and tools. `RELEASE.md` is a required rules entry, not a requirement for another version manifest, schema, package manager, or release-tool dependency.

The project agreement makes the effects of merging and tagging visible. It does not grant a particular merge or first production release, weaken platform rules, or replace the existing exact release-set confirmation contract.
