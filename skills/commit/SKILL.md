---
name: commit
description: 'Turn working-tree changes into clean git history matching the project style; auto-split when there are clearly multiple topics. Use when the user says "commit" / "stage and commit" / "提交" / "入库". Not for pushing to a remote or opening a PR (use push), or writing release notes.'
when_to_use: "commit, stage changes, commit message, 提交, 入库, 整理变更, 拆提交"
dispatch_intent: "Build clean git commits matching the project's history style"
---

# Commit

Commit turns working-tree changes into clean git history — in one pass: gather context, decide what to stage, commit, verify. Don't interrupt the user unless you hit something you can't continue past. Every rule here exists so the commit history **truly records intent**: one commit one topic, the message says why not just what, and secrets never enter the repo.

Two cross-skill rules apply to all praxis work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: clean git commits with messages matching the project's history style
- Done when: the final `git status` shows a clean working tree (or only unrelated changes remain)
- Evidence: the actual output of `git status` / `git diff HEAD` / `git log --oneline -10`
- Output: each commit's hash + message + the staging decision ("staged X, skipped Y because Z")

## Flow

Gather in parallel:

```bash
git status --short
git diff HEAD
git log --oneline -10
git branch --show-current
```

Decide staging / message / commit from the output, executed in parallel. With multiple topics, run consecutive add+commit pairs. Verify once with `git status` at the end.

## Stage

- already staged → keep it
- otherwise → pick specific filenames relevant to the topic (**not `-A` / `.`** — a blanket add easily sweeps in secrets or unrelated changes)
- never stage: `.env*` (except `.example`), `*credentials*` / `*secrets*` / `*.key` / `*.pem` / `.DS_Store` / any file containing a token — this is an unrecoverable leak, and it outranks correctness

## Message

Learn the project style from `git log --oneline -10`. With no obvious style, use conventional commits.

- first line ≤ 72 chars
- **say why, not just what** — "Various changes" / "Update files" wastes the reviewer's time, and your future self can't see the intent either
- add `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` by default, unless the project's anti-patterns explicitly forbid it

## Splitting commits

**Combine (default)**: one topic, even across multiple files — a bug fix + the sync changes it triggers; a feature + tests + docs; an interface signature change + the call sites updated.

**Split (the skill decides, no asking)**: independently revertable, with completely different intent — an auth change + unrelated logging; a bug fix + an incidental `.gitignore` change.

When in doubt, combine. Don't split into more than 3. **Don't ask the user "should I split?" mid-flow** — that judgment is the commit skill's own job, and asking back pushes the work back onto them.

## When to stop

Commit's failure mode is "forcing it in / bypassing tools". Stop and report in these cases:

- **The commit request includes a secret-like file** (staged `.env` etc.) — refuse; have the user unstage it first. Once a secret enters the repo it's essentially unrecoverable.
- **Nothing to commit** — report and stop; don't create an empty commit.
- **A pre-commit hook fails** — report the hook output and let the user decide; **don't retry, don't add `--no-verify`** to bypass. What a hook stops is usually a lint / type / test error, and bypassing it loses the signal.
- **detached HEAD / rebase or merge in progress** — git state is special; let the user finish that before committing.
- **The user asks for `git commit --amend`** — refuse, always a new commit. Amend rewrites history, a destructive op too dangerous as a default; if the user really wants amend, they run it themselves.
