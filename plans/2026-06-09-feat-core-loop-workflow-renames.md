---
mode: feat
title: core loop 收窄与 skill 命名重整
created: 2026-06-09
status: done
---

# core loop 收窄与 skill 命名重整

## Building

把 squire 的产品模型从「所有常用 skill 串成一条线」收窄为「核心开发记忆闭环 + WORKFLOW 管理的交付阶段 + 正交工具」。核心闭环改为 `explore -> plan -> build -> verify -> document`;`commit` 保留为 workflow-managed stage;`propose` 直接 rename 为 `pull-request`;`shape` 直接 rename 为 `plan`;`persist` 直接 rename 为 `document`。旧命令不保留 alias。

## Not building

- 不新增 `handoff` skill。
- 不新增 `release` skill。
- 不保留 `/shape`、`/persist`、`/propose` 兼容 alias。
- 不改变 `build`、`verify`、`commit`、`health` 的主体行为。
- 不让 `/document` 主动发现并创建 catalog 外文档;catalog 外文档必须由用户明确指定目标或文档类型。
- 不把 `WORKFLOW.md` 写成所有项目的通用发布流程;本次只建立它作为项目特定串联规则的归位。
- 不处理多 host 分发、marketplace、npm 发布。

## Approach

采用一次 breaking rename + 文档模型重排 + 受控文档边界扩展。先移动 skill 目录和 spec domain,再全仓替换命令名、路由、spec、文档和测试引用;同时把 `/document` 定成两条 lane:默认维护 catalog 内 durable memory,用户明确指定时可维护 catalog 外具体文档。最后把 `handoff` 与 `release` 明确留在 ROADMAP,避免新增 skill 抢进本次 scope。

这比保留旧 alias 更干净:当前仓库仍早期,两套命令名会让 `RESOLVER.md`、README、spec 和触发词长期背负重复心智模型,抵消这次改名的价值。

## Premise collapse

This plan assumes command compatibility is not required. If existing users or automation still depend on `/shape`、`/persist`、`/propose`, direct rename will break them and the plan must either add a migration note or introduce temporary alias skills;本次你已确认不保留 alias,所以按 breaking change 执行。

## Key decisions

1. **Core loop 收窄到 `explore -> plan -> build -> verify -> document`** - core loop 只表达一次变更从理解、设计、实现、验证到文档化当前事实的最小闭环。
2. **`commit` 保留名称并移出 core loop** - `commit` 是常见、直觉且边界清楚的交付动作,但不再定义 core loop。
3. **`shape -> plan`** - 降低命令认知成本;同时在正文里保留 clarify / brainstorm 的能力边界,避免 `plan` 被误解成只写方案文件。
4. **`persist -> document`** - 命令更直觉,但边界改为受控扩展:默认写 catalog 内 durable memory;用户明确指定时可写 catalog 外具体文档。
5. **`propose -> pull-request`** - 让命令目标直观地指向 PR;当前不为 GitLab MR 抽象命名。
6. **`handoff`、`release` 只进未来规划** - 本次方案只给产品分层和现有 skill 重命名,不新增能力。

## Public surface changes

- `/shape` removed; `/plan` added.
- `/persist` removed; `/document` added.
- `/propose` removed; `/pull-request` added.
- Core loop 文档从 `explore -> shape -> build -> verify -> persist -> commit -> propose` 改为 `explore -> plan -> build -> verify -> document`。
- `commit` 和 `pull-request` 作为 workflow-managed stages 记录,由 `WORKFLOW.md` 或 README 的 workflow 段说明如何串联。
- `handoff`、`release` 出现在 ROADMAP,不作为可触发命令暴露。
- `/document` 默认维护 `rules/memory-catalog.md` 内的 durable memory;当用户明确指定目标文档或文档类型时,也可维护 catalog 外的具体项目文档。

## Spec delta

```markdown
## MODIFIED Requirements

### Requirement: 先澄清再出方案

plan 必须先进入 Clarify:一次问一个问题,达到「澄清够了」的门槛后才进入出方案;即便 mode 已清晰,仍要追问保留哪些接口、可接受多大风险等约束,不跳过。(Previously: shape 必须先进入 Clarify。)
Verify: manual(integration)

### Requirement: named mode 产出可执行方案文件

plan 的 named mode 必须把方案写入 `plans/YYYY-MM-DD-<slug>.md`;default mode 必须不写方案文件,只给方向/选项对比。(Previously: shape 的 named mode 写方案文件。)
Verify: manual(integration)

### Requirement: 默认目录驱动的多目标记忆

document 在未被用户明确指定 catalog 外目标时,必须按 `rules/memory-catalog.md` 决定写哪份 artifact 及如何写;spec 写 `specs/`,architecture/design/workflow/roadmap/readme 写对应文档。目标不存在时 create-if-missing,出生即带来自其权威源的内容。(Previously: persist 执行该职责。)
Verify: manual(integration)

### Requirement: 用户明确指定时可写 catalog 外文档

document 只有在用户明确指定目标路径、文档类型或具体文档产物时,才可以维护 `rules/memory-catalog.md` 外的项目文档;该内容仍必须基于权威来源(用户陈述、已有代码、已有 plan、运行结果或已有文档),不得由 agent 自行发明或主动扩展范围。
Verify: manual(integration)

### Requirement: PR 描述据整分支综合

pull-request 的 PR 标题与正文必须综合整条分支的所有 commit,而非只看最新一个 commit,Summary 不遗漏早先 commit 的主题。(Previously: propose 执行该职责。)
Verify: manual(integration)

### Requirement: PR 正文必须含 Test plan

pull-request 的 PR 正文必须包含 Test plan 段;即使无需测试也必须写明原因,不留空。(Previously: propose 执行该职责。)
Verify: manual(integration)
```

## Implementation steps

1. **移动 skill 目录与 spec domain**
   - change: `git mv skills/shape skills/plan`;`git mv skills/persist skills/document`;`git mv skills/propose skills/pull-request`;`git mv specs/shape specs/plan`;`git mv specs/persist specs/document`;`git mv specs/propose specs/pull-request`。
   - verify: `rg --files skills specs | rg '(^skills/(plan|document|pull-request)/SKILL.md$|^specs/(plan|document|pull-request)/spec.md$)'` 能看到 6 个目标文件;旧路径不存在。

2. **更新 renamed skill 的 frontmatter 与正文命名**
   - change: 在 `skills/plan/SKILL.md` 中把 `name`、description、when_to_use、dispatch_intent、标题和正文里的 self-reference 从 shape 改为 plan;保留 default / fix / feat / refactor / perf mode 语义。
   - change: 在 `skills/document/SKILL.md` 中把 persist 改为 document,把默认职责写成 catalog-bound durable memory,并新增 explicit document request lane:只有用户明确指定 catalog 外目标时才写 catalog 外文档;引用路径从 `references/memory-catalog.md` 和 `references/formats/*` 保持可解析。
   - change: 在 `skills/pull-request/SKILL.md` 中把 propose 改为 pull-request,正文改为推送分支并打开 PR;保留 non-GitHub remote 跳过开 PR 的边界。
   - verify: `pnpm test` 中 frontmatter name <-> dir、description conformance、Outcome Contract 和 references checks 通过。

3. **更新 mode reference、cross-skill 指向和旧命令文本**
   - change: 全仓替换面向当前行为的 `shape`/`persist`/`propose` 引用,但保留历史 plan 文件中作为历史记录的旧名。重点更新 `skills/*/SKILL.md`、`skills/*/references/*.md`、`rules/*.md`、`specs/**/spec.md`、`README.md`、`ARCHITECTURE.md`、`PRODUCT.md`、`ROADMAP.md`。
   - change: `skills/plan/references/plan-template.md` 和 `mode-*.md` 中把 “think/shape writes” 等旧表述改成 plan。
   - verify: `rg -n "/shape|/persist|/propose|skills/shape|skills/persist|skills/propose|specs/shape|specs/persist|specs/propose|shape skill|persist skill|propose skill" README.md PRODUCT.md ARCHITECTURE.md ROADMAP.md skills specs rules tests package.json vite.config.ts tsconfig.json` 无当前文档/代码残留;历史 `plans/` 可有旧名。

4. **重排 README / PRODUCT / ARCHITECTURE 的产品模型**
   - change: README 的 skill 表改为 `plan`、`document`、`pull-request`;工作流主图改为 `explore -> plan -> build -> verify -> document`;另加 workflow-managed stages 说明 `commit -> pull-request` 由项目流程串联,`health` 为正交工具。
   - change: PRODUCT 的哲学 #2 改成 core loop + workflow-managed stages + orthogonal tools 的边界表述;保留「开发 + 记忆」和「用户决定串联」原则。边界 #2 同步扩展:catalog 仍是默认 durable memory 真源;用户明确指定时,`/document` 可维护 catalog 外项目文档,但 agent 不主动创建 catalog 外文档。
   - change: ARCHITECTURE 的目录树、七层职责、典型工作流、关键设计决策记录中的 skill 名称与分层同步。
   - verify: 人读 README 第一屏能看出 core loop 不含 commit/pull-request;`pnpm test` markdown link checks 通过。

5. **更新 RESOLVER 路由**
   - change: `skills/RESOLVER.md` 改为三段: Core loop (`explore/plan/build/verify/document`), Workflow-managed stages (`commit/pull-request`), Orthogonal tools (`health`)。
   - change: `/plan`、`/document`、`/pull-request` 触发词替换旧命令;`commit` 保留。
   - verify: `checkResolverConsistency` 通过;`rg -n "skills/(shape|persist|propose)/SKILL.md|/shape|/persist|/propose" skills/RESOLVER.md` 无输出。

6. **更新 specs 与 spec 引用**
   - change: `specs/plan/spec.md`、`specs/document/spec.md`、`specs/pull-request/spec.md` 的标题、Purpose、Requirements 改名;document spec 增加 explicit document request lane,并写清默认 catalog-bound 行为。
   - change: 其他 specs 中指向 `shape fix`、`persist`、`propose` 的 routing 改为 `plan fix`、`document`、`pull-request`。
   - verify: `node skills/health/scripts/checker.ts . --json` 不报 spec format 问题;`pnpm test` 通过。

7. **更新测试期望与工具检查**
   - change: `tests/checks.test.ts`、`tests/smoke/verify-skills.test.ts` 中任何固定 skill 数、路径、fixtures 或 resolver 断言同步新命名。
   - change: 如触发词 Jaccard 因 `plan` 与其他 skill 撞车,调整 `when_to_use` 为自然语言且不过度塞 `/plan` 字符串。
   - verify: `pnpm test` 通过。

8. **记录未来规划,但不新增 skill**
   - change: `ROADMAP.md` 保留 `release skill` 未来项,增加 `handoff skill` 未来项;说明二者本次不落地。`release` 标记为 workflow-managed stage 候选,`handoff` 标记为可能的 orthogonal tool 或 WORKFLOW-managed stage,待后续 plan 决定。
   - verify: `rg -n "handoff|release" ROADMAP.md` 能看到未来项;`rg --files skills specs | rg "(handoff|release)"` 无输出。

## Verification

- command: `pnpm test`
- command: `node skills/health/scripts/checker.ts . --json`
- manual checklist:
  - [x] README 的 core loop 显示为 `explore -> plan -> build -> verify -> document`。
  - [x] README/RESOLVER 明确 `commit -> pull-request` 属于 workflow-managed stages。
  - [x] `health` 仍是 orthogonal tool,未进入 core loop。
  - [x] `/shape`、`/persist`、`/propose` 没有作为当前命令出现。
  - [x] `/document` 默认 catalog-bound,且只有用户明确指定时才允许 catalog 外文档。
  - [x] `handoff`、`release` 只在 ROADMAP 出现,未新增 skill/spec。
  - [x] `commit` 名称和边界保持不变。

## Rollback

本变更应作为一个主题 commit。若 rename 方向错误,用 `git revert <commit>` 回到旧命令名和旧文档模型。由于不做数据迁移、不引入新依赖、不保留 alias,rollback 只涉及文件路径和文本恢复。

## Risks & Unknowns

- **Breaking command rename**:已有用户或脚本调用 `/shape`、`/persist`、`/propose` 会失效。mitigation = README/计划/提交信息明确这是 breaking rename;本次不保留 alias 是已确认决策。
- **`plan` 误导为只写计划文件**:impact = default brainstorm / clarify 能力被低估。mitigation = `skills/plan/SKILL.md` frontmatter 和 README 说明 plan 包含 clarify、brainstorm 与 named modes。
- **`document` 误导为通用文档生成器**:impact = agent 主动创建 catalog 外文档或扩写用户没指定的内容。mitigation = `document` 正文第一段写两条 lane;catalog 外文档必须由用户明确指定,并基于权威来源。
- **PRODUCT 边界扩展不够清楚**:impact = changelog/release notes/API docs 被无声吸入。mitigation = PRODUCT 边界 #2 明确:catalog 是默认真源;catalog 外只响应用户显式请求,不由 agent 主动发现和创建。
- **`pull-request` 过度 GitHub 化**:impact = 非 GitHub remote 语义看起来弱。mitigation = 保留原 propose 的非 GitHub remote 跳过开 PR行为,并在 Not exposed 中说明不支持 GitLab MR 自动创建。
- **WORKFLOW.md 角色膨胀**:impact = 把项目流程文档误当成产品真源。mitigation = 本次只建立分类和未来位置,不创建泛化 release/deploy 流程。

## Interface boundary

- **Public commands**: `/plan`, `/document`, `/pull-request`;`/explore`, `/build`, `/verify`, `/commit`, `/health` 保持。
- **Removed commands**: `/shape`, `/persist`, `/propose`;无 alias。
- **Inputs**:与原 renamed skills 相同;只是触发命令、目录名、frontmatter name 和文档命名改变。
- **Outputs**:与原 renamed skills 相同;`plan` named mode 仍写 `plans/YYYY-MM-DD-<slug>.md`;`document` 默认写 catalog artifact,用户明确指定时写指定项目文档;`pull-request` 仍 push/open PR 或为非 GitHub remote 输出手动 PR 文案。
- **Side effects**:build 实施本计划时会重命名文件路径并更新文档/spec/tests;运行时 skill 行为不新增外部副作用。
- **Not exposed**:旧命令 alias、handoff/release 命令、agent 主动创建 catalog 外文档、GitLab MR 自动创建、通用发布流程。

## Acceptance scenarios

- Given 用户输入 `/plan 想想这个改法`, when agent 路由 skill, then 加载 `skills/plan/SKILL.md` 并执行原 shape 的 clarify/plan 行为。
- Given 用户输入 `/document 记录这次变更`, when agent 路由 skill, then 加载 `skills/document/SKILL.md` 并默认按 memory catalog 写目标 artifact。
- Given 用户输入 `/document 帮我写 docs/setup.md`, when 目标文档在 catalog 外但由用户明确指定, then `/document` 可基于权威来源维护该具体文档。
- Given agent 认为项目“应该补一份 migration guide”但用户未指定, when 运行 `/document`, then 不主动创建 catalog 外文档,只报告需要用户明确指定。
- Given 用户输入 `/pull-request 开 PR`, when 当前分支可推且 remote 是 GitHub, then 执行原 propose 的 push + PR 创建流程。
- Given 用户输入旧命令 `/shape`, when 查当前 README/RESOLVER, then 不再把它列为支持命令。
- Given 阅读 README, when 查 core loop, then 看到 `explore -> plan -> build -> verify -> document`,并看到 `commit -> pull-request` 属于 workflow-managed stages。
- Given 阅读 ROADMAP, when 查未来 skill, then `handoff` 与 `release` 只作为未来项出现,仓内没有对应 `skills/` 或 `specs/` 目录。
