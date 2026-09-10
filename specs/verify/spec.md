# Verify Specification

## Purpose

verify 根据实际测试、运行观察及相关审阅证据判断指定结果是否成立；正式实现验收仅在触发时依独立协议建立。

## Requirements

### Requirement: 只验证不修改

verify 不得修改源码、测试、plan、Issue 或 docs，不得 stage、commit、push 或修复 finding；测试和用户路径可以执行项目以观察结果，启动失败不得作为修改源码或配置的授权。独立调用止于结果；支持调用返回持有原任务授权的调用方，结果不授予额外诊断修复权限。
Verify: manual(integration)

### Requirement: 验证方法由主张和风险决定

verify 必须保留用户原主张，按主张与风险选择足够且最小的测试、真实路径及审阅组合。显式测试请求可仅验证相应测试；full/pre-merge gate 覆盖要求的范围，通常结合相关 Review 和测试，在真实可运行路径能实质验证主张时加入观察。unit、integration、e2e 是证据手段；仅加载所需 test/e2e reference，正式验收才加载 acceptance 协议。所选主张需要审阅证据时组合 Review，优先同安装集合，再查宿主已有能力；必需支持缺失须如实报告，不自动安装或伪造结果。复用有效事实，仅补证据缺口，不强制 Explore、全面检查或普通调用的独立 Agent。测试使用项目实际命令，真实路径比较 observed/expected；所需验证通过后仅为新编辑、失败或未解决风险扩大或重复。无框架不得自行创建，不能跳过、删测、弱化断言或绕过检查制造通过。
Verify: manual(integration)

### Requirement: 验证结论只覆盖实际证据

verify 必须返回恰好一个 pass、findings 或 inconclusive，并报告实际范围、命令及可用计数、观察、可操作问题和重要缺口。pass 需要足够证据支持原主张；findings 表示证据已建立缺陷或范围/意图冲突；inconclusive 表示必要证据或判断无法取得。须区分明确故障与环境不可用，不能隐藏其中任何一项，不能在失败后缩小原主张以局部通过代替结果。源码合理或 Review pass 不替代运行证据，相冲突的 Review finding 阻止 pass。compatibility 仅由原始目标或权威契约建立；选定范围内的失败掩盖、未授权 fallback、兼容层、迁移、双路径或 legacy，以及已授权替换后的旧路径残留须报告 finding，依赖该边界而证据不足则 inconclusive，不为证明全局不存在而扩展普通范围。普通结果不强制完整候选依据或验收表单，也不产生 accepted/done。
Verify: manual(integration)

### Requirement: accepted 和 done 需要独立 Verify attestation

用户请求或权威项目契约要求正式 independent acceptance、accepted 或 done 时，verify 必须在独立于 implementation trajectory 的 fresh context 中独立建立完整 claimed change 的稳定可复算 basis，读取原始 outcome、authorization、candidate artifacts/evidence/producer 与 known limitations，自主选择充分证据。完整历史 fork、Implement 自检或缺完整 Assurance 的历史 done 不证明独立性或补足证据。basis 不稳定、缺独立判断或必要证据时返回 inconclusive，不得改为普通 scoped pass。正式结果必须报告 basis、Verify producer/reference、恰好一个 verdict 及一个 acceptance 字段；仅覆盖原始目标、授权和完整当前依据的 pass 可用 attested for the exact current candidate，其他正式结果为 not established，不得使用 not requested 回避已请求的验收。
Verify: manual(integration)

### Requirement: 验收结果由 caller 按依据机械投影

verify 保持只读，只有独立且 basis 匹配的精确 pass + attested for the exact current candidate 才能由 caller 机械投影 done；findings 否定验收但不产生 approved 或修复权限，普通结果或缺正式字段不能冒充 attestation。修复或相关编辑需要新 basis 和新 Verify；plan 的记录只是其时间点 snapshot，当前验收须具备依据匹配及最新适用结果。后续与验收主张冲突的 Review 发现也阻止复用旧通过，调用方必须以证据解决冲突或取得新的适用 Verify；缺所需事实只能报告历史结果或重新验证，不补造来源，不将历史生产者改名为 Verify。
Verify: manual(integration)
