# Squire Roadmap

> 搁置 / 未来项的记录——**record-only**:维护者决定做不做、何时做,本文件只按格式记,不排优先级、不排期、不裁决「值不值得」。

## Workflow-Managed Stages

- **`release` skill**:发布流程候选的 workflow-managed stage——各项目差异大,需提炼跨项目的通用机制。

## Skill 行为质量

- **WORKFLOW handoff**:每个 SKILL 完成后按 `WORKFLOW.md` 显式告诉用户下一步,同时保留「用户拥有 chaining」的边界。
- **报告输出语言 = 用户语言(机械约束)**:explore / implement / check 等 skill 的报告模板在 SKILL.md 里是英文写的,执行时会把 agent 的输出语言锚成英文,压过用户「始终用中文」的长期指令(实测本会话三份报告均误出英文)。待办:把「报告按用户的语言输出,模板语言不参与决定输出语言」做成所有 skill 报告模板的硬约束(哲学 #4:能机械守的不靠纪律)。
- **文档结构质量审计**:给 `doctor` 的随装 checker 增加 advisory finding,扫描 durable docs 中的括号堆叠、inline qualification、累积式补丁等候选信号并排除 `plans/`;doctor 再判断应保留、拆成句段、合并重写或删除,避免局部补充继续变成结构性 patching。

## 架构与工具

- **`scripts/build-metadata.ts`**:codegen,如果加 marketplace.json 或 README install URL 自动 pin。
- **`AGENTS.md` / `CLAUDE.md`**:协作 agent 的 contributor guide。
- **hallucination marker**:反 hallucination invariant,如果出现「搞不清 skill 是否触发」的体感问题。
- **`rules/squire-routing.md`**:可选注入 host 的路由提示(给 Codex / Pi 等没有自动路由的 agent)。

## 分发渠道

- Codex / Pi / Claude Desktop 多 host 支持。
- npm 发布。
- Claude Code plugin marketplace(需 `.claude-plugin/marketplace.json`)。
