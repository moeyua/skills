---
name: converge
description: "Converge a project's durable memory docs (spec / PRODUCT / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README) to squire's current formats: judge each document's state, apply the matching action per document, idempotently. Use when onboarding a project to squire, completing a half-covered doc set, or realigning docs after a squire upgrade. Not for single-target doc fixes (use docs), read-only checkups (use doctor), or product philosophy changes (use shape)."
when_to_use: "converge, initialize squire docs, onboard a project, batch align docs, complete catalog docs, realign after upgrade, 收敛, 初始化文档, 上车, 批量对齐, 补齐文档, 升级后对齐"
dispatch_intent: "Batch-converge the memory catalog to squire's current formats — per-document state judgment and action, idempotent"
allowed-tools: "Bash(node *), Bash(git status*)"
---

# Converge

Converge brings a project's durable memory catalog up to squire's current formats — one document at a time. It judges each catalog artifact's state and applies the matching action; there is no project-level "new vs already-on-squire" switch. An empty project converged once is initialized; a project converged after a squire upgrade is realigned; a half-documented project is completed — same loop, same rules. Every rule here exists so convergence stays **idempotent and non-destructive**: run it twice and the second run changes nothing; run it over years of hand-written docs and none of their content is lost.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: every memory-catalog document judged (not applicable / missing / format mismatch / half-done / content drift / conformant) and converged or skipped, plus a convergence report
- Done when: each catalog artifact has a state verdict and its action applied after the required confirmation — or an explicit skip reason; an immediate rerun would skip everything
- Evidence: the sibling format specs and checker output read + each document's before-and-after + the maintainer's interview answers and confirmations
- Output: a convergence report (per document: state → action taken / skip reason) + the files written; on a stop, the exact reason (missing sibling skill / declined confirmation / no source)

## Sibling assets — missing means stop

Converge owns no format truth of its own. The desired state comes from co-installed squire skills, read at runtime:

- **Format authority**: `${CLAUDE_SKILL_DIR}/../docs/references/memory-catalog.md` — which artifacts exist, each one's Source and Boundary — and `${CLAUDE_SKILL_DIR}/../docs/references/formats/` for per-artifact structure.
- **Mechanical scan**: `node ${CLAUDE_SKILL_DIR}/../doctor/scripts/checker.ts <project-root> --json` — spec conformance, dead links, placeholders.

If either sibling is missing, stop and report that converge needs the docs and doctor skills installed alongside it — write nothing, don't reconstruct formats from memory, don't degrade to model guesses. Copying formats into converge would create a second drift source; reading the sibling's installed copy is asset reuse, not skill chaining. If Node 24+ is absent, follow doctor's own contract: note the checker skip and continue on the remaining mechanical signals (file existence, section headings) plus model judgment — only the checker's findings drop out.

## Per-document states and actions

Judge state mechanically first — the catalog's When needed field, file existence, checker findings, section headings matched against the format spec. Model judgment enters only for the content-drift tier.

| state           | judged by                                                                                                                                                                          | action                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| not applicable  | the catalog's When needed rules the artifact out for this project (e.g. DESIGN in a UI-less library)                                                                               | skip; report it as not applicable, not as a gap                                                                                     |
| missing         | file absent, and the catalog says the project needs it                                                                                                                             | create from the artifact's authoritative Source; PRODUCT and specs from nothing go through the maintainer interview (see exemption) |
| format mismatch | exists, section structure doesn't match the current format spec — whether hand-rolled or left over from an older squire format (checker conformance findings + heading comparison) | re-shell: keep all existing content, rearrange it into the current spec'd sections                                                  |
| half-done       | conformant skeleton, empty or placeholder sections                                                                                                                                 | fill the gaps from the Source; leave filled sections untouched                                                                      |
| content drift   | structure fine, claims contradict the code (model judgment)                                                                                                                        | fix the drifted claims — always with per-file confirmation                                                                          |
| conformant      | checker clean + sections match + no drift found                                                                                                                                    | skip, and say so in the report                                                                                                      |

PRODUCT is the one artifact the table doesn't fully cover: it has no format file, so the format-mismatch tier can't apply — only not-applicable and missing (via the interview exemption below) are judged. Drift in an existing PRODUCT routes to `/shape`, never through this table.

**Idempotence is the acceptance bar**: immediately rerunning converge on a just-converged project must judge every document conformant or not applicable and write nothing — `git status --porcelain` identical before and after.

## Existing content is authoritative

What the user already wrote is the source of record. Converge only rearranges structure and fills gaps; it never bulldozes existing prose to rewrite it "better" — a half-done README keeps every sentence the user put there, relocated into the spec'd sections. When existing content contradicts the code, list the contradictions and let the user pick a side; converge never picks one silently.

## Initial-creation exemption (PRODUCT and specs, from nothing only)

When PRODUCT or `specs/` don't exist at all, the maintainer interview is the authoritative source: ask, write what the maintainer states, and use code only to corroborate their statements — never to reverse-engineer intent. Sections the maintainer can't answer stay as a skeleton with a note that the source is missing; inventing content to fill them is the failure mode this exemption does not cover. The exemption ends at creation: once a document exists, content authority returns to shape (PRODUCT) and docs (specs delta).

## Tiered confirmation

- **Content-touching actions** — rearranging user-written prose, fixing content drift, interview-sourced fills — present "what changes + why" per file and get confirmation before writing.
- **Format-only alignment** — structure moves with no content change — may run as a batch, followed by an overview of everything touched.

Recommend a clean working tree before starting, so the whole convergence lands as one reviewable diff the user can revert wholesale.

## Catalog only

Converge writes memory catalog documents, and at most a `plans/` directory skeleton. It installs nothing on the host (no skills, no hooks, no CI gates, no CLAUDE.md / AGENTS.md entry files), touches no catalog-external doc, runs no dependency/CI checks (doctor's job), and does no single-target scattered fixes (docs' job — scattered findings still travel doctor → user → `/docs`).

## Report format

```
# Convergence Report — <project>

| document        | state           | action                                                  |
| README.md       | format mismatch | re-shelled into current sections; all content preserved |
| specs/          | missing         | created from interview; 2 sections skeleton (no source) |
| DESIGN.md       | not applicable  | skipped — no UI surface in this project                 |
| ARCHITECTURE.md | conformant      | skipped                                                 |

Declined / stopped: <per-file declines with what was left untouched, or none>
```

## When done

Converge stops after the report. Suggest reviewing the diff and `/commit` as the common default next step — but the project's WORKFLOW owns that edge; converge never commits, pushes, or chains onward itself.

## Boundaries

- **vs docs** — docs is single-target and awareness-driven; converge is batch convergence across the whole catalog. Once converge creates a document, maintenance authority is back with docs.
- **vs doctor** — doctor detects and reports project-wide, read-only; converge acts, but only on catalog convergence. Dependency, CI, and file-size health stay doctor's.
- **vs shape** — PRODUCT content changes and any intent reshaping are shape's; converge only creates PRODUCT from nothing, via interview.

## When to stop

Converge's failure mode is overwriting truth it doesn't own — the user's prose, or content with no source. Stop and report in these cases:

- **docs or doctor isn't co-installed** — stop before touching anything; report the missing sibling. Never rebuild their assets from memory.
- **The user declines a per-file confirmation** — leave that document untouched, record the decline in the report, and continue with the rest; if the user declines the run itself, stop.
- **The interview yields no source for a section** — leave the skeleton with a source-missing note; never invent content to complete it.
- **The urge to touch a catalog-external doc** — don't; that lane belongs to docs and requires the user to name the target.
- **The urge to rewrite existing prose "better"** — rearrange and fill only; wording that works stays.
