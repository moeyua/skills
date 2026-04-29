# spec-dev git hooks

A pre-push hook that runs the mechanical audit before `git push` so doc rot
is caught at the natural commit boundary, not later during a Sync session.

## What it does

1. Skips entirely if the project has no `docs/` directory.
2. Runs `audit-mechanical.mjs` (dead-link / AC-format / section-presence).
3. Blocks the push if any **ERROR** is found.
4. Optionally runs `verify.mjs` when `SPEC_DEV_VERIFY=1` is set.

## Install — native

```sh
cp <skill>/scripts/templates/git-hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

`<skill>` is wherever this skill lives — typically
`~/.claude/skills/spec-dev` for global Claude Code installs.

If your skill path differs, set `SPEC_DEV_HOME` in your shell rc, or edit
the `SPEC_DEV_HOME` line at the top of the copied hook.

## Install — simple-git-hooks

```jsonc
// package.json
{
  "simple-git-hooks": {
    "pre-push": "node $HOME/.claude/skills/spec-dev/scripts/audit-mechanical.mjs --root ."
  }
}
```

Then run `pnpm dlx simple-git-hooks` (or `npx`).

## Install — husky

```sh
# .husky/pre-push
node "$HOME/.claude/skills/spec-dev/scripts/audit-mechanical.mjs" --root .
```

## Skip / override

| Env var | Effect |
|---|---|
| `SPEC_DEV_SKIP=1` | Skip the audit entirely (one-off escape) |
| `SPEC_DEV_VERIFY=1` | Also run `verify.mjs` (slower, scans tests + src) |
| `SPEC_DEV_HOME=...` | Override the skill installation path |

## Why pre-push and not pre-commit

Pre-commit fires on every commit, including WIP / fixup commits where the
docs are intentionally out of sync. Pre-push fires once per branch update —
the moment when "the work is leaving your machine" is the right alignment
gate for documentation drift.
