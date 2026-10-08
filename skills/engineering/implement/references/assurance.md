# Plan state and independent verification

Read this reference when maintaining an associated plan or when the user requests independent verification. Ordinary implementation without either trigger reports behavior, proof, and limitations directly.

## Maintain an associated plan

Explicit implementation authorization moves an associated `draft` plan to `approved` before the first implementation edit. When Debug, Review, or Verify is composed inside the active Implement invocation, that authorization remains available for in-scope repair. Findings alone never create authorization or an `approved` state. A `done` plan is never silently replayed or reopened; new work needs explicit implementation authorization.

Once the described implementation is complete and the project's required automated verification passes, mark the associated plan `done` and replace its one `## Assurance` record in the working tree, beside the code changes. Implement does not commit; Publish delivers the plan with the code in the same PR. Nothing after merge changes the status.

- `Evidence and limitations`: tests and checks actually run, Review results, and known limitations;
- `Verify`: the optional independent Verify reference and its verdict, otherwise `not run`.

Observations that cannot be automated—real devices, real system UI, platform release gates—go into known limitations and never block `done`. Cross-platform evidence is the PR CI: name it as the source without waiting for its result or adding a later commit, and never suggest moving a session to another machine. If CI or an optional Verify reports problems before merge and the repair is authorized, fix them in the same PR and update the Assurance record; the status stays `done`.

Read a legacy plan whose implementation has merged as `done`, following the plan template's legacy status table. Missing records never make a plan incomplete; do not rewrite or backfill legacy plans. Without a plan, report evidence in the conversation and do not create an artifact.

## Optional independent Verify

Run an independent Verify only when the user requests one. Obtain it in a fresh context without the implementation history—a fresh subagent satisfies this—using the [Verify independent protocol](../../verify/references/acceptance.md). Give it the original outcome and authorization, the changed artifacts, local evidence, Review findings, and known limitations; do not supply an intended verdict. Record its reference and verdict in the plan's Assurance. The result informs repair and reporting; it does not decide `done`.

Report the plan status, the evidence actually produced and its producer, any Verify reference and verdict, and material limitations. Do not present Implement's own tests or judgment as an independent Verify.
