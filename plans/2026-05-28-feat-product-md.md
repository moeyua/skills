---
mode: feat
title: 立 PRODUCT.md 作为 praxis 设计哲学和边界的显式锚点
created: 2026-05-28
status: done
---

# Feat: PRODUCT.md

## Building

新建 `PRODUCT.md` 作为 praxis 设计哲学和产品边界的显式锚点。把当前散落在 `README.md` 的"Why"段和"边界：明确不做的"段，加上刚才 SKILL.md refactor 隐含确立的写作哲学（对话式 + 解释 why），整合成一份独立的产品文档。

三件套职责自此清晰：**PRODUCT.md（why & what）/ README.md（how to use）/ ARCHITECTURE.md（how to build）**。

PRODUCT.md 的存在目的是：未来任何 praxis 改动（加 skill / 改 SKILL.md / 改架构）能引用它做判断，不必每次回头从 README + ARCHITECTURE + 7 个 SKILL.md 反推 praxis 自己的立场是什么。

## Not building

- 不写 PHILOSOPHY.md（独立做哲学）——PRODUCT.md 范围更大、更自然承接 README 原有"Why + 边界"内容
- 不动 SKILL.md / RESOLVER.md / rules/——这些已经隐含承接哲学
- 不引入 docs/ 子目录——praxis 根目录文档少而精，多一层目录无收益
- 不给 PRODUCT.md 加 frontmatter（status / version 等）——README / ARCHITECTURE 都没有，保持一致
- 不让 PRODUCT.md 含 install / usage / 命令——那是 README 的职责
- 不让 PRODUCT.md 含技术架构 / 数据流 / 目录结构——那是 ARCHITECTURE 的职责
- 不在 PRODUCT.md 里写 v2 规划——v2 规划在 ARCHITECTURE 末尾，保留
- 不在 README 里留 "see PRODUCT.md instead" 之类内容空壳——原段落彻底删除（避免"机械保证一致"违反）

## Approach

单方案，tradeoff 不接近不给备选。

写一份 80-100 行 PRODUCT.md，结构是：

1. 一句话定位
2. 设计哲学（5 条，每条「定义 + why + 一个具体例」）
3. 边界（5 项，每项「说明 + 链回哲学」）
4. 怎么用本文档

5 条设计哲学：克制 / 聚焦闭环 / 用户决定串联 / 机械保证一致 / 对话式 + 解释 why。前 4 条来自 README/ARCHITECTURE 现有碎片，第 5 条是刚才 SKILL.md refactor 确立的新内容。

5 项边界（保留 README 原 5 条，扩展每条的 why）：价值判断 / 文档管理 / 发布管理 / Agent 自审计 / 内容输入处理。

写作风格跟 SKILL.md refactor 后的对话式 + why-driven 一致——PRODUCT.md 自己就是哲学 #5 的实证。

## Premise collapse

**这个 plan 假设 PRODUCT.md 写完后 contributor / agent 真的会读它做决策**。

如果不成立——PR review 时没人引用 PRODUCT.md、SKILL.md 更新时不参考它、agent 不会触发引用——PRODUCT.md 就是死信，锚点白立。

Mitigation：

- README 头部加一句指向 PRODUCT.md 的指针，让访问 README 的人不可能错过它的存在
- 未来 SKILL.md / commit message / PR 描述涉及边界判断时显式引用 `PRODUCT.md §X`——给文档建立流通入口
- 这次实施时直接产出第一个"引用范例"：commit message 里写 `首次落地 PRODUCT.md。后续涉及边界的改动可引用 PRODUCT.md §<section>`

如果 6 个月后回头看 PRODUCT.md 没人引用过——撤掉，回去散在 README，承认锚点策略不 work。

## Key decisions

1. **5 条设计哲学，不多不少** — 4 条是从现有文档归纳；第 5 条是 SKILL.md refactor 确立的新哲学。增加更多条会让"判断标尺"变成"教条清单"，违反哲学 #1（克制）。
2. **每条哲学含一个具体例** — 抽象的哲学容易被解读偏；具体例锚定意图，让 reviewer 判断"新改动是否符合"时有参照。
3. **边界每项链回哲学** — 边界不是任意拒绝，是从哲学派生的逻辑结论。链回让"为什么不做"可追溯。
4. **README 原段落彻底删除而非保留 + 加 see-PRODUCT.md** — 重复内容违反 PRODUCT.md 自己的哲学 #4（机械保证一致）。一处单源。
5. **三件套单 commit 合一** — PRODUCT.md 新建 + README 瘦身 + ARCHITECTURE 加一行是一个语义单元（"哲学从 README 外移"），不像上次 SKILL.md refactor 7 个独立单元；拆开反而让 reviewer 难看到整体语义。
6. **不写 frontmatter** — README / ARCHITECTURE 都没有，PRODUCT.md 加上反而突兀；status / version 类元数据 v2 真需要时再加。

## Public surface changes

- 新增文件：`PRODUCT.md`（根目录）
- 改动文件：`README.md`（删 2 段，头部加 1 行指针）、`ARCHITECTURE.md`（元文档清单加 1 行）
- 触发 / 命令：不变
- skill API：不变

## Interface boundary

**PRODUCT.md 暴露**：

- 一句话定位（praxis 是什么）
- 5 条设计哲学（praxis 怎么想）
- 5 条边界（praxis 不做什么）
- 怎么用本文档（如何对照判断）

**PRODUCT.md 不暴露**：

- 安装步骤 / 命令 / 工作流（属 README）
- 技术架构 / 七层职责 / 数据流（属 ARCHITECTURE）
- v2 规划（属 ARCHITECTURE 末尾）
- skill 列表 / 触发词（属 README + RESOLVER）

**README.md 改动后保留**：标题 + 一句话定位 + 指向 PRODUCT.md 的指针 + Skills 表 + Install + 触发命令 + 工作流图 + think mode 表 + 致谢 + License。

**README.md 改动后移除**：`## Why` 段（line 5-9）、`## 边界：明确不做的` 段（line 71-77）。

**ARCHITECTURE.md 改动**：仅在 "7. 元文档" 清单（line 163-168）加一行 `PRODUCT.md  # 产品定位 / 设计哲学 / 边界`，列在 README 之前（PRODUCT 是 why，README 是 how，逻辑顺序）。

## Acceptance scenarios

1. **Given** 新 contributor 第一次接触 praxis，**when** 他读 PRODUCT.md 5 分钟，**then** 能正确回答三个问题：praxis 是什么 / 不做什么 / 为什么这样设计——三个答案都能从 PRODUCT.md 直接拿到，不必跨文档跳转。

2. **Given** 未来某 PR 提议加 `health` skill（自审计），**when** reviewer 查 PRODUCT.md 边界 #4「不做 Agent 自审计」，**then** 能引用 `PRODUCT.md §边界 #4 → 哲学 #2 聚焦闭环` 拒绝该 PR，理由链完整。

3. **Given** 用户访问 `README.md`，**when** 读头部，**then** 在第 3-5 行内看到指向 PRODUCT.md 的引用指针，不会错过这份文档的存在。

4. **Given** `git diff main..HEAD` 检查 README，**when** 看变动，**then** 原 `## Why` 段（包括 `## Why` 标题）和 `## 边界：明确不做的` 段（包括标题）**完全消失**——不留 placeholder、不留 "see PRODUCT.md" 内容空壳。

5. **Given** `pnpm test` 跑全套 smoke，**when** 跑 `checkMarkdownLinks`，**then** README → PRODUCT.md 的新 link、ARCHITECTURE → PRODUCT.md 的新引用全部解析成功。

6. **Given** `wc -l README.md ARCHITECTURE.md PRODUCT.md`，**when** 看篇幅，**then** README 比改前短（少 2 段）、ARCHITECTURE 几乎不变（仅加 1 行）、PRODUCT.md 80-100 行。

## Implementation steps

单 commit 合一（理由见 Key decisions #5）。下面 3 个 step 在同一 commit 里完成。

### Step 1: 写 `PRODUCT.md`

- 改动：新建 `PRODUCT.md`
- 结构：
  - `# Praxis`
  - 一句话定位（取自 `README:3`）
  - `## 设计哲学` 段，5 条小节
  - `## 边界：明确不做的` 段，5 项小节
  - `## 怎么用本文档` 段
- 5 条哲学的内容来源：
  - #1 克制 → `README:7`
  - #2 聚焦闭环 → `README:9` + `README:73-77`
  - #3 用户决定串联 → `README:48`
  - #4 机械保证一致 → `ARCHITECTURE:8`
  - #5 对话式 + 解释 why → 刚才 SKILL.md refactor commits（4616554..0216952）的实证
- 5 项边界的内容来源：`README:73-77` 5 条逐字保留 + 扩展每条 why（链回某条哲学）
- 风格：对话式 + why-driven，跟新版 SKILL.md 一致（PRODUCT.md 自己就是哲学 #5 的实证）

### Step 2: 改 `README.md`

- 改动：删 2 段 + 加 1 行
- 删 line 5-9（`## Why` 段及其标题）
- 删 line 71-77（`## 边界：明确不做的` 段及其标题）
- 在删 `## Why` 留下的位置（约新 line 5），加一句指针：`> 设计哲学和产品边界见 [PRODUCT.md](./PRODUCT.md)。`
- 其他段落（Skills 表、Install、触发命令、工作流、think mode 表、致谢、License）一字不改

### Step 3: 改 `ARCHITECTURE.md`

- 改动：仅在 "7. 元文档" 清单加 1 行
- 找到 line 163-168 的 code block：
  ```
  README.md                       # 给使用者
  ARCHITECTURE.md                 # 给开发者和协作 agent 看（本文件）
  LICENSE
  ```
- 改成：
  ```
  PRODUCT.md                      # 产品定位 / 设计哲学 / 边界
  README.md                       # 给使用者
  ARCHITECTURE.md                 # 给开发者和协作 agent 看（本文件）
  LICENSE
  ```
- 顺序：PRODUCT 第一（why），README 第二（how to use），ARCHITECTURE 第三（how to build）——三件套自然顺序
- 其他内容不动

### Step 4: 验证 + 单 commit

- `pnpm test` 全跑（41 个测试 + 所有 smoke check）必须一次通过——特别关注 `checkMarkdownLinks` 新引入的 README→PRODUCT 和 ARCHITECTURE→PRODUCT 链接
- 人眼对照 Acceptance scenarios 第 1-4 条 spot check
- `git add PRODUCT.md README.md ARCHITECTURE.md && git commit`，commit message 用 conventional commits + 项目惯例：

```
docs: introduce PRODUCT.md as design philosophy anchor

[一段话说明：把散落在 README 的"Why"段和"边界"段，加上
 SKILL.md refactor 确立的写作哲学，整合成 PRODUCT.md 作为
 锚点。三件套职责自此清晰：PRODUCT (why & what) / README
 (how to use) / ARCHITECTURE (how to build)。]

后续涉及边界判断的改动可引用 PRODUCT.md §<section>。

vp test: 41/41. vp check: clean.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

## Verification

整体验收。

命令：

```bash
pnpm test                            # 41 个测试 + 所有 smoke check 一次绿
ls PRODUCT.md                        # 文件存在
wc -l PRODUCT.md README.md ARCHITECTURE.md  # 篇幅符合预期
grep -c "^## Why" README.md          # 输出 0（段落已删）
grep -c "^## 边界" README.md         # 输出 0（段落已删）
grep -c "PRODUCT.md" README.md       # 至少 1（指针存在）
grep -c "PRODUCT.md" ARCHITECTURE.md # 至少 1（元文档清单引用存在）
git log --oneline main..HEAD         # 1 个 commit（合一）
```

检查清单（手工）：

- [ ] PRODUCT.md 含全部 4 段（一句话 / 设计哲学 / 边界 / 怎么用）
- [ ] 设计哲学 5 条齐全，每条都有 why + 具体例
- [ ] 边界 5 项齐全，每项链回某条哲学
- [ ] README 头部有指向 PRODUCT.md 的指针
- [ ] README 原 "Why" 段和 "边界" 段（及其 `##` 标题）完全消失
- [ ] ARCHITECTURE 元文档清单含 PRODUCT.md 一行，顺序在 README 之前
- [ ] 三件套之间无重复内容（5 条哲学 / 5 项边界只在 PRODUCT.md 出现）
- [ ] `pnpm test` 一次通过（不需要 retry）

## Rollback

- 单 commit 合一 → `git revert <sha>` 一步回退
- 外部状态零变化（不动 npm publish / 远端 / .claude/skills/）
- 本地 symlink 安装的 praxis 不受影响（动的是根目录元文档，非 SKILL.md）

## Risks & Unknowns

- **Risk: PRODUCT.md 写完没人读 / 没人引用** — Premise collapse 已 ack；mitigation 在 commit message 留范例 + README 头部 link。6 个月后回头看，没人引用就撤。
- **Risk: 5 条哲学相互冲突写不下去** — Step 1 写时先核每条 vs 其他 4 条，发现冲突就 stop 回 think。低概率（4 条来自现有 README，已经共存）。
- **Risk: 写出来的"具体例"是事后构造的，不是真实表现** — 哲学 #5 的例子直接引用 SKILL.md refactor 真实 commit；哲学 #1-#4 的例子从现有 skill 设计选——例子必须有 git 历史 / SKILL.md 行号可追，不能编。
- **Unknown: PRODUCT.md 顶部要不要标题外加 tagline**（类似 `> 一套用于...`） — owner: agent 在 Step 1 决定，blocker: no。倾向加一句（跟 README 风格对称）。
