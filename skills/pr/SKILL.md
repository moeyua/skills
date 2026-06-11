---
name: pr
description: 'Push the current branch to origin and open a pull request on GitHub; the PR description is built from the whole branch history. Use when the user says "open a PR" / "pull request" / "push it" / "开 PR" / "提评审", or after committing to push to the remote and open a PR. Not for local commits (use commit), writing release notes, or non-GitHub remotes (no auto PR).'
when_to_use: "push, open PR, pull request, merge request, 推送, 开 PR, 提评审"
dispatch_intent: "Push the branch to origin and auto-create a PR on GitHub"
---

# PR

PR pushes the current branch to origin and opens a pull request on GitHub — in one pass: gather git/gh context in parallel, push, `gh pr create`. Every rule here exists so the push and PR reflect the **whole branch history**: the title/body are synthesized from the entire branch, not just the latest commit; force operations and protected branches are never touched; the user's git/gh config is never changed.

GitHub-only: for a non-GitHub remote, finish the push, skip `gh pr create`, and let the user open the PR/MR manually.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: the current branch is pushed to origin; on a GitHub remote, a PR is created and its URL returned
- Done when: the PR URL is returned (GitHub) or the push succeeds + a manual-PR prompt is given (otherwise)
- Evidence: the actual output of `gh pr view` / `git push`
- Output: PR URL + title + body summary

## Flow

Gather in parallel:

```bash
git status --short
git branch --show-current
git remote -v
gh auth status
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
gh pr list --head <current-branch> --json number,url,state
```

Check the conditions under "When to stop"; once they pass, take the base branch and run:

```bash
git log <base>..HEAD --oneline
git diff <base>...HEAD       # note the three dots — changes since the branch's common ancestor with base
```

Build the PR title + body from the **whole branch** — not the latest commit alone; looking only at HEAD easily misses the topics of earlier commits. Then:

```bash
git push -u origin <current-branch>
gh pr create --title "..." --body "..."
```

Return the PR URL.

## PR description

The title says in one line what the whole PR does (synthesized from all commits).

The body has a required structure:

```markdown
## Summary

- 1-3 bullets, one line each, on what changed

## Test plan

- [ ] checkpoints a reviewer can verify
- N/A if it's pure docs/config/no behavior change

🤖 Generated with Claude Code
```

- Summary is synthesized from the whole branch, not just the latest commit
- **The Test plan section is required** — even for N/A, write "N/A because X" explicitly; a missing section is less clear than N/A, and the reviewer will ask "so was it tested?"
- the footer is added by default, unless the project's anti-patterns forbid it

## When to stop

PR's failure mode is "force-pushing / overstepping the user's config". Stop and report in these cases:

- **Currently on a protected branch like `main` / `master` / `develop`** — refuse; have the user `git checkout -b <name>` first. Pushing straight to a main or protected branch is a destructive op.
- **Uncommitted changes exist** — push assumes the commits are done; report the state and have the user `/commit` first or explicitly discard.
- **`gh` not installed / `gh auth status` fails** — report the install or login command; don't substitute a raw GitHub API / curl for `gh` — leave auth management to gh for any guarantee.
- **No `origin` remote** — report, have the user `git remote add origin ...`.
- **A PR is already open** — report the PR # and URL, and let the user decide whether to keep pushing to the existing PR or stop.
- **The remote isn't GitHub** (URL doesn't contain `github.com`) — finish `git push`, skip `gh pr create`, and output "non-GitHub remote, please open the PR/MR manually" plus the prepared PR body.
- **The user asks for `--force` / `--force-with-lease`** — refuse; force push rewrites remote history, a destructive op too dangerous as a default; if the user really wants force, they run it themselves.
- **The urge to change `git config` / `gh config`** — never touch the user's config.
- **The urge to delete a remote branch** — never delete; that's a destructive op.
