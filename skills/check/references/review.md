# Review Method

Read the complete relevant diff, applicable project instructions, and enough surrounding code to judge behavior rather than isolated syntax. For an acceptance verdict, independently establish a stable, recomputable basis for the complete claimed change, then read the original claimed outcome and authorization boundary, the candidate evidence and its producer, and known limitations. Report the basis and Check producer/reference with the result so its applicability can be verified after the conversation moves. Use a plan when it exists, but do not make one an entry gate or treat its claims as proof.

Focus where the change creates risk:

- correctness and contract-authorized compatibility;
- explicit failure, ambiguity, missing-state, and edge handling;
- scope and intent consistency, including clean breaks and alternate paths;
- coverage that can distinguish the new behavior;
- unnecessary complexity or duplication.

These are lenses, not required report sections. Report only actionable, high-confidence findings, ordered by severity. Each finding names the concrete consequence, a tight file/line location, and a repair direction without supplying a full patch. When there are no such findings, say so plainly and keep the verdict bounded by evidence actually reviewed.
