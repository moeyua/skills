# Spec Skill Specification

## Purpose

spec skill 维护持久的 `specs/` 真源——记录系统当前该是什么的行为契约。它把变更落地后的 spec delta 合并进持久 spec，也按需纠正已有 spec。本文件既是 spec skill 自身的契约，也是本仓所有 spec 的格式锚点：结构标签用英文，句子用中文（因为 squire 的 specs 给维护者看，跟 README/PRODUCT/ARCHITECTURE 同语言）。

> 说明：spec skill 的行为是 agent 遵循 SKILL.md 的 prose，没有自动化测试可背书，所以下面每条都标 `manual(integration)`——靠实跑 `/spec` 验。这本身印证了「squire 自己的 skill-行为 spec 多落人工」。

## Requirements

### Requirement: 合并 spec delta

本 skill 必须按 requirement 名把 plan 的 `## Spec delta` 合并进 `specs/<domain>/spec.md`：ADDED 段追加、MODIFIED 段替换同名 requirement、REMOVED 段删除；domain 不存在则新建（含 `## Purpose`）。
Verify: manual(integration)

### Requirement: 无 delta 时直接纠正

本 skill 必须在有人指明该改成什么时直接编辑已有 requirement，不需要 spec delta、也不需要漂移检测。
Verify: manual(integration)

### Requirement: 为已有能力补写 spec

本 skill 必须支持 backfill：为没有 plan/delta、但已存在的能力，依据其权威行为来源（已有 SKILL.md、API 文档、维护者陈述的意图）补写 spec，而非从实现逆向猜测；只有实现可依、无权威来源时停下发问。
Verify: manual(integration)

### Requirement: 拒绝凭空编造契约

本 skill 必须停下发问,而非逆向推导一个没人提供的契约：plan 无 `## Spec delta`、或 MODIFIED/REMOVED 的目标 requirement 不存在时,报告并询问,不从代码推断、不静默新建。
Verify: manual(integration)

### Requirement: 默认产出轻量 spec

本 skill 必须默认产出 Lite spec（behavior-first 的短 requirement、各带 `Verify:`、scope 与 non-goals），仅在高风险变更（API/契约变更、迁移、安全）时升到 Full；无对外可见行为的变更不记录。
Verify: manual(integration)
