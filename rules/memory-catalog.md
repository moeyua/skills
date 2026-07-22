# Memory Catalog

> 项目持久记忆的有界目录，也是 explore、docs、converge、doctor 共用的索引真源。
>
> 本文件只定义 artifact 的职责与格式入口；具体结构放在 `skills/docs/references/formats/`。用户明确指定的目录外项目文档可由 docs 维护，但不会因此进入默认 durable memory。

每节字段：**Purpose** / **Audience** (`internal` | `external`) / **When needed** / **Source** / **Boundary** / **Format**。

---

## spec

- **Purpose**:当前可观察行为的契约，按 domain 存于 `specs/<domain>/spec.md`，每条 requirement 带 `Verify:`。
- **Audience**:internal
- **When needed**:项目存在值得持久记录的行为契约时。
- **Source**:已经决定的行为、plan 的 `## Spec delta`、权威 API/skill 契约，以及落地结果的核对证据。
- **Boundary**:不记录实现步骤、临时计划或未经决定的行为；没有权威行为源时不反推。
- **Format**:`references/formats/spec.md`

## PRODUCT

- **Purpose**:项目定位、设计哲学与明确边界。
- **Audience**:internal
- **When needed**:项目存在需要长期复用的产品取舍时。
- **Source**:维护者或用户已经作出的产品决定、会话中已收敛的 shape 结论、已有 PRODUCT 的明确修正。
- **Boundary**:docs 只记录已决定的产品 truth，不替用户判断方向、价值或边界；未决事项先留在对话中。
- **Format**:`references/formats/product.md`

## ARCHITECTURE

- **Purpose**:当前技术架构、目录结构、技术栈与关键技术决策。
- **Audience**:internal
- **When needed**:项目有非平凡结构时。
- **Source**:代码现状、权威配置，以及已经决定的 architecture/key decisions。
- **Boundary**:只讲当前结构；未来项归 ROADMAP，视觉身份归 DESIGN，行为契约归 spec。
- **Format**:`references/formats/architecture.md`

## DESIGN

- **Purpose**:视觉身份，包括颜色、字体、间距、形状、token 与组件视觉规范。
- **Audience**:internal
- **When needed**:项目有 UI 或视觉身份时；纯库、CLI、后端通常不需要。
- **Source**:维护者已定规则、设计稿与现有设计系统。
- **Boundary**:不记录交互行为/用户旅程、技术架构或未来设想。
- **Format**:`references/formats/design.md`

## ROADMAP

- **Purpose**:维护者已经决定搁置或规划的未来项；record-only。
- **Audience**:internal
- **When needed**:项目有明确的以后再做事项时。
- **Source**:维护者已经作出的搁置、优先级或时间决定。
- **Boundary**:docs 不排优先级、不排期、不判断是否值得做；只记录已有决定。
- **Format**:`references/formats/roadmap.md`

## README

- **Purpose**:面向使用者的项目入口：它是什么、如何开始、主要用法和深入链接。
- **Audience**:external
- **When needed**:几乎所有项目。
- **Source**:PRODUCT、ARCHITECTURE 与已经验证的使用方式的入口投影。
- **Boundary**:不发明定位或营销话术，不充当 changelog、release notes 或完整 API reference。
- **Format**:`references/formats/readme.md`
