# Squire

English | [简体中文](./README.zh-CN.md)

> Your AI agent has the horsepower. Squire gives it the road.

An AI agent's raw output is already strong — but without structure, that capability drifts into generic, imprecise work. Squire gives it structure: it splits the development loop — understand, design, implement, check, document — into 9 focused skills, each doing one thing well.

It isn't just a toolkit. It's a **restrained instruction system**: every rule is a ceiling, not a floor. The agent only does what an instruction allows; the rest is left to the model's own judgment. For the full design philosophy and product boundaries, see [PRODUCT.md](./PRODUCT.md).

## The 9 Skills

Squire separates project understanding from the change loop. `explore` supplies context or a standalone report; `shape → implement → check → docs` is the core loop; `commit` / `pr` are delivery stages owned by each project's workflow; `doctor` / `handoff` stay orthogonal.

| Skill       | Position               | What it does                                                                                   |
| :---------- | :--------------------- | :--------------------------------------------------------------------------------------------- |
| `explore`   | context / report       | Build project context on demand, with a report only when explicitly requested                  |
| `shape`     | core loop              | Clarify intent, shape a design, and produce a plan (brainstorm / fix / feat / refactor / perf) |
| `implement` | core loop              | Land minimal, controlled, style-fitting changes; includes writing tests (TDD)                  |
| `check`     | core loop              | Confirm a change holds up via review / test / e2e — verdict only, no edits                     |
| `docs`      | core loop              | Maintain durable project truth per the memory catalog; also user-named docs                    |
| `commit`    | workflow-managed stage | Organize changes into clean commits with clear messages, splitting when needed                 |
| `pr`        | workflow-managed stage | Push the branch and build a PR description and test plan from the branch history               |
| `doctor`    | orthogonal tool        | Project checkup: docs-vs-code drift (primary) + dependency/CI/file staleness; read-only        |
| `handoff`   | orthogonal tool        | Session handoff: a read-only state summary you can paste into a new session                    |

Every name follows one standard — **each is the term developers already use**: git habits (`commit` / `pr`), CLI habits (`doctor` / `check` / `docs`), agent habits (`explore` / `handoff`), and methodology and PR culture (`shape` from Shape Up's shaping, `implement`). The naming decisions are recorded in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Install

```bash
npx skills add .
```

Common flags:

- `-g` installs globally (`~/.claude/skills/`); without it, install is project-level (`.claude/skills/`)
- `-a claude-code` targets an agent; without it you'll be prompted
- `-y` skips confirmation
- `--copy` uses a plain-copy layout; the default symlinks into the shared `~/.agents` store, but the store holds a **snapshot taken at install time** — re-run `npx skills add .` after changing the repo for edits to take effect

Once installed, trigger: `/explore`, `/shape`, `/implement`, `/check`, `/docs`, `/commit`, `/pr`, plus the orthogonal tools `/doctor` and `/handoff`.

## Workflow

The core loop is the minimal cycle a single change runs through:

```
shape → implement → check → docs
```

`explore` is not a default workflow step. Run it explicitly when you want an Explore Report; otherwise `shape`, `implement`, `check`, `docs`, and `doctor` may use it internally as context preflight and carry the evidence into their own output.

Delivery stages follow when a project's `WORKFLOW.md` says so:

```
commit → pr
```

`doctor` and `handoff` sit outside the loop — the former is an on-demand whole-project checkup (complementary to `check`'s "look at one change before merge"), the latter produces a read-only summary when a session needs to end or hand over.

Each skill stops when done and waits for **you** to decide the next step. Skills never chain automatically; moving between them is your explicit action, and the "next step" in each report is only a suggestion. See the "position determines modality" model in [ARCHITECTURE.md](./ARCHITECTURE.md).

## shape's modes

`shape` adapts to intent through modes — the mode isn't user-specified, it's recognized by the agent during clarification:

| Mode         | When                                         | Output                                   |
| :----------- | :------------------------------------------- | :--------------------------------------- |
| `brainstorm` | Idea is fuzzy, needs collaborative exploring | Conversational design direction, no file |
| `fix`        | Error, misbehavior, regression (+ diagnosis) | Root-cause report + fix plan             |
| `feat`       | New capability                               | Implementation plan + blast radius       |
| `refactor`   | Tidy code without changing external behavior | Refactor plan + behavior-preservation    |
| `perf`       | Performance work                             | Baseline + optimization plan             |

`brainstorm` is the conversational shaping mode. It writes no plan, design, or spec file; once the direction has converged, it can explicitly ask whether to continue into a named mode. Named modes write `plans/` only after context grounding, clarification, 2-3 approaches, grilling the recommended approach, and design approval. For the detailed mode design and data flow, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Design philosophy

Every design decision derives from 5 principles — not dogma, but yardsticks:

- **Restraint** — a rule is a ceiling, not a floor; giving the _why_ beats giving an order
- **Focus on development + memory** — not just changing the code, but remembering what the project durably is
- **The user decides chaining** — skills don't run automatically; every decision point belongs to the user
- **Mechanical consistency** — what a tool can guarantee shouldn't rely on discipline
- **Conversational + explain why** — SKILL.md states the root purpose and backs every constraint with a why, never piling up MUSTs / NEVERs

The full principles and 5 product boundaries are in [PRODUCT.md](./PRODUCT.md).

## Development

Repo self-checks run with `pnpm test` (unit tests + a whole-repo smoke that validates every skill file). Beyond mechanical consistency, the repo also measures **whether models actually follow the shape protocol**: [bench/](bench/README.md) judges real or scenario-driven shape sessions against `specs/shape/spec.md` requirement by requirement — used for failure diagnosis, regression comparison when editing skill docs, and cross-host comparison. It is repo tooling only and is never installed with the skills.

## Acknowledgements

The following projects inspired Squire, with thanks (in no particular order, additions welcome):

- [Waza](https://github.com/tw93/Waza)
- [superpowers](https://www.skills.sh/obra/superpowers/brainstorming)
- [Shape Up](https://basecamp.com/shapeup)
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev)
- [design.md](https://github.com/google-labs-code/design.md)
- [mattpocock/skills](https://github.com/mattpocock/skills)
- [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)

## License

MIT
