# Persist Skill Specification

## Purpose

persist skill 维护项目的持久记忆——记录系统当前该是什么。它由 spec skill 升级而来:沿用 record/correct/backfill 三动作 mode,但把目标从「`specs/` 单一」泛化为「`rules/memory-catalog.md` 里任一 artifact」(行为契约 / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README)。本文件既是 persist skill 自身的契约,也是本仓所有 spec 的格式锚点:结构标签用英文,句子用中文(因为 squire 的 specs 给维护者看,跟 README/PRODUCT/ARCHITECTURE 同语言)。

> 说明:persist 的行为是 agent 遵循 SKILL.md 的 prose,没有自动化测试可背书,所以下面每条都标 `manual(integration)`——靠实跑 `/persist` 验。

## Requirements

### Requirement: 合并 behavior delta

record 模式写 behavior 目标时,本 skill 必须按 requirement 名把 plan 的 `## Spec delta` 合并进 `specs/<domain>/spec.md`:ADDED 段追加、MODIFIED 段替换同名 requirement、REMOVED 段删除;domain 不存在则新建(含 `## Purpose`)。
Verify: manual(integration)

### Requirement: 目录驱动的多目标记忆

本 skill 必须按 `rules/memory-catalog.md` 决定写哪份 artifact 及如何写;behavior 写 `specs/`,architecture/design/workflow/roadmap/readme 写对应文档。目标不存在时 create-if-missing,出生即带来自其权威源的内容。
Verify: manual(integration)

### Requirement: 逐目标 anti-invention

本 skill 写任一目标必须依据该目标在目录里声明的权威源;源缺失必须停下发问,不从代码逆推、不凭空创作。behavior 的「无 `## Spec delta` 即停问」门槛不因泛化而降低。
Verify: manual(integration)

### Requirement: 设计记忆不含未来、ROADMAP 只记不裁决

本 skill 写 ARCHITECTURE / DESIGN 必须不含未来 / 搁置项(归 ROADMAP);写 ROADMAP 必须只记维护者已决定搁置 / 规划的项,不排优先级、不排期、不做「值不值得」的判断。
Verify: manual(integration)

### Requirement: 守目录边界、PRODUCT 指回 shape

本 skill 必须拒绝写目录外的 artifact(changelog / release notes / API 接口文档),并说明在边界外;PRODUCT 的内容性变更必须指回 `/shape`,persist 不自动写 PRODUCT 内容(至多 create 空骨架)。
Verify: manual(integration)

### Requirement: 无 delta 时直接纠正

correct 模式下,本 skill 必须在有人指明该改成什么时直接编辑已有 artifact,不需要 delta、也不需要漂移检测。
Verify: manual(integration)

### Requirement: 为已有能力补写记忆

backfill 模式下,本 skill 必须为没有 plan/delta、但已存在的能力,依据其权威行为来源(已有 SKILL.md、API 文档、维护者陈述的意图)补写记忆,而非从实现逆向猜测;只有实现可依、无权威来源时停下发问。
Verify: manual(integration)

### Requirement: 默认产出轻量记忆

本 skill 写 behavior 必须默认产出 Lite spec(behavior-first 的短 requirement、各带 `Verify:`、scope 与 non-goals),仅在高风险变更(API/契约变更、迁移、安全)时升到 Full;无对外可见行为的变更不记录。
Verify: manual(integration)

### Requirement: 照对应 format 规范写

本 skill 写任一记忆 artifact 必须加载并遵循 `skills/persist/references/formats/<artifact>.md` 的 Sections / Source / Boundary;按需只加载当前 target 那份。format 只规定结构与源,不规定段内措辞。记忆目录与 format 文件须保持同步(由 checkMemoryCatalog 机械守)。
Verify: [checkMemoryCatalog](../../tests/checks.test.ts)
