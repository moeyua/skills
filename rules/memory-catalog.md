# Memory Catalog

> 项目持久记忆的推荐目录——「记忆支柱」绕之运转的单一真源(索引层)。
>
> 三方共用:**explore** 照它知道该读哪些记忆、**document** 照它定写哪份、将来的 **health** 照它查缺失与漂移。改记忆该有哪些、各装什么,只改这一处(哲学 #4)。
>
> 本文件是**索引**:每个 artifact 一节,给摘要 + 一行 `Format:` 指针。**详细格式规范按文档拆分在 `references/formats/<artifact>.md`,document 写哪份才加载哪份**(按需,省 token)。

每节字段:**Purpose**(装什么)/ **Audience**(`internal` 维护者·agent | `external` 使用者)/ **When needed**(何时需要)/ **Source**(权威源,缺则停下发问)/ **Boundary**(不该装什么)/ **Format**(格式规范文件)。

`internal` 是闭环设计记忆;唯一的 `external` 条目 README 是其入口投影(PRODUCT.md 边界 #2 的 2026-06-04 修订)。目录只定义默认 durable memory;用户明确指定的 catalog 外项目文档不进入本目录,由 `/document` 按指定目标单独维护。

---

## spec

- **Purpose**:行为契约——系统当前该是什么,按 domain 一份(`specs/<domain>/spec.md`),可观察行为 + 各带 `Verify:`。
- **Audience**:internal
- **When needed**:有对外可见行为的项目(几乎都)。
- **Source**:plan 的 `## Spec delta` + 落地代码。
- **Boundary**:不记实现细节(类名/库选型/步骤);无 delta 即停问。
- **Format**:`references/formats/spec.md`

## ARCHITECTURE

- **Purpose**:技术架构、目录结构、技术栈选型、关键决策。
- **Audience**:internal
- **When needed**:有非平凡结构的项目。
- **Source**:代码现状 + plan 的 `## Key decisions`。
- **Boundary**:只讲当下,不含未来/v2(归 ROADMAP);不写 UI(归 DESIGN)。
- **Format**:`references/formats/architecture.md`

## DESIGN

- **Purpose**:视觉身份——颜色 / 字体 / 间距 / 形状 / 组件等视觉规范(design.md 两层:token + 理由)。
- **Audience**:internal
- **When needed**:**有 UI / 视觉身份的项目**;纯库/CLI/后端不需要。
- **Source**:维护者陈述 + 设计稿 + `design.md` 规范(google-labs-code/design.md)。
- **Boundary**:只管视觉身份,不含交互流程 / 用户旅程(属行为,归 `specs/`);不是技术架构;不含未来项。
- **Format**:`references/formats/design.md`

## WORKFLOW

- **Purpose**:本项目开发流程,供 agent 遵守。
- **Audience**:internal(主要 agent)
- **When needed**:有特定流程约定的项目。
- **Source**:维护者陈述的流程。
- **Boundary**:开发流程,非产品使用流程。
- **Format**:`references/formats/workflow.md`

## ROADMAP

- **Purpose**:搁置/未来项的归宿,让其他记忆只讲当下。record-only。
- **Audience**:internal
- **When needed**:有「以后再做」积累的项目。
- **Source**:维护者已决定搁置/规划的内容。
- **Boundary**:只记录,不排优先级、不排期、不裁决。
- **Format**:`references/formats/roadmap.md`

## README

- **Purpose**:项目是什么 + 怎么用 + 入口。
- **Audience**:external
- **When needed**:几乎所有项目。
- **Source**:综合自 PRODUCT.md + ARCHITECTURE.md(入口投影)。
- **Boundary**:不写营销话术、不发明定位;一次合成 ≠ 长期经营对外文案。
- **Format**:`references/formats/readme.md`

## PRODUCT

- **Purpose**:定位 / 设计哲学 / 边界。
- **Audience**:internal
- **When needed**:有明确产品取舍的项目。
- **Source**:维护者陈述的意图。
- **Boundary**:**document 不写 PRODUCT 内容**——内容性变更走 `/plan`;document 至多 create 空骨架并指回。
- **Format**:无(内容经 `/plan`,document 不 author)。
