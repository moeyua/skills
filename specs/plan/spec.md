# Plan Specification

## Purpose

plan skill 把模糊想法澄清成清晰意图，再翻译成可执行方案。named mode 产出写入 `plans/` 的方案文件，default mode 产出探索结论。

## Requirements

### Requirement: 先澄清再出方案

plan 必须先进入 Clarify：一次问一个问题，达到"澄清够了"的门槛（目标一句话说清、mode 已定、关键约束已知、无阻塞性歧义）后才进入出方案；即便 mode 已清晰，仍要追问保留哪些接口、可接受多大风险等约束，不跳过。
Verify: manual(integration)

### Requirement: 出方案前不写代码

plan 必须不写任何代码、脚手架或伪代码。
Verify: manual(integration)

### Requirement: named mode 产出可执行方案文件

named mode 必须把方案写入 `plans/YYYY-MM-DD-<slug>.md`，每一步可执行、不留占位（TBD / TODO / 待定都是红旗）；default mode 必须不写方案文件，只给方向/选项对比。
Verify: manual(integration)

### Requirement: 点名最脆弱假设

plan 的方案必须显式点名最脆弱的假设（"本方案假设 X，若 X 不成立则 Y"）。
Verify: manual(integration)

### Requirement: 价值判断超出范围

用户问"值不值得做"时，plan 必须明说这不是 squire 处理的层次，只给一句观察、不下"该不该做"的结论。
Verify: manual(integration)

### Requirement: 整体与细节之间往返

plan 必须按"整体→细节→整体"往返推进：下钻某个细节前点明它服务于哪个整体，解决后回到整体复核整体是否仍成立，再进入下一个细节。当下钻由用户发起时，plan 必须跟进回答，但在答完后主动重新提出仍未合上的整体方向问题，且不把"用户在追问细节"当作整体已经清楚的信号。
Verify: manual(integration)

### Requirement: 决策点把串联交回用户

plan 必须在每个真决策处（mode 选择 / approach / 已解决的脆弱假设 / 划定的 scope 边界）命名该决策、说明它如何移动整体，然后停下把下一步交回用户，绝不把判断无声地并入方案；用户不反对即视为同意。这不要求每步都征得批准。
Verify: manual(integration)

### Requirement: Clarify 阶段为提问打地基

plan 必须在 Clarify 期间读相关代码、文档与历史为提问打地基，并对方案依赖的任何外部定义、工具、库或 API 对照权威文档核实，不凭训练记忆断言。
Verify: manual(integration)
