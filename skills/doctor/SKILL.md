---
name: doctor
description: "Audit a whole project's health—first whether its docs still match the code, then dependency/CI/file-size staleness and broken references. A bundled deterministic script handles mechanical facts; model judgment handles docs-vs-code claims. Use when a project needs a whole-project checkup or drift audit. Not for change-scoped pre-merge review (use check), writing fixes (use docs/implement), or agent-host configuration."
allowed-tools: "Bash(node *), Bash(pnpm outdated*), Bash(npm outdated*), Bash(gh run list*), Bash(git log*)"
---

# Doctor

Doctor is a read-only project checkup. Its primary question is whether durable documentation still describes the code; secondary probes cover mechanical project health.

## Audit proportionally

Use fresh project context. If the project or memory layout is unfamiliar, obtain Explore context first; do not emit a separate Explore report.

Run the bundled `scripts/checker.ts` against the project root for deterministic filesystem facts: Spec shape, broken Markdown links/anchors, placeholders, and oversized source files. If Node 24+ is unavailable, record the skip rather than inventing a result.

For documentation drift:

- treat each Spec requirement as a discrete claim and compare it with authoritative behavior evidence;
- extract checkable claims from README, ARCHITECTURE, and other prose; leave uncheckable rationale undecided;
- report only high-confidence contradictions, clearly separating the document claim from observed code/configuration.

Independent claim groups may be investigated in parallel when the host permits it and results retain their source evidence. Run dependency, CI, or history probes only when the requested scope includes them and the project exposes the required manifest, remote, or history. A missing prerequisite is a named skip, not a failure.

## Boundary and report

Doctor never edits, commits, pushes, or invokes a fixing capability. Mechanical findings are facts; model findings include severity, confidence, evidence, and the likely owning capability—Docs for doc correction, Converge for catalog-wide alignment, Implement for an authorized code repair, Shape for unresolved correctness.

Report the scoped advisory result concisely: actionable docs-vs-code findings first, mechanical findings second, actual checks and material skips, and the likely owner of follow-up work. A missing prerequisite does not block unrelated probes. End a standalone audit there; when providing context to an authorized caller, return evidence without starting repairs or ending that caller's task.
