# Review Method

Read the complete relevant diff, applicable project instructions, and enough surrounding code to judge behavior rather than isolated syntax. For a planning artifact, read its actual full content even when it is untracked or has no code diff, the original request and decisions, and the project sources needed to assess its claims. Use a plan when relevant, but do not make one an entry gate or treat its claims as proof. Formal implementation acceptance follows `references/acceptance.md`; ordinary review needs the identity of the inspected scope, not an unrelated complete-candidate protocol.

Focus where the change creates risk:

- correctness and contract-authorized compatibility;
- explicit failure, ambiguity, missing-state, and edge handling;
- scope and intent consistency, including clean breaks and alternate paths;
- coverage that can distinguish the new behavior;
- unnecessary complexity or duplication.

These are lenses, not required report sections. Report only actionable, high-confidence findings, ordered by severity. Each finding names the concrete consequence, a tight file/line location, and a repair direction without supplying a full patch. When there are no such findings, say so plainly and keep the verdict bounded by evidence actually reviewed.

For planning quality, apply these lenses to requirement and decision fidelity, facts, scope, executable dependencies and ordering, and verification that can distinguish the requested outcome. An Issue is a bounded problem record: do not demand an implementation design or complete acceptance when they are unknown. A paired local plan and Issue should describe the same problem without giving the Issue implementation responsibilities. Inspect whether proposed checks are applicable; do not run future implementation tests merely to give a planning review a test count. Preserve the reviewed artifact versions and any evidence gaps, and return findings to the authorized caller without editing the artifacts.
