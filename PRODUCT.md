# Praxis

> 一套用于 Agent 辅助开发的 Skills，把完整的代码开发闭环沉淀成 Agent 可调用的技能。

praxis 不只是工具集——是一套**克制的指令系统**。Agent 只能做指令允许的事，所以每条指令都是一个 ceiling。这份文档说清 praxis 的 ceiling 长什么样、为什么这样长，让未来任何改动都能对照判断。

## 设计哲学

praxis 的所有设计决策都从下面 5 条派生。它们不是教条，是判断标尺——做新功能、改 SKILL.md、扩文档时回头对照，看是不是仍然站在这 5 条之上。

### 1. 克制 — rule 是 ceiling，不是 floor

每条 rule 限制 agent 能做什么，**不**规定它必须怎么做。SKILL.md 写清楚目标和最关键的约束，剩下让模型用自己的 judgment 完成。

硬约束多了模型只会照念，失去 theory of mind——今天的 LLM 有能力 understand why 一条规则存在，给它 why 比给它命令更有效。这正是为什么 SKILL.md 解释"为什么这条约束存在"而不是堆 ALWAYS / NEVER。

### 2. 聚焦闭环 — 只做代码开发

praxis 的范围严格限定在代码开发闭环：explore → think → implement → test → review → commit → push。不扩展到产品决策、文档管理、发布管理、Agent 自审计、内容输入处理（详见下面"边界"段）。

扩大 scope 就成了什么都做不精。克制要求每个 skill 做好一件事，整个套件加起来覆盖一条完整闭环，但不超出闭环。v2 可能加的 health / release / document skill 都还在等"想清楚边界"的状态——边界没想清楚就不加。

### 3. 用户决定串联 — skill 间不自动跑

每个 skill 完成后默认停下，等用户决定下一步。implement 完不自动跳 review；review 发现 bug 不自动调 think fix。skill 之间的转移是用户的明确动作。

自动串联剥夺用户的判断机会——用户可能想 review 完先去吃饭，可能想跳过 review 直接 commit，可能想根据 review 结果改 plan。每个决策点都属于用户，不属于 agent。SKILL.md 末尾"下一步"段给**建议**而不是直接调下一个 skill。

### 4. 机械保证一致 — 能让工具守的不靠纪律

praxis 自己的元数据（SKILL.md frontmatter、Outcome Contract、触发词、RESOLVER 一致性）全部由 `vp test` 通过 `scripts/checks.ts` 跑 smoke 守住。8 个 check 函数覆盖 frontmatter / Outcome Contract / 触发词 Jaccard / markdown links 等结构 invariant。

靠"记得这样做"的纪律不可持续，特别是多人协作或 agent 协作时。一致性是可测的，那就测它——手维护多份必漂移。每次 SKILL.md 改动都跑 `pnpm test` 验证。

### 5. 对话式 + 解释 why — SKILL.md 的写作哲学

SKILL.md 的 prose 风格不堆 MUST / NEVER / Hard Stop 长尾。主体讲清楚"这个 skill 在做什么、根目的是什么"，所有约束都从根目的派生且补 why。Gotchas 不堆独立表，融进相关流程段。

模型读到"为什么"才能在边角场景自己 judgment；读到"必须 X"只能死按字面。这是哲学 #1 的具体落地——见 git commits `4616554..0216952` 的 SKILL.md refactor 实证，7 个 SKILL.md 开头第一段都是"X 是 Y——做什么。所有约束的根目的是 Z"。

## 边界：明确不做的

下面这些事情 praxis 不做。每条都从前面某条哲学派生——边界不是任意拒绝，是逻辑结论。

### 1. 价值判断（"值不值得做"、Kill/Keep/Pivot）

**根因**：哲学 #2（聚焦闭环）。

praxis 处理"决定做之后怎么做"，不处理"该不该做"。后者是产品决策——属于人或专门的产品工具，不属于代码开发闭环。think skill 的 Default Mode 段明确写："用户问值不值得做时，明确说这不是 praxis 处理的"。

### 2. 文档管理（README / 接口文档 / 变更说明）

**根因**：哲学 #2 + #1。

替别的项目管文档让 scope 失控——文档跟代码不同，演化逻辑、读者、风格都不一样。注意：praxis **自己**的文档（README / ARCHITECTURE / 本文件）不算"做文档管理"——那是任何项目都要有的，跟 praxis skills 提供给别的项目的能力是两回事。

### 3. 发布管理（上线检查 / release notes / 回滚）

**根因**：哲学 #2。

各项目发布流程差异巨大——CI/CD、staging、blue-green、feature flag、回滚策略——提炼通用机制成本高，专门为 v1 做不值得。v2 可能加（参考 Waza `/check` 的 Project Context Extraction 思路）。

### 4. Agent 自审计（hooks / MCP / config 漂移）

**根因**：哲学 #2 + #4。

Agent 自审计是 meta 层面——跟代码开发闭环正交。而且漂移检测靠机械（如 praxis 自己的 `checks.ts`）比靠 agent skill 更可靠。未来 health skill 可能填一些缝（文档跟代码漂移、依赖陈旧、CI 状态），但 v1 不在 scope。

### 5. 内容输入处理（URL / PDF 抓取、深度研究）

**根因**：哲学 #2。

这些是输入层的工具，不是开发闭环里的环节。可以用别的 MCP / skill 解决，praxis 不重复造轮子。

## 怎么用本文档

PRODUCT.md 是 praxis 的判断锚点。未来任何改动（新加 skill / 改 SKILL.md / 改架构 / 加文档）都对照这 10 条（5 哲学 + 5 边界）：

- **符合** → 继续
- **违反** → 重新考虑；真要打破就在 commit message 或 PR 描述里显式 acknowledge 例外 + 解释为什么允许
- **接近边界** → 在 PR 描述里写"为什么仍然 fits PRODUCT.md"
- **不确定** → 先 think discussion，跟 agent / contributor 对齐

哲学不是教条——是判断标尺。能力升级时（比如 v2 加 codegen / 加 health skill），先回头看哲学是否需要更新；更新方式：think discussion 后改 PRODUCT.md，git 历史就是 versioning。

这份文档自己是哲学 #5 的实证——对话式、解释 why、不堆 MUST。要看 praxis 的 prose 风格长什么样，PRODUCT.md 跟刚 refactor 完的 SKILL.md 都是范本。
