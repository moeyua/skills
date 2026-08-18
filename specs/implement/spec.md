# Implement Specification

## Purpose

implement 承接一个已授权 outcome，产出有稳定 basis 和相称证据的 implementation candidate，并自主组合真正需要的支持能力。

## Requirements

### Requirement: plan 是可选上下文

implement 必须先按显式请求与当前会话中的既定决定和 correction 解析意图，再把关联 plan 作为实施上下文；plan 不得覆盖后出现的用户纠正。请求足够明确时不得因缺少 shape、plan、Issue 或既往 Skill 调用而拒绝工作。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: plan lifecycle 受显式实现授权约束

显式实现授权必须在首次实现编辑前把关联 draft 或未验收 candidate plan 更新为 approved；同一次仍在执行的 Implement authorization 可在组合 Check 后继续授权 scope 内修复，但 Check finding 本身不得产生 approved 或修复 authority；done plan 不得被静默重放或重开，只有新的显式实现授权才可重新进入执行，且缺少完整 Assurance 的 legacy done 不得被解释为 independent acceptance。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 建立安全实现边界

编辑前必须检查项目指令、工作树、目标代码和验证入口；可分离的用户改动保持原样，重叠归属不明时停止。受保护/default 分支或 detached HEAD 必须先使用合适工作分支。credential value 必须留在项目既有 secrets/config 路径，不得进入 code、tests、logs、plans、docs 或 reports。
Verify: manual(integration)

### Requirement: Agent 承接机械决策

implement 必须自行处理定位、项目一致的命名/措辞、微观编辑顺序和相称验证；不得静默决定新产品语义、扩大 scope、添加依赖或吸收未授权外部副作用。Design Summary、plan、代码或 merged state 只能携带其来源已有的 authority，不得把未披露的重大选择变成用户决定。用户否定前提时，必须丢弃它并重审实际依赖它的编辑与结论。
Verify: manual(integration)

### Requirement: TDD 按需保留

implement 必须把 TDD 作为按需证明策略：红→绿 regression 对修复/功能确实便宜、稳定且能区分行为时使用；否则采用已有测试或最窄可否证观察，不得为流程感新建测试基础设施。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: Implement 产生 candidate 而不自我验收

claimed outcome 已实现且本地 evidence 与 known limitations 已记录时，implement 必须为完整 claimed change 建立稳定、可独立复算的 basis，产生 candidate，并把关联 approved plan 标为 candidate、替换其 recorded Assurance snapshot；没有关联 plan 时只在报告中表达 basis 与 assurance state，不得自动创建 artifact。candidate 是 Implement 的有效结束状态，但不得被声称为 independently accepted、Check pass 或 done。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 自主组合验证、独立验收与持久 truth

implement 必须根据 outcome、风险与证据自主组合 check、docs 和最终验证，不得机械执行固定链路，也不得要求用户手动串联。显式 acceptance/pre-merge gate、高风险、广泛 diff 或独立判断可触发 check；显式文档目标、Spec delta 或 verified durable drift 可触发 docs；只有 evidence basis 改变时才扩大或重跑。需要 accepted/done 时，Check 必须来自独立于 implementation trajectory 的 fresh context；无法取得时必须诚实停在 candidate。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 组合不放宽能力边界

check 被组合时仍只读，并返回 stable candidate basis、Check producer/reference、pass/findings/inconclusive 与 explicit acceptance field；docs 被组合时仍只能记录已有 authority 的 truth。Implement 只能机械消费结果：仅 basis 匹配的 `pass` + `attested for the exact current candidate` 可把关联 plan 标为 done；普通 scoped pass、findings 或 inconclusive 保持 candidate，finding 只否定 acceptance，不产生修复 authority。只有仍 active 的原 Implement authorization 或新的显式 implementation request 才能在编辑前把 candidate 变为 approved 并授权修复。任何改变已检查 basis 的修复都会建立新 basis，使旧 pass 对新 candidate 失效。done/Assurance 只是最后获授权投影时的 time-scoped record；current acceptance 还必须核对 basis 与当前上下文可得的 latest applicable Check result。后来 finding 在携带它的上下文中 supersede 旧 pass，但不得修改/静默重开 plan 或授权修复；需要新的显式 implementation outcome。缺失 intent、scope、dependency 或文档 authority 时必须停止并返回具体边界。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 完成状态和报告真实

implement 必须持续保留 active outcome/horizon，不得用 Agent 选择的机制、局部修复、静态检查、中间状态或运行中的 job 替代用户 outcome，也不得把自己的 tests、dogfood 或判断升级为 Check attestation。最终报告必须区分 candidate 与 accepted，只对与 claimed outcome 匹配的实际 evidence 声明完成，并列出 stable candidate basis、实际改动、evidence 及 producer、Check producer、exact verdict + acceptance-field pair、Check basis 是否仍匹配 current candidate、known limitations、实际使用的支持能力、重要未运行检查与剩余边界，不得暗示更高层 outcome、independent acceptance 或 publish/release 已发生。
Verify: [implement contract](../../tests/implement.test.ts)
