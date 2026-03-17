---
name: dev-flow
description: "Full development workflow for AI Agent-driven feature development. Handles the complete lifecycle: read spec → create branch/worktree → explore codebase → clarify requirements → design architecture → implement → quality review → lint/test → commit → push → create PR. Use this skill when the user wants to start developing a feature end-to-end, says things like 'implement this feature', 'start working on [feature]', 'develop [spec]', references a spec file, or asks to begin a development task. This wraps around the feature-dev agents (code-explorer, code-architect, code-reviewer) and adds pre-development setup and post-development finalization. Use this instead of feature-dev when you want the full lifecycle including git workflow."
---

# Dev Flow — AI Agent 驱动的完整开发流程

This skill orchestrates the full development lifecycle from spec to merged PR. It wraps around the feature-dev agents for the implementation phase and adds the missing pre/post workflow.

```
Phase 0: Setup     → Read docs, create branch/worktree
Phase 1: Explore   → Understand existing codebase (code-explorer agents)
Phase 2: Clarify   → Ask questions before building
Phase 3: Design    → Propose architecture (code-architect agents)
Phase 4: Implement → Write code
Phase 5: Review    → Quality check (code-reviewer agents)
Phase 6: Finalize  → Lint, test, commit, push, create PR
```

---

## Phase 0: Setup

This phase prepares everything before writing any code. Do all of these steps before proceeding.

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

## Phase 1: Explore

Understand the existing codebase before making changes. Launch 2-3 `feature-dev:code-explorer` agents in parallel, each exploring a different aspect relevant to the feature:

- **Similar features**: How does the codebase handle similar patterns? What can be reused?
- **Integration points**: What existing code will this feature connect to?
- **Architecture context**: What are the module boundaries, data flows, and component hierarchies?

After agents return, read all key files they identified. Present a consolidated summary of:
- Existing patterns to follow
- Code to reuse or extend
- Files that will need modification
- Potential challenges

---

## Phase 2: Clarify

Before designing anything, identify ambiguities. Review:
- The spec (if exists) — are there missing acceptance criteria?
- The codebase exploration — did you find conflicting patterns?
- Edge cases — what happens when things go wrong?

Present all questions to the user in a clear, organized list. Group by category (scope, behavior, UI, data, error handling).

**Wait for answers before proceeding to Phase 3.** Do not make assumptions about unresolved questions.

---

## Phase 3: Design

Launch 2-3 `feature-dev:code-architect` agents with different approaches:

- **Minimal change**: Smallest possible diff, maximum reuse of existing code
- **Clean architecture**: Best long-term maintainability, even if more files change
- **Pragmatic balance**: Speed + quality tradeoff

Each agent should be aware of the project's conventions (from docs/conventions.md) and architecture (from docs/architecture.md).

Present the approaches to the user:
- Brief summary of each approach
- Which files each would create/modify
- Trade-offs
- Your recommendation with reasoning

**Wait for user to choose an approach before proceeding to Phase 4.**

---

## Phase 4: Implement

Only start after the user explicitly approves the design.

1. Read all relevant files identified in previous phases
2. Implement the feature following the chosen approach
3. Follow all conventions from `docs/conventions.md` and `CLAUDE.md`
4. If the feature has UI, follow `docs/design-system.md`
5. Keep changes focused — don't refactor unrelated code

During implementation, if you discover something that contradicts the spec or design, stop and ask the user rather than making assumptions.

---

## Phase 5: Review

Launch 3 `feature-dev:code-reviewer` agents in parallel, each focusing on a different aspect:

- **Correctness**: Logic errors, edge cases, spec compliance
- **Code quality**: DRY, readability, complexity, conventions adherence
- **Security & performance**: Vulnerabilities, unnecessary re-renders, memory leaks

Consolidate findings and present to the user:
- Critical issues (must fix)
- Suggestions (nice to have)
- For each issue: file, line, what's wrong, suggested fix

**Ask the user which issues to fix.** Then apply the fixes.

If the review reveals a systematic issue that should be documented (e.g., a pattern the project should always follow), suggest adding it to `docs/conventions.md`.

**Beyond code review**: Also check if the project's linter could catch the issue mechanically. A custom lint rule with a clear error message (explaining _why_ it's wrong and _how_ to fix it) is more reliable than any review — the error message gets injected directly into agent context on future violations.

---

## Phase 6: Finalize

### 6.1 Run lint and tests

```bash
# Run linter (detect from package.json scripts)
pnpm lint

# Run tests if they exist
pnpm test
```

If lint or tests fail, fix the issues. If a test failure is unrelated to your changes, flag it to the user.

### 6.2 Commit and create PR

Delegate to existing skills rather than implementing commit/PR logic:

1. **Commit**: Use `/commit-commands:commit` to create the commit. It handles staging, message formatting, and conventional commits.
2. **Push and PR**: Use `/commit-commands:commit-push-pr` to push and create the PR.

When invoking these skills, make sure to provide context:
- Reference the spec file in the PR body if one exists
- Include a test plan in the PR description

### 6.3 Create Issues for out-of-scope findings

During development and review, you may discover problems that shouldn't be fixed in this PR. Instead of ignoring them or bloating the current PR, create GitHub Issues to track them.

Create an Issue when you find:
- **Unrelated bugs**: Bugs in existing code that aren't caused by your changes
- **Refactoring needs**: Code that works but should be improved (e.g., duplicated logic, outdated patterns)
- **Missing documentation**: Gaps in specs, conventions, or architecture docs
- **Technical debt**: Hardcoded values, TODO comments, skipped tests
- **Follow-up features**: Ideas or requirements that emerged during development but are out of scope

Use this format:
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

Present the list of potential Issues to the user before creating them — let them decide which are worth tracking.

### 6.4 Post-development documentation

If during development you discovered:
- A pattern that should be documented → suggest updating `docs/conventions.md`
- A business rule that was implicit → suggest updating `docs/business-rules.md`
- An architectural decision → suggest writing an ADR in `docs/decisions/`
- A repeated mistake that agents keep making → suggest promoting it to a lint rule or CLAUDE.md "NEVER" rule (mechanical enforcement > documentation)

Don't update docs automatically — suggest and let the user decide.

---

## Important principles

- **Never skip phases.** Each phase has a reason. Even if the feature seems simple, the exploration phase might reveal important context.
- **Always wait for user confirmation** before Phase 4 (implementation) and after Phase 5 (review). Don't auto-proceed.
- **Spec is the source of truth.** If code and spec disagree, ask the user which is correct.
- **Keep the diff small.** Only change what the feature requires. Don't refactor adjacent code unless the user asks.
- **Document what you learn.** If you had to figure out something non-obvious during development, that knowledge should end up in documentation, not just in your memory.
- **Environment design > agent capability.** When something goes wrong, the first question is "is the project setup clear enough?" not "is the agent smart enough?" Invest in better CLAUDE.md, linter rules, and test coverage before blaming the model.
- **Patterns replicate — including bad ones.** Agents copy existing code patterns. If the codebase has inconsistent styles or outdated patterns, agents will reproduce them. Keep reference code clean.
