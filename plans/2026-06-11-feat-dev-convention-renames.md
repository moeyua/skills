---
mode: feat
title: skill 命名统一到开发习惯轴(6 改 3 留)
created: 2026-06-11
status: done
---

# skill 命名统一到开发习惯轴(6 改 3 留)

## Building

把 9 个 skill 的命名统一到一条标准上:**每个 skill 名 = 开发者已有习惯里的通行叫法**(git 习惯、CLI 习惯、agent 习惯、方法论行话),让没读过文档的协作者看到命令就能猜对它干什么。6 个 rename、3 个保留,不留旧 alias:

| 现名           | 新名        | 习惯出处                                                                                  |
| :------------- | :---------- | :---------------------------------------------------------------------------------------- |
| `explore`      | `explore`   | 「explore the codebase」,agent 圈通行,不动                                                |
| `plan`         | `shape`     | Shape Up(Basecamp/Ryan Singer)的 shaping:把模糊想法捏成 rough/solved/bounded 的可开工方案 |
| `build`        | `implement` | PR/issue 里的「implement X」;build 在开发口语里指编译打包,有歧义                          |
| `verify`       | `check`     | GitHub「all checks have passed」的合并前门禁叫法;顺带消除对内置 `/verify` 的遮蔽          |
| `document`     | `docs`      | 「update the docs」,开发者对文档的高频叫法                                                |
| `commit`       | `commit`    | git 本词,不动                                                                             |
| `pull-request` | `pr`        | `gh pr` / 口语 PR;同时消灭全套唯一的连字符复合词                                          |
| `health`       | `doctor`    | `brew doctor` / `flutter doctor` / `npm doctor`,CLI 世界「项目体检」的既定名              |
| `handoff`      | `handoff`   | 设计圈/agent 圈既定术语(session handoff),不动                                             |

命名标准本身写进 ARCHITECTURE,作为以后新 skill(如 ROADMAP 的 `release`,恰好天然符合)的起名标尺。

## Not building

- 不拆分 brainstorm 为独立 skill——shape 的跨度(澄清/探索/诊断/成案)是 06-09 之前就定下的设计,本次只换名字不削跨度。
- 不保留 `/plan`、`/build`、`/verify`、`/document`、`/pull-request`、`/health` 兼容 alias(沿 06-09 breaking rename 先例)。
- 不改变任何 skill 的行为、mode 体系、spec requirement 语义——纯命名与引用同步。
- 不回改 `plans/` 下历史 plan 文件里的旧名(历史快照不回改,per WORKFLOW)。
- 不处理多 host 分发、marketplace、npm 发布。

## Approach

一次 breaking rename,完全复用 06-09(`plans/2026-06-09-feat-core-loop-workflow-renames.md`)验证过的打法:先 `git mv` skill 目录与 spec domain,再全仓替换命令名、frontmatter、路由、spec、文档与测试引用,最后跑 `pnpm test` 让机械检查(frontmatter name↔dir、RESOLVER 一致性、skill↔spec 配对、Jaccard、markdown links)兜底。

不採用「只改最别扭的 1-2 个」的渐进式:维护者明确要的是整组统一(一条标准零例外),分批改名意味着中间态长期存在两套风格,正是本次要消除的东西。

## Premise collapse

本方案假设**「开发习惯」这条命名轴是维护者别扭感的真正解,且新名在安装环境无破坏性撞名**。若装完仍觉得别扭,说明问题不在词而在别处(如分层结构),届时不应再换词,而应回 shape 重新定位问题;撞名风险已预核——本会话 Claude Code 内置/已装技能里无 `shape` / `implement` / `check` / `docs` / `pr` / `doctor`,且 Claude Code 规则是 skill > command,最坏是遮蔽不是损坏。单 commit 实施,方向错了 `git revert` 一次回滚。

## Key decisions

1. **命名轴定为「开发习惯」而非词性/音节/隐喻** — 经四方案对比(动词族/短词族/侍从隐喻族/产物名词族)后维护者裁定:统一统一在「全是熟词、零陌生感」,词性混杂(docs/pr/doctor 是名词)被显式接受。
2. **`plan -> shape`,显式推翻 06-09 的 `shape -> plan`** — 06-09 改名时已在 Risks 记录「plan 误导为只写计划文件」并赌文档说明能压住;三天实际体感证明没压住(维护者:「plan 内其实不止是 plan」)。有据回退,非反复。Shape Up 的 shaping(模糊想法→rough/solved/bounded)是唯一语义跨度 = skill 跨度的通行词,已对照 basecamp.com/shapeup 核实。
3. **`pull-request -> pr`、`document -> docs`,各自第三个名字** — propose→pull-request、persist→document 的 06-09 理由(「直接表达动作/更直觉」)在新轴下被「开发者实际嘴里的叫法」取代;承认这是对 06-09 Key decisions #4/#5 的二次修订。
4. **`build -> implement`** — 原始 13-skill demo 里它本来就叫 implement(后改 build);开发口语里 build = 编译打包,在「习惯」轴上是要被修的歧义词。
5. **`health -> doctor`** — health 名属性不名动作,doctor 是 CLI 世界项目体检的既定名(brew/flutter/npm doctor),整条轴上最无争议的收获。
6. **不拆 brainstorm** — 拆分会恢复已被否决的「意图即 skill」假设(ARCHITECTURE「为什么 plan 用 mode」),且 fix 诊断仍留在 skill 内、拆完依然「不止是 plan」;改名即可解,不动结构。
7. **命名标准入 ARCHITECTURE** — 「很难讲」的根源是规则只在维护者脑中;写下来后新 skill 起名有锚,本次讨论不必重演。

## Public surface changes

- `/plan` removed; `/shape` added。
- `/build` removed; `/implement` added。
- `/verify` removed; `/check` added(内置 `/verify` 不再被遮蔽)。
- `/document` removed; `/docs` added。
- `/pull-request` removed; `/pr` added。
- `/health` removed; `/doctor` added。
- `/explore`、`/commit`、`/handoff` 不变。
- Core loop 表述从 `explore -> plan -> build -> verify -> document` 改为 `explore -> shape -> implement -> check -> docs`;workflow-managed stages 为 `commit -> pr`;正交工具为 `doctor` / `handoff`。
- doctor 随装脚本路径:`skills/health/scripts/checker.ts` -> `skills/doctor/scripts/checker.ts`。
- README 的「/verify 遮蔽内置」冲突段删除(冲突不复存在),换为新名单与内置/常见 plugin 的共存说明。

## Spec delta

纯 rename,requirement 语义不变。两类改动:

1. **6 个 spec domain 目录改名**(`specs/{plan,build,verify,document,pull-request,health}` -> `specs/{shape,implement,check,docs,pr,doctor}`),各 spec 的标题、Purpose 与全部 requirement 文本中的 skill 自称同步替换,每条沿用 06-09 体例补 `(Previously: <旧名>执行该职责。)`。
2. **跨 spec 引用替换**:`specs/explore/spec.md`(Purpose 提及 plan/build/review)、`specs/check/spec.md`(routing 指向 plan fix / build 补覆盖 / plan refactor)、`specs/doctor/spec.md`(routing 指向 document / plan fix / plan refactor)等处的指向更新为新名。

代表性条目(其余同模式机械替换):

```markdown
## MODIFIED Requirements

### Requirement: 先澄清再出方案

shape 必须先进入 Clarify:一次问一个问题,达到「澄清够了」的门槛后才进入出方案;即便 mode 已清晰,仍要追问保留哪些接口、可接受多大风险等约束,不跳过。(Previously: plan 执行该职责。)
Verify: manual(integration)

### Requirement: 无明确 mode 线索时默认全面把关

用户消息无明确 mode 线索(含裸 `/check`)时,check 必须默认跑 review + test 两个 mode,并在改动触及用户可见行为且项目有可启动路径时加跑 e2e;被跳过的 mode 必须在报告中标明及原因。(Previously: 裸 `/verify` 触发,verify 执行该职责。)
Verify: manual(integration)

### Requirement: 照对应 format 规范写

docs 写任一记忆 artifact 必须加载并遵循 `skills/docs/references/formats/<artifact>.md` 的 Sections / Source / Boundary;按需只加载当前 target 那份。(Previously: 路径为 skills/document/references/formats,document 执行该职责。)
Verify: [checkMemoryCatalog](../../tests/checks.test.ts)
```

## Implementation steps

> scope 预警:本计划触及约 40+ 个文件(6 skill 目录 + 6 spec 目录 + 全部互引文档 + 测试),远超 8 文件门槛——但全部是机械 rename + 引用同步,由 `pnpm test` 的结构检查兜底,无逻辑改动。

1. **移动 skill 目录与 spec domain**
   - change: `git mv skills/plan skills/shape`;`git mv skills/build skills/implement`;`git mv skills/verify skills/check`;`git mv skills/document skills/docs`;`git mv skills/pull-request skills/pr`;`git mv skills/health skills/doctor`;specs/ 下同样 6 个 `git mv`。
   - verify: `rg --files skills specs | rg '^(skills/(shape|implement|check|docs|pr|doctor)/SKILL.md|specs/(shape|implement|check|docs|pr|doctor)/spec.md)$'` 见 12 个文件;旧路径无。

2. **更新 6 个 renamed skill 的 frontmatter 与正文自称**
   - change: 各 SKILL.md 的 `name` 改为新目录名(frontmatter name↔dir 检查强制);description / when_to_use / dispatch_intent 里的自然语言触发词保留中文关键词(想想/出方案/验证/把关/提交/体检/交接等),不放 `/<name>` 字符串(per ARCHITECTURE);正文 self-reference 与跨 skill 指向(如 check 指 `shape fix` / `implement 补覆盖`,explore 指 `/shape` `/implement`)全部替换。`skills/shape/references/mode-*.md`、`plan-template.md` 中的旧名同步(模板写入路径 `plans/YYYY-MM-DD-<slug>.md` 不变)。
   - verify: `pnpm test` 的 frontmatter / description / references 检查通过。

3. **更新 rules/ 与 formats 引用**
   - change: `rules/memory-catalog.md` 头部「explore 读 / document 写 / health 查」改为 explore / docs / doctor;`rules/anti-patterns.md`、`rules/durable-context.md` 如有旧名引用同步。symlink 本身随目录 `git mv` 跟移,逐一确认 `skills/{shape,implement,check,docs,pr,doctor}/references/` 下的 symlink 解析正常。
   - verify: `ls -L skills/*/references/*.md` 无 broken link;`rg -n '\bdocument 写|health 查' rules/` 无输出。

4. **更新 RESOLVER 路由**
   - change: `skills/RESOLVER.md` 三段的 skill 路径与触发词换新名;Chaining 段 core loop 图改 `explore → shape → implement → check → docs`,stages 改 `commit → pr`,正交工具 doctor / handoff。
   - verify: `checkResolverConsistency` 通过;`rg -n 'skills/(plan|build|verify|document|pull-request|health)/SKILL.md' skills/RESOLVER.md` 无输出。

5. **重排 README / PRODUCT / ARCHITECTURE / WORKFLOW / ROADMAP**
   - change: README skill 表、工作流图、安装段触发命令列表换新名;删除「/verify 遮蔽内置」冲突段,替换为:新名单经核无内置同名命令,skill > command 规则下最坏为遮蔽。
   - change: ARCHITECTURE 目录树、七层职责、典型工作流、安装机制示例(优先级表的 /verify 例子换掉)、plan mode 系统标题词换 shape;新增「2026-06-11 命名统一到开发习惯轴」决策记录:命名标准 + 对 06-09 Key decisions #3/#4/#5 的显式修订;历史决策记录段落保留旧名不回改。
   - change: PRODUCT 哲学 #2 等处的 skill 名替换(explore/plan/build/verify/document/commit/pull-request/health/handoff -> 新名);历史修订注记保留旧名。
   - change: WORKFLOW 流程阶段的 `/plan → /build → /verify → /commit → /pull-request → /document` 改新名;命令表 `node skills/health/scripts/checker.ts` 改 `skills/doctor/scripts/checker.ts`。
   - change: ROADMAP 中「document 的 DESIGN 目标」「document 的自动漂移同步」「health 已落地」等条目的 skill 名更新(条目语义不变)。
   - verify: `rg -n "/plan|/build|/verify|/document|/pull-request|/health" README.md PRODUCT.md ARCHITECTURE.md WORKFLOW.md ROADMAP.md` 仅剩历史决策/修订注记中的旧名;`pnpm test` markdown link 检查通过。

6. **更新 specs 内容**
   - change: 按 Spec delta 段执行:6 个 renamed spec 的标题/Purpose/requirement 主语替换并补 `(Previously: ...)`;explore spec 与跨 spec routing 引用更新;`specs/docs/spec.md` 中 formats 路径改 `skills/docs/references/formats/`。
   - verify: `node skills/doctor/scripts/checker.ts . --json` 不报 spec format 问题。

7. **更新测试与机械检查**
   - change: `tests/checks.test.ts`、`tests/memory-catalog.test.ts`、`tests/smoke/verify-skills.test.ts`、`tests/checker.test.ts` 中硬编码的 skill 名、路径(如 skills/document/references/formats)、fixture、resolver 断言同步;`tests/checks.ts` 如有内置名单(skill 数、配对表)同步。
   - change: 若新名触发词 Jaccard ≥ 0.5(如 check 与 doctor 的检查类关键词),收敛各自 when_to_use:check 持「验证/把关/跑测试/合并前」,doctor 持「体检/审计/漂移/陈旧」。
   - verify: `pnpm test` 全绿。

8. **全仓残留扫描**
   - change: 处理以上未覆盖的零散引用(`.vite-hooks/pre-commit`、`package.json`、`vite.config.ts`、`tsconfig.json` 如有)。
   - verify: `rg -n "skills/(plan|build|verify|document|pull-request|health)|specs/(plan|build|verify|document|pull-request|health)" --glob '!plans/**' .` 无输出(plans/ 历史文件豁免);ARCHITECTURE/PRODUCT 历史注记中的旧名以词形出现可豁免,路径形式不可。

## Verification

- command: `pnpm test`
- command: `node skills/doctor/scripts/checker.ts . --json`(期望 `[]`)
- command: `npx skills add . -g -a claude-code -y` 后确认 `/shape` `/implement` `/check` `/docs` `/pr` `/doctor` 可触发,旧命令不可
- checklist (manual):
  - [ ] README 第一屏 core loop 显示 `explore → shape → implement → check → docs`
  - [ ] `/plan` `/build` `/verify` `/document` `/pull-request` `/health` 不再作为当前命令出现在任何当前态文档
  - [ ] ARCHITECTURE 含命名标准与对 06-09 的显式修订记录
  - [ ] 内置 `/verify` 在卸载旧 squire verify 后恢复可用
  - [ ] plans/ 历史文件未被回改

## Rollback

单主题 commit(或同分支少量主题 commit)实施;方向错误时 `git revert` 对应 commit 即回到旧命名与旧文档模型。无数据迁移、无新依赖、无 alias,回滚仅涉及路径与文本。已装快照需重跑 `npx skills add . -g` 才更新(装的是安装时快照),回滚后同理。

## Risks & Unknowns

- **Breaking rename,肌肉记忆与既有引用失效**:维护者自己的手熟 + 本机已装快照仍是旧名。mitigation = 合并后立即重跑 `npx skills add . -g -a claude-code -y`;README/commit message 明示 breaking。
- **`docs` 语义双关**(skill 名 vs 文档目录惯例):squire 无 `docs/` 目录,仓内无冲突;消费项目里 `/docs` 是命令不是路径,实际无碰撞面。impact 低。
- **`pr` 过短带来的误触发**:auto-routing 靠 description 不靠名字,manual `/pr` 正是 `gh pr` 手感。impact 低。
- **再次 rename 的信誉成本**:三周内第二轮 breaking rename。mitigation = 命名标准这次落进 ARCHITECTURE,后续起名有锚,不再凭感觉重开。
- **Unknown**:维护者其他机器/agent 上是否有同名 personal skill(如自装的 /docs)——owner: 维护者,blocker: no(装时即见,遮蔽可逆)。

## Interface boundary

- **Public commands**:`/explore`, `/shape`, `/implement`, `/check`, `/docs`, `/commit`, `/pr`, `/doctor`, `/handoff`。
- **Removed commands**:`/plan`, `/build`, `/verify`, `/document`, `/pull-request`, `/health`;无 alias。
- **Inputs / Outputs / Side effects**:与各 renamed skill 完全相同——shape named mode 仍写 `plans/YYYY-MM-DD-<slug>.md`(plans/ 目录名不变);docs 仍默认写 catalog artifact;pr 仍 push + `gh pr create`;doctor 仍跑随装 checker;无新增外部副作用。
- **Not exposed**:旧命令 alias、brainstorm 独立 skill、行为变更、GitLab MR、发布流程。

## Acceptance scenarios

- Given 用户输入 `/shape 想做个 X`,when agent 路由 skill,then 加载 `skills/shape/SKILL.md`,执行原 plan 的 clarify / mode picker / 出方案行为,named mode 仍写入 `plans/`。
- Given 已批准的 plan,when 用户输入 `/implement`,then 加载 `skills/implement/SKILL.md` 执行原 build 行为(含自动开工作分支)。
- Given 改动待合并,when 用户输入裸 `/check`,then 默认跑 review + test(适用时加 e2e),行为同原裸 `/verify`。
- Given 一次已落地的变更,when 用户输入 `/docs 记录这次变更`,then 默认按 memory catalog 写对应 artifact。
- Given 当前分支已提交,when 用户输入 `/pr`,then push + 开 PR,正文含 Test plan。
- Given 任意使用 squire 的项目,when 用户输入 `/doctor`,then 跑 `skills/doctor/scripts/checker.ts` + 文档↔代码漂移审计,只读报告。
- Given 阅读 README / RESOLVER,when 查任一旧命令(`/plan` 等),then 不再作为当前命令出现。
- Given squire 装好后,when 用户输入 Claude Code 内置 `/verify`,then 不再被 squire 遮蔽。
