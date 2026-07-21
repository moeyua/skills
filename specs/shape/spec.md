# Shape Specification

## Purpose

shape skill 把仍有不确定性的改动塑形成有事实支撑的方向或可执行方案。`brainstorm` mode 在对话中收敛方向，named mode 在意图决策完备且已获授权时把方案写入 `plans/`；塑形过程按实际不确定性与风险伸缩，不要求固定阶段或重复确认。

## Requirements

### Requirement: 事实先于提问

shape 必须先判断已有项目事实是否足以支撑当前决策。缺失、过期或过浅时，必须按风险比例调用 explore 的 context mode，或直接读取相关代码、文档、测试、历史与权威外部资料；能从这些来源查到的事实不得转问用户。调查只覆盖当前设计所需范围，不因使用 shape 就固定执行完整探索流程。
Verify: manual(integration)

### Requirement: 按收敛状态自适应塑形

shape 必须根据当前状态选择最短的充分路径：已收敛的请求直接综合；存在实质决策前沿时解决前沿；依赖可查事实时先调查；用户明确要求 challenge / grill 时才全面压力测试。不得把 clarify、approaches、grill、design summary 等固定阶段本身当成完成条件，也不得因 mode 已知就机械追问。
Verify: manual(integration)

### Requirement: 只处理实质决策前沿

shape 只向用户提出会实质改变范围、可观察行为或接口、难以逆转的架构、风险或验收方式的未决问题。用户未表达偏好不等于把选择委托给模型；当两个合理答案会产生不同的排序、搜索/过滤、持久化、破坏性行为或其他可观察语义时，即使存在常见默认值，该选择仍属于实质决策前沿。前置条件都已成立且彼此独立的问题可以在一轮内清晰分组，并逐项给出推荐答案与理由；依赖前一答案的问题留到前置决策解决后再问。问题数量本身不是质量指标，避免交互轮次且不漏掉实质决策才是目标。
Verify: manual(integration)

### Requirement: 已定内容直接作为输入

shape 必须把用户在当前请求及此前对话中的明确陈述、同意和授权视为已定输入，综合进方向或 plan，不得换一种措辞重复确认。用户把选择交给模型时，shape 必须基于证据给出推荐、说明会影响结果的重要假设并继续；只有新证据使原决定失效时才能重开。
Verify: manual(integration)

### Requirement: 真实取舍才展开 approaches

当证据明显支持一个方向时，shape 必须直接推荐该方向。只有多个可行路径之间存在会影响结果的真实取舍时，才比较 alternatives；比较必须说明关键差异、给出立场，不得为了满足数量或仪式而凑 2–3 个方案，也不得把推荐伪装成无立场投票。
Verify: manual(integration)

### Requirement: shape 只塑形不实施

shape 的输出只能是对话中的塑形结果或 named-mode 的 `plans/` 文件。它不得写实现、脚手架、spec 或其他项目文件，也不得调用实现工作；写出或批准 plan 都不会解除这条边界。
Verify: manual(integration)

### Requirement: brainstorm mode 不写方案文件

`brainstorm` mode 必须保持对话式，不写 plan、design 或 spec 文件。其完成产物是当前方向、约束、推荐与尚未解决的实质决策；若已收敛，可以推荐对应 named mode，只有用户尚未授权继续时才需要询问是否进入该 mode。
Verify: manual(integration)

### Requirement: named mode 产出可执行方案文件

named mode 在事实可靠、实质意图决策已解决且用户已通过请求 plan、点名 mode、同意方向或要求继续而形成授权时，必须把方案写入 `plans/YYYY-MM-DD-<slug>.md`。plan 必须清楚定义 building / not building；每个实施步骤包含结果、路径级 scope 与独立 verify；总体 verification 含命令和可观察检查；不得保留 TBD / TODO / 待定等意图占位，也不得用固定标题或额外确认作为写 plan 的前置门槛。
Verify: manual(integration)

### Requirement: named mode 保持专属质量门槛

named mode 的 plan 必须包含其专属证据：fix 说明 root cause 与 regression tests；feat 说明 interface boundary 与 acceptance scenarios；refactor 说明 behavior invariants 与 regression coverage；perf 说明 baseline、target 与 measurement。证据不足时必须调查或明确停在具体缺口，不得用通用流程段落代替。
Verify: manual(integration)

### Requirement: 价值判断超出范围

用户问“值不值得做”时，shape 必须说明这不是 squire 处理的层次，只给至多一句与实现取舍相关的观察，不替用户下“该不该做”的结论。
Verify: manual(integration)

### Requirement: 跨结构变更产出 Architecture 段

named mode 的 plan 在变更跨模块边界、引入新层或新服务、或更换技术依赖时，必须含 `## Architecture` 段，说明现状到目标结构、组件职责与数据流、安全迁移；超过 3 个组件交换数据时附 ASCII 图。未触发时必须省略该段，不得写 `None` 凑格式。无关的顺手重构仍不进入本 plan。
Verify: manual(integration)
