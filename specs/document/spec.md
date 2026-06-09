# Document Skill Specification

## Purpose

document skill 维护项目文档化的真源。默认 lane 是 catalog-bound memory:把系统当前是什么记录进 `rules/memory-catalog.md` 里的 artifact(spec(行为契约) / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README)。当用户明确指定目标路径、文档类型或具体文档产物时,document 也可以维护 catalog 外项目文档。本文件既是 document skill 自身的契约,也是本仓所有 spec 的格式锚点:结构标签用英文,句子用中文(因为 squire 的 specs 给维护者看,跟 README/PRODUCT/ARCHITECTURE 同语言)。

> 说明:document 的行为是 agent 遵循 SKILL.md 的 prose,没有自动化测试可背书,所以下面每条都标 `manual(integration)`——靠实跑 `/document` 验。

## Requirements

### Requirement: 合并 spec delta

record 模式写 spec 目标时,本 skill 必须按 requirement 名把 plan 的 `## Spec delta` 合并进 `specs/<domain>/spec.md`:ADDED 段追加、MODIFIED 段替换同名 requirement、REMOVED 段删除;domain 不存在则新建(含 `## Purpose`)。
Verify: manual(integration)

### Requirement: 默认目录驱动的多目标记忆

未被用户明确指定 catalog 外目标时,本 skill 必须按 `rules/memory-catalog.md` 决定写哪份 artifact 及如何写;spec 写 `specs/`,architecture/design/workflow/roadmap/readme 写对应文档。目标不存在时 create-if-missing,出生即带来自其权威源的内容。
Verify: manual(integration)

### Requirement: 用户明确指定时可写 catalog 外文档

本 skill 只有在用户明确指定目标路径、文档类型或具体文档产物时,才可以维护 `rules/memory-catalog.md` 外的项目文档;该内容仍必须基于权威来源(用户陈述、已有代码、已有 plan、运行结果或已有文档),不得由 agent 自行发明或主动扩展范围。
Verify: manual(integration)

### Requirement: 逐目标 anti-invention

本 skill 写任一目标必须依据该目标的权威源;catalog 目标按目录/format 声明的 Source,显式指定的 catalog 外文档按用户陈述、已有代码、已有 plan、运行结果或已有文档。源缺失必须停下发问,不从代码逆推、不凭空创作。spec 的「无 `## Spec delta` 即停问」门槛不因泛化而降低。
Verify: manual(integration)

### Requirement: 设计记忆不含未来、ROADMAP 只记不裁决

本 skill 写 ARCHITECTURE / DESIGN 必须不含未来 / 搁置项(归 ROADMAP);写 ROADMAP 必须只记维护者已决定搁置 / 规划的项,document 自身不主动排优先级、不排期、不做「值不值得」的判断,但维护者已决定的优先级 / 时间安排照记不挡。
Verify: manual(integration)

### Requirement: 守默认目录边界、PRODUCT 指回 plan

本 skill 必须拒绝 agent 自行发明的目录外 artifact,并要求用户明确指定目标;PRODUCT 的内容性变更必须指回 `/plan`,document 不自动写 PRODUCT 内容(至多 create 空骨架)。
Verify: manual(integration)

### Requirement: 无 delta 时直接纠正

correct 模式下,本 skill 必须在有人指明该改成什么时直接编辑已有 artifact,不需要 delta、也不需要漂移检测。
Verify: manual(integration)

### Requirement: 为已有能力补写记忆

backfill 模式下,本 skill 必须为没有 plan/delta、但已存在的能力,依据其权威行为来源(已有 SKILL.md、API 文档、维护者陈述的意图)补写记忆,而非从实现逆向猜测;只有实现可依、无权威来源时停下发问。
Verify: manual(integration)

### Requirement: 默认产出轻量记忆

本 skill 写 spec 必须默认产出 Lite spec(behavior-first 的短 requirement、各带 `Verify:`、scope 与 non-goals),仅在高风险变更(API/契约变更、迁移、安全)时升到 Full;无对外可见行为的变更不记录。
Verify: manual(integration)

### Requirement: 照对应 format 规范写

本 skill 写任一记忆 artifact 必须加载并遵循 `skills/document/references/formats/<artifact>.md` 的 Sections / Source / Boundary;按需只加载当前 target 那份。format 只规定结构与源,不规定段内措辞。记忆目录与 format 文件须保持同步(由 checkMemoryCatalog 机械守)。
Verify: [checkMemoryCatalog](../../tests/checks.test.ts)

### Requirement: 不够 memory-worthy 不开新位置

本 skill 写任一 catalog artifact 前必须判断该内容是否够格占一个位置:不够 memory-worthy 的内容,必须不开新段、不新建 artifact、不加新条目,而非追加凑数。此约束跨所有 catalog 目标(spec / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README);spec 的「无对外可见行为不记录」是它的一个实例。用户明确指定的 catalog 外文档已经获得文件存在的目标,但段落内容仍必须有权威来源且不超出用户指定范围。约束写成 document 自身的行为(document 不加),不写成内容禁令(项目不许有该内容)。
Verify: manual(integration)
