# Release Set Model

Read this reference when release identity, version selection, or repository release metadata is not a trivial repository-defined mapping.

## Terms

- release unit: one authoritative version source, such as a package, independently versioned package, or root aggregate
- version group: a project-tool-defined coordination rule such as fixed or linked; membership does not imply one shared current version, target version, or affected subset
- tag identity: one exact tag and GitHub Release covering one unit or an aggregate
- version-bound repository release metadata: an existing repository-owned artifact whose content is keyed to a release unit/version and is required or delivered with that version
- release set: one or more exact unit target versions, one or more tag identities, and any required version-bound repository release metadata prepared by one transaction and one commit
- release topology: the committed mapping among workspace manifests, release units, version groups, tag templates, authoritative version sources, allowed metadata paths, version-bound repository release metadata, release-tool configuration, and dependency propagation

## Resolve repository-owned truth

Resolve topology and version policy from the fetched remote default branch: `RELEASE.md`, repository instructions, specifications, version/release documentation, code, tests, manifests, lockfiles, and committed release-tool configuration. Missing project rules route to project-policy.md and onboarding.md before a fresh release transaction. History may validate a known tag template but must not invent topology, dependency propagation, metadata ownership, or version policy from filenames, tag increments, or commit-message patterns.

Determine whether the repository already defines version-bound repository release metadata and, when it does, resolve its unit/version mapping, existing structure and invariants, allowed paths, content basis or project generator, and validation evidence. Specifications, runtime consumption, tests, and release tooling can establish that relationship; a familiar changelog name or historical editing habit alone cannot.

Require a unique mapping from each in-scope package/version source to one unit; exact current and target states; every identity's tag template and covered units; tool-specific affected subset and target rules for each group; dependency propagation; any required repository metadata; and a deterministic release metadata transaction whose expected paths, semantic result, and git side effects are known.

Beyond the project rules entry `RELEASE.md`, do not require a dedicated version manifest, fixed filename, or shared schema. The rules document is setup configuration, not version-bound release metadata to rewrite with every version. When the repository defines no version-bound repository release metadata, keep that part of the release set absent and do not create a file or placeholder. If applicable sources conflict, a package maps to multiple units, metadata ownership or content cannot be resolved, a tool hides the expected diff, or the topology cannot produce an exact set, report the sources and stop without mutation.

## Select the set

When the user supplied exact tags, map them through the topology. Treat them as confirmed only when their declared mapping visibly determines every target and identity, agrees with group/dependency rules, and does not silently authorize unresolved repository metadata.

When supplied tags require extra derived unit targets or identities, show the expanded exact release set. A propagated unit without its own tag is still an expansion and requires next-turn confirmation. Explicit approval of one tag does not silently authorize additional package releases.

Classify required repository metadata as already matching, user-supplied, project-deterministic, or Agent-derived. Reuse matching content and accept exact user input or deterministic project output as part of the mapped set. Agent-derived substantive user-visible content is an expansion: compose it from observable changes and the repository's established style, show the exact content and basis, and require confirmation of the complete set. Mechanical representation details that do not change the published meaning do not create another confirmation gate.

When the user did not provide a tag, resolve the authoritative project version policy applicable to every unit from repository instructions, versioning or release documentation, and committed release-tool configuration. That policy takes precedence over the generic SemVer mapping.

Only when no applicable authoritative project policy exists and ungrouped unit mapping is unambiguous, derive one candidate tag per resulting tag identity from the highest observable impact since the latest release, following Semantic Versioning 2.0.0:

- `0.y.z` is initial development (SemVer §4): a breaking change → minor; every other change → patch. SemVer does not prescribe increments below 1.0; this is the common caret-range convention.
- A `1.0.0` target declares the public API (SemVer §5). Use it only when the user explicitly declares or supplies it; never derive `1.0.0` from changes.
- From `1.0.0`: major only for an incompatible change to the declared public API (SemVer §8); patch only when the changes are all backward-compatible bug fixes (SemVer §6); otherwise minor. The public API is whatever the project declares in `RELEASE.md` or authoritative docs; Release does not decide on its own that a page, route, or behavior is public.
- When the public API is undeclared, propose no major; apply the same rule to give a minor or patch candidate, and report the missing declaration in the basis.
- Use a prerelease identity (SemVer §9) only when the project policy allows prereleases; an explicit user request outside that permission stops without mutation. Order versions by SemVer §11 precedence.

Generic fallback must not invent group, aggregate, unchanged-member, or repository-metadata semantics.

An explicit tag chooses an exact target; it does not waive version validity. Validate the identity's version/sequence and every changed unit target against current and released versions plus project successor, prerelease, initial-version, group, and propagation rules. A prerelease target is valid only when the project policy allows prereleases, and precedence follows SemVer §11. Under generic SemVer, each changed unit target must be strictly greater than both its current version and latest released unit version.

A covered member may equal its current version only when the authoritative project policy explicitly marks that unit unchanged; this does not count as identity-version reuse. Generic fallback must not invent aggregate or unchanged-member semantics. An unapproved equal target, lower target, or reused new identity version stops without mutation.

## Candidate and basis

Put the candidate in the final response with:

- every unit: current → target, including group or propagation reason;
- every identity: tag → covered units;
- applicable version-bound repository release metadata: target, state, exact substantive content when Agent-derived, and source identity; omit this item when not applicable;
- Version policy: <project sources | generic SemVer fallback>;
- Version stage: <0.y.z initial development | 1.0.0 and later | 1.0.0 declared by the user>;
- Public API source: <declaring project source | undeclared>;
- the remote default-branch tip;
- latest Release identity for every tag identity and its peeled target, or first-release marker;
- unit targets and topology/policy/metadata source identities;
- Confirmation: awaiting confirmation of the whole set;
- Mutation: none.

Only a next user message that unambiguously confirms that candidate authorizes it; the user does not need to repeat the tags or shown metadata. Only that later user confirmation unlocks release mutation. Do not switch branches, change a version or repository metadata, commit, push, tag, or create a Release in the recommendation turn.

## Revalidate every path

Reconcile an already-published or partial exact set with recovery.md before proposing fresh successors. A verified historical release commit is evaluated from its own committed topology and metadata, not treated as a new version transaction at the latest default tip. Report a conflict with current policy that affects a missing action instead of reinterpreting old identities.

For every fresh release path, record the remote default-branch tip whose committed tree supplied the initial topology, policy, unit versions, identity baselines, repository-metadata rules/content, and release set. Fetch that exact branch before switching branches or changing release metadata.

Immediately after fetch, re-resolve the topology, policy, unit versions, identity baselines, repository metadata, and release set from the fetched commit.

On a cross-turn candidate path, require the fetched remote tip to equal the recorded candidate-basis tip exactly and all baselines, targets, topology, policy, and repository-metadata identities to remain unchanged. A post-fetch basis mismatch invalidates the confirmation: recompute from the refreshed default branch, return the refreshed candidate in the final response, and end the turn.

For exact tags supplied in the current request, the candidate-basis equality gate does not apply, but post-fetch re-resolution does. Continue only when the supplied tags and repository-owned rules still determine the same complete set. If the refreshed mapping changes, metadata requires Agent-derived substantive content, or the set otherwise expands, return the refreshed proposal with zero mutation.
