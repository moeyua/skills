# Handoff Specification

## Purpose

handoff 把当前会话压缩为可在任意 host 继续的自包含摘要，只保留 continuation-critical context。

## Requirements

### Requirement: 只读且输出留在会话

handoff 不得写文件、创建会话、修改项目记忆、commit、push 或启动其他 capability；没有实质工作时必须直接说明。
Verify: manual(integration)

### Requirement: 只保留会改变下一步的内容

摘要必须按实际任务选择用户请求/目标、已完成工作与验证、当前状态、pending work、关键决定、显式约束、阻塞和至多十个关键文件；不得强制填满固定大模板。
Verify: manual(integration)

### Requirement: 不猜测不可见状态

不可获得信息必须标 unavailable，真实空值标 none；不得读取 raw transcript、重建隐藏 turn 或把 host memory 当成事实。
Verify: manual(integration)

### Requirement: host-neutral 且不泄密

输出不得包含 credential value 或私密配置，结束说明必须能在任意 host 使用，只要求把摘要粘贴到新会话并从 pending work 继续。
Verify: manual(integration)
