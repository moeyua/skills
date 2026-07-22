---
name: publish
description: 'Publish local work as intentional commits, push the branch, and open or reuse a GitHub pull request. Use when the user says "publish" / "commit, push, PR" / "提交并开 PR" / "发起评审", including partially completed delivery state. Not for implementation, merge approval, release tags/notes (use release), non-git delivery, or force operations.'
when_to_use: "publish, commit push pr, push and open pr, deliver branch, 提交并推送, 开 PR, 发布变更, 提交评审"
dispatch_intent: "Complete the missing commit, push, and pull-request actions safely and idempotently"
---

# Publish

Publish turns the current change into reviewable git/GitHub state: commit → push → pull request. It is state-aware, so it completes the missing actions and must skip every sub-action whose state is already satisfied.

<HARD-GATE>
Publish never rewrites history, force-pushes, amends, deletes branches, changes user configuration, stages secrets, or publishes directly from a protected branch. It does not implement, fix, merge, or release.
</HARD-GATE>

Read `references/anti-patterns.md` and `references/durable-context.md` once per session when they are not already in context.

## Outcome Contract

- Outcome: relevant work is represented by clean commits, the branch is pushed, and a GitHub PR is open or accurately reported as unavailable
- Done when: every safely achievable sub-action is satisfied exactly once and the final local/remote/PR state is reported
- Evidence: status/diff/log, branch/upstream/remote state, commit outputs, push output, and `gh pr` output
- Output: commits created or reused + pushed branch/upstream + created/reused PR URL or precise degraded state

## Resolve state before mutation

Gather in parallel where possible:

```bash
git status --short
git diff HEAD
git diff --cached
git branch --show-current
git log --oneline -10
git remote -v
git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'
gh auth status --active --hostname github.com
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
gh pr list --head <branch> --state all --json number,url,state,baseRefName
```

Derive the target state from facts, not from an assumed starting point:

- relevant working-tree changes exist → commit them;
- relevant commits already exist → do not manufacture another commit;
- the branch has unpushed commits or no upstream → push it once;
- an open PR already targets this branch → push any new commits and return that PR; do not create a duplicate;
- no open PR and the remote is GitHub with working auth → create one;
- GitHub PR creation is unavailable → retain completed commit/push state and report the exact limitation.

An associated plan, Issue, or check result is useful context, never an entry gate. An explicit user request defines the publish scope; otherwise use the current branch's coherent work. Preserve unrelated working-tree changes and exclude them from staging. If ownership or overlap is ambiguous, stop before staging that path.

Before any mutation, stop on detached HEAD, merge/rebase/cherry-pick in progress, or a branch named `main`, `master`, `develop`, or the resolved default branch. Ask for a working branch; do not create one after the work has already been developed on protected history.

## Commit the missing work

Inspect staged and unstaged content before deciding topics. Keep already staged relevant paths after scanning them; stage other relevant paths by explicit filename. Never use `git add -A` or `git add .`.

Never stage `.env*` except a deliberate `.example`, credentials/secrets files, private keys/certificates, `.DS_Store`, or content that exposes a token/password. A sensitive file already staged is a hard stop before commit.

Default to one coherent commit including its tests and docs. Split only into at most three independently revertible topics with genuinely different intent; decide the split from the diff without asking the user to perform commit hygiene. For each topic, stage specific paths, review the staged diff, commit, then continue.

Learn message style from `git log --oneline -10`; use conventional commits when no style is visible. The first line at most 72 characters and explains the intent/why rather than saying “update files.” Add attribution only when the repository convention or user asks for it—never hardcode a host identity.

Never amend or create an empty commit. A failing hook stops that topic; never retry with `--no-verify`. Earlier successful commits remain and must be included in the partial-state report.

## Push the branch

Resolve `origin` and compare the local branch with its upstream. Push only when needed:

```bash
git push -u origin <branch>  # first push
git push origin <branch>     # existing upstream with local commits
```

Never force-push, use `--force-with-lease`, rewrite upstream history, delete a remote branch, or push a protected branch. Never change git or gh configuration.

No `origin`, remote authentication failure, or network failure does not roll back clean commits. Report where publishing stopped and what remains local.

For a non-GitHub remote, finish the normal push, prepare the same title/body described below, and report that PR/MR creation is manual. Do not substitute provider-specific APIs or pretend a PR exists.

## Open or reuse the pull request

Resolve the repository's default base, then inspect the whole branch:

```bash
git log <base>..HEAD --oneline
git diff <base>...HEAD
```

Build the title and body from every commit and the merge-base diff, not only `HEAD`. If an open PR for the branch exists, return its URL after the push and do not overwrite its authored description unless the user explicitly asks.

For a new PR, the body contains:

```markdown
## Summary

- 1–3 whole-branch outcomes

## Test plan

- [ ] reviewer-verifiable checks and actual evidence when known
```

`## Test plan` is always present. Use `N/A because <reason>` only when the change genuinely has no behavioral verification. Do not claim check/tests ran when their evidence is absent.

When a canonical Issue association is explicit or present in the associated plan for the same repository, add `Closes #N` to the PR body so a merge into the default branch can close it. Reuse that identity; never search by title or invent one. No Issue association is a normal state: omit the closing line and publish normally.

Create the PR once with `gh pr create --base <base> --head <branch> --title <title> --body-file <file>`, using a temporary body file to avoid shell interpolation. Remove the temporary file afterward. Return the canonical URL printed by `gh`.

## Partial failure and report

Commit, push, and PR are separate durable side effects. Never fake atomic rollback: if push fails, commits stay local; if PR creation fails, the pushed branch stays remote. Do not automatically retry an ambiguous PR result because it may create a duplicate; query once by head branch to resolve it, then report uncertainty if still ambiguous.

Return:

```text
Publish: complete | partial | no-op
Commits: <hash message> | reused <range> | none
Push: <branch → origin/upstream> | skipped <why> | failed <why>
PR: <created/reused URL> | manual <non-GitHub + prepared body> | failed <why>
Issue: Closes #N | none
Remaining local changes: <paths or none>
```

Stop after this outcome. Merging the PR and creating a release remain separate user decisions.
