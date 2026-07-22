---
name: docs
description: "Document a project's durable truth or a user-specified project document from authoritative sources. Defaults to six catalog memories: spec, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, and README. Use when landed behavior or a settled decision should be recorded, an existing doc is wrong, or the user names a document to maintain. Not for making product/design decisions, implementation, project-wide audits (use doctor), or agent-invented documents."
when_to_use: "document, docs, record, source of truth, behavior contract, product memory, architecture memory, roadmap, 记忆, 文档, 真源, 记录, 沉淀, 行为契约, 更新文档"
dispatch_intent: "Record already-established project truth in the right durable memory or named document"
---

# Docs

Docs records truth that has already been established. Its default surface is the six-type memory catalog; an explicitly named project document is a separate, user-authorized lane.

<HARD-GATE>
Docs may write PRODUCT only from already-decided product truth. It never makes a product decision, infers intent from implementation, invents a catalog-external target, edits code, or performs git/GitHub delivery.
</HARD-GATE>

Before choosing a target, read `references/memory-catalog.md`. Read `references/anti-patterns.md` and `references/durable-context.md` once per session if they are not already in context. When project facts are insufficient, use explore in context mode at proportional depth; this improves evidence but never substitutes for the target's authoritative Source.

## Outcome Contract

- Outcome: one or more authorized document targets reflect current, durable project truth
- Done when: each target follows its catalog format or the user's named purpose, and every substantive claim has an authoritative source
- Evidence: already-decided user/shape conclusions, a plan delta or key decision, landed behavior and verification, authoritative API/skill contracts, existing docs, and the before/after target
- Output: files changed + target type + truth recorded + source used + anything omitted for lack of authority

## Choose the lane and target

The default lane is catalog memory:

| type         | default location             | load                                 |
| ------------ | ---------------------------- | ------------------------------------ |
| spec         | `specs/<domain>/spec.md`     | `references/formats/spec.md`         |
| PRODUCT      | `PRODUCT.md`                 | `references/formats/product.md`      |
| ARCHITECTURE | `ARCHITECTURE.md`            | `references/formats/architecture.md` |
| DESIGN       | `DESIGN.md`                  | `references/formats/design.md`       |
| ROADMAP      | `ROADMAP.md`                 | `references/formats/roadmap.md`      |
| README       | `README.md` / localized pair | `references/formats/readme.md`       |

Use the catalog's Purpose, When needed, Source, and Boundary to select only targets that earned a durable place. Do not create a heading or file merely because the catalog permits it.

The explicit-document lane applies only when the user names a path, document type, or concrete artifact outside this catalog. Keep the change inside that target and purpose; do not add sibling docs, indexes, changelogs, or release-note files on your own.

## Source discipline

An authoritative source can be the user's explicit decision, a grounded shape conclusion, an associated plan, a verified landed change, an existing contract, or an explicit correction. Code may confirm a claim; it does not reveal why the product should work a certain way.

When authority is absent, stop on that claim. Do not pad empty sections, reverse-engineer intent, or turn a plausible inference into durable truth.

### PRODUCT

PRODUCT records positioning, philosophy, and boundaries after those decisions exist. Docs may synthesize the user's settled statements or a shape conclusion into the product format, and may apply a correction whose intended wording/meaning is clear. If the request asks docs to choose the product direction, value, or boundary, return that specific unresolved decision to conversation/shape instead of writing it.

### spec

For a plan with `## Spec delta`, merge by persistent requirement name:

| delta section              | action                                                                  |
| -------------------------- | ----------------------------------------------------------------------- |
| `## ADDED Requirements`    | append to the named domain, creating its Purpose when the domain is new |
| `## MODIFIED Requirements` | replace the same-named requirement and retain a short previous note     |
| `## REMOVED Requirements`  | remove the same-named requirement                                       |

Read the landed behavior and verification evidence to ensure the delta is true. If no delta exists, docs can still correct or backfill a spec from an explicit behavior contract, established skill/API documentation, or the maintainer's stated truth. It must not infer a product contract from code alone. Each requirement uses the project's language and carries one `Verify:`.

### Other catalog memories

- ARCHITECTURE records current structure and already-decided technical choices, not future plans.
- DESIGN records established visual identity, not interaction behavior or architecture.
- ROADMAP records already-decided future items without docs inventing priority or dates.
- README projects PRODUCT/ARCHITECTURE and verified usage into a concise external entry; it does not invent positioning.

## Editing discipline

Preserve correct existing content. Reshape the touched range so the result reads as one coherent document rather than appending a patch note. Use the lightest format that holds the truth: most specs are a few behavior-first requirements; higher-risk contracts need more detail only where ambiguity costs something.

For corrections, edit the named wrong claim directly from the supplied authority. For backfill, use a defined behavior source such as an established SKILL.md, API contract, or maintainer statement. If only implementation exists and meaning would require inference, stop and ask.

## Boundaries

- shape resolves product/design intent; docs records the resulting durable truth.
- plan describes one change's implementation handoff; docs describes the project as it now is.
- implement writes code/tests; check judges a change; doctor detects project-wide drift; converge batch-aligns the whole catalog. Docs remains the focused writer.
- Every skill is independently invoked. Docs neither requires those skills to have run nor invokes publish/release afterward.

## Report

Report each changed path, its catalog/explicit target, what was added/modified/removed, and the authority used. State when no update was warranted or a claim was omitted. Then stop; the user decides what capability to invoke next.
