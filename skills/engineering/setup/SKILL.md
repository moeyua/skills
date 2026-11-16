---
name: setup
description: "Set a project up for these skills: its long-lived docs, the Skills section of CLAUDE.md and AGENTS.md, and RELEASE.md (how changes land and versions ship) with CI. Run once per project, or again after the skills change."
disable-model-invocation: true
---

# Setup

Three parts. Run all three unless the user names one. Each part looks first, shows the user what it found and what it proposes, and writes only after they agree.

Run the `explore` skill first if you haven't explored this project in this session.

## 1. Project docs

For each kind of doc in the `docs` skill's catalog except RELEASE (part 3 covers it), decide one of:

- **Fine**: exists and roughly follows its format. Leave it.
- **Reshape**: exists but in a different shape. Propose moving its content into the format. Keep every true statement; drop nothing silently.
- **Write**: missing, and the project clearly needs it (an ARCHITECTURE for anything non-trivial, a GLOSSARY once there are domain terms). Draft what the code can establish. Leave product intent, rationale, and future plans to the user.
- **Skip**: missing, and the project doesn't need it (no DESIGN for a CLI, no ROADMAP with nothing deferred).

If ARCHITECTURE (or another doc) holds decision records, propose moving each into its own ADR under `docs/adr/` and leaving ARCHITECTURE with current structure only. Write a new ADR only after asking the user whether that decision should be recorded.

Show one line per kind of doc with its verdict and a one-line reason. After the user agrees, do the work. Ask about each claim that only the user can make, rather than guessing it.

Running setup again is safe: docs that are already fine stay untouched.

## 2. The Skills section

The `## Skills` section of `CLAUDE.md` and `AGENTS.md` is the one place a project's skill settings are listed. Each line is either a short setting or a pointer to the file that holds a larger one. The skills read it before guessing.

```markdown
## Skills

- Plans: local `plans/` | GitHub issues | both
- Release rules: `RELEASE.md`
- Coding standards: `CONTRIBUTING.md` | none documented
```

- **Plans**: ask where the `plan` skill should put plans. Recommend local unless the project already tracks work in issues.
- **Release rules**: the file part 3 writes, normally `RELEASE.md`.
- **Coding standards**: list the files that say how code here should be written (`CONTRIBUTING.md`, `CODING_STANDARDS.md`, a style guide). Show the user what you found and confirm. If there are none, write "none documented"; don't invent a standards doc.

Write it into both files (create whichever is missing). If one just imports the other (for example `@AGENTS.md`), write it once in the imported file. Keep lines the user added; a new setting another skill needs goes here as one more line.

## 3. RELEASE.md

`implement` pushes and `release` cuts versions only the way `RELEASE.md` says, so every project that pushes changes gets one, even one that never ships versions (its versions section then says so). If it's missing, out of date, or the user asks to connect releases to CI, follow [references/release.md](references/release.md).

## Report

One line per part: what was already fine, what changed, what's still waiting on the user.
