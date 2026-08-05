# Review Method

Read the complete relevant diff, applicable project instructions, and enough surrounding code to judge behavior rather than isolated syntax. Use a plan when it exists, but do not make one an entry gate.

Focus where the change creates risk:

- correctness and compatibility;
- error and edge handling;
- scope and intent consistency;
- coverage that can distinguish the new behavior;
- unnecessary complexity or duplication.

These are lenses, not required report sections. Report only actionable, high-confidence findings, ordered by severity. Each finding names the concrete consequence, a tight file/line location, and a repair direction without supplying a full patch. When there are no such findings, say so plainly.
