---
name: docs
description: "Document a project's durable truth or a user-specified project document from authoritative sources. Defaults to six catalog memories: spec, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, and README. Use when landed behavior or a settled decision should be recorded, an existing doc is wrong, or the user names a document to maintain. Not for making product/design decisions, implementation, project-wide audits (use doctor), or agent-invented documents."
---

# Docs

Docs records truth that is already established. It may maintain selected catalog memories or a concrete project document the user explicitly names; permission to document is not permission to invent a new target or product decision.

## Select the target progressively

If the user names a path, document type, or artifact, stay inside that target and purpose. Do not add sibling docs, indexes, changelogs, or release-note files.

Otherwise read `references/memory-catalog.md`, select only applicable targets, and then load only each selected file under `references/formats/`. The default catalog remains spec, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, and README; it is an index, not a checklist to populate.

Gather the minimum project evidence needed for those targets. Use Explore context when the project is unfamiliar; use Doctor for a project-wide drift audit.

## Keep authority visible

Valid authority includes an explicit user or maintainer decision, a user-reviewed Shape Design Summary for its settled claims, an associated plan decision or Spec delta whose basis is authoritative, verified landed behavior, an established API/Skill contract, or an explicit correction.

Code can establish current mechanics. It cannot by itself establish positioning, rationale, priority, intended future behavior, or other product intent. A summary, plan, code change, or merged artifact carries evidence and decisions from its sources; its existence does not create authority for an undisclosed claim. Do not propagate a superseded claim after its premise has been corrected. PRODUCT truth must already be decided; absent authority means omit that claim or stop at the exact decision boundary.

For a Spec delta, merge requirements by persistent name: add `ADDED`, replace `MODIFIED`, and remove `REMOVED`, then verify that the landed behavior supports the resulting contract. Preserve exactly one `Verify:` signal per requirement.

## Edit coherently

Preserve correct content and reshape the touched range into one coherent document rather than appending a corrective patch note. Keep current truth in ARCHITECTURE and DESIGN, already-decided future items in ROADMAP, and user-facing verified entry information in README. When an authorized change is a clean break, remove the superseded design from current truth rather than documenting both paths; describe compatibility or migration only when its authority is established.

Docs does not edit implementation or perform git/GitHub delivery. Report changed targets, truth recorded, authority used, and claims omitted for lack of authority, then stop.
