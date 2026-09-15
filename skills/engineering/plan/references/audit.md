# Planning Audit and Corrections

Read this after the selected target's generation phase ends, before Plan reports or returns to a caller. Audit once per invocation, including revisions and partial generation. Existing format validation does not replace this content review.

## Establish the inspected scope

Retain the generation result and any original stop condition. Audit the verified, readable artifacts actually produced or reused; identify missing or unattempted items without inventing their contents. If no artifact is readable, report that the audit was not run and why. Partial generation permits an audit of the available scope, not a claim that the whole requested output was reviewed.

Load [Review](../../review/SKILL.md) from the same installed collection first, then locate it among the host's available Skills if needed. Delegate this planning review to a fresh independent context with the original user request and corrections, settled decisions distinguished from recommendations, relevant project sources, the selected target, actual artifact paths/canonical URLs and content snapshots, their identifiable versions, and generation results and limitations. Do not fork the full authoring history or supply an expected verdict. The reviewer reads the actual artifacts and supporting sources; the author's summary alone is insufficient evidence.

If Review, independent execution, artifact access, or necessary evidence is unavailable, report `inconclusive` and the affected scope. Preserve the artifacts; do not substitute self-review, recreate Review from memory, install it automatically, or claim the required audit completed. This support call neither recurses into Plan nor creates another public outcome.

## Review and correct

Review checks local plans for fidelity to the request and decisions, factual grounding, bounded scope, feasible ordering and dependencies, and verification that can distinguish the requested outcome. For Issues, review the bounded problem, known evidence, constraints and observable outcome; an unknown solution or incomplete acceptance is valid for `issue`. For `both`, also check semantic consistency while preserving the plan/problem-record distinction. Report actionable defects, not stylistic preferences or adjacent improvements.

Review returns one `pass`, `findings`, or `inconclusive`, the inspected artifact versions and scope, concrete findings and material evidence gaps. This is planning review, not implementation acceptance; do not load Verify's implementation acceptance protocol or create candidate/Assurance fields.

Plan then corrects findings grounded in the original request, settled decisions and project facts within its artifact authorization. Resolve repository-answerable facts directly. For a new requirement, consequential trade-off or unresolved evidence conflict, expose the specific decision and complete unrelated, clearly authorized corrections while awaiting it. Findings do not authorize implementation or edits outside the selected target.

Reread the corrected artifacts and verify the findings and affected relationships. Preserve the original audit verdict and distinguish this targeted verification from another independent review; changing the inspected content invalidates the old verdict's coverage of the new version. Do not relabel an original `findings` as independent `pass`, loop through full audits, or recursively invoke Plan. Report any remaining defects. A new local plan stays `draft`; planning review never grants `approved`, `candidate`, `accepted` or `done`.

## Correction ownership

| target  | writable correction scope                                    | prerequisite                                                                                                            |
| ------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `local` | the local plan only                                          | no GitHub mutation                                                                                                      |
| `issue` | Issues definitively created by this invocation               | original batch completed successfully without a stop condition; exact creation snapshot still matches                   |
| `both`  | the local plan, then its verified managed problem projection | local-first; remote generation succeeded without a stop condition; managed ownership and audited projection still match |

Each selected target defines its exact ownership check and preserves its zero-write boundary. Reused Issues under `issue` remain read-only. A failed, conflicted or ambiguous original remote transaction stays stopped even if reconciliation located an artifact; audit cannot restart it. In that case, audit readable artifacts, correct an authorized local plan where applicable, and report unresolved remote findings without remote mutation.

## Remote correction transaction

Use this only when the target's correction prerequisite holds. Keep original generation statuses and ordered rows intact. Process proposed Issue corrections in original item order. An Issue gets at most one additional corrective edit in this invocation, separate from its generation create/edit. A finding does not grant a replacement Issue, identity change, adoption, or retry.

1. Read the canonical Issue and apply the selected target's baseline/ownership check. A mismatch, unreadable baseline or different bounded problem stops remote corrections before mutation. Preserve human content; do not search by title or infer ownership from association.
2. Render only the evidenced correction through `issue-formats.md`. If the writable projection is unchanged, record no correction needed without an edit. Preflight any changed type label with the existing exact lowercase metadata and case-collision rules. Report newly created labels even if the later edit fails. A label failure stops the correction batch before edit.
3. Preserve all fields outside the target's writable projection. Use a safe temporary body file outside the project for a body edit, remove it on every exit, and send only changed title/body/type-label fields to one `gh issue edit` call. A type change removes only the previous type label and adds the validated new one; unrelated labels remain untouched.
4. Read the same canonical Issue exactly once after the edit attempt. Compare its complete desired writable projection and protected content with the prewrite snapshot; for `both`, require the desired managed digest as well. Only a full target match establishes correction success. A definite failure with the original state intact is `failed`; an unmatched or unreadable result is `unknown`. An ambiguous call can be confirmed `corrected` by this read, but still stops later remote corrections.

### Correction outcomes

This table governs the correction phase only. `continue` permits consideration of the next correction; it never retries the current edit. Original generation reconciliation rules remain in the target contract.

| event                              | result    | continue |
| ---------------------------------- | --------- | -------- |
| edit-success-target-match          | corrected | yes      |
| edit-definite-failure-original     | failed    | no       |
| edit-definite-failure-target-match | corrected | no       |
| edit-ambiguous-target-match        | corrected | no       |
| edit-unmatched-or-unreadable       | unknown   | no       |
| prewrite-conflict                  | conflict  | no       |
| label-failure                      | failed    | no       |

On every stopping outcome, preserve completed corrections and mark later proposed remote corrections not attempted. No retry, rollback, or resumption of the stopped generation batch is authorized. Read-back is a time-scoped observation, not provider-level compare-and-swap.

## Closeout

Report generation results, verified identities and all labels created across both phases, the original audit scope/version and verdict, corrections and their verification, and unresolved or unreviewed items. Keep these facts distinct: an Issue may have been created successfully while its audit or correction remains incomplete. Claim planning closeout only when the required audit is established and no blocking finding remains; otherwise report the precise limited result and retain usable artifacts. This does not add an implementation approval gate or change the caller's existing authorization.
