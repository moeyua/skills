# Docs Skill Specification

## Purpose

docs skill 从权威来源维护六类 durable memory（spec、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README）或用户明确指定的项目文档；它记录已经确立的 truth，不负责作出决定。

## Requirements

### Requirement: 默认目录只包含六类记忆

未指定 catalog 外目标时，docs 必须按 `rules/memory-catalog.md` 在 spec、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README 中选择适用目标，并加载对应 format；不得创建 WORKFLOW 或 agent 自行发明的第七类默认 artifact。
Verify: [durable memory architecture](../../tests/durable-memory.test.ts)

### Requirement: 选目标前建立可靠上下文

当前项目或记忆上下文不足时，docs 必须按目标风险取得 explore context；该上下文只帮助定位事实，不替代 catalog 对目标 Source 的要求。
Verify: manual(integration)

### Requirement: 逐目标 anti-invention

docs 写任一目标必须依据用户/维护者已定决定、grounded shape 结论、plan delta/key decision、验证后的 landed behavior、权威契约、现有文档或明确 correction；源缺失时必须省略或停问，不得从实现反推意图。
Verify: manual(integration)

### Requirement: docs 可记录已决定的 PRODUCT truth

PRODUCT 定位、哲学或边界已经由用户、维护者或 shape 会话决定时，docs 必须能按 product format 写入或修正；需要 docs 自行判断方向、价值或边界时必须停止该 claim，不得替用户裁决。
Verify: manual(integration)

### Requirement: 合并或补写行为契约

存在 plan `## Spec delta` 时，docs 必须按 requirement 名执行 ADDED/MODIFIED/REMOVED 并用 landed evidence 核对；无 delta 时只可从明确行为契约、权威 skill/API 或维护者陈述 correction/backfill，不得从代码独自推断产品行为。
Verify: manual(integration)

### Requirement: 用户明确指定时可写 catalog 外文档

只有用户明确指定路径、文档类型或具体 artifact 时，docs 才可维护 catalog 外项目文档；内容仍须有权威来源且不得自行扩展到 sibling docs、索引、changelog 或 release-note 文件。
Verify: manual(integration)

### Requirement: 设计记忆不含未来且 ROADMAP 只记录

ARCHITECTURE 与 DESIGN 必须只记录当前 truth；ROADMAP 只记录维护者已经决定的未来项、优先级或日期，docs 不主动规划、排期或判断价值。
Verify: manual(integration)

### Requirement: README 是入口投影

README 必须从 PRODUCT、ARCHITECTURE 与验证后的用法合成，不得发明定位、营销主张或充当 changelog/release notes。
Verify: manual(integration)

### Requirement: 不够 memory-worthy 不开位置

内容不值得长期复用时，docs 必须不新建文件/section/entry；需要写时应重塑 touched range 并保留仍正确的既有内容，而非追加补丁式段落。
Verify: manual(integration)

### Requirement: 每次调用止于文档结果

docs 完成后必须报告目标、变更与权威来源并停止，不得自动调用 publish、release 或其他后续能力。
Verify: manual(integration)
