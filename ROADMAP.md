# Squire Roadmap

> 搁置 / 未来项的记录——**record-only**:维护者决定做不做、何时做,本文件只按格式记,不排优先级、不排期、不裁决「值不值得」。
>
> 从 ARCHITECTURE.md 的「v2 规划」迁入(2026-06-04 记忆支柱重构)——设计文档只讲当下,未来项归这里。这正是 persist 写 ROADMAP 目标的 dogfood。

## Skill 层面

- **`explore` 局部深度探索强化**:整体探索之外,确保 / 加强对单模块的聚焦深挖(现有 Scoped Deep-dive Phase 的强化)。
- **`shape` 思考深度对标 brainstorm**:shape 的探索 / 思考程度不够深,应对标 brainstorm(README 致谢的 superpowers/brainstorming)做深。
- **`shape` 先锁整体意图再谈细节**:shape 应时刻保证对整体意图的理解到位,再下钻细节,避免过早陷入局部问题。
- **`shape` 不该一路自顾推进**:shape 容易从 clarify 一口气推到出 plan,应在每个决策点多停、把串联交回用户(呼应哲学 #3)。
- **`shape` 的 `arch` mode / 产出架构**:架构调整、技术选型、模块重组需要一个 mode;plan 需要时 shape 应产出架构(结构 / 图),参考 feature-dev。
- **`verify` 的 review / e2e 也走 subagent**:目前仅多 mode 并行才起 subagent;review 与 e2e 单跑也应各起 subagent 执行。
- **`persist` 的 `DESIGN` / `WORKFLOW` 目标在 squire 自身的落地**:squire 无 UI,DESIGN 按目录判「不需要」;WORKFLOW 待有特定流程约定时再补。
- **`health` skill**:项目体检——文档↔代码漂移检测、依赖陈旧、CI 状态、文件大小热点等。「校验」支柱的**正交审计**那一半(explore/verify 之外),不在线性 loop。persist 的**自动漂移同步**依赖 health 提供「哪份记忆漂了」的信号——在它落地前,persist 的更新只靠人主动发起。
- **`release` skill**:发布流程——各项目差异大,需提炼跨项目的通用机制(参考 Waza `/check` 的 Project Context Extraction 思路)。

## 架构层面

- **`scripts/build-metadata.ts`**:codegen,如果加 marketplace.json 或 README install URL 自动 pin。
- **`AGENTS.md` / `CLAUDE.md`**:协作 agent 的 contributor guide。
- **Marker(🥷 等价物)**:反 hallucination invariant,如果出现「搞不清 skill 是否触发」的体感问题。
- **`rules/squire-routing.md`**:可选注入 host 的路由提示(给 Codex / Pi 等没有自动路由的 agent)。

## 分发渠道

- Codex / Pi / Claude Desktop 多 host 支持。
- npm 发布。
- Claude Code plugin marketplace(需 `.claude-plugin/marketplace.json`)。
