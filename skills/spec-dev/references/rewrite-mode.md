---
name: rewrite-mode
description: "Detailed instructions for Rewrite Mode: produce new doc content from scratch using sequential isolation. Old version is treated as a facts pool, never as a structural template. Use this for format conversion (legacy → SDD), structural restructuring, fundamentally-changed behavior, or any case where the existing structure should not bias the new one."
---

# Rewrite Mode — Detailed Instructions

Rewrite is the canonical solution to a single problem: when an Agent (or human) is given old content + new rules and asked to produce a new version, they tend to **anchor on the old structure** and end up patching rather than truly rewriting. The new version inherits the bones of the old version even when those bones are wrong.

This mode enforces a procedure that breaks anchoring: **sequential isolation**. The target structure is designed *before* any old content is in working context.

## When Rewrite Fits

Trigger keywords: "重写 X", "regenerate the doc", "用新的格式", "this section is wrong from the start".

Concrete cases:
- Format conversion: legacy free-form doc → SDD WHAT/HOW/VERIFY layout
- Restructuring: the doc's section organization no longer matches the code or the mental model
- Fundamental behavior change: the spec's premise is gone, what's left is just facts
- Mass split / merge: code split one module into three (or merged three into one), and the doc needs to follow
- Recovering from accumulated patches: when so many small edits have layered on the doc that it's incoherent

## The Sequential Isolation Principle

The Agent's failure mode this mode was designed against:

> Given old content + new rules, the Agent's "rewrite" output is anchored on the old structure. Specific content beats abstract rules in attention allocation. The new version inherits old structural assumptions even when those assumptions are wrong.

The countermeasure is procedural: **structure must be designed without old content visible**. Then, and only then, old content enters as a facts pool.

This is not a politeness, it's a hard requirement. Holding "new structure" and "old content" in attention simultaneously means concrete (old) wins over abstract (new). The two phases must be sequential.

## Procedure

### Step 1: Define inputs (before anything else)

Three inputs must be identified before proceeding:

1. **Target type** — what kind of doc is this? (feature spec / module contract / ADR / architecture doc / convention guide)
2. **Target rules** — what conventions and templates apply? (See [templates-what](templates-what.md), [templates-how](templates-how.md), [templates-claude](templates-claude.md))
3. **Source of truth** — where does the *content* come from? Options:
   - **Code** (for module contracts, behavior specs against existing code)
   - **User intent / new spec** (when the user explains what the doc should now describe)
   - **Both** (a behavior change that's been implemented — code is reality, user describes intent)
   - **Old version's facts only** (when conventions changed but content is still accurate; rare)

Do **not** include the old doc version as an input here. The old version is a facts pool, not an input. It enters in Step 3.

### Step 2: Pass 1 — Design target structure (NO old version in context)

Hard constraint: **before this step, do not read the old doc**. If it's already in your context window, do not reference it. Treat it as if it doesn't exist.

Produce, from rules + source of truth alone:
- **Section list** — what sections will the new doc have, in what order?
- **Section purposes** — one line per section: what does this section answer?
- **Format constraints** — frontmatter, AC numbering, BDD scenarios, etc.

Output the structure to the user for confirmation before proceeding to Step 3:

```markdown
## Rewrite Plan: docs/specs/auth.md (Pass 1 — structure)

Sections:
1. **Goal** — the user-visible behavior this feature provides
2. **Scope** — what's in vs explicitly out
3. **Behavior constraints** — rules that govern how the feature must behave
4. **State machine** — auth state transitions
5. **Acceptance Criteria** — AC-01..AC-NN with three-state markers
6. **BDD Scenarios** — Given/When/Then for happy and error paths
7. **Verification** — how each AC maps to a test
8. **Out of Scope** — explicitly excluded behaviors

Source of truth: user-provided new spec + current code in src/auth/

Structure designed without reading the existing docs/specs/auth.md.
```

Wait for user confirmation. The user may correct the structure if they have a different mental model — that correction is much cheaper now than after content is written.

### Step 3: Pass 2 — Port facts from old version (now opened as facts pool)

Now open the old doc. **Read it explicitly looking for facts**, not structure. For each meaningful piece of content, decide:

- Which section in the new structure does this fact belong to?
- Or is it obsolete and should be dropped?

Record each fact + its destination section:

```markdown
## Pass 2 — Fact extraction

Fact: "AC-03: session expires after 30 min idle" → new Section 5 (Acceptance Criteria)
Fact: "AC-07: cookie is HttpOnly" → new Section 5
Fact: "Background: legacy session table will be dropped after migration" → DROP (no longer relevant)
Fact: "BDD: user logs in with expired token → 401" → new Section 6 (BDD Scenarios)
Fact: "Note: see ADR-005 for token TTL rationale" → new Section 7 (cross-reference)
```

Then write each section, drawing facts from this list. **The old version's section ordering and wording are not used as templates.** Only the underlying facts are.

### Step 4: Pass 3 — Completeness check

After writing the new doc, verify nothing important from the old version was lost:

- Walk through the old version one more time
- For each fact, confirm it's either in the new doc OR explicitly dropped (with reason)
- Document any intentional drops in a side note

```markdown
## Facts intentionally dropped

- "Background: legacy session table" — feature shipped, no longer relevant
- "Notes section about prototype" — superseded by current implementation
- Three TODO comments dating from 2025 — addressed in commits abc123, def456, ghi789
```

This step catches "the rewrite forgot AC-12" before it ships.

### Step 5: Audit pass

Run [audit-mode](audit-mode.md) on the rewritten doc to confirm structural compliance.

## Special Case: Format Conversion (legacy → SDD)

When the trigger is "convert legacy non-SDD docs to spec-dev's WHAT/HOW/VERIFY layout", the principle is the same (target structure first, old as facts pool), but Step 1 has an extra sub-step: **decide where each old doc's content belongs (spec-dev managed, or upstream PRODUCT.md / DESIGN.md, or drop), then run Steps 2-4 for each target doc independently**.

Common legacy → target mappings:

| Legacy doc | Destination | Action |
|---|---|---|
| `PRD.md` | Mostly **`PRODUCT.md`** (root, upstream — out of spec-dev scope) + extract per-feature behavior into `docs/specs/{name}.md` + extract decisions into `docs/decisions/{NNN-slug}.md` | Per-feature behavior is spec-dev's job; product positioning / users / brand goes in PRODUCT.md (do not produce that file inside spec-dev — flag for the user) |
| `architecture.md` (legacy free-form) | `docs/architecture.md` (WHAT) | Produce new `architecture.md` (system structure + module registry) |
| `conventions.md` (legacy free-form, code rules) | `docs/guides/conventions.md` (HOW) | Produce new code-conventions doc |
| `design-system.md` / `design-tokens.md` | **`DESIGN.md`** (root, upstream — out of spec-dev scope) | Flag for user; do not produce inside `docs/` |
| `specs/*.md` (legacy free-form) | `docs/specs/*.md` (WHAT + VERIFY) | For each, produce SDD-format spec with Scope + AC + BDD + TDD pointers |
| `decisions/*.md` | `docs/decisions/*.md` (HOW) | Usually keep in place (already SDD-shaped); verify status field |
| `tasks.md` / `todo.md` | — | Drop (use issue tracker) |
| `data-model.md` (copied schemas) | `docs/modules/*.md` (WHAT, in module contracts) | Replace with **path references** to source files; do not copy schemas |

**Pre-rewrite test scan** (for converting legacy specs):
Before producing the new spec, scan test directories to determine each AC's correct three-state status:
- Test exists + passes → `[x]`
- Implementation exists + no test → `[~]` (test debt, flag explicitly)
- Neither → `[ ]`

This avoids the trap of marking everything `[x]` based on legacy doc claims.

**Dependency ordering for multi-doc conversion:**
When rewriting many legacy docs at once, do them in this order to avoid forward references:
1. **Flag upstream docs to the user** — if `PRODUCT.md` / `DESIGN.md` content needs to be extracted, surface that as a separate task for the user; spec-dev does not produce those files
2. Create directory skeleton (`docs/{modules,guides,decisions}/`)
3. Move/produce HOW-layer docs first (no upstream dependencies)
4. Supplement missing ADRs for previously-undocumented decisions
5. Produce `architecture.md` (system structure + module registry)
6. Produce WHAT-layer module contracts (with source file pointers, not copied signatures)
7. Produce WHAT+VERIFY-layer specs (with three-state AC seeded from test scan)
8. Update `CLAUDE.md` documentation index (including links to `PRODUCT.md` / `DESIGN.md` if present)
9. Delete obsolete legacy files (only after their content is verified ported)

After all docs are produced, run [audit-mode](audit-mode.md) to verify cross-references and layer integrity.

## Strict Rules

These are not preferences. The procedure depends on them:

1. **Pass 1 must complete before Pass 2 begins.** No exceptions. The structure exists in writing before old content is read.
2. **Old version is a facts pool, never a template.** If you find yourself copying old wording, stop — extract the underlying fact and re-state it in the new section's voice.
3. **Avoid the words "rewrite", "improve", "refine", "update" when prompting yourself or sub-actions.** Use "produce", "generate", "from scratch", "discard old structure". Word choice biases default behavior.
4. **Show the structure plan (Step 2 output) to the user before content is written.** Restructure cost at this stage is minutes; after content is written, hours.
5. **Document intentional drops.** Any fact in old version not present in new version must be flagged with reason. Silent drops are how content disappears unnoticed.

## Output

Three artifacts produced in order:

1. **The structure plan** (Step 2, shown to user, confirmed)
2. **The fact inventory** (Step 3, internal working note)
3. **The new doc** (Step 3 + 4 result)

Plus a side note listing intentionally dropped facts (Step 4).

## When You Realize You're Anchoring Anyway

Mid-write, signs that anchoring is sneaking back in:
- You're writing sections in the same order as the old doc
- You're using phrases that sound like the old doc's wording
- You're tempted to "preserve this paragraph because it's good"
- You're transcribing the old structure with light edits

If any of these: **stop, close the old doc, re-derive the section from facts + rules alone**. The pull is automatic; correcting requires explicit action.

## Why This Mode Exists

In agent-assisted documentation, the modal failure is not "agent refuses to rewrite" — it's "agent rewrites in name only, while structurally preserving the old version". This mode exists because the failure is procedural (anchoring is automatic) and so the fix must be procedural too.

The original spec-dev had three modes that all lived in this territory — Update (sync), Refine (drift correction), Migrate (format conversion). The first conflated mechanical patching with structural rewriting; the second and third both ended up "patching the old version with new rules" rather than truly rewriting. This mode collapses the rewrite-aspect of all three into one place with strict procedural discipline.

Use [sync-mode](sync-mode.md) when changes are mechanical and local. Use this mode when the structure itself is wrong.
