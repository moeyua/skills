---
mode: refactor
title: 把 7 个 SKILL.md 从命令式硬约束改成对话式 why-driven 风格
created: 2026-05-28
status: approved
---

# Refactor: SKILL.md prose style

## Building

把 praxis 7 个 SKILL.md（explore / think / implement / test / review / commit / push）从当前的"命令式硬约束 + 长 Gotchas 表 + 多层 Phase 嵌套"风格，改成对话式、解释 why、信任模型 judgment 的写法。**触发能力、约束内容（避免哪些坑）全部保留**，改的只是表达方式。

参考骨架来自 anthropic 官方 `feature-dev` plugin（每 phase 一句 Goal + 编号 Actions + 显式约束直接顶在流程里），以及 `skill-creator` 反复强调的 "Today's LLMs are smart, explain why, lean prompt, avoid heavy-handed MUST"。

## Not building

- 不改 frontmatter 4 字段语义（name / description / when_to_use / dispatch_intent）
- 不改每个 skill 的核心 capability、触发逻辑、用户接口
- 不删 Hard Stops / Gotchas 的**内容**（即避免的坑）——用户选 B：保留内容、允许换措辞和位置
- 不引入新工程依赖（不加 eval framework / skill-test / scripts/）
- 不改 RESOLVER.md / rules/ / ARCHITECTURE.md
- 不动 think 的 references/（mode-*.md 和 plan-template.md 不在本 plan）
- 不补 examples 文件夹、不补 scripts/——除非某个 SKILL 主体能因为抽离而显著瘦身
- 不做模型行为 eval（with-skill vs baseline）——用户明确 vibe-driven 验收

## Approach

**先做一个 implement 当 style 锚点**，改完停下让用户确认 style 方向，再套其余 6 个。

为什么选 implement 当锚点：
- 当前最臃肿（140 行 + 8 Hard Stops + 10 Gotchas）
- 改完瘦身效果最明显，用户最容易判断 style 方向
- 是用户最常用的 skill 之一，重写质量收益最大

为什么不先写一份 style guide 再套：纸上谈兵风险高；从实例归纳 style 比反过来可信。

为什么不 7 个一气呵成：第一个写不好后面全白做；早停 gate 控制返工成本。

## Premise collapse

**这个 plan 假设 implement 重写后的 style 能合理迁移到另外 6 个 SKILL.md。**

如果不成立——其他 SKILL.md 的语义结构差异太大（test 有 3 类分流、commit 已经短到 72 行、review 有 5 维度表、explore 有 Phase 划分）——implement 的 style 在它们上面别扭，需要每个独立判断 style，或者需要分类（multi-mode skill / 单流程 skill）走不同 style。

应对：Step 1 完成后**强制停顿**让用户审 style；Step 2 开始前明确"是直接套 implement 的 style 还是调整"。**不允许 implement 一改完就自动连刷其余 6 个**。

## Key decisions

1. **Style 由 implement 实例定义，不写独立 style guide** — 文档很容易脱离实际；让实例先稳，必要时回头抽提 style 备忘到 ARCHITECTURE.md。
2. **保留 Outcome Contract 4 字段** — 这是 `checks.ts:checkOutcomeContract` 强制项；删了 `pnpm test` 直接挂。语气可以变。
3. **保留 frontmatter 4 字段全部** — `checks.ts` 强制 name / description；description 强制含 "Use when" + "Not for"。可以重写描述措辞，但不能动结构。
4. **Hard Stops / Gotchas 内容保留，措辞和位置可变** — 用户选 B。允许从独立段落融进主流程（参考 feature-dev "DO NOT START WITHOUT USER APPROVAL" 直接顶在 Phase 5 开头），但不允许"扔掉"。
5. **每个 SKILL.md 改完单独 commit** — 7 个 commit，便于单步 rollback；不打包提交。
6. **不引入 examples / scripts 子目录** — 当前 7 个 SKILL.md 都没用到 references 之外的 bundled resources（除 think 的 mode references）；保持 v1 简单。

## Public surface changes

- frontmatter 字段：不变
- description 措辞：可能调整，但 "Use when X / Not for Y" 结构保留
- when_to_use 关键词：触发词集合不增不减（保持 Jaccard 不撞车）
- Outcome Contract 4 字段：不变
- 跟其他文档的链接（RESOLVER.md / rules/ / references/ 等）：可能调整描述但路径不变

## Behavior invariants

这次 refactor 保证不变的行为列表：

- 每个 SKILL.md 的 frontmatter `name` 跟目录名一致（`checks.ts:checkSkillFiles`）
- 每个 description 含 "Use when" + "Not for"，长度 40-500（`checkDescriptionConformance`）
- 每个 SKILL.md 含 `## Outcome Contract` 段 + 4 个字段（Outcome / Done when / Evidence / Output）（`checkOutcomeContract`）
- 所有 `references/X.md` / `agents/X.md` / `scripts/X.ext` 引用在文件系统真实存在（`checkReferencesExist`）
- 所有相对 markdown link 解析成功（`checkMarkdownLinks`）
- 无根目录 SKILL.md（`checkNoRootSkill`）
- 任意两个 skill 的 when_to_use 关键词 Jaccard < 0.5（`checkTriggerJaccard`）
- RESOLVER.md 列出全部 7 个 skill 且无 stale 引用（`checkResolverConsistency`）

**内容层 invariants**（人眼检查）：

- 每条原 Hard Stop 的"避免的坑"在重写后仍能被找到（措辞和位置可变）
- 每条原 Gotcha 的"避免的坑"在重写后仍能被找到（措辞和位置可变）
- 每个 skill 的核心流程步骤覆盖范围不减少（哪些事必做、什么时候停）

**允许变化**：

- 散文 vs 表格的比例
- Phase / Step 的层级嵌套深度
- "硬约束 / 永远不 / 必须" 等命令式措辞被对话式 + why 解释取代
- 单 SKILL.md 总行数（预期减少）
- Gotchas 表是否单独存在（允许融进流程主体）

## Regression coverage

三层保护网：

1. **既有自动测试**（最强保护）：`pnpm test` 跑全套 smoke。8 个 check 函数覆盖所有结构性 invariants（frontmatter / Outcome Contract / references / links / Jaccard / RESOLVER / no-root-skill / description 规范）。每个 step 完成必须 `pnpm test` 通过。

2. **手工 spot check**（每 step 必做）：
   - `git diff HEAD~1 -- skills/<name>/SKILL.md` 看改动
   - 对照原 Hard Stops 和 Gotchas 列表，逐条 grep 新 SKILL.md 确认每条避免的坑还在（可能换措辞）
   - 行数对比：新版应明显短于旧版（implement 140 行 → 预期 70-90 行；其他类比）

3. **用户实际 trial**（最终验证）：
   - Step 1 后停顿，用户自己用 `/implement` 实际跑一次，看模型行为是否仍受约束
   - 其他 SKILL.md 改完后用户在真实工作流里用一次
   - 发现模型行为漂移 → 直接 git revert 该 step 的 commit，回 think 调整

模型行为本身没有自动测试（praxis 当前没有 eval framework，用户明确不引入）。这是这次 refactor 的最大风险，但用户接受。

## Implementation steps

每个 step 独立 ship，单独 commit。每步之间不依赖。

### Step 1: 重写 `skills/implement/SKILL.md`（style 锚点）

- 改动：`skills/implement/SKILL.md`（仅这一个文件）
- 目标行数：70-90 行（当前 140）
- 风格要点：
  - 主体用对话式，每个核心规则补"为什么"
  - "前置检查"和"标准流程"用编号 Actions + 一句 Goal
  - Hard Stops 不再独立段——把最关键的（如 "plan status 必须 approved"、"工作树脏不能开始"）顶在前置检查里，用文字解释；剩下的融进对应 step
  - Gotchas 不再独立表——把每条避免的坑融进相关流程段；"why" 写清楚
  - 保留 TDD 适用矩阵（这是有信息密度的表，去掉反而失真）
  - 保留 Outcome Contract 4 字段
- verify：
  - `pnpm test` → 全 green
  - `git diff HEAD~1 -- skills/implement/SKILL.md` 对照原 Hard Stops 8 条 + Gotchas 10 条，逐条 grep 新版确认每条避免的坑都还在
  - 给用户看 diff，**停下等用户确认 style 方向**，未确认前不进 Step 2

### Step 2: 重写 `skills/think/SKILL.md`

- 改动：`skills/think/SKILL.md`（references/ 不动）
- 目标行数：80-100（当前 131）
- 套 Step 1 确认的 style；Phase 1-5 结构保留但每段说人话 + why
- references 指针保留（mode-*.md / plan-template.md）
- verify：`pnpm test` green + Gotchas / red flags 11 条内容点全保留

### Step 3: 重写 `skills/review/SKILL.md`

- 改动：`skills/review/SKILL.md`
- 目标行数：80-100（当前 145）
- 套 style；5 维度表保留（这是有信息密度的）；Aspect Filter 段简化；Confidence 分级配合 feature-dev 风格补一句"什么样的发现算这一档"（可选改进）
- "严格只看不动" 6 条不再独立段，融进 review 的整体语气
- verify：`pnpm test` green + Hard Stops 4 条 + Gotchas 10 条内容点保留

### Step 4: 重写 `skills/test/SKILL.md`

- 改动：`skills/test/SKILL.md`
- 目标行数：90-110（当前 159，最长之一）
- 套 style；三类工作场景表保留；三个流程（跑/补/调试）用 Goal + Actions
- 工程约束 8 条融进流程；Hard Stops 5 条 + Gotchas 10 条内容融进相关段
- 三个 "完成后输出" 模板：考虑合并模板共性，或保留（视新版结构而定）
- verify：`pnpm test` green + 所有避免的坑内容保留

### Step 5: 重写 `skills/explore/SKILL.md`

- 改动：`skills/explore/SKILL.md`
- 目标行数：80-100（当前 156）
- 套 style；Overview Phase / Scoped Deep-dive Phase 保留；v1 起步文档清单可以拆 references/，或保留在主体（视新版总长决定）
- 输出模板保留（这是产出契约，agent 需要照着填）
- Gotchas 7 条融进流程
- verify：`pnpm test` green + 内容点保留

### Step 6: 重写 `skills/commit/SKILL.md`

- 改动：`skills/commit/SKILL.md`
- 目标行数：50-70（当前 72，已较短）
- 套 style；主要是把 Hard Stops 5 条 + Gotchas 7 条融进流程，补 why
- 行数可能不显著减少（commit 已 trim 过），重点是语气和 why
- verify：`pnpm test` green + 内容点保留

### Step 7: 重写 `skills/push/SKILL.md`

- 改动：`skills/push/SKILL.md`
- 目标行数：60-80（当前 91）
- 套 style；流程 + PR 描述模板保留；Hard Stops 6 条 + Gotchas 8 条融进流程
- verify：`pnpm test` green + 内容点保留

### Step 8: 交叉对照 + 收尾

- 7 个 SKILL.md 全部并列读一遍，确认 style 一致（语气 / 段落结构 / Goal+Actions 的应用一致）
- 如果发现某个 SKILL.md 跟其他 6 个明显不和谐 → 标出来回头微调
- 跑最后一次 `pnpm test` 确认整体绿
- 如果某个 skill 的"避免的坑"信息密度太大值得抽离 → 创建 `references/`（按 think 已有模式），但这是兜底，不主动创建

## Verification

整体验收。

命令：

```bash
pnpm test                                                  # 所有 8 个 smoke check 通过
git diff --stat main..HEAD                                 # 改动总览，仅 7 个 SKILL.md 文件
git log --oneline main..HEAD                               # 7 个 commit
wc -l skills/*/SKILL.md                                    # 行数对比
```

检查清单（手工）：

- [ ] 7 个 SKILL.md 全部完成重写
- [ ] `pnpm test` 一次通过（不需要 retry）
- [ ] 每个 SKILL.md 行数低于改前
- [ ] 抽样 3 个 SKILL.md，对照原 Hard Stops / Gotchas 逐条确认每条避免的坑都还在
- [ ] 抽样用 1-2 个 skill 在实际工作流跑一次，模型行为没漂移（不绕过约束、不忘记关键步骤）
- [ ] 7 个 commit，每个对应一个 SKILL.md，便于单步 rollback

## Rollback

每个 step 独立 commit，所以：

- **单步回退**：`git revert <commit-sha>` 或 `git checkout HEAD~ -- skills/<name>/SKILL.md`
- **整体回退**：`git reset --hard <plan-开始前的-sha>`
- **部分接受**：保留你觉得 OK 的 SKILL.md commit，revert 不满意的

外部状态零变化（不动 npm publish / 不动 .claude/skills/ 已安装版本 / 不动远端）。本地 symlink 安装的会自动跟上改动；想保险也可重新 `npx skills add .`。

## Risks & Unknowns

- **Risk: 模型行为漂移**：改完结构 check 全过，但实际触发 skill 后模型行为变差（漏关键步骤、绕过约束）。Mitigation：Step 1 后强制用户实测；每个 step 单独 commit，发现问题可单点回退。
- **Risk: style 不能跨 skill 迁移**：Step 1 改 implement 写的 style 套到 think / test / review 时别扭。Mitigation：premise collapse 已显式 ack；Step 2 开始前重新审 style 适配性。
- **Risk: "保留 Hard Stops / Gotchas 内容"判定主观**：什么算"避免的坑还在"？比如原来一条 "永远不删既有测试让代码通过"，新版融进"测试 fail 是信号，不删测试不 skip 测试"——这算保留还是稀释？Mitigation：人眼审，含糊就用户裁定；不引入自动 grep 校验（太脆弱）。
- **Unknown: commit 已经 72 行，是否需要重写**：可能只换语气不显著瘦身。owner: agent 在 Step 6 判断，blocker: no。
- **Unknown: test 的 3 个"完成后输出"模板是否合并**：视 Step 4 新结构而定。owner: agent 在 Step 4 判断，blocker: no。
- **Unknown: explore 的 v1 起步文档清单要不要拆 references/**：视 Step 5 新结构总长而定。owner: agent 在 Step 5 判断，blocker: no。
