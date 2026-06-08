---
mode: feat
title: health skill — 项目体检(校验支柱的 loop 外正交半边)
created: 2026-06-08
status: done
---

# health skill — 项目体检

## Building

新增第 8 个 skill `health`:一份**只读、advisory**的 skill,给项目做体检,产出「哪里漂了/陈旧了」的报告,只指路、不动手。

**最主要的一项检查:文档说的,跟代码做的,对不对得上**(比如 README 写「用 Redux」,代码其实换成了 Context)。这是 health 出生的理由——persist 一直缺一个信号「哪份文档跟代码对不上了」,health 就是给它这个信号。这一项要同时读文档和读代码,机械做不到,靠模型判断。

机械那半是**真·确定性代码**:`skills/health/` 里带一个**零依赖 TS 脚本**,随 skill 一起装到使用者机器,用 `node ${CLAUDE_SKILL_DIR}/scripts/checker.ts <项目根>` 直接跑(node 24 类型擦除,无需 build)。它做纯文件系统的确定性检查。环境查询类(依赖陈旧、CI 状态)由 agent 跑 Bash,不塞进脚本以免引入外部工具依赖。

health 查**两类对象**:

1. **squire 写的文档**(specs/、ARCHITECTURE、README 这些记忆 artifact)——squire 已知格式,既查格式合规,也查跟代码对不对得上。
2. **项目本身**(任意项目,不假设用 squire)——依赖、CI、文件大小、文档里的链接/路径还在不在。**次要**。

同时按你定的归位重排 squire 的检查:**查产物的确定性逻辑迁进 `skills/health/scripts/checker.ts`,从 `tests/` 彻底移除**;`tests/` 只留**查工具本身(skill 定义)**的部分,永远不碰产物。代价:squire 自己的 specs/、文档从此**不在 CI 卡,只靠跑 `/health` 守**——跟任何项目一样(行为一致)。

## Not building

- **不引入运行时 npm 依赖**。脚本零依赖、只用可擦除 TS 语法(纯类型注解,不用 enum/namespace/参数属性),保证 `node checker.ts` 直跑。
- **不做 codegen/build**。.ts 原样发、node 24 原样跑——ARCHITECTURE 推到 v2 的 codegen 不提前。
- **环境查询不写 per-type 特例**。依赖检查靠「检出包管理器再跑对应命令」自适应,不为每种生态写专属逻辑(否则就是 ROADMAP 搁置 `release` 的坑)。注意:这条只管「项目本身」那类;「squire 写的文档」那类本就假定 squire 格式,不涉及项目类型。
- **不自动修、不提交、不自动调 persist、不接 CI merge-block**(health 自己只报告、不阻断)。不串联(哲学 #3)。
- **不碰 PRODUCT 内容、不做价值判断**(哲学 #2 / 边界 #1)。
- **不重做 verify 的 review**(verify 看一次改动,health 看整个项目)。
- **脚本不抓散文/目录树里顺嘴提的文件名**(如 ARCHITECTURE 目录树代码块里的 `LICENSE`)。脚本只查 markdown 链接,不扫「看着像路径的词」,免误报(不强求)。这类真要发现,靠模型读文档时顺带注意,但不保证。

## Approach

一个 skill、单次体检(不搞 named modes),带可选范围收窄(`docs`/`deps`/`ci` 或路径)。

机械检查三分,主次分明:

- **主**:文档 vs 代码(模型判断)——报告放最前。
- **次**:① 脚本(确定性、纯文件系统、零外部工具):文档格式合规 + 链接/锚点/引用解析 + 占位符 + 文件大小;② agent Bash(环境查询):`pnpm/cargo outdated`、`gh run list`、`git log` 时间戳。

机械先跑(便宜、确定),模型只用在机械做不到的语义判断(行为是否一致)。

分两个**各自能单独发布**的阶段:

- **阶段 1 — 加 health skill**(含脚本):纯新增 + 文档更新,不碰 checks.ts。落地即可用。`pnpm test` 全程绿。
- **阶段 2 — 重排 squire 检查脚本**:查产物逻辑迁进 health 脚本、从 `tests/` 移除;`tests/` 瘦身为只查 skill 定义。行为保留,独立可发。

两阶段无数据依赖,任一单独 merge 都成立。

## Premise collapse

**两个最脆的假设:**

1. **主检查靠模型判得够准**——「文档 vs 代码一致」纯靠模型,误报/漏报多则主价值垮。缓解:模型 finding 只报 confidence ≥ 80、分级(沿用 verify),宁漏不吵;脚本的确定性检查是下限价值,模型吵时 health 退化成「一份还有用的机械体检」,不归零。
2. **目标机器有 node 24+**——脚本靠它直跑 .ts。缺了脚本跑不了。缓解:① squire `engines.node >=24`,dogfood 自身没问题;② 脚本跑不起来时 SKILL.md 指示 agent 标明「机械确定性层不可用」、退到模型层 + Bash 环境查询,health 不报错、不归零;③ 这是开发工具套件的合理前提(用 squire 的人基本有现代 node)。

## Key decisions

1. **主检查 = 文档 vs 代码一致**,依赖/CI/文件大小次要(你已确认)。SKILL.md 与报告按此主次排版。
2. **机械确定性层 = 随 skill 装的零依赖 TS 脚本**,node 24 直跑、无 build。这是「强机械」的落地:真代码,不是散文模仿。
3. **查产物逻辑迁进 `skills/health/scripts/checker.ts`,从 `tests/` 彻底移除** —— checkSpecFormat、产物文档的链接/引用检查搬进脚本(随 skill 走);**`tests/` 不再对 squire 真实产物跑任何检查**。代价说清:squire 自己的 specs/、文档**不再 CI 卡**,只靠跑 `/health`(或 `node checker.ts .`)守,跟任何项目一样——这才是「行为一致」的完整含义,不给 squire 留 CI 特权。`tests/` 只留查 skill 定义的检查(frontmatter / RESOLVER / Jaccard / Outcome Contract / no-root-skill / memory-catalog / 以及 checkMarkdownLinks 窄化到 skills/ 子树)。
4. **环境查询(deps/CI/git)走 agent Bash,不进脚本** —— 保脚本零外部工具依赖、纯文件系统。
5. **单次体检 + 范围收窄,不上 named modes**。
6. **机械先于模型**;health 只报告、只指路(文档漂移→persist、代码 bug→shape fix、简化→shape refactor、scope 蔓延→交用户),本体不改文件。
7. **health 自己也守 squire 的 skill-定义 invariant**:RESOLVER 一致性、触发词 Jaccard、Outcome Contract、description 规范——这些留 tests/、阶段 1 必须绿。但 `specs/health/spec.md` 的**格式**属产物:阶段 1 它还被即将移除的 checkSpecFormat 暂管,阶段 2 后改由 `/health` 守(跟所有产物一样)。

## Public surface changes

- **新增 `/health` 命令**(命令名取目录名)。
- **新增 `skills/health/scripts/checker.ts`**:CLI 入口 `node checker.ts <项目根> [--json]` 输出结构化 findings;`export` 各 check 函数供 fixture 单测(只测**脚本逻辑**对不对,**不跑 squire 真实产物**——那是 /health 的事)。零依赖、可擦除 TS。
- **SKILL.md frontmatter 加 `allowed-tools`**(如 `Bash(node *)`、`Bash(pnpm outdated*)`、`Bash(gh run list*)`),让脚本与环境查询免逐次授权。
- **输入**:可选范围收窄(类别或路径);无参即全量。
- **输出**:Health Report——文档 vs 代码在前,机械 finding(脚本事实 + Bash 环境事实)在后,模型 finding 带 confidence 分级,每条给 routing。
- **Side effects:None**。health 只读:脚本只读文件系统;Bash 命令(outdated/gh/git/wc)都是观察。不写文件、不提交、不调别的 skill。
- **不暴露**:自动修复、CI gating(health 自身)、persist 自动触发、per-type 逻辑。

## Spec delta

新增 domain `health`,供 persist 在 build 后记入 `specs/health/spec.md`(build 阶段先落地以过 checkSpecFormat)。句子中文、结构标签英文;Verify 均 `manual(integration)`。

```markdown
## ADDED Requirements

### Requirement: 只读、只指路、不接管

health 必须不修改任何文件,不提交、不推送、不自动调用其他 skill;脚本与观察命令(node checker / pnpm outdated / gh / git log / wc)只采集事实,不改。发现问题指向对应 skill(文档漂移→persist、代码 bug→shape fix、简化→shape refactor、scope 蔓延→交用户),不接管。
Verify: manual(integration)

### Requirement: 主检查——文档声称 vs 代码实际

health 必须把「文档声称的行为」与「代码实际的行为」是否一致作为首要检查,逐条核实(对 squire 格式文档以每条 `### Requirement:` 为离散 claim 逐条核;对散文文档 best-effort),标出不符处(含散文式架构/技术选型声称与代码不符),给 observed-vs-claimed 裁决,报告置于最前;不就地改。
Verify: manual(integration)

### Requirement: 机械先于模型、确定性层用随装脚本

health 必须先跑机械检查产出确定性事实:其中纯文件系统的确定性检查(文档格式合规、链接/锚点/引用解析、占位符、文件大小)由随 skill 装的脚本 `node ${CLAUDE_SKILL_DIR}/scripts/checker.ts` 执行,环境查询(依赖陈旧、CI 状态、git 时间戳)由 Bash 执行;模型判断只用于机械做不到的语义判断(行为是否一致),不替代可机械确定的检查。
Verify: manual(integration)

### Requirement: 两类对象、自适应且探不到即跳过

health 查两类对象:squire 写的文档(假定 squire 格式,查格式合规 + 漂移)与项目本身(任意项目,查依赖/CI/文件大小/链接)。项目本身那类必须按现状自适应(检出包管理器/CI/文档位置),依赖缺失(无 manifest / 无 GitHub remote / 无文档 / 无 node 24)时优雅跳过并在报告说明,不报错、不为某项目类型写专属逻辑。
Verify: manual(integration)

### Requirement: 模型 finding 过滤分级、跳过项需标明

health 报告必须含机械 findings(事实)与模型 findings;模型 findings 只报 confidence ≥ 80,按 Critical / Important / Suggestion 分级并给 routing;被跳过的检查须在报告标明。
Verify: manual(integration)
```

`specs/persist/spec.md` 无需改:persist 已声明「acts on awareness from health or a person, never owns detection」。

## Implementation steps

### 阶段 1 — 加 health skill(含脚本,独立可发)

1. **建目录与 references symlink**
   - change:`mkdir -p skills/health/references skills/health/scripts`;照 `skills/verify/references/` 实测层级,把 `rules/anti-patterns.md`、`rules/durable-context.md` symlink 进 `skills/health/references/`。
   - verify:`ls -l skills/health/references/` 两条 symlink 可解析。

2. **写 `skills/health/scripts/checker.ts`**(零依赖、可擦除 TS)
   - change:实现纯文件系统的确定性检查。**每个检查函数返回 findings 数组,不 throw**(它是审计器,不是断言)。CLI shim(`process.argv` 驱动,接受 `<项目根>` 与 `[--json]`)把 findings 打印。检查项:文档格式合规(**仅当检出 squire 格式 specs/ 时**:Purpose/Requirements/Verify,移植自 `scripts/checks.ts` 的 checkSpecFormat)、markdown 链接解析、内部锚点解析、引用路径存在、占位符(TBD/TODO/FIXME)、文件大小阈值。`export` 各函数供 `tests/` 单测(它是工具,测它=查工具)+ CLI shim。
   - verify:`node skills/health/scripts/checker.ts . --json` 在 squire 仓零报错跑通、输出 findings;「能否正确抓到坏链接/坏格式」由 checker.ts 的假数据单测覆盖(见 step 7)。`node --version` ≥ 24。

3. **写 `skills/health/SKILL.md`**(全文,对齐其他 SKILL.md 散文风格)
   - frontmatter:`name: health`;`allowed-tools`(**必须单行逗号分隔**:`Bash(node *), Bash(pnpm outdated*), Bash(npm outdated*), Bash(gh run list*), Bash(git log*)`——已查 `frontmatter.ts`:未知字段静默忽略,但多行 YAML 列表的 `- ...` 行无冒号会触发 INVALID FRONTMATTER LINE,故必须单行);`description`(40–500、首词动词、含 "Use when"+"Not for"):"Audit a whole project's health — first whether its docs still match the code, then dependency/CI/file-size staleness and broken references. A bundled deterministic script does the mechanical checks; model judgment does the docs-vs-code part. Use when you want a project-wide checkup or to find what has drifted; read-only and advisory. Not for change-scoped pre-merge review (use verify), writing the fixes it finds (use persist), or fixing flagged code (use shape fix).";`when_to_use`:"health, audit, checkup, drift, doc drift, stale docs, dependency staleness, broken references, 体检, 健康, 漂移, 文档漂移, 陈旧, 审计";`dispatch_intent`:"Project-wide read-only health audit — docs-vs-code consistency first, plus a bundled mechanical checker; advisory only"。
   - 正文:定位 + 跟 verify 的 scope 区分;「Unfamiliar project? 先 explore」;两条跨 skill 规则指针;`## Outcome Contract`(4 字段);`## 先看这个:文档说的 vs 代码做的`(主检查,讲清它=persist 缺的信号,并给**执行方法**:对 squire 格式文档把每条 `### Requirement:` 当离散 claim 逐条去代码核——有界;对通用散文文档抽可核的行为声称 best-effort,核不动的不硬判);`## 两类对象`;`## 机械检查怎么跑`(先 `node ${CLAUDE_SKILL_DIR}/scripts/checker.ts <根> --json` 取确定性事实;再 Bash 跑环境查询;node 24 缺失则标明跳过);`## 机械先于模型`;`## 范围收窄`;`## 报告格式`(见 Verification);`## Boundaries`(vs verify/persist/explore/shape fix);`## When to stop`(想修→写 finding;想自动串联→只指路;想写项目类型特例→停;依赖/node 缺→跳过并标注)。
   - verify:`pnpm test`(checkOutcomeContract / checkDescriptionConformance / checkReferencesExist 过)。**坑**:REF_RE 的 lookbehind `(?<![/.\w])` 会让 `${CLAUDE_SKILL_DIR}/scripts/checker.ts`(scripts 前是 `/`)**不被匹配、不被校验**;故 SKILL.md 必须另有一处**裸写 `scripts/checker.ts`**(前面非 `/`,如散文「the bundled checker at scripts/checker.ts」),checkReferencesExist 才会验它存在。

4. **更新 `skills/RESOLVER.md`** 加 health(校验支柱正交半边,loop 外);verify:checkResolverConsistency 过。

5. **写 `specs/health/spec.md`** = 上面 ADDED 段;verify:checkSpecFormat 过。

6. **更新 README.md / ARCHITECTURE.md / ROADMAP.md**
   - README:skill 表 7→8 加 health;「7 个 skill」改 8;触发命令加 `/health`;工作流注明 loop 外体检。
   - ARCHITECTURE:目录加 `skills/health/`(含 `scripts/checker.ts`);决策记录补两条——「为什么 health 是带脚本的 skill 而非可移植 checks.ts」(checks.ts 困在 squire 仓出不去,bundled 脚本能随 skill 走)、「为什么重新出现可执行入口」(health 脚本有 CLI shim,局部反转『scripts/ 无可执行 CLI』,但仍无 codegen:node 24 直跑 .ts);skill 计数更新。
   - ROADMAP:移除 `health`(已落地);保留它与 persist 自动漂移同步的依赖说明。
   - verify:checkMarkdownLinks 过;人工核对计数。

### 阶段 2 — 重排 squire 检查脚本(独立可发,行为保留)

7. **查产物逻辑迁出 `tests/`、进 health 脚本**
   - change:
     - checker.ts 在**阶段 1 已写好**这套逻辑(格式合规 + 产物文档的链接/引用检查);**阶段 2 只是把 `scripts/checks.ts` 里旧的 checkSpecFormat、产物文档链接检查删掉**(已由 checker.ts/health 接管),并从 `tests/smoke` 移除对它们的调用。
     - **`tests/` 永远只把 checker 指向工具、不指向产物**:删掉对真实 specs/、文档的检查(`checkSpecFormat(REPO_ROOT)` 等);链接/引用等只对 **`skills/` 子树**(SKILL.md / references,属工具)跑。tests/ 可以 import checker.ts 的函数来跑——那是拿工具查工具,不是查产物。
     - 其余查 skill 定义的函数(checkSkillFiles / checkDescriptionConformance / checkOutcomeContract / checkReferencesExist / checkNoRootSkill / checkTriggerJaccard / checkResolverConsistency / checkMemoryCatalog)保留;视情况从 `scripts/` 收进 `tests/`,`scripts/frontmatter.ts` 若仍被引用则随迁。
     - checker.ts 的单测放 **`tests/`**(它是工具,test 它就是查工具),用假数据测逻辑、不跑 squire 真实产物;**skill 目录里不放 `.test.ts`**——会随 skill 装到用户机器、纯属无用垃圾。
     - 若 `scripts/` 迁空则删,更新 ARCHITECTURE 目录树与「库代码层」叙述。
   - verify:`pnpm test` 绿(skill 定义检查在;**产物检查已从 CI 移除**);`git grep -n "scripts/checks" -- tests/ skills/` 无残留(限定代码目录——plan、ARCHITECTURE 里的历史提及不算);`node skills/health/scripts/checker.ts .` 现在是**唯一**检 squire 产物的东西,手动跑一次确认它输出 findings(坏链接/死锚/占位符等)。

8. **核对窄化后 skill 链接检查不漏**
   - change:确认 skills/ 子树内 SKILL.md / references 的相对链接仍被 squire 自检覆盖。
   - verify:临时插坏相对链接 → `pnpm test` 应红;还原。

## Verification

- command:`pnpm test`(阶段 1 后绿、阶段 2 后仍绿)
- 脚本独立验证:`node skills/health/scripts/checker.ts . --json` 输出确定性 findings(坏 markdown 链接、死锚、占位符、文件过大等)。
- 报告形态(人工 dogfood,`/health` 跑在 squire):

```
# Health Report — <project>
范围: <全量 / docs|deps|ci / 路径>   跑了: 文档vs代码, 脚本(格式/链接/引用), 依赖  跳过: CI(无 gh remote)

## 文档 vs 代码(主)
- [Important] README 声称「用 Redux」,代码实际用 Context (conf 85) → 核对后 /persist 或 /shape fix

## 机械检查(确定性)
- [事实] docs/foo.md:12 链接 [x](./gone.md) 指向不存在的文件
- [事实] <doc>:Lx 死内部锚 #... / 占位符 TBD
- [事实] 3 个依赖落后 ≥1 major

## 下一步
- 文档漂移 → /persist;代码 bug → /shape fix;本体不改
```

- checklist(manual):
  - [ ] `/health` 跑在 squire 上,脚本命中一条故意插入的坏 markdown 链接(临时插 → 报 → 还原)
  - [ ] 无 GitHub remote 的目录跑 `/health`,CI 检查优雅跳过并标注
  - [ ] 无文档的项目跑 `/health`,跳过文档相关检查、仍输出项目本身(deps/CI/文件大小)体检,不报错也不空报
  - [ ] 模拟 node < 24(或脚本不可跑),health 标明「确定性层不可用」、退到模型层 + Bash,不报错
  - [ ] health 全程未写任何文件(`git status` 干净)
  - [ ] finding 只给 routing,未自动调 persist/shape

## Rollback

- 阶段 1 纯新增:`git revert` 即移除 health(含脚本),无人依赖。
- 阶段 2 是把产物检查迁出 CI:`git revert` 回到 checkSpecFormat 在 tests/ 的旧布局;无状态迁移。
- 两阶段各自独立 commit,可单独回退。

## Risks & Unknowns

- **主检查靠模型,可能误报/漏报**(premise #1):mitigation = confidence ≥80 + 脚本兜底确定性价值。
- **目标机需 node 24+**(premise #2):mitigation = squire engines>=24;缺失则脚本跳过、模型层 + Bash 兜底、报告标明。
- **squire 自己的产物从此不在 CI 卡**:checkSpecFormat 等迁出 tests/ 后,squire 的 specs/、文档只靠跑 `/health` 守(跟任何项目一样,行为一致)。这是接受的代价,不是 bug——`tests/` 永远只查工具、不碰产物(它会 import checker.ts,但只拿来查工具、绝不指向产物)。日后若觉得松,可在 squire 自己的 CI 单独加一步「`node skills/health/scripts/checker.ts .` 且 findings 非空即 fail」——但那是 squire-CI 在 dogfood health,不是 tests/ 检产物,语义不同,v1 不做。
- **触发词 Jaccard 撞车**:mitigation = 已避开共享 token,checkTriggerJaccard 强制裁决。
- **可擦除 TS 约束**:checker.ts 不得用 enum/namespace/参数属性,否则 node 直跑失败;verify 阶段 `node checker.ts` 实跑即暴露。
- **Unknown**:references symlink 相对层级 — owner:build 照 `skills/verify/references/` 复制,blocker:no。

## Mode-specific

### Interface boundary

- **Public**:`/health`(命令名 = 目录名)+ 可选范围收窄(类别 `docs`/`deps`/`ci` 或路径前缀)。`checker.ts` 不算公开接口——它是内部机制(agent 照 SKILL.md 调 `node checker.ts <根> [--json]`),逻辑由 `tests/` 单测。
- **Inputs**:有效 = 无参 / 已知类别词 / 项目内路径;脚本 = 一个项目根路径 + 可选 `--json`。无效类别词 = 报可用类别让用户重选。
- **Outputs**:`/health` 成功 = Health Report(文档vs代码在前 + 机械 finding + routing + 跳过项);脚本成功 = 结构化 findings(json 或文本);无文档 = 跳过文档相关检查、仍报项目本身,不空报。
- **Side effects**:无(只读)。
- **Not exposed**:自动修复、health 自身 CI gating、persist 自动触发、per-type 逻辑、运行时 npm 依赖。

### Acceptance scenarios

- Given README 声称「用 X」而代码用 Y,when `/health`,then 报告把「文档 vs 代码」不符放最前,带 confidence 与 routing。(主;→ step 3)
- Given 某 doc 引用了已删文件,when 跑 `node checker.ts <根>`,then 脚本确定性报该断引用。(→ step 2 / checklist 1)
- Given 项目无 GitHub remote,when `/health`,then CI 检查跳过并标注,不报错。(→ step 3 自适应 / checklist 2)
- Given 项目无文档,when `/health`,then 跳过文档相关检查、仍输出项目本身(deps/CI/文件大小)体检。(→ checklist 3)
- Given 目标机 node < 24,when `/health`,then 标明确定性层不可用、退模型层 + Bash,不报错。(→ premise #2 / checklist 4)
- Given `/health docs`,when 运行,then 只跑文档相关检查,依赖/CI 不跑。(→ step 3 范围收窄)
- Given 跑完体检,when 看工作区,then 无任何文件改动。(→ 只读契约 / checklist 5)
- Given 在 squire 仓 `pnpm test`,when 阶段 2 后,then `tests/` 只跑工具(skill 定义)检查、**不碰任何产物**;squire 的 specs/ 格式改由 `node skills/health/scripts/checker.ts .` / `/health` 守。(→ step 7)
