# Memory Catalog

> 项目持久记忆的推荐目录——「记忆支柱」绕之运转的单一真源。
>
> 三方共用:**explore** 照它知道该读哪些记忆、**persist** 照它写/更新记忆、将来的 **health** 照它查缺失与漂移。改记忆该有哪些、各装什么,只改这一处(哲学 #4:手维护多份必漂)。

每个 artifact 一节,固定 schema:

- **Purpose**:这份装什么(一两句)
- **Audience**:`internal`(维护者 / 协作 agent)| `external`(使用者)
- **When needed**:什么样的项目需要它 / 什么时候不需要(给「是否需要」判断用)
- **Source**:写它时依据的权威源(persist 从这取内容,源缺失即停下发问)
- **How to write**:authoring 要点
- **How to update**:何时陈旧、更新依据
- **Boundary**:不该装什么 / 特殊约束

`internal` 的记忆是闭环的设计记忆;唯一的 `external` 条目 README 是 internal 记忆的入口投影(见 PRODUCT.md 边界 #2 的 2026-06-04 修订)。目录**不收**目录外的对外内容(changelog / release notes / API 接口文档)。

---

## behavior (`specs/<domain>/spec.md`)

- **Purpose**:行为契约——系统当前该是什么,按 domain 一份,可观察行为 + 各带 `Verify:`。
- **Audience**:internal
- **When needed**:有对外可见行为的项目(几乎都需要);纯一次性脚本可不需要。
- **Source**:plan 的 `## Spec delta` + 落地代码(delta 述意图,代码是现实)。
- **How to write**:按 requirement 名合并 delta(ADDED 追加 / MODIFIED 替换 / REMOVED 删除);domain 不存在则新建(含 `## Purpose`)。只写可观察行为。
- **How to update**:行为变更落地后,把新的 `## Spec delta` 合并进来;或有人指明该改成什么时直接 correct。
- **Boundary**:不记实现细节(类名 / 函数名 / 库选型 / 步骤)——那些归 plan 或代码。无 delta 即停下发问,不从代码逆推契约。

## ARCHITECTURE.md

- **Purpose**:技术架构、目录结构、技术栈选型、关键设计决策。
- **Audience**:internal
- **When needed**:有非平凡结构的项目;单文件脚本不需要。
- **Source**:代码现状 + plan 的 `## Key decisions`。
- **How to write**:讲清当前的结构与「为什么这么定」;以代码现状为准,决策理由取自 plan。
- **How to update**:结构 / 选型 / 关键决策发生变化时更新对应段。
- **Boundary**:**只讲当下,不含未来/搁置项**(那些去 ROADMAP);不写 UI 设计(去 DESIGN)。

## DESIGN.md

- **Purpose**:UI 设计——界面、交互、视觉规范。
- **Audience**:internal
- **When needed**:**有 UI 的项目**;纯库 / CLI / 后端服务判定「不需要」。
- **Source**:维护者陈述 + 设计稿。
- **How to write**:记录界面与交互的设计意图与规范。
- **How to update**:UI 设计变更时更新。
- **Boundary**:不是技术架构(那归 ARCHITECTURE);不含未来项(去 ROADMAP)。

## PRODUCT.md

- **Purpose**:产品定位、设计哲学、边界。
- **Audience**:internal
- **When needed**:有明确产品取舍 / 需要判断锚点的项目。
- **Source**:维护者陈述的意图。
- **How to write / update**:**persist 不自动写 PRODUCT 的内容**——它是哲学文档,内容性变更走 `/shape`(改哲学是设计动作,不是记录动作)。persist 至多 create-if-missing 一个空骨架并指回 shape。
- **Boundary**:不做产品价值判断;contents 改动一律经 shape。

## WORKFLOW.md

- **Purpose**:本项目的开发流程,供 agent 清楚知道并尽量遵守。
- **Audience**:internal(主要是 agent)
- **When needed**:有特定流程约定的项目;无特殊流程可不需要。
- **Source**:维护者陈述的流程。
- **How to write**:写清本项目「怎么做事」的流程约定。
- **How to update**:流程约定变化时更新。
- **Boundary**:是开发流程,不是产品的使用流程(后者偏外向、不在此)。

## ROADMAP.md

- **Purpose**:搁置 / 未来项的归宿,让其他记忆只讲当下。record-only。
- **Audience**:internal
- **When needed**:有「以后再做」积累的项目。
- **Source**:维护者已决定搁置 / 规划的内容。
- **How to write**:平铺记「X 暂缓 / 计划,因为 Y」;维护者定,persist 只按格式记。
- **How to update**:有新的搁置决定时追加;落地后移除对应条目。
- **Boundary**:**只记录,不裁决**——不排优先级、不排期、不答「值不值得」。

## README.md

- **Purpose**:项目是什么 + 怎么用 + 入口。
- **Audience**:external(使用者)
- **When needed**:几乎所有项目。
- **Source**:由 PRODUCT.md / ARCHITECTURE.md **综合**而来(它是 internal 记忆的入口投影)。
- **How to write**:从 PRODUCT/ARCHITECTURE 综合出定位、用法、入口;源(PRODUCT/ARCHITECTURE)皆缺则停下发问。
- **How to update**:当 PRODUCT / ARCHITECTURE 变化、入口或用法改变时更新。
- **Boundary**:不写营销话术、不发明定位;一次性合成入口 ≠ 长期经营对外文案(后者超出 scope)。
