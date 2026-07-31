---
mode: feat
title: 让 plan 支持显式产出目标
created: 2026-07-31
status: done
issue: https://github.com/moeyua/skills/issues/32
---

# 让 plan 支持显式产出目标

## Building

把现有只会“先写本地方案、再尽力创建 Issue”的 `plan` 重构为一个具有三个互斥 artifact target 的公共能力：

- `/plan` 与 `/plan both`：默认目标；为一项明确 change 先写本地方案，再创建或复用一个同范围 GitHub Issue，并建立 canonical URL 关联。
- `/plan local`：只为一项明确 change 写本地方案，不执行任何 GitHub mutation。
- `/plan issue`：只创建 GitHub Issue，不写项目文件；既支持单条，也支持用户明确分隔的同仓批量条目。

target 只由用户的显式选择决定；未指定时固定为 `both`。Agent 不根据工作树、需求成熟度、GitHub 可用性或自己的工作流判断替用户切换 target，也不把安全失败解释为选择另一 target 的授权。

## Not building

- 新增或恢复独立 `/issue` skill、alias 或第十二个公共能力。
- 根据请求内容、当前分支、工作树状态或 GitHub 状态自动推荐、推断或切换 target。
- 让 `local` 或 `both` 一次生成多份本地方案；它们继续只持久化一个 coherent change。
- 把一项复合需求自动拆成多个 Issues；批量只接受用户已经明确分隔的顶层条目。
- GitHub Projects、Issue Types、Drafts、状态流、优先级、assignee、milestone、dependency、sub-issue、跨仓批次或通用任务管理。
- 编辑、同步、关闭或按标题搜索既有 Issue。
- 修改 implement、publish、release 的核心 outcome，或让 plan 自动进入实现、提交、PR、合并或发布。
- 新增运行时服务、持久本地队列、数据库或第三方依赖。
- 批量改写历史 `plans/`；历史方案继续记录当时契约。

## Approach

采用“单一 public skill + 显式 artifact target + target 专属契约”。`SKILL.md` 在任何项目写入或 GitHub mutation 前解析 target；未显式选择时固定为 `both`。随后只加载并执行对应 target reference，共享 change type、Issue format、canonical identity 与安全边界，不复制第二套 Issue 创建入口。

不采用独立 `/issue`：它会增加公共 inventory、产生路由重叠，并让 `plan + Issue` 从一步操作退化为跨能力 URL 交接。不采用隐藏式自动分流：它会把 artifact 所有权交给 agent，违背用户已经确定的控制方式。不在现有 prose 末尾追加三个条件块；应重排整个 plan 契约，使 target 解析、专属完成条件和共享规则各有唯一归属。

## Key decisions

1. **artifact target 与 change type 正交。** `local` / `issue` / `both` 决定产物和副作用；`fix` / `feat` / `refactor` / `perf` 决定证据重点、方案结构与 Issue label。现有 plan frontmatter 的 `mode:` 继续表示 change type，不复用为 target。
2. **默认始终是 `both`。** 裸 `/plan` 与显式 `/plan both` 等价，保持当前一步获得本地方案和远程追踪的主要体验。
3. **用户拥有 target。** 只接受用户显式给出的 target；没有 target 时使用默认值。Agent 不因“看起来更适合”、当前已有任务、GitHub 不可用或输入包含多项而切换 target。
4. **`local` 零远程写入。** 它创建一份完整 draft plan；显式提供的 canonical Issue URL 可以只读验证并关联，但不得创建或编辑远程对象。
5. **`issue` 零项目写入。** 除创建后必定清理的安全临时 body 文件外，它不修改工作树、plan、branch 或本地持久状态，因此可在另一任务执行期间用于 intake。
6. **`issue` 支持有界批量。** 单次接受 1–20 个用户明确分隔、属于同一 repository 的条目；每项独立分类、渲染和返回 canonical URL。超过 20 项或跨仓输入在 mutation 前停止，不自行切批或改 target。
7. **Issue 保持开发 change 语义。** 每个可创建条目必须能可靠归入恰好一个 `fix`、`feat`、`refactor` 或 `perf`；未知复现、根因、基线等事实可以写成明确的调查或测量工作，但无法确定 change type、目标仓库、条目边界或公开安全性的条目保持 `blocked`，不使用 `brainstorm` / `triage` 兜底。
8. **显式调用即授权既定批次。** 用户已经明确 target、仓库和条目边界时不增加第二轮确认；需要推断仓库或条目边界时必须先解决该歧义，不能借确认卡替用户拆分。
9. **批量 mutation 串行且可审计。** 在创建前完成整批认证、仓库、label 和 body 校验；每条带唯一 batch marker，按稳定顺序创建并即时记录结果。首个确定或模糊失败后停止，保留已完成 Issue，不回滚、不并发 fan-out、不重放整批。
10. **canonical identity 唯一。** 用户显式提供或当前上下文唯一确定的 Issue URL 是唯一关联；验证并复用它，不按标题寻找替代品。`both` 新建成功后才把 URL 写回 plan frontmatter。
11. **`both` 是显式双产物 outcome。** 它只接受一个 coherent change，始终 local-first；Issue 失败时本地方案仍有效且不阻塞后续 implement，但本次 `both` 结果必须报告为 `partial`，不能改称 `local` 成功或自动重试。
12. **公共 skill inventory 保持 11 个。** 变更只扩大 `plan` 的显式接口；resolver、spec、测试与文档同步反映同一个公共入口。
13. **仓库源码仍是唯一真源。** 先完成源码、测试和文档验证，再通过仓库安装命令刷新已安装 snapshots；不直接编辑 `~/.agents/skills/plan`。

## Architecture

### Current

```text
/plan
  └─ local plan
       └─ best-effort Issue
            └─ issue: URL
```

所有调用都会先写当前 worktree，Issue 只是隐式 companion；无法只写本地方案，也无法在不污染当前 worktree 的情况下批量收集需求。

### Target

```text
                         explicit target?
request ──▶ target resolver ───────────────▶ local
                │                            └─ one local plan
                │
                ├──────────────────────────▶ issue
                │                            └─ 1..20 sequential Issues
                │
                └─ omitted = both ─────────▶ one local plan
                                             └─ create/reuse one Issue
                                                  └─ issue: URL
```

`target resolver` 必须在任何 side effect 前完成。三个分支互斥，只有 `both` 组合本地和 GitHub 写入；共享 reference 继续提供 change type、plan template、Issue semantic schema 与 GitHub 安全规则。

## Interface boundary

- **Public API**
  - `/plan`：等同于 `/plan both`。
  - `/plan both` 后接一项 change：本地方案 + 一个 Issue。
  - `/plan local` 后接一项 change：仅本地方案。
  - `/plan issue` 后接一个或多个明确分隔的条目：仅一个或一批 Issues。
- **Target resolution**：显式 `local`、`issue`、`both` 优先；完全省略时为 `both`。冲突或多个 target 同时出现时在 side effect 前停止。Agent 不依据语义偏好重新选择。
- **Change classification**：`local` / `both` 为整个 coherent change 选择一个共享 change type；`issue` 为每个批次条目独立选择一个共享 change type。
- **Local output**：`plans/YYYY-MM-DD-<slug>.md`，`status: draft`；只在 `local` / `both` 出现。`issue:` 仅在 canonical association 已验证或 `both` 创建成功后出现。
- **Issue output**：当前用户语言的标题和固定 semantic sections、一个 lowercase change-type label、canonical URL；批量时返回输入稳定编号到 `created` / `reused` / `blocked` / `failed` / `unknown` / `not-attempted` 的完整 ledger。
- **Batch boundary**：1–20 项、同一 canonical repository、用户明确给出条目边界。整批 body 和 labels 先验证，Issue 串行创建；第一个失败或不明确结果终止后续调用。
- **Ambiguous result recovery**：每项 body 带不展示的唯一 batch marker；模糊创建结果只允许按 marker 做一次只读 reconciliation，绝不按标题匹配或盲目重试。无法唯一确认时保持 `unknown`。
- **Existing Issue**：显式或上下文中唯一的 canonical URL 可在 `local` / `both` 中关联，在 `issue` ledger 中复用；任何 target 都不编辑既有 Issue。
- **Failure**
  - `local`：本地方案无法可靠写成时失败，GitHub 状态不参与。
  - `issue`：零创建、完整成功或带逐项 ledger 的 partial/failed；不存在本地方案兜底。
  - `both`：本地方案失败时不尝试 Issue；Issue 失败时保留方案并返回 `partial`。
- **Side effects**：项目文件只属于 `local` / `both`；label 与 Issue mutation 只属于 `issue` / `both`；安全临时文件始终清理。
- **Not exposed**：自动 target routing、多本地 plan 批量、跨仓批次、Issue 生命周期管理、Projects 或下游 skill 自动调用。

## Public surface changes

- `plan` 的 description、when-to-use 与 dispatch intent 改为“按用户选择把开发工作持久化为 local、issue 或 both”，并明确默认 `both`。
- 新增 `local` 与 `issue` target；现有默认行为由隐式 companion 改为显式定义的 `both`。
- `issue` target 首次提供零项目写入的单条/批量 GitHub intake。
- `both` 的 Issue 失败从“plan 成功的 degraded companion”改为“双产物请求的 partial 结果”；本地方案继续保持有效且不阻塞实现。
- `local` / `both` 继续每次只处理一个 coherent change；只有 `issue` 允许 1–20 个明确条目。
- 公共 skill 名称、数量、安装命令和其他 skill 入口保持不变。

## Spec delta

### `specs/plan/spec.md`

**ADDED**

- `显式 artifact target 且默认 both`
- `agent 不自动分流或降级 target`
- `local target 只写一份本地方案`
- `issue target 零项目写入并支持同仓批量`
- `issue 批次具有稳定顺序、marker、逐项 ledger 与停止恢复语义`
- `both target local-first 并建立唯一 Issue 关联`
- `三个 target 具有独立完成和 partial/failure 语义`

**MODIFIED**

- `plan 始终先产出本地方案` → 仅 `local` / `both` 写本地方案；`both` 必须在 Issue mutation 前完成本地写入，`issue` 不写项目文件。
- `一个 plan 最多关联一个 Issue` → 一份 local plan 最多关联一个 canonical Issue；`issue` target 可在一个批次创建或复用至多 20 个彼此独立的 Issues。
- `plan 与 Issue 共享意图且不重复确认` → `both` 从同一成熟意图渲染两个产物；`issue` 从每个用户明确条目渲染 intake Issue，显式授权不增加确认门槛。
- `GitHub Issue 是尽力创建的伴随产物` → Issue 是 `issue` / `both` 的显式 target 产物；`both` 的远程失败保留有效 local plan，但整体结果为 partial。
- `四种共享变更类型决定方案结构` → local plan 的结构和每个 Issue 的 label/semantic evidence 都由共享 change type 决定。

**REMOVED**

- 所有 `/plan` 调用都隐式尝试 Issue projection。
- GitHub 不可用时 agent 可把 `both` 自动解释为成功的 `local` target。

## Implementation steps

1. 先用机械契约锁定 target 解析、互斥副作用和批量结果模型。
   - outcome: tests 明确裸 `/plan` 等价 `both`、显式 target 不被推断或切换、`local` 无 GitHub mutation、`issue` 无项目写入且支持 1–20 同仓条目、`both` local-first、canonical URL 复用和三类 failure/partial 结果；现有 change-type schema 顺序与 plan template 关联约束继续受保护。
   - scope: `tests/plan.test.ts`, `tests/skill-architecture.test.ts`, `tests/smoke/verify-skills.test.ts`
   - verify: `pnpm exec vp test run tests/plan.test.ts tests/skill-architecture.test.ts tests/smoke/verify-skills.test.ts` 先因旧契约失败，再随步骤 2–3 变绿。
2. 围绕 target resolver 重写 plan skill，并把三个分支拆成按需加载的专属 reference。
   - outcome: `SKILL.md` 在任何 side effect 前唯一解析 target，默认 `both` 且禁止 agent 分流；新增 target references 分别定义 local、issue batch 和 both 的证据门槛、顺序、canonical identity、ledger 与停止条件；plan template、Issue formats 和 change-type reference 在对应分支按需加载，触碰范围内不保留旧 companion prose 的重复或矛盾结构。
   - scope: `skills/plan/SKILL.md`, `skills/plan/references/target-local.md`, `skills/plan/references/target-issue.md`, `skills/plan/references/target-both.md`, `skills/plan/references/plan-template.md`, `skills/plan/references/issue-formats.md`, `rules/change-types.md`
   - verify: `pnpm exec vp test run tests/plan.test.ts tests/checks.test.ts tests/smoke/verify-skills.test.ts`，并全文检查三个 target 的 side-effect 词只出现在正确分支。
3. 把可观察契约和当前产品架构同步到显式多目标 plan。
   - outcome: plan spec 合并本计划 Spec delta；RESOLVER 与双语 README 说明默认 `both` 和两个显式覆盖；PRODUCT 把三个 target 定义为同一 plan outcome 内由用户选择的产物边界，而非 agent orchestrator；ARCHITECTURE 更新组件职责、artifact flow、GitHub side effects 和历史决策，保留旧 plan/Issue 合并记录为历史上下文。
   - scope: `specs/plan/spec.md`, `skills/RESOLVER.md`, `README.md`, `README.zh-CN.md`, `PRODUCT.md`, `ARCHITECTURE.md`
   - verify: `rg -n "always writes|始终先写|best-effort.*Issue|尽力创建|optional Issue|可选 Issue|local|issue|both" skills/plan specs/plan skills/RESOLVER.md README.md README.zh-CN.md PRODUCT.md ARCHITECTURE.md`，逐项确认活动描述与新契约一致；运行 `pnpm test`。
4. 验证三条 target 路径、批量非原子边界和既有 Issue 复用，不制造真实测试垃圾。
   - outcome: 代表性 transcript/fixture 覆盖裸调用、三个显式 target、target 冲突、多 change + both、单 Issue、20 项边界、21 项拒绝、批内 blocked、确定失败、模糊失败 reconciliation、已有 canonical URL 与同仓 label collision；本地/`gh` side effects 使用临时仓库和命令记录模拟，真实 GitHub mutation 除非用户另行授权 disposable repository，否则准确记为 skipped。
   - scope: `skills/plan/`, `tests/plan.test.ts`, disposable local fixtures outside the repository
   - verify: `pnpm exec vp test run tests/plan.test.ts`，核对每个场景的项目 tree hash、mock `gh` 调用顺序与逐项 ledger；真实 GitHub 路径按授权状态标记 passed 或 skipped。
5. 完成整库门禁并刷新已安装 skill snapshots。
   - outcome: 格式、类型、测试、lint、spec pairing、resolver、11-skill inventory 与链接检查全部通过；源码保持唯一真源；验证后的 plan 通过仓库安装脚本刷新到已配置 agents，安装产物包含三个 target references 且裸调用契约为 `both`。
   - scope: whole repository plus configured installation targets produced by `pnpm run install`
   - verify: `pnpm check && pnpm test && pnpm lint && git diff --check && pnpm exec skills add . --list`，随后 `pnpm run install` 并只读核对已安装 `plan/SKILL.md` 与 target references。

## Verification

- command: `pnpm exec vp test run tests/plan.test.ts tests/skill-architecture.test.ts tests/smoke/verify-skills.test.ts`
- command: `pnpm check`
- command: `pnpm test`
- command: `pnpm lint`
- command: `git diff --check`
- command: `pnpm exec skills add . --list`
- checklist (manual):
  - [ ] 裸 `/plan` 与 `/plan both` 对同一明确 change 都先写一份 local plan，再创建或复用恰好一个 Issue，并在成功后记录 canonical URL。
  - [ ] `/plan local` 写一份完整 plan，命令记录中没有 label 或 Issue mutation；已有显式 URL 只读验证后可关联。
  - [ ] `/plan issue` 对 1–20 个同仓、明确分隔的条目不改变项目 tree，逐项创建或复用 Issue 并返回完整 ledger。
  - [ ] 21 项、跨仓、target 冲突、无法分类或需要 agent 自动拆分的输入在对应 side effect 前停止，且 target 不被自动切换。
  - [ ] `both` 输入多项独立 change 时不自动改成 `issue`；在创建任何 artifact 前要求用户选定一项或显式改 target。
  - [ ] `issue` 批次首个失败后不调用后续 create；模糊结果只按唯一 marker reconciliation 一次，不按标题搜索或盲目重试。
  - [ ] `both` 的 Issue 失败保留 local plan、报告 `partial`，且不阻塞后续 implement；`issue` 失败不伪造 local fallback。
  - [ ] 已有 canonical Issue URL 在所有适用 target 中只被验证和复用，不创建替代 Issue或编辑远程正文。
  - [ ] 用户选择 target 后，工作树、GitHub 可用性和 agent 偏好都不能改变它。
  - [ ] 安装 discovery 仍只有 11 个公共 skills，刷新后的已安装 plan 与仓库源码契约一致。

## Rollback

回退本次仓库变更即可恢复单一路径的 local-first + best-effort Issue companion；随后重新运行 `pnpm run install`，让已安装 snapshots 回到同一版本。源码验证和模拟测试不创建真实 GitHub 对象；若另行授权 disposable repository 做集成验收，已创建 labels/Issues 是外部持久状态，必须逐项显式清理，不能假设代码回退会撤销。

## Assumptions & risks

- **多目标 skill 可能退化成条件堆叠：**三个 target 的完成条件和副作用不同；通过先解析 target、专属 references、共享真源和机械 tests 防止一份 prose 同时执行多个分支。
- **默认 `both` 包含远程 mutation：**这是用户明确选择的默认工作流；`local` 是显式的零远程覆盖，agent 不因安全偏好擅自改默认。认证或权限失败仍必须准确报告 partial。
- **批量 Issue 非原子：**当前 `gh issue create` 没有可依赖的 idempotency key；稳定 marker、串行调用、首错停止、逐项 ledger 和一次只读 reconciliation 限制重复风险。
- **轻量 intake 与强格式冲突：**Issue 可以把未知事实表达为明确调查/测量任务，但不能用空 section、占位符或编造内容伪装成熟；只有改变条目身份、仓库、change type 或公开安全性的未知才阻塞该项。
- **当前工作树可能属于另一任务：**`issue` target 不把当前 dirty worktree 当作未明确授权的事实源；`local` / `both` 仍写调用所在 worktree，target 选择不等于授权 agent 切换或接管其他任务的 branch。
- **安装快照漂移：**仓库源码变化不会自动更新 `~/.agents` 等安装产物；最终安装验证是“从现在开始使用新 plan”的必要组成部分。
- **公开契约兼容性：**裸 `/plan` 仍为 `both`，但 Issue 失败结果从 degraded success 收紧为 partial，且新增的显式 target 会改变 resolver/文档语义；spec 与活动文档必须同一变更落地。

## Acceptance scenarios

1. **默认 both：**Given 用户提供一项足够明确的 change 且未指定 target，When 调用 `/plan`，Then 系统按 `both` 先写一份 local plan，再创建或复用一个同范围 Issue，成功后把 canonical URL 写入 frontmatter。
2. **显式 both：**Given 同样输入，When 调用 `/plan both`，Then 产物、顺序和结果语义与裸 `/plan` 完全一致。
3. **仅本地：**Given 用户调用 `/plan local`，When plan 成功，Then 只有对应的本地计划文件被持久写入，GitHub label/Issue 状态不变。
4. **仅 Issue：**Given 用户调用 `/plan issue` 并提供一个可分类条目，When GitHub preflight 通过，Then 创建或复用一个 labeled Issue、返回 URL，且项目 tree hash 前后相同。
5. **批量 Issue：**Given 用户明确列出 8 个同仓条目，When 调用 `/plan issue`，Then 系统按稳定顺序逐项创建，返回八条输入到 canonical URL 的映射，不写八份 local plan。
6. **批量边界：**Given 21 个条目或多个目标仓库，When 调用 `/plan issue`，Then 系统在任何 label/Issue mutation 前停止，不自行切批、跨仓执行或改成其他 target。
7. **禁止自动分流：**Given 用户选择 `local`、`issue` 或 `both`，When 当前工作树或 GitHub 状态让另一 target 看起来更方便，Then 系统保持所选 target，成功执行或在该 target 的边界上停止。
8. **多项 both：**Given 输入包含多项独立 change 且 target 是 `both`，When plan 建立范围，Then 在任何 artifact 前要求用户选一项，不自动转为批量 `issue`。
9. **已有身份：**Given 用户提供一个可验证的 canonical Issue URL，When 运行适用 target，Then 只复用该 URL，不按标题搜索、不编辑 Issue、不创建替代品。
10. **both 部分失败：**Given local plan 已成功而 Issue 创建明确或模糊失败，When `/plan both` 返回，Then local plan 保留且可供 implement 使用，整体状态为 `partial`，Issue 不被自动重试。
11. **批量部分失败：**Given 前三项创建成功而第四项失败，When `/plan issue` 停止，Then前三项返回 `created`，第四项返回 `failed` 或 `unknown`，其余项返回 `not-attempted`，已创建 Issues 不被删除或重建。
12. **安装后可用：**Given 源码、测试和文档均通过，When 运行仓库安装命令，Then 已配置 agents 读取到默认 `both` 与三个 target references，公共 skill inventory 仍为 11 个。
