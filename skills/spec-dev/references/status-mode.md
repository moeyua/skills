---
name: status-mode
description: "Detailed instructions for Status Mode: computing project progress by scanning scope and spec AC checkboxes"
---

# Status Mode — Detailed Instructions

This mode computes project progress by scanning existing documentation and test coverage. It does not generate or modify any files — it reads scope, specs, and test directories, then reports what's done, what's in progress, and what needs attention.

Uses the three-state AC system (see [concepts](concepts.md#three-state-acceptance-criteria)) as its raw input.

## How it works

1. **Read scope** — Read `docs/product/scope.md` to get the list of planned features and their priority (P0/P1/P2).

2. **Scan specs** — List all files in `docs/specs/`. For each spec, count AC by each of the three states.

3. **Cross-reference** — Match features in scope against spec files. Classify each feature:

| Status | Condition |
|--------|-----------|
| **Done** | Spec exists, all AC are `[x]` (implemented AND tested) |
| **Implemented, Untested** | Spec exists, all AC are `[x]` or `[~]`, but at least one is `[~]` |
| **In Progress** | Spec exists, some AC `[x]`/`[~]` and some `[ ]` |
| **Ready for Dev** | Spec exists, all AC are `[ ]` (spec written but no implementation) |
| **Needs Spec** | Listed in scope but no matching spec file in `docs/specs/` |

4. **Report** — Present the status grouped by category, with links to specs, AC progress counts, and test health. For "In Progress" and "Implemented, Untested" features, list actionable items so the user can see what's left.

## Output format

```markdown
## Project Status

### Done
- ✅ {feature} → [spec](docs/specs/{feature}.md) | AC: N/N | Tests: N/N

### Implemented, Untested
- ⚠️ {feature} → [spec](docs/specs/{feature}.md) | AC: X/N tested, Y/N untested
  - Untested: AC-02 {description}, AC-05 {description}

### In Progress
- 🔧 {feature} → [spec](docs/specs/{feature}.md) | AC: X/N done, Y/N untested, Z/N pending
  - Remaining: AC-04 {description}, AC-06 {description}
  - Untested: AC-03 {description}

### Ready for Dev
- 📋 {feature} → [spec](docs/specs/{feature}.md) | AC: 0/N

### Needs Spec
- ⬜ {feature} (P0)
- ⬜ {feature} (P1)

### Summary
| Status | Count |
|--------|-------|
| Done | N |
| Implemented, Untested | N |
| In Progress | N |
| Ready for Dev | N |
| Needs Spec | N |

### Test Health
| Metric | Value |
|--------|-------|
| Total AC | N |
| Tested [x] | N |
| Untested [~] | N |
| Pending [ ] | N |
```
