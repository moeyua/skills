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

Resolve topology and version policy from the fetched remote default branch: repository instructions, specifications, version/release documentation, code, tests, manifests, lockfiles, and committed release-tool configuration. History may validate a known tag template but must not invent topology, dependency propagation, metadata ownership, or version policy from filenames, tag increments, or commit-message patterns.

Determine whether the repository already defines version-bound repository release metadata and, when it does, resolve its unit/version mapping, existing structure and invariants, allowed paths, content basis or project generator, and validation evidence. Specifications, runtime consumption, tests, and release tooling can establish that relationship; a familiar changelog name or historical editing habit alone cannot.

Require a unique mapping from each in-scope package/version source to one unit; exact current and target states; every identity's tag template and covered units; tool-specific affected subset and target rules for each group; dependency propagation; any required repository metadata; and a deterministic release metadata transaction whose expected paths, semantic result, and git side effects are known.

Do not require a dedicated manifest, fixed filename, or shared schema. When the repository defines no version-bound repository release metadata, keep that part of the release set absent and do not create a file or placeholder. If applicable sources conflict, a package maps to multiple units, metadata ownership or content cannot be resolved, a tool hides the expected diff, or the topology cannot produce an exact set, report the sources and stop without mutation.

## Select the set

When the user supplied exact tags, map them through the topology. Treat them as confirmed only when their declared mapping visibly determines every target and identity, agrees with group/dependency rules, and does not silently authorize unresolved repository metadata.

When supplied tags require extra derived unit targets or identities, show the expanded exact release set. A propagated unit without its own tag is still an expansion and requires next-turn confirmation. Explicit approval of one tag does not silently authorize additional package releases.

Classify required repository metadata as already matching, user-supplied, project-deterministic, or Agent-derived. Reuse matching content and accept exact user input or deterministic project output as part of the mapped set. Agent-derived substantive user-visible content is an expansion: compose it from observable changes and the repository's established style, show the exact content and basis, and require confirmation of the complete set. Mechanical representation details that do not change the published meaning do not create another confirmation gate.

When the user did not provide a tag, resolve the authoritative project version policy applicable to every unit from repository instructions, versioning or release documentation, and committed release-tool configuration. That policy takes precedence over the generic SemVer mapping.

Only when no applicable authoritative project policy exists and ungrouped unit mapping is unambiguous, use highest observable impact: breaking behavior or side effect → major; backward-compatible capability → minor; backward-compatible fix → patch. Derive one candidate tag with SemVer for each resulting tag identity from changes since the latest release. Generic fallback must not invent group, aggregate, unchanged-member, or repository-metadata semantics.

An explicit tag chooses an exact target; it does not waive version validity. Validate the identity's version/sequence and every changed unit target against current and released versions plus project successor, prerelease, initial-version, group, and propagation rules. Under generic SemVer, each changed unit target must be strictly greater than both its current version and latest released unit version.

A covered member may equal its current version only when the authoritative project policy explicitly marks that unit unchanged; this does not count as identity-version reuse. Generic fallback must not invent aggregate or unchanged-member semantics. An unapproved equal target, lower target, or reused new identity version stops without mutation.

## Candidate and basis

Put the candidate in the final response with:

- every unit: current → target, including group or propagation reason;
- every identity: tag → covered units;
- applicable version-bound repository release metadata: target, state, exact substantive content when Agent-derived, and source identity; omit this item when not applicable;
- Version policy: <project sources | generic SemVer fallback>;
- the remote default-branch tip;
- latest Release identity for every tag identity and its peeled target, or first-release marker;
- unit targets and topology/policy/metadata source identities;
- Confirmation: awaiting confirmation of the whole set;
- Mutation: none.

Only a next user message that unambiguously confirms that candidate authorizes it; the user does not need to repeat the tags or shown metadata. Only that later user confirmation unlocks release mutation. Do not switch branches, change a version or repository metadata, commit, push, tag, or create a Release in the recommendation turn.

## Revalidate every path

For every path, record the remote default-branch tip whose committed tree supplied the initial topology, policy, unit versions, identity baselines, repository-metadata rules/content, and release set. Fetch that exact branch before switching branches or changing release metadata.

Immediately after fetch, re-resolve the topology, policy, unit versions, identity baselines, repository metadata, and release set from the fetched commit.

On a cross-turn candidate path, require the fetched remote tip to equal the recorded candidate-basis tip exactly and all baselines, targets, topology, policy, and repository-metadata identities to remain unchanged. A post-fetch basis mismatch invalidates the confirmation: recompute from the refreshed default branch, return the refreshed candidate in the final response, and end the turn.

For exact tags supplied in the current request, the candidate-basis equality gate does not apply, but post-fetch re-resolution does. Continue only when the supplied tags and repository-owned rules still determine the same complete set. If the refreshed mapping changes, metadata requires Agent-derived substantive content, or the set otherwise expands, return the refreshed proposal with zero mutation.
