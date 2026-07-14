---
name: issue
description: "Create one strongly formatted Chinese GitHub Issue from natural-language development work. Use when the user asks to create, file, capture, or record a GitHub Issue. Not for planning implementation (use shape), editing existing Issues, splitting tickets, or managing Projects and task status."
when_to_use: "issue, github issue, create issue, file issue, capture work, record task, 创建 issue, 提 issue, 记录工作, 记录任务"
dispatch_intent: "Confirm one development item, format it in Chinese, and create one labeled GitHub Issue"
---

# Issue

Issue is an optional intake tool outside the core development loop. It turns one development item into one Chinese GitHub Issue, labels it with the matching named `shape` mode, returns the URL, and stops. It never starts planning or implementation.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: one user-confirmed development item becomes one strongly formatted, correctly labeled GitHub Issue
- Done when: the Issue exists in the confirmed repository with exactly one primary mode label and its canonical URL has been returned, or a blocking failure has been reported before unsafe mutation
- Evidence: the user's words and confirmation, repository facts actually inspected, `gh auth` and repository/label results, and the final `gh issue create` output
- Output: before mutation, one compact Chinese understanding card; after success, repository + label + Issue URL; after failure, the failed stage and actionable error

## Fixed Boundary

- Create exactly one new Issue per invocation.
- Use exactly one primary label: `fix`, `feat`, `refactor`, or `perf`.
- Write the title, section headings, and body in Chinese. Preserve code identifiers, commands, and proper nouns when translating them would reduce precision.
- Do not use Issue Types, Projects, Drafts, milestones, assignees, dependencies, sub-issues, or status automation.
- Do not edit existing Issues, split one request into tickets, or invoke another skill automatically.
- Do not use `brainstorm` or an unclassified fallback label. If the work remains exploratory rather than one of the four named modes, stop without mutation.

## Process

### 1. Establish one item

Use the current conversation instead of asking the user to repeat known facts. If the input contains multiple independent work items, list them briefly and ask the user to select one; never split or publish them automatically.

When the request depends on facts in the current codebase, inspect only the relevant code, docs, tests, or history before summarizing it. Verify repository-answerable facts rather than asking the user or inventing details. Do not turn this into a full project exploration.

### 2. Authenticate and resolve the repository

Run `gh auth status --active --hostname github.com` first. Use the active `github.com` identity and never ask for, read, or store a separate token.

Resolve the target in this order:

1. An explicit `OWNER/REPOSITORY` supplied by the user. Canonicalize and verify it with `gh repo view OWNER/REPOSITORY --json nameWithOwner -q .nameWithOwner`.
2. Otherwise, the current directory's repository from `gh repo view --json nameWithOwner -q .nameWithOwner`.
3. If neither resolves, ask the user for `OWNER/REPOSITORY` and perform no mutation.

Never guess from account-visible repositories, create an inbox repository, or consult a GitHub Project for scope.

### 3. Select the mode label

Choose from the same named intent axis as `shape`:

- `fix`: incorrect behavior, an error, or a regression
- `feat`: new externally observable behavior or capability
- `refactor`: internal restructuring while observable behavior stays unchanged
- `perf`: measurable latency, throughput, resource, or responsiveness improvement

If two modes remain plausible, ask one distinction-resolving question. If none applies after clarification, report that the item is not actionable under the four supported labels and stop; do not create `brainstorm` metadata or invoke `shape`.

### 4. Load the exact format and check omissions

Read [references/formats.md](references/formats.md) after selecting the label. Use exactly that mode's headings and order.

Keep only facts supported by the user or inspected evidence. A currently unknown observation is allowed only when investigating or measuring it is explicitly part of the work; state that fact as a complete Chinese sentence. An ambiguity that could change the goal, scope, constraints, or completion criteria blocks creation and requires one focused question.

### 5. Confirm understanding, not prose

Before any GitHub mutation, show only this compact card:

```text
仓库：OWNER/REPOSITORY
分类：fix | feat | refactor | perf
我理解的是：
- 目标：……
- 范围与限制：……
- 完成标准：……
遗漏或待确认：无 | ……
```

Do not show the title or full Issue body. Wait for explicit confirmation. If the user corrects or rejects anything, update the understanding or ask the one remaining question; do not create a label or Issue.

### 6. Render and self-check

After confirmation, generate a concise Chinese title without a label prefix and render the selected body template. Before mutation, verify all of the following:

- headings exactly match the selected template and stay in its order
- every required section contains confirmed content or an explicit investigation/measurement task
- no template comments, empty sections, `TODO`, `TBD`, vague placeholders, or invented facts remain
- acceptance criteria are concrete and checkable
- title and prose are Chinese except for precision-preserving identifiers, commands, and proper nouns
- the body still matches the confirmed goal, scope, constraints, and completion criteria

### 7. Ensure the selected label

Read repository labels with `gh label list --repo OWNER/REPOSITORY --limit 1000 --json name`. Compare the returned names with the selected lowercase label.

- Exact lowercase match: reuse it without changing color or description.
- No case-insensitive match: create only the selected label using the description and color in `references/formats.md`.
- A case-only conflict: stop and report the collision; do not rename or overwrite repository metadata.

Label listing or creation failure is a hard stop before Issue creation. If a new label is created but the later Issue call fails, report that partial side effect; the label remains safe to reuse.

### 8. Create once and stop

Write the generated body to a temporary file using the host's safe file-write mechanism, then run:

```bash
gh issue create \
  --repo OWNER/REPOSITORY \
  --label MODE \
  --title "中文标题" \
  --body-file BODY_FILE
```

Use a body file rather than interpolating multiline Markdown into a shell argument. Remove the temporary file after the command completes.

On success, return the canonical repository, selected label, and URL printed by `gh`, then stop. On failure, surface the Issue-creation error and do not retry automatically; an ambiguous network result can otherwise create a duplicate.

## Failure Boundary

Stop without claiming success when authentication fails, the repository is inaccessible, the repository cannot be determined, the work is multiple or unclassifiable, meaning-changing information is missing, confirmation is absent, labels cannot be read or safely created, or Issue creation fails.

Never weaken the contract by omitting the label, choosing a nearby repository, publishing an incomplete body, changing an existing label, or continuing into another skill.
