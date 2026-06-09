# Architecture format — `ARCHITECTURE.md`

The project's technical architecture: structure, stack choices, data flow, and the decisions behind them. Audience is developers and collaborating agents, not end users.

## Sections

- **目录结构 / Directory layout** — the tree + one line per top-level dir on its responsibility. The cheap, stable map of where things live.
- **技术栈 / Tech stack** — language / framework / key tooling, each with the reason it was chosen (and notable "deliberately not used").
- **数据流 / Data flow** — how the main pieces connect; an ASCII diagram when more than ~3 components exchange data.
- **关键设计决策记录 / Decision records** — ADR-shaped entries: context → the decision → its consequences/trade-offs, dated when it's a revision. The only element a formal standard (ISO/IEC/IEEE 42010) actually mandates; may also live as separate append-only records.
- **(可选) 架构不变量 / Architecture invariants** — the rules the architecture holds itself to, especially "this must never happen" constraints (e.g. "no SKILL.md at the repo root"). The most durable, lowest-maintenance thing to record — it changes far less often than code.

Use only the sections the project needs; a small project may have just structure + stack.

A guiding principle (per matklad's `ARCHITECTURE.md` convention): **record what is unlikely to change, and don't expect this doc to stay line-by-line synced with the code** — that's why the layout is a top-level map, not a mirror of every file, and why invariants are worth more than transient detail.

## Source

The code's current structure (read it — it's the reality) + the plan's `## Key decisions` (the reasoning). If neither a stated decision nor the code is available for a claim, stop and ask — don't invent rationale.

## Boundary

- **Only what currently holds** — no future / deferred / "v2" items; those go to `ROADMAP.md`. A `## 未来规划` section may exist _only_ as a one-line pointer to ROADMAP, never as the content itself.
- Not UI design (that's `DESIGN.md`); not the behavior contract (that's `specs/`); not step-by-step how a single change was made (that's the plan).
