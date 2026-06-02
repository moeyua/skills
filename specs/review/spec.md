# Review Specification

## Purpose

review skill 是合并前的最后一道关：找出可能绊倒 reviewer、用户或生产的改动，给作者方向，把处置决定权留给作者。

## Requirements

### Requirement: 只看不改

review 必须不修改任何文件，不给完整补丁（只给方向），不替作者调用其他 skill，不改 plan 状态、不提交、不推送；过程中想顺手修的，写成 finding 而非动手。
Verify: manual(integration)

### Requirement: 5 维扫描 + confidence 过滤

review 必须扫 5 个维度（plan / quality / errors / tests / simplify），或用户指定的 aspect；只报告 confidence ≥ 80 的 finding，按 Critical / Important / Suggestion 分级，宁可漏报也不用低置信噪音稀释信任。
Verify: manual(integration)

### Requirement: 必给正面肯定

review 必须给出 Strengths 段，哪怕只有一两条。
Verify: manual(integration)

### Requirement: 指向对应 skill 而非接管

review 发现某类问题时必须指向对应 skill（简化→shape refactor、缺测试→test、bug→shape fix、scope 蔓延→交用户决定），不接管去做。
Verify: manual(integration)
