# Explore Specification

## Purpose

explore 建立可信、只读的项目理解；它先形成固定全局骨架，再只对当前问题需要的范围渐进深入。

## Requirements

### Requirement: 严格只读且不替其他能力判断

explore 不得修改文件、审计文档漂移、诊断故障或作产品/架构决定；它只提供报告或供调用能力使用的事实上下文。已知预期与实际偏差的原因由 Debug 调查，未定意图与关键设计由 Shape 澄清，不能把诊断全部路由到 Shape。
Verify: manual(integration)

### Requirement: 每次先完成固定 Overview

explore 必须先确认项目根与身份，依次读取根 README、生态 manifest、适用的项目指令，以及理解项目骨架和当前范围所必需的架构/全局文档全文，再记录顶层职责、入口和运行/验证命令；不得因用户只点名模块而跳过该骨架。项目使用 Skills memory catalog 时，必须先读 catalog 再解释其 artifact。
Verify: manual(integration)

### Requirement: Overview 后渐进深入

完成 Overview 后，explore 必须按用户范围和下游风险选择 deep-dive 维度；职责边界、接口用法、内部流、双向依赖和相关文档是 scoped core，质量与历史只在高风险、跨模块、durable-truth、回归或明确深挖请求中加入。
Verify: manual(integration)

### Requirement: 来源可区分且不猜测

文档 claim 必须标注来源并与代码/配置观察区分；证据不存在时必须明确说明，来源冲突时同时报告，不得发明事实或替用户决定 truth。
Verify: manual(integration)

### Requirement: 报告与上下文使用同一事实基础

用户独立请求探索时必须输出与范围相称的结构化报告并停止；被其他能力用于 context 时只返回相关事实、路径和缺证据项，由仍获授权的调用方继续 outcome，不额外输出 Explore Report 或结束整个任务。
Verify: manual(integration)
