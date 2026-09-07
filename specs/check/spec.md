# Check Specification

## Purpose

check 通过 review、test、e2e 或相称组合，对指定 change 给出有证据的只读 verdict。

## Requirements

### Requirement: 只校验不修改

check 不得修改源码、测试、plan 或 docs，不得 stage、commit、push 或修 finding；test/e2e 只能执行项目以观察结果。
Verify: manual(integration)

### Requirement: evidence 由问题和风险决定

显式请求选择对应 review/test/e2e；full/pre-merge gate 覆盖要求的范围，通常结合相关 review 与 tests，真实可运行用户路径有价值时加入 e2e。裸请求先看 scope 后选择最小可信组合，不得无条件全面把关。完成所需检查后，仅在新编辑、失败或未解决风险出现时扩大或重复验证；检查规模本身不创造 accepted/done claim。
Verify: manual(integration)

### Requirement: accepted 和 done 需要独立 Check attestation

用户请求或权威项目契约要求正式 independent acceptance、accepted 或 done 时，check 必须条件加载 acceptance reference，使用独立于 implementation trajectory 的 fresh context，独立建立完整 claimed change 的稳定可复算 basis，读取原始 outcome、authorization、candidate artifacts/evidence/producer 与 known limitations，并独立决定相称方法。完整历史 fork、自检或缺完整 Assurance 的 legacy done 不能证明独立性。basis 不稳定、缺独立判断或 evidence 不足时必须返回 inconclusive，不得改为普通 scoped pass 掩盖较弱保证。
Verify: manual(integration)

### Requirement: 项目上下文按缺口取得

check 必须复用仍有效的项目事实，只在缺口处调查或获取 explore context；不得要求固定 preflight 或每次使用 subagent。宿主允许且有独立价值时可委派边界清楚的 review 区域，保留 source evidence 并核对分歧；正式验收的独立上下文要求不因此降低。
Verify: manual(integration)

### Requirement: 各方法只加载相关 reference

review/test/e2e 按选定方法加载相关 reference；review 聚焦可操作 finding，test 运行覆盖 claim 的实际项目命令，e2e 比较真实 observed/expected。正式验收才加载完整 acceptance 协议，普通检查不加载未触发的状态细节。没有选择的方法不得仅为完整感运行。
Verify: manual(integration)

### Requirement: verdict 只覆盖实际证据

普通 check 必须报告 inspected scope、恰好一个 pass/findings/inconclusive verdict、实际命令或观察、可操作 finding 和重要 missing evidence，不强制完整 candidate basis、producer 或 acceptance field，也不能以局部通过声称整体验收。正式验收额外报告 stable basis、Check producer/reference 和 acceptance field；仅覆盖完整 claim 的 pass 可用 attested for the exact current candidate，其他正式结果为 not established。compatibility 只有在 requested claim 或原始 outcome/权威契约建立时才是约束；该 selected scope 内的失败掩盖、未授权 fallback/兼容层/迁移/双路径/legacy 和 clean break 残留须报告 finding。所选 claim 依赖边界而 evidence 不足时 inconclusive，普通 scoped check 不得为证明全局不存在这些路径扩大范围。
Verify: manual(integration)

### Requirement: verdict 只读且由 caller 机械投影

check 不得更新 plan、自行修复或授予 repair authority。只有正式、独立且 basis 匹配的精确 pass + attested for the exact current candidate 可由 caller 机械投影 done；普通 verdict 或缺正式字段不具备该权力。findings 只否定 claim，不产生 approved 或修复授权。独立 Check 止于只读结果，已获授权的调用方可随后继续实施；plan 中 attestation 仅是 time-scoped snapshot，current acceptance 需要 basis 匹配和 latest applicable result。
Verify: manual(integration)
