# Doctor Specification

## Purpose

doctor 提供全项目只读体检：文档 claim 与项目事实的漂移为主，确定性健康 probe 为辅。

## Requirements

### Requirement: 只读、只报告

doctor 不得修改、提交、推送或调用 fixing capability；脚本和环境命令只采集证据。
Verify: manual(integration)

### Requirement: 不熟悉时先取得项目骨架

项目或 memory layout 不足以支撑判断时必须取得 explore context；已具备新鲜事实时不得机械重复 preflight。
Verify: manual(integration)

### Requirement: docs-vs-code 是主检查

Spec requirement 必须逐 claim 核对，散文文档只核可证实 claim；无法判断的 rationale 不得强行裁决，模型 finding 只报告高置信 observed-vs-claimed 矛盾。
Verify: manual(integration)

### Requirement: 机械事实交给 checker

Spec shape、Markdown links/anchors、placeholders 和 source size 必须由随装 checker 处理；依赖、CI、history probe 只在 scope 和 prerequisites 适用时运行，缺失依赖准确记为 skipped。
Verify: [checker contract](../../tests/checker.test.ts)

### Requirement: 报告区分事实、判断和 owner

机械 finding 必须作为事实；model finding 必须带 severity、confidence 和 evidence；每项可能修复必须指出 Docs、Converge、Implement 或 Shape 等 owner，但 doctor 自身停止在 advisory report。
Verify: manual(integration)
