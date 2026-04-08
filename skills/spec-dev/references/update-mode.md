---
name: update-mode
description: "Detailed instructions for Update Mode: syncing docs after feature-dev by updating AC status, module contracts, and suggesting ADRs"
---

# Update Mode — Detailed Instructions

This is the mode that closes the loop — used after feature-dev completes, before commit-push-pr.

## Why Update Mode exists

feature-dev produces working code but doesn't update documentation. Without this step, specs drift from reality, AC status becomes meaningless, and module contracts describe interfaces that no longer exist. Every future conversation then starts without accurate project context, and the agent makes worse decisions.

## What Update Mode does

1. **Identify what changed** — Read git diff (staged + unstaged) or ask the user what was developed. Understand which features were implemented and which modules were touched.

2. **Find related specs** — Look in `docs/specs/` for specs that correspond to the developed feature. If no spec exists (the user skipped Write Mode), note this but don't block — help them create one retroactively if they want.

3. **Update AC status** — For each spec found, go through the AC list. Check two things for each AC: is the behavior implemented in code? And does a test exist that verifies it? Mark using three states:
   - `[x]` — implemented AND has a corresponding test (unit, integration, or E2E)
   - `[~]` — implemented but NO test exists (flag to user: "AC-03 is implemented but untested")
   - `[ ]` — not yet implemented
   - Add new AC if the implementation revealed behaviors not in the original spec

   To find corresponding tests: search test directories for imports from the relevant module, test names referencing the feature, or BDD scenario keywords matching the AC description.

4. **Update module contracts** — For each module that was modified:
   - Check if the public API changed (new exports, removed exports, renamed functions) — update the name/purpose table, NOT signatures (those live in code)
   - Check if new dependencies were introduced
   - Check if invariants still hold or need updating
   - Update `docs/modules/{module}.md` accordingly
   - If a new module was created and no contract exists, offer to create one

5. **Update BDD scenarios** — Check if the spec's BDD Gherkin scenarios still match the implemented behavior:
   - If implementation added new user-visible paths not covered by existing scenarios, propose new ones
   - If implementation changed behavior described by an existing scenario, update it
   - If a scenario describes behavior that was descoped or changed, flag it for removal
   - If using manual testing: update the manual test checklist to match any changed/added scenarios
   - Skip this step if the spec has no BDD scenarios (small features)

6. **Check for ADR candidates** — During development, architectural decisions are often made implicitly. Look for:
   - New dependencies added to package.json
   - New architectural patterns introduced (e.g., first use of a state machine, new data fetching pattern)
   - Technology choices made (e.g., chose library X over library Y)
   - Significant refactoring of existing patterns
   - If any are found, ask the user if they want to record an ADR in `docs/decisions/`

7. **Update CLAUDE.md if needed** — If the project structure changed significantly (new directories, new key files), update the project structure section and documentation index in CLAUDE.md.

## Output format

Present a summary to the user:

```markdown
## Update Report

### Specs Updated
- docs/specs/{feature}.md: AC-01 [x], AC-02 [x], AC-03 [~] implemented but untested, AC-04 [ ]

### Test Coverage Gaps
- AC-03 ({description}): implemented but no test found — add unit test?

### BDD Scenarios Updated
- docs/specs/{feature}.md: added scenario for error path discovered during dev

### Module Contracts Updated
- docs/modules/{module}.md: added `newMethod()` to public API

### ADR Candidates
- Chose {library} for {purpose} — want to record this? (y/n)

### CLAUDE.md
- No changes needed / Updated project structure
```
