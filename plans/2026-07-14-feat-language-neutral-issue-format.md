---
mode: feat
title: Make issue formatting follow the user's language
created: 2026-07-14
status: done
---

# Make issue formatting follow the user's language

## Building

Change `issue` from a Chinese-only capture skill into a language-following capture skill consistent with the rest of Squire. All user-visible Issue interaction follows the user's current language, while the four mode schemas remain strongly constrained through language-neutral semantic section keys, fixed order, and content requirements.

## Not building

- Per-language templates, translation dictionaries, locale negotiation, or a supported-language registry.
- A runtime formatter, translator, validator, or other executable helper.
- Changes to repository resolution, confirmation timing, label creation, Issue creation, or create-only workflow boundaries.
- Translation of mode labels, code identifiers, commands, or precision-sensitive proper nouns.
- Rewriting the completed `plans/2026-07-14-feat-issue-skill.md`; it remains the historical record of the previous contract.

## Approach

1. **Recommended — language-neutral semantic schema.** Replace fixed-language Markdown templates with ordered semantic section keys and content requirements. The skill localizes the visible headings at render time and tests lock the keys and order. This removes language from the domain contract without weakening structure.
2. **Keep Chinese templates and translate them at runtime.** This is the smallest edit, but Chinese remains the implicit source language and translations can drift from the schema.
3. **Maintain one exact template per language.** This gives deterministic wording for listed locales, but duplicates the format truth, creates synchronization work, and cannot naturally cover arbitrary user languages.

## Premise collapse

This plan assumes agents can localize semantic section names while preserving their identity and order. If behavior checks show repeated missing, merged, or reordered sections across languages, stop and return to shape for a small deterministic validator; do not add duplicated locale templates or weaken the schema.

## Key decisions

1. User-visible content follows the user's current language; an explicit language request overrides the surrounding conversation — this matches Squire's general interaction model.
2. Mode labels, code identifiers, commands, and precision-sensitive proper nouns remain unchanged — they are taxonomy or technical identity, not prose localization targets.
3. `formats.md` owns stable semantic section keys and order, not literal output headings — tests can remain deterministic without prescribing a language.
4. The understanding card keeps the same semantic fields but localizes their visible labels — repository, classification, goal, scope and constraints, completion criteria, and omissions remain mandatory.
5. The previous completed plan remains unchanged as history; the current skill, spec, tests, and durable public documentation move to the new contract.

## Architecture

None — the existing `SKILL.md` plus one progressively loaded format reference remains the complete design. No new layer, dependency, helper, or cross-skill data flow is introduced.

## Public surface changes

- **Public API**: `/issue <natural-language work>` and existing natural-language triggers remain unchanged.
- **Inputs**: one development item, repository context, confirmation facts, and the user's current or explicitly requested language.
- **Outputs**: the understanding card, Issue title, section headings, body prose, and success/failure feedback use the user's language; each mode still renders one `##` heading per required semantic section in the fixed order.
- **Stable semantic schemas**:
  - `fix`: `background`, `problem`, `reproduction`, `expected`, `actual`, `scope`, `acceptance`
  - `feat`: `background`, `goal`, `user_scenario`, `scope`, `non_goals`, `acceptance`
  - `refactor`: `background`, `refactor_goal`, `behavior_invariants`, `scope`, `acceptance`
  - `perf`: `background`, `performance_problem`, `metric`, `baseline`, `target`, `measurement`, `scope`, `acceptance`
- **Side effects**: unchanged — at most one selected missing label, then one confirmed Issue.
- **Not exposed**: internal section keys, locale metadata, translation configuration, or runtime formatting APIs.

## Spec delta

```markdown
## MODIFIED Requirements

### Requirement: 跟随用户语言的强格式正文

Issue 的理解卡、标题、section 标题、正文与结果反馈 SHALL 使用用户当前语言；用户显式指定语言时优先。每个 mode SHALL 按集中 reference 定义的 semantic section key 与顺序渲染完整结构，但不得向用户暴露内部 key。Mode label、代码标识符、命令与为保持精度所需的专有名词不做本地化。所有必需 section 仍必须包含确认事实或明确的待调查、待测量语义，不得为空、保留模板指令、使用占位符或编造信息。（Previously: 标题、section 标题和正文固定使用中文，reference 直接保存中文标题模板。）

#### Scenario: 英文用户创建 feat Issue

- GIVEN 用户以英文描述并确认一项 `feat` 工作
- WHEN issue 渲染理解卡与 Issue
- THEN 所有用户可见 prose 与 section 标题使用英文，且 section 的语义和顺序与 `feat` schema 一致

#### Scenario: 中文用户创建 fix Issue

- GIVEN 用户以中文描述并确认一项 `fix` 工作
- WHEN issue 渲染理解卡与 Issue
- THEN 所有用户可见 prose 与 section 标题使用中文，且 section 的语义和顺序与 `fix` schema 一致
```

## Implementation steps

1. Replace literal-language format enforcement with a semantic schema contract.
   - outcome: repository-private tests first fail against the Chinese-only format source, then pass after `formats.md` defines the exact semantic keys and order for all four modes; label metadata remains unchanged; `SKILL.md` follows the user's language for every user-visible field and no longer presents Chinese as a fixed capability.
   - scope: `tests/issue.test.ts`, `skills/issue/SKILL.md`, `skills/issue/references/formats.md`
   - verify: `pnpm exec vp test run tests/issue.test.ts tests/smoke/verify-skills.test.ts`
2. Move the persistent behavior contract to language-following output.
   - outcome: the Issue spec replaces its Chinese-only requirement with the approved language-resolution rule, semantic-schema invariant, unchanged technical identifiers, and English/Chinese acceptance scenarios; its `Verify:` form remains valid.
   - scope: `specs/issue/spec.md`
   - verify: run `node skills/doctor/scripts/checker.ts . --json` and confirm it reports no finding for `specs/issue/spec.md`; run `pnpm test`.
3. Align current product and maintainer documentation without rewriting history.
   - outcome: English and Chinese READMEs, PRODUCT, and ARCHITECTURE describe strongly formatted output in the user's language, the semantic format reference, and language-independent tests; the previous completed plan stays untouched.
   - scope: `README.md`, `README.zh-CN.md`, `PRODUCT.md`, `ARCHITECTURE.md`
   - verify: search the current skill, spec, tests, README, PRODUCT, and ARCHITECTURE surfaces for stale Chinese-only claims; run `pnpm test`.
4. Verify language behavior without broadening the GitHub workflow.
   - outcome: representative English and Chinese prompts preserve the same mode schema and confirmation/mutation boundaries; code identifiers and labels remain unchanged; no locale machinery or external side effect is introduced by this change.
   - scope: `skills/issue/`, `specs/issue/spec.md`, `tests/issue.test.ts`
   - verify: `pnpm test`, `pnpm lint`, `pnpm exec vp fmt --check`, `git diff --check`, and the manual acceptance checklist below.

## Verification

- command: `pnpm test`
- command: `pnpm lint`
- command: `pnpm exec vp fmt --check`
- command: `git diff --check`
- checklist (manual):
  - [ ] A Chinese `fix` request produces a Chinese understanding card, title, headings, body, and result feedback with the complete `fix` semantic schema.
  - [ ] An English `feat` request produces the corresponding English surfaces with the complete `feat` semantic schema.
  - [ ] An explicit language instruction overrides the conversation language without changing the selected schema.
  - [ ] `fix` / `feat` / `refactor` / `perf`, code identifiers, commands, and precision-sensitive proper nouns remain unchanged.
  - [ ] Every rendered section is non-empty and appears once in the schema's fixed order; no semantic key is shown to the user.
  - [ ] Repository resolution, compact confirmation, label handling, failure behavior, and create-once stop boundary remain unchanged.

## Rollback

Revert this plan's implementation commit to restore the previous Chinese-only templates, skill wording, spec, tests, and documentation. The change creates no repository labels or Issues during implementation, so rollback has no external cleanup.

## Risks & Unknowns

- **Localized heading drift**: different agents may choose different natural translations — semantic identity and order are the invariant; literal wording is intentionally not one.
- **Language inference ambiguity**: mixed-language conversations may not have one obvious output language — the latest explicit user instruction wins, otherwise follow the user's current language without adding a language-only confirmation step.
- **Test overreach**: asserting the absence of all Chinese text would incorrectly reject Chinese triggers and examples — tests lock behavior instructions and semantic schemas rather than banning a script.

## Interface boundary

- **Public API**: unchanged `/issue` invocation and natural-language triggers.
- **Valid inputs**: the existing one-item Issue input in any user language, with an optional explicit output-language instruction.
- **Invalid inputs**: unchanged repository, classification, confirmation, and information-boundary failures; language alone is not a new failure mode.
- **Success output**: localized understanding card followed, after confirmation and creation, by localized result feedback plus canonical repository, exact mode label, and Issue URL.
- **Failure output**: localized failed-stage explanation with the actionable `gh` error.
- **Side effects**: unchanged label and single-Issue mutations only after confirmation.
- **Not exposed**: semantic section keys, translation tables, locale codes, or language configuration.

## Acceptance scenarios

1. Given a Chinese bug report and current repository, when the user confirms, then the card and created `fix` Issue use Chinese while preserving all seven `fix` semantic sections in order.
2. Given an English feature request, when the user confirms, then the card and created `feat` Issue use English while preserving all six `feat` semantic sections in order.
3. Given a conversation in Chinese plus an explicit request for an English Issue, when rendered, then user-visible Issue content is English without another language-only clarification.
4. Given content containing a function name, shell command, or proper noun, when localized, then those precision-sensitive identifiers remain unchanged.
5. Given any supported mode, when the body is rendered, then each semantic section appears exactly once as a localized `##` heading and contains confirmed facts or explicit investigation/measurement work.
6. Given missing repository, ambiguous mode, multiple items, rejected confirmation, label failure, or Issue failure, when the skill stops, then the existing no-unsafe-mutation behavior is preserved and the explanation follows the user's language.
