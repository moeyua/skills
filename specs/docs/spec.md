# Docs Skill Specification

## Purpose

docs skill 维护项目文档化的真源。默认 lane 是 catalog-bound memory:把系统当前是什么记录进 `rules/memory-catalog.md` 里的 artifact(spec(行为契约) / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README)。当用户明确指定目标路径、文档类型或具体文档产物时,docs 也可以维护 catalog 外项目文档。本文件既是 docs skill 自身的契约,也是本仓所有 spec 的格式锚点:结构标签用英文,句子用中文(因为 squire 的 specs 给维护者看,跟 README/PRODUCT/ARCHITECTURE 同语言)。

> 说明:docs 的行为是 agent 遵循 SKILL.md 的 prose,没有自动化测试可背书,所以下面每条都标 `manual(integration)`——靠实跑 `/docs` 验。

## Requirements

### Requirement: 合并 spec delta

record 模式写 spec 目标时,本 skill 必须按 requirement 名把 plan 的 `## Spec delta` 合并进 `specs/<domain>/spec.md`:ADDED 段追加、MODIFIED 段替换同名 requirement、REMOVED 段删除;domain 不存在则新建(含 `## Purpose`)。(Previously: document 执行该职责。)
Verify: manual(integration)

### Requirement: 默认目录驱动的多目标记忆

未被用户明确指定 catalog 外目标时,本 skill 必须按 `rules/memory-catalog.md` 决定写哪份 artifact 及如何写;spec 写 `specs/`,architecture/design/workflow/roadmap/readme 写对应文档。目标不存在时 create-if-missing,出生即带来自其权威源的内容。(Previously: document 执行该职责。)
Verify: manual(integration)

### Requirement: 用户明确指定时可写 catalog 外文档

本 skill 只有在用户明确指定目标路径、文档类型或具体文档产物时,才可以维护 `rules/memory-catalog.md` 外的项目文档;该内容仍必须基于权威来源(用户陈述、已有代码、已有 plan、运行结果或已有文档),不得由 agent 自行发明或主动扩展范围。(Previously: document 执行该职责。)
Verify: manual(integration)

### Requirement: 逐目标 anti-invention

本 skill 写任一目标必须依据该目标的权威源;catalog 目标按目录/format 声明的 Source,显式指定的 catalog 外文档按用户陈述、已有代码、已有 plan、运行结果或已有文档。源缺失必须停下发问,不从代码逆推、不凭空创作。spec 的「无 `## Spec delta` 即停问」门槛不因泛化而降低。(Previously: document 执行该职责。)
Verify: manual(integration)

### Requirement: 设计记忆不含未来、ROADMAP 只记不裁决

本 skill 写 ARCHITECTURE / DESIGN 必须不含未来 / 搁置项(归 ROADMAP);写 ROADMAP 必须只记维护者已决定搁置 / 规划的项,docs 自身不主动排优先级、不排期、不做「值不值得」的判断,但维护者已决定的优先级 / 时间安排照记不挡。(Previously: document 执行该职责。)
Verify: manual(integration)

### Requirement: 守默认目录边界、PRODUCT 指回 shape

本 skill 必须拒绝 agent 自行发明的目录外 artifact,并要求用户明确指定目标;PRODUCT 的内容性变更必须指回 `/shape`,docs 不自动写 PRODUCT 内容(至多 create 空骨架)。(Previously: document 执行该职责,PRODUCT 指回 `/plan`。)
Verify: manual(integration)

### Requirement: 无 delta 时直接纠正

correct 模式下,本 skill 必须在有人指明该改成什么时直接编辑已有 artifact,不需要 delta、也不需要漂移检测。(Previously: document 执行该职责。)
Verify: manual(integration)

### Requirement: 为已有能力补写记忆

backfill 模式下,本 skill 必须为没有 plan/delta、但已存在的能力,依据其权威行为来源(已有 SKILL.md、API 文档、维护者陈述的意图)补写记忆,而非从实现逆向猜测;只有实现可依、无权威来源时停下发问。(Previously: document 执行该职责。)
Verify: manual(integration)

### Requirement: 默认产出轻量记忆

本 skill 写 spec 必须默认产出 Lite spec(behavior-first 的短 requirement、各带 `Verify:`、scope 与 non-goals),仅在高风险变更(API/契约变更、迁移、安全)时升到 Full;无对外可见行为的变更不记录。(Previously: document 执行该职责。)
Verify: manual(integration)

### Requirement: 照对应 format 规范写

本 skill 写任一记忆 artifact 必须加载并遵循 `skills/docs/references/formats/<artifact>.md` 的 Sections / Source / Boundary;按需只加载当前 target 那份。format 只规定结构与源,不规定段内措辞。记忆目录与 format 文件须保持同步(由 checkMemoryCatalog 机械守)。(Previously: 路径为 `skills/document/references/formats/`,document 执行该职责。)
Verify: [checkMemoryCatalog](../../tests/checks.test.ts)

### Requirement: 不够 memory-worthy 不开新位置

本 skill 写任一 catalog artifact 前必须判断该内容是否够格占一个位置:不够 memory-worthy 的内容,必须不开新段、不新建 artifact、不加新条目,而非追加凑数。此约束跨所有 catalog 目标(spec / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README);spec 的「无对外可见行为不记录」是它的一个实例。用户明确指定的 catalog 外文档已经获得文件存在的目标,但段落内容仍必须有权威来源且不超出用户指定范围。约束写成 docs 自身的行为(docs 不加),不写成内容禁令(项目不许有该内容)。(Previously: document 执行该职责。)
Verify: manual(integration)

### Requirement: WORKFLOW 流程阶段以 squire skill pipeline 为骨架访谈

本 skill 生成或更新 WORKFLOW.md 的「流程阶段」section 时,必须以 squire 的 skill pipeline 为默认骨架底稿(explore 仅在模块不熟悉时,继以 shape → implement → check → docs → commit → pr),并以 subtract-and-add 访谈维护者:默认全部阶段在册作为待确认提案,逐条问维护者删哪些、加哪些(如 release / deploy)及加在何处。骨架结构性保证该 section 的完整与顺序——不得漏列既有 skill 步骤(含 docs 自身),不得发明骨架外阶段;留下未经维护者确认的阶段、或将其当作既定事实写入,即属凭空发明。骨架只约束「流程阶段」一段;「各阶段约定与门禁」「构建与命令」两段仍须各自向维护者求源、不得由骨架代填,项目间差异只落在这两段的内容、不落在结构。未访谈即写整篇 WORKFLOW.md 属凭空发明,必须停下先访谈。
Verify: manual(integration)
