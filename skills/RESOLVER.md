# Skills Resolver

> Human-facing routing index. Runtime routing comes from each `SKILL.md` frontmatter description; tests require this index to match the installed surface exactly.

## Capability map

| Skill     | Route here when the requested outcome is…                             | Entry                       |
| --------- | --------------------------------------------------------------------- | --------------------------- |
| Explore   | reliable project/module understanding or facts for another capability | `skills/explore/SKILL.md`   |
| Shape     | resolving material uncertainty into a grounded direction              | `skills/shape/SKILL.md`     |
| Plan      | persisting implementation-ready work or bounded problems              | `skills/plan/SKILL.md`      |
| Implement | changing the project inside an authorized outcome                     | `skills/implement/SKILL.md` |
| Check     | obtaining a read-only review/test/e2e verdict                         | `skills/check/SKILL.md`     |
| Docs      | recording established truth in an authorized document target          | `skills/docs/SKILL.md`      |
| Publish   | completing missing commit, push, and PR actions                       | `skills/publish/SKILL.md`   |
| Release   | publishing an exact GitHub release set and its repository metadata    | `skills/release/SKILL.md`   |
| Converge  | aligning the whole durable-memory catalog idempotently                | `skills/converge/SKILL.md`  |
| Doctor    | auditing project-wide documentation drift and health, read-only       | `skills/doctor/SKILL.md`    |
| Handoff   | compressing continuation-critical session context                     | `skills/handoff/SKILL.md`   |

## Common distinctions

- Explore maps facts; Doctor judges project-wide drift; Check judges one change.
- Shape resolves unsettled direction; Plan records bounded problems or persists implementation-ready work; Implement changes the project.
- Docs writes focused established truth; Converge batch-aligns the catalog; Doctor only reports.
- Publish creates reviewable branch/PR state; Release creates version/repository-metadata/tag/Release state.
- Handoff is transient conversation context, not project documentation.

Plan's route preserves the explicit `local`, `issue`, and `both` targets; omitted target means `both`. Explore retains a fixed Overview before scoped depth. For context topology and side-effect ownership, see [ARCHITECTURE.md](../ARCHITECTURE.md).
