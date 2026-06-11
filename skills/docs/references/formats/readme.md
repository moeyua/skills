# Readme format — `README.md`

The project's entry point: what it is, how to use it, where to go next. Audience is users. It's the one external-facing artifact in the catalog — an **entry projection** of the internal memory, synthesized, not independently authored.

## Sections

**Essential** (present even for a tiny tool):

- **标题 + 一句话定位 / Title + one-line positioning** — the project's name and what it is, in a sentence. _(standard-readme: Title + Short Description, both required)_
- **上手 / Getting started** — install or first-run steps. _(GitHub "how to get started"; standard-readme Install)_
- **用法 / Usage** — the main commands / entry points. For a non-tool repo (a pure library / doc repo) this may merge into 上手 or be omitted. _(standard-readme: Usage required only when installable)_
- **链接 / Links** — pointers to `PRODUCT.md` / `ARCHITECTURE.md` for the deeper story. _(Google docguide: a link to deeper docs is the minimum a README owes)_

**Optional** (only when the project warrants — mirror "consider which sections apply"):

- a **License** link (the `LICENSE` file is the source of truth; a one-line pointer suffices), a **Contributing** link (if `CONTRIBUTING` exists), and a **table of contents** only past ~100 lines (per standard-readme — i.e. effectively never for a small tool).

Keep it the size the project warrants — a small tool needs only Title + positioning + usage. Badges, screenshots, and marketing-flavored copy stay out (see Boundary).

## Source

Synthesized from `PRODUCT.md` (positioning / philosophy) and `ARCHITECTURE.md` (structure / commands). If both sources are absent, stop and ask — don't invent positioning.

## Boundary

- A one-time synthesis of the entry, **not** ongoing ownership of external marketing copy.
- No invented positioning or selling claims beyond what PRODUCT/ARCHITECTURE say.
- Not changelog / release notes / API reference — those are out of scope (PRODUCT.md boundary #2/#3).
