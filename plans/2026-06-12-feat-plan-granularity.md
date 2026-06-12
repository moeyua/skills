---
mode: feat
title: plan 粒度定为决策级 — 行级定位与措辞移交 implement
created: 2026-06-12
status: done
---

# plan 粒度定为决策级 — 行级定位与措辞移交 implement

## Building

把 shape 产出的 plan 从「行号级 edit 清单」收回到「决策级方案」:切分线按**决策类型**画,不按详细程度画——改意图的决定(做什么、不做什么、接口边界、验收场景、spec delta、关键取舍)全留 shape;不改意图的机械决定(具体哪一行、替换成什么措辞、改动的微观顺序)移交 implement。步骤的标准形态变为**结果描述 + 触及范围(路径级)+ verify 命令**,per-step verify 保留——它才是「步骤可独立验证」的承载者,行号不是。

裁决 ROADMAP「shape 目前的计划是否过于细节,是否考虑将一部分工作移至 implement」一条:是,移交的就是上述机械决策层。

## Not building

- 不动意图层段落——Building / Not building / Approach / Premise collapse / Key decisions / Interface boundary / Spec delta / Acceptance scenarios 的深度要求一概不降。
- 不松「无占位」红线——`TBD` / `TODO` / `similar to step N` 仍是红旗,只把红线限定为意图层(「接口长什么样 TBD」是红旗,「具体改哪行由 implement 定位」不是)。
- 不动 fix mode 的 Root cause `file:line` 要求——那是诊断证据(根因在哪),不是 edit 指令(去哪改),性质不同。
- 不回改 `plans/` 既有文件——它们是历史快照(per WORKFLOW),新粒度只约束今后的 plan。
- 不改 README——它不陈述步骤粒度,无同步点。
- 不改 implement 的 preflight 漂移检测——它 grep 的本就是路径与函数名,与新粒度天然兼容。
- 不引入机械检查(不在 checks.ts 加 plan 格式断言)——plan 是 agent 行为产物,靠 prose 约束,与各 skill 现状一致。

## Approach

从总纲改起、逐层对齐:先把 shape SKILL.md 的「every step executable without further decisions」限定为意图决策,再把 plan-template 的步骤格式改成三要素形态,最后在 implement SKILL.md 写明「承接机械决策是本职,不是偏离」。这比只改模板的好处是:行号化的根源是总纲没切分决策类型,模板的 `or description` 本来就允许粗粒度——只修模板等于没修根源。

本 plan 自身按新粒度书写(步骤无行号、无预写最终措辞),即新规则的第一次 dogfood。

最小备选(被否):只在 plan-template 加一句「鼓励 description 优先于 file:line」。否的理由:鼓励性措辞改不动顶格实践,总纲的「without further decisions」仍会把粒度推回行号级;且 implement 侧不写明承接,粗粒度步骤会被它当作方案不完整弹回 shape。

## Premise collapse

本方案假设「implement(LLM agent)拿到结果描述 + 路径级范围 + verify,能稳定做对行级定位与措辞,不借机重开意图决策」。若实践中 implement 开始自由发挥(deviation 增多、check 的 plan-consistency finding 增多),粒度回调——恢复模板中 file:line 的首选位即可,单主题 commit 可整体 revert,切分线本身(意图 vs 机械)不动摇。

次脆弱假设:机械测试不锁定被改文件的具体措辞。若 `pnpm test` 因措辞调整变红,先确认断言是否仍该存在,不为过测试弱化断言。

## Key decisions

1. **切分线按决策类型,不按详细程度** — 「这个决定改不改意图」可判定、可向 implement 的契约对齐(它本就禁止重开意图决策);「写多细」不可判定,只会来回拉扯。
2. **per-step verify 保留为硬要求** — 步骤可独立验证的承载者是 verify 命令;去行号化不等于去验证化。
3. **行号与预写措辞是 plan 里腐烂最快的内容** — plan 与 code 之间隔任何一次改动,行号即失效;implement preflight 真正 grep 的是路径与函数名,粗粒度下照样成立。
4. **Shape Up 命名自洽** — README 明言 shape 取自 Shape Up 的 shaping(rough / solved / bounded);决策级粒度回到 rough 的本意,行号级 plan 与命名出处相悖。
5. **implement 侧必须同步写明承接** — 只改 shape 侧,粗粒度步骤会被 implement 当作「方案不完整」弹回,形成新的来回;两侧同 PR 原子改。
6. **fix 的 Root cause file:line 保留** — 诊断证据与 edit 指令分属两类:前者是 shape 的产出(根因定位本身就是意图层工作),后者才是移交项。

## Public surface changes

- plan 文件的 Implementation steps 形态变化:今后的步骤为「结果 + 路径级范围 + verify」,无行号、无预写最终措辞(对 implement 的输入契约变化)。
- shape / implement 两份 SKILL.md 的契约表述变化(agent 行为表述,无命令、frontmatter、触发词变化)。
- ROADMAP 少一条待议项。

## Spec delta

```markdown
## MODIFIED Requirements (specs/shape/spec.md)

### Requirement: named mode 产出可执行方案文件

named mode 必须把方案写入 `plans/YYYY-MM-DD-<slug>.md`,每一步以「结果描述 + 触及范围(路径级)+ verify」表述,意图层完整、不留占位(TBD / TODO / 待定都是红旗),但不预写行级定位与最终措辞——那是 implement 的机械决策;default mode 必须不写方案文件,只给方向/选项对比。(Previously: 每一步可执行、不留占位,未区分意图决策与机械决策,实践中步骤常顶格写到 file:line 与预写措辞。)
Verify: manual(integration)

## ADDED Requirements (specs/implement/spec.md)

### Requirement: 承接不改意图的机械决策

implement 必须自行完成方案步骤内不改意图的机械决策——行级定位、具体措辞、改动的微观顺序——不把它们的缺席当作方案不完整而弹回;每步动手前必须先读该步 scope 内文件完成定位,定位是该步的第一个动作。步骤的 scope 路径是意图层声明:结果要求触及 scope 外文件时视为方案漂移,与意图层歧义、路径错、函数缺、假设不成立同等处置——停下回 shape,不自行裁决意图。
Verify: manual(integration)
```

## Implementation steps

1. **shape SKILL.md:总纲限定为意图决策**
   - outcome: Outcome Contract 的 Done when 与开篇对 plan 完成度的表述,从「无需进一步决策」收窄为「无需进一步**意图**决策」;在 Phase 4 红旗附近用一两句说明决策类型切分线(改意图的留 shape、机械定位与措辞归 implement),措辞融入正文、解释 why,守 PRODUCT 哲学 #5。
   - scope: `skills/shape/SKILL.md`
   - verify: 通读后「executable without further decisions」不再无限定地出现;`pnpm test` 绿。

2. **plan-template:步骤格式改为三要素**
   - outcome: Implementation steps 段的步骤格式从 `change: <file:line or description>` 改为「outcome + scope(路径级)+ verify」三要素;补一段 why(行号与预写措辞是 plan 中腐烂最快的内容,且属 implement 的机械决策);「Each step must」清单保留无占位与可独立验证两条,前者限定为意图层。
   - scope: `skills/shape/references/plan-template.md`
   - verify: 模板步骤示例中无 `file:line` 首选位;`pnpm test` 绿(references 路径与链接检查不破)。

3. **implement SKILL.md:写明承接机械决策 + 定位纪律 + scope 边界**
   - outcome: 在开篇或 Standard flow 入口处写明三件事——(a) plan 给的是决策级结果,行级定位、具体措辞、微观顺序是 implement 的本职而非偏离,不因此弹回 shape;(b) 定位纪律:每步动手前先读该步 scope 内文件完成定位,定位是该步的第一个显式动作(preflight 的全局扫描不替代它);(c) scope 边界:步骤的 scope 路径是意图层声明,结果要求改 scope 外文件即漂移信号,与 When to stop 的 plan-drift 条款同等处置——停下回 shape,不把它当可自行拍板的机械决策。
   - scope: `skills/implement/SKILL.md`
   - verify: 人读该段能区分「机械决策自己做」「定位先于编辑」「scope 外即漂移回 shape」三种处置;`pnpm test` 绿。

4. **specs 合并 delta**
   - outcome: 按上方 Spec delta,MODIFIED 替换 specs/shape 的「named mode 产出可执行方案文件」,ADDED 追加 specs/implement 的「承接不改意图的机械决策」。
   - scope: `specs/shape/spec.md`、`specs/implement/spec.md`
   - verify: `node skills/doctor/scripts/checker.ts . --json` 返回 `[]`;`pnpm test` 绿(checkSpecPairing 过)。

5. **ROADMAP:清掉已裁决项**
   - outcome: 「shape 目前的计划是否过于细节,是否考虑将一部分工作移至 implement」一条移除(本 plan 即其裁决);arch mode 一条保留不动。
   - scope: `ROADMAP.md`
   - verify: ROADMAP 中无该待议项;`pnpm test` 绿。

6. **ARCHITECTURE:决策记录**
   - outcome: 关键设计决策记录追加「2026-06-12 plan 粒度定为决策级」:切分线(意图决策 vs 机械决策)、保留项(per-step verify、fix 的 Root cause file:line)、行号腐烂与双倍阅读的成本、Shape Up 命名自洽,链接本 plan 文件。
   - scope: `ARCHITECTURE.md`
   - verify: 决策记录含该条且链接可解析;`pnpm test` 绿(markdown links 检查过)。

## Verification

- command: `pnpm test`(单测 + 整库 smoke 全绿)
- command: `node skills/doctor/scripts/checker.ts . --json`(期望 `[]`)
- checklist (manual):
  - [ ] shape 的 Done when 限定为意图决策,Phase 4 附近有切分线说明
  - [ ] plan-template 步骤为三要素形态,无 file:line 首选位,无占位红线保留且限定意图层
  - [ ] implement 写明承接机械决策、每步定位先于编辑、scope 外即漂移回 shape
  - [ ] 两份 spec 与 SKILL.md 表述一致(同 PR 原子合入)
  - [ ] fix mode 的 Root cause file:line 未被误改
  - [ ] ROADMAP 仅剩 arch mode 一条 shape 议题
  - [ ] 既有 plans/ 文件零改动

## Rollback

单主题 commit,`git revert <commit>` 整体回退。若仅 implement 承接被证伪(粗粒度步骤导致自由发挥),恢复模板 file:line 首选位与 shape 总纲原句即可,意图/机械切分线的决策记录保留作存档。无外部状态、无依赖变化。

## Risks & Unknowns

- **implement 借粗粒度重开意图**:impact = scope creep 回潮 / mitigation = per-step verify 仍硬性、implement 契约的「不重开意图决策」原句不动,Premise collapse 已述回调路径。
- **粗粒度步骤的 verify 变难写**:impact = verify 退化成「人读一遍」 / mitigation = verify 写不出具体命令或检查点的步骤,多半意图层没想透——这是信号,回 shape 补,不是降低 verify 要求的理由。
- **既有 dogfood 习惯惯性**:impact = 后续 plan 仍顶格写行号 / mitigation = 模板示例本身就是新形态,本 plan 是首个范本。

## Interface boundary

- **Public API**:无——无命令增删、无 frontmatter 变化、无触发词变化。
- **Inputs**:shape / implement 的触发方式不变。
- **Outputs**:plan 文件的 Implementation steps 形态变化(三要素);shape / implement 的 SKILL.md 契约表述变化。
- **Side effects**:无运行时副作用;纯 prose / spec 变更。
- **Not exposed**:不新增机械检查、不进 frontmatter、不成为独立 rules/ 文件——粒度规则住在 plan-template 与两份 SKILL.md,ARCHITECTURE 承载 why。

## Acceptance scenarios

- Given shape named mode 出 plan,when 写 Implementation steps,then 每步为「结果 + 路径级范围 + verify」,无行号定位、无预写最终措辞,意图层无占位。
- Given implement 拿到三要素步骤,when 执行某步,then 先读该步 scope 内文件完成定位再编辑,行级定位与措辞自行完成,不视为 deviation、不弹回 shape。
- Given implement 发现路径错 / 函数缺 / 意图两读,when 执行中,then 仍停下回 shape,不自行裁决。
- Given 某步的结果要求触及 scope 外文件,when implement 定位时发现,then 视为方案漂移停下回 shape,不当作机械决策自行扩界。
- Given shape fix mode 出 plan,when 写 Root cause,then 仍精确到 file:line(诊断证据不受本次变更影响)。
- Given 阅读 ROADMAP,when 查 shape 议题,then 仅剩 arch mode 一条。
- Given 跑 `pnpm test` 与 doctor checker,when 全部改动落地,then 全绿 / `[]`。
