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

结果必须简要区分高置信 docs-vs-code finding、机械事实、实际 checks/重要 skips 和可能 follow-up owner；变更范围的审阅归 Review，指定结果的验证归 Verify，Doctor 不承接这两个入口的独立请求。缺前置条件不阻塞无关 probe。宿主允许且有价值时可独立调查 claim groups 并保留来源。独立 audit 止于 advisory report，支持调用只返回 evidence，不启动修复或终止调用方已有任务。
Verify: manual(integration)
