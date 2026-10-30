---
mode: fix
title: Verify 默认实际使用功能后再判断是否符合预期
created: 2026-10-30
status: done
issue: https://github.com/moeyua/skills/issues/64
---

# Verify 默认实际使用功能后再判断是否符合预期

## Building

修复 Verify 容易在运行测试后结束、未实际使用受影响功能的问题。直接调用 Verify 或要求验证某项功能时，默认根据原需求确定使用场景，通过项目真实入口运行并使用功能，将实际表现与预期比较，再返回结论。测试和相关代码审阅提供补充证据，不代替实际使用。

本次修改 Verify 的入口、方法 references、对应 Spec 及直接描述该职责的项目文档，并通过实际 Agent 会话验证行为。用户明确要求“只跑测试”时，保留仅报告相应测试结果的窄范围入口。

## Not building

- 不把 Verify 变为修复工具，不修改被验证项目的源码、测试或配置，不自动安装缺失支持。
- 不恢复旧版的固定三模式流水线，不要求每次运行全仓测试、全面 Review、Explore 或独立子 Agent。
- 不改变 Plan 的 `draft → approved → done` 生命周期、Assurance 记录语义，或独立 Verify 仅在用户要求时执行的规则。
- 不建设新的评测平台、测试框架或常驻服务，不更新全局已安装 Skill，不改写历史计划。
- 本次 Plan 只生成规划产物；不实施、提交、推送或创建 PR。

## Key decisions

用户在本轮 Shape 中明确指出“verify 应该实际的去使用一下功能是不是 OK”，并确认以下方向：

1. Verify 默认实际运行并使用受影响的功能，根据实际表现判断是否符合预期。
2. 验证覆盖关键正常路径和与本次改动相关的失败路径；具体场景由原需求和变更决定。
3. 测试与审阅提供补充证据；即使测试全绿，实际使用异常也必须发现并报告。
4. 无法实际使用时，明确说明阻碍和未验证行为，不能用测试通过代替功能通过。
5. 用户明确限定只跑测试时，才收窄为测试结果。

实施沿用仓库已有轻量入口与条件 references 结构：主入口明确不可省略的职责，具体操作方式放在现有 `references/e2e.md`，不新增模式或另一套工作流。真正驱动相同真实入口、观察同一用户结果的既有端到端工具可作为实际使用手段；仅检查内部函数、mock 或历史测试报告不满足这一职责。

## Root cause

`skills/engineering/verify/SKILL.md:12` 将默认验证交给 Agent 选择“最小充分证据组合”，而 `:14` 的结束条件围绕 required checks，真实使用仅作为按需证据；在未明确限定只跑测试的调用中，入口没有建立必须运行功能并比较实际表现的完成条件，允许实际执行停在测试通过。

依据与边界：

- 用户报告 Verify “总是跑个 test 就结束”；这是本次修复的实际行为来源，本轮尚未复盘具体失败会话。
- 早期提交 `d4bc326` 明确无模式提示时默认全面把关；`f12eb9b` 的轻量化改写改为 bare/ambiguous request 自行选择最小组合；`2f1711b` 的职责拆分延续了条件选择。历史支持默认职责被弱化，但不证明每次执行偏差的模型内部原因。
- 仓库 Verify 入口与本机 `/Users/moeyua/.agents/skills/verify/SKILL.md` 内容一致，本次已排除入口未更新这一差异。
- `specs/verify/spec.md` 的“验证方法由主张和风险决定”、`references/e2e.md`、`references/test.md` 和 `references/acceptance.md` 共同决定方法及结论，必须一起消除“实际操作可以被测试替代”的解释空间。
- `PRODUCT.md`、`ARCHITECTURE.md`、中英文 README、工程分类 README 和 Resolver 描述 Verify 的职责，需要同步直接受影响的表述。Implement 自检仍由其自身契约管理，本次不扩大其默认工作流。

## Regression tests

采用 `manual(integration)` 的实际会话回归。场景与判定记录在本计划及 `specs/verify/spec.md`；运行材料放在项目外临时目录，不新增只匹配提示词字面的测试。优先使用现成项目、工具和运行入口；缺少稳定复现材料时，仅构建足以演示下列差异的临时 fixture，不引入评测基础设施。

对 R1 先用修改前的 Verify 留下实际执行基线，再在相同任务、环境和能力条件下调用修改后的 Verify。保留真实调用和输出，不向执行 Agent 提供预期 verdict。旧版若已发现问题，记录该样本未复现，不将它报告为行为改善；新版仍须满足实际使用契约。

| 场景名                    | 覆盖                   | 触发与操作                                                                                       | 预期信号                                                                                                            |
| ------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| R1 测试全绿但真实入口失效 | 新增行为回归           | 提供可启动的网页功能及绿色内部测试，故意保留按钮未接入业务调用的缺陷；请求“验证这个功能是否正常” | Agent 启动并实际操作页面，观察目标未发生，返回 `findings`；只有测试输出不能算完成                                   |
| R2 真实使用正常           | 新增行为回归           | 在 R1 对应的正常版本调用同一任务，正常操作及本次相关的失败输入均有已知预期                       | 实际操作并比较结果，证据支持时返回 `pass`，报告操作及观察，不只报告测试计数                                         |
| R3 功能不可运行           | 新增行为回归           | 使用已知缺失运行依赖或访问条件的项目，测试可运行但目标路径不可用                                 | 查明并报告具体阻碍、未验证行为及已完成检查；无已证实功能缺陷时返回 `inconclusive`，不修改项目或以局部绿灯替代原结论 |
| R4 明确只跑测试           | 现有行为保护           | 同一项目明确要求“只跑测试”                                                                       | 按限定范围执行并报告测试结果，不声称实际功能已验证，不强制额外启动项目                                              |
| R5 非网页功能             | 新增行为回归           | 对有文档入口的 CLI 执行真实命令检查输出或副作用；对 Skill 用有明确预期的真实任务调用             | 使用与目标匹配的入口并报告实际表现；阅读源码、提示词或 mock 检查不能充当运行结果                                    |
| R6 独立验证               | 现有协议下新增行为回归 | 明确要求独立 Verify，在不携带实现历史的新上下文中重放 R1 或 R3                                   | 同样落实实际使用和缺口判定；独立上下文不豁免运行责任，不修改计划状态或被验证项目                                    |

R1–R6 均核对验证期间被测源码、测试和配置未被修改。由实际使用自然产生的运行输出按既有执行授权处理；验证不取得额外外部副作用权限。

## Implementation steps

1. 将实际使用设为默认验证的完成条件。
   - outcome: 普通功能验证明确从原目标确定场景，实际使用后比较 observed/expected；“最小”只控制相关场景和补充检查的规模，不能省略实际使用。明确只跑测试的例外仍成立。
   - scope: `skills/engineering/verify/SKILL.md`、`references/e2e.md`、`references/test.md`、`references/acceptance.md`。
   - verify: 先保存 R1 旧版基线，再执行修改后的 R1–R4；核对功能运行受阻时不缩窄主张为 pass。独立协议中的实机、系统 UI 限制由实际能力判断，不按界面类别直接宣告不可验证；不改写 `done` 规则。无前置步骤。

2. 同步当前行为契约与公开职责说明。
   - outcome: Spec 与主入口一致，项目入口不再将实际使用描述成普通功能验证的可选补充；方法细节留在现有 reference，历史决策记录保持原意。
   - scope: `specs/verify/spec.md`、`PRODUCT.md`、`ARCHITECTURE.md`、`README.md`、`README.zh-CN.md`、`skills/engineering/README.md`、`skills/RESOLVER.md` 的直接相关段落。
   - verify: 按下方 Spec delta 核对逐项覆盖，检查相对链接与 Skill↔Spec 配对；运行 `pnpm test -- tests/smoke/verify-skills.test.ts tests/attestation.test.ts`。依赖步骤 1。

3. 以实际会话确认修复及既有边界。
   - outcome: R1–R6 有可复查的执行与结论，明确区分结构检查通过、实际行为通过及环境缺口，不把一次静态检查当成 Skill 行为改善。
   - scope: 修改后的 Verify、项目外临时测试材料，以及本计划在实施阶段的验证记录；仅在发现受影响的现有机械接口断言时调整对应测试，不新增提示词措辞快照。
   - verify: 执行 R5–R6 及尚未完成的场景，运行下方项目检查；保留 Agent 的运行操作、观察和最终 verdict，核对无越权修改。依赖步骤 1–2，已有有效场景证据不重复运行。

## Spec delta

作用于 `specs/verify/spec.md`，保留现有 requirement 的稳定名称并修改其语义：

- MODIFIED `验证方法由主张和风险决定`：除用户明确限定只跑测试外，功能验证默认通过真实入口实际使用目标功能，依据原需求选择关键正常及相关失败场景；测试与 Review 是补充。既有端到端自动化若确实驱动相同入口并观察同一结果，可以承担实际使用。方法 reference 随所需操作加载，不要求全仓检查或普通验证的独立 Agent。
- MODIFIED `验证结论只覆盖实际证据`：功能 pass 必须有实际使用及预期比较的证据；功能异常为 findings，必要使用路径不可获得且无已证明缺陷时为 inconclusive。报告实际操作、预期与观察、重要限制，测试绿灯不能替代功能结论；保留不缩窄原主张、已有缺陷不被环境缺口掩盖等规则。
- MODIFIED `用户要求时执行独立 Verify`：独立验证同样承担实际使用责任；区分当前工具和环境确实无法完成的观察与尚未尝试的观察，保持 fresh context、跨平台 CI、结果只作记录及不控制 done 的既有边界。
- `只验证不修改` 的语义保持不变，真实使用仍受当前执行授权约束。

## Verification

- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/engineering/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [x] R1 实际触达功能入口并发现“测试全绿但功能失败”，有工具调用及观察证据。
  - [x] R2 正常功能通过来自实际使用，R3 运行缺口没有被包装为功能通过。
  - [x] R4 明确只跑测试的边界保留，R5 的 CLI 和 Skill 使用方式符合各自真实入口。
  - [x] R6 独立验证既满足 fresh context，也履行实际使用责任，结果不改变计划状态。
  - [x] 直接职责说明、Spec 和 references 一致；静态测试未被当作 Agent 行为证明。
  - [x] 汇报旧版基线是否复现、修改后实际执行结果及未完成观察，保留失败和证据缺口。

## Assumptions & risks

- 目前建立的是用户报告与默认协议缺口之间的对应关系，尚无具体失败会话轨迹；实施时必须保留真实基线，不能宣称确定改善了所有模型或每次运行。
- 运行工具和环境因宿主而异。应使用实际可用的对应能力，必要路径不可获得时报告缺口，不新增未经授权的替代路径或配置修复。
- 安装是快照。本计划只变更仓库源码；全局安装和真实发布不属于本次实施范围。

## Assurance

- `Evidence and limitations`: Implement 执行 `./node_modules/.bin/vp test run tests/smoke/verify-skills.test.ts tests/attestation.test.ts`，2 个文件、13 项测试通过；执行 `pnpm with current test`，17 个文件、182 项测试通过；`pnpm with current lint`、`node skills/engineering/doctor/scripts/checker.ts . --json`（结果 `[]`）、`git diff --check` 均通过。宿主 pnpm 为 12.15.0，清单固定 11.5.1；普通命令自动切换版本时受 cache/lock 写权限限制，因此用 pnpm 的 `with current` 执行原有项目脚本，没有改清单或依赖。`python3 /Users/moeyua/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/engineering/verify` 通过；`./node_modules/.bin/vp fmt --check` 对 Verify 入口、三份 references 和 Spec 的检查通过。

  实际行为材料及调用结果保存在项目外临时目录 `/private/tmp/verify-usage-eval-8f1sj7_y`，摘要位于其 `results/*.json`。R1 旧版基线由 `/root/verify_usage_baseline` 执行：内部测试 3 项通过，但真实浏览器输入 `3`、`0`、`1.5`、空值并点击后均停留在“等待计算”，返回 `findings`。旧版已主动实际使用，本样本未复现“只跑测试就结束”，不能据此宣称改善幅度或旧版必然失败。

  R1–R2 新版由 `/root/verify_usage_web` 执行：通过 `agent-browser` 的真实 `fill`、`click`、`snapshot` 操作，失效按钮版本四项输入均未触发结果，返回 `findings`；正常版本输入 `3` 显示“运费 ¥15.00”，`0`、`1.5`、空值均显示“请输入大于 0 的整数”，返回 `pass`。两个版本各有 3 项内部测试通过，说明测试绿灯与页面行为必须分开判断。浏览器会话和两个服务均已关闭，端口已确认不再监听。

  R3–R5 的运行缺口、窄范围测试和 CLI 由 `/root/verify_usage_limits_cli` 执行：R3 实际运行 `node server.mjs`，因缺少 `SHIPPING_RUNTIME` 退出 2，即使 3 项测试通过，功能结论仍为 `inconclusive`；R4 明确只跑测试时返回仅覆盖 3 项测试的 `pass`；R5 实际执行 `node cli.mjs`，参数 `3`、`1` 返回正确运费并退出 0，`0`、`-1`、`1.5`、缺参数、空串和 `abc` 均提示输入错误并退出 1，返回 `pass`。R5 的 Skill 由 `/root/verify_usage_skill` 使用当前仓库 Verify 执行，两次全新上下文实际调用 `parcel-note`：正常订单正确合计 5 件；缺失、小数、零、负数数量均请求纠正且未编造总数，返回 `pass`。

  R6 由 `/root/verify_usage_independent` 在不携带实现历史的新上下文中执行，实际尝试启动同一缺配置项目，观察到退出 2 和明确错误；3 项测试通过仍返回 `inconclusive`。这是独立协议的回归样例，不是对本次仓库变更的独立 Verify。全部 24 个被测文件的 SHA-256 与执行前一致，验证没有修改源码、测试或配置。

  `/root/review_verify_usage_change` 对实际 diff、计划及相关契约的只读源码 Review 返回 `pass`，未发现实质问题；该审阅未重跑行为评测。部分行为评测使用的新版本快照与最终入口只相差后来补回的 full/pre-merge 通常包括相关 Review 和测试这一既有要求，实际使用步骤及判定语义一致。上述证据覆盖限定样例，不保证所有宿主或模型执行；全局已安装 Skill 尚未更新，跨平台证据以后续 PR CI 为准。

- `Verify`: `not run`。用户未要求对本次仓库变更执行独立 Verify；R6 的 `inconclusive` 仅针对故意缺运行配置的回归样例。
