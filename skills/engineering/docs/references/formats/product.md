# Product format — `PRODUCT.md`

The project's durable product judgment: why it exists, the principles used to make trade-offs, and the boundaries that keep its scope coherent. Audience is maintainers and future agents.

## Sections

- **Title + positioning** — project name and one concise statement of what it is for.
- **Design philosophy / principles** — a small set of stable decision rules. Explain why each principle matters and how it guides choices.
- **Boundaries / non-goals** — explicit exclusions with the principle or trade-off behind each one.

Add a short dated amendment next to the affected principle/boundary only when the history explains a non-obvious exception that future decisions need. PRODUCT is not a chronological changelog.

## Source

Maintainer or user decisions already made, including grounded shape conclusions and explicit corrections to existing PRODUCT truth. Existing PRODUCT prose remains authoritative unless the source explicitly changes it.

## Boundary

- Docs records decisions; it does not decide positioning, value, philosophy, or scope.
- Do not infer product intent from code, market convention, or agent preference.
- Keep implementation architecture in ARCHITECTURE, behavior contracts in specs, visual identity in DESIGN, and future work in ROADMAP.
