---
mode: refactor
title: rules 改为单一真源 + symlink 进所有 skill 的 references，随 skills add 安装；撤掉 setup-rule
created: 2026-05-29
status: done
---

# Rules as symlinked references

## Building

把 praxis 的跨 skill 规则改成"**单一真源 + symlink + 加载一次**"的交付方式，让规则跟着 `npx skills add` 一条命令装到所有 agent，并撤掉上一个 plan 建的 `setup-rule` 那套独立安装机制（已被证明既满足不了"一键 + 多 agent"、又是半成品）。

具体形态：

- `rules/anti-patterns.md`、`rules/durable-context.md` 是**唯一真源**（改写成英文，跟 SKILL.md 一致）。
- 这两个文件**symlink 进每个 skill 的 `references/`**。已实测：`skills add` 跟随 skill 目录内的 symlink、把内容解析成真文件拷进安装产物（含多 agent 的 `~/.agents` 共享 store + 外层 symlink 布局，透过外层读正常、删源仓库后仍自包含）。
- 每个 SKILL.md 加一段统一的**短指针 + 加载一次**指令：这两条规则适用于所有 praxis 工作；本会话若还没读过就读一次，读过就别重读。第一个触发的 skill 加载，整会话共享、不随 skill 数翻倍。

## Not building

- 不改任何 skill 的能力、流程、触发词、Outcome Contract、frontmatter——只改"规则怎么送达 agent"。
- 不重新安装/刷新用户已装的 skills（那是用户跑 `npx skills add` 的事，不在本 plan）。
- 不引入 codegen / 不引入新依赖。
- 不动 PRODUCT.md / README.md。ARCHITECTURE.md 是显式例外（见 Key decisions #5）。

## Approach

先拆旧机制（删 setup-rule + output-style，纯减法、低风险），再立新机制（rules 改英文 + symlink 进各 skill + 统一指针），最后改文档 + 实测验收。每步独立 ship、`pnpm test` 全绿。

为什么这个顺序：删除是纯减法，先删干净再立新的，避免新旧机制并存时互相干扰；symlink 机制已端到端验过，立的时候风险主要在"把内容点全、指针写对"。

## Premise collapse

**这个 plan 的 load-bearing 假设不再是 symlink 机制（那个已实测验过），而是"加载一次"这条指令能被 agent 可靠执行。**

如果不成立——agent 看到指针却不去 `Read` 那个 reference，规则就是空的、guard 不生效（尤其 anti-patterns 这条从"inline 必在场"降级成"被指令加载"）。

应对：① 指针写成明确的前置步骤（"若不在上下文则读一次"），不是模糊的"参见"；这跟 think 现在加载 mode references 是同一种被证明可靠的模式。② 模型行为无自动测试（praxis 无 eval framework），用户实跑一个 skill、确认规则真被加载进来——这是验收的硬环节，不是结构 check 能替代的。③ 不 load-bearing 赌它：anti-patterns 这条 guard 的内容仍完整留在 `rules/anti-patterns.md`，最坏情况是"该读没读"，不是"内容丢了"。

## Key decisions

1. **两条规则都走 symlinked reference + 全 skill 提及 + 加载一次** — 用户定的。比"anti-patterns 留 inline"更统一、更单一真源；"加载一次"指令同时解掉可靠性（明确读）和上下文浪费（整会话只载一遍）。
2. **rules 文件改写成英文** — 它们变成"被英文 skill 加载的规则指令"，跟 SKILL.md 同理：英文是模型指令最稳的 register + 可移植；不影响输出语言（host 决定）。
3. **撤掉 setup-rule 用 forward 删除，不用 git revert** — 那几个 commit（c0f1ad3 / db9630a / 530dc44 / ee182b7）跟语言整顿、ARCHITECTURE 多次编辑交织，revert 易冲突。新 commit 删文件 + 改文档更干净，git 历史诚实呈现"加了又在想清楚后移除"。
4. **不加新 check，删 checkRulesWellFormed** — `checkReferencesExist` 已覆盖：它对 SKILL.md 里引用的 `references/X.md` 跑 `existsSync`，会跟随 symlink；断链（symlink 指向不存在的源）会被它当 BROKEN REFERENCE 抓到。所以单一真源被删/改名会被现有 check 挡住，不需要额外守护。
5. **ARCHITECTURE.md 同步改（文档例外）** — 现有"rules 靠 setup-rule 安装"的描述会被本次改动证伪，不改就主动留错。改成"rules 是单一真源、symlink 进 skills references、随 skills add 安装"，并标 Windows symlink caveat。

## Public surface changes

- 删除文件：`rules/output-style.md`、`scripts/setup-rule.ts`、`tests/setup-rule.test.ts`。
- `scripts/checks.ts`：删 `findRuleFiles` + `checkRulesWellFormed`；`tests/smoke/verify-skills.test.ts` 和 `tests/checks.test.ts` 删对应引用/用例。
- 新增：每个 skill 的 `references/anti-patterns.md`、`references/durable-context.md`（symlink → `../../../rules/<name>.md`）；6 个 skill 新建 `references/` 目录（think 已有）。
- 每个 SKILL.md 新增统一的"规则 + 加载一次"短指针块；think/implement 删去原 inline 的 anti-patterns 复述（内容移交 reference）。
- frontmatter / 触发词 / Outcome Contract：不变。

## Behavior invariants

这次 refactor 保证不变的行为（reviewer 可逐条验证）：

- 7 个 skill 的能力、流程步骤、停下条件覆盖范围不变。
- anti-patterns 的"避免的坑"（别凭印象写 API/工具/语法）仍能送达 agent——交付方式从 inline 改成 reference + 加载一次，内容不丢。
- 每个 Outcome Contract 的 4 字段、frontmatter 4 字段、双语触发词、Jaccard < 0.5：不变。

**有意改变（不是 invariant）**：

- 规则交付方式：inline → symlinked reference + 加载一次。
- durable-context 从"零 skill 引用的孤儿"变成"所有 skill 提及"——这是**新增**送达，不是回归（之前它根本没生效）。
- rules 文件语言：中文 → 英文。
- `rules/output-style.md`、setup-rule 机制：移除。

## Regression coverage

1. **既有自动测试**：每步 `pnpm test` 全绿。`checkReferencesExist` 跟随 symlink，断链会被抓；删 check 后单测同步删，不留悬空。
2. **沙箱 skills add 实测**（机制已验，落地后再验一次）：造含 symlinked rule references 的 skill，`HOME=sandbox npx skills add ... -a claude-code -a codex -g -y`，确认 `~/.agents/skills/<name>/references/` 里规则是真文件、透过外层 symlink 读得到、删源后仍可读。
3. **人眼**：anti-patterns / durable-context 内容完整留在 `rules/` 源；7 个 SKILL.md 都提及两个 reference + 有"加载一次"指令；think/implement 无 stale 的 inline anti-patterns 复述。
4. **用户实跑**（验 premise）：跑一个 skill，确认规则 reference 真被 `Read` 加载进上下文。

## Implementation steps

每步独立 ship、单独 commit、`pnpm test` 全绿。

### Step 1: 删除 setup-rule 机制

- 改动：删 `scripts/setup-rule.ts`、`tests/setup-rule.test.ts`；`scripts/checks.ts` 删 `findRuleFiles` + `checkRulesWellFormed`；`tests/smoke/verify-skills.test.ts` 删 import + 那个 `it()`；`tests/checks.test.ts` 删 `checkRulesWellFormed` 的 describe 块 + import。
- verify：`pnpm test` 全绿（测试数减少，无悬空引用）。

### Step 2: 删除 output-style.md

- 改动：删 `rules/output-style.md`。
- 前提确认：Step 1 后无任何代码/测试引用它（setup-rule 和 checkRulesWellFormed 已删）。
- verify：`pnpm test` 全绿。

### Step 3: rules 改写英文

- 改动：`rules/anti-patterns.md`、`rules/durable-context.md` 改写成干净英文（保留全部约束内容，只换语言；durable-context 里"每个消费 memory 的 skill 都链接到这里"这类话顺应新模型微调措辞）。
- verify：`pnpm test` 全绿（`checkRulesWellFormed` 已删，rules 不再被结构 check；markdown 链接若有则仍被 `checkMarkdownLinks` 检）。

### Step 4: symlink 进所有 skill + 统一指针

- 改动：
  - 为 7 个 skill 各建 `references/anti-patterns.md`、`references/durable-context.md` 两个 symlink → `../../../rules/<name>.md`（6 个 skill 新建 `references/` 目录）。
  - 每个 SKILL.md 顶部加统一短块：两条规则适用于所有 praxis 工作，本会话未读则读一次、读过别重读。
  - think / implement：删去原 inline 的 anti-patterns 复述（内容已在 reference）；流程相关处可保留一句自然的"(see anti-patterns)"指引，但不再复述内容。
- verify：`pnpm test` 全绿（`checkReferencesExist` 确认每个 SKILL.md 引用的两个 reference 都解析成功——symlink 不断）。

### Step 5: ARCHITECTURE.md + Windows caveat

- 改动：把"rules 靠 setup-rule 安装"段改成"rules 是单一真源、symlink 进 skills references、随 `npx skills add` 装到所有 agent；加载靠每个 SKILL.md 的'未读则读一次'指针"；移除 setup-rule.ts / checkRulesWellFormed / output-style 的相关描述；目录树更新；加一句 Windows symlink caveat（git clone 可能不还原 symlink，需 `core.symlinks` 或用 `--copy` 安装）。
- verify：`pnpm test` 全绿（ARCHITECTURE 的 markdown 链接被 `checkMarkdownLinks` 检）。

### Step 6: 沙箱实测 + 收尾

- 跑 Regression coverage #2 的沙箱 skills add，确认 symlinked rule references 真能装到、跨 agent 可读。
- 7 个 SKILL.md 并列读一遍，确认"规则 + 加载一次"指针一致。
- 最后一次 `pnpm test`。

## Verification

命令：

```bash
pnpm test                                    # 全套 check 绿（已删 checkRulesWellFormed）
git diff --stat main..HEAD                   # 改动总览
ls -la skills/*/references/                   # 每个 skill 都有两个 rule symlink
# 沙箱实测（不碰真实 ~/.claude）：
SBX=$(mktemp -d); HOME="$SBX" npx skills add . -a claude-code -a codex -g -y
cat "$SBX/.claude/skills/think/references/anti-patterns.md"   # 透过外层 symlink 读到内容
rm -rf "$SBX"
```

检查清单（手工）：

- [ ] setup-rule.ts / setup-rule.test.ts / output-style.md 已删，无悬空引用
- [ ] `checkRulesWellFormed` 已删，smoke + 单测同步清理
- [ ] rules 两文件为英文，约束内容逐条保留
- [ ] 7 个 SKILL.md 都有两个 rule symlink + "加载一次"指针
- [ ] think/implement 无 stale inline anti-patterns 复述
- [ ] 沙箱 skills add：rule references 装成真文件、透过外层 symlink 可读
- [ ] 用户实跑一个 skill，确认规则 reference 被加载

## Rollback

- 每步独立 commit：`git revert <sha>` 或 `git checkout HEAD~ -- <path>` 单步回退。
- **无外部状态变化**：本 plan 不碰 `~/.claude` / `~/.codex`（恰恰是删掉了那个会碰的 setup-rule）。回退纯 git。
- symlink 是 repo 内文件，回退即恢复。

## Risks & Unknowns

- **Risk: "加载一次"指令不被可靠执行**（premise collapse）。影响：anti-patterns guard 形同虚设。Mitigation：指令写成明确前置步骤；用户实跑验证；内容仍完整留在 rules/ 源（最坏是没读，不是丢失）。
- **Risk: 某 agent 的安装模式不跟随 symlink**。影响：该 agent 装不到规则内容。Mitigation：已验证 default（多 agent store+symlink）和单 agent `-g`（copied）两种都跟随并解析；Step 6 再验；兜底是 `--copy`。
- **Risk: Windows clone 不还原 symlink**。影响：Windows 贡献者 clone 后 references 断链、`pnpm test` 的 `checkReferencesExist` 会红。Mitigation：文档标注；Windows 用 `git config core.symlinks true` 或 `--copy` 安装；v2 可加 codegen 兜底。
- **Unknown: durable-context 改英文后的措辞**（哪些"何时读取"条件要随新模型调整）。owner：agent 在 Step 3 判断，blocker：no。
