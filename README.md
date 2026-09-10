# Skills

English | [简体中文](./README.zh-CN.md)

> Focused, lightweight capabilities for software development and durable project memory.

Skills gives modern coding agents clear capability interfaces, project-specific judgment, conditional deep references, and safe boundaries around consequential side effects. It does not impose a fixed global workflow.

Read [PRODUCT.md](./PRODUCT.md) for product principles and [ARCHITECTURE.md](./ARCHITECTURE.md) for context flow and internals.

## The 13 skills

| Skill       | Outcome                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `explore`   | Read-only project/module understanding; fixed Overview before scoped depth                                |
| `shape`     | Intent and key design clarified through answerable questions                                              |
| `plan`      | Local plans, problem-oriented Issues, or pairs, with one audit and authorized corrections                 |
| `debug`     | Cause investigation from expected versus actual behavior, with evidence and explicit unknowns             |
| `implement` | An authorized working change with proportional proof and accurate durable truth                           |
| `review`    | Evidence-backed findings on designs, planning artifacts, or changes                                       |
| `verify`    | A scoped verdict on whether the claimed outcome has sufficient evidence; formal acceptance when requested |
| `docs`      | Established truth recorded in the six-type catalog or a named project document                            |
| `publish`   | Missing commit, push, and pull-request actions completed from current state                               |
| `release`   | A confirmed release set, one complete metadata commit, tags, and Releases                                 |
| `converge`  | Idempotent catalog-wide alignment to current memory formats                                               |
| `doctor`    | Read-only whole-project documentation drift and health audit                                              |
| `handoff`   | A compact, host-neutral continuation summary                                                              |

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

Installation is a snapshot. Re-run it after changing this repository. Shape requires Explore; Plan requires Review and a host that can run its audit in an independent context. Install or update each support pair together. If Plan's audit support is unavailable, it retains the artifacts and reports `inconclusive` with the missing capability.

## Usage model

Enter the Skill that matches the requested outcome; there is no required preceding chain. Its frontmatter description provides routing, and its main guide loads deeper references only when needed. Every Shape invocation first uses Explore context for the current target project, reusing still-valid facts and filling gaps before forming a direction. You do not need to invoke Explore separately: its context returns to Shape, which continues to the Design Summary for review.

Plan supports `local`, `issue`, and `both` (the default). After generation, it runs one independent Review, automatically corrects clear findings within the selected target's permissions, and verifies those corrections. It reports generation, audit, and revision results separately, preserving unresolved decisions and evidence gaps. New local plans remain `draft`; planning review does not authorize implementation.

Shape asks currently answerable, independent questions together and uses concrete situations to help when the user is unsure. Debug establishes causes; Implement retains responsibility for an authorized repair, its regression checks, and affected truth. Review asks what needs correction and why; Verify asks whether the original claim is supported. Both may read code or run checks, and both leave repairs to the authorized caller. Ordinary review or verification does not imply independent acceptance.

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

GPT-6 Astra is the primary behavior evaluation model; Codex and Claude Code use the same Skill set. Behavior is verified through actual sessions. Ordinary implementation, review, and verification results stay concise, while formal acceptance retains independent evidence.

## Acknowledgements

- [Waza](https://github.com/tw93/Waza)
- [superpowers](https://www.skills.sh/obra/superpowers/brainstorming)
- [Shape Up](https://basecamp.com/shapeup)
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev)
- [design.md](https://github.com/google-labs-code/design.md)

## License

MIT
