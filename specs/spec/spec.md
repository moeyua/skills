# Spec Skill Specification

## Purpose

spec skill 维护持久的 `specs/` 真源——记录系统当前该是什么的行为契约。它把变更落地后的 spec delta 合并进持久 spec，也按需纠正已有 spec。本文件既是 spec skill 自身的契约，也是本仓所有 spec 的格式锚点：结构标签用英文，句子用中文（因为 squire 的 specs 给维护者看，跟 README/PRODUCT/ARCHITECTURE 同语言）。

## Requirements

### Requirement: 合并 spec delta

本 skill 必须按 requirement 名把 plan 的 `## Spec delta` 合并进 `specs/<domain>/spec.md`：ADDED 段追加、MODIFIED 段替换同名 requirement、REMOVED 段删除。

#### Scenario: 并入已有 domain

- GIVEN `specs/auth/spec.md` 已存在，且某 plan 含一条 `## ADDED Requirements`
- WHEN skill 处理该 plan
- THEN 新 requirement 追加进该 domain spec
- AND 原有 requirement 不变

#### Scenario: 新建缺失的 domain

- GIVEN `specs/` 下没有 `payments/`
- WHEN delta 针对 `payments` domain
- THEN 创建 `specs/payments/spec.md`，含 `## Purpose` 与该 requirement

#### Scenario: 替换已有 requirement

- GIVEN 某 requirement 已在 domain spec 中
- WHEN delta 的 `## MODIFIED Requirements` 命名同一条
- THEN 替换原 requirement（含其 scenarios）
- AND 用 `(Previously: ...)` 记录改了什么

#### Scenario: 删除 requirement

- GIVEN 某 requirement 存在于 domain spec
- WHEN delta 的 `## REMOVED Requirements` 命名它
- THEN 从 domain spec 删除该 requirement

### Requirement: 无 delta 时直接纠正

本 skill 必须在有人指明该改成什么时直接编辑已有 requirement，不需要 spec delta、也不需要漂移检测。

#### Scenario: 主动纠正

- GIVEN 有人指出 `specs/auth` 的 Session Expiration 应为 15 分钟
- WHEN skill 在 correct 模式运行
- THEN 直接编辑该 requirement
- AND 不依赖任何漂移检测信号

### Requirement: 为已有能力补写 spec

本 skill 必须支持 backfill：为一个没有 plan/delta、但已经存在的能力，依据其权威行为来源（已有 SKILL.md、API 文档、维护者陈述的意图）补写 spec，而非从实现逆向猜测。

#### Scenario: 给已有 skill 补 spec

- GIVEN 一个已存在、无对应 plan 的 skill
- WHEN 在 backfill 模式补它的 spec
- THEN 依据该 skill 的 SKILL.md（其行为真源）写出 Lite spec
- AND 不靠对实现的猜测编造契约

#### Scenario: 只有实现可依、无权威来源

- GIVEN 某能力既无 plan，也无可依据的行为描述，只能靠读实现猜
- WHEN 要求 backfill
- THEN 停下发问，而非凭实现推断契约

### Requirement: 拒绝凭空编造契约

本 skill 必须停下发问，而非逆向推导一个没人提供的契约。

#### Scenario: plan 没有 spec delta

- GIVEN 一个没有 `## Spec delta` 段的 plan
- WHEN 要求 skill 合并
- THEN 它停下并询问要为哪个 domain 记录什么行为
- AND 不从代码推断契约

#### Scenario: MODIFIED 的目标不存在

- GIVEN 一条 `## MODIFIED` 或 `## REMOVED` 的 requirement 在 domain spec 中不存在
- WHEN skill 尝试合并
- THEN 它报告不一致
- AND 不静默新建该 requirement

### Requirement: 默认产出轻量 spec

本 skill 必须默认产出 Lite spec（behavior-first 的短 requirement、scope 与 non-goals、少量验收 scenario），仅在高风险变更（API/契约变更、迁移、安全）时升到 Full。

#### Scenario: 低风险变更

- GIVEN 一个对外行为简单的低风险变更
- WHEN 产出 spec
- THEN 停在 Lite，不扩成 Full

#### Scenario: 无对外可见行为

- GIVEN 一个无对外可见效果的变更（内部重构、改名）
- WHEN skill 判断要不要写
- THEN 不记录，而非往 `specs/` 塞一条会过时的条目
