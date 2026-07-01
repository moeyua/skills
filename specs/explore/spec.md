# Explore Specification

## Purpose

explore skill 建立项目的事实级理解：读关键文档、摸清结构、标注来源。

它有两个位置：用户主动了解项目时产出结构化报告；其他 skill 需要事实基础时作为 context preflight，不产出独立报告。两种位置都严格只读。

## Requirements

### Requirement: 严格只读

explore 必须不修改任何文件；看到可改进处也只记录、指向对应 skill，不动手改。report mode 把发现写进报告；context mode 把事实作为调用 skill 的 evidence 继续使用。
Verify: manual(integration)

### Requirement: 先 Overview 再深入

explore 必须先完成 Overview（确认项目身份、读全部存在的关键文档、摸清结构），用户指定范围、或调用 skill 的任务明显依赖某个范围时才进入 Scoped Deep-dive；即便只点名某模块，也先做 Overview 建骨架，不直接跳进去。Overview 中必须先读 `references/memory-catalog.md` 全文——它是判断「本项目什么算持久记忆」的规则，先于、且区别于读它所列的各份 artifact。（Previously: 只笼统要求「读全部存在的关键文档」，未把 catalog 列为先于 artifact 的必读。）
Verify: manual(integration)

### Requirement: 引用文档标注来源

explore 引用文档内容时必须标注来源（如 per README），让下游能区分"文档声称的"与"代码实际做的"。
Verify: manual(integration)

### Requirement: 不猜

explore 必须在没找到时直说"没找到 / 不存在"，不编造"大概是 X"。
Verify: manual(integration)

### Requirement: Scoped Deep-dive 按 7 维度组织

用户指定探索范围、或调用 skill 的任务明显依赖某个范围时，explore 必须按统一的 7 维度体系组织深挖——核心 5 维：职责与边界（responsibility & boundary）/ 接口与用法（interface & usage）/ 内部结构（internal structure）/ 依赖与影响面（dependencies & blast radius）/ 相关文档（related docs）；扩展 2 维：质量图景（quality picture）/ 历史与已知问题（history & known issues）。英文括注即 SKILL.md 报告模板中的维度名，两边改名须同步。不适用的维度标 N/A，不硬凑。
Verify: manual(integration)

### Requirement: 输出模式与探索深度正交

explore 必须把输出模式(report / context)与探索深度(core / deep)作为正交选择。report mode 用于用户主动 `/explore` 或自然语言要求了解项目/模块，产出结构化报告；context mode 用于被其他 skill 作为前置理解步骤调用，不产出独立 Explore Report。

core 覆盖 Overview 与核心 5 维；deep 覆盖全部 7 维。report mode 的 deep 由用户明确深度语言触发；context mode 的 deep 由调用 skill 按任务风险、跨模块程度、durable truth 影响、测试/历史依赖判断触发。不提供命令行 flag。
Verify: manual(integration)

### Requirement: report mode 产出结构化报告

report mode 必须产出含 Project Identity、Structure、Docs Inventory 的报告；用户指定范围时补 Scoped Deep-dive 节，其维度组织与覆盖范围遵循上述「Scoped Deep-dive 按 7 维度组织」与「输出模式与探索深度正交」两条要求。报告即 explore 的终点：不含 Where to Start 段、不含 follow-up entry points、不推荐下一步 skill——用户带着自己的目的来，理解建立完成即停。（Previously: explore 总是产出结构化报告；更早版本报告须含 Where to Start 段给 2-3 个入口建议，deep-dive 以 follow-up entry points 收尾。）
Verify: manual(integration)

### Requirement: context mode 不产出独立报告

context mode 必须遵循同一套 Overview-first、引用文档标注来源、不猜、Scoped Deep-dive 规则，但不产出独立 Explore Report。读取到的事实、路径、命令输出作为调用 skill 的上下文与 evidence 继续使用。context mode 不改变 explore 的只读边界，也不自动调用后续 workflow skill。
Verify: manual(integration)
