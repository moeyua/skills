# Spec format — `specs/<domain>/spec.md`

The persistent behavior contract: what the system _currently is_, organized by domain — a logical grouping (`auth/`, `payments/`, `search/`), by feature area, component, or bounded context.

## Sections

```markdown
# <Domain> Specification

## Purpose

One or two lines: what this domain is.

## Requirements

### Requirement: <name>

The system SHALL <observable behavior>.
Verify: [<test name>](relative/path/to/test)

### Requirement: <name of an un-automatable behavior>

The system SHALL <observable behavior>.
Verify: manual(visual)
```

- **Requirements are the "what"** — observable behavior, inputs, outputs, error conditions, external constraints (security / privacy / reliability / compatibility). RFC 2119 keywords carry intent: **SHALL/MUST** absolute, **SHOULD** recommended, **MAY** optional. (This is the target system's contract — not this suite's prose style; SKILL.md prose still avoids MUST walls.)
- **`Verify:` says how each requirement is checked** — exactly one line per requirement, one of three forms:
  - `Verify: [name](path)` — a markdown link to the test that verifies it; the given/when/then detail lives in that test, not duplicated here.
  - `Verify: manual(visual)` — a perceptual judgment only a human can make (looks/feels right). Irreducible.
  - `Verify: manual(integration)` — testable in principle, but the only test would be too slow or flaky to trust; a candidate to push down into a cheap test later.
  - A test link is validated by `checkMarkdownLinks`, so a deleted or moved test becomes a red build — free drift protection. `manual(...)` carries no link, and that absence is itself the honest signal the requirement is not automatically verified.

## Source

Use an authoritative behavior contract, explicit user correction, or the plan's `## Spec delta`. Merge a supplied delta by requirement name: `ADDED` append, `MODIFIED` replace the same-named requirement, `REMOVED` delete. Read the landed behavior alongside that authority to confirm the contract matches what was built. A missing delta is not an entry gate when the requested correction already has authority. An unresolved MODIFIED/REMOVED identity blocks that requirement, not unrelated valid changes. Do not invent intended behavior from code, preserve superseded behavior as a historical note in the current contract, or silently rename an unmatched requirement.

## Boundary

The test for what belongs: if the implementation can change without changing externally visible behavior, it does not belong here. Internal class/function names, library choices, and step-by-step implementation are out — those live in the plan or the code. Keep it Lite by default (a few behavior-first requirements); go Full only for higher-risk changes (API/contract, migration, security).
