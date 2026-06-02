# Explore Specification

## Purpose

explore skill 为下游工作(shape / build / review)建立项目的事实级理解：读关键文档、摸清结构，产出一份结构化报告。它严格只读。

## Requirements

### Requirement: 严格只读

explore 必须不修改任何文件，只把发现写进报告；看到可改进处也只记录、指向对应 skill，不动手改。
Verify: manual(integration)

### Requirement: 先 Overview 再深入

explore 必须先完成 Overview（确认项目身份、读全部存在的关键文档、摸清结构），用户指定范围时才进入 Scoped Deep-dive；即便用户只点名某模块，也先做 Overview 建骨架，不直接跳进去。
Verify: manual(integration)

### Requirement: 引用文档标注来源

explore 引用文档内容时必须标注来源（如 per README），让下游能区分"文档声称的"与"代码实际做的"。
Verify: manual(integration)

### Requirement: 不猜

explore 必须在没找到时直说"没找到 / 不存在"，不编造"大概是 X"。
Verify: manual(integration)

### Requirement: 产出结构化报告

explore 必须产出含 Project Identity、Structure、Docs Inventory、Where to Start 的报告；用户指定范围时补 Scoped Deep-dive。
Verify: manual(integration)
