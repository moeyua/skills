# Scoped Deep-dive

Load this reference after Explore's fixed Overview when the user names a scope or the invoking task depends on a module, behavior, or cross-cutting area.

Cover the dimensions that can change the downstream answer:

1. **Responsibility and boundary** — what the scope owns and explicitly does not own.
2. **Interface and usage** — entry points, public API, configuration, inputs, outputs, and callers, with paths or line locations.
3. **Internal flow** — core control/data paths and the structures moving through them.
4. **Dependencies and blast radius** — what the scope depends on and what depends on it.
5. **Related claims** — relevant docs and what they claim, clearly attributed.
6. **Quality picture** — tests, failure handling, and the commands that exercise the scope when risk or the task makes them relevant.
7. **History and known limitations** — recent hotspots, explicit limitations, and deferred work when they affect the requested understanding.

Core exploration normally needs the first five. Add quality and history for high-risk, cross-module, durable-truth, regression, or explicitly deep requests. Omit an irrelevant dimension instead of padding it; use `N/A` only when a fixed inventory requires an explicit row.
