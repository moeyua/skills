# Independent verification

Use only when the user requests independent verification. Ordinary verification reports its selected scope and proof without this protocol. The result is a record: it informs repair and reporting but never decides a plan's `done` status.

## Establish the claim independently

Use a fresh context without the implementation history; a fresh subagent satisfies this. A full-history fork or an Implement self-check is not independent. Read the original outcome and authorization boundary, the changed artifacts, local evidence and its producer, and known limitations; select sufficient evidence independently, composing Review when relevant.

Observations that cannot be automated—real devices, real system UI, platform release gates—are reported as known limitations, not as reasons to withhold a verdict on what was observable. Cross-platform evidence is the PR CI; never suggest moving a session to another machine. If necessary evidence or independent judgment cannot be obtained, return `inconclusive`. Do not reinterpret the request as ordinary scoped verification and return a pass for weaker proof.

## Report the result

Report the Verify reference with exactly one verdict (`pass`, `findings`, or `inconclusive`), the scope covered, proof actually inspected or run, known limitations, and actionable findings.

Verify does not edit the plan. The caller records the reference and verdict in the plan's Assurance without reinterpreting them. Findings do not authorize repair or change plan status; an authorized repair happens in the same delivery and is recorded there. A result covers only the version it inspected; later conflicting evidence stays visible rather than being overwritten by an older pass.
