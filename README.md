# Squire

English | [简体中文](./README.zh-CN.md)

> Your AI agent has the horsepower. Squire gives it the road.

Squire is a restrained instruction system for software development and durable project memory. It exposes 11 focused skills that users invoke on demand; useful context can flow between them without turning the set into a mandatory pipeline.

For the product principles and boundaries, read [PRODUCT.md](./PRODUCT.md). For internals and data flow, read [ARCHITECTURE.md](./ARCHITECTURE.md).

## The 11 skills

| Skill       | Outcome                                                                                |
| :---------- | :------------------------------------------------------------------------------------- |
| `explore`   | Read-only project/module understanding, either as a report or embedded context         |
| `shape`     | A grounded, bounded design direction in conversation; no files or mutation             |
| `plan`      | One executable local plan, plus a best-effort matching GitHub Issue                    |
| `implement` | Working code/tests and an automatic implement ↔ check repair loop                      |
| `check`     | Independent review/test/e2e verdict; read-only and usable on its own                   |
| `docs`      | Established truth recorded in spec, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, or README  |
| `publish`   | The missing commit, push, and GitHub pull-request actions completed from current state |
| `release`   | A verified git tag and GitHub Release with generated notes                             |
| `converge`  | Idempotent, project-wide alignment to the current memory formats                       |
| `doctor`    | Read-only whole-project drift and health audit                                         |
| `handoff`   | A self-contained, read-only summary for continuing in another session                  |

The public names use vocabulary developers already use. Removed capabilities have no compatibility aliases; the current installed surface is the table above.

## Install

```bash
npx skills add .
```

Useful flags:

- `-g` installs globally; otherwise installation is project-level.
- `-a claude-code` selects an agent; without it the CLI prompts.
- `-y` skips confirmation.
- `--copy` uses copies instead of the default shared-store symlink layout.

The shared store is an install-time snapshot. Re-run the install command after changing this repository.

Once installed, invoke `/explore`, `/shape`, `/plan`, `/implement`, `/check`, `/docs`, `/publish`, `/release`, `/converge`, `/doctor`, or `/handoff`.

## How capabilities connect

```text
                              explore
                                 ·
                                 ▼
shape · · ·▶ plan · · ·▶ implement ⇄ check · · ·▶ docs · · ·▶ publish · · ·▶ release

converge / doctor / handoff are orthogonal, on-demand capabilities.
```

Dotted edges are common context handoffs, not prerequisites. You can call any skill directly when its own request is clear. The only automatic loop is inside `implement`: it invokes the standalone, read-only `check`, fixes authorized in-scope blockers, and checks again until the change holds up or reaches an intent/scope/dependency/no-progress boundary.

Three useful compositions remain deliberately local:

- `shape` may obtain read-only `explore` context when facts are missing.
- `plan` always writes the local plan first, then attempts at most one matching GitHub Issue. GitHub failure never invalidates the plan or blocks later work.
- `publish` reuses a plan's canonical Issue association when available and adds a closing reference to the PR; no Issue is a normal publish state.

There is no global orchestrator. After each public outcome, the user decides what to invoke next.

## Change types

`fix`, `feat`, `refactor`, and `perf` are shared properties of a change:

| Type       | Evidence focus                                      |
| :--------- | :-------------------------------------------------- |
| `fix`      | Correct behavior, root cause, regression protection |
| `feat`     | Observable interface and acceptance scenarios       |
| `refactor` | Behavior invariants and regression coverage         |
| `perf`     | Baseline, numeric target, comparable measurement    |

Shape uses these types as a thinking lens, plan uses them for plan structure and the optional Issue label, and implement uses them to choose TDD/invariant/measurement discipline. Brainstorming is simply a conversational use of shape—not a persistent mode.

## Durable memory

The default memory catalog contains exactly six types: domain specs, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, and README. `docs` may record PRODUCT only after the user or a shaping conversation has decided the product truth; it never makes that decision. See [rules/memory-catalog.md](./rules/memory-catalog.md).

## Development

```bash
pnpm check
pnpm test
pnpm lint
```

The repository also contains [bench/](./bench/README.md), development-only tooling that evaluates whether shape stays grounded, proportional, decision-aware, conversational, and side-effect free. Bench tooling is not installed as a skill.

## Acknowledgements

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
