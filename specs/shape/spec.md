# Shape Specification

## Purpose

shape skill 通过对话把不确定想法收敛为有事实基础、边界清楚的方向；它不持久化产物，也不自动推进后续工作。

## Requirements

### Requirement: shape 只输出会话结论

shape 必须只在会话中输出 grounded direction，不得写 plan、Issue、spec、实现文件或其他项目文件，也不得自动调用 plan 或 implement。
Verify: manual(integration)

### Requirement: 缺少项目事实时按需使用 explore

当当前上下文不足以支撑设计判断时，shape 必须按风险选择合适深度取得 explore 上下文；不得向用户询问可从代码、文档、测试、历史或权威来源查明的事实。
Verify: manual(integration)

### Requirement: 按收敛状态自适应塑形

shape 必须区分已收敛、实质决策前沿、证据缺口和用户明确要求 grill 的状态；已收敛请求直接综合，不制造问题或重复确认，只有会改变范围、可观察语义、难逆架构、风险或验收的未决事项才需要讨论。
Verify: manual(integration)

### Requirement: 复用已经达成的共识

shape 必须把用户在当前会话中的陈述、授权与已接受结论作为既定输入，除非新证据使其失效，否则不得重开；用户委托判断时必须给出推荐并说明重要假设。
Verify: manual(integration)

### Requirement: 共享变更类型只作为思考透镜

对具体 change，shape 可以使用 `fix`、`feat`、`refactor`、`perf` 聚焦证据，但不得在仍探索问题方向时强制分类；brainstorm 只描述会话用途，不得成为 plan mode、label 或持久状态。
Verify: manual(integration)

### Requirement: 结束时给出完整方向

shape 必须以推荐方向、included/excluded scope、关键决定和仍未解决的实质不确定性收束；方向已可持久化时可以提示 `/plan`，但不得自动调用或代写 plan。
Verify: manual(integration)
