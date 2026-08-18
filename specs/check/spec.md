# Check Specification

## Purpose

check 通过 review、test、e2e 或相称组合，对指定 change 给出有证据的只读 verdict。

## Requirements

### Requirement: 只校验不修改

check 不得修改源码、测试、plan 或 docs，不得 stage、commit、push 或修 finding；test/e2e 只能执行项目以观察结果。
Verify: manual(integration)

### Requirement: evidence 由问题和风险决定

显式请求必须选择对应 review/test/e2e；full/pre-merge gate 通常组合相关 review 与 tests，并在可运行的用户可见路径上加入 e2e。裸或模糊 check 必须先看 scope 后选择最小可信组合，不得无条件全面把关。
Verify: manual(integration)

### Requirement: accepted 和 done 需要独立 Check attestation

当 requested claim 是 accepted 或 done 时，check 必须使用独立于 implementation trajectory 的 fresh context，独立建立完整 claimed change 的稳定可复算 basis，读取原始 outcome、authorization boundary、candidate evidence 及 producer、known limitations，并独立决定相称的 review/test/e2e。缺少完整 Assurance 的 legacy done 不构成 prior acceptance 或缺失 evidence；basis 无法在会话移动后继续稳定引用、无法取得 fresh independent judgment 或证据不足时必须返回 inconclusive，不得把 Implement 自检升级为 pass。
Verify: manual(integration)

### Requirement: 项目上下文按缺口取得

check 必须复用新鲜项目上下文，只在事实不足时调查或取得 explore context；不得把固定 explore preflight 或独立 subagent 作为每次 gate 的要求。
Verify: manual(integration)

### Requirement: 各方法只加载相关 reference

review 必须聚焦高风险、可操作 finding；test 必须运行覆盖 claim 的真实项目命令并准确报告；e2e 必须驱动真实路径并比较 observed/expected。没有选择的方法不得仅为完整感运行。
Verify: manual(integration)

### Requirement: verdict 只覆盖实际证据

check 必须报告稳定 candidate basis、Check producer/reference，并对该 candidate 返回恰好一个 pass、findings 或 inconclusive verdict，另报恰好一个 acceptance field：`attested for the exact current candidate`、`not requested` 或 `not established`。只有覆盖原始 outcome、authorization boundary 与完整 current basis 的 acceptance-scoped pass 才能使用第一个值；普通 scoped pass 必须是 not requested，findings、inconclusive 或覆盖不完整必须是 not established。check 只能对实际读取、执行或观察的 scope 使用 holds up；必须报告高置信 finding、命令/观察结果和重要未运行证据，过滤推测性或纯风格噪声。任何后续相关改动都建立新 basis，并要求新 candidate 在恢复 acceptance 前再次 Check。
Verify: manual(integration)

### Requirement: verdict 只读且由 caller 机械投影

check 不得更新 plan、自行修复或授予修复 authority。caller 只能把 basis 匹配的 exact `pass` + `attested for the exact current candidate` 机械投影为 done；findings 只否定 acceptance，必须保持 candidate，不得被重新解释为 approved、repair authorization 或 acceptance。plan 中记录的 attestation 只是 time-scoped snapshot；later Check result 在可得的上下文/Handoff 中 supersede 它，仅有 plan 的消费者声明 current acceptance 前必须取得 latest applicable result，否则只能报告历史 snapshot 或 inconclusive。
Verify: manual(integration)
