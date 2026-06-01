---
mode: feat
title: SKILL.md 转干净英文 + 双语触发词 + 可加载的输出风格规则
created: 2026-05-29
status: done
---

# Clean Language System

## Building

一套让 praxis 产出不再"看着累"的语言系统，三件事一起做：

1. **7 个 SKILL.md + think 的 references/ + RESOLVER.md 的正文改写成干净英文**。病根是现状"中文 prose + 满地英文词"的脏混写——模型读什么腔调就用什么腔调回话，所以输出全是"偏离 surface""修法 B"这种噪音。Waza（同为中文作者、面向分发）的 SKILL.md 正文就是干净英文、中文只留触发词，praxis 当初抄反了，这次抄正。
2. **触发词双语化 + 讲究化**。`description` 和 `when_to_use` 同时给中英文自然线索；删掉 implement 现有的「整/可以干/直接改」这类低信号 slang，换成自然有辨识度的词。
3. **新增一条语言无关的输出风格规则 `rules/output-style.md`，并补上让它真正被加载的机制**。已核实 praxis 的 `rules/` 在 v1 完全不加载（不是 Claude Code 概念、`npx skills add` 不装它、SKILL.md 里仅 3 处 inline-code 文字提及、`durable-context.md` 零引用）。补一个 `setup-rule.sh`，把规则装进 agent 真正会读的位置，顺带救活 `anti-patterns.md` 和 `durable-context.md` 两个死文件。

## Not building

- **不改输出语言**：输出用什么语言由 host 的全局 CLAUDE.md 决定（用户已设中文），praxis 不碰。新规则只管"风格"不管"语言"。
- **不改 PRODUCT.md / README.md 的语言**：面向人的文档继续中文。（ARCHITECTURE.md 是例外，见 Key decisions #5——因为这次新增的加载机制让它现有描述变成错的，必须同步改。）
- **不改 skill 的能力、流程、停下条件**：只改表达和触发词，每个 skill 该做什么、什么时候停、避免哪些坑全部保留。
- **不引入 eval framework**：模型行为验收仍是 vibe-driven（用户实跑），沿用上次 prose-style refactor 的三层保护网。
- **不动版本号 / 不发布 / 不动已安装的 symlink**。

## Approach

**先做 implement 当英文风格 + 触发词锚点**，改完停下让用户确认两件事：英文 prose 的风格方向、以及触发词的"讲究"程度够不够。确认后再套其余 6 个 skill。最后单独做加载机制（feat 部分）。

为什么选 implement 当锚点：它现状触发词最差（整/可以干/直接改），最能检验"触发词讲究化"的标准；也是上次 refactor 的锚点，用户最熟，判断风格方向最快。

为什么加载机制放最后：它碰安装层和 `checks.ts`，跟语言改写正交；语言改写能独立 ship，不该被它拖住。

为什么不先写英文 style guide 再套：从实例归纳风格比纸上谈兵可信，跟上次 refactor 同理由。

## Premise collapse

**这个 plan 假设：干净英文的 SKILL.md，配合 host"用中文回答"的设置，产出的中文比现在的混写源更干净。**

如果不成立——英文源反而让模型把更多英文词直接搬进中文输出（transliterate 而非 translate），那整个"改英文"的理由就垮了，等于白改还可能更糟。

这个假设是 load-bearing 的。应对：把它做成**锚点步骤就能验**——Step 1 把 implement 改完后，用户实际跑一次 `/implement`，直接看产出的中文是变干净了还是更脏。变脏就停，回头重新考虑"干净中文 SKILL.md"那条路（英文只留标识符）。在只改了 1 个 skill 时就证伪，而不是 7 个全改完才发现。

## Key decisions

1. **SKILL.md 正文英文，中文只留触发词和示例用户原话** — 对齐 Waza 的成熟做法；中文触发词是功能性的（用户用中文打字，路由需要中文线索），不是风格噪音。
2. **加载机制用核实过的可靠路子，不照抄 Waza 的半成品** — Waza 给 Claude Code 只把文件丢进 `~/.claude/rules/`，但官方文档证实用户级 `~/.claude/rules/` 不是全局 always-on（按 `paths` frontmatter 条件加载）。唯一可靠的全局常驻是在 `~/.claude/CLAUDE.md` 写 `@import`。所以 `setup-rule.sh` 对 Claude Code 要同时做两件事：拷文件 + 往 CLAUDE.md 幂等插入 `@import` 块。Codex 沿用 Waza 的 AGENTS.md 标记块（那条是确认能用的）。
3. **RESOLVER.md 纳入范围** — 它在 `skills/` 里、是路由层、被 `checkResolverConsistency` 校验。留中文会跟 7 个英文 SKILL.md 割裂，所以一起转英文 prose + 双语触发词。
4. **风格规则一处真源；SKILL.md 暂不加指针（Step 1 实测修正）** — `rules/output-style.md` 是完整源文件（供 `setup-rule.sh` 安装、未来 codegen）。原计划在每个 SKILL.md 加一句指向它的短指针，但 Step 1 实测发现：rules/ 在 Step 9 加载机制建好前根本不加载，指针指向一个安装位置不存在的文件，是悬空且误导的引用。所以**改为：SKILL.md 里先不加指针，风格靠"SKILL.md 自己写干净"示范（lead by example）；等 Step 9 让规则可加载后，再把链接加回去**。
5. **ARCHITECTURE.md 必须同步改（对"文档不在范围"的显式例外）** — 现 line 100 称 rules/ 是"agent 不管在做什么都遵守"，这是错的（现状根本不加载）；line 131 称"scripts/ 下只有库代码，没有可执行 CLI"，但本 plan 要加 `setup-rule.sh`。两处描述会被这次改动证伪，不改 ARCHITECTURE 就主动留了错。按 PRODUCT.md"接近边界要 ack"的要求，这里显式声明例外：改 ARCHITECTURE 的相关段落（保持中文），仅限被本次改动影响的事实。
6. **触发词双语集逐 skill 设计，用 `pnpm test` 验 Jaccard** — 见下方 Acceptance scenarios 的提案集；不是 TBD，是带验证 gate 的具体提案。

## Public surface changes

- **frontmatter `description` / `when_to_use`**：7 个 skill 全部改写——正文英文化、触发词双语化。结构（含 "Use when" + "Not for"、长度 40-500）保留。
- **`name` / `dispatch_intent`**：`name` 不变（跟目录名锁定）；`dispatch_intent` 改英文。
- **新增文件**：`rules/output-style.md`、`scripts/setup-rule.sh`。
- **新增 check**：`scripts/checks.ts` 加规则完整性检查（见 Step 9）。
- **`~/.claude/CLAUDE.md` / `~/.codex/AGENTS.md`**：仅在用户主动跑 `setup-rule.sh` 时被改（幂等块），不是仓库改动。

## Interface boundary（feat：setup-rule.sh）

**命令**：`bash scripts/setup-rule.sh <rule> <agent>`

- **Inputs**：`<rule>` ∈ {output-style, anti-patterns, durable-context}；`<agent>` ∈ {claude-code, codex}。其余值报错退出。
- **Effect（claude-code）**：`mkdir -p ~/.claude/rules` → 拷 `rules/<rule>.md` 到 `~/.claude/rules/<rule>.md` → 在 `~/.claude/CLAUDE.md` 用 `<!-- praxis <rule>: start -->` / `end` 标记幂等插入一行 `@~/.claude/rules/<rule>.md`。
- **Effect（codex）**：`mkdir -p ~/.codex` → 在 `~/.codex/AGENTS.md` 用同样标记把规则**内容**幂等插入（Codex 不支持 @import，直接嵌内容）。
- **Idempotent**：重跑替换标记块内内容，不产生重复。
- **Not exposed**：不碰任何项目文件、不安装 skill（那是 `npx skills add`）、不改仓库文件。

## Acceptance scenarios

每条 reviewer 可逐项验证。

**语言改写（每个 SKILL.md）**：

- Given 改写后的 SKILL.md，then 正文无中文 prose（中文仅出现在 `description`/`when_to_use` 的触发词、示例用户原话），且原"避免的坑"逐条仍能在英文版找到（措辞/语言可变）。
- Given `pnpm test`，then 全 8 个 check green（frontmatter / description 规范 / Outcome Contract / references / links / no-root-skill / Jaccard / RESOLVER）。

**触发词（提案集，最终以 Jaccard green 为准）**：

- explore: `explore, understand, codebase, project structure, entry point, how to run, 看项目, 项目结构, 入口, 怎么跑, 整体了解, 不熟悉的模块`
- think: `think, plan, design, brainstorm, approach, 想想, 出方案, 设计, 怎么做, 头脑风暴`
- implement: `implement, build, write code, apply the plan, 实现, 落实, 写代码, 按方案做, 开始动手`（删 整/可以干/直接改）
- test: `test, run tests, add tests, regression, coverage, flaky, failing test, 跑测试, 补测试, 回归, 覆盖率, 测试挂了`
- review: `review, code review, pre-merge check, 评审, 把关, 合并前检查, 看变更`
- commit: `commit, stage changes, commit message, 提交, 入库, 整理变更, 拆提交`
- push: `push, open PR, pull request, merge request, 推送, 开 PR, 提评审`
- Given 以上集，then 任意两 skill 的 `when_to_use` Jaccard < 0.5（`checkTriggerJaccard` 验）。撞了就调，调到 green。

**加载机制**：

- Given 干净环境跑 `setup-rule.sh output-style claude-code`，then `~/.claude/rules/output-style.md` 存在 且 `~/.claude/CLAUDE.md` 含标记块 + `@import` 行。
- Given 再跑一次同命令，then CLAUDE.md 无重复块（幂等）。
- Given `setup-rule.sh output-style codex`，then `~/.codex/AGENTS.md` 含标记块 + 规则内容。
- Given 错误参数（未知 rule 或 agent），then 非零退出 + 用法提示。

## Refactor invariants（refactor 部分：改写不能丢的东西）

每条是 reviewer 可验证的断言：

- 每个 skill 的能力不变：explore 仍探索、think 仍出方案、implement 仍按 plan 执行……
- 每个 SKILL.md 的"什么情况下停下来"列表的每条坑，英文版逐条可对应。
- 每个 Outcome Contract 的 4 字段（Outcome/Done when/Evidence/Output）保留。
- think 的 references/ 五个文件的产出契约（plan-template 骨架、fix 的 Root cause 句式、perf 的 Baseline 字段等）信息密度保留——只改语言，不删字段。

**明确允许变（不是 invariant，是有意改动）**：

- prose 语言 → 英文；触发词集 → 双语精选（所以 Jaccard 要重验，不是保留旧集）；行数。

## Implementation steps

每步独立 ship、单独 commit、不依赖未写的下一步。

### Step 1: 写 `rules/output-style.md` + 改写 implement（锚点）

- 改动：新建 `rules/output-style.md`（英文，语言无关的风格原则：单语写干净、外语词只留真标识符、逻辑线性摊平、避免 AI 腔脚手架）；改写 `skills/implement/SKILL.md`（正文英文、触发词双语精选、删 slang、加 output-style 指针）。
- verify：
  - `pnpm test` → green
  - `git diff` 对照原 implement 的工程约束 8 条 + 停下条件 7 条，逐条确认坑还在
  - **停下，让用户实跑 `/implement` 验 premise collapse**：产出中文是否变干净。变脏则停，回 think 重议方向。未确认不进 Step 2。

### Step 2-7: 改写其余 6 个 SKILL.md

- 每步一个文件：think（连同 references/ 五个一起改英文）、test、review、explore、commit、push。
- 套 Step 1 确认的英文风格 + 触发词标准。
- verify：每步 `pnpm test` green + 对照原"避免的坑"逐条确认保留。

### Step 8: 改写 RESOLVER.md

- 改动：`skills/RESOLVER.md` 转英文 prose + 双语触发词，跟 7 个 SKILL.md 的新触发词对齐。
- verify：`pnpm test` green（`checkResolverConsistency` 仍列全 7 skill、无 stale）。

### Step 9: 建加载机制

- 改动：新建 `scripts/setup-rule.sh`（按 Interface boundary 实现，含幂等标记、错误参数处理）；把 `rules/anti-patterns.md`、`rules/durable-context.md` 也补成可被它安装（必要时补 frontmatter / 整理为可独立加载）。
- verify：跑 Acceptance scenarios 的"加载机制"四条；手动检查 `~/.claude/CLAUDE.md` 幂等。

### Step 10: checks.ts 加规则完整性检查

- 改动：`scripts/checks.ts` 加一个 check——`setup-rule.sh` 引用的每个 `rules/<rule>.md` 真实存在；在 `tests/smoke/verify-skills.test.ts` 加对应 `it()`。`tests/checks.test.ts` 加单元测试（tmpdir fixture）。
- verify：`pnpm test` green，新 check 在故意删一个 rule 文件时会 fail（红线有效）。

### Step 11: 改 ARCHITECTURE.md + 收尾

- 改动：`ARCHITECTURE.md`（中文）改 line 100 附近的 rules/ "always-on" 描述为"经 setup-rule.sh 安装后才加载"，改 line 131 附近"scripts/ 无可执行 CLI"以反映 `setup-rule.sh`；目录树补两个新文件。
- 7 个 SKILL.md + RESOLVER 并列读一遍，确认英文风格一致。
- 最后一次 `pnpm test`。

## Verification

命令：

```bash
pnpm test                                  # 8 个 smoke check + 新增的 rule 完整性 check 全 green
git diff --stat main..HEAD                 # 改动总览
git log --oneline main..HEAD               # 每个 SKILL.md / 机制各自 commit
bash scripts/setup-rule.sh output-style claude-code   # 跑两遍验幂等
grep -c "@.*output-style" ~/.claude/CLAUDE.md          # 应为 1（不重复）
```

检查清单（手工）：

- [ ] 7 个 SKILL.md + references + RESOLVER 正文无中文 prose
- [ ] 触发词双语、无 整/可以干/直接改 这类 slang
- [ ] `pnpm test` 一次过
- [ ] 抽 3 个 skill 对照原"避免的坑"逐条确认保留
- [ ] `setup-rule.sh` 两遍幂等、错误参数报错
- [ ] 用户实跑 1-2 个 skill，中文输出确实变干净（premise 成立）

## Rollback

- 每步独立 commit：`git revert <sha>` 或 `git checkout HEAD~ -- <file>` 单点回退。
- **外部状态**：`setup-rule.sh` 改了 `~/.claude/CLAUDE.md` / `~/.codex/AGENTS.md`——回退靠删除对应的 `<!-- praxis <rule>: start/end -->` 标记块（脚本应提供 `--remove`，或文档说明手动删）。仓库 revert 不会自动清理已安装的用户配置，需手动。
- 整体回退：`git reset --hard <plan-开始前-sha>`。

## Risks & Unknowns

- **Risk: premise collapse（英文源反让输出更脏）** — 影响：整个改英文方向失效。Mitigation：Step 1 锚点实跑就证伪，只赔 1 个 skill 的返工。
- **Risk: 模型行为漂移** — 结构 check 过但实际触发后行为变差。Mitigation：每步单 commit + 用户实跑；沿用上次 refactor 的人眼对照。无自动 eval（项目无 framework，用户接受）。
- **Risk: 双语触发词撞 Jaccard** — 英文通用词（plan/build/test）可能跨 skill 撞。Mitigation：提案集已尽量用各 skill 专属域词；`pnpm test` 当 gate，撞了调。
- **Risk: setup-rule.sh 改 CLAUDE.md 误伤用户已有内容** — Mitigation：只在自己的标记块内操作，块外内容不碰；先实现 codex 路径（追加，更安全）再做 claude-code 路径。
- **Known limitation: 裸调用回英文（Step 1 实测）** — 单独 `/explore` 这种不带任何用户文字的裸调用，这一轮没有中文锚，模型会跟着英文 skill body 输出英文；带任何一句中文（`/explore 看看`）就正常回中文。可移植的指令无法纯靠 SKILL.md 修这个边角（不能硬编码某语言）。留给 Step 9 的 always-on 规则缓解，不一定能完全修。用户已接受"大部分情况语言正确"。语言护栏经实测是噪音，已不加。
- **Unknown: output-style 规则要不要像 Waza 拆 per-language 示例** — Waza 的 chinese.md 用中文例子举 AI 腔。owner: agent 在 Step 1 写规则时判断（v1 倾向单文件 + 语言无关原则 + 少量示例）。blocker: no。
