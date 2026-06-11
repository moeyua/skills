# Explore Specification

## Purpose

explore skill 为下游工作(shape / implement / check)建立项目的事实级理解：读关键文档、摸清结构，产出一份结构化报告。它严格只读。

## Requirements

### Requirement: 严格只读

explore 必须不修改任何文件，只把发现写进报告；看到可改进处也只记录、指向对应 skill，不动手改。
Verify: manual(integration)

### Requirement: 先 Overview 再深入

explore 必须先完成 Overview（确认项目身份、读全部存在的关键文档、摸清结构），用户指定范围时才进入 Scoped Deep-dive；即便用户只点名某模块，也先做 Overview 建骨架，不直接跳进去。Overview 中必须先读 `references/memory-catalog.md` 全文——它是判断「本项目什么算持久记忆」的规则，先于、且区别于读它所列的各份 artifact。（Previously: 只笼统要求「读全部存在的关键文档」，未把 catalog 列为先于 artifact 的必读。）
Verify: manual(integration)

### Requirement: 引用文档标注来源

explore 引用文档内容时必须标注来源（如 per README），让下游能区分"文档声称的"与"代码实际做的"。
Verify: manual(integration)

### Requirement: 不猜

explore 必须在没找到时直说"没找到 / 不存在"，不编造"大概是 X"。
Verify: manual(integration)

### Requirement: Scoped Deep-dive 按 7 维度组织

用户指定探索范围时，explore 必须按统一的 7 维度体系组织深挖——核心 5 维：职责与边界（responsibility & boundary）/ 接口与用法（interface & usage）/ 内部结构（internal structure）/ 依赖与影响面（dependencies & blast radius）/ 相关文档（related docs）；扩展 2 维：质量图景（quality picture）/ 历史与已知问题（history & known issues）。英文括注即 SKILL.md 报告模板中的维度名，两边改名须同步。不适用的维度标 N/A，不硬凑。
Verify: manual(integration)

### Requirement: 深度由自然语言信号决定

explore 必须根据用户的自然语言判断深挖覆盖范围：无明确深度信号时覆盖 5 个核心维度；用户明确表达深度需求（如「深度探索 xx」）时覆盖全部 7 维。不提供命令行 flag。
Verify: manual(integration)

### Requirement: 产出结构化报告

explore 必须产出含 Project Identity、Structure、Docs Inventory、Where to Start 的报告；用户指定范围时补 Scoped Deep-dive 节，其维度组织与覆盖范围遵循上述「Scoped Deep-dive 按 7 维度组织」与「深度由自然语言信号决定」两条要求。（Previously: Scoped Deep-dive 节只要求 entry points / data flows / docs / follow-up 4 条。）
Verify: manual(integration)
