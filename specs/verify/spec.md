# Verify Specification

## Purpose

verify 根据实际测试、运行观察及相关审阅证据判断指定结果是否成立；用户要求时依独立协议执行独立验证，结果只作记录。

## Requirements

### Requirement: 只验证不修改

verify 不得修改源码、测试、plan、Issue 或 docs，不得 stage、commit、push 或修复 finding；测试和用户路径可以执行项目以观察结果，启动失败不得作为修改源码或配置的授权。独立调用止于结果；支持调用返回持有原任务授权的调用方，结果不授予额外诊断修复权限。
Verify: manual(integration)

### Requirement: 验证方法由主张和风险决定

verify 必须保留用户原主张，按主张与风险选择足够且最小的测试、真实路径及审阅组合。显式测试请求可仅验证相应测试；full/pre-merge gate 覆盖要求的范围，通常结合相关 Review 和测试，在真实可运行路径能实质验证主张时加入观察。unit、integration、e2e 是证据手段；仅加载所需 test/e2e reference，用户要求独立验证时才加载独立验证协议。所选主张需要审阅证据时组合 Review，优先同安装集合，再查宿主已有能力；必需支持缺失须如实报告，不自动安装或伪造结果。复用有效事实，仅补证据缺口，不强制 Explore、全面检查或普通调用的独立 Agent。测试使用项目实际命令，真实路径比较 observed/expected；所需验证通过后仅为新编辑、失败或未解决风险扩大或重复。无框架不得自行创建，不能跳过、删测、弱化断言或绕过检查制造通过。
Verify: manual(integration)

### Requirement: 验证结论只覆盖实际证据

verify 必须返回恰好一个 pass、findings 或 inconclusive，并报告实际范围、命令及可用计数、观察、可操作问题和重要缺口。pass 需要足够证据支持原主张；findings 表示证据已建立缺陷或范围/意图冲突；inconclusive 表示必要证据或判断无法取得。须区分明确故障与环境不可用，不能隐藏其中任何一项，不能在失败后缩小原主张以局部通过代替结果。源码合理或 Review pass 不替代运行证据，相冲突的 Review finding 阻止 pass。compatibility 仅由原始目标或权威契约建立；选定范围内的失败掩盖、未授权 fallback、兼容层、迁移、双路径或 legacy，以及已授权替换后的旧路径残留须报告 finding，依赖该边界而证据不足则 inconclusive，不为证明全局不存在而扩展普通范围。普通结果不强制完整候选依据或验收表单，也不产生 accepted/done。
Verify: manual(integration)

### Requirement: 用户要求时执行独立 Verify

用户要求独立验证时，verify 必须在不带实现历史的 fresh context 中执行（全新子 agent 即满足；完整历史 fork 或 Implement 自检不构成独立），读取原始 outcome、authorization、变更产物、本地 evidence/producer 与 known limitations，自主选择充分证据，返回 Verify 出处、覆盖范围、恰好一个 verdict、实际证据、已知限制与可操作发现。无法自动化的实机、系统 UI 或平台门禁观察报告为已知限制；跨平台证据以 PR CI 为准，不建议跨机器迁移 session。缺独立判断或必要证据时返回 inconclusive，不得改为普通 scoped pass。verify 保持只读，不修改 plan、不控制 done；caller 只能原样记录其出处与 verdict，findings 不产生 approved 或修复权限。
Verify: manual(integration)
