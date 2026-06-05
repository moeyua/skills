# Handoff — persist 记忆格式规范(待跟维护者过格式)

> 给下一个 session 的交接。上一 session context 耗尽,核心欠账:**format 的 section 结构是 AI 擅自定的,从没问过维护者**——必须补这一步。

## 当前 git 状态

- 分支:`feat-memory-format-specs`,commit `76b6cdf`(`feat(persist): 记忆格式规范 — 按文档拆分、按需加载`)。
- **未 push、无 PR**。
- `main` 上已有(本轮早先合并/直推的):记忆支柱重构(PR #3 已 merge,`406e02a`)、verify 多 mode 并行(`d810667`)。
- ⚠️ **环境会在技能调用间自动 `checkout main` + `pull`**——动手前先 `git branch --show-current`,别在 main 上提交(上一 session 因此误直推过 main 一次)。见 memory `recheck-git-branch-before-commit`。

## 这一 session 落了什么

squire 重构成 **6 支柱**:理解 explore / 设计 shape / 改造 build(含写测试)/ 校验 verify(review·test·e2e)/ 记忆 persist / 交付 commit·propose。`spec→persist`、`review+test→verify`、`test` 解散,均已在 main。

本分支(76b6cdf)在此之上,给 persist 补「格式规范」:

- `skills/persist/references/formats/*.md` —— 6 份,每 artifact 一份(behavior/architecture/design/workflow/roadmap/readme),按需加载。
- `rules/memory-catalog.md` 瘦成索引 + `Format:` 指针。
- persist SKILL「读索引 → 按需加载 format → 照 Sections/Source/Boundary 写」。
- `checkMemoryCatalog`(scripts/checks.ts):catalog 指针 ↔ formats 文件双向同步。
- `pnpm test` 60 passed、typecheck 干净。

## 欠账(下个 session 的活)

**format 的 section 结构没经维护者确认。** 这整条线起因正是维护者指出 persist「全靠 AI 发挥」;结果修它时 AI 又自己把 6 份 format 的 section 拍了,skip 了 clarify。维护者已点名要补。

**要做的**:跟维护者**逐份过格式**,按其意图重订 `skills/persist/references/formats/*.md` 的 section 结构,再重新 commit。维护者给过三种走法(逐份过 / 直接点要改的 / 给原则统一重订),让他选。

**我(AI)擅自定的 section,作为讨论起点(全部可推翻)**:

| 文档           | 现有 Sections                                 | 备注                                                                                                   |
| -------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `behavior`     | Domain / Purpose / Requirements + Verify      | 从旧 spec(`git show d588f85:skills/spec/SKILL.md` 的 `## Spec format`)**恢复**,非新造,但维护者同样可改 |
| `architecture` | 目录结构 / 技术栈选型 / 数据流 / 关键决策记录 | AI 拍的                                                                                                |
| `design`       | 界面结构 / 交互流程 / 视觉规范                | AI 拍的                                                                                                |
| `workflow`     | 流程阶段 / 各阶段约定 / 工具与命令            | AI 拍的                                                                                                |
| `roadmap`      | 按主题分组平铺「X — 因为 Y」(record-only)     | AI 拍的                                                                                                |
| `readme`       | 一句话定位 / 上手 / 用法 / 链接               | AI 拍的                                                                                                |

每份 format 文件的结构契约是「Sections / Source / Boundary」三块——改 section 时维持这三块骨架。

## 收尾路径

格式跟维护者敲定、format 文件重订后:`/verify` → `/commit`(改 76b6cdf 之上加一个 commit,别 amend)→ `/propose` 开 PR(base main)。

## 相关文件

- 本分支 plan:`plans/2026-06-04-feat-memory-format-specs.md`(status: done)
- 上一大重构 plan:`plans/2026-06-04-feat-memory-pillar.md`
- 格式规范:`skills/persist/references/formats/`
- 索引:`rules/memory-catalog.md`
- 检查:`scripts/checks.ts` 的 `checkMemoryCatalog`
