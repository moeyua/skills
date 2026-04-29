---
name: verify-mode
description: "Detailed instructions for Verify Mode: reverse-check every [x] AC against actual code + tests. Downgrades unfounded markers. Uses scripts/verify.mjs for the mechanical pass; LLM only handles judgment when machine evidence is ambiguous."
---

# Verify Mode — Detailed Instructions

Verify answers a single question: **is every `[x]` marker backed by reality?**

Sync flips markers based on user-described changes. Audit checks document compliance.
Verify is the only mode that **walks back from claims to code** — for every `[x]`, find
the implementation, find the test, confirm both exist and are wired to that AC. If
either is missing, downgrade.

## Why this mode exists

`[x]` is a claim. Without verification, claims drift:

- AC marked `[x]` but tests were deleted in a refactor → silent debt
- AC marked `[x]` based on a manual smoke test that no one re-ran → false confidence
- AC marked `[x]` by Sync because "this was the change", but the test never landed → drift

Sync trusts the user's description of the change; Verify trusts only the code.

## When Verify fits

Trigger keywords: "verify the spec", "check the [x] markers", "are these AC really tested",
"我标的 [x] 是真的吗".

Concrete cases:
- After a feature ships, before declaring it done
- Before a release: spot-check that "完成" specs are actually complete
- After a refactor that touched many tests — verify nothing got marked-without-merit
- As a pre-flight before Status Mode reports "all done" to a stakeholder

## Procedure

### Step 1: Run the mechanical pass

Verify is a script-first mode. The Node script does the mechanical work; the LLM only
handles ambiguity.

```bash
node {skill-path}/scripts/verify.mjs --root . [--spec docs/specs/auth.md] [--json]
```

What the script does:

1. Parse every `docs/specs/*.md`, collect each AC's `(state, id, description, inline-test-pointer?)`
2. For each `[x]` AC:
   - Search test directories (`test/`, `tests/`, `__tests__/`, `*.test.*`, `*.spec.*`, `e2e/`) for either an inline pointer match or a `(AC-NN)` annotation matching this AC's id
   - If found: PASS
   - If not found but inline pointer is present and the file exists: WARN (test file exists, AC reference unclear)
   - If neither: FAIL → recommend downgrade to `[~]` (if implementation evidence is found) or `[ ]` (if not)
3. For each `[~]` AC:
   - Confirm implementation evidence still exists (else recommend `[ ]`)
4. Implementation evidence rule: search `src/`, `app/`, `lib/`, configured roots for tokens from the AC description (function-y identifiers, error messages, route paths). Coarse but reproducible.

Output: per-AC verdict table.

### Step 2: Read the verdict, judge edge cases

The script flags three kinds of items the LLM must judge:

| Verdict | What the LLM does |
|---|---|
| `PASS` | Trust the script. No action. |
| `DOWNGRADE-TO-TILDE` | Trust the script. Plan a Sync to flip `[x]` → `[~]`. |
| `DOWNGRADE-TO-EMPTY` | Re-read the AC description. If the AC is too abstract to ground in code (e.g., "system feels responsive"), mark as MANUAL-VERIFY-NEEDED instead — these belong in a manual checklist, not as automated `[x]`. Otherwise plan a Sync to `[ ]`. |
| `UNCLEAR` | The script couldn't find evidence but the AC mentions specific identifiers. Open the named files, judge yourself. Document the verdict in `docs/.spec-dev/decisions.md` so Audit doesn't re-ask next run. |

### Step 3: Plan the downgrade Sync (show user before applying)

Verify never edits files directly. It produces a plan to feed into Sync Mode.

```markdown
## Verify Plan

### docs/specs/auth.md
- AC-03 `[x]` → `[~]` — implementation at src/auth/login.ts:42 found; no test file references AC-03
- AC-07 `[x]` → `[ ]` — neither implementation nor test found (likely descoped; confirm with user)

### docs/specs/dashboard.md
- AC-02 `[x]` PASS — test/unit/dashboard.test.ts has `(AC-02)` annotation
- AC-05 `[x]` UNCLEAR — script found no evidence; AC mentions "throttle" but src/dashboard/ has no throttle reference. Recommend: confirm with user, then either downgrade or document the alternate location in decisions.md.

### Manual-only candidates (do not auto-downgrade)
- AC-12 `[x]` "system feels responsive" — abstract, belongs in a manual checklist. Move to docs/guides/testing.md manual section.
```

After user confirms, hand the plan to Sync Mode for the actual edits.

### Step 4: Record judgment calls in the decisions ledger

For every UNCLEAR verdict the user resolved by inspection (not by clear evidence), append
to `docs/.spec-dev/decisions.md`:

```markdown
## 2026-04-29 — auth.md AC-05

Verdict: PASS (kept as `[x]`)
Reason: throttle is implemented in shared/middleware/rate-limit.ts (different module
than the AC implies); test/unit/rateLimit.test.ts:88 covers the auth case.
Source: user inspection during /spec-dev verify run.
```

This is the judgment-stability mechanism: next Verify run loads the ledger and treats
those entries as evidence, so the same AC isn't re-flagged on every run.

## What Verify does NOT do

- It does not edit `[x]` to `[~]` directly — that's Sync's job, after user confirmation
- It does not generate missing tests — that's the user's job (or feature-dev / agent)
- It does not judge whether an AC is *well-written* — that's Audit's job
- It does not check `[ ]` AC for accidental implementation — that's Audit's drift section

## Output Format

Two artifacts:
1. **The mechanical verdict report** (from `scripts/verify.mjs`)
2. **The Verify Plan** (the LLM's downgrade proposal, see Step 3)

If the user runs Verify and everything passes:

```markdown
## Verify Report — 47/47 [x] markers verified

All [x] AC have backing implementation + test evidence.
No downgrades needed.
```

## Anti-Patterns

- **Trusting `[x]` because Sync just ran**: Sync flips based on user description; Verify exists because that description can be wrong
- **Downgrading without checking the ledger**: a previously-resolved UNCLEAR may already have an explanation in `docs/.spec-dev/decisions.md`
- **Auto-downgrading abstract AC**: "feels responsive" / "is intuitive" should not have `[x]` at all — move to manual checklist instead of bouncing them between states
- **Skipping the script and grepping by hand**: defeats the point. The script is the reproducibility floor.

## Why split from Audit

Audit is binary structural compliance. Verify is the only check that walks **claim →
reality**, and it's expensive (greps test files, reads code), so it's a separate trigger.
Audit can run on every save; Verify runs before milestones.
