# Git State and Commit

Inspect status, unstaged/staged diff, current branch, upstream, remotes, recent history, resolved default branch, and commits relative to that base before mutation.

Stop on detached HEAD, an in-progress merge/rebase/cherry-pick, or a branch named `main`, `master`, `develop`, or the resolved default branch. Do not move already-developed work automatically when branch intent or committed protected history is ambiguous.

## Commit only missing work

Reuse relevant existing commits. When work remains uncommitted, review it and stage only explicit relevant paths. Never use `git add -A` or `git add .`; never stage credentials, private keys, secret-bearing configuration, incidental generated files, or an unreviewed pre-staged sensitive path.

Default to one coherent commit with its tests and docs. Split only into at most three independently revertible topics with genuinely different intent. Learn message style from recent history; otherwise use a concise conventional commit whose first line is at most 72 characters and explains intent.

Never amend, create an empty commit, or bypass a failing hook.

## Push safely

Compare the local branch with its upstream and push only when needed. Set upstream only for the first push of this work branch. Never force-push, delete a remote branch, push protected history, or change git or gh configuration.

No remote or an authentication/network failure leaves valid local commits intact. Report that durable state rather than rolling it back.
