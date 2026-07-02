---
mode: feat
title: shape 重写为 brainstorm-first 塑形协议
created: 2026-07-01
status: done
---

# shape 重写为 brainstorm-first 塑形协议

## Building

把 `shape` 从一份补丁式规则清单重写成一条清晰的塑形协议:先建立上下文,再真正 Clarify,再提出 2-3 个 approaches,围绕推荐方案逐枝 grill,展示 design summary 并取得确认,最后才进入 named mode 写 `plans/`。原 default mode 改名为 `brainstorm`;现有 `fix` / `feat` / `refactor` / `perf`、`plans/`、plan template 与 mode reference 体系保留。

## Not building

- 不新增独立 `brainstorm` skill。
- 不让 `brainstorm` 写 design/spec 文件;它只在对话中收敛方向。
- 不改 `implement` / `check` / `docs` / `explore` / `doctor` 的接口。
- 不在 `shape` 里重写 `explore` 的 Overview / Scoped Deep-dive 规则;上下文探索只调用既有 `explore` context preflight。
- 不新增 durable artifact;named mode 仍只写 `plans/YYYY-MM-DD-<slug>.md`。
- 不复制 Superpowers 的 visual companion、design doc commit、writing-plans chaining。
- 不在本次实现里清理 ROADMAP;落地后的 durable docs 更新交给后续 docs 阶段。

## Approach

以 `brainstorming` 的流程骨架作为 shape 的主流程,但按 squire 边界裁剪:保留 context grounding、逐问澄清、2-3 approaches、分段设计确认、自审;删去 visual companion、design doc 写入与自动调用下游 planning。融合 `grilling` 的三条短规则:沿设计树逐枝追问、每个问题给推荐答案、能从代码查到就先查代码。

文案风格尽量贴近两份参考的遣词和节奏,不是只借概念。主流程优先使用 `brainstorming` 的行动短语,如 "Explore project context" / "Ask clarifying questions" / "Propose 2-3 approaches" / "Present design";grill 规则优先保留 `grilling` 的短句力度,如 "Walk down each branch of the design tree" / "provide your recommended answer" / "explore the codebase instead"。需要替换的是 squire 不采用的产物和串联:design doc、commit、writing-plans 改为用户确认后的 named mode plan。

主文件瘦身为入口协议:说明 shape 的目标、硬门禁、六步流程、mode picker、何时读取 references。细节移入 `references/`:保留现有 mode 文件和 plan template,新增一个流程 reference 承载 clarify / approaches / grilling / design summary / self-review 的细节,避免 `SKILL.md` 继续长成难抓主线的 prose。

## Premise collapse

本方案假设 shape 的失败根因主要是主流程不够可执行:规则很多,但没有强制按 context -> clarify -> approaches -> grill -> summary gate -> plan 的顺序推进。若根因其实是 agent 会跳过任何 prose,那重写文本仍可能失效;届时需要额外机械层,例如 doctor/checker 对 plan 产物做结构审计或 forward-test 用例,但那不属于本次只重写 shape 的边界。

## Key decisions

1. **default mode 改名为 `brainstorm`** - 它本来就是会话内探索与塑形,命名应直接表达行为,不再以 "default" 这种空位描述。
2. **`brainstorm` 不写文件** - 文件产物仍归 named mode 的 `plans/`,避免新增 design/spec artifact 与 docs 边界重叠。
3. **允许 `brainstorm -> named mode` 同会话继续** - 但必须显式确认,不能暗中切 mode 写 plan。
4. **named mode 也先给 2-3 approaches** - 从 "默认一个推荐方案" 改为 "先展开可选设计,再收敛推荐",吸收 `brainstorming` 的替代方案压力测试。
5. **approaches 后 grill 推荐项,不是让用户投票** - grill 是推荐 approach 的 pressure-test gate,不是独立长访谈;先给推荐答案,再沿推荐方案的设计树逐枝追问,问题若能从代码或文档回答就先查。
6. **写 plan 前加 design summary gate** - 先展示目标、边界、关键设计、验证方式,用户确认后才写 `plans/`。
7. **主文件瘦身,细节进 references** - 符合 progressive disclosure,也减少继续 patching 到 `SKILL.md` 的诱因。

## Architecture

None. 本变更只重排 shape skill 的内部 prose 和 reference 结构,不引入新运行时层、服务、依赖或跨模块数据流。

## Public surface changes

- `shape` 的 visible mode 名称从 `(default)` 改为 `brainstorm`。
- `shape` 的 named mode 行为变化:写 plan 前必须先提出 2-3 approaches、grill 推荐项、展示 design summary 并取得确认。
- `shape` 的输出节奏变化:brainstorm 输出对话结论;named mode 输出仍是 `plans/YYYY-MM-DD-<slug>.md`。
- `shape` 的 frontmatter description / resolver-facing wording 需要同步提到 `brainstorm`。

## Spec delta

```markdown
## MODIFIED Requirements

### Requirement: 先澄清再出方案

shape 必须先建立足够上下文,再进入 Clarify:一次只问一个问题,问题必须服务于压实目标、约束、成功标准或阻塞歧义;若答案能从代码、文档或历史中查到,必须先查而不是问用户。达到"澄清够了"的门槛后,才进入 approaches 和 design summary;即便 mode 已清晰,仍要追问保留边界、风险和验证方式。
Verify: manual(integration)

### Requirement: brainstorm mode 不写方案文件

`brainstorm` mode 用于在对话中探索和收敛方向,必须不写 plan/design/spec 文件;它的完成产物是方向、约束、推荐 approach、待决问题和下一步是否进入 named mode。只有用户显式确认从 `brainstorm` 进入 `fix` / `feat` / `refactor` / `perf` 后,shape 才能写 `plans/` 文件。
Verify: manual(integration)

### Requirement: named mode 产出可执行方案文件

named mode 必须先提出 2-3 个 approaches,给出推荐项与理由,围绕推荐项逐枝追问关键设计决策,然后展示 design summary 并取得用户确认;确认后才把方案写入 `plans/YYYY-MM-DD-<slug>.md`。plan 每一步以「结果描述 + 触及范围(路径级)+ verify」表述,意图层完整、不留占位,不预写行级定位与最终措辞。
Verify: manual(integration)

## ADDED Requirements

### Requirement: 逐枝 grill 推荐方案

shape 在选出推荐 approach 后,必须沿推荐方案的设计树逐枝追问关键决策,每次只问一个问题,并给出自己的推荐答案和理由。问题如果能通过读取代码、文档、测试或历史回答,shape 必须先读取证据,不要把仓库已经能回答的问题转嫁给用户。
Verify: manual(integration)

### Requirement: plan 前 design summary gate

shape 在写 named mode plan 前,必须先展示按复杂度缩放的 design summary,覆盖目标、非目标、接口/边界、关键设计决策、错误/边缘处理、测试或验收方式。用户确认 summary 后才能写 plan;用户要求修改时,回到对应问题或 design section,不直接把未确认判断写入 plan。
Verify: manual(integration)
```

## Implementation steps

1. 重写 shape 主入口协议
   - outcome: `skills/shape/SKILL.md` 精简为目标、硬门禁、context grounding、六步流程、mode picker、reference routing 和停止条件;主文不再承载全部细节;流程动词和短句风格尽量贴近 `brainstorming` / `grilling`。
   - scope: `skills/shape/SKILL.md`
   - verify: 人读主文件能在 1 分钟内复述 shape 流程;`pnpm test` 通过。

2. 新增 shape 流程 reference
   - outcome: 新 reference 详细定义 Clarify、2-3 approaches、grilling、design summary gate、self-review,并吸收 `brainstorming` / `grilling` 中适合 squire 的规则;context grounding 只指向既有 `explore` context preflight,不复制 explore 的读取清单。
   - scope: `skills/shape/references/`
   - verify: `skills/shape/SKILL.md` 链接到新 reference;`pnpm test` 的 reference 检查通过。

3. 对齐 plan template 与 mode references
   - outcome: `plan-template.md` 的 `## Approach` 表达改为记录 2-3 approaches 和推荐项;`mode-fix` / `mode-feat` / `mode-refactor` / `mode-perf` 保留各自字段,只补它们如何参与 shared shaping protocol。
   - scope: `skills/shape/references/plan-template.md`, `skills/shape/references/mode-*.md`
   - verify: 模板不再说只有 tradeoff 接近时才列第二案;四个 mode reference 没有与新主流程冲突。

4. 更新 shape spec
   - outcome: `specs/shape/spec.md` 合并本 plan 的 Spec delta,把 default 改为 brainstorm,并记录 approaches / grill / design summary gate 的可观察行为。
   - scope: `specs/shape/spec.md`
   - verify: `pnpm test` 通过;手读 spec 与 SKILL.md 的流程一致。

5. 验证与人工自审
   - outcome: 所有结构检查通过,并用一次人工 dry run 检查该 skill 对"重写 shape"这类任务会先 Clarify,不会直接抛 plan。
   - scope: whole repo
   - verify: `pnpm test`;人工检查无占位、无 contradicting rule、无未确认判断直接进入 plan。

## Verification

- command: `pnpm test`
- checklist (manual):
  - [ ] `SKILL.md` 主流程清楚,不是补丁式规则堆叠
  - [ ] `brainstorm` 不写文件,只在对话中收敛
  - [ ] `brainstorm -> named mode` 需要显式确认
  - [ ] named mode 总是提出 2-3 approaches
  - [ ] 推荐 approach 经过逐枝 grill,每问有推荐答案
  - [ ] 能从代码/文档查到的问题没有转嫁给用户
  - [ ] 写 plan 前有 design summary gate
  - [ ] plan template 与四个 mode reference 不冲突

## Rollback

纯 skill/spec 文档变更,无外部状态。若重写后 shape 过重或行为倒退,`git revert` 对应 commit 即可恢复旧协议。若只需回退某个决策,优先回退 2-3 approaches 强制项或 design summary gate,不要局部追加补丁到主文件。

## Risks & Unknowns

- **2-3 approaches 对小修过重**:影响是简单 fix/refactor 变啰嗦。缓解:approach 可以很短,但仍要展开可选方向;summary 也按复杂度缩放。
- **grilling 变成审问用户**:影响是用户负担变大。缓解:每个问题必须给推荐答案,且能从代码查到的自己查。
- **主文件瘦身后 agent 不读 reference**:影响是流程细节丢失。缓解:SKILL.md 只在进入对应阶段时点名必读 reference,且 reference 一层直达。
- **Unknown**: 是否需要机械 forward-test 来验证 shape 真会执行新流程 - owner: 后续 check/doctor 议题, blocker: no。

## Interface boundary

- **Public API**: `/shape` 命令名不变;frontmatter `name` 不变;description 更新为含 `brainstorm`。
- **Inputs**: 用户的模糊想法、bug/refactor/perf/feat 意图、现有项目上下文。
- **Outputs**: `brainstorm` 输出对话结论;named mode 输出 `plans/YYYY-MM-DD-<slug>.md`。
- **Side effects**: shape 本身仍不写代码、不改实现;只有 named mode 写 plan 文件。
- **Not exposed**: 不新增 CLI flag、独立 design doc、visual companion、自动下游 skill 调用。

## Acceptance scenarios

- Given 用户说"我们准备重写 shape", when shape 开始, then 它先建立项目与参考材料上下文,再一次问一个 Clarify 问题,不直接写 plan。
- Given 用户在 `brainstorm` 中确认方向, when shape 判断可进入 `feat` mode, then 它显式请求确认,用户确认后才继续写 plan。
- Given shape 进入 named mode, when 提出方案, then 它展示 2-3 个 approaches、推荐其中一个并说明理由。
- Given 推荐 approach 还有关键设计分支, when shape 继续, then 它逐枝 grill,每次只问一个问题并给推荐答案。
- Given 某个 grill 问题能通过仓库文件回答, when shape 准备提问, then 它先读取相关代码/文档/历史,不把该问题抛给用户。
- Given design summary 尚未被用户确认, when shape 准备写 plan, then 它停下请求确认,不把未确认判断写进 `plans/`。
- Given 用户确认 design summary, when shape 写 plan, then plan 按 template 产出,步骤为 outcome + scope + verify,无意图占位。
