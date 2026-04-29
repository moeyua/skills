# spec-dev decisions ledger

This file records non-obvious judgment calls that **audit / verify** modes
made about this project's docs. Both modes load it before reporting and
treat listed entries as **resolved** — they will not re-flag the same case
on the next run unless the underlying state changes.

This is the mechanism that prevents reverse-decision flip-flopping: once a
case is judged and recorded here, the judgment sticks. To overturn, add a
**new** entry with a later date; the most recent entry for the same scope
wins.

## When to add an entry

- A `WARNING` you decided to keep as-is (audit re-flags it every run otherwise)
- An `UNCLEAR` from `/spec-dev verify` that you resolved by inspection
- A literal-blacklist rule you want suppressed for one specific file (because
  the literal IS the subject under test, e.g. a design-token-landing spec)
- An audit recommendation you chose not to follow, with reason

## When NOT to add an entry

- Errors that are real bugs (fix them, don't suppress)
- Style preferences (use `docs/.spec-dev/literals.json` for project-wide rules)
- Drafts / WIP — only record the final decision, not deliberations

## Format

Every entry is one H2 of the form `YYYY-MM-DD — <short scope>`, followed by
four required fields:

```markdown
## 2026-04-29 — auth.md AC-05

**Verdict:** PASS (kept as `[x]`)
**Scope:** docs/specs/auth.md `AC-05` (test annotation check)
**Reason:** Implementation lives in shared/middleware/rate-limit.ts (different
module than the AC text implies); test/unit/rateLimit.test.ts covers the auth
case via `(AC-05)` annotation. Verified manually.
**Source:** /spec-dev verify, 2026-04-29 session.
```

| Field | Purpose |
|---|---|
| **Verdict** | What was decided. Use the same vocabulary as the mode that produced it (PASS / KEEP / SUPPRESS-RULE / DROP-AC / etc.) |
| **Scope** | What this entry applies to — file + line / AC id / rule id. Must be specific enough that a future audit can match against it. |
| **Reason** | Why. The point is so a future you / future agent doesn't re-litigate. |
| **Source** | Which mode + when. Helps trace the decision back to the conversation that produced it. |

## How modes use this file

- **Audit Mode**: reads this file at start; suppresses or annotates findings
  whose scope matches an entry. The audit report lists suppressed items in a
  collapsed "Resolved by ledger (N)" section, so they remain auditable.
- **Verify Mode**: same — `UNCLEAR` verdicts that match a previous resolution
  are treated as PASS without re-asking the user.
- **Sync / Rewrite / Write**: do not read this file. They are forward-acting
  modes; the ledger is for *backward* judgment stability.

## Anti-patterns

- **Vague scope** (`Scope: design system stuff`) — future runs cannot match
  it, so the entry is useless. Always pin to file + AC id / rule id.
- **Append without dating** — the most-recent-wins rule needs dates. Use ISO
  format `YYYY-MM-DD`.
- **Editing past entries** — add a new entry instead. Edit history is the
  ledger's audit trail.
- **Suppressing real bugs** — if the audit caught actual rot, fix the rot.
  The ledger is for resolved ambiguities, not silenced errors.

---

<!--
Entries below this line. One H2 per decision, dated, with all four fields.
Most-recent-wins for the same scope.
-->
