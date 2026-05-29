# Durable Context Preflight

> A shared preamble every skill references. Consult durable context only under the conditions below, then apply any skill-specific overrides.

## When to read durable context

Only when:

- the user mentions memory, a preview, a past decision, or a past conclusion
- the user gives a memory path
- the current project exposes an obvious local memory summary (e.g. `MEMORY.md` or a documented memory directory)

Don't hardcode machine-specific memory root paths, and don't read raw transcripts.

## Reading order and budget

In this order: the path the user gave → the current project scope → global preferences. List titles first, then open the 1-2 most relevant summaries. Treat cross-project entries as transferable patterns, not as facts about the current project.

## Memory type mapping

- `decision` / `preference` / `principle`: constraints on the current task (planning / design / review / debugging / tone / audit expectations — varies by skill)
- `pattern` / `learning`: reusable checks or assumptions
- `fact`: must be re-verified against the current state before it can affect output

**Current code, diffs, screenshots, logs, tests, docs, CI, remote state, and live probes always override memory.** If they conflict with a memory, say so and go with the current state.

Each skill applies its own overrides on top of this — which override rules apply, and which memory types act as constraints.
