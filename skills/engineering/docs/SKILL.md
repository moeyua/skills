---
name: docs
description: "Formats for a project's eight long-lived docs: specs, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, README, GLOSSARY, ADRs. Use when reading, creating, or fixing any of them, or when a change makes one of them wrong."
---

# Docs

These eight kinds of documents are the project's long-term memory: what one session writes down, the next session reads. [references/memory-catalog.md](references/memory-catalog.md) says what each one holds and where its boundary is. Each has a format file under `references/formats/`; read the one for the document you're touching, not all of them.

## Rules for writing any of them

- **Only what is true or decided.** Code tells you how things work now. Only the user tells you why, what comes next, and what the product is for. When a claim has no source, leave it out or ask about that one claim.
- **Each fact lives in one document.** Future work goes in ROADMAP, never in ARCHITECTURE. Why a decision was made goes in an ADR, never in ARCHITECTURE. Visual rules go in DESIGN, behavior in specs, terms in GLOSSARY.
- **Create lazily.** A document exists only once there is something worth writing in it. Not every project needs all eight.
- **Edit in place.** Rewrite the affected part so the document reads as one coherent piece. No appended "update:" notes, no keeping the old design next to the new one after a clean replacement.
- **Write in the language the document already uses.** A new document uses the user's language.

When you finish, say which documents you changed and, in one line each, what changed.
