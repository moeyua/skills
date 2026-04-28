---
name: sync-mode
description: "Detailed instructions for Sync Mode: apply small, mechanical updates to existing docs after a code change. Anchoring on existing content is permitted because changes are local. Use this for AC status flips, new module contract rows, ADR suggestions, link updates — never for structural changes."
---

# Sync Mode — Detailed Instructions

Sync is for **mechanical, local updates** to docs after a code change. Anchoring on existing content is fine because the changes are small and local — there's no risk of carrying old structure into a place where it doesn't belong.

If a change is structural (replacing a section, restructuring a doc, converting a format), it's not Sync's job — escalate to [rewrite-mode](rewrite-mode.md).

## When Sync Fits

Trigger keywords: "sync the docs", "update AC status", "我刚做完 X，更新一下文档".

Concrete cases:
- A feature was implemented → flip AC items from `[ ]` to `[x]` (or `[~]` if untested)
- A new module was added → add a new entry in module registry, create skeletal contract
- An API was renamed → update path references in module contracts
- An ADR was made or superseded → add/mark in `docs/decisions/`
- A bug fix changed observable behavior → update affected AC's wording slightly

What unifies these: each edit fits within an existing section's purpose without changing the section's shape.

## When Sync Does NOT Fit (escalate to Rewrite)

If any of the following, stop and use rewrite-mode instead:

- The existing section's structure no longer matches the code (signal: you find yourself wanting to restructure, not just edit)
- A spec covers behavior that has fundamentally changed (signal: you'd rewrite >40% of the content)
- The doc was authored under a different convention/format and now needs SDD format
- Multiple specs need to be split/merged based on code reality
- A whole section is wrong from the start (not just outdated facts inside it)

The boundary heuristic: **if you'd describe the change as "fix this row" or "add this row", Sync. If you'd describe it as "redo this section" or "restructure this doc", Rewrite.**

## Procedure

### Step 1: Identify the change source

Get the diff. In priority order:
1. `git diff` since last sync (most common — runs after a feature commit)
2. User-described change ("I just changed how X works")
3. Code reality vs doc claim (when triggered by Audit's drift findings)

Read the diff fully. Don't summarize from commit messages alone — code is the source of truth.

### Step 2: Map changes to affected docs

For each meaningful change in the diff, identify what doc artifacts are affected:

| Change kind | Affected artifact |
|---|---|
| New module created | `docs/architecture.md` module registry + new `docs/modules/{name}.md` skeleton |
| Module API changed | `docs/modules/{name}.md` Public API section — update the **name/purpose table**, NOT signatures (signatures live in code, references via path) |
| New module dependency | `docs/modules/{name}.md` Dependencies section |
| Module invariants broken | `docs/modules/{name}.md` Invariants section — flag for review |
| Spec AC implemented + tested | `docs/specs/{name}.md` AC status `[ ]` → `[x]` |
| Spec AC implemented but untested | `docs/specs/{name}.md` AC status `[ ]` → `[~]` (test debt — flag explicitly to user) |
| Behavior change inside an existing AC | The AC's wording in `docs/specs/{name}.md` |
| New user-visible behavior path | Add new BDD scenario to `docs/specs/{name}.md` |
| Behavior change covered by existing scenario | Update the scenario |
| Behavior described by scenario was descoped | Flag scenario for removal |
| New ADR-worthy decision | New `docs/decisions/NNN-{slug}.md` |
| Existing ADR superseded | Mark old ADR status as `Superseded by ADR-NNN`, keep file |
| Project structure change (new top-level dir, key file moved) | `CLAUDE.md` project structure section |

**How to find corresponding tests** (for flipping AC status):
- Search test directories (`__tests__/`, `*.test.*`, `tests/`, `e2e/`) for imports from the changed module
- Match test names against AC descriptions (`describe`/`it` blocks)
- Match BDD scenario keywords against test names
- If the project uses a manual test checklist instead of automated tests, look for a recorded pass/fail entry

**ADR-candidate signals** (worth asking the user to record):
- New dependency added to `package.json` / `Package.swift` / equivalent
- First use of a new architectural pattern (state machine, new data fetching, new event bus)
- Technology choice between alternatives ("chose library X over library Y")
- Significant refactor of an existing pattern

**Manual testing edge case:** if the project uses a manual test checklist (look for `docs/guides/testing.md` to confirm), update the checklist instead of automated scenarios. The three-state AC system still applies — `[x]` requires a recorded pass result.

For each entry, check the **boundary heuristic** above. If any entry needs restructuring, mark it for Rewrite Mode and continue with the rest.

### Step 3: Plan the sync (show the user)

Output the planned edits before applying them:

```markdown
## Sync Plan (Sync Mode)

### docs/specs/auth.md
- AC-03 `[ ]` → `[x]` (test exists at tests/auth/login.test.ts)
- AC-05 `[ ]` → `[~]` (implemented in src/auth/refresh.ts but no test)
- Add note: "Hardware verification deferred to manual checklist"

### docs/modules/auth.md
- Public API: add `refreshToken(token: string): Promise<Session>` row → src/auth/refresh.ts:42

### docs/decisions/
- New: 011-token-refresh-ttl.md (24h chosen, see commit a1b2c3d)

### Escalated to Rewrite Mode
- docs/specs/session.md — behavior fundamentally changed; requires rewrite
```

Do not apply edits before showing the plan. The escalation list is the user's signal that Rewrite is needed for some items.

### Step 4: Apply the mechanical edits

For each plan entry, make the targeted edit. Use Edit tool, not Write — this enforces "small targeted change" and produces clean diffs.

Do **not**:
- Rephrase surrounding wording for "consistency"
- Reorganize section ordering "while you're there"
- Add new sections that weren't in the plan
- Touch any item escalated to Rewrite

### Step 5: Run Audit afterward

After applying, suggest the user run [audit-mode](audit-mode.md) to confirm:
- The new state passes structural checks
- No drift was introduced (e.g., a flipped AC that doesn't actually have a corresponding test)

## Output Format

Two artifacts:
1. **The Sync Plan** (shown to user before applying) — see Step 3 example
2. **The applied diff** — `git diff` after edits, which is the evidence of what changed

Don't summarize what was done in prose — the diff is the evidence (same principle as cruft-sweep).

## Anti-Patterns

- **Restructuring under the cover of "syncing"** — if you find yourself rewriting a section's flow, you've crossed the boundary; stop and re-route to Rewrite
- **Patching faster than thinking** — sync is mechanical, not automatic; each edit should map to a clear plan entry
- **Skipping the plan step** — applying edits without first showing the plan invites silent over-edits
- **Sync followed by "small cleanup"** — once sync is done, stop. Don't reorder paragraphs or rephrase. Adjacent cleanup is its own task.

## Why This Mode Exists

The original spec-dev had Update Mode, which conflated two operations: small mechanical sync (this mode) and structural rewrite (the [rewrite-mode](rewrite-mode.md) territory). The merger caused Agents to slide from "flip an AC" into "rephrase the whole spec" inside one task — exactly the anchoring failure mode that motivated this split.

Sync Mode keeps anchoring permission **only where anchoring is safe** (small local edits within an unchanged section). Everything else is Rewrite's job.
