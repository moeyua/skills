# Squire Roadmap

> 搁置 / 未来项的记录——**record-only**:维护者决定做不做、何时做,本文件只按格式记,不排优先级、不排期、不裁决「值不值得」。
>
> 从 ARCHITECTURE.md 的「v2 规划」迁入(2026-06-04 记忆支柱重构)——设计文档只讲当下,未来项归这里。这正是 docs 写 ROADMAP 目标的 dogfood。

## Core Loop 强化

- **`explore` 局部深度探索强化**:整体探索之外,确保 / 加强对单模块的聚焦深挖(现有 Scoped Deep-dive Phase 的强化)。
- **`shape` 的 `arch` mode / 产出架构**:架构调整、技术选型、模块重组需要一个 mode;shape 需要时应产出架构(结构 / 图),参考 feature-dev。

## Workflow-Managed Stages

- **`release` skill**:发布流程候选的 workflow-managed stage——各项目差异大,需提炼跨项目的通用机制(参考 Waza `/check` 的 Project Context Extraction 思路)。

## 架构与工具

- **`scripts/build-metadata.ts`**:codegen,如果加 marketplace.json 或 README install URL 自动 pin。
- **`AGENTS.md` / `CLAUDE.md`**:协作 agent 的 contributor guide。
- **Marker(🥷 等价物)**:反 hallucination invariant,如果出现「搞不清 skill 是否触发」的体感问题。
- **`rules/squire-routing.md`**:可选注入 host 的路由提示(给 Codex / Pi 等没有自动路由的 agent)。

## 分发渠道

- Codex / Pi / Claude Desktop 多 host 支持。
- npm 发布。
- Claude Code plugin marketplace(需 `.claude-plugin/marketplace.json`)。
