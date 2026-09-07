# Independent acceptance

Use only when the requested claim or an authoritative project contract requires independent acceptance, `accepted`, or `done`. Ordinary scoped checks report their selected scope and proof without this protocol.

## Establish the claim independently

Use a fresh context independent of the implementation trajectory. Independently establish a stable, recomputable basis for the complete claimed change. Read the original outcome and authorization boundary, candidate artifacts, local evidence and producer, and known limitations; select review, test, and e2e depth independently. A full-history fork, an Implement self-check, or legacy `done` without complete Assurance does not supply independence or missing evidence.

If the basis cannot remain stable after the conversation moves, independent judgment is unavailable, or sufficient evidence cannot be obtained, return `inconclusive`. Do not reinterpret the request as an ordinary scoped check and return a pass for weaker proof.

## Report the attestation

Report that basis and the Check producer/reference with exactly one verdict (`pass`, `findings`, or `inconclusive`) and exactly one acceptance field:

- `attested for the exact current candidate` only for a `pass` covering the original outcome, authorization, and complete current basis;
- `not established` for findings, inconclusive evidence, or incomplete candidate coverage.

Include proof actually inspected or run, limitations, and actionable findings. `not requested` describes an ordinary check outside this protocol; it is not a substitute when formal acceptance was requested.

Only a basis-matched `pass` + `attested for the exact current candidate` pair may be mechanically projected by a caller into an associated plan's `done` state. Check findings deny acceptance but do not authorize repair or produce an `approved` state. Check does not edit the plan, and a caller cannot reinterpret or manufacture a result field.

An attestation covers only the checked version. Repairs or other relevant edits require a new basis and another Check to regain acceptance. A recorded plan result is a time-scoped snapshot: later evidence supersedes it wherever available, and consumers need basis match and the latest applicable result before claiming current acceptance. Without those facts, report only the historical record or obtain a new Check; never infer missing provenance.
