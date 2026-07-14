---
mode: feat
title: Add focused GitHub Issue capture skill
created: 2026-07-14
status: done
---

# Add focused GitHub Issue capture skill

## Building

Add a standalone `issue` skill that turns one natural-language development item into one strongly formatted Chinese GitHub Issue. It resolves an explicit or current repository, classifies the work using the four existing named `shape` modes, confirms a compact understanding card with the user, ensures the matching label exists, creates the Issue through the current `gh` identity, and returns the Issue URL.

## Not building

- GitHub Projects, Project Drafts, repository synchronization, status tracking, or lifecycle automation.
- Editing, organizing, splitting, linking, or closing existing Issues.
- Issue Types, milestones, assignees, dependencies, sub-issues, or background automation.
- Automatic chaining into `shape`, `implement`, `pr`, or any other skill.
- Per-repository Issue Forms, templates, configuration files, or a repository allowlist.
- A `brainstorm` label or an unclassified fallback label.
- A runtime formatter or validation helper in the first version.

## Approach

1. **Recommended — prose-led skill with one centralized format reference.** Keep repository resolution, the compact confirmation gate, label handling, GitHub mutation, and failure rules in `SKILL.md`; keep the four exact Chinese body schemas in one reference; call `gh` directly. This keeps the public behavior strong while avoiding another orchestration layer.
2. **Add a deterministic formatter/validator helper immediately.** A script could mechanically reject missing sections, but it would introduce a CLI contract, fixtures, error recovery, and maintenance before real usage has shown that the prose contract drifts.
3. **Deploy GitHub Issue Forms or templates to every repository.** GitHub would enforce more of the form natively, but every repository would carry a copy that must be installed and updated, recreating the distributed maintenance problem this skill is meant to avoid.

## Premise collapse

This plan assumes an exact centralized reference plus a mandatory pre-create self-check is sufficient for agents to render the four Chinese formats consistently. If isolated behavior checks show repeated schema drift, implementation stops and returns to shape to add a small deterministic validator; it does not weaken the format contract or expand into Project orchestration.

## Key decisions

1. `issue` is optional intake outside the core loop and stops after creation — recording work must not silently start planning or implementation.
2. Each invocation creates exactly one Issue — multiple independent items are surfaced for user selection rather than auto-split.
3. Repository resolution is explicit repository first, current GitHub repository second, and a user question otherwise — no guessing, inbox repository, Project scope, or account-wide discovery.
4. The only primary labels are `fix`, `feat`, `refactor`, and `perf`, matching `shape` named modes — `brainstorm` remains a conversational mode rather than durable Issue metadata.
5. Every Issue has exactly one primary mode label — the skill reuses an existing exact-name label or creates only the selected missing label before creating the Issue; existing label metadata is never rewritten.
6. The title, headings, and body are Chinese — label names remain the exact English mode names so Issue intake and `shape` share one taxonomy.
7. The user confirms intent, scope, constraints, and completion criteria through a compact understanding card — the generated full body is not presented for line-by-line review.
8. The skill never invents missing facts — a genuinely unknown observation may be recorded as work to investigate or measure, while ambiguity that could change the task blocks creation and triggers one focused question.
9. GitHub operations reuse the active `gh` authentication and retain no credentials — label or Issue mutation failures are surfaced without unsafe fallback or blind retries.

## Architecture

None — this is one standalone skill with one directly loaded format reference and direct `gh` calls; it adds no shared runtime layer, service, cross-skill data flow, or dependency.

## Public surface changes

- **Public API**: `/issue <natural-language work>` and natural-language triggers such as “create an issue”, “record this work”, and “创建 issue”.
- **Inputs**: one development item; an optional explicit `OWNER/REPOSITORY`; otherwise a current directory resolvable by `gh repo view`; enough confirmed facts to select `fix`, `feat`, `refactor`, or `perf` and state what completion means.
- **Valid classifications**:
  - `fix`: incorrect behavior or regression.
  - `feat`: new externally observable capability or behavior.
  - `refactor`: internal restructuring with observable behavior preserved.
  - `perf`: measurable latency, throughput, resource, or responsiveness improvement.
- **Confirmation output**: a short Chinese card containing repository, selected label, understood goal, scope and constraints, completion criteria, and any remaining omissions; it never includes the full generated body.
- **Success output**: repository, selected label, and canonical GitHub Issue URL.
- **Failure output**: the failed stage and actionable `gh` error; no success claim and no automatic retry.
- **Side effects**: create the selected exact-name repository label when absent, then create one Issue with that label after confirmation.
- **Not exposed**: GitHub tokens, Project node IDs, a public formatter CLI, repository-local templates, label lifecycle management, or automatic workflow chaining.

## Spec delta

## ADDED Requirements

### Requirement: 单条自然语言工作创建为 GitHub Issue

系统 SHALL 将一条信息充分的自然语言开发工作整理为一个中文 GitHub Issue；显式仓库优先，否则使用当前 GitHub 仓库，仍无法确定时必须先询问，不得猜测目标或创建多个 Issue。

#### Scenario: 当前仓库创建单个 Issue

- GIVEN 当前目录可解析为有权限的 GitHub 仓库且输入描述一项完整工作
- WHEN 用户确认简短理解卡片
- THEN 系统在该仓库创建且只创建一个 Issue，并返回 canonical URL

### Requirement: 分类与 shape named modes 对齐

系统 SHALL 只使用 `fix`、`feat`、`refactor`、`perf` 四个主 label，并根据工作意图选择恰好一个；不得使用 `brainstorm`、Issue Type 或未分类兜底。

#### Scenario: 缺失 label 按需创建

- GIVEN 目标仓库缺少选中的 exact-name label
- WHEN 用户确认创建
- THEN 系统先创建当前所需 label，再用该 label 创建 Issue，且不初始化其他 labels

### Requirement: 中文强格式正文

系统 SHALL 使用中文标题、中文 section 标题和中文正文，按所选 mode 渲染集中定义的精确结构；所有必需 section 必须有确认事实或明确的待调查/待测量语义，不得为空、使用占位符或编造信息。

#### Scenario: fix 正文保留问题事实

- GIVEN 用户提供问题表现、已知复现信息和预期结果
- WHEN 系统生成 `fix` Issue
- THEN 正文包含中文的背景、问题描述、复现步骤、预期行为、实际行为、范围和验收标准，且内容与用户确认的理解一致

### Requirement: 创建前只确认理解摘要

系统 SHALL 在任何 GitHub mutation 前展示仓库、分类、目标、范围与限制、完成标准和遗漏项组成的简短理解卡片并等待明确确认；不得要求用户审阅完整 Issue 正文。

#### Scenario: 用户拒绝理解卡片

- GIVEN 系统已经生成理解卡片
- WHEN 用户否认或修正其中任一事实
- THEN 系统继续澄清或更新理解，不创建 label 或 Issue

### Requirement: GitHub mutation 安全失败

系统 SHALL 使用当前 `gh` 登录身份；认证、仓库访问、label 创建或 Issue 创建失败时必须报告失败阶段并停止，不得静默省略主 label、改写已有 label 元数据或盲目重试 Issue 创建。

#### Scenario: label 创建无权限

- GIVEN 目标仓库缺少所需 label 且当前身份无权创建 label
- WHEN 系统准备创建 Issue
- THEN 系统报告 label 阶段失败，并且不创建未分类 Issue

## Implementation steps

1. Add the standalone Issue contract and exact format source.
   - outcome: `issue` is initialized using the skill-creator scaffold and conformed to Squire’s four-field frontmatter and Outcome Contract; its `SKILL.md` defines single-item intake, repository resolution, compact confirmation, label preflight/creation, direct `gh issue create`, and stop conditions; one reference contains the exact Chinese `fix`, `feat`, `refactor`, and `perf` schemas plus the shared title/body rules; shared cross-skill rule symlinks are present and no unused generated files remain.
   - scope: `skills/issue/SKILL.md`, `skills/issue/references/formats.md`, `skills/issue/references/anti-patterns.md`, `skills/issue/references/durable-context.md`
   - verify: inspect each format against the approved headings and run `pnpm test` to exercise skill discovery, frontmatter, references, and Outcome Contract checks.
2. Make the new public behavior routable and mechanically lock its schema.
   - outcome: resolver routing treats `issue` as optional intake outside the core loop; the persistent spec records repository selection, compact confirmation, four-label classification, on-demand label creation, Chinese formatting, and failure boundaries; repository-private tests assert the exact four-label vocabulary, absence of `brainstorm`, Chinese required headings, and one centralized schema per mode without adding a runtime helper.
   - scope: `skills/RESOLVER.md`, `specs/issue/spec.md`, `tests/issue.test.ts`
   - verify: `pnpm exec vp test run tests/issue.test.ts tests/smoke/verify-skills.test.ts`
3. Align durable product and maintainer documentation with the focused capability.
   - outcome: English and Chinese READMEs list `issue` as the eleventh skill and describe its compact create-only flow; PRODUCT places it outside the mandatory core loop and preserves the boundary against project management; ARCHITECTURE records the standalone `SKILL.md` plus format-reference design, direct `gh` side effects, label taxonomy reuse, and the absence of cross-skill automation.
   - scope: `README.md`, `README.zh-CN.md`, `PRODUCT.md`, `ARCHITECTURE.md`
   - verify: search all changed docs for stale skill counts, Project/Draft/Sync claims, and contradictory workflow edges; run `pnpm test`.
4. Verify model behavior and the GitHub boundary without broadening the implementation.
   - outcome: representative `fix`, `feat`, `refactor`, and `perf` prompts demonstrate the compact confirmation and exact Chinese formats; missing repository, ambiguous classification, multiple items, rejected confirmation, missing-label permission failure, and Issue-create failure all stop at the documented boundary; one controlled repository run proves label-on-demand and single-Issue creation through the active `gh` identity.
   - scope: `skills/issue/`, `specs/issue/spec.md`, `tests/issue.test.ts`
   - verify: `pnpm test`, `pnpm lint`, `git diff --check`, the manual acceptance checklist below, and one disposable-repository integration run when authenticated network access is intentionally available.

## Verification

- command: `pnpm test`
- command: `pnpm lint`
- command: `git diff --check`
- checklist (manual):
  - [ ] A complete `fix` request in the current repository shows only the compact understanding card before confirmation, then creates one Chinese Issue with label `fix` and returns its URL.
  - [ ] Explicit `OWNER/REPOSITORY` overrides the current directory repository.
  - [ ] A missing selected label is created before the Issue; existing same-name labels are reused without metadata changes.
  - [ ] Each of `fix`, `feat`, `refactor`, and `perf` renders its exact Chinese headings with no empty section, placeholder, invented fact, or English title/body text.
  - [ ] Missing repository, ambiguous classification, meaning-changing omissions, multiple independent items, and rejected understanding all cause no GitHub mutation.
  - [ ] A genuinely exploratory request that cannot be classified into the four named modes produces no `brainstorm` label and no Issue.
  - [ ] Label permission failure prevents Issue creation; Issue creation failure is reported once without an automatic retry.
  - [ ] Successful creation stops after returning repository, label, and canonical URL; it does not invoke another skill.

## Rollback

Remove `skills/issue`, `specs/issue`, and `tests/issue.test.ts`; remove the resolver entry and revert the README, PRODUCT, and ARCHITECTURE additions. Repository implementation creates no external state. Any label or Issue created during the controlled manual integration run must be deleted explicitly from that disposable repository rather than by product rollback automation.

## Risks & Unknowns

- **Instruction drift**: a prose-only skill may omit or rename a required section — exact centralized templates, repository-private schema tests, pre-create self-check, and representative manual behavior checks mitigate this; repeated drift collapses the premise and triggers a validator redesign.
- **Plain-label collision**: a repository may already use `fix`, `feat`, `refactor`, or `perf` with a different local meaning — the confirmation card exposes the chosen label and the skill never rewrites existing metadata; users can reject the card before mutation.
- **Label permission asymmetry**: an identity may be able to open Issues but unable to create labels — preflight label creation occurs before Issue creation and fails closed.
- **Uncertain CLI failure**: retrying after an ambiguous network result could duplicate an Issue — the skill reports the original failure and requires explicit user direction before any retry.
- **Chinese-only output**: repositories whose contribution policy requires another language are intentionally outside this first version unless the user changes the skill contract in a later shape.

## Interface boundary

- **Public API**: `/issue <natural-language work>` or an equivalent natural-language trigger, producing at most one new GitHub Issue.
- **Inputs**: one work item, optional explicit repository, current repository context, user-confirmed intent details, and an authenticated `gh` identity.
- **Invalid inputs**: no resolvable repository; multiple independent work items; an intent that remains outside `fix` / `feat` / `refactor` / `perf`; missing facts that could change meaning; inaccessible repository; denied label or Issue permissions.
- **Outputs**: before mutation, one compact Chinese understanding card; after success, repository, exact mode label, and canonical Issue URL; after failure, the failed stage and actionable error.
- **Side effects**: create at most one missing selected label, then create exactly one labeled Issue after confirmation.
- **Not exposed**: full-body preview, Issue Type, Project state, remote task lifecycle, persistent credentials, runtime helper API, multi-ticket decomposition, or automatic workflow transitions.

## Acceptance scenarios

1. Given a complete bug report and a current GitHub repository with label `fix`, when the user confirms the compact understanding card, then one Chinese `fix` Issue is created and its canonical URL is returned.
2. Given a complete feature request and an explicit target repository without label `feat`, when the user confirms, then only `feat` is created before one labeled Issue; the other mode labels are not initialized.
3. Given a refactor request, when the body is generated, then it records the restructuring goal and observable behavior invariants without inventing behavior changes or requiring a full shape plan.
4. Given a performance request with measurement still part of the work, when the body is generated, then the unknown baseline is expressed as an explicit measurement task rather than an empty field or fabricated number.
5. Given no explicit repository and no current GitHub repository, when `issue` runs, then it asks for the repository and performs no remote mutation.
6. Given input containing multiple independent tasks, when `issue` runs, then it asks the user to select one and does not split or create Issues automatically.
7. Given an input that is only exploratory and cannot resolve to a named mode, when clarification still leaves it exploratory, then no `brainstorm` label or Issue is created and the skill stops with that boundary.
8. Given a missing mode label and insufficient label permission, when creation is attempted, then the failure identifies label creation and no Issue exists.
9. Given the user rejects or corrects the understanding card, when the skill continues, then it updates or clarifies the understanding without creating a label or Issue.
10. Given `gh issue create` returns a failure, when the skill reports it, then it does not claim success or retry automatically.
11. Given successful creation, when the skill returns the repository, selected label, and canonical URL, then it stops without calling `shape` or another downstream skill.
