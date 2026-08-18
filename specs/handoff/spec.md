# Handoff Specification

## Purpose

handoff 把当前会话压缩为可在任意 host 继续的自包含摘要，只保留 continuation-critical context。

## Requirements

### Requirement: 只读且输出留在会话

handoff 不得写文件、创建会话、修改项目记忆、commit、push 或启动其他 capability；没有实质工作时必须直接说明。
Verify: manual(integration)

### Requirement: 只保留会改变下一步的内容

摘要必须按实际任务选择 active outcome/horizon、用户请求、已完成工作与实际 evidence、当前状态、pending work、关键决定、显式约束、影响继续工作的 superseded premise、待授权 next outcome、阻塞和至多十个关键文件；不得强制填满固定大模板。
Verify: manual(integration)

### Requirement: 摘要保留来源但不创造 authority

handoff 必须在会改变后续行为时区分 settled decision、Agent inference、实际 evidence 与 unresolved authority；acceptance 仍相关时还必须保留 current candidate 的 stable basis、evidence 与 producer、latest Check producer/reference 和 verdict + acceptance-field pair、Check basis 是否仍匹配 current candidate、finding 或 missing evidence，以及 pending acceptance。摘要及其引用的 artifact 只是 continuation cache，不得把未披露偏好升级为用户决定，也不得把 Implement 自报、artifact existence 或缺少完整 Assurance 的 legacy done 升级为 independent acceptance；历史中仍出现已被纠正的 premise 不得因此重新生效。
Verify: manual(integration)

### Requirement: 不猜测不可见状态

不可获得信息必须标 unavailable，真实空值标 none；不得读取 raw transcript、重建隐藏 turn 或把 host memory 当成事实。
Verify: manual(integration)

### Requirement: host-neutral 且不泄密

输出不得包含 credential value 或私密配置，结束说明必须能在任意 host 使用，只要求把摘要粘贴到新会话并从 pending work 继续。
Verify: manual(integration)
