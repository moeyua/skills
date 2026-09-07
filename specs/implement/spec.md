# Implement Specification

## Purpose

implement 承接一个已授权 outcome，完成可观察变更并提供相称证据；关联 plan 或正式验收时产出有稳定 basis 的 candidate，并自主组合真正需要的支持能力。

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

implement 必须自行处理可检索事实、定位、项目一致的命名/措辞、微观编辑顺序和相称验证；在宿主约束内，显式用户指令优先于 skill 指导。不得静默决定新产品语义、扩大 scope、添加依赖或吸收未授权外部副作用。fallback、兼容层、迁移、双路径和 legacy path 不是机械安全选择，只有明确用户决定或权威项目 intent 可以授权；已授权 outcome 替换或删除旧设计时，必须移除 superseded code、configuration、tests 与直接受影响的 durable truth，不得保留双路径。artifact 只能携带其来源已有的 authority。纠正必须使实际依赖该前提的编辑与结论失效；侧问不得丢失 active outcome。skill 规则导致暂停时须引用实际文件、短引文和适用原因，只阻塞依赖该条件的动作，继续不受影响的已授权工作。
Verify: manual(integration)

### Requirement: TDD 按需保留

implement 必须把 TDD 作为按需证明策略：红→绿 regression 对修复/功能确实便宜、稳定且能区分行为时使用；否则采用已有测试或最窄可否证观察，不为流程感新建基础设施或复述实现的测试。必须完成所需检查；通过后只有新编辑、失败或未解决风险才扩大或重跑。重复命令失败结束盲目重试，但不阻止继续调查新证据、修正假设或范围内修复；不得削弱断言、绕过 hooks 或掩盖失败。
Verify: manual(integration)

### Requirement: Implement 产生 candidate 而不自我验收

普通无 plan 且未请求正式验收的实施必须完成 observable outcome，报告实际改动、相称 evidence 与重要限制；不强制 assurance artifact、完整 diff 身份或 producer 表单，不得自称独立验收。关联 plan 或正式验收触发条件满足时必须读取 assurance reference，为完整 claimed change 建立稳定可独立复算的 basis，并将关联 approved plan 标为 candidate、替换一个完整 Assurance snapshot。candidate 是实现的有效结果，但不等于 independently accepted、Check pass 或 done。无 plan 的正式结果只在会话报告，不自动创建 artifact。
Verify: manual(integration)

### Requirement: 自主组合验证、独立验收与持久 truth

implement 必须根据 outcome、风险与 evidence 自主组合 check、docs 和最终验证，不得机械执行固定链路或要求用户手动串联。相关 review/test/e2e 或独立判断可触发 check；显式文档目标、Spec delta 或 verified durable drift 可触发 docs。支持能力返回后，仍获授权的 implement 继续可行调查、修复和必要验证。宿主允许且能节省时间或改善判断时，委派有明确输入、产物和编辑归属的独立子任务；顺序依赖强或协调成本高时本地完成。只有正式验收 claim 或权威项目契约要求 accepted/done 时才加载完整独立验收协议；高风险或 broad diff 本身不升级 claim。
Verify: manual(integration)

### Requirement: 组合不放宽能力边界

check 被组合时仍只读；docs 仍只能记录已有 authority 的 truth。普通 scoped Check 可只返回 scope、verdict、evidence 和 limitations，不要求正式 provenance 或 acceptance field；其 pass 不产生 done，也不允许 caller 补造 attestation。正式验收必须来自独立于 implementation trajectory 的 fresh context并返回稳定 basis、producer/reference、精确 verdict 与 acceptance field；仅 basis 匹配的 pass + attested for the exact current candidate 可机械投影 done。findings/inconclusive 保持未验收 candidate；修复需要仍 active 的 Implement authorization 或新的明确授权，关联 plan 在编辑前变 approved。相关修改使旧 pass 不再覆盖新 basis；current acceptance 还须核对 latest applicable evidence。read-only Check 不重开或回写 done，缺 provenance 不得回填。
Verify: manual(integration)

### Requirement: 完成状态和报告真实

implement 必须保留 active outcome/horizon，不得用局部机制、静态检查、中间状态或运行中的 job 替代用户结果。失败、歧义、必要状态缺失或未完成的 clean break 必须保持 exact non-success，不得由 fallback、局部成功或较低保证 evidence 升级为完成。普通报告结果先行，包含相关路径、实际验证与重要限制；只有关联 plan 或正式验收触发时才报告 candidate/accepted、stable basis、实际 producer、适用 Check pair 与 basis 匹配情况。tests、dogfood 或交付不能升级为独立验收，未执行的支持能力不得被声称已执行。
Verify: manual(integration)
