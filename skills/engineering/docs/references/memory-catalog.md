# Memory Catalog

> 项目的长期记忆：八类文档，上一个会话写下的，下一个会话能读到。explore 读，implement、shape、setup 写。
>
> 本文件定义每类文档管什么；具体结构见 `formats/` 下对应文件。用户指定的其他项目文档照常维护，但不算进这八类。

每节字段：**Purpose** / **Audience** (`internal` | `external`) / **When needed** / **Source** / **Boundary** / **Format**。

---

## spec

- **Purpose**:当前可观察行为的契约，按 domain 存于 `specs/<domain>/spec.md`，每条 requirement 带 `Verify:`。
- **Audience**:internal
- **When needed**:项目存在值得持久记录的行为契约时。
- **Source**:已经决定的行为、权威 API/skill 契约，以及落地结果的核对证据。
- **Boundary**:不记录实现步骤、临时计划或未经决定的行为；没有权威行为源时不反推。
- **Format**:`formats/spec.md`

## PRODUCT

- **Purpose**:项目定位、设计哲学与明确边界。
- **Audience**:internal
- **When needed**:项目存在需要长期复用的产品取舍时。
- **Source**:维护者或用户已经作出的产品决定、shape 中用户已确认的结论、已有 PRODUCT 的明确修正。
- **Boundary**:只记录已决定的产品 truth，不替用户判断方向、价值或边界；未决事项先留在对话中。
- **Format**:`formats/product.md`

## ARCHITECTURE

- **Purpose**:当前技术架构：目录结构、技术栈、数据流。
- **Audience**:internal
- **When needed**:项目有非平凡结构时。
- **Source**:代码现状与权威配置。
- **Boundary**:只讲当前结构；决策与理由归 ADR，未来项归 ROADMAP，视觉身份归 DESIGN，行为契约归 spec。
- **Format**:`formats/architecture.md`

## DESIGN

- **Purpose**:视觉身份，包括颜色、字体、间距、形状、token 与组件视觉规范。
- **Audience**:internal
- **When needed**:项目有 UI 或视觉身份时；纯库、CLI、后端通常不需要。
- **Source**:维护者已定规则、设计稿与现有设计系统。
- **Boundary**:不记录交互行为/用户旅程、技术架构或未来设想。
- **Format**:`formats/design.md`

## ROADMAP

- **Purpose**:维护者已经决定搁置或规划的未来项；record-only。
- **Audience**:internal
- **When needed**:项目有明确的以后再做事项时。
- **Source**:维护者已经作出的搁置、优先级或时间决定。
- **Boundary**:不排优先级、不排期、不判断是否值得做；只记录已有决定。
- **Format**:`formats/roadmap.md`

## README

- **Purpose**:面向使用者的项目入口：它是什么、如何开始、主要用法和深入链接。
- **Audience**:external
- **When needed**:几乎所有项目。
- **Source**:PRODUCT、ARCHITECTURE 与已经验证的使用方式的入口投影。
- **Boundary**:不发明定位或营销话术，不充当 changelog、release notes 或完整 API reference。
- **Format**:`formats/readme.md`

## GLOSSARY

- **Purpose**:项目的领域术语：每个概念叫什么、是什么、哪些说法要避免。
- **Audience**:internal
- **When needed**:项目有自己的领域概念时；第一个术语定下来时再建文件。
- **Source**:shape 或对话中用户定下的叫法、代码中已稳定使用的领域名词。
- **Boundary**:只放本项目特有的概念，不放实现细节、通用编程概念或决策记录。
- **Format**:`formats/glossary.md`

## ADR

- **Purpose**:单条架构决策记录：当时的背景、决定了什么、为什么。存于 `docs/adr/NNNN-<slug>.md`，编号递增。
- **Audience**:internal
- **When needed**:一个决定同时满足三条时：难以撤销；不了解背景的人会觉得奇怪；确实在几个方案之间做过取舍。第一次需要时才建目录。
- **Source**:用户作出或确认的决定；写之前先问用户要不要记。
- **Boundary**:只记录决策，不描述当前结构（归 ARCHITECTURE）；已有 ADR 不改写，决定变了就写一条新的并标注取代关系。
- **Format**:`formats/adr.md`
