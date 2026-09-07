# Converge Specification

## Purpose

converge 按文档逐一判定并幂等收敛整个 durable-memory catalog，格式真源来自同装 Docs，机械信号来自同装 Doctor。

## Requirements

### Requirement: 逐文档状态决定动作

每份 catalog artifact 必须判为不适用、缺失、格式不符、半成品、内容漂移或已达标，并执行对应 create/re-shell/fill/stop-for-authority/skip 动作；适用性和格式先用机械证据，model 只判断 claim drift。
Verify: manual(integration)

### Requirement: sibling asset 缺失即停

Docs catalog/formats 或 Doctor checker 缺失时 converge 必须零写入停止，不得凭记忆重建；Node 24+ 缺失只跳过 checker 并准确报告。
Verify: manual(integration)

### Requirement: 保留 authored truth

已有内容必须保留，结构可重排、空缺只能从允许来源补；内容与代码冲突必须交维护者裁决。PRODUCT/Specs 从无到有时可用维护者回答，代码不得反推 intent。
Verify: manual(integration)

### Requirement: 来源明确时自主收敛

来源明确且不会损失 authored meaning 时，converge 自主 re-shell/fill 并完成适用目标；只有来源冲突、内容可能丢失、新产品 intent 或必要 authority 缺失时才请求方向，具体说明 affected document/claim 和规则来源，继续不受影响的已授权文件。缺 sibling asset 的完整性边界仍按对应 requirement 停止。
Verify: manual(integration)

### Requirement: catalog-only 且幂等

converge 只能写 catalog artifacts 和必要的 plans 目录骨架；不得安装 host 配置、触碰 catalog 外文档或做依赖/CI audit。完成后立即复跑必须零 diff。
Verify: manual(integration)
