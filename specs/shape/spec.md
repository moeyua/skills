# Shape Specification

## Purpose

shape 通过对话把不确定想法收敛为有事实基础、边界清楚的方向，不持久化产物或推进外部副作用。

## Requirements

### Requirement: outcome-first 且严格只读

shape 必须围绕用户想获得的结果工作，不得写 plan、Issue、spec、代码或其他项目文件，也不得自动进入实现或交付。
Verify: manual(integration)

### Requirement: 复用既定决定

用户陈述、授权与已接受结论必须作为输入；没有新证据时不得重开、重复确认或制造新的阶段。
Verify: manual(integration)

### Requirement: 事实缺口由 Agent 调查

影响判断的可发现事实必须从项目或权威来源取得，项目陌生时可自主组合 explore context；不得把可检索事实交回用户补齐。
Verify: manual(integration)

### Requirement: 只处理实质决策前沿

只有会改变范围、可观察行为、难逆架构、风险或验收的选择才需要讨论；用户委托判断时必须给出推荐。主观结果只有在高保真 reference/preview 真能改变决定时才需要展示，不形成统一确认阶段。
Verify: manual(integration)

### Requirement: 会话结论必须通过 Design Summary 审阅

shape 必须在结束或进入另一 public capability 前输出可审阅的 Design Summary，并在该轮保持只读停止。Summary 必须按实际内容让 active outcome/horizon、included/excluded scope、已定重大决定、Agent recommendation、真正未决选择、与 outcome 匹配的 success evidence 及当前 authorization 可区分，空项必须省略。用户纠正 Summary 时，依赖被否定前提的结论必须失效并在 revised Summary 中重新呈现；对 Summary 的普通同意只确认方向，不授权 Plan、Implement 或交付，后续消息明确同时接受方向并请求另一 outcome 时才授权对应能力。
Verify: manual(integration)
