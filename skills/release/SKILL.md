---
name: release
description: "Create release sets on the remote default branch, then tags and GitHub Releases for single-package and monorepo repositories. Use when the user requests a release or tag; explicit tags execute directly only when they visibly determine the full set, while missing or derived units/identities produce a project-policy-first SemVer candidate for next-turn confirmation. Not for deployment, rollback, registry publishing, artifacts, automatic PRs, non-GitHub releases, or ambiguous version transactions."
when_to_use: "release, create release, tag release, github release, publish version, monorepo release, workspace release, 发版, 发布版本, 打 tag, release notes"
dispatch_intent: "Resolve or recommend and confirm one exact release set, then prepare its default-branch version commit, tags, and GitHub Releases"
---

# Release

Release either recommends one exact release set and pauses for confirmation, or turns user-supplied/confirmed identities into one ordered, recoverable GitHub release. Model every repository through release units, version groups, and tag identities so the same workflow handles a single package, a fixed or linked version group, and an independently versioned package.

<HARD-GATE>
Release requires one unambiguous release topology and one verified non-tagging version transaction. That transaction must also be non-committing and non-publishing: it may change only declared working-tree metadata and must not stage files or change git history/refs. The topology must identify every release unit, project-defined version group, tag identity/template, authoritative version source, allowed version-metadata path, version command/git-side-effect configuration, and dependency propagation rule involved in the release set. Any agent-derived unit target or identity is only a recommendation: return the whole set visibly and wait for the next user message before any mutation. That confirmation authorizes only the recorded candidate basis; a changed default tip, identity baseline, topology, or policy identity requires a refreshed recommendation. Never force-push, rewrite history, move/delete a tag or Release, create a PR, deploy, roll back, upload artifacts, generate changelog/release-note files, or publish a registry package.
</HARD-GATE>

Read `references/anti-patterns.md` and `references/durable-context.md` once per session when they are not already in context.

## Outcome Contract

- Outcome: one exact release set is either recommended for next-turn confirmation without mutation, or published through one version commit plus every exact tag and GitHub Release
- Done when: a visible release set is awaiting confirmation, every identity already exists and verifies, or every missing commit/branch/tag/Release stage is completed and reported
- Evidence: release topology, per-unit current/target versions, per-identity Release baselines, applied version policy, candidate-basis identities, unchanged-basis revalidation, version-transaction diff, default-branch ancestry, and per-identity tag/Release state
- Output: proposed release set + topology/policy + candidate basis + per-unit SemVer reason + awaiting-confirmation state; or version transaction + release commit + branch push + per-identity tag/Release/notes state, including precise partial failure

## Model the repository

Use these terms consistently:

- **release unit:** one authoritative version source, usually a single package, an independently versioned package, or a repository/root aggregate
- **version group:** a project-tool-defined coordination constraint over release units, such as fixed or linked; group membership does not imply one shared current version, one target version, or that every member belongs to the affected subset unless the authoritative policy says so
- **release identity:** one exact tag and GitHub Release mapping to one unit or an aggregate of units
- **release set:** one or more exact unit target versions plus one or more tag identities, prepared by one version transaction and one release commit
- **release topology:** the committed mapping among workspace packages, release units, version groups, tag identities/templates, version sources, allowed metadata paths, version commands, and dependency propagation

Resolve the remote default branch first. Inspect its committed state through read-only Git/GitHub queries; do not derive a release from an unmerged branch or dirty working tree.

Gather at least:

```bash
git status --short
git branch --show-current
git remote -v
git tag --list --sort=-version:refname
git ls-remote --heads --tags origin
gh auth status --active --hostname github.com
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
gh release list --limit 100 --json tagName,isDraft,isPrerelease,publishedAt
```

Resolve the release topology from repository instructions, versioning/release documentation, root and workspace manifests, lockfiles, and committed release-tool configuration. Inspect enough Release/tag history to find the latest Release identity for every tag identity in scope. A root manifest with workspace declarations is discovery input, not automatically the version authority.

Require all of these facts before deriving or executing a release:

- every package/version source in scope maps to exactly one release unit;
- every unit has one authoritative current version and one exact target or explicit unchanged state;
- every tag identity has one exact tag template and declares the units it covers;
- every fixed, linked, or other version group declares its tool-specific affected-member and target-version rules;
- independent units keep distinct versions, while grouped units retain their own member-level current/target versions unless policy explicitly synchronizes them;
- dependency propagation says whether and how an internal dependency bump adds or changes dependent units;
- one verified non-tagging version transaction changes every confirmed changed unit, preserves every policy-declared unchanged unit, and changes only declared package-manager/release-tool-owned version metadata;
- the transaction must not stage files, create commits, or change branches/tags/other refs;
- at least one exact tag identity covers the release set; units changed only for declared dependency/group propagation remain visible even when policy gives them no tag;
- the transaction neither creates tags nor publishes, deploys, or generates changelog/release-note files.

The transaction may be one command or a repository-declared deterministic command sequence. Resolve its exact expected paths, semantic changes, and git-side-effect settings before running it. Verify command behavior and commit/staging configuration from the installed CLI or authoritative documentation rather than assuming similar package managers behave alike; if self-commit/staging cannot be disabled and verified, stop without mutation. Record canonical `HEAD`, index, and relevant branch/tag refs immediately before execution, then require that HEAD, index, and refs remain unchanged afterward. For an established single-package npm/pnpm repository, examples include:

```bash
pnpm version <version> --no-git-tag-version
npm version <version> --no-git-tag-version
```

Do not infer release topology, dependency propagation, or version policy only from historical tag increments or commit-message patterns. Do not assign semantics from labels alone: for example, a linked group can keep different current versions and release only an affected subset. History may validate an already-resolved tag template, but it does not invent one. If applicable sources conflict, a package maps to multiple units, a tool hides the expected diff, or the topology cannot produce an exact set, report the sources and stop without mutation.

## Resolve or recommend the release set

Follow exactly one path:

- When the user supplied an exact tag in the current request, map it through the release topology and treat it as the confirmed release identity. Continue in this turn only when that identity's declared mapping fully and visibly determines every unit target and tag identity in the release set without group or dependency rules adding an unexpressed target.
- When the user supplied multiple exact tags, treat them as a confirmed set only when their declared mappings uniquely and visibly determine every unit target and identity and agree with fixed/linked and dependency propagation rules.
- When supplied tags require extra derived unit targets or identities, show the expanded exact release set and end the turn for confirmation. A propagated unit without its own tag is still an expansion and requires next-turn confirmation; explicit approval of one tag does not silently authorize additional package releases.
- When a previous release turn proposed one candidate set and the next user message unambiguously confirms that candidate, treat it as confirmed subject to candidate-basis revalidation; the user does not need to repeat the tags. Only that later user confirmation unlocks release mutation.
- When the user did not provide a tag, derive every selected unit's candidate target and one candidate tag with SemVer for each resulting tag identity from its applicable baseline and changes since the latest release, then combine them into one exact candidate release set.

An explicit tag chooses an exact target; it does not waive version validity. Before treating any absent identity as a new release, decode and validate the identity's version/sequence plus every unit target against authoritative current versions, relevant identity/unit baselines, and the project's successor, version-group, initial-version, and prerelease rules. The new identity must be a policy-valid successor that does not reuse an existing identity version, and every changed unit target must be an allowed forward successor. A covered member may equal its current version only when the authoritative project policy explicitly marks that unit unchanged; this does not count as identity-version reuse. Under generic SemVer, each changed unit target must be strictly greater than both its current version and latest released unit version, and generic fallback must not invent aggregate or unchanged-member semantics. An unapproved equal target, lower target, or reused new identity version stops without mutation. Exact existing-identity and recovery states remain governed by the predicates below.

Before deriving a candidate, resolve the authoritative project version policy applicable to every unit and identity from repository instructions, versioning or release documentation, and committed release-tool configuration. An applicable, unambiguous project policy takes precedence over the generic SemVer mapping. Apply its version-group selection/target rules, tag aggregation, bump rules, prerelease rules, initial-version rule, and dependency propagation.

Only when no applicable authoritative project policy exists, use the generic highest-observable-impact fallback per unit:

- breaking behavior or side effects → major
- backward-compatible capability → minor
- backward-compatible fix → patch

For independently governed units, classify each against its own baseline. A project-defined version group requires authoritative selection and target rules; generic fallback must not guess whether all members move, which affected subset releases, or whether target versions synchronize. Use generic fallback only when changed paths and internal dependency effects map unambiguously to exact ungrouped units and tag identities; otherwise stop without mutation. Follow each resolved tag template.

For a derived candidate, record the remote default-branch tip, latest Release identity for every tag identity, every baseline tag's peeled target (or an explicit first-release marker), every unit's current/target version, and applied topology/policy identity. The topology/policy identity includes committed source paths and content identities, or an explicit generic-fallback marker.

Put the candidate in the final response with:

- every `unit: current → target` plus its version-group/propagation reason;
- every `identity: tag → covered units`;
- applied project-policy sources or generic fallback;
- per-unit SemVer reasons and change evidence;
- default branch/tip, per-identity Release baselines/targets, and topology/policy identities;
- `Confirmation: awaiting confirmation of the whole set`;
- `Mutation: none`.

Ask the user to confirm the whole set. End the current turn after that final response. Do not switch branches, change a version, commit, push, tag, or create a GitHub Release in the recommendation turn.

## Revalidate the release set before mutation

For every path, record the remote default-branch tip whose committed tree supplied the initial topology, policy, unit versions, and identity baselines. Fetch that exact branch before switching branches or changing versions:

```bash
git fetch origin <default-branch>
```

Immediately after fetch, re-resolve the topology, policy, unit versions, identity baselines, and release set from the fetched commit before any mutation:

- On a cross-turn candidate path, require the fetched remote tip to equal the recorded candidate-basis tip exactly and every per-identity baseline, unit target, topology, and policy identity to remain unchanged. A post-fetch basis mismatch invalidates the confirmation: recompute from the refreshed default branch, return the refreshed candidate in the final response, and end the turn. Require a new confirmation even when the resulting versions and tags are textually unchanged.
- On a fully determining tag set supplied explicitly in the current request, the candidate-basis equality gate does not apply, but post-fetch re-resolution does. Continue in the same turn only when the supplied tags' declared mappings still determine the same exact unit targets and identities, every target still passes the successor rules, and no group/dependency rule adds a target. If the refreshed mapping changes or expands the set, show the refreshed exact release set with `Mutation: none`, end the turn, and require next-turn confirmation.

## Preflight existing identities

Require an `origin` GitHub remote, working `gh` authentication, and a resolvable remote default branch before mutation. For each release identity, query its local tag, remote tag/peeled target, and GitHub Release:

```bash
gh release view <tag> --json url,tagName,isDraft,isPrerelease
```

Reconcile independently:

- existing Release → verify tag target, remote-default reachability, and every covered unit version in that committed tree; retain its URL/state
- existing tag without Release → reuse only when its peeled target is remote-default-reachable and every covered unit has the expected version
- local and remote targets differ, or a target/version is wrong → stop without moving, deleting, or overwriting anything
- historical tag version differs from its unit identity → report the inconsistency; never create a compensating commit

Before returning any fully or partially existing set, require that all existing identities point to the same verified release commit and that its tree satisfies every confirmed unit target and group/propagation constraint. If all identities then have verified Releases, return them without mutation. Otherwise resume only the missing identities.

## Return to or recover on the remote default branch

A dirty tree or diverged default branch stops before mutation unless it is the narrow version-diff recovery state below. Never stash, discard, broadly commit, or carry user changes merely to release.

One validated version diff may resume after a prior version transaction succeeded but its commit failed. Accept it only when:

- the caller is already on `<default-branch>` and local `HEAD` equals the fetched remote tip;
- the index/tree has no conflict or untracked path;
- every changed path is in the resolved allowed metadata paths;
- the semantic diff produces exactly the confirmed unit versions and declared dependency metadata, with no extra release unit or content change.

For a clean tree with an existing local default branch, fetch, pass any candidate equality gate, then:

```bash
git switch <default-branch>
```

Resolve `<default-branch>` from GitHub; never hardcode `main`. Classify local history against the fetched remote tip:

- equal → continue
- strictly behind → run `git merge --ff-only origin/<default-branch>` and require the resulting commit to equal the fetched tip
- one validated local release commit ahead → allow recovery only when its parent is the fetched remote default tip and it satisfies the release-commit predicate; retry only the default-branch push
- any other ahead/diverged state → stop before changing metadata, pushing, or tagging

## Reconcile or create the release commit

Define `<release-set-label>` deterministically from the topology. For one identity it is exactly `<tag>`; otherwise use the stable unit order and exact tags declared by policy. The release-commit predicate accepts a commit only when:

- it is a normal single-parent commit whose subject is exactly `chore(release): <release-set-label>`;
- every authoritative version source in the release set equals its target;
- every project-defined version-group invariant and declared dependency propagation result holds;
- changed paths are non-empty and all belong to the resolved allowed version-metadata paths;
- its semantic diff against its parent changes only the confirmed versions and declared package-manager/release-tool-owned dependency metadata.

Path matching alone is insufficient. Apply the release-commit predicate to every fresh commit, local-ahead recovery, and remote commit reuse.

Read every unit version on the synchronized default branch:

- one validated version diff exists → do not rerun the transaction; resume at complete/staged-diff verification
- all targets already exist in one unique matching release commit → reuse it
- all targets exist but no unique matching commit exists → stop on ambiguous state
- otherwise → run the one verified non-tagging version transaction

After the transaction, first require that HEAD, index, and refs remain unchanged. Then require the complete working-tree diff to update every confirmed changed unit, preserve every policy-declared unchanged unit, and touch only declared metadata. Stage only the resolved explicit paths, inspect the staged semantic diff, and create one normal commit without bypassing hooks:

```bash
git commit -m "chore(release): <release-set-label>"
```

For the single-identity case this resolves exactly to:

```bash
git commit -m "chore(release): <tag>"
```

After `git commit`, validate `HEAD` with the release-commit predicate. For a fresh commit, also require its parent to equal the fetched remote tip and the tree/index to be clean. If a hook or post-commit check changes the outcome, retain and report the local state but stop before push/tag creation; never amend, discard, or normalize automatically.

Push and verify the default branch:

```bash
git push origin <default-branch>:<default-branch>
```

Never force, change upstream/configuration, or convert rejection into an automatic PR. Query the remote branch once and require the release commit to be reachable before creating any tag.
Never create the tag until the remote default branch contains `<release-commit>`; for a multi-identity set, this gate applies to every tag.

## Publish tags and GitHub Releases

For each release identity in deterministic topology order:

1. Reconcile local/remote tag state independently.
2. Reuse matching tags; fetch remote-only tags for verification.
3. If absent, create one annotated tag at `<release-commit>` and push only its exact ref:

   ```bash
   git tag -a <tag> <release-commit> -m "Release <tag>"
   git push origin refs/tags/<tag>
   ```

4. Verify the remote peeled target equals `<release-commit>`.
5. Create the missing normal GitHub Release with generated notes:

   ```bash
   gh release create <tag> --verify-tag --generate-notes --title <tag> --notes-start-tag <identity-baseline-tag>
   ```

Omit `--notes-start-tag` only for an explicit first-release baseline. Using `--notes-start-tag <identity-baseline-tag>` keeps each tag identity's generated comparison anchored to its own prior Release; generated notes can still include repository-wide commits in that range. Do not synthesize or write notes files. Add `--prerelease` only when explicitly requested or required by authoritative project policy.

GitHub-generated notes are the release notes for each identity.

Record each tag and Release independently. If one identity fails after earlier identities succeeded, preserve all completed objects, stop at that identity, and resume only the missing identities on retry.

## Partial failure and recovery

Treat every mutation as a durable recovery point:

- version transaction succeeds but commit fails → keep and report the exact validated/unvalidated diff
- version transaction unexpectedly stages or commits → preserve and report exact HEAD/index/ref state; stop without adding another commit or tag
- release commit succeeds but post-commit validation fails → keep and report local commit/status; do not push or tag
- release commit succeeds but branch push fails → keep and report it; do not create tags
- branch push succeeds but a tag fails → retain the remote commit and every prior tag/Release
- tag push succeeds but its Release fails → do not delete the tag; report the exact completed identity and error
- an external result is ambiguous → query that canonical branch/tag/Release identity once; never blindly retry

On retry, reuse only states satisfying the same predicates. A verified remote release commit means do not repeat the version transaction or commit. Verified tags/Releases are likewise reused. Never fake atomic rollback; recover by continuing from canonical state.

Return:

```text
Release: proposed | created | existing | partial | no-op
Release set:
Units:
- <unit>: <old → target> — <group/propagation reason + state>
Tag identities:
- <identity>: <tag> → <covered units> — <proposed reason | actual state>
Version policy: <project sources | generic SemVer fallback>
Candidate basis: <default branch@tip + per-identity Release@target + unit targets + topology/policy identities, proposed only>
Confirmation: awaiting confirmation of the whole set | confirmed
Default branch: <branch> (local/remote state)
Version transaction: <command/paths + state>
Release commit: <commit/state>
Branch push: <verified | failed/skipped reason>
Identity states:
- <identity>: <tag> → <covered units> @ <commit>; tag <local/remote state>; Release <URL/state>; notes <generated/existing/not created>
Excluded: no deployment, rollback, changelog, artifact upload, registry publish, or automatic PR
```

For `proposed`, report `Mutation: none` and stop the turn. After a completed Release outcome, do not merge a PR, deploy, publish a package, or start another skill.
