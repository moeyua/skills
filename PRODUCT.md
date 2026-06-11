# Squire

> 一套用于 Agent 辅助开发的 Skills，把完整的代码开发闭环沉淀成 Agent 可调用的技能。

squire 不只是工具集——是一套**克制的指令系统**。Agent 只能做指令允许的事，所以每条指令都是一个 ceiling。这份文档说清 squire 的 ceiling 长什么样、为什么这样长，让未来任何改动都能对照判断。

## 设计哲学

squire 的所有设计决策都从下面 5 条派生。它们不是教条，是判断标尺——做新功能、改 SKILL.md、扩文档时回头对照，看是不是仍然站在这 5 条之上。

### 1. 克制 — rule 是 ceiling，不是 floor

每条 rule 限制 agent 能做什么，**不**规定它必须怎么做。SKILL.md 写清楚目标和最关键的约束，剩下让模型用自己的 judgment 完成。

硬约束多了模型只会照念，失去 theory of mind——今天的 LLM 有能力 understand why 一条规则存在，给它 why 比给它命令更有效。这正是为什么 SKILL.md 解释"为什么这条约束存在"而不是堆 ALWAYS / NEVER。

### 2. 聚焦开发 + 记忆 — 不只改代码，也记住代码

squire 的范围限定在两件事：**开发**一个项目，**记住 / 文档化**这个项目持久地是什么。核心闭环是理解（explore）、设计（shape）、改造（implement）、校验（check）、文档化（docs）。`commit` / `pr` 是 workflow-managed stages，由项目流程决定是否接在后面；`doctor` / `handoff` 是正交工具。squire 不扩展到产品决策、发布管理、Agent 自审计、内容输入处理（详见下面"边界"段）。

> **2026-06-10 修订**：正交工具增列 `handoff`（会话交接摘要，经 plan discussion 确认）。它服务于闭环的连续运转——把当前会话的工作状态只读交接给下个会话——不是新的产品能力域，「开发 + 记忆」的 scope 不因此扩大。

**文档化是一等支柱，不是外挂**：行为契约、架构、设计、流程、搁置项、入口文档——这些"项目持久地是什么"由 docs 照 `rules/memory-catalog.md` 这份记忆目录维护。它的受众是闭环本身（维护者 / 协作 agent），是闭环绕之运转的设计记忆，不是替别的项目做对外文案。

扩大 scope 就成了什么都做不精。克制要求每个 skill 做好一件事，整个套件加起来覆盖"开发 + 记忆 / 文档化"，但不越出。记忆目录仍是默认真源；目录外文档只有在用户明确指定目标路径、文档类型或具体产物时才进入 `/docs` 的范围，内容仍靠权威源而非凭空创作，价值判断仍归人（见边界 #2 的 2026-06-09 修订）。

### 3. 用户决定串联 — skill 间不自动跑

每个 skill 完成后默认停下，等用户决定下一步。implement 完不自动跳 check；check 发现 bug 不自动调 shape fix。skill 之间的转移是用户的明确动作。

自动串联剥夺用户的判断机会——用户可能想 review 完先去吃饭，可能想跳过 review 直接 commit，可能想根据 review 结果改 plan。每个决策点都属于用户，不属于 agent。SKILL.md 末尾"下一步"段给**建议**而不是直接调下一个 skill。

### 4. 机械保证一致 — 能让工具守的不靠纪律

squire 自己的元数据（SKILL.md frontmatter、Outcome Contract、触发词、RESOLVER 一致性）全部由 `vp test` 通过 `tests/checks.ts` 跑 smoke 守住。10 个 check 函数覆盖 frontmatter / Outcome Contract / 触发词 Jaccard / markdown links / skill↔spec 配对等结构 invariant。

靠"记得这样做"的纪律不可持续，特别是多人协作或 agent 协作时。一致性是可测的，那就测它——手维护多份必漂移。每次 SKILL.md 改动都跑 `pnpm test` 验证。

### 5. 对话式 + 解释 why — SKILL.md 的写作哲学

SKILL.md 的 prose 风格不堆 MUST / NEVER / Hard Stop 长尾。主体讲清楚"这个 skill 在做什么、根目的是什么"，所有约束都从根目的派生且补 why。Gotchas 不堆独立表，融进相关流程段。

模型读到"为什么"才能在边角场景自己 judgment；读到"必须 X"只能死按字面。这是哲学 #1 的具体落地——见 git commits `4616554..0216952` 的 SKILL.md refactor 实证，7 个 SKILL.md 开头第一段都是"X 是 Y——做什么。所有约束的根目的是 Z"。

## 边界：明确不做的

下面这些事情 squire 不做。每条都从前面某条哲学派生——边界不是任意拒绝，是逻辑结论。

### 1. 价值判断（"值不值得做"、Kill/Keep/Pivot）

**根因**：哲学 #2（聚焦闭环）。

squire 处理"决定做之后怎么做"，不处理"该不该做"。后者是产品决策——属于人或专门的产品工具，不属于代码开发闭环。shape skill 的 Default Mode 段明确写："用户问值不值得做时，明确说这不是 squire 处理的"。

### 2. 未经指定的目录外文档

**根因**：哲学 #2 + #1。

squire 维护一份**有界的记忆目录**（`rules/memory-catalog.md`，含 README）——目录内的每份记忆照目录规则写、依据权威源、不发明定位、不做产品价值判断。目录外项目文档只有在用户明确指定目标路径、文档类型或具体产物时才进入 `/docs` 范围；agent 不主动创建"应该有"的目录外文档。目录外文档仍要基于权威来源（用户陈述、已有代码、已有 plan、运行结果或已有文档），不能凭空创作。

> **2026-06-09 边界修订**：本条原本继续排除所有目录外内容。经 plan discussion 后改成更精确的切割：**记忆目录仍是默认 durable memory 真源；但用户显式指定时，`/document` 可以维护 catalog 外项目文档**。打破原边界的理由：原风险是 agent 主动扩 scope 和替项目发明文档；现在用"用户必须明确指定目标 + 仍需权威来源"恢复封顶。仍不允许 agent 自己决定新增 catalog 外文档；release notes / changelog 这类发布管理内容若要进入自动化，仍需另行修改边界 #3。

> **2026-06-04 边界修订**：本条原为"对外文档管理（README / 接口文档 / changelog）"，把 README 也一刀排除。经 plan discussion 后再做外科切割：**记忆支柱（当前 `docs`）照记忆目录维护项目持久记忆，README 作为 PRODUCT/ARCHITECTURE 的入口投影划入 scope**。打破原边界的理由：原条根因是"替别项目管对外文档会 scope 失控"，而记忆目录用"固定清单 + 依据权威源不发明 + 不做价值判断"恢复了封顶，克制不破。**仍排除 agent 自行发明的 catalog 外文档**，根因不变（哲学 #2 + #1）。
>
> **2026-06-01 边界修订**（保留存档）：本条原一刀排除所有文档；当时做外科切割把 spec 真源（行为契约）划入 scope。2026-06-04 修订把 spec 泛化为 document、记忆目录扩到含 README，是这条的延续。

### 3. 发布管理（上线检查 / release notes / 回滚）

**根因**：哲学 #2。

各项目发布流程差异巨大——CI/CD、staging、blue-green、feature flag、回滚策略——提炼通用机制成本高，专门为 v1 做不值得。v2 可能加（参考 Waza `/check` 的 Project Context Extraction 思路）。

### 4. Agent 自审计（hooks / MCP / config 漂移）

**根因**：哲学 #2 + #4。

Agent 自审计是 meta 层面——跟代码开发闭环正交。而且漂移检测靠机械（如 squire 自己的 `checks.ts`）比靠 agent skill 更可靠。文档跟代码漂移、依赖陈旧、CI 状态这些缝已由 `doctor` 正交工具填上（2026-06-08 落地，时名 `health`）；agent 自身的 hooks / MCP / config 漂移审计仍不做。

### 5. 内容输入处理（URL / PDF 抓取、深度研究）

**根因**：哲学 #2。

这些是输入层的工具，不是开发闭环里的环节。可以用别的 MCP / skill 解决，squire 不重复造轮子。

## 怎么用本文档

PRODUCT.md 是 squire 的判断锚点。未来任何改动（新加 skill / 改 SKILL.md / 改架构 / 加文档）都对照这 10 条（5 哲学 + 5 边界）：

- **符合** → 继续
- **违反** → 重新考虑；真要打破就在 commit message 或 PR 描述里显式 acknowledge 例外 + 解释为什么允许
- **接近边界** → 在 PR 描述里写"为什么仍然 fits PRODUCT.md"
- **不确定** → 先 plan discussion，跟 agent / contributor 对齐

哲学不是教条——是判断标尺。能力升级时（比如 v2 加 codegen / 加 health skill），先回头看哲学是否需要更新；更新方式：plan discussion 后改 PRODUCT.md，git 历史就是 versioning。

这份文档自己是哲学 #5 的实证——对话式、解释 why、不堆 MUST。要看 squire 的 prose 风格长什么样，PRODUCT.md 跟刚 refactor 完的 SKILL.md 都是范本。
