# Shape Specification

## Purpose

shape 通过可回答的追问帮助用户形成判断，逐步澄清意图及关键设计，得到有事实基础、边界清楚的方向，不持久化产物或推进外部副作用。

## Requirements

### Requirement: outcome-first 且严格只读

shape 必须从具体困扰、期望结果及已知约束出发，不把用户提出的可能机制当作已定目标，不在意图尚未清楚时直接给完整方案。shape 不得写 plan、Issue、spec、代码或其他项目文件，也不得自动进入实现或交付。
Verify: manual(integration)

### Requirement: 复用既定决定

用户陈述、授权与已接受结论必须作为输入；每轮利用回答更新判断，仅重开依赖新信息或被纠正前提的选择，不重复未受影响的决定。已清楚的方向直接综合，不为完成流程强制访谈。推断、推荐、产物存在或沉默不能变成用户决定。在适用宿主约束内显式用户指令优先于 skill 指导；因 skill 规则暂停时必须提供实际来源链接、短引文和适用原因，不得把 Agent 解释变成额外批准门槛。
Verify: manual(integration)

### Requirement: 事实缺口由 Agent 调查

必经 Explore 之后，影响判断的剩余可发现事实必须由 Agent 从项目或权威来源取得，不得把可检索事实交回用户。对 pending 意图选择，继续调查不依赖答案的有效事实，不把等待当作批准。Explore context 返回事实、路径及缺证据项后，Shape 必须继续当前授权的只读方向讨论。
Verify: manual(integration)

### Requirement: 只处理实质决策前沿

只有会改变目标、范围、可观察行为、难逆架构、风险或验收的选择才需要讨论。每轮必须一起提出所有互不依赖、当前可回答的实质问题；依赖尚未获得的答案的问题留到后续，不固定轮数或题数，不讨论机械实现细节。问题须联系用户情境、说明答案影响，选择存在时给出有理由的建议；目标与约束逐渐清楚后才形成暂定方向，并用有关使用或失败情境检验关键设计。失败、歧义或必要状态缺失不得被包装成已解决方向或未请求的替代路径。fallback、兼容层、迁移、双路径和 legacy path 属于需要 authority 的重大连续性选择；已授权 outcome 明确替换旧设计且没有权威连续性要求时，方向必须保持 clean break。
Verify: manual(integration)

### Requirement: 会话结论必须通过 Design Summary 审阅

shape 必须在结束或进入另一 public outcome 前输出可审阅的 Design Summary，并在该轮保持只读停止。Summary 必须说明具体目标、取舍原因与支持目标的关键设计的关系，让实际适用的 horizon、included/excluded scope、已定决定、Agent recommendation、真正未决选择、success evidence 及当前 authorization 可区分，空项省略。内部 Explore context 支持调用不构成 public outcome 切换，不得触发提前结束 Shape、单独 Explore 报告或额外 Summary/确认轮次。用户纠正 Summary 时，仅使依赖被否定前提的结论失效并呈现 revised Summary；对 Summary 的普通同意只确认方向，不授权 Plan、Implement 或交付，后续消息明确同时接受方向并请求另一 outcome 时才授权对应能力。
Verify: manual(integration)

### Requirement: 不确定回答通过具体情境继续澄清

用户表示不知道、纠结或难以接话时，shape 必须帮助形成判断，用具体情境、反例、后果比较或确实有助决定的参考/预览，说明当前建议及理由，让用户能对具体后果作出反应，不要求用户先创造选项、掌握分类或自行设计方案。不得换种抽象表述重复原问题或将不确定视为同意。用户委托选择时由 Agent 作出判断并说明重大假设；预览不形成所有讨论必经的确认阶段。
Verify: manual(integration)

### Requirement: 每次先 Explore 当前项目

每次进入 Shape，必须在形成项目相关方向、比较或 Design Summary 前使用 Explore context，依照 Explore 的唯一规范完成固定 Overview 并按议题进行必要深入。当前项目是本次议题所针对的项目，不得默认以技能安装目录替代。项目熟悉、需求简单或方向已定均不得跳过；允许按 Explore 规范复用仍有效的已读事实并补齐缺口，同一讨论后续轮次继续使用有效上下文，项目或范围变化时更新受影响部分。Shape 运行必须有 Explore 可用，优先从同一安装集合定位，再搜索宿主已提供的技能位置。无法定位 Explore 或无法确定、访问目标项目时必须明确报告具体缺口，不伪造探索完成，不从记忆替代必需规范，不自动安装，也不输出依赖缺失事实的已确定方向；可继续不依赖缺口的意图澄清，仅将不可从现有环境确定的信息交给用户。
Verify: manual(integration)
