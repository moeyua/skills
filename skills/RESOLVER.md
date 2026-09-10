# Skills Resolver

> Human-facing routing index. Runtime routing comes from each `SKILL.md` frontmatter description; tests require this index to match the installed surface exactly.

## Capability map

| Skill     | Route here when the requested outcome is…                                      | Entry                       |
| --------- | ------------------------------------------------------------------------------ | --------------------------- |
| Explore   | reliable project/module understanding or facts for another capability          | `skills/explore/SKILL.md`   |
| Shape     | resolving material uncertainty into a grounded direction                       | `skills/shape/SKILL.md`     |
| Plan      | persisting and auditing local plans, bounded Issues, or paired artifacts       | `skills/plan/SKILL.md`      |
| Implement | changing the project inside an authorized outcome                              | `skills/implement/SKILL.md` |
| Debug     | locating the cause of a known deviation, with evidence and explicit unknowns   | `skills/debug/SKILL.md`     |
| Review    | finding evidence-backed corrections in designs, planning artifacts, or changes | `skills/review/SKILL.md`    |
| Verify    | establishing whether a claimed outcome has sufficient evidence                 | `skills/verify/SKILL.md`    |
| Docs      | recording established truth in an authorized document target                   | `skills/docs/SKILL.md`      |
| Publish   | completing missing commit, push, and PR actions                                | `skills/publish/SKILL.md`   |
| Release   | publishing an exact GitHub release set and its repository metadata             | `skills/release/SKILL.md`   |
| Converge  | aligning the whole durable-memory catalog idempotently                         | `skills/converge/SKILL.md`  |
| Doctor    | auditing project-wide documentation drift and health, read-only                | `skills/doctor/SKILL.md`    |
| Handoff   | compressing continuation-critical session context                              | `skills/handoff/SKILL.md`   |

## Common distinctions

- Explore maps facts; Doctor judges project-wide drift; Review examines a scoped design, change, or planning artifact for actionable problems; Verify establishes evidence for a specified result.
- Shape helps clarify intent and key design through answerable questions; Plan records bounded problems or persists implementation-ready work; Implement changes the project.
- Debug investigates known deviations. When expected behavior itself is unresolved, Shape clarifies it; in an authorized repair, Implement uses Debug and continues through the fix and original symptom verification.
- Review and Verify may both inspect code and run relevant observations. They stay read-only and return findings or evidence to the authorized caller; unit, integration, and E2E tests are methods, not public routes. Only formal Verify acceptance requires its complete independent attestation.
- Docs writes focused established truth; Converge batch-aligns the catalog; Doctor only reports.
- Publish creates reviewable branch/PR state; Release creates version/repository-metadata/tag/Release state.
- Handoff is transient conversation context, not project documentation.

Shape always uses Explore context for the current target project before forming a project-related direction, including familiar projects, simple requests, and settled directions. Explore retains its fixed Overview before scoped depth and allows current facts to be reused. This required support call returns to Shape without a separate report or review round; users invoke Shape directly, with Explore available in the installation. Missing Explore or target-project access remains an explicit gap. Other capabilities do not acquire this prerequisite.

Plan's route preserves the explicit `local`, `issue`, and `both` targets; omitted target means `both`. Every invocation audits its readable outputs once through Review in an independent context, then Plan revises clear findings within its artifact authorization and verifies those findings. Missing Review, independent context, or required evidence yields `inconclusive`; the original generation result, audit verdict, and revision result remain separate. This support call leaves new plans at `draft` and does not require Shape or formal implementation acceptance. Ordinary Review and Verify do not inherit a universal separate-agent requirement.

Only `both` may synchronize a verified Plan-managed problem record across invocations while preserving its canonical Issue identity. `local` has zero GitHub mutation; pure `issue` keeps reused Issues read-only and may append at most one audit revision only to a definitively created Issue in this invocation's successful batch, with a matching write baseline. A stopped original remote transaction cannot resume through audit. For context topology and side-effect ownership, see [ARCHITECTURE.md](../ARCHITECTURE.md).
