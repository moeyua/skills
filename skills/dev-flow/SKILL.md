---
name: dev-flow
description: "Full development workflow for AI Agent-driven feature development. Handles the complete lifecycle: read spec → create branch/worktree → feature-dev → lint/test → commit → push → create PR. Use this skill when the user wants to start developing a feature end-to-end, says things like 'implement this feature', 'start working on [feature]', 'develop [spec]', references a spec file, or asks to begin a development task. This wraps around feature-dev:feature-dev and adds pre-development setup and post-development finalization. Use this instead of feature-dev when you want the full lifecycle including git workflow."
---

# Dev Flow — Full AI Agent-Driven Development Workflow

This skill orchestrates the full development lifecycle from spec to merged PR. It delegates the core development work (explore → clarify → design → implement → review) to `feature-dev:feature-dev` and handles the setup and finalization that `feature-dev` doesn't cover.

```
Phase 0: Setup     → Read spec/docs, create branch/worktree
Phase 1: Develop   → Delegate to feature-dev:feature-dev
Phase 2: Verify    → Lint, test, fix issues
Phase 3: Ship      → Commit, push, create PR
Phase 4: Follow-up → Create issues for findings, suggest doc updates
```

---

## Phase 0: Setup

Prepare everything before any development begins.

### 0.1 Identify the task

Determine what to build. The user will either:
- Reference a spec file (e.g., "implement `docs/specs/text-input-node.md`")
- Describe a feature (e.g., "add drag-and-drop to canvas")
- Reference a ticket/issue

If the user references a spec, read it. If they describe a feature, check if a matching spec exists in `docs/specs/`. If no spec exists, ask the user whether to create one first (using the doc-system skill) or proceed without one.

Structure your understanding using four elements:
- **Goal**: What change or feature to deliver
- **Context**: Relevant files, docs, error messages, existing behavior
- **Constraints**: Standards, architecture rules, compatibility requirements
- **Done-When**: Concrete acceptance criteria (tests pass, lint clean, specific behavior works)

### 0.2 Read project documentation

Read these files to build context (skip any that don't exist):

1. **`CLAUDE.md`** — Project conventions and structure (always read)
2. **`docs/specs/[feature].md`** — The specific feature spec (if exists)
3. **`docs/conventions.md`** — Coding conventions (always read if exists)
4. **`docs/architecture.md`** — System architecture (read if the feature touches multiple modules)
5. **`docs/design-system.md`** — Visual rules (read if the feature has UI)
6. **`docs/data-model.md`** — Data model (read if the feature involves state/API)
7. **`docs/business-rules.md`** — Domain rules (read if the feature involves business logic)

After reading, briefly summarize to the user what you understood about the task and what documents informed your understanding.

**Context budget**: This workflow spans many phases. Use `/compact` between phases if the context is getting heavy. Avoid reading large files in full when a targeted search suffices — treat the context window as a scarce resource.

### 0.3 Create worktree

Default to worktree — it keeps the current working directory clean and allows parallel work.

```bash
git worktree add ../[feature-name] -b feat/[feature-name]
```

Branch naming convention: `feat/[feature-name]`, `fix/[bug-name]`, `refactor/[scope]`.

Skip this step if the user is already on a feature branch or explicitly asks to use a regular branch instead.

---

## Phase 1: Develop

Delegate the entire development process to `feature-dev:feature-dev`. It handles:
- Codebase exploration
- Requirement clarification
- Architecture design
- Implementation
- Code review

Pass along all context gathered in Phase 0 (task goal, constraints, relevant docs, acceptance criteria) so `feature-dev` doesn't repeat the research.

**Do not re-orchestrate feature-dev's internal agents.** Let it run its own flow.

---

## Phase 2: Verify

After `feature-dev` completes, run lint and tests to catch anything it missed.

```bash
# Run linter (detect from package.json scripts)
pnpm lint

# Run tests if they exist
pnpm test
```

If lint or tests fail, fix the issues. If a test failure is unrelated to your changes, flag it to the user.

---

## Phase 3: Ship

Delegate to existing skills rather than implementing commit/PR logic:

1. **Commit**: Use `/commit-commands:commit` to create the commit. It handles staging, message formatting, and conventional commits.
2. **Push and PR**: Use `/commit-commands:commit-push-pr` to push and create the PR.

When invoking these skills, make sure to provide context:
- Reference the spec file in the PR body if one exists
- Include a test plan in the PR description

---

## Phase 4: Follow-up

### 4.1 Create issues for out-of-scope findings

During development and review, you may have discovered problems that shouldn't be fixed in this PR. Create GitHub Issues to track them.

Create an Issue when you find:
- **Unrelated bugs**: Bugs in existing code that aren't caused by your changes
- **Refactoring needs**: Code that works but should be improved
- **Missing documentation**: Gaps in specs, conventions, or architecture docs
- **Technical debt**: Hardcoded values, TODO comments, skipped tests
- **Follow-up features**: Ideas that emerged during development but are out of scope

```bash
gh issue create --title "[type]: short description" --body "$(cat <<'EOF'
## Context
Discovered during development of feat/[feature-name].

## Description
[What the issue is]

## Suggested action
[What should be done]

## Related
- PR: #[current-pr-number]
- Spec: docs/specs/[feature].md (if relevant)
EOF
)"
```

Label issues appropriately: `bug`, `refactor`, `docs`, `tech-debt`, `enhancement`.

**Present the list of potential Issues to the user before creating them** — let them decide which are worth tracking.

### 4.2 Suggest documentation updates

If during development you discovered:
- A pattern that should be documented → suggest updating `docs/conventions.md`
- A business rule that was implicit → suggest updating `docs/business-rules.md`
- An architectural decision → suggest writing an ADR in `docs/decisions/`
- A repeated mistake that agents keep making → suggest promoting it to a lint rule or CLAUDE.md "NEVER" rule (mechanical enforcement > documentation)

Don't update docs automatically — suggest and let the user decide.

---

## Important principles

- **Never skip phases.** Each phase has a reason. Even if the feature seems simple, setup context matters.
- **Don't duplicate feature-dev's work.** Phase 1 is a delegation, not a re-implementation.
- **Spec is the source of truth.** If code and spec disagree, ask the user which is correct.
- **Keep the diff small.** Only change what the feature requires. Don't refactor adjacent code unless the user asks.
- **Document what you learn.** If you had to figure out something non-obvious during development, that knowledge should end up in documentation, not just in your memory.
- **Environment design > agent capability.** When something goes wrong, the first question is "is the project setup clear enough?" not "is the agent smart enough?" Invest in better CLAUDE.md, linter rules, and test coverage before blaming the model.
