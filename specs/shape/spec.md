# Shape Specification

## Purpose

shape skill 把模糊想法澄清成清晰意图，再翻译成可执行方案。named mode 产出写入 `plans/` 的方案文件，default mode 产出探索结论。

## Requirements

### Requirement: 先澄清再出方案

shape 必须先进入 Clarify：一次问一个问题，达到"澄清够了"的门槛（目标一句话说清、mode 已定、关键约束已知、无阻塞性歧义）后才进入出方案；即便 mode 已清晰，仍要追问保留哪些接口、可接受多大风险等约束，不跳过。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: 出方案前不写代码

shape 必须不写任何代码、脚手架或伪代码。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: named mode 产出可执行方案文件

named mode 必须把方案写入 `plans/YYYY-MM-DD-<slug>.md`，每一步以「结果描述 + 触及范围（路径级）+ verify」表述，意图层完整、不留占位（TBD / TODO / 待定都是红旗），但不预写行级定位与最终措辞——那是 implement 的机械决策；default mode 必须不写方案文件，只给方向/选项对比。(Previously: 每一步可执行、不留占位，未区分意图决策与机械决策，实践中步骤常顶格写到 file:line 与预写措辞。)
Verify: manual(integration)

### Requirement: 点名最脆弱假设

shape 的方案必须显式点名最脆弱的假设（"本方案假设 X，若 X 不成立则 Y"）。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: 价值判断超出范围

用户问"值不值得做"时，shape 必须明说这不是 squire 处理的层次，只给一句观察、不下"该不该做"的结论。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: 整体与细节之间往返

shape 必须按"整体→细节→整体"往返推进：下钻某个细节前点明它服务于哪个整体，解决后回到整体复核整体是否仍成立，再进入下一个细节。当下钻由用户发起时，shape 必须跟进回答，但在答完后主动重新提出仍未合上的整体方向问题，且不把"用户在追问细节"当作整体已经清楚的信号。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: 决策点把串联交回用户

shape 必须在每个真决策处（mode 选择 / approach / 已解决的脆弱假设 / 划定的 scope 边界）命名该决策、说明它如何移动整体，然后停下把下一步交回用户，绝不把判断无声地并入方案；用户不反对即视为同意。这不要求每步都征得批准。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: Clarify 阶段为提问打地基

shape 必须在 Clarify 前和 Clarify 期间读相关代码、文档与历史为提问打地基。若当前项目/模块上下文缺失、过期或不足以支撑本次判断，必须先调用 explore 的 context mode 建立事实基础，根据任务风险选择 core 或 deep，不产出独立 Explore Report，并把读取证据纳入提问与方案。

shape 对方案依赖的任何外部定义、工具、库或 API 仍必须对照权威文档核实，不凭训练记忆断言。(Previously: plan 执行该职责；不要求调用 explore context mode。)
Verify: manual(integration)

### Requirement: 跨结构变更产出 Architecture 段

named mode 的 plan 在变更跨模块边界、引入新层或新服务、或更换技术依赖时，必须含 `## Architecture` 段：现状结构 → 目标结构（超过 3 个组件交换数据时附 ASCII 图）、组件职责与数据流、分阶段迁移（每阶段可独立 ship）；未触发时该段写 None，不硬凑。本变更自身的架构决策必须显式出现在该段，不得埋进实施步骤、也不得以「拆去别的 mode」为由外推；无关的顺手重构仍按原反模式拆分。
Verify: manual(integration)
