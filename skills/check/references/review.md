# Review Method

Read the complete relevant diff, applicable project instructions, and enough surrounding code to judge behavior rather than isolated syntax. Use a plan when relevant, but do not make one an entry gate or treat its claims as proof. Formal acceptance follows `references/acceptance.md`; ordinary review needs the identity of the inspected scope, not an unrelated complete-candidate protocol.

Focus where the change creates risk:

- correctness and contract-authorized compatibility;
- explicit failure, ambiguity, missing-state, and edge handling;
- scope and intent consistency, including clean breaks and alternate paths;
- coverage that can distinguish the new behavior;
- unnecessary complexity or duplication.

These are lenses, not required report sections. Report only actionable, high-confidence findings, ordered by severity. Each finding names the concrete consequence, a tight file/line location, and a repair direction without supplying a full patch. When there are no such findings, say so plainly and keep the verdict bounded by evidence actually reviewed.
