# Squire Roadmap

> 搁置 / 未来项的记录——**record-only**:维护者决定做不做、何时做,本文件只按格式记,不排优先级、不排期、不裁决「值不值得」。
>
> 从 ARCHITECTURE.md 的「v2 规划」迁入(2026-06-04 记忆支柱重构)——设计文档只讲当下,未来项归这里。这正是 persist 写 ROADMAP 目标的 dogfood。

## Skill 层面

- **`health` skill**:项目体检——文档↔代码漂移检测、依赖陈旧、CI 状态、文件大小热点等。它是「校验」支柱的**正交审计**那一半(explore/verify 之外),不在线性 loop。persist 的**自动漂移同步**依赖 health 提供「哪份记忆漂了」的信号——在 health 落地前,persist 的更新只靠人主动发起。
- **`shape` 的 `arch` mode**:架构调整、技术选型、模块重组。
- **`release` skill**:发布流程——各项目差异大,需要提炼跨项目的通用机制(参考 Waza `/check` 的 Project Context Extraction 思路)。
- **persist 的 `DESIGN` / `WORKFLOW` 目标在 squire 自身的落地**:squire 无 UI,DESIGN 按目录判「不需要」;WORKFLOW 待有特定流程约定时再补。
- **persist format 的 section 结构待跟维护者敲定**:`skills/persist/references/formats/*.md` 的 section 是 AI 擅自定的、未经维护者确认(讽刺:本就是为修「全靠 AI 发挥」而建)。需逐份过格式、按维护者意图重订。交接见 `plans/2026-06-04-handoff-persist-formats.md`。

## 架构层面

- **`scripts/build-metadata.ts`**:codegen,如果加 marketplace.json 或 README install URL 自动 pin。
- **`.claude-plugin/marketplace.json`**:plugin marketplace 支持。
- **`AGENTS.md` / `CLAUDE.md`**:协作 agent 的 contributor guide。
- **Marker(🥷 等价物)**:反 hallucination invariant,如果出现「搞不清 skill 是否触发」的体感问题。
- **`rules/squire-routing.md`**:可选注入 host 的路由提示(给 Codex / Pi 等没有自动路由的 agent)。

## 分发渠道

- Codex / Pi / Claude Desktop 多 host 支持。
- npm 发布。
- Claude Code plugin marketplace。
