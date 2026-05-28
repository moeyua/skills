# think — `perf` mode

触发：慢、卡、性能、"优化加载"、"首屏太久"、"内存太多"、"接口太慢"。

`perf` 的核心是**先 measure 再 optimize**。没有 baseline 不开始；没有测量方式不结束。

## Clarify 重点（perf 特有）

- 性能指标：要优化什么？（latency / throughput / memory / bundle size / startup time / 别的）
- Baseline：当前数字是多少？怎么测的？
- 目标：要达到多少？为什么这个数字（用户体验 / SLA / 业务需求）？
- 瓶颈：知道在哪卡吗？还是需要先 profile？
- 接受的代价：可读性变差 / 引入复杂度 / 增加内存换 CPU——能接受哪些？

## Plan 必含字段（除通用骨架外）

### `## Baseline`

实际跑过的测量，含：

- **测量命令 / 工具**：`hyperfine ./run.sh` / Chrome DevTools Performance / `pprof -http` / 等
- **数字**：具体到单位（如 `首屏 2.3s` / `内存 1.2GB` / `bundle 8.4MB`），最好有分布（p50 / p95 / p99）而不只均值
- **环境**：硬件 / 网络 / 数据集大小

如果还没测量 → plan 第一步必须是"先 measure"，否则没 baseline 不能 commit 到 plan。

### `## Target`

具体目标数字 + 为什么是这个数字：

- `首屏 < 1s`（用户感知阈值）
- `p99 latency < 200ms`（SLA 要求）
- `bundle < 5MB`（移动网络可接受）

避免"快一点就行" / "尽量优化"——必须可验证。

### `## Measurement`

实施后**用什么命令 / 数字证明目标达成**：

- 同 baseline 用的工具 / 命令，跑同样负载
- 期望数字：`新 baseline 应满足 <target>`
- 回归保护：把测量加入 CI / benchmark suite，防止以后退化

## 反模式

- 没 baseline 就开始优化——"凭直觉"的优化经常是负优化
- 优化代码可读性下降但没换来可证明的性能提升——撤销
- 用"应该会快"猜测，不测——必须实测
- 优化非瓶颈——profile 没指向的地方不动
- 用合成 micro-benchmark 数字代替实际场景测量
- 一次性优化 N 个点，无法判断哪个起作用——一次一个变化，每次重测
- Target 写成"快一点 / 流畅一点"——不可验证
- 优化引入新功能——这是 feat，不是 perf
- 性能优化跟着改外部行为——这是 perf + refactor 混杂，要拆开
