# CI Connection

Read for deployment setup or when connecting a project's release events to CI. Release is provider-neutral: it decides which events check, build, deploy and verify, and how their evidence is attributed to a release. The project's own workflows, or a public CI provider recorded in `RELEASE.md`, perform the work. Project files own the real commands and runtime needs; project-policy.md owns the chosen release rules.

## CI provider and ref

Use the project's existing workflows, or the public CI provider and published ref recorded in `RELEASE.md`. A provider ref must be a published, stable reference such as a major or version tag; never a development branch such as `main`. A full commit SHA is only for an explicitly authorized validation of an unpublished provider change. Developing the provider's workflows is outside Release.

Before generating or changing a caller, read the selected ref's actual reusable workflow interfaces (inputs, outputs, Secrets, permissions) and the provider's own documentation. When the provider ships an integration guide or Skill, wire the caller by it; it is authoritative for how to call that provider. Record the provider, ref and documentation location in `RELEASE.md`. An unsupported target is a reported gap, not a reason to insert arbitrary deployment scripts.

Pass project-native commands explicitly rather than adopting provider defaults that change the toolchain. Map each named Secret; never use `secrets: inherit`. Keep non-sensitive destinations in version-controlled inputs. Never place Secret values, private keys, `.env` contents or credentials in Git, logs or artifacts.

## Event check division

| Event                              | Runs                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Pull request                       | full quality checks (install, static checks, tests) without deployment credentials |
| Default-branch commit, including R | full quality checks; in dual mode also build, deploy and verify Preview            |
| Version tag                        | tag validation, target build, deploy and light post-deploy confirmation            |

Tag runs do not rerun quality checks or tests. Release's pre-tag gate, R's successful default-branch checks (and in dual mode its Preview verification), is what makes skipping them safe. When the selected provider ref cannot build or deploy without a mandatory check step, keep only the minimal step the provider requires, record that difference in `RELEASE.md` as a known limitation, and continue; do not block setup or release on it.

Projects that compile environment values into their artifacts build once per target. Whether an artifact can be reused across targets depends on the project's build configuration and the provider's capabilities; Release does not require reuse.

## Events and gates

Generate only the selected branch-only, tag-only, or dual configuration. Separate PR quality checks from deployment jobs. Branch deployment must reject tag refs; tag deployment must reject branch refs. Do not offer an input that turns a branch run into Production. Retain an existing manual retry route only when project policy requires it and the same ref/identity gates apply; do not add a manual setup phase.

Before any tag-triggered build, upload or deployment, a gate must:

1. validate the exact project tag prefix and version grammar, including prereleases only when the project permits them;
2. resolve the peeled commit and prove reachability from the freshly fetched default branch;
3. verify the declared unit/version metadata at that commit against the tag mapping;
4. produce the validated version needed downstream, with every side-effect job depending on this gate.

The gate may be the provider's reusable validation or the project's own step. For a simple stable unit, the default identity is strict `vMAJOR.MINOR.PATCH`; a monorepo unit can have its own fixed prefix. A glob such as `v*.*.*` only filters events and is not validation. Checkout and build the validated tag commit, never the latest default branch. Feed untrusted event strings into shell steps via environment variables, not script interpolation.

Use distinct concurrency scopes for actual targets. Do not cancel an in-progress Production or data-sensitive deployment; a replaceable Preview run may cancel an older one, but cancellation is not evidence that the older release commit passed. Retain immutable code/artifact identity with each run so deployed content can be checked against R.

The authenticated push must produce the expected workflow event. A push made by an Actions run's repository `GITHUB_TOKEN` does not start a second push-triggered workflow; use an already authorized suitable identity if execution moves into Actions. Never silently introduce credentials or broaden permissions to work around a missing run.

## Deliveries that are not a user-facing release

Some targets deliver something other than a user-facing release, such as an upload that still awaits a separate review or publication step outside CI. Record and report that actual delivery and its verification as what it is; never relabel it as a website environment or a completed Production release.

## Notifications and diagnosis

Use notifications only where project policy already includes them, mapping their Secrets explicitly. Notification failure must not replace deployment status. Do not invent separate build/deploy results when the called interface exposes only a combined result.

Diagnose against the selected interface and the provider's documentation: inaccessible reusable workflows (ref and repository access), missing artifacts (same-run name/path), missing Secrets (explicit mapping and scope), queued jobs (runner access and readiness), and target-specific failures. Preserve failed real runs for same-ref recovery; do not reintroduce a manual onboarding pipeline.
