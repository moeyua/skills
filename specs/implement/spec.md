# Implement Specification

## Purpose

implement 承接一个已授权 outcome，完成可观察变更并提供相称证据；有关联 plan 时随交付把它标为 done，并自主组合真正需要的支持能力。

## Requirements

### Requirement: plan 是可选上下文

implement 必须先按显式请求与当前会话中的既定决定和 correction 解析意图，再把关联 plan 作为实施上下文；plan 不得覆盖后出现的用户纠正。请求足够明确时不得因缺少 shape、plan、Issue 或既往 Skill 调用而拒绝工作。
Verify: manual(integration)

### Requirement: plan lifecycle 受显式实现授权约束

显式实现授权必须在首次实现编辑前把关联 draft plan 更新为 approved；同一次仍在执行的 Implement authorization 可在组合 Debug、Review 或 Verify 后继续授权 scope 内修复，但支持能力的 finding 本身不得产生 approved 或修复 authority；done plan 不得被静默重放或重开，只有新的显式实现授权才可重新进入执行。
Verify: [lifecycle transition contract](../../tests/attestation.test.ts)

### Requirement: 建立安全实现边界

编辑前必须检查项目指令、工作树、目标代码和验证入口；可分离的用户改动保持原样，重叠归属不明时停止。受保护/default 分支或 detached HEAD 必须先使用合适工作分支。credential value 必须留在项目既有 secrets/config 路径，不得进入 code、tests、logs、plans、docs 或 reports。
Verify: manual(integration)

### Requirement: Agent 承接机械决策

implement 必须自行处理可检索事实、定位、项目一致的命名/措辞、微观编辑顺序和相称验证；在宿主约束内，显式用户指令优先于 skill 指导。不得静默决定新产品语义、扩大 scope、添加依赖或吸收未授权外部副作用。fallback、兼容层、迁移、双路径和 legacy path 不是机械安全选择，只有明确用户决定或权威项目 intent 可以授权；已授权 outcome 替换或删除旧设计时，必须移除 superseded code、configuration、tests 与直接受影响的 durable truth，不得保留双路径。artifact 只能携带其来源已有的 authority。纠正必须使实际依赖该前提的编辑与结论失效；侧问不得丢失 active outcome。skill 规则导致暂停时须引用实际文件、短引文和适用原因，只阻塞依赖该条件的动作，继续不受影响的已授权工作。
Verify: manual(integration)

### Requirement: TDD 按需保留

implement 必须把 TDD 作为按需证明策略：红→绿 regression 对修复/功能确实便宜、稳定且能区分行为时使用；否则采用已有测试或最窄可否证观察，不为流程感新建基础设施或复述实现的测试。必须完成所需检查；通过后只有新编辑、失败或未解决风险才扩大或重跑。重复命令失败结束盲目重试，但不阻止继续调查新证据、修正假设或范围内修复；不得削弱断言、绕过 hooks 或掩盖失败。
Verify: manual(integration)

### Requirement: Implement 随交付完成关联 plan

普通无 plan 的实施必须完成 observable outcome，报告实际改动、相称 evidence 与重要限制，不强制 assurance 记录。关联 plan 时必须读取 assurance reference，在实现完成且项目要求的自动化验证通过后，于工作区把 approved plan 标为 done 并替换一个 `## Assurance` 记录（Evidence and limitations、Verify），与代码改动并存；Implement 不提交，由 Publish 随同一 PR 交付。实机、系统 UI 与平台门禁观察只记为已知限制；跨平台证据以 PR CI 为准，不建议跨机器迁移 session。Verify 字段只记录实际 Verify 结果，Review 记录于 evidence/limitations，未运行 Verify 时为 not run。历史 Check 记录必须保留原字段、来源和时间范围，不得改写为 Verify 证据或回填 provenance。无 plan 的结果只在会话报告，不自动创建 artifact。
Verify: manual(integration)

### Requirement: 自主组合验证、独立验证与持久 truth

implement 必须根据 outcome、风险与 evidence 自主组合支持能力，不得机械执行固定链路或要求用户手动串联。原因不明时用 Debug 建立预期与实际偏差、可证伪假设和因果证据；已有因果依据只补缺口。Review 判断需纠正的设计或改动，Verify 判断指定结果是否得到足够证据，显式文档目标、Spec delta 或 verified durable drift 可触发 Docs。支持能力返回后，仍获授权的 Implement 继续可行调查、修复和必要验证，不因诊断结束重复请求同一修复授权；它保留持久代码、回归测试、必要文档的写入责任，修复后必须复验回归场景及原始触发路径。预期本身未定时由 Shape 澄清实质选择，同时继续独立的已授权工作。宿主允许且能节省时间或改善判断时，委派有明确输入、产物和编辑归属的独立子任务；同一 Agent 也可诊断和实现，不强制交接。只有用户要求独立验证时才加载独立验证协议；高风险或 broad diff 本身不触发它。
Verify: manual(integration)

### Requirement: 组合不放宽能力边界

Debug 的临时探针或实验只使用当前任务已有权限，不自行授予持久修复权；Review 和 Verify 被组合时仍只读，Docs 仍只能记录已有 authority 的 truth。普通 scoped Review 或 Verify 只返回 scope、verdict、evidence 和 limitations。独立 Verify 仅在用户要求时运行，必须来自不带实现历史的 fresh context（全新子 agent 即满足），其出处与 verdict 记入 Assurance，不决定 done；findings 不授予修复权，修复需要仍 active 的 Implement authorization 或新的明确授权，在同一交付内完成并更新记录。read-only Review 和 Verify 不重开或回写 plan。
Verify: manual(integration)

### Requirement: 完成状态和报告真实

implement 必须保留 active outcome/horizon，不得用局部机制、静态检查、中间状态或运行中的 job 替代用户结果。失败、歧义、必要状态缺失或未完成的 clean break 必须保持 exact non-success，不得由 fallback、局部成功或较低保证 evidence 升级为完成。普通报告结果先行，包含相关路径、实际验证与重要限制；关联 plan 时报告其状态、Assurance 中的证据与已知限制、实际 producer、可选 Verify 出处与 verdict 及冲突的 Review 证据。tests、dogfood 或普通 Review 不能冒充独立 Verify，未执行的支持能力不得被声称已执行。
Verify: manual(integration)
