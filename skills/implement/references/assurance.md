# Plan state and formal acceptance

Read this reference when maintaining an associated plan or when the requested outcome requires formal independent acceptance. Ordinary implementation without either trigger reports behavior, proof, and limitations directly.

## Maintain an associated plan

Explicit implementation authorization moves an associated `draft` or unaccepted `candidate` plan to `approved` before the first implementation edit. When Check is composed inside the active Implement invocation, that authorization remains available for in-scope repair. Check findings alone never create authorization or an `approved` state. A `done` plan is never silently replayed or reopened; new work needs explicit implementation authorization. Legacy `done` without complete Assurance is historical completion, not independent acceptance.

Once the outcome is implemented and local evidence and limitations are known, identify the complete claimed change by a stable, independently recomputable basis. In a git worktree, use the base revision plus a deterministic identity for the complete claimed diff, excluding this plan's own status and Assurance projection. Use an equivalent immutable identity for another surface. Mark the associated `approved` plan `candidate` and replace its one `## Assurance` snapshot:

- `Candidate basis`: the stable identity;
- `Candidate producer`: Implement;
- `Evidence and limitations`: proof actually produced and material gaps;
- `Check producer`: the independent Check reference, otherwise `none`;
- `Verdict`: `pass`, `findings`, `inconclusive`, or `not run`;
- `Acceptance`: `attested for the exact current candidate`, `not requested`, or `not established`.

For an ordinary scoped Check, record its actual verdict locally. A scoped `pass` records `not requested`; `findings` and `inconclusive` record `not established`, following the plan's lifecycle matrix. This projection does not fabricate a Check attestation. Missing requested acceptance stays `not established`. Without a plan, report formal acceptance evidence in the conversation and do not create an artifact.

## Obtain independent acceptance

Formal acceptance is triggered by a request for independent acceptance, `accepted` / `done`, or an authoritative project contract requiring that claim. A broad diff or pre-merge check requires the requested proof, but does not by itself create an acceptance claim.

Obtain Check in a fresh context independent of the implementation trajectory. Give the original outcome and authorization, complete candidate basis, raw artifacts, local evidence and known limitations. Let the checker establish scope and proof independently; do not supply the intended verdict or treat a full-history fork as independence. The result must identify its stable basis and Check producer/reference, exactly one verdict, and an explicit acceptance field. If independent judgment is unavailable, report the candidate and missing acceptance honestly.

Consume the exact Check result mechanically:

- A `pass` moves the associated plan to `done` only with `attested for the exact current candidate` and a matching stable basis.
- `findings` leave it at `candidate` with acceptance not established. When the active Implement authorization covers repair, move it to `approved` before editing and complete the repair; otherwise the finding does not authorize changes.
- `inconclusive` leaves it at `candidate` and identifies missing evidence. A scoped pass or absent formal fields cannot be converted into an acceptance result.

A repair or other relevant change creates a new basis; the earlier pass does not attest it. A plan's `done`/Assurance is a time-scoped snapshot. Current acceptance requires basis match and the latest applicable Check result available in context. A later finding supersedes an older pass wherever available, but read-only Check does not rewrite or reopen the plan; repair needs active or new implementation authorization. Never backfill missing provenance or create a global validity ledger.

Report the candidate or accepted state, stable basis, actual evidence and producer, applicable Check producer/reference and exact verdict + acceptance-field pair, whether its basis matches, and material limitations. Do not claim independent acceptance from Implement's own tests, dogfood, delivery state, or judgment.
