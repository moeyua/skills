# Squire Roadmap

> 搁置 / 未来项的记录——**record-only**:维护者决定做不做、何时做,本文件只按格式记,不排优先级、不排期、不裁决「值不值得」。

## Workflow-Managed Stages

- **`release` skill**:发布流程候选的 workflow-managed stage——各项目差异大,需提炼跨项目的通用机制。

## Skill 行为质量

- **WORKFLOW handoff**:每个 SKILL 完成后按 `WORKFLOW.md` 显式告诉用户下一步,同时保留「用户拥有 chaining」的边界。
- **文档结构质量审计**:给 `doctor` 的随装 checker 增加 advisory finding,扫描 durable docs 中的括号堆叠、inline qualification、累积式补丁等候选信号并排除 `plans/`;doctor 再判断应保留、拆成句段、合并重写或删除,避免局部补充继续变成结构性 patching。
