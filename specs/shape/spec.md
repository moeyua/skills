# Shape Specification

## Purpose

shape 通过对话把不确定想法收敛为有事实基础、边界清楚的方向，不持久化产物或推进外部副作用。

## Requirements

### Requirement: outcome-first 且严格只读

shape 必须围绕用户想获得的结果工作，不得写 plan、Issue、spec、代码或其他项目文件，也不得自动进入实现或交付。
Verify: manual(integration)

### Requirement: 复用既定决定

用户陈述、授权与已接受结论必须作为输入；没有新证据时不得重开、重复确认或制造新阶段。在适用宿主约束内显式用户指令优先于 skill 指导；因 skill 规则暂停时必须提供实际来源链接、短引文和适用原因，不得把 Agent 解释变成额外批准门槛。
Verify: manual(integration)

### Requirement: 事实缺口由 Agent 调查

必经 Explore 之后，影响判断的剩余可发现事实必须由 Agent 从项目或权威来源取得，不得把可检索事实交回用户。对 pending 意图选择，继续调查不依赖答案的有效事实，不把等待当作批准。Explore context 返回事实、路径及缺证据项后，Shape 必须继续当前授权的只读方向讨论。
Verify: manual(integration)

### Requirement: 只处理实质决策前沿

只有会改变范围、可观察行为、难逆架构、风险或验收的选择才需要讨论；用户委托判断时必须给出推荐。失败、歧义或必要状态缺失不得被包装成已解决方向或未请求的替代路径。fallback、兼容层、迁移、双路径和 legacy path 属于需要 authority 的重大连续性选择；已授权 outcome 明确替换旧设计且没有权威连续性要求时，方向必须保持 clean break。主观结果只有在高保真 reference/preview 真能改变决定时才需要展示，不形成统一确认阶段。
Verify: manual(integration)

### Requirement: 会话结论必须通过 Design Summary 审阅

shape 必须在结束或进入另一 public outcome 前输出可审阅的 Design Summary，并在该轮保持只读停止。内部 Explore context 支持调用不构成 public outcome 切换，不得触发提前结束 Shape、单独 Explore 报告或额外 Summary/确认轮次。Summary 必须按实际内容让 active outcome/horizon、included/excluded scope、已定重大决定、Agent recommendation、真正未决选择、与 outcome 匹配的 success evidence 及当前 authorization 可区分，空项必须省略。用户纠正 Summary 时，依赖被否定前提的结论必须失效并在 revised Summary 中重新呈现；对 Summary 的普通同意只确认方向，不授权 Plan、Implement 或交付，后续消息明确同时接受方向并请求另一 outcome 时才授权对应能力。
Verify: manual(integration)

### Requirement: 每次先 Explore 当前项目

每次进入 Shape，必须在形成项目相关方向、比较或 Design Summary 前使用 Explore context，依照 Explore 的唯一规范完成固定 Overview 并按议题进行必要深入。当前项目是本次议题所针对的项目，不得默认以技能安装目录替代。项目熟悉、需求简单或方向已定均不得跳过；允许按 Explore 规范复用仍有效的已读事实并补齐缺口，同一讨论后续轮次继续使用有效上下文，项目或范围变化时更新受影响部分。Shape 运行必须有 Explore 可用，优先从同一安装集合定位，再搜索宿主已提供的技能位置。无法定位 Explore 或无法确定、访问目标项目时必须明确报告具体缺口，不伪造探索完成，不从记忆替代必需规范，不自动安装，也不输出依赖缺失事实的已确定方向；可继续不依赖缺口的意图澄清，仅将不可从现有环境确定的信息交给用户。
Verify: manual(integration)
