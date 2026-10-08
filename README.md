# Skills

English | [简体中文](./README.zh-CN.md)

> Focused, lightweight capabilities for software development and durable project memory.

Skills gives modern coding agents clear capability interfaces, project-specific judgment, conditional deep references, and safe boundaries around consequential side effects. It does not impose a fixed global workflow.

Read [PRODUCT.md](./PRODUCT.md) for product principles and [ARCHITECTURE.md](./ARCHITECTURE.md) for context flow and internals.

## Browse by category

The 13 skills are organized by purpose.

### [Engineering](./skills/engineering/README.md)

Development, software architecture, testing, and engineering project maintenance.

| Skill                                                | Outcome                                                                                                          |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [explore](./skills/engineering/explore/SKILL.md)     | Read-only project/module understanding; fixed Overview before scoped depth                                       |
| [shape](./skills/engineering/shape/SKILL.md)         | Intent and key design clarified through answerable questions                                                     |
| [plan](./skills/engineering/plan/SKILL.md)           | Local plans, problem-oriented Issues, or pairs, with one audit and authorized corrections                        |
| [debug](./skills/engineering/debug/SKILL.md)         | Cause investigation from expected versus actual behavior, with evidence and explicit unknowns                    |
| [implement](./skills/engineering/implement/SKILL.md) | An authorized working change with proportional proof and accurate durable truth                                  |
| [review](./skills/engineering/review/SKILL.md)       | Evidence-backed findings on designs, planning artifacts, or changes                                              |
| [verify](./skills/engineering/verify/SKILL.md)       | A scoped verdict on whether the claimed outcome has sufficient evidence; independent verification when requested |
| [docs](./skills/engineering/docs/SKILL.md)           | Established truth recorded in the six-type catalog or a named project document                                   |
| [publish](./skills/engineering/publish/SKILL.md)     | Missing commit, push, and pull-request actions completed from current state                                      |
| [release](./skills/engineering/release/SKILL.md)     | A confirmed release set, one complete metadata commit, tags, and Releases                                        |
| [converge](./skills/engineering/converge/SKILL.md)   | Idempotent catalog-wide alignment to current memory formats                                                      |
| [doctor](./skills/engineering/doctor/SKILL.md)       | Read-only whole-project documentation drift and health audit                                                     |

### [Productivity](./skills/productivity/README.md)

General work, learning, and information organization.

| Skill                                             | Outcome                                      |
| ------------------------------------------------- | -------------------------------------------- |
| [handoff](./skills/productivity/handoff/SKILL.md) | A compact, host-neutral continuation summary |

`design` is a peer category for UI/UX, interaction, visual, brand, and design-system work; software architecture and turning designs into code belong in `engineering`. Create it only when actual skills belong there. The same rule applies to `in-progress` for experimental skills, `misc` for infrequently used skills, and `deprecated` for retired skills.

## Install

```bash
npx skills add .
```

`skills` is the external installer CLI; this repository supplies the capability content.

Skills keep their original names across categories; select one with `npx skills add . --skill handoff`.

Useful flags:

- `-g` installs globally; otherwise installation is project-level.
- `-a claude-code` or `-a codex` selects an agent.
- `-y` skips installer confirmation.
- `--copy` avoids the default shared-store symlink layout.

Installation is a snapshot. Re-run it after changing this repository. Shape requires Explore; Plan requires Review and a host that can run its audit in an independent context. Install or update each support pair together. If Plan's audit support is unavailable, it retains the artifacts and reports `inconclusive` with the missing capability.

## Usage model

Enter the Skill that matches the requested outcome; there is no required preceding chain. Its frontmatter description provides routing, and its main guide loads deeper references only when needed. Every Shape invocation first uses Explore context for the current target project, reusing still-valid facts and filling gaps before forming a direction. You do not need to invoke Explore separately: its context returns to Shape, which continues to the Design Summary for review.

Plan supports `local`, `issue`, and `both` (the default). After generation, it runs one independent Review, automatically corrects clear findings within the selected target's permissions, and verifies those corrections. It reports generation, audit, and revision results separately, preserving unresolved decisions and evidence gaps. New local plans remain `draft`; planning review does not authorize implementation.

Shape asks currently answerable, independent questions together and uses concrete situations to help when the user is unsure. Debug establishes causes; Implement retains responsibility for an authorized repair, its regression checks, and affected truth. Review asks what needs correction and why; Verify asks whether the original claim is supported. Both may read code or run checks, and both leave repairs to the authorized caller. A plan is `done` when its implementation lands in the same PR; review and verification results are recorded, not gates.

See the [Resolver](./skills/RESOLVER.md) for route distinctions and [Architecture](./ARCHITECTURE.md) for context topology and side-effect ownership.

## Durable memory

The catalog contains exactly six types: domain Specs, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, and README. Docs records only established truth from an authoritative source. See [rules/memory-catalog.md](./rules/memory-catalog.md).

## Development

```bash
pnpm check
pnpm test
pnpm lint
node skills/engineering/doctor/scripts/checker.ts . --json
```

GPT-6 Astra is the primary behavior evaluation model; Codex and Claude Code use the same Skill set. Behavior is verified through actual sessions. Ordinary implementation, review, and verification results stay concise, while a requested independent verification runs in a fresh context.

## Acknowledgements

- [Waza](https://github.com/tw93/Waza)
- [superpowers](https://www.skills.sh/obra/superpowers/brainstorming)
- [Shape Up](https://basecamp.com/shapeup)
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev)
- [design.md](https://github.com/google-labs-code/design.md)

## License

MIT
