# Explore Specification

## Purpose

explore skill 为下游工作(shape / build / review)建立项目的事实级理解：读关键文档、摸清结构，产出一份结构化报告。它严格只读。

## Requirements

### Requirement: 严格只读

explore 必须不修改任何文件，只把发现写进报告。

#### Scenario: 发现可改进处

- GIVEN explore 过程中看到一处可优化的代码
- WHEN 整理发现
- THEN 把它记进报告并指向对应 skill，而不是动手改

### Requirement: 先 Overview 再深入

explore 必须先完成 Overview（确认项目身份、读全部存在的关键文档、摸清结构），用户指定了范围时才进入 Scoped Deep-dive。

#### Scenario: 用户只说"看看 auth 模块"

- GIVEN 用户要求看某个模块
- WHEN explore 开始
- THEN 先做 Overview 建立骨架，再深入该模块，而非直接跳进去

### Requirement: 引用文档标注来源

explore 引用文档内容时必须标注来源（如 per README），让下游能区分"文档声称的"与"代码实际做的"。

### Requirement: 不猜

explore 必须在没找到时直说"没找到 / 不存在"，不编造"大概是 X"。

#### Scenario: 找不到某约定

- GIVEN 项目里找不到某个预期的配置或约定
- WHEN 写进报告
- THEN 写"未找到"，不臆测一个不存在的答案

### Requirement: 产出结构化报告

explore 必须产出含 Project Identity、Structure、Docs Inventory、Where to Start 的报告；用户指定范围时补 Scoped Deep-dive。
