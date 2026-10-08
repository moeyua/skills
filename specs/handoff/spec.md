# Handoff Specification

## Purpose

handoff 把当前会话压缩为可在任意 host 继续的自包含摘要，只保留 continuation-critical context。

## Requirements

### Requirement: 只读且输出留在会话

handoff 不得写文件、创建会话、修改项目记忆、commit、push 或启动其他 capability；没有实质工作时必须直接说明。
Verify: manual(integration)

### Requirement: 只保留会改变下一步的内容

摘要只保留会影响继续工作的 active outcome/horizon、请求、已完成工作及实际 evidence、当前状态、pending work、关键决定、约束、superseded premise、待授权 outcome、blocker 和至多十个关键文件。普通任务不要求 assurance 表单，不用空字段填满固定模板。
Verify: manual(integration)

### Requirement: 摘要保留来源但不创造 authority

handoff 必须在影响后续行为时区分 settled decision、Agent inference、evidence 和 unresolved authority。关联 plan 相关时，保留其状态、Assurance 中的证据与已知限制、Verify 出处与 verdict、冲突的 Review finding 及待办。历史 Check 记录保留原来源、字段和时间范围，不改写或反向补证。摘要与 artifact 不创造 authority，Implement 自报或普通 Review 不等于独立 Verify；已被否定的前提不得因仍在历史中出现而恢复。
Verify: manual(integration)

### Requirement: 不猜测不可见状态

不可获得信息必须标 unavailable，真实空值标 none；不得读取 raw transcript、重建隐藏 turn 或把 host memory 当成事实。
Verify: manual(integration)

### Requirement: host-neutral 且不泄密

输出不得包含 credential value 或私密配置，结束说明必须能在任意 host 使用，只要求把摘要粘贴到新会话并从 pending work 继续。
Verify: manual(integration)
