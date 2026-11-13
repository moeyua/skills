---
name: setup
description: "Set a project up for these skills: its long-lived docs, where plans go, and release rules with CI. Run once per project, or again after the skills change."
disable-model-invocation: true
---

# Setup

Three parts. Run all three unless the user names one. Each part looks first, shows the user what it found and what it proposes, and writes only after they agree.

Run the `explore` skill first if you haven't explored this project in this session.

## 1. Project docs

For each of the eight kinds of docs in the `docs` skill's catalog, decide one of:

- **Fine**: exists and roughly follows its format. Leave it.
- **Reshape**: exists but in a different shape. Propose moving its content into the format. Keep every true statement; drop nothing silently.
- **Write**: missing, and the project clearly needs it (an ARCHITECTURE for anything non-trivial, a GLOSSARY once there are domain terms). Draft what the code can establish. Leave product intent, rationale, and future plans to the user.
- **Skip**: missing, and the project doesn't need it (no DESIGN for a CLI, no ROADMAP with nothing deferred).

If ARCHITECTURE (or another doc) holds decision records, propose moving each into its own ADR under `docs/adr/` and leaving ARCHITECTURE with current structure only. Write a new ADR only after asking the user whether that decision should be recorded.

Show one line per kind of doc with its verdict and a one-line reason. After the user agrees, do the work. Ask about each claim that only the user can make, rather than guessing it.

Running setup again is safe: docs that are already fine stay untouched.

## 2. Where plans go

Ask where the `plan` skill should put plans: local files in `plans/`, GitHub issues, or both. Recommend local unless the project already tracks work in issues.

Write the answer into both `CLAUDE.md` and `AGENTS.md` (create whichever is missing), under a short section:

```markdown
## Skills

- Plans: local `plans/` | GitHub issues | both
```

If one of the two files just imports the other (for example `@AGENTS.md`), write it once in the imported file.

## 3. Releases

If the project has no `RELEASE.md`, or the user asks to connect releases to CI, follow [references/release.md](references/release.md). Skip this part for a project that doesn't ship versions; say so in one line.

## Report

One line per part: what was already fine, what changed, what's still waiting on the user.
