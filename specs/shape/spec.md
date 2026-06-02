# Shape Specification

## Purpose

shape skill 把模糊想法澄清成清晰意图，再翻译成可执行方案。named mode 产出写入 `plans/` 的方案文件，default mode 产出探索结论。

## Requirements

### Requirement: 先澄清再出方案

shape 必须先进入 Clarify：一次问一个问题，达到"澄清够了"的门槛（目标一句话说清、mode 已定、关键约束已知、无阻塞性歧义）后才进入出方案；即便 mode 已清晰，仍要追问保留哪些接口、可接受多大风险等约束，不跳过。
Verify: manual(integration)

### Requirement: 出方案前不写代码

shape 必须不写任何代码、脚手架或伪代码。
Verify: manual(integration)

### Requirement: named mode 产出可执行方案文件

named mode 必须把方案写入 `plans/YYYY-MM-DD-<slug>.md`，每一步可执行、不留占位（TBD / TODO / 待定都是红旗）；default mode 必须不写方案文件，只给方向/选项对比。
Verify: manual(integration)

### Requirement: 点名最脆弱假设

shape 的方案必须显式点名最脆弱的假设（"本方案假设 X，若 X 不成立则 Y"）。
Verify: manual(integration)

### Requirement: 价值判断超出范围

用户问"值不值得做"时，shape 必须明说这不是 squire 处理的层次，只给一句观察、不下"该不该做"的结论。
Verify: manual(integration)
