---
mode: fix
title: 计划在实现随交付落地时即为 done，去掉合并后的独立验收门槛
created: 2026-10-08
status: done
issue: https://github.com/moeyua/skills/issues/61
---

# 计划在实现随交付落地时即为 done，去掉合并后的独立验收门槛

## Building

让本地计划的 `done` 回到常识含义：计划描述的实现已经完成，并随同一交付（同一个 PR）落地。Implement 在实现完成、项目要求的自动化验证通过后，在工作区把关联计划标为 `done` 并写入 `## Assurance`，与代码改动并存；Publish 把计划文件作为本次交付的相关路径，与代码一起提交、进入同一个 PR。全程不需要任何合并后的步骤。

计划状态精简为 `draft → approved → done`，删除 `candidate` 状态及其转换。独立 Verify 变为可选：用户要求时在全新上下文中执行，结果记录进 Assurance，不再控制 `done`。plan、implement、verify、publish 以及读取计划状态的 handoff、review、release、RESOLVER 文本，连同对应 specs、测试和项目文档一起对齐，仓库中不再有任何地方把 `done` 与独立验收、attestation 或 `candidate` 绑定。

## Not building

- 不引入合并 hook、机器人提交、CI 回写或任何合并后修改计划状态的流程。
- 不新增状态、Assurance 字段或流程；只删除和改写。
- 不回写已有计划文件（包括本仓库 `plans/` 中 `status: candidate` 的历史计划），遗留状态只按新规则解读。
- 不改动 doctor（它不读取计划状态），不改动 Plan 的 Issue 批次事务、Release 的候选发布集合、Design 的候选方向——这些地方的 “candidate” 与计划状态无关。
- 不改变“`done` 不会被静默重放或重开”这条既有规则，不改变 Review/Verify 只读、finding 不产生修复授权等无关规则。
- 本计划的生成与审计不授权实施、提交、推送或开 PR。

## Key decisions

用户已定（不重新讨论）：

1. `done` = 计划描述的实现已完成并随同一交付（同一个 PR）落地，不再需要合并后的正式验收。
2. 验收证据（测试、CI、Review、Verify 结果、已知限制）仍记录在 `## Assurance` 中，作为记录而非门槛。
3. 实机、真实系统 UI、平台门禁等无法自动化的观察只写进已知限制，绝不阻断 `done`。
4. 跨平台证据以 PR CI 为准，不得建议在不同机器之间迁移 session 来做验证。
5. 不引入合并 hook、机器人提交或任何合并后修改状态的流程。

用户授权 Agent 决定、并在 Design Summary 中确认的选择：

6. **范围包括 specs、测试和项目文档。** `tests/attestation.test.ts` 直接解析生命周期表与 Assurance 字段，`specs/*/spec.md`、`PRODUCT.md`、`ARCHITECTURE.md`、README 都写有旧语义；只改 skill 会让测试失败、契约自相矛盾。
7. **Assurance 精简为两项**：`Evidence and limitations`（实际测试、PR CI 作为跨平台证据来源、Review 结果、已知限制）与 `Verify`（可选独立 Verify 的出处与 verdict，未运行写 `not run`）。删除 `Candidate basis`、`Candidate producer`、`Acceptance` 三个字段，以及“排除计划自身状态的确定性 diff 标识”要求。
8. **PR CI 时序。** `done` 写入 PR 时 CI 尚未运行；Assurance 只写明跨平台证据以 PR CI 为准，不要求 CI 结束后再补提交。CI 失败在同一个 PR 内修复，合并由 CI 本身拦截，状态不回退。
9. **可选 Verify 的 findings。** 合并前若可选 Verify 给出 findings 且用户授权在同一 PR 内修复，修复后由 Implement 更新 Assurance，状态保持 `done`；不新增 `done → approved` 转换。
10. **独立 Verify 的报告。** `verify/references/acceptance.md` 保留为“用户要求时的独立 Verify”协议：全新上下文、不带实现历史（全新子 agent 即满足），报告范围、证据与恰好一个 verdict。删除 `attested for the exact current candidate` / `not established` 这一对 acceptance 字段与“投影到 done”的规则；`acceptance-pass` 一词从 skill、specs 和项目文档中删除，只剩测试里断言其不存在的字面量与 `plans/` 下的历史计划。
11. **遗留解读（只读解读，不回写）。** 遗留 `approved` 或 `candidate` 计划，若对应实现已合并（git 历史或已合并 PR 可证；关联 Issue 仅在被已合并 PR 以 completed 关闭时才算证据，以 not planned / duplicate 关闭的不算），按 `done` 解读；未合并的 `candidate` 按 `approved` 解读；任何 `done` 不因缺少验收记录被判为未完成。
12. PRODUCT 中通用的 Attestation 约束（谁有资格产出哪类结论、不得伪造上游授权）保留，只删除它与计划 `done`、candidate、legacy done 的绑定。

## Root cause

[plan-template.md:71-118](../skills/engineering/plan/references/plan-template.md) 与 [plan/SKILL.md:50](../skills/engineering/plan/SKILL.md) 规定 `done` 只能由 `acceptance-pass` 行产生——一次独立 Verify 对“排除计划自身状态的稳定 candidate basis”给出 `pass` + `attested for the exact current candidate`；而 [implement/references/assurance.md](../skills/engineering/implement/references/assurance.md) 让 Implement 在实现完成后只把计划标为 `candidate` 并停下。由于这次 Verify 在实际项目中只会在合并之后、由另一次显式请求触发，且状态存放在仓库文件里，标 `done` 必须再开一个 PR；加上 [verify/references/acceptance.md](../skills/engineering/verify/references/acceptance.md) 要求“充分证据”才可 attest，实机/平台观察便成为阻断项。这一条门槛解释了全部症状：已交付计划停在 `candidate`/`approved`、改状态需要额外 PR、实机观察阻断 `done` 并诱发“跨机器迁移 session”的建议、`done` 偏离常识含义。同一规则被 publish、handoff、review、release 的 SKILL 文本、7 份 specs、`PRODUCT.md`、`ARCHITECTURE.md` 与 `tests/attestation.test.ts` 复述和固化。

## Implementation steps

1. 改写 plan 的生命周期规则
   - outcome: `plan-template.md` 的 “Naming and status” 只定义 `draft`、`approved`、`done`；“Lifecycle transition matrix” 只剩三行——`plan-created`（Plan，none → `draft`）、`implementation-authorized`（显式用户请求或 Implement 当前授权范围，`draft` → `approved`）、`implementation-delivered`（Implement：实现完成且项目要求的自动化验证通过，计划改动与代码并存并由 Publish 随同一个 PR 交付，`approved` → `done`），表头不再含 verdict/acceptance 列；“Legacy status interpretation” 按决策 11 改写；“Recorded assurance snapshot” 按决策 7、8 只含 `Evidence and limitations` 与 `Verify` 两个字段，并写明实机/平台观察只进已知限制、不阻断 `done`、跨平台以 PR CI 为准、不跨机器迁移 session；删除 basis 唯一性、current acceptance、globally latest validity 等段落。`plan/SKILL.md:50` 改为同一三态语义；`audit.md:17,21` 删除 candidate/Assurance 字段与 “never grants … candidate, accepted or done” 中的 candidate/accepted 表述，保留“规划审计不授予 `approved` 或 `done`”。
   - scope: `skills/engineering/plan/SKILL.md`、`skills/engineering/plan/references/plan-template.md`、`skills/engineering/plan/references/audit.md`
   - verify: `grep -nE "candidate|acceptance-pass|attested|not established|Acceptance" skills/engineering/plan/SKILL.md skills/engineering/plan/references/{plan-template,audit}.md` 只剩与计划状态无关的命中（例如 Issue “create candidate”）

2. 改写 implement 的计划维护规则
   - outcome: `assurance.md` 改为“维护关联计划”：显式实现授权在首次实现编辑前把 `draft` 改为 `approved`；实现完成且项目要求的自动化验证通过后，在工作区把计划标为 `done` 并替换唯一的 `## Assurance`，与代码改动并存（Implement 本身仍不提交，由 Publish 一并交付）；可选独立 Verify 仅在用户要求时于全新上下文运行，按 `verify/references/acceptance.md` 执行，结果记入 Assurance，不控制 `done`；按决策 9 处理合并前的 findings；保留“`done` 不被静默重放或重开”。`implement/SKILL.md:18,32,34,42` 删除 formal acceptance、candidate、self-attest 等与 `done` 绑定的表述，保留“full-history fork 不构成独立上下文”作为可选 Verify 的独立性说明。
   - scope: `skills/engineering/implement/SKILL.md`、`skills/engineering/implement/references/assurance.md`
   - verify: 对两文件 grep `candidate|attested|acceptance-pass|not established|formal acceptance` 无命中；`assurance.md` 仍引用 `../../verify/references/acceptance.md`

3. 改写 verify 的独立验收协议
   - outcome: `verify/SKILL.md` 的 description 与第 20、30 行改为“用户要求独立验证时读取 `references/acceptance.md`”，删除 “`accepted` or `done`” 触发与 “scoped pass cannot produce done”；`acceptance.md` 按决策 10 改为可选独立 Verify 协议，删除 acceptance 字段对、`done` 投影、basis 匹配/最新适用结果等规则，并写明 Verify 不修改计划、结果由 Implement 记入 Assurance。
   - scope: `skills/engineering/verify/SKILL.md`、`skills/engineering/verify/references/acceptance.md`
   - verify: 对两文件 grep `candidate|attested|acceptance-pass|not established|accepted` 无命中；`done` 只出现在“不修改计划、不控制 `done`”的表述中

4. 对齐 publish、handoff、review、release
   - outcome: `publish/SKILL.md:20` 删除 “publishing a candidate … independent acceptance”、legacy done、Verify pair 与 basis 匹配要求，只保留 Publish 只证明 commit/push/PR 状态、不代替实现证据，并补一句边界澄清：已关联计划的状态与 Assurance 改动属于本次交付的相关路径（对应 `publish/references/git-state.md:9` 的 “stage only explicit relevant paths”），与代码一起提交、进入同一个 PR；`handoff/SKILL.md:16,22` 改为保留已完成工作、计划状态、Assurance 中的证据与已知限制及待办，删除 candidate basis、attestation pair、legacy done 表述；`review/SKILL.md:3,38` 删除 “formal implementation acceptance”、“establishes an implementation candidate”、“accepted”，保留 Review 不产生 `done`；`release/SKILL.md:32` 删除 acceptance pair 相关句，保留 Release 只证明发布状态。Release 中候选发布集合的 “candidate” 不动。`skills/RESOLVER.md:30` 的 “Only formal Verify acceptance requires its complete independent attestation.” 改为独立 Verify 仅在用户要求时运行。
   - scope: `skills/engineering/publish/SKILL.md`、`skills/productivity/handoff/SKILL.md`、`skills/engineering/review/SKILL.md`、`skills/engineering/release/SKILL.md`、`skills/RESOLVER.md`
   - verify: 对五文件 grep `attested|acceptance-pass|independent acceptance|formal acceptance|legacy .done` 无命中；release 的 “candidate basis tip” 仍在

5. 对齐 specs
   - outcome: 按下方 Spec delta 修改 7 份 specs，`specs/plan/spec.md` 的生命周期 Requirement 改为三态，`specs/verify/spec.md` 的 “accepted 和 done 需要独立 Verify attestation” 改为可选独立 Verify，`specs/implement/spec.md` 的 “Implement 产生 candidate 而不自我验收” 改为 Implement 随交付标 `done`，第 39-41 行 “自主组合验证、独立验收与持久 truth” 中“正式验收 claim 或权威项目契约要求 accepted/done 时才加载完整独立验收协议”改为用户要求独立验证时才加载；`specs/verify/spec.md:29-31` 的 “验收结果由 caller 按依据机械投影” 整条删除；Requirement 的 `Verify:` 链接保持指向仍存在的测试。
   - scope: `specs/{plan,implement,verify,publish,handoff,review,release}/spec.md`
   - verify: `grep -nE "candidate|attested|acceptance-pass|accepted" specs/{plan,implement,verify,publish,handoff,review}/spec.md` 只剩 Issue 批次 “create candidate”；`specs/release/spec.md` 仅剩发布候选相关命中

6. 对齐项目文档
   - outcome: `PRODUCT.md:30,36,56` 按决策 12 删除计划 `done`/candidate/legacy done 与独立验收的绑定，说明独立 Verify 可选且结果仅作记录；`ARCHITECTURE.md` 的职责表（Implement、Verify、Publish、Release、Handoff 行）、composition 段末两句、reference topology 中 Implement/Verify 条目、artifact/state 表中 candidate 与 formal attestation 行、第 192-201 行的计划生命周期 ASCII 状态图（改为 `draft → approved → done` 两条转换）、第 203-207 行关于 Assurance 投影、current acceptance oracle 与 legacy `done` 的段落改为新语义；按 ARCHITECTURE 的惯例在历史决策段顶部新增 `2026-10-08` 条目，说明 `done` 改为随交付落地、独立 Verify 改为可选及原因；已有带日期的历史决策（263 行起）保留原术语不改；`README.md:27,69,86`、`README.zh-CN.md:27,69,86`、`skills/engineering/README.md:13` 的 “formal acceptance when requested” 改为“独立验证（用户要求时）”。
   - scope: `PRODUCT.md`、`ARCHITECTURE.md`、`README.md`、`README.zh-CN.md`、`skills/engineering/README.md`
   - verify: 对这些文件 grep `candidate|attested|acceptance-pass|formal acceptance|independent acceptance|正式验收|独立验收`，除 `ARCHITECTURE.md` 中 2026-10-08 之前的历史决策条目外无命中

7. 重写回归测试
   - outcome: 见 Regression tests；`tests/implement.test.ts:45` 的 “done … not replay/reopen” 断言保持通过。
   - scope: `tests/attestation.test.ts`（必要时连同 `tests/implement.test.ts`）
   - verify: `pnpm test`

8. 全仓一致性检查与示例走查
   - outcome: 完成标准逐条满足（见 Verification）。
   - scope: 全仓只读检查
   - verify: 见 Verification

## Regression tests

均为 `tests/attestation.test.ts` 中的改写测试，对当前（旧）文本运行必须失败，修复后通过：

- `defines the exact authorized lifecycle transitions`：解析 plan-template 的 “Lifecycle transition matrix”，断言恰好三行 `plan-created`（none → draft）、`implementation-authorized`（draft → approved）、`implementation-delivered`（approved → done，authority 为 Implement），且表中不出现 `candidate`。当前模板有 7 行、含 `candidate` 与 `acceptance-pass`，会失败。
- `persists one assurance record without gating done`：解析 “Recorded assurance snapshot”，断言字段恰为 `Evidence and limitations`、`Verify`，且该节写明实机/平台观察只进已知限制、跨平台以 PR CI 为准。当前为 6 个字段，会失败。
- `reads merged legacy plans as done`：解析 “Legacy status interpretation”，断言已合并的 `approved`/`candidate` 解读为 `done`、未合并 `candidate` 解读为 `approved`、`done` 不因缺记录被降级。当前表把缺 Assurance 的 `done` 解读为 “acceptance not established”，会失败。
- `keeps independent Verify optional and decoupled from done`：断言 implement `assurance.md` 仍引用 `../../verify/references/acceptance.md`；断言 plan-template、implement `assurance.md`、verify `acceptance.md` 均不含 `attested for the exact current candidate`、`acceptance-pass`、`candidate`。当前三文件均含这些短语，会失败。

## Spec delta

- MODIFIED `plan`：Requirement “local plan 区分实施授权、candidate 与独立验收” → local plan 支持 `draft → approved → done`；Implement 在实现完成且项目要求的自动化验证通过后产生 `done`（在工作区与代码改动并存，由 Publish 随同一个 PR 交付），Assurance 只记录证据与已知限制及可选 Verify 结果，不作门槛；遗留计划按决策 11 解读，不回写。Plan 审计 Requirement 中“不得生成 implementation candidate、正式 acceptance 或 done” → “不得产生 approved 或 done”。
- MODIFIED `implement`：“Implement 产生 candidate 而不自我验收” → Implement 实现完成且自动化验证通过后把关联计划标 `done` 并写 Assurance，与代码同一交付；无计划时不创建计划；独立 Verify 仅在用户要求时于全新上下文运行，结果记入 Assurance。第 5、16、46、51 行同步删除 candidate、formal acceptance、attestation pair 相关语义；Requirement “自主组合验证、独立验收与持久 truth”（第 39-41 行）中由 accepted/done 触发独立验收协议的条件改为由用户要求触发。
- MODIFIED `verify`：“accepted 和 done 需要独立 Verify attestation” → 用户要求时的独立 Verify：全新上下文、不带实现历史，返回范围、证据与恰好一个 verdict；不修改计划、不控制 `done`。
- REMOVED `verify`：Requirement “验收结果由 caller 按依据机械投影”（第 29-31 行）。
- MODIFIED `publish`、`handoff`、`review`、`release`：删除 candidate stable basis、Verify pair、basis 匹配、legacy done 等要求；各自只证明自身状态（PR、交接、审阅、发布），不代替或否定计划 `done`。

## Verification

- command: `pnpm test`
- checklist (manual):
  - [ ] `grep -rnE "\bcandidate\b" skills specs PRODUCT.md ARCHITECTURE.md README*.md` 中没有任何作为计划状态的命中（Issue 批次 create candidate、Release 发布候选、Design 候选方向除外）。
  - [ ] `grep -rnE "attested for the exact current candidate|acceptance-pass" skills specs tests PRODUCT.md ARCHITECTURE.md README*.md` 仅剩 `tests/attestation.test.ts` 中断言其不存在的字面量，以及 ARCHITECTURE 历史决策条目。
  - [ ] `grep -rnE "accepted|formal acceptance|正式验收" skills specs` 中没有任何把 `done` 或独立验证协议的加载条件绑定到 accepted/done 的表述。
  - [ ] plan-template 的生命周期表只有 `draft`、`approved`、`done` 三个状态的转换。
  - [ ] 示例走查（按改后文本逐条引用规则）：Plan 写出 `status: draft` → 用户授权实施，Implement 首次编辑前改为 `approved` → 实现完成、本地要求的自动化验证通过，Implement 在工作区改为 `done` 并写入 Assurance（含“跨平台以 PR CI 为准”与已知限制）→ Publish 把代码与计划文件一起提交并开 PR → CI 通过后合并。全程没有合并后的步骤，也没有规则要求跨机器验证。
  - [ ] 汇报：每个改动文件、改动前后的语义，以及无法确认的影响范围（例如本仓库之外已安装旧版 skill 的项目、其他 agent 对旧状态的缓存解读）。

## Assumptions & risks

- `~/.claude/skills/*` 通过 `~/.agents/skills` 链接到已安装的 skill；本计划只改仓库源码，是否重新安装（`pnpm install` 脚本）由用户另行决定。
- 本仓库 `plans/` 中仍有 `status: candidate` 的历史计划；按决策 11 只解读、不回写，因此 grep 检查范围不包括 `plans/`。

## Assurance

- `Evidence and limitations`: `pnpm test`（17 个测试文件、182 个测试全部通过）；`vp fmt --check` 与 `vp lint` 通过；改写后的 `tests/attestation.test.ts` 4 个回归测试先在旧文本上全部失败，修改后全部通过。完成标准的全文搜索已执行：`candidate` 只剩遗留解读表、ARCHITECTURE 新旧决策记录及 Release 发布候选；`attested for the exact current candidate` 与 `acceptance-pass` 只剩测试中的否定断言。跨平台证据以 PR CI 为准。已知限制：本仓库之外已安装旧版 skill 的项目要重新安装后才会生效；`plans/` 下的历史计划按遗留规则解读，未回写。
- `Verify`: not run
