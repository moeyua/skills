# Spec Skill Specification

## Purpose

spec skill 维护持久的 `specs/` 真源——记录系统当前该是什么的行为契约。它把变更落地后的 spec delta 结晶进活规格，也按需纠正已有 spec。本文件既是 spec skill 自身的契约，也是本仓所有 spec 的格式锚点（结构关键词用英文，prose 用中文——因为 squire 的 specs 给维护者看，跟 README/PRODUCT/ARCHITECTURE 同语言）。

## Requirements

### Requirement: Crystallize a spec delta

The skill SHALL 按 requirement 名把 plan 的 `## Spec delta` 合并进 `specs/<domain>/spec.md`：ADDED 追加，MODIFIED 替换同名 requirement，REMOVED 删除。

#### Scenario: Add to an existing domain

- GIVEN `specs/auth/spec.md` 已存在，且某 plan 含一条 `## ADDED Requirements`
- WHEN skill 结晶该 plan
- THEN 新 requirement 追加进该 domain spec
- AND 原有 requirement 不变

#### Scenario: Create a missing domain

- GIVEN `specs/` 下没有 `payments/`
- WHEN delta 针对 `payments` domain
- THEN 创建 `specs/payments/spec.md`，含 `## Purpose` 与该 requirement

#### Scenario: Modify an existing requirement

- GIVEN 某 requirement 已在 domain spec 中
- WHEN delta 的 `## MODIFIED Requirements` 命名同一条
- THEN 替换原 requirement（含其 scenarios）
- AND 用 `(Previously: ...)` 记录改了什么

#### Scenario: Remove a requirement

- GIVEN 某 requirement 存在于 domain spec
- WHEN delta 的 `## REMOVED Requirements` 命名它
- THEN 从 domain spec 删除该 requirement

### Requirement: Correct a spec without a delta

The skill SHALL 在有人指明该改成什么时直接编辑已有 requirement，不需要 spec delta、也不需要漂移检测。

#### Scenario: Deliberate correction

- GIVEN 有人指出 `specs/auth` 的 Session Expiration 应为 15 分钟
- WHEN skill 在 correct 模式运行
- THEN 直接编辑该 requirement
- AND 不依赖任何漂移检测信号

### Requirement: Refuse to invent a contract

The skill SHALL 停下发问，而非逆向推导一个没人提供的契约。

#### Scenario: Plan has no spec delta

- GIVEN 一个没有 `## Spec delta` 段的 plan
- WHEN 要求 skill 结晶
- THEN 它停下并询问要为哪个 domain 记录什么行为
- AND 不从代码推断契约

#### Scenario: Modified target does not exist

- GIVEN 一条 `## MODIFIED` 或 `## REMOVED` 的 requirement 在 domain spec 中不存在
- WHEN skill 尝试合并
- THEN 它报告不一致
- AND 不静默新建该 requirement

### Requirement: Default to lightweight specs

The skill SHALL 默认产出 Lite spec（behavior-first 的短 requirement、scope 与 non-goals、少量验收 scenario），仅在高风险变更（API/契约变更、迁移、安全）时升到 Full。

#### Scenario: Low-risk change

- GIVEN 一个对外行为简单的低风险变更
- WHEN 产出 spec
- THEN 停在 Lite，不扩成 Full

#### Scenario: No observable behavior

- GIVEN 一个无对外可见效果的变更（内部重构、改名）
- WHEN skill 考虑是否结晶
- THEN 不记录，而非往 `specs/` 塞一条会腐烂的条目
