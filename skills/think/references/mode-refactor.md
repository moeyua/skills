# think — `refactor` mode

触发：整理结构、改内部、"重构这块"、"把 X 拆开"、"这里太乱了"。

`refactor` 的核心是**行为不变**——外部观察到的输出、副作用、性能特征保持一致；只重组内部。

## Clarify 重点（refactor 特有）

- 重构目的：可读性 / 减少重复 / 解耦 / 准备下一个 feat / 别的？
- 边界：改到哪一层为止？外部 API 包不包？
- 行为保留范围：哪些行为绝对不能变？（公开 API / 副作用 / 错误消息）
- 已有测试覆盖：现有测试能保护多少？没覆盖的部分怎么验证？

## Plan 必含字段（除通用骨架外）

### `## Behavior invariants`

明确**这次重构保证不变**的行为列表。每条是一个 reviewer 可以验证的断言。

例：

- 公开函数 `foo(x)` 在所有现有输入下返回值不变
- HTTP endpoint `/api/users` 的响应 schema 不变
- 数据库 schema 不变
- 日志格式 / 错误消息文本不变
- 性能特征（latency / memory）不显著变化

明确写**允许变化**的部分：

- 内部函数名 / 私有方法签名 / 模块结构 / 文件组织——可以变
- 未公开的实现细节——可以变

### `## Regression coverage`

如何验证 invariants 真的没变。三个层次：

1. **既有自动测试**：列出现有测试集合，跑通即可保护一部分 invariants
2. **新加回归测试**：现有测试未覆盖的 invariants，重构前先补测试（让重构有保护网）
3. **手工 spot check**：实在没法自动化的（视觉 / 集成 / 性能特征），列具体检查步骤

如果 invariants 既无自动测试也无手工 check 路径 → **refactor 不能开始**，先补测试 / 先 freeze。

## 反模式

- 一边重构一边改行为（"顺便修了 X 个 bug"）——拆出来走 fix mode
- 一边重构一边加功能——拆出来走 feat mode
- 一边重构一边优化性能——拆出来走 perf mode
- Behavior invariants 写成"功能不变"——不够具体；要逐项列
- 没有 regression coverage 就开干——重构是"高风险无收益"动作，没保护网不要做
- 把 refactor 跟 feat / fix 打包进一个 plan——审 reviewer 会看不出哪些改动是必要的
