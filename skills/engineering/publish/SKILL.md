---
name: publish
description: "Publish work as commits and a PR, check its CI, and rebase-merge only when explicitly requested. Use when the user asks to publish, submit a PR, check PR status, or merge a PR, including partial delivery state. Not for implementation, release tags/notes (use release), deployment, or force operations."
---

# Publish

Publish makes authorized local work reviewable through commit → push → pull request, checks the current PR, and merges by rebase when the user requests it. Derive each next action from canonical state and skip every sub-action whose state is already satisfied. Publishing or passing CI does not authorize merging.

## Route by state

Read `references/git-state.md` before local commit or branch push. It defines protected states, explicit staging, commit intent, and safe push behavior. A request about an existing PR can go directly to remote inspection without creating commits, switching branches, or touching unrelated local work.

Read `references/pull-request.md` for PR creation/reuse, current checks, explicitly requested rebase merge, or a non-GitHub manual PR/MR handoff. Read `references/recovery.md` when a delivery or merge may already exist, a remote result is ambiguous, or a stage fails.

Once publication is authorized, complete every missing in-scope stage without asking again for the same authorization. Use an associated plan, Issue, or verification result when available, but never make one an entry gate. Preserve unrelated working-tree changes and stop before staging when ownership is unclear.

## Boundaries

Publish never implements or fixes the change, rewrites local or remote branch history through force operations, amends, deletes branches, changes user configuration, stages secrets, or releases. An authorized GitHub rebase merge is the sole merge operation; do not bypass checks or resolve conflicts by changing code. Commit, push, PR, checks, and merge state attest those outcomes only; publishing or repeating evidence does not create a Verify pass. An associated plan's status and Assurance changes are relevant paths of the same delivery: commit them with the code so they land in the same PR. Report Review findings and Verify results as recorded, without upgrading them. Historical Check records retain their actual source and time scope; never relabel them as Verify evidence.

Commit, push, PR, checks, and merge are separate outcomes. Keep every valid completed stage and report the exact remaining state; never simulate atomic rollback.

Report complete, partial, or no-op state with the applicable commits, push target, PR, current checks and requested merge result, relevant verification and remaining local changes. If a rule blocks a stage, link and quote it with the observed condition and exact remaining action; retain completed stages. Stop before an unrequested merge or release.
