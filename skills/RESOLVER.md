# Skills Resolver

> Human-facing trigger index. Runtime routing comes from each `SKILL.md` description; repository tests require this index to reference exactly the installed skill set.

## Public capabilities

| capability | use when                                                                                               | entry                       |
| ---------- | ------------------------------------------------------------------------------------------------------ | --------------------------- |
| Explore    | understand a repo/module, map structure, or provide reliable read-only context                         | `skills/explore/SKILL.md`   |
| Shape      | think through an uncertain idea, resolve material design choices, or diagnose what correct should mean | `skills/shape/SKILL.md`     |
| Plan       | persist settled work as a local plan, GitHub Issue work items, or both; omitted target defaults both   | `skills/plan/SKILL.md`      |
| Implement  | build an authorized change, close its check loop, sync earned durable truth, and summarize the outcome | `skills/implement/SKILL.md` |
| Check      | independently review, test, or drive a change; verdict only, no edits                                  | `skills/check/SKILL.md`     |
| Docs       | record established truth in the six-type memory catalog or a user-named project document               | `skills/docs/SKILL.md`      |
| Publish    | complete missing commit, push, and GitHub pull-request actions from current state                      | `skills/publish/SKILL.md`   |
| Release    | confirm a project-policy release set, then version its units and publish exact tags/GitHub Releases    | `skills/release/SKILL.md`   |
| Converge   | batch-align a project's memory catalog to current formats, idempotently                                | `skills/converge/SKILL.md`  |
| Doctor     | audit whole-project docs/code drift and mechanical health, read-only                                   | `skills/doctor/SKILL.md`    |
| Handoff    | produce a self-contained, read-only session continuation summary                                       | `skills/handoff/SKILL.md`   |

## Trigger map

| cues                                                                                  | route     |
| ------------------------------------------------------------------------------------- | --------- |
| “look at this project”, “整体了解”, unfamiliar module, `/explore`                     | Explore   |
| “think it through”, “how should we do this”, “想想”, “出方案”, `/shape`               | Shape     |
| “write the plan”, “create these Issues”, “记录这项工作”, `/plan [local\|issue\|both]` | Plan      |
| “implement”, “build it”, “实现”, “落实”, `/implement`                                 | Implement |
| “review”, “run tests”, “check it works”, “把关”, “验证”, `/check`                     | Check     |
| “document this”, “update PRODUCT/ARCHITECTURE/spec”, “记录真源”, `/docs`              | Docs      |
| “publish”, “commit push PR”, “提交并开 PR”, `/publish`                                | Publish   |
| “tag and release”, “GitHub Release”, “发布版本”, `/release`                           | Release   |
| “initialize/align all memory docs”, “文档上车/收敛”, `/converge`                      | Converge  |
| “project health”, “what drifted”, “体检/审计”, `/doctor`                              | Doctor    |
| “continue in a new session”, “交接”, `/handoff`                                       | Handoff   |

## Disambiguation

- **shape vs plan:** shape keeps design work in conversation; plan persists settled work through the user-selected `local`, `issue`, or `both` artifact target.
- **plan vs docs:** plan describes how one change will be implemented; docs records what the project durably is.
- **implement vs check:** implement edits and owns initial and complete-diff repair/recheck loops; a directly invoked check stays read-only and stops at its verdict.
- **implement vs docs:** implement invokes docs only for an evidenced durable obligation; directly invoked docs remains an independent, authority-bound way to maintain a named target.
- **publish vs release:** publish delivers feature-branch work for review; release uses a fully determining user-supplied tag set directly or pauses on a project-policy-first release-set recommendation until the next user confirmation, then prepares and directly pushes one default-branch version commit and publishes every exact tag/Release identity.
- **docs vs converge vs doctor:** docs writes focused truth, converge batch-aligns catalog structure/content, doctor only audits.

## Soft connections

```text
                              explore
                                 ·
                                 ▼
shape · · ·▶ plan · · ·▶ implement ⇄ check · · ·▶ publish · · ·▶ release
                                  │
                                  │ earned durable truth
                                  ▼
                                 docs ──▶ final check

converge / doctor / handoff remain orthogonal and on demand.
```

The dotted edges show useful context, not prerequisites or automatic flow. Every capability can be invoked directly when its own input is sufficient. Missing upstream artifacts are normal: no shape session does not invalidate plan, no plan does not block implement, no check transcript does not block docs/publish, and no Issue does not block publish.

There are three intentional compositions:

1. shape may use explore read-only context when facts are missing;
2. plan resolves the user-owned artifact target before side effects: `local` writes one plan, `issue` creates or reuses 1–20 same-repository Issues without project writes, and `both` (the default) writes one plan before creating or reusing its one Issue companion; `both` reports remote failure as `partial`;
3. implement first invokes the unchanged, read-only check capability and repairs authorized in-scope blockers; it then invokes docs only for a plan Spec delta, explicit document target, or verified durable-claim drift, and runs a complete-diff final check when docs writes. With no trigger, it reports `not needed` instead.

Everything else stops at its own outcome. Conditional docs does not authorize publish or release; the user chooses the next public capability, and no global orchestrator advances the graph.

## Shared change types

`fix`, `feat`, `refactor`, and `perf` describe the change across shape, plan, and implement. Their canonical definitions live in `rules/change-types.md`. `brainstorm` is only a conversational use of shape, not a plan mode, label, or persistent status.

## Shared artifacts

- Local plans: `plans/YYYY-MM-DD-<slug>.md`, produced only by `local` / `both`; optional `issue:` frontmatter only after a canonical association exists.
- Issue work items: one canonical URL per `issue` batch item, or one companion URL for `both`; existing identities are verified and reused, never title-matched.
- Implement completion evidence: initial check verdict, auditable docs decision, complete-diff verdict when docs writes, and the final outcome summary.
- Durable memory: spec, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, README as defined by `rules/memory-catalog.md`.
- Publish context: current git/GitHub state plus any available plan, Issue URL, and verification evidence.
- Release context: user-supplied tag set or proposed/confirmed release set, authoritative topology/policy/version transaction, per-unit target versions, default-branch/release-commit state, and per-identity tag/GitHub Release state.
