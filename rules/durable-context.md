# Durable Context Preflight

> 共享前言。每个消费 memory / preview / 历史决策的 skill 都链接到这里，再补充 skill 特定的覆盖规则。

## 何时读取 durable context

只在以下情况读取：

- 用户提到 memory、preview、之前的决定、之前的结论
- 用户提供 memory 路径
- 当前项目暴露明显的本地 memory 摘要（如 `MEMORY.md` 或文档化的 memory 目录）

不要硬编码机器特定的 memory 根路径，不要读取 raw transcripts。

## 读取顺序与预算

按以下顺序：用户提供的路径 → 当前项目范围 → 全局偏好。先列标题，再打开 1-2 个最相关的摘要。跨项目条目当作可迁移模式，不当作当前项目事实。

## Memory 类型映射

- `decision` / `preference` / `principle`：当前任务的约束（规划 / 设计 / review / 调试 / 语气 / 审计期待，因 skill 而异）
- `pattern` / `learning`：可复用的检查或假设
- `fact`：必须先用当前状态重新验证后才能影响输出

**当前代码、diff、截图、日志、测试、文档、CI、远端状态、live probe 永远 override memory**。如果它们与记忆冲突，明说冲突并以当前状态为准。

每个 skill 在引用本文件后，补充自己的 skill 特定段落（哪些 override 规则、哪些 memory 类型作为约束）。
