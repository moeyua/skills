# MediaStorm CI Connection

Read for deployment setup. The selected published files in `mediastormDev/storminfra-frontend/.github/workflows/` are authoritative for inputs, outputs, Secrets and permissions; its README owns operational constraints. Read that ref's actual interfaces before generating callers. Project files own the real commands and runtime needs; project-policy.md owns the chosen release rules.

Use `@ci-v2` for normal published integration, never `@main` or caller `@refs/tags/...`. A full commit SHA is only for an explicitly authorized unpublished public-workflow validation. Public CI development itself is outside Release.

## Supported compositions

| Project output                        | Reusable workflows                    | Target facts                                                       |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| Static directory                      | build-static.yml → deploy-cos.yml     | bucket, region, prefix, URL and environment-specific build         |
| Single Docker image / Compose service | deploy-docker.yml                     | SSH host/user/port, target path, Compose and runtime configuration |
| Mini-program developer version        | build-static.yml → upload-miniapp.yml | AppID, artifact root, version and robot                            |

Use separate caller/artifact/tag/concurrency identities for independently released units. Do not chain unrelated units into one non-rerunnable deployment. Network location does not select a different Docker workflow. A project without deployment has no caller from this table.

Pass project-native commands explicitly rather than adopting shared defaults that change the toolchain. Map each named Secret; never use `secrets: inherit`. Keep non-sensitive destinations in version-controlled inputs. Never place Secret values, private keys, `.env` contents or credentials in Git, logs or artifacts.

## Events and gates

Generate only the selected branch-only, tag-only, or dual configuration. Separate PR quality checks from deployment jobs. Branch deployment must reject tag refs; tag deployment must reject branch refs. Do not offer an input that turns a branch run into Production. Retain an existing manual retry route only when project policy requires it and the same ref/identity gates apply; do not add a manual setup phase.

Before any tag-triggered build, upload or deployment, a gate must:

1. validate the exact project tag prefix and version grammar, including prereleases only when the project permits them;
2. resolve the peeled commit and prove reachability from the freshly fetched default branch;
3. verify the declared unit/version metadata at that commit against the tag mapping;
4. produce the validated version needed downstream, with every side-effect job depending on this gate.

For a simple stable unit, the default identity is strict `vMAJOR.MINOR.PATCH`; a monorepo unit can have its own fixed prefix. A glob such as `v*.*.*` only filters events and is not validation. Checkout and build the validated tag commit, never the latest default branch. Feed untrusted event strings into shell steps via environment variables, not script interpolation.

Use distinct concurrency scopes for actual targets. Do not cancel an in-progress Production or data-sensitive deployment; a replaceable Preview run may cancel an older one, but cancellation is not evidence that the older release commit passed. Retain immutable code/artifact identity with each run so deployed content can be checked against R.

The authenticated push must produce the expected workflow event. A push made by an Actions run's repository `GITHUB_TOKEN` does not start a second push-triggered workflow; use an already authorized suitable identity if execution moves into Actions. Never silently introduce credentials or broaden permissions to work around a missing run.

## Static site

Build through `build-static.yml`, supplying the project's working directory, runtime, install/check/test/build commands, artifact path and unique artifact name. The output must be non-empty and inside the working directory. The build and COS deployment share one run; use the build's artifact-name output.

`deploy-cos.yml` accepts a string `environment`, plus artifact name, `cos_bucket`, `cos_region`, `cos_path` and optional cache-purge inputs. Map `TENCENT_SECRET_ID` and `TENCENT_SECRET_KEY` explicitly. In dual mode, use distinct Preview/Production destinations and the correct build configuration, never only a different display label.

COS uploads overwrite matching objects but do not remove unrelated remote extras. When cache purge is enabled, supply the actual `eo_url`; let the shared workflow resolve the zone unless list permission is unavailable and an approved exact zone ID is known. Verify the served site and its content identity, not only upload success.

## Docker service

`deploy-docker.yml` owns quality checks, build, GHCR push and deployment of an exact image digest. Grant its required `contents: read` and `packages: write`; do not invent image-name, tag, remote-command or Compose-command overrides. The interface has no `environment` input: the caller's chosen host/path and configuration establish the environment.

Use the existing supported mode appropriate to the project, not a newly invented compatibility path:

- Image-only mode uses the existing target Compose configuration. Verify its default Compose file, writable regular non-symlink `.env`, current `APP_IMAGE` when replacing a deployment, and `docker compose --env-file .env config --quiet`. It must resolve exactly one image from the workflow-owned `APP_IMAGE` and have a real service healthcheck.
- Managed configuration mode uses `managed_config: true`, a default-named `compose_file` inside the project, and the explicitly mapped `RUNTIME_ENV_FILE` Secret. Read the selected workflow's contract for `${APP_IMAGE}` and `${APP_ENV_FILE}`; the complete runtime dotenv must exclude workflow-owned `APP_IMAGE`. Validate the approved writable target parent, non-symlink target paths, one service/image, healthcheck, and persistent volumes before connecting it. Do not print or move that Secret into a caller artifact.

Only set `docker_target` when the Dockerfile has an intentional final stage. It selects a build stage, not a server or environment. Preserve data and volumes; the shared workflow owns temporary credentials and configuration promotion.

For either mode, confirm the repository's access to the `internal-deploy` runner group, runner readiness, allowed workflow, SSH reachability and administrator-verified host key, Docker-capable target account, and GHCR pull access. Runner-group Workflow access uses `mediastormDev/storminfra-frontend/.github/workflows/deploy-docker.yml@refs/tags/ci-v2`; the caller still uses `@ci-v2`. Do not change organization access or host trust without corresponding authority. Observe the returned image digest and real service health.

## Mini-program developer upload

Build through `build-static.yml`, then pass its artifact to `upload-miniapp.yml`. The artifact root must contain `project.config.json` with the expected AppID. Map `WECHAT_MINIAPP_PRIVATE_KEY`, pass the validated supported plain version, and use a robot in the supported range 1–30. The upload key's IP policy must match the runner's egress; do not silently relax it.

The shared workflow uploads a developer version only. It creates no preview, submits no review and performs no official publication. It has no GitHub Environment binding. Verify the uploaded developer-version identity and report that result without claiming Production launch. Do not force the dual website mapping onto this target.

## Existing notifications and diagnosis

Where project policy already includes notifications, use `notify-release.yml` with explicit `FEISHU_WEBHOOK_URL` mapping and actual job outcomes. Do not introduce notification recipients merely to connect CI. Notification failure must not replace deployment status. Do not invent separate build/deploy results when the called interface exposes only a combined result.

Diagnose against the selected interface: an inaccessible reusable workflow needs ref/repository access checks; missing artifacts need same-run name/path checks; missing Secrets need explicit mapping and repository scope; queued Docker needs runner access/readiness; SSH needs host/user/path/trust checks; COS cache purge needs URL/zone permissions; mini-program upload needs AppID/version/key/IP checks. Preserve failed real runs for same-ref recovery; do not reintroduce a manual onboarding pipeline.
