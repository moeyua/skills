---
mode: feat
title: 下一步推荐统一为「位置定模态」模型 + workflow 顺序对齐
created: 2026-06-11
status: done
---

# 下一步推荐统一为「位置定模态」模型 + workflow 顺序对齐

## Building

把「每个 skill 完成后推荐什么」从逐份手写的尾部文案,统一成一个可推导的模型:**一次变更是一张状态图,skill 是节点,推荐 = 节点的出边;节点在图里的位置决定推荐的模态**——固定(core loop 内成功边唯一)/ 判断(出边依赖本次结果)/ 默认可覆盖(跨出 loop 出口,覆盖源是项目 WORKFLOW)/ 不需要(无出边)。总规则不变:推荐永远只是建议,串联权在用户(PRODUCT 哲学 #3)。

按模型落地三件事:(1) 各 SKILL.md 尾部的下一步段按模态重写;(2) explore 归「不需要」——移除报告模板的 Where to Start 段与 deep-dive 的 follow-up entry points,报告即终点;(3) 本仓 WORKFLOW.md 的 dogfood 顺序对齐产品层——`/docs` 从 `/pr` 之后挪到 `/check` 与 `/commit` 之间。

## Not building

- 不改任何 skill 的主体行为、触发词、命令名——只动「完成后的下一步」表述与 explore 的报告结构。
- 不引入自动串联——模态只是建议的生成规则,PRODUCT #3 不动。
- 不给 doctor / handoff / pr 增加下一步推荐——它们按模型本就无出边(doctor 仅失败边,现状已符合)。
- 不把模态规则写成独立的 rules/ 文件——它是产品层设计,记入 ARCHITECTURE 决策记录与 RESOLVER Chaining 段即可,不值得一个跨 skill symlink。
- 不改 shape default mode 的收敛行为(本就是「判断」,现状已符合)。

## Approach

模型先行、逐节点套用:先在 RESOLVER 的 Chaining 段与 ARCHITECTURE 决策记录里立「位置定模态」规则,再把每个 SKILL.md 的尾部改成该节点模态的实例。这比逐份微调文案的好处是:未来新增 skill 时,下一步推荐不需要再拍——先定它在图里的位置,模态随之确定。

最小备选(被否):只改 WORKFLOW.md 的 docs 位置,推荐文案不动。否的理由:用户实际跟着各 SKILL.md 尾部的建议走,不是跟着 README 的图走;只修声明层等于只修了没人看的那份。

## Premise collapse

本方案假设「explore 完全静默(连 Where to Start 都不给)不会让 explore → shape 的衔接变差」。若实际使用中发现报告读完不知从哪下手、explore 的价值感下降,则该格模态回调为「判断」并恢复入口指引——这是单格回滚,不动摇模型本身;改动是一个主题 commit,`git revert` 即可。

次脆弱假设:机械测试不锁定报告模板的段落名。若 `pnpm test` 因移除 Where to Start 变红,说明有 check 函数断言了模板结构,需先确认该断言是否仍该存在,不得为过测试而弱化断言。

## Key decisions

1. **推荐 = 状态图出边,位置定模态** — 三类边:成功边(core loop 内,产品层硬编码)、失败边(问题类路由表,已高度一致,不动)、出口边(交付段,项目 WORKFLOW 定义,产品层只给默认值)。
2. **四种模态的分配** — explore:不需要;shape default:判断;shape named:固定(implement);implement:固定(check);check:判断(裁决选边);docs:默认可覆盖(commit);commit:默认可覆盖(pr);pr / handoff:不需要;doctor:判断(findings 路由)/ 干净时不需要。
3. **explore 连 Where to Start 都移除** — 它本质是伪装成报告段落的下一步推荐,与「不需要」模态矛盾;deep-dive 的 follow-up entry points 同性质同删(维护者 2026-06-11 确认)。
4. **`docs` 在 dogfood 链中位于 check 与 commit 之间** — 本仓门禁 checkSpecPairing 要求 spec 与 skill 同 PR 同步,把 /docs 排在 /pr 后与自家门禁矛盾;挪位后持久记忆与代码同 PR 原子合入。WORKFLOW.md 原句的括注(plan 已含文档步骤时此步常无剩余工作)保留。
5. **「默认可覆盖」的覆盖源是项目 WORKFLOW,不是用户** — 用户的覆盖权由总规则(建议而非执行)保证,不占模态;模态说的是建议内容的生成规则。
6. **shape named mode 的推荐只指一环(implement)** — 原文案一口气指了两环(implement、再 check),越位陈述了 implement 的出边;固定边一次只指下一环。

## Public surface changes

- 各 SKILL.md 完成报告的「下一步」措辞变化(agent 行为表述,非命令变化)。
- explore 报告模板:移除 `## Where to Start` 段与 deep-dive 维度清单中的 `follow-up entry points` 行;Outcome Contract 的 Done when 同步。
- WORKFLOW.md 实质变更链顺序:`/shape → /implement → /check → /docs → /commit → /pr`。
- RESOLVER.md Chaining 段、README 工作流段补「模态」一层说明。
- 无命令增删、无触发词变化。

## Spec delta

```markdown
## MODIFIED Requirements

### Requirement: 产出结构化报告

explore 必须产出含 Project Identity、Structure、Docs Inventory 的报告;用户指定范围时补 Scoped Deep-dive 节,其维度组织与覆盖范围遵循「Scoped Deep-dive 按 7 维度组织」与「深度由自然语言信号决定」两条要求。报告即 explore 的终点:不含 Where to Start 段、不含 follow-up entry points、不推荐下一步 skill——用户带着自己的目的来,理解建立完成即停。(Previously: 报告须含 Where to Start 段给 2-3 个入口建议;deep-dive 以 follow-up entry points 收尾。)
Verify: manual(integration)
```

## Implementation steps

1. **WORKFLOW.md 顺序对齐**
   - change: `WORKFLOW.md:9` 实质变更链改为 `/shape 出方案 → /implement 落地(自动开工作分支)→ /check 把关 → /docs 记录持久记忆(plan 已把文档更新列为实施步骤时,此步常无剩余工作)→ /commit → /pr 开 PR 合并`。括注随 /docs 一起挪。
   - verify: `grep -n '/docs' WORKFLOW.md` 显示 /docs 位于 /check 与 /commit 之间;`pnpm test` 绿。

2. **explore 归「不需要」**
   - change: `skills/explore/SKILL.md:25` Done when 删去「Where to Start gives 2-3 entry suggestions」;`:93` 删去「Close the deep-dive with entry-point suggestions for the follow-up work.」;`:137` 模板删去 `- follow-up entry points` 行;`:139-141` 删去 `## Where to Start` 段。
   - change: 在报告模板段附近加一句 why:报告即交付物,explore 不推荐下一步——用户带着自己的目的来,指引入口是伪装的推荐(措辞融入正文,不堆禁令,守 PRODUCT 哲学 #5)。
   - verify: `grep -ci 'where to start' skills/explore/SKILL.md` 输出 0;`pnpm test` 绿。

3. **specs/explore 合并 delta**
   - change: 按上方 Spec delta 替换 `specs/explore/spec.md` 的「产出结构化报告」requirement。
   - verify: `node skills/doctor/scripts/checker.ts . --json` 返回 `[]`;`pnpm test` 绿。

4. **固定边节点:shape named / implement**
   - change: `skills/shape/SKILL.md:135` 输出模板改为只指一环:`To implement it: say "implement this plan".`(删「After implementing, run check to gate it」——那是 implement 的出边)。
   - change: `skills/implement/SKILL.md:129` 改为 `Next: run check to gate it`;「continue to the next plan」改为单独一行的条件说明(仅当还有其他 approved plan 排队时提及),`run commit to land it` 删除——commit 是出口外的项目层边。
   - verify: `grep -n 'run commit to land it' skills/implement/SKILL.md` 无输出;`grep -n 'After implementing' skills/shape/SKILL.md` 无输出;`pnpm test` 绿。

5. **判断边节点:check**
   - change: `skills/check/SKILL.md:107-108` Recommended Next 改为裁决三分支:有 finding → 按问题类路由(Critical 先,如 `/shape fix`);干净且变更产生了值得记的持久记忆 → `/docs`;干净且无可记 → core loop 完成,交付按项目 workflow(常见 `/commit`)。
   - change: `:111` 「mark "Ready to commit/push"」改为「mark the core loop complete — delivery proceeds per the project's workflow」。
   - verify: `grep -n 'commit if clean\|Ready to commit' skills/check/SKILL.md` 无输出;`pnpm test` 绿。

6. **默认可覆盖节点:docs / commit**
   - change: `skills/docs/SKILL.md` 在 `## Boundaries` 前加一小段收尾说明:记录完成即 core loop 走完,默认建议 `/commit` 进入交付;项目 WORKFLOW 定义了不同交付流程时以其为准——这条边的定义权在项目层,docs 只给默认值。
   - change: `skills/commit/SKILL.md` 在 `## When to stop` 前加同构小段:提交完成后默认建议 `/pr`;项目流程不开 PR(如小修直进 main)时以项目 WORKFLOW 为准。
   - verify: 两文件各能 `grep -n 'WORKFLOW'` 到新增段;`pnpm test` 绿(Outcome Contract / 链接检查不破)。

7. **声明层:RESOLVER Chaining + README 工作流段**
   - change: `skills/RESOLVER.md` Chaining 段(57 行起)补一小段「位置定模态」规则:总规则(建议而非执行,用户串联)+ 四模态及各 skill 归属(决策 #2 的表),并把「Docs runs at the tail」的表述与 check 之后、commit 之前的位置对齐。
   - change: `README.md` 工作流段(46-60 行)在「每个 skill 完成后默认停下」段落补两三句:下一步建议的四种模态与一句话规则,不展开成表。
   - verify: 人读 RESOLVER Chaining 能复述四模态;`pnpm test` 绿(checkResolverConsistency 不涉及本段,确认不误伤)。

8. **ARCHITECTURE 决策记录**
   - change: `ARCHITECTURE.md` 关键设计决策记录追加「2026-06-11 下一步推荐统一为位置定模态模型」:三类边、四模态、explore 全静默、WORKFLOW dogfood 挪位的理由(checkSpecPairing 门禁矛盾),链接本 plan 文件。
   - verify: `grep -n '位置定模态' ARCHITECTURE.md` 有输出;`pnpm test` 绿(markdown links 检查过)。

## Verification

- command: `pnpm test`(单测 + 整库 smoke 全绿)
- command: `node skills/doctor/scripts/checker.ts . --json`(期望 `[]`)
- checklist (manual):
  - [ ] explore 报告模板无 Where to Start、deep-dive 无 follow-up entry points,Outcome Contract 同步
  - [ ] shape named mode 输出只指 implement 一环
  - [ ] implement 的 Next 只推荐 check,无 commit 选项
  - [ ] check 的 Recommended Next 是裁决三分支(路由 / docs / 交付按项目 workflow)
  - [ ] docs、commit 各有默认可覆盖的交付建议,注明覆盖源是项目 WORKFLOW
  - [ ] pr / handoff 无下一步推荐,doctor 仅 findings 路由(现状,确认未被误改)
  - [ ] WORKFLOW.md 链:shape → implement → check → docs → commit → pr
  - [ ] RESOLVER Chaining 与 README 工作流段含模态规则,与 ARCHITECTURE 决策记录一致

## Rollback

单主题 commit,`git revert <commit>` 整体回退。若仅 explore 静默一格被证伪(报告读完不知从哪下手),单独恢复 Where to Start 段与 spec 该条 requirement,模型其余部分不动。无外部状态、无依赖变化。

## Risks & Unknowns

- **explore 全静默降低衔接体验**:impact = 用户在 explore 后失去入口指引 / mitigation = Premise collapse 已述,单格可逆。
- **机械测试锁定模板结构**:impact = `pnpm test` 变红 / mitigation = 先查断言是否该存在,不为过测试弱化断言;步骤 2 的 verify 会暴露。
- **「默认可覆盖」被读成自动串联**:impact = 违反 PRODUCT #3 的观感 / mitigation = RESOLVER/README 的模态说明显式重申总规则;SKILL.md 措辞用「建议/suggest」不用「然后执行」。
- **README/RESOLVER 加模态层后变重**:impact = 声明层啰嗦 / mitigation = README 只加两三句,完整表只在 RESOLVER;ARCHITECTURE 承载完整 why。

## Interface boundary

- **Public API**:无——无命令增删,无 frontmatter 变化。
- **Inputs**:各 skill 触发方式不变。
- **Outputs**:各 skill 完成报告的下一步段按模态重写;explore 报告少一个段落。
- **Side effects**:无运行时副作用;纯文档/prose 变更。
- **Not exposed**:模态规则不成为独立 rules/ 文件、不进入 frontmatter、不做机械检查(行为靠 prose,约束靠 manual(integration))。

## Acceptance scenarios

- Given 用户跑 `/explore`(无 scope),when 报告产出,then 含 Project Identity / Structure / Docs Inventory,无 Where to Start、无任何下一步 skill 推荐。
- Given 用户跑 `/explore <模块>`,when deep-dive 收尾,then 七维度(或核心五维)后直接结束,无 follow-up entry points。
- Given shape named mode 写完 plan,when 输出收尾,then 只提示「say "implement this plan"」,不提 check。
- Given implement 完成且无其他 approved plan,when 报告收尾,then Next 仅 `run check to gate it`。
- Given check 全绿且变更含可记的持久记忆,when 报告 Recommended Next,then 指向 `/docs`。
- Given check 全绿且无可记内容,when 报告收尾,then 标注 core loop 完成、交付按项目 workflow,不写死 `/commit` 为唯一动作。
- Given docs 记录完成,when 收尾,then 默认建议 `/commit` 并注明项目 WORKFLOW 可覆盖。
- Given commit 完成,when 收尾,then 默认建议 `/pr` 并注明项目流程可覆盖。
- Given 阅读 WORKFLOW.md,when 查实质变更链,then 顺序为 shape → implement → check → docs → commit → pr。
- Given 跑 `pnpm test` 与 doctor checker,when 全部改动落地,then 全绿 / `[]`。
