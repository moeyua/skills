---
name: clean
description: "Detailed Clean phase procedure: enforce the invariants, execute mechanical and judgment cleanup safely, and mark items done in the report."
---

# Clean Phase

Modifies code. Reads from `.claude/cleanup/report.md`. Strictly bounded by the invariants in SKILL.md — re-read them before starting.

## Pre-Clean Checklist

Before any change:

1. **Working tree must be clean.** If `git status` is dirty, stop and ask the user to commit or stash. Cleanup mixed with other unrelated changes is unreviewable.
2. **One type per task.** Confirm which cruft type this task addresses. Refuse to mix.
3. **Scope cap.** If the selected type/section would touch more than ~20 files or ~500 lines, propose a smaller scope.
4. **Branch.** Create a cleanup branch (e.g., `cleanup/dead-code-2026-04-27`). Do not clean on `main`.

If any check fails, surface it and wait for the user.

## Mechanical Cleanup (Types A + B)

### Dead code removal

For each item in the dead-code section:

1. Re-verify the symbol is unreferenced — grep one more time. Tooling can have false positives, especially across dynamic imports, runtime registration, or string-based references.
2. Delete the symbol or file.
3. Remove import sites if applicable.
4. Mark `[x]` in the report file.

**Do not:**
- "Improve" surrounding code while you're in the file
- Add comments explaining the deletion
- Keep stubs "just in case"
- Replace deleted code with new abstractions

### Architecture violation fixes

These are subtler than dead code. For each item:

1. Identify whether the fix is **delete** (e.g., remove the forbidden import and the call site) or **move** (e.g., relocate a file to its proper layer).
2. **Delete fixes** — execute and mark `[x]`.
3. **Move fixes** — these cross into refactoring territory. Confirm with the user before executing. Use `git mv` to preserve history. If the move requires changing many import paths, prefer a codemod over manual edits.

### Verify after each batch

Run the project's standard checks:

- `pnpm lint` (or equivalent)
- `pnpm typecheck` (if applicable)
- `pnpm test` (if fast enough; otherwise just unit tests)

If anything breaks, **revert the batch** and re-investigate. Do not fix forward — that's how new cruft enters under the guise of "fixing the cleanup".

## Judgment Cleanup (Types C + D + E)

These require user input per item. Don't batch them.

### Duplicate implementation (Type C)

For each duplicate cluster:

1. Show the user the implementations side by side (paths, signatures, key differences)
2. Ask: "Which is canonical?" — let the user pick. Provide observations (oldest, most callers, simplest, best-tested) but **never decide**
3. After the user chooses, run a codemod to redirect all imports to the canonical
4. Delete the non-canonical implementations
5. Verify with lint/typecheck/tests
6. Mark `[x]`

If the user says "I need to merge them first" or "they actually do different things" — that's outside this skill's scope. Stop the item, mark `[-]`, note the reason. Tell them to merge or differentiate first, then re-run diagnose.

### Stale API migration (Type D)

For each stale API:

1. Confirm the migration target with the user (often the rules digest already has it; verify rather than assume)
2. Run a codemod to replace usages
3. Delete the deprecated symbol if its only references were these usages
4. Verify
5. Mark `[x]`

If the migration target isn't clear, stop and ask. Do not invent one.

### Speculative residue (Type E)

**Highest-risk type.** Default behavior: do not delete; produce a delete-list for the user to review explicitly.

```
建议删除（请你逐项确认）：

- [ ] src/auth/middleware.ts:120 — 外层已 try，这个 catch 永不进入
- [ ] src/api/handler.ts:88 — 检查 user === null 但路由已保证 user 存在
- [ ] src/utils/parser.ts:45 — TODO from 2025-08, "remove once feature-flag X" — flag 已在 commit abc123 移除

确认后我执行删除。
```

Only execute after the user confirms each item. Items the user rejects get marked `[-]` with the reason.

## Updating the Report

After each successful cleanup item:

1. Edit `.claude/cleanup/report.md` — change `[ ]` to `[x]`
2. Do not delete the item from the report — the audit trail is the value
3. Commit with a message like `cleanup: remove N dead exports (cruft-sweep)`

For items skipped or deferred, change `[ ]` to `[-]` and add a one-line reason inline:

```markdown
- [-] src/legacy/api.ts — 跳过，等待 ADR-007 决定是否保留 legacy 层
```

## Stop Conditions

Stop the cleanup task and hand back to the user when:

- The scope cap is reached
- Tests fail and the failure isn't immediately understood
- A judgment item lacks clear user guidance
- The user interrupts
- Two consecutive items hit unexpected complications

Don't push through. Partial cleanup is fine; broken cleanup is not.

## After Clean

Suggest the user:

1. Review the diff (`git diff` or PR view)
2. Run the full test suite
3. If clean, commit and merge
4. Re-run Diagnose if you want to confirm the items are actually gone

If the cleanup revealed a recurring violation pattern (e.g., dependency-direction violations from the same source area), you may **suggest** adding a lint rule or fitness function — but **do not write it inside this skill**. Anti-regression tooling is out of scope. Suggest only.
