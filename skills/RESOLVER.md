# Squire Skill Resolver

> Human-facing trigger index. Runtime routing comes from each `SKILL.md` description; repository tests require this index to reference exactly the installed skill set.

## Public capabilities

| capability | use when                                                                                               | entry                       |
| ---------- | ------------------------------------------------------------------------------------------------------ | --------------------------- |
| Explore    | understand a repo/module, map structure, or provide reliable read-only context                         | `skills/explore/SKILL.md`   |
| Shape      | think through an uncertain idea, resolve material design choices, or diagnose what correct should mean | `skills/shape/SKILL.md`     |
| Plan       | persist a settled/clear change as an executable plan, with a best-effort GitHub Issue companion        | `skills/plan/SKILL.md`      |
| Implement  | build an authorized change, with or without a plan, and close its internal check loop                  | `skills/implement/SKILL.md` |
| Check      | independently review, test, or drive a change; verdict only, no edits                                  | `skills/check/SKILL.md`     |
| Docs       | record established truth in the six-type memory catalog or a user-named project document               | `skills/docs/SKILL.md`      |
| Publish    | complete missing commit, push, and GitHub pull-request actions from current state                      | `skills/publish/SKILL.md`   |
| Release    | create/reuse a verified tag and GitHub Release with generated notes                                    | `skills/release/SKILL.md`   |
| Converge   | batch-align a project's memory catalog to current formats, idempotently                                | `skills/converge/SKILL.md`  |
| Doctor     | audit whole-project docs/code drift and mechanical health, read-only                                   | `skills/doctor/SKILL.md`    |
| Handoff    | produce a self-contained, read-only session continuation summary                                       | `skills/handoff/SKILL.md`   |

## Trigger map

| cues                                                                     | route     |
| ------------------------------------------------------------------------ | --------- |
| “look at this project”, “整体了解”, unfamiliar module, `/explore`        | Explore   |
| “think it through”, “how should we do this”, “想想”, “出方案”, `/shape`  | Shape     |
| “write the plan”, “implementation plan”, “记录这项工作”, `/plan`         | Plan      |
| “implement”, “build it”, “实现”, “落实”, `/implement`                    | Implement |
| “review”, “run tests”, “check it works”, “把关”, “验证”, `/check`        | Check     |
| “document this”, “update PRODUCT/ARCHITECTURE/spec”, “记录真源”, `/docs` | Docs      |
| “publish”, “commit push PR”, “提交并开 PR”, `/publish`                   | Publish   |
| “tag and release”, “GitHub Release”, “发布版本”, `/release`              | Release   |
| “initialize/align all memory docs”, “文档上车/收敛”, `/converge`         | Converge  |
| “project health”, “what drifted”, “体检/审计”, `/doctor`                 | Doctor    |
| “continue in a new session”, “交接”, `/handoff`                          | Handoff   |

## Disambiguation

- **shape vs plan:** shape keeps design work in conversation; plan is the explicit file-producing handoff and optional Issue projection.
- **plan vs docs:** plan describes how one change will be implemented; docs records what the project durably is.
- **implement vs check:** implement edits and owns the automatic repair/recheck loop; a directly invoked check stays read-only and stops at its verdict.
- **publish vs release:** publish delivers a branch for review; release publishes an already-existing commit as a tag plus GitHub Release.
- **docs vs converge vs doctor:** docs writes focused truth, converge batch-aligns catalog structure/content, doctor only audits.

## Soft connections

```text
                              explore
                                 ·
                                 ▼
shape · · ·▶ plan · · ·▶ implement ⇄ check · · ·▶ docs · · ·▶ publish · · ·▶ release

converge / doctor / handoff remain orthogonal and on demand.
```

The dotted edges show useful context, not prerequisites or automatic flow. Every capability can be invoked directly when its own input is sufficient. Missing upstream artifacts are normal: no shape session does not invalidate plan, no plan does not block implement, no check transcript does not block docs/publish, and no Issue does not block publish.

There are three intentional compositions:

1. shape may use explore read-only context when facts are missing;
2. plan writes the local plan first, then best-effort projects the same change to at most one GitHub Issue; GitHub failure is a degraded result, not a failed plan;
3. implement automatically invokes the unchanged, read-only check capability and repairs only authorized in-scope blockers until check holds up or a real intent/scope/dependency/no-progress boundary appears.

Everything else stops at its own outcome. The user chooses the next capability; no global orchestrator advances the graph.

## Shared change types

`fix`, `feat`, `refactor`, and `perf` describe the change across shape, plan, and implement. Their canonical definitions live in `rules/change-types.md`. `brainstorm` is only a conversational use of shape, not a plan mode, label, or persistent status.

## Shared artifacts

- Local plans: `plans/YYYY-MM-DD-<slug>.md`; optional `issue:` frontmatter only after a canonical association exists.
- Durable memory: spec, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, README as defined by `rules/memory-catalog.md`.
- Publish context: current git/GitHub state plus any available plan, Issue URL, and verification evidence.
- Release context: explicit/canonical tag, target commit, remote tag state, and GitHub Release state.
