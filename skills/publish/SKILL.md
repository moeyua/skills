---
name: publish
description: 'Publish local work as intentional commits, push the branch, and open or reuse a GitHub pull request. Use when the user says "publish" / "commit, push, PR" / "提交并开 PR" / "发起评审", including partially completed delivery state. Not for implementation, merge approval, release tags/notes (use release), non-git delivery, or force operations.'
---

# Publish

Publish makes authorized local work reviewable through commit → push → pull request. These are durable side effects, so derive each next action from current canonical state and skip every sub-action whose state is already satisfied.

## Route by state

Read `references/git-state.md` before mutation. It defines protected states, explicit staging, commit intent, and safe push behavior.

Read `references/pull-request.md` when a GitHub PR can be created or reused, or when a non-GitHub remote needs a manual PR/MR handoff. Read `references/recovery.md` when an earlier commit/push/PR may already exist, a remote result is ambiguous, or any stage fails.

Use an associated plan, Issue, or verification result when available, but never make one an entry gate. Preserve unrelated working-tree changes and stop before staging when ownership is unclear.

## Boundaries

Publish never implements or fixes the change, rewrites history, force-pushes, amends, deletes branches, changes user configuration, stages secrets, merges, or releases. It does not turn failed validation into permission to bypass hooks.

Commit, push, and PR are separate durable outcomes. Keep every valid completed stage and report the exact remaining state; never simulate atomic rollback.

Finish with complete, partial, or no-op state; commits created or reused; push target; PR URL/state or precise manual/degraded result; verification represented accurately; and remaining local changes. Stop before merge or Release.
