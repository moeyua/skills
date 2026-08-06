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

### Requirement: 会话结论完整但不成为新 gate

shape 必须给出推荐方向、included/excluded scope、关键决定与真正未决事项；总结用于传达结果，不得成为额外审批门槛。
Verify: manual(integration)
