# Shape Specification

## Purpose

shape skill 把模糊想法塑形成清晰设计。`brainstorm` mode 在对话中收敛方向,named mode 在用户确认 design summary 后把方案写入 `plans/`。

## Requirements

### Requirement: 先建立上下文再澄清

shape 必须先判断项目/模块事实是否足以支撑当前设计;若上下文缺失、过期或过浅,必须调用 explore 的 context mode 建立事实基础,根据任务风险选择 core 或 deep,不产出独立 Explore Report。Clarify 期间若问题能从代码、文档、测试、历史或权威外部文档回答,必须先查证而不是问用户。(Previously: 只要求在 Clarify 前和期间读相关代码、文档与历史,不强调 shape 不重写 explore 规则。)
Verify: manual(integration)

### Requirement: 一次只问一个澄清问题

shape 必须一次只问一个问题,优先问 multiple choice,问题必须服务于压实目的、约束、成功标准或阻塞歧义。达到"澄清够了"的门槛后才进入 approaches:目标一句话说清、mode 已定、关键约束已知、无阻塞性歧义。即便 mode 已清晰,仍要追问保留边界、风险和验证方式。(Previously: shape 必须先进入 Clarify;不要求问题必须服务于目的/约束/成功标准/阻塞歧义。)
Verify: manual(integration)

### Requirement: 出方案前不写代码

shape 必须不写任何代码、脚手架或实现文件;用户确认 design summary 和 named mode plan 之前不得进入实现动作。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: brainstorm mode 不写方案文件

`brainstorm` mode 用于在对话中探索和收敛方向,必须不写 plan/design/spec 文件;完成产物是方向、约束、推荐 approach、未决问题和是否进入 named mode 的下一决策。只有用户显式确认从 `brainstorm` 进入 `fix` / `feat` / `refactor` / `perf` 后,shape 才能写 `plans/` 文件。(Previously: default mode 不写方案文件,只给方向/选项对比。)
Verify: manual(integration)

### Requirement: named mode 先展开 approaches 再写 plan

named mode 必须先提出 2-3 个 approaches,说明 trade-off,给出推荐项和理由;不能只给一个默认方案。approach 可以按复杂度缩放,但必须暴露有意义的设计选择。(Previously: shape 默认给一个推荐 approach,只有 tradeoff 接近时才给第二个。)
Verify: manual(integration)

### Requirement: 逐枝 grill 推荐方案

shape 在选出推荐 approach 后,必须先枚举本方案的 load-bearing 决策清单(scope 边界、公开接口、数据流、错误处理、rollback、测试、迁移顺序、架构触发、脆弱假设中实际在场的)并展示给用户;清单 ≤3 条时可合并为一轮确认且每条附推荐答案,≥4 条时必须逐个提问、每问附推荐答案与理由。未经清单确认的决策不得写入 plan 的 Key decisions。问题若能通过读取代码、文档、测试或历史回答,shape 必须先读取证据,不要把仓库已经能回答的问题转嫁给用户。(Previously: 只要求 interview 式逐枝下行、一次一问,无枚举动作与档位判据。)
Verify: bench 场景 feat-midsize-sharing / fix-multi-constraint-import + judge 逐条判定

### Requirement: plan 前 design summary gate

shape 在写 named mode plan 前,必须以固定标题 `Design Summary` 开头、独立成一条消息展示按复杂度缩放的设计摘要,覆盖目标、非目标、接口/边界、关键设计决策、错误/边缘处理、测试或验收方式,消息末尾只提出一个问题:是否确认这份设计。只有用户对该消息的确认可解锁写 plan;对其他问题的肯定答复不构成设计确认。用户要求修改时,回到对应问题或 design section,不直接把未确认判断写入 plan。(Previously: 只要求展示 design summary 并询问,无固定标记、独立消息与单一问句约束。)
Verify: bench 机械 checker design-gate-skipped + judge 判定确认针对性

### Requirement: named mode 产出可执行方案文件

named mode 必须把方案写入 `plans/YYYY-MM-DD-<slug>.md`,每一步以「结果描述 + 触及范围(路径级)+ verify」表述,意图层完整、不留占位(TBD / TODO / 待定都是红旗),但不预写行级定位与最终措辞——那是 implement 的机械决策。(Previously: named mode 产出 plan,但不要求 approaches / grill / design summary gate。)
Verify: manual(integration)

### Requirement: 点名最脆弱假设

shape 的方案必须显式点名最脆弱的假设("本方案假设 X,若 X 不成立则 Y")。若该假设是 load-bearing,shape 必须在 design summary 或 plan 中说明缓解方式,不能把赌注留给 implement。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: 价值判断超出范围

用户问"值不值得做"时,shape 必须明说这不是 squire 处理的层次,只给一句观察、不下"该不该做"的结论。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: 整体与细节之间往返

shape 必须按"整体→细节→整体"往返推进:下钻某个细节前点明它服务于哪个整体,解决后回到整体复核整体是否仍成立,再进入下一个细节。当下钻由用户发起时,shape 必须跟进回答,但在答完后主动重新提出仍未合上的整体方向问题,且不把"用户在追问细节"当作整体已经清楚的信号。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: 决策点把串联交回用户

shape 必须在每个真决策处(mode 选择 / approach 推荐 / grill 解决的脆弱假设 / scope 边界 / design summary 确认)命名该决策、说明它如何移动整体,然后停下把下一步交回用户,绝不把判断无声地并入方案;用户不反对即视为同意。grill 决策清单的确认与 `Design Summary` 消息的确认是本条的两个强制实例;实质性判定(决策是否真被交回而非形式化列举)按对话证据判。这不要求每步都征得批准。(Previously: 无强制实例点名。)
Verify: manual(integration) + bench judge 逐条判定

### Requirement: 跨结构变更产出 Architecture 段

named mode 的 plan 在变更跨模块边界、引入新层或新服务、或更换技术依赖时,必须含 `## Architecture` 段:现状结构 → 目标结构(超过 3 个组件交换数据时附 ASCII 图)、组件职责与数据流、分阶段迁移(每阶段可独立 ship);未触发时该段写 None,不硬凑。本变更自身的架构决策必须显式出现在该段,不得埋进实施步骤、也不得以「拆去别的 mode」为由外推;无关的顺手重构仍按原反模式拆分。
Verify: manual(integration)
