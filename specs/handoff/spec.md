# Handoff Specification

## Purpose

handoff skill 只读收集当前会话、任务和项目状态,在对话中输出一份可粘贴到新会话的自包含交接摘要,服务会话连续性。它不写文件、不创建会话、不提交、不推送、不自动调用其他 skill。

> 说明:handoff 的行为是 agent 遵循 SKILL.md 的 prose,没有自动化测试可背书,所以下面每条都标 `manual(integration)`——靠实跑 `/handoff` 验。

## Requirements

### Requirement: 只读生成交接摘要

handoff 必须只读收集当前会话、任务和项目状态,并在对话中输出一份自包含交接摘要;不得修改文件、创建新会话、提交、推送或自动调用其他 skill。
Verify: manual(integration)

### Requirement: 保留继续工作所需事实

handoff 输出必须包含用户原始请求、下一步目标、已完成工作、当前状态、待办任务、关键文件、重要决策、显式约束和继续上下文;缺失或不可获得的信息必须明确标注,不得猜测补齐。
Verify: manual(integration)

### Requirement: 不绑定 host 的继续说明

handoff 必须给出不绑定具体 host 的继续说明,让用户把摘要粘贴到新会话继续;不得要求 OpenCode 专属 API、TUI 按键或其他 Skills 不拥有的能力。
(Previously:能力归属使用项目旧名;host-neutral 边界不变。)
Verify: manual(integration)

### Requirement: 敏感信息不外泄

handoff 必须避免输出 API keys、tokens、credentials、secrets 或私密配置值;若相关内容影响继续工作,只能说明已省略敏感值并保留非敏感上下文。
Verify: manual(integration)

### Requirement: 交接内容有边界

handoff 必须聚焦延续工作所需信息,关键文件不超过 10 个,不展开无关实现细节,不把摘要变成完整项目文档或长期记忆。
Verify: manual(integration)
