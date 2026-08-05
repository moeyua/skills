# Release Set Model

Read this reference when release identity or version selection is not a trivial, repository-defined single-package mapping.

## Terms

- release unit: one authoritative version source, such as a package, independently versioned package, or root aggregate
- version group: a project-tool-defined coordination rule such as fixed or linked; membership does not imply one shared current version, target version, or affected subset
- tag identity: one exact tag and GitHub Release covering one unit or an aggregate
- release set: one or more exact unit target versions plus one or more tag identities prepared by one transaction and one commit
- release topology: the committed mapping among workspace manifests, release units, version groups, tag templates, authoritative version sources, allowed metadata paths, release-tool configuration, and dependency propagation

## Resolve repository-owned truth

Resolve topology and version policy from the fetched remote default branch: repository instructions, version/release documentation, manifests, lockfiles, and committed release-tool configuration. History may validate a known tag template but must not invent topology, dependency propagation, or version policy from tag increments or commit-message patterns.

Require a unique mapping from each in-scope package/version source to one unit; exact current and target states; every identity's tag template and covered units; tool-specific affected subset and target rules for each group; dependency propagation; and a deterministic version transaction whose expected paths and git side effects are known.

If applicable sources conflict, a package maps to multiple units, a tool hides the expected diff, or the topology cannot produce an exact set, report the sources and stop without mutation.

## Select the set

When the user supplied exact tags, map them through the topology. Treat them as confirmed only when their declared mapping visibly determines every target and identity and agrees with group/dependency rules.

When supplied tags require extra derived unit targets or identities, show the expanded exact release set. A propagated unit without its own tag is still an expansion and requires next-turn confirmation. Explicit approval of one tag does not silently authorize additional package releases. End the current turn after that final response.

When the user did not provide a tag, resolve the authoritative project version policy applicable to every unit from repository instructions, versioning or release documentation, and committed release-tool configuration. That policy takes precedence over the generic SemVer mapping.

Only when no applicable authoritative project policy exists and ungrouped unit mapping is unambiguous, use highest observable impact: breaking behavior or side effect → major; backward-compatible capability → minor; backward-compatible fix → patch. Derive one candidate tag with SemVer for each resulting tag identity from changes since the latest release. Generic fallback must not invent group, aggregate, or unchanged-member semantics.

An explicit tag chooses an exact target; it does not waive version validity. Validate the identity's version/sequence and every changed unit target against current and released versions plus project successor, prerelease, initial-version, group, and propagation rules. Under generic SemVer, each changed unit target must be strictly greater than both its current version and latest released unit version.

A covered member may equal its current version only when the authoritative project policy explicitly marks that unit unchanged; this does not count as identity-version reuse. Generic fallback must not invent aggregate or unchanged-member semantics. An unapproved equal target, lower target, or reused new identity version stops without mutation.

## Candidate and basis

Put the candidate in the final response with:

- every unit: current → target, including group or propagation reason;
- every identity: tag → covered units;
- Version policy: <project sources | generic SemVer fallback>;
- the remote default-branch tip;
- latest Release identity for every tag identity and its peeled target, or first-release marker;
- unit targets and topology/policy source identities;
- Confirmation: awaiting confirmation of the whole set;
- Mutation: none.

Only a next user message that unambiguously confirms that candidate authorizes it; the user does not need to repeat the tags. Only that later user confirmation unlocks release mutation. Do not switch branches, change a version, commit, push, tag, or create a Release in the recommendation turn.

## Revalidate every path

For every path, record the remote default-branch tip whose committed tree supplied the initial topology, policy, unit versions, identity baselines, and release set. Fetch that exact branch before switching branches or changing versions.

Immediately after fetch, re-resolve the topology, policy, unit versions, identity baselines, and release set from the fetched commit.

On a cross-turn candidate path, require the fetched remote tip to equal the recorded candidate-basis tip exactly and all baselines, targets, topology, and policy identities to remain unchanged. A post-fetch basis mismatch invalidates the confirmation: recompute from the refreshed default branch, return the refreshed candidate in the final response, and end the turn.

For exact tags supplied in the current request, the candidate-basis equality gate does not apply, but post-fetch re-resolution does. Continue only when the supplied tags' declared mappings still determine the same exact unit targets and identities. If the refreshed mapping changes or expands the set, return the refreshed proposal with zero mutation.
