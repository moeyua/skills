# Skills

English | [简体中文](./README.zh-CN.md)

> Focused, lightweight capabilities for software development and durable project memory.

Skills gives modern coding agents clear capability interfaces, project-specific judgment, conditional deep references, and safe boundaries around consequential side effects. It does not impose a fixed global workflow.

Read [PRODUCT.md](./PRODUCT.md) for product principles and [ARCHITECTURE.md](./ARCHITECTURE.md) for context flow and internals.

## The 11 skills

| Skill       | Outcome                                                                         |
| ----------- | ------------------------------------------------------------------------------- |
| `explore`   | Read-only project/module understanding; fixed Overview before scoped depth      |
| `shape`     | A grounded, bounded direction in conversation                                   |
| `plan`      | Local plans, problem-oriented Issues, or paired artifacts with safe Issue sync  |
| `implement` | An authorized working change with proportional proof and accurate durable truth |
| `check`     | A read-only review/test/e2e verdict matched to the question and risk            |
| `docs`      | Established truth recorded in the six-type catalog or a named project document  |
| `publish`   | Missing commit, push, and pull-request actions completed from current state     |
| `release`   | A confirmed release set, one complete metadata commit, tags, and Releases       |
| `converge`  | Idempotent catalog-wide alignment to current memory formats                     |
| `doctor`    | Read-only whole-project documentation drift and health audit                    |
| `handoff`   | A compact, host-neutral continuation summary                                    |

## Install

```bash
npx skills add .
```

`skills` is the external installer CLI; this repository supplies the capability content.

Useful flags:

- `-g` installs globally; otherwise installation is project-level.
- `-a claude-code` or `-a codex` selects an agent.
- `-y` skips installer confirmation.
- `--copy` avoids the default shared-store symlink layout.

Installation is a snapshot. Re-run it after changing this repository.

## Usage model

Enter the Skill that matches the requested outcome; there is no required preceding chain. Its frontmatter description provides routing, and its main guide loads deeper references only when needed.

See the [Resolver](./skills/RESOLVER.md) for route distinctions and [Architecture](./ARCHITECTURE.md) for context topology and side-effect ownership.

## Durable memory

The catalog contains exactly six types: domain Specs, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, and README. Docs records only established truth from an authoritative source. See [rules/memory-catalog.md](./rules/memory-catalog.md).

## Development

```bash
pnpm check
pnpm test
pnpm lint
node skills/doctor/scripts/checker.ts . --json
```

The development-only [Shape bench](./bench/README.md) evaluates conversational quality and side-effect boundaries. It is not installed as a Skill.

## Acknowledgements

- [Waza](https://github.com/tw93/Waza)
- [superpowers](https://www.skills.sh/obra/superpowers/brainstorming)
- [Shape Up](https://basecamp.com/shapeup)
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev)
- [design.md](https://github.com/google-labs-code/design.md)

## License

MIT
