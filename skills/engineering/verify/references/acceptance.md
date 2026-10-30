# Independent verification

Use only when the user requests independent verification. Ordinary verification reports its selected scope and proof without this protocol. The result is a record: it informs repair and reporting but never decides a plan's `done` status.

## Establish the claim independently

Use a fresh context without the implementation history; a fresh subagent satisfies this. A full-history fork or an Implement self-check is not independent. Read the original outcome and authorization boundary, the changed artifacts, local evidence and its producer, and known limitations. Independently use the affected feature through its real entry point following [the end-to-end method](e2e.md), compare expected and observed behavior, and select supporting checks and Review where relevant. Implementation reports alone do not supply this observation.

Determine what can be exercised with the available tools and environment; do not classify real devices or system UI as unavailable merely by category. Report genuinely unavailable observations as known limitations and complete unaffected work. Cross-platform evidence is the PR CI; never suggest moving a session to another machine. Established defects yield `findings`; without a demonstrated defect, missing necessary runtime evidence or independent judgment yields `inconclusive`. A pass requires actual use supporting the original feature claim. Do not reinterpret the request as ordinary scoped verification and return a pass for weaker proof. These verdicts remain evidence records and do not control a plan's `done` status.

## Report the result

Report the Verify reference with exactly one verdict (`pass`, `findings`, or `inconclusive`), the scope covered, actual operations and their expected versus observed results, supporting proof, known limitations, and actionable findings.

Verify does not edit the plan. The caller records the reference and verdict in the plan's Assurance without reinterpreting them. Findings do not authorize repair or change plan status; an authorized repair happens in the same delivery and is recorded there. A result covers only the version it inspected; later conflicting evidence stays visible rather than being overwritten by an older pass.
