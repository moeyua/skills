---
mode: feat
title: persist 记忆格式规范 — 按文档拆分、按需加载
created: 2026-06-04
status: done
---

# persist 记忆格式规范

给 persist 补上**规范**(每个记忆 artifact 的格式定义)与可机械守的**约束**,解决两个问题:(1) 重构 spec→persist 时丢失的 behavior `## Spec format` 定义;(2) 散文目标(ARCHITECTURE/DESIGN/WORKFLOW/ROADMAP/README)从来没有格式规范、内容全靠当场发挥。规范**按文档拆分、按需加载**(沿用 shape 的 mode-\*.md 传统)。

## Building

1. **每文档一份格式规范**:`skills/persist/references/formats/<artifact>.md`,6 份——behavior(恢复自 git `d588f85`)/ architecture / design / workflow / roadmap / readme。每份含:必备 section 模板 + 写作要点 + 边界。persist 写哪个 artifact 才加载哪份。
2. **catalog 瘦成索引**:`rules/memory-catalog.md` 每条只留 purpose/audience/when-needed/source/boundary + 指针 `Format: references/formats/<artifact>.md`,详细格式移入 format 文件。
3. **persist 照规范写**:persist/SKILL.md 改为「读索引;写某 target 时加载其 format 文件」;specs/persist/spec.md 加一条「必须照对应 format 写」。
4. **一条结构约束**:`checkMemoryCatalog`——catalog 列的每个 artifact(PRODUCT 除外)都有对应 format 文件、无孤儿 format 文件,跟 `checkResolverConsistency` 同构,进 smoke。

## Not building

- **prose 内容的机械检查**(「无未来段」「ROADMAP 无日期/优先级」)—— 脆且易误伤 squire 自己的合法内容(ARCHITECTURE 的「## 未来规划」指针、ROADMAP 的日期备注)。prose 内容对不对机械守不住,交给 format 规范 + persist 的「依据权威源、缺源停问」。behavior 仍由既有 `checkSpecFormat` 守。
- **format 文件进 rules/(为未来 health 共享)** —— 现在 health 不存在、explore 只需索引,format 是 persist 的 authoring 细节,放 persist/references/ 即可;health 落地若需要再迁(列入 ROADMAP 候选,不在本 plan)。
- **PRODUCT 的 format** —— persist 不写 PRODUCT 内容(走 shape),不需要 format 文件;catalog 里注明。
- **改其它 skill / 其它 check**。

## Approach

**索引(共享、薄)+ 格式规范(persist 私有、按需)分层。**

```
rules/memory-catalog.md            # 索引:artifact 清单 + 每条摘要 + Format 指针   (explore/persist 共享,symlink)
skills/persist/references/formats/  # 格式规范:每文档一份,persist 写时按需加载   (persist 私有,真文件)
  ├── behavior.md      # 恢复的 Spec format:template + 3 种 Verify + what-belongs
  ├── architecture.md  # 目录结构 / 技术栈 / 数据流 / 决策记录
  ├── design.md        # UI:界面 / 交互 / 视觉规范
  ├── workflow.md      # 本项目开发流程
  ├── roadmap.md       # 平铺条目「X 暂缓/计划,因为 Y」,record-only
  └── readme.md        # 定位 / 用法 / 入口(综合自 PRODUCT/ARCHITECTURE)
```

- **为什么 format 放 persist/references/ 而非 rules/**:它是 persist 的 authoring 细节;explore 只需索引(知道读哪些文档),不需要写作格式。放 persist 私有 = 真文件、随 persist 安装、无需 symlink 目录(install 跟随目录 symlink 行为不确定,避开)。
- **为什么 catalog 留 rules/**:它跨 skill(explore 读、persist 读、将来 health 读),属 rules/ 的「跨 skill 单一真源」。
- **behavior format 从 git 恢复**:旧定义在 `git show d588f85:skills/spec/SKILL.md` 的 `## Spec format` 段(template + 三种 Verify 取值 + what-belongs),照搬进 `formats/behavior.md`,不重新发明。

**Minimal 选项(对照)**:只恢复 behavior format、不给散文做 format——但散文「太薄」是这次的主诉,只补一半不够。

## Premise collapse

**本方案假设:给散文 artifact 定 section 模板,就能把「全靠 AI 发挥」收成「照规范填」。** 若模板定得过死,会撞哲学 #1(克制)——把 prose 内容也焊死,失去判断;若过松,等于没规范。

**重塑使其两头都不塌**:format 文件只规定**结构**(必备 section + 每段该装什么 + 边界)和**源**(从哪取),**不规定段内措辞**——段内仍是 persist 依据权威源的判断。即「结构机械、内容判断」。这样过死(焊死措辞)和过松(无结构)都避开;而且 prose 内容的正确性本就机械守不住(见 Not building),不押在「检查能兜住内容」上。

## Key decisions

1. **按文档拆分 + 按需加载**(用户要求):每 artifact 一份 format 文件,persist 写时只加载当前 target 的那份,不一次性吞全部——沿用 shape mode-\*.md 的 reference 按需加载传统,省 token。
2. **索引/格式分层**:catalog = 薄索引(共享),formats/ = 厚规范(persist 私有按需)。
3. **behavior format 恢复而非重写**:照搬 git 历史,避免二次发明。
4. **约束收敛为一条结构检查**:`checkMemoryCatalog`(catalog↔formats 同步),放弃脆弱的 prose 内容检查;诚实承认 prose 内容机械守不住,且 `checks.ts` 只约束 squire 自身、管不到外部项目。
5. **format 用「结构机械、内容判断」**:规定 section 与源,不规定措辞。

## Public surface changes

- 新增 `skills/persist/references/formats/*.md`(6 份)——persist 的格式真源。
- `rules/memory-catalog.md` 结构变更:厚「How to write」→ 薄摘要 + Format 指针。
- persist/SKILL.md:authoring 流程改为「索引 + 按需加载 format」。
- specs/persist/spec.md:加「照对应 format 写」requirement。
- `scripts/checks.ts`:新增 `checkMemoryCatalog`(+ smoke it() + 单元测试)。

## Interface boundary

- **format 文件契约**:每份 `formats/<artifact>.md` 必含「Sections(必备段)/ Source(源)/ Boundary(不该装什么)」三块;persist 写该 artifact 时加载它、照 Sections 填、按 Source 取、守 Boundary。
- **catalog 索引契约**:每个 artifact 一节,含摘要字段 + 一行 `Format:` 指针(PRODUCT 例外:注明「内容经 shape,无 format」)。
- **`checkMemoryCatalog`**:输入 repo root;解析 catalog 的 artifact 列表,断言每个(除 PRODUCT)在 `skills/persist/references/formats/` 有同名(小写)文件,且该目录无 catalog 未列的孤儿文件;违反即 throw。
- **不暴露 / 不动**:不改 explore 对 catalog 的用法(它仍只读索引);不加 prose 内容检查;不碰外部项目(checks 仅 squire 自身)。

## Acceptance scenarios

1. **(恢复)** 读 `formats/behavior.md` → 含旧 `## Spec format` 的 template + 三种 `Verify:` 取值说明 + what-belongs,与 `git show d588f85:skills/spec/SKILL.md` 的该段等价。
2. **(按需加载)** persist 写 ARCHITECTURE 时 → 加载 `references/formats/architecture.md`、照其 Sections 填;不加载其余 5 份。
3. **(散文有规范)** persist 写 ROADMAP → 照 `formats/roadmap.md`:平铺「X,因为 Y」、record-only,无优先级/排期。
4. **(catalog 瘦身)** 读 `rules/memory-catalog.md` → 每条是摘要 + `Format:` 指针,无大段 How-to-write;explore 仍能据它知道读哪些文档。
5. **(结构约束 happy)** catalog 6 个非 PRODUCT artifact 各有 format 文件 → `checkMemoryCatalog` 不抛。
6. **(结构约束 fail)** 删掉 `formats/roadmap.md` 或在 catalog 加一个无 format 的 artifact → `checkMemoryCatalog` 抛,指出缺失项。
7. **(孤儿 fail)** `formats/` 多一份 catalog 未列的文件 → `checkMemoryCatalog` 抛。

`## Spec delta`(persist 自身契约):

```markdown
## ADDED Requirements

### Requirement: 照对应 format 规范写

persist 写任一记忆 artifact 必须加载并遵循 `skills/persist/references/formats/<artifact>.md` 的 Sections / Source / Boundary;按需只加载当前 target 那份。format 只规定结构与源,不规定段内措辞。
Verify: [checkMemoryCatalog](../../tests/checks.test.ts)
```

> 说明:这条的「format 文件存在且与 catalog 同步」由 `checkMemoryCatalog` 机械背书(故 Verify 指向测试);「persist 是否照 format 填」是 agent 行为、仍属 manual,但结构前提已被机械守住。

## Implementation steps

> 四 Phase,顺序 A→B→C→D,各自可独立 ship。

### Phase A — 建 6 份 format 文件

1. `mkdir skills/persist/references/formats`。
2. 写 `formats/behavior.md`:从 `git show d588f85:skills/spec/SKILL.md` 取 `## Spec format` 段(template + 三种 Verify + what-belongs),按「Sections / Source / Boundary」三块组织。verify: 人比对 git 历史等价;`pnpm test`(链接)。
3. 写 `formats/{architecture,design,workflow,roadmap,readme}.md`:各按三块结构,内容取自现 `rules/memory-catalog.md` 的对应「How to write/Boundary」+ 上文表格。verify: 6 份齐全、各含 Sections/Source/Boundary;`pnpm test` 链接无断。

### Phase B — catalog 瘦成索引

4. 改 `rules/memory-catalog.md`:每个 artifact 节压成摘要(purpose/audience/when-needed/source/boundary)+ 一行 `Format: references/formats/<artifact>.md`(PRODUCT 注明无 format、内容经 shape)。删大段 How-to-write(已移入 format)。verify: 人读;`pnpm test`(explore 的 `references/memory-catalog.md` 链接仍有效)。

### Phase C — persist 照规范写

5. 改 [skills/persist/SKILL.md](../skills/persist/SKILL.md) 的「Pick the target」段:改为「读 catalog 索引定 target → 加载 `references/formats/<target>.md` → 照 Sections/Source/Boundary 写」;保留 anti-invention 与 create-if-missing。verify: `pnpm test` frontmatter/Outcome/references(引用 `references/formats/` 路径存在)。
6. 改 [specs/persist/spec.md](../specs/persist/spec.md):加上文 Spec delta 的「照对应 format 规范写」requirement(Verify 指向 checks 测试)。verify: `pnpm test` spec 格式(每条一 Verify)。

### Phase D — 结构约束 checkMemoryCatalog

7. `scripts/checks.ts` 加 `checkMemoryCatalog(root)`:解析 `rules/memory-catalog.md` 的 `## <Artifact>` 列表(排除 intro 与 PRODUCT),断言每个在 `skills/persist/references/formats/` 有同名小写 `.md`、且该目录无未列文件;违反 throw,消息列出缺失/孤儿。verify: 单元测试覆盖 happy/缺失/孤儿。
8. `tests/checks.test.ts` 加 `checkMemoryCatalog` 的 fixture 测试(happy + 缺 format + 孤儿 format);`tests/smoke/verify-skills.test.ts` 加 `it("checkMemoryCatalog: catalog 与 formats 同步", () => expect(() => checkMemoryCatalog(REPO_ROOT)).not.toThrow())`。verify: `pnpm test` 全绿(squire 自身 6 份 format 齐 → smoke 通过)。

## Verification

- command: `pnpm test`(全部既有 check + 新 `checkMemoryCatalog`)
- checklist(manual,对应 Acceptance):
  - [ ] `formats/behavior.md` == 旧 Spec format(场景 1)
  - [ ] catalog 瘦成索引 + 指针、explore 仍可用(场景 4)
  - [ ] `checkMemoryCatalog`:全齐不抛、缺失抛、孤儿抛(场景 5/6/7)
  - [ ] persist/SKILL.md 走「索引 → 按需加载 format」(场景 2,人读 SKILL)

## Rollback

逐 Phase `git revert`:D 删 check + 测试;C 还原 persist SKILL/spec;B 还原 catalog;A 删 formats/。纯文档 + 一个 check,无运行时代码、无数据迁移、无新依赖。format 文件是新增,catalog 是内容重排,均可逆。

## Risks & Unknowns

- **section 模板过死/过松**:已由 Premise collapse 的「结构机械、内容判断」消解。
- **机械约束只及 squire 自身**:诚实限制——`checks.ts` 是 squire 的 smoke,不随 persist 装到外部项目;外部项目的约束 = format 规范 + persist 纪律。已写入 Key decision 4。
- **format 放 persist 私有,将来 health 想用**:届时迁 rules/ 即可,接口(三块结构)不变;列 ROADMAP 候选。
- **Unknown**:squire 自己要不要 `WORKFLOW.md`/`DESIGN.md` 实例?owner: 你;blocker: no(format 规范先就位,实例按需 persist)。

## Mode-specific

见 `## Interface boundary` 与 `## Acceptance scenarios`(feat 必填,已就位)。
