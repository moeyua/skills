# Verify Specification

## Purpose

verify 默认实际运行并使用受影响功能，将观察到的表现与原预期比较，再判断功能是否成立；测试及相关审阅提供补充证据。用户要求时依独立协议执行独立验证，结果只作记录。

## Requirements

### Requirement: 只验证不修改

verify 不得修改源码、测试、plan、Issue 或 docs，不得 stage、commit、push 或修复 finding；测试和用户路径可以执行项目以观察结果，启动失败不得作为修改源码或配置的授权。独立调用止于结果；支持调用返回持有原任务授权的调用方，结果不授予额外诊断修复权限。
Verify: manual(integration)

### Requirement: 验证方法由主张和风险决定

verify 必须保留用户原主张。除用户明确限定只跑测试外，功能验证必须加载真实使用方法，通过真实入口运行并使用受影响功能，将关键正常路径和相关失败路径的实际结果与原需求比较；范围选择控制相关场景和补充检查的规模，不能省略实际使用。网页或桌面功能须操作所声称的界面路径，CLI 和服务须调用实际入口，库须使用公共接口，Skill 须以真实任务调用并观察 Agent 行为。既有端到端自动化确实驱动相同入口、观察同一结果时可以承担实际使用；内部单测、mock、源码阅读和历史测试报告不能替代。显式只跑测试的请求可止于相应测试结果，不声称实际功能已经验证。

测试和相关 Review 提供补充证据；full/pre-merge gate 覆盖要求的范围，通常包括相关 Review 和测试，并履行实际使用责任。仅加载所需 test/e2e reference，用户要求独立验证时才加载独立验证协议。所选主张需要审阅证据时组合 Review，优先同安装集合，再查宿主已有能力；必需支持缺失须如实报告，不自动安装或伪造结果。复用有效项目事实及本次验证已经完成的直接观察，仅补证据缺口，不强制 Explore、全面检查或普通调用的独立 Agent。测试使用项目实际命令，所需观察与检查完成后仅为新编辑、失败或未解决风险扩大或重复。无框架不得自行创建，不能跳过、删测、弱化断言或绕过检查制造通过。
Verify: manual(integration)

### Requirement: 验证结论只覆盖实际证据

verify 必须返回恰好一个 pass、findings 或 inconclusive，并报告实际操作、预期与观察结果、支持检查的命令及可用计数、可操作问题和重要缺口。功能 pass 需要实际使用及预期比较支持原主张，且要求的支持检查已完成；明确只跑测试时，pass 仅覆盖所请求的测试。测试全绿但实际功能异常须报告 findings；必要使用路径或判断不可获得且没有已证实缺陷时须报告 inconclusive。须区分明确故障与环境不可用，同时存在时保留故障及未完成观察，不能在失败后缩小原主张以局部通过代替结果。源码合理或 Review pass 不替代实际使用，相冲突的 Review finding 阻止 pass。compatibility 仅由原始目标或权威契约建立；选定范围内的失败掩盖、未授权 fallback、兼容层、迁移、双路径或 legacy，以及已授权替换后的旧路径残留须报告 finding，依赖该边界而证据不足则 inconclusive，不为证明全局不存在而扩展普通范围。普通结果不强制完整候选依据或验收表单，也不产生 accepted/done。
Verify: manual(integration)

### Requirement: 用户要求时执行独立 Verify

用户要求独立验证时，verify 必须在不带实现历史的 fresh context 中执行（全新子 agent 即满足；完整历史 fork 或 Implement 自检不构成独立），读取原始 outcome、authorization、变更产物、本地 evidence/producer 与 known limitations，独立实际使用受影响功能并比较预期与观察，自主选择支持检查和相关 Review。实现报告不替代独立运行观察。返回 Verify 出处、覆盖范围、恰好一个 verdict、实际操作与结果、支持证据、已知限制与可操作发现。

依据当前工具及环境判断路径是否可运行，不得仅因实机或系统 UI 类别就视为不可验证；确实不可获得的观察报告为已知限制，继续不受阻碍的工作。跨平台证据以 PR CI 为准，不建议跨机器迁移 session。已证实缺陷时返回 findings；没有已证实缺陷且缺独立判断或必要运行证据时返回 inconclusive，不得改为普通 scoped pass。verify 保持只读，不修改 plan、不控制 done；caller 只能原样记录其出处与 verdict，findings 不产生 approved 或修复权限。
Verify: manual(integration)
