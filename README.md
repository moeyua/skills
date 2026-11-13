# Skills

English | [简体中文](./README.zh-CN.md)

The Claude Code / Codex skills I use. Each skill does one job and says how to do it and what the output looks like.

## The usual flow

```
setup (once per project)
explore → shape → plan → implement → verify → release
                           ↘ debug / review (any time)
```

Every step works on its own. There is no required order.

| Skill                                                | What it does                                                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [setup](./skills/engineering/setup/SKILL.md)         | Fill in project docs, record where plans go in CLAUDE.md and AGENTS.md, set up releases and CI       |
| [explore](./skills/engineering/explore/SKILL.md)     | Read the project's docs, then its code; report where they disagree                                   |
| [shape](./skills/engineering/shape/SKILL.md)         | Interview in rounds, each question with a recommended answer; record settled terms                   |
| [plan](./skills/engineering/plan/SKILL.md)           | A one-screen plan: goal, settled decisions with sources, decisions awaiting confirmation, slices     |
| [implement](./skills/engineering/implement/SKILL.md) | Restate the goal, build test-first slice by slice, commit each, show how to see it work              |
| [verify](./skills/engineering/verify/SKILL.md)       | Actually use it; label each claim measured, inferred, or guess                                       |
| [debug](./skills/engineering/debug/SKILL.md)         | Build a loop that goes red on the bug before forming hypotheses                                      |
| [review](./skills/engineering/review/SKILL.md)       | Two parallel reviewers: project standards and the spec                                               |
| [release](./skills/engineering/release/SKILL.md)     | Version, tag, and GitHub Release per `RELEASE.md`; confirm the deploy                                |
| [docs](./skills/engineering/docs/SKILL.md)           | Formats for eight project docs: specs, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, README, GLOSSARY, ADR |
| [handoff](./skills/productivity/handoff/SKILL.md)    | Compact the session into a handoff doc                                                               |
| [explain](./skills/productivity/explain/SKILL.md)    | Re-explain the last message plainly                                                                  |

`setup`, `handoff`, and `explain` are user-invoked only. The rest can also be picked up by the model.

## Project docs

The eight kinds of docs are a project's long-term memory: implement, shape, and setup write them, explore reads them, and docs holds their formats. See the [memory catalog](./skills/engineering/docs/references/memory-catalog.md).

## Install

```bash
pnpm install
```

The `install` script runs `skills add . -g -a claude-code -a codex -y`. To add one skill:

```bash
npx skills add . --skill plan
```

## Develop

```bash
pnpm check
pnpm test
```

Tests check structure only: names match directories, descriptions exist, relative links resolve. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before editing a skill.

## Credits

Several skills are adapted from [mattpocock/skills](https://github.com/mattpocock/skills), with ideas from [backnotprop/pstack](https://github.com/backnotprop/pstack). See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## License

MIT
