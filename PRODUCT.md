# Skills

> Focused skills for software development and durable project memory.

Skills 不只是工具集，而是一套**克制的指令系统**。Agent 的基础能力已经足够强；Skills 的价值是给开发工作划清 outcome、真源与副作用边界，同时把不必要的流程约束留给模型判断。

## 设计哲学

### 1. 克制 — rule 是 ceiling，不是 floor

每条 rule 限制 agent 不能越过什么，不规定它必须机械地走哪些步骤。只有会保护用户意图、数据、外部状态或结果可信度的约束才值得写进 SKILL.md。

现代模型能理解 why。解释约束保护的东西，比堆叠 ALWAYS / NEVER、固定阶段和重复确认更能覆盖边角场景。没有真实风险或取舍时，agent 应直接完成 outcome。

### 2. 聚焦开发 + 记忆 — 改变项目，也记住项目

Skills 的范围是两件事：**开发一个项目**，以及**记录这个项目持久地是什么**。

公开能力形成一张软连接图：

```text
shape · · ·▶ plan · · ·▶ implement ⇄ check · · ·▶ publish · · ·▶ release
                                  │
                                  │ earned durable truth
                                  ▼
                                 docs ──▶ final check
```

`explore` 提供独立报告或内嵌事实；`converge`、`doctor`、`handoff` 保持正交。图上的虚线只表示常见上下文，不是必须顺序。11 个 skill 都能由用户直接进入；缺少上游 artifact 本身不是错误。

记忆是一等支柱。默认 catalog 只有 spec、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README 六类，由 docs 从权威来源维护。目录外项目文档只有在用户明确指定目标时才进入范围。

### 3. 用户决定进入哪个能力 — skill 只组合自身 outcome

用户决定调用哪个 public skill，也决定何时进入下一个能力。Skills 没有从想法一路自动推进到发布的 orchestrator。

这不禁止 skill 在**自己的公开 outcome 内**组合必要能力：shape 缺事实时可以取得 explore context；plan 由用户选择 `local`、`issue` 或 `both` artifact target，裸调用固定为 `both`，agent 不替用户分流；implement 先调用只读 check 完成实现修复闭环，再只在 plan Spec delta、显式文档 target 或 verified durable-claim drift 提供证据时调用 docs，并让完整 diff 通过 final check。docs 的 catalog 与 authority 边界不会因自动组合而放宽。

因此，“用户拥有串联”保护的是宏观授权，而不是强迫用户手动推动每一个内部校验或已经 earned 的持久化动作。implement 无 docs 触发时明确结束于 `not needed`，不会为流程完整感写文档；无论是否写 docs，它都不自动进入 publish/release。没有 plan、Issue、check 记录或 docs 记录时，其他 skill 仍按自己真正需要的输入判断，而不是按流程历史拒绝工作。

### 4. 机械保证一致 — 能让工具守的不靠纪律

SKILL.md frontmatter、Outcome Contract、描述质量、引用、resolver、skill↔spec、memory catalog 与公共 inventory 等结构 invariant 由仓库测试守住。模型判断留给语义；确定性事实交给代码。

同一个语义只保留一个真源：四种 change type 在 `rules/change-types.md`，六类记忆在 `rules/memory-catalog.md`，skill 路由在各自 frontmatter 并由 `skills/RESOLVER.md` 汇总。共享引用使用 symlink，避免复制漂移。

### 5. 对话式 + 解释 why — 指令服务判断

SKILL.md 先说 outcome 和边界，再解释关键约束保护什么。流程按条件出现，不为完整感制造 ceremony。用户已经说明或已经同意的决定是输入，除非新证据推翻，不重复交回用户确认。

Shape 是这条原则的直接体现：它只在会话中解决实质决策前沿，不再承担 artifact 产出。Plan 才按用户明确选择把已经足够清楚的 change 持久化为本地方案、Issue work items 或二者。把思考、artifact target 和实现分开，让每个入口都更清楚。

## 边界：明确不做的

### 1. 产品价值判断（“值不值得做”、Kill/Keep/Pivot）

Skills 处理“决定做之后如何把它想清、落地并记录”，不替人判断该不该做。Shape 可以指出直接相关的取舍，但不能代替产品所有者作价值裁决。

### 2. 未经指定的 catalog 外文档

六类 memory catalog 是默认 durable truth。用户可以明确要求 docs 维护 catalog 外的某份项目文档；agent 不能自行决定项目“应该再有”一个指南、索引、changelog 或 release-note 文件。无论目录内外，内容都必须来自权威源。

README 是 PRODUCT/ARCHITECTURE 与验证后用法的入口投影；它进入 catalog 不代表 Skills 接管营销文案或完整对外内容运营。

### 3. 有界 release set 之外的项目发布管理

Skills 提供一个覆盖单 package 与 monorepo 的有界 release：release 先从远程默认分支解析项目自己的版本拓扑，把权威版本源、fixed/linked 等协调约束和 tag/GitHub Release 身份分别建模为 release unit、version group 与 tag identity。能完整决定 release set、新 identity version 合法且每个 changed target 都是项目策略允许的后继版本时，用户显式 tag 才可直接执行；aggregate identity 中被项目策略明确标记 unchanged 的 member 可以保持当前版本。缺少 tag 或显式 tag 会扩展出额外 unit/identity 时，release 优先按项目权威版本策略生成整组候选，只有不受 group 约束且映射唯一时才回退通用 SemVer。候选 unit targets、tag identities、策略来源、理由与 canonical 依据在最终回复中展示并结束该轮；用户下一条消息确认后，只有全部依据经只读复核未变才可 mutation。

所有路径都在 fetch 后从确切远端 commit 重解 topology、policy、unit versions 与 baselines；显式 tag 只有仍映射相同 set 且没有新增传播目标时才保持同轮授权。确认有效后，release 通过项目已验证的 non-tagging、non-committing、non-publishing 版本事务生成并直接推送一个默认分支 release commit，再让 release set 的每个精确 tag 与 GitHub-generated notes Release 指向同一 commit。它不从 `fixed` / `linked` 名称猜测成员选择或版本同步规则，也不接受无法预先界定语义 diff 或无法禁用自行 stage/commit 的工具。registry publish、部署、上线检查、环境迁移、artifact upload、回滚、自动 PR、外部 release train，以及仓库 changelog/release-note 文档仍属于项目自身工具；CI/CD、staging 与 feature flag 也保持在范围外。

### 4. Agent 自身配置审计

Doctor 审计项目文档↔代码漂移、依赖/CI/文件等项目健康；它不审计 agent host 的 hooks、MCP、插件或本机配置漂移。这类 meta 能力不属于“开发 + 记忆”。

### 5. 通用项目管理与内容输入处理

Plan 的 GitHub Issue 是 `issue` / `both` 的显式开发 artifact，不是通用项目管理入口。`issue` 只接收 1–20 个用户明确分隔的同仓条目，`both` 只为一个 local plan 处理一个 Issue companion；Skills 不管理 GitHub Projects、状态流、milestone、assignee、agent 自动拆票、sub-issue、跨仓批次或通用任务系统。

URL/PDF 抓取、任意内容整理和深度研究属于通用输入层。需要事实时可以使用已有工具，但 Skills 不重复造一个内容摄取产品。

## 怎么用本文档

未来新增或修改能力时，对照这 10 条（5 条哲学 + 5 条边界）：

- 符合：继续，并让测试守住可机械验证的部分。
- 违反：重新 shape；真要改变边界，先把新的产品决定记录在这里。
- 接近边界：在 plan/PR 中说明为什么仍然 fits。
- 不确定：留在 shape 对话中，不把未决选择偷偷写进 artifact。

PRODUCT 是判断锚点，不是变更日志。历史决策保留在 git 与 [ARCHITECTURE.md](./ARCHITECTURE.md) 的决策记录中。
