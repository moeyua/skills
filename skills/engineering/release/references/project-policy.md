# Project Release Rules

Read this on every Release entry. `RELEASE.md` at the target repository root records the project's release agreement; workflows and version tooling implement it. It is a human-readable document, not a new configuration language or an execution log.

## Establish the agreement

Read repository instructions, manifests/lockfiles, release tools, existing workflows, deployment docs, Git state, and GitHub's actual default branch and rules. Reuse discoverable facts before asking for missing intent. Resolve release units, identities, commands, existing environments and targets independently: an environment describes purpose, a mechanism describes delivery, and a target identifies the concrete destination.

If `RELEASE.md` is missing, use onboarding.md to establish it before a fresh version transaction. An exact tag request does not skip initial setup. If setup files exist only locally or in an unmerged PR, report that stage and continue only authorized setup work. Do not mix setup changes into a release metadata commit.

For daily releases, read the committed document from the fetched remote default branch, not an unrelated local draft. Compare it with the actual workflows, version sources, release identities, and permissions. A contradiction or missing required fact is an explicit gap, not permission to choose whichever source makes execution easier. Updating the agreement and its implementation is a setup change on a work branch.

## What the document records

Use concise prose and tables appropriate to the repository. Record the concrete values needed to operate this project:

- default branch; version sources and release units; version groups/propagation, tag mapping, version policy and allowed prereleases;
- the version stage (0.y.z initial development or 1.0.0 and later) with its increment rule, the declared public API once at 1.0.0 or later, that `1.0.0` is declared only by the user, and whether prereleases are allowed;
- existing version-bound metadata, transaction commands, allowed paths and relevant validation; omit a changelog contract when none exists;
- PR check identities and merging only on user request (rebase preferred, squash when rebase is unavailable); version commits pushed directly to the default branch, with the identity and permissions required for that exception;
- selected deployment triggers, environment purposes, mechanism, non-secret destination, environment-specific build configuration, and verification procedure for each target;
- project workflow/check identifiers; the CI provider, its published ref and integration documentation when a public CI provider is used; named Secret references and required runner/target access;
- which checks each event runs (PR and default-branch commits run full quality checks; version tags do not rerun quality checks or tests), any provider-mandated step kept as a known limitation, and whether build configuration differs per environment;
- the light post-deploy confirmation for each target (for example reachability and that the served artifact identity matches R), plus any extra Production verification the project requires (none by default);
- how to attribute checks, deployed content, and target observations to a release commit; failure/resumption instructions without destructive rollback.

Do not record credential values. Do not append a per-release status ledger or create another document category. Report run URLs and current onboarding/release state in the result; update `RELEASE.md` when the agreement changes.

## Deployment choices

| Project choice | Default-branch update                          | Version-tag push                                                                       |
| -------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| Branch only    | Deploy the project's chosen environment        | No deployment                                                                          |
| Tag only       | Run the recorded quality checks; no deployment | Validate, build, deploy and confirm the chosen environment; no quality checks or tests |
| Both           | Run quality checks; deploy and verify Preview  | Validate, build, deploy and confirm Production; no quality checks or tests             |

Preview in the dual mode is the shared default-branch environment, not per-PR preview instances. Public/private network location does not choose the mode. A single-trigger project does not gain a second environment. For a repository with no runtime deployment, record version publication only and keep deployment fields absent; do not create cloud resources or deployment workflows.

For example, a static dual-environment project records a default-branch event targeting its Preview destination and a version-tag event targeting its Production destination. The delivery mechanism can be the same; triggers, build configuration, and destinations are project-owned values.

When a target's delivery is not a user-facing release, such as an upload awaiting a separate review or publication, record that actual output and its verification and never relabel it as a website environment or completed Production publication.

## Defaults and existing version behavior

Use established project policy before the bounded SemVer default in model.md. For an ungrouped unit with no established policy, record the SemVer rule for its current version stage, the public API declaration or its absence, prerelease permission, and tag mapping during setup, following model.md; do not record a stage-independent rule such as “breaking → major”; never infer complex group topology from naming. Keep repository-defined manifests and tools. `RELEASE.md` is a required rules entry, not a requirement for another version manifest, schema, package manager, or release-tool dependency.

The project agreement makes the effects of merging and tagging visible. It does not grant a particular merge or first production release, weaken platform rules, or replace the existing exact release-set confirmation contract.
