# Implement Specification

## Purpose

implement 对一个已授权 outcome 负责到底：完成项目变更，以相称证据验证，并自主组合真正需要的支持能力。

## Requirements

### Requirement: plan 是可选上下文

implement 必须按显式请求、关联 plan、当前会话的优先级解析意图；请求足够明确时不得因缺少 shape、plan、Issue 或既往 Skill 调用而拒绝工作。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: plan lifecycle 受显式实现授权约束

显式实现授权必须在首次实现编辑前把关联 draft plan 更新为 approved；done plan 不得被静默重放或重开，只有新的显式实现授权才可重新进入执行。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 建立安全实现边界

编辑前必须检查项目指令、工作树、目标代码和验证入口；可分离的用户改动保持原样，重叠归属不明时停止。受保护/default 分支或 detached HEAD 必须先使用合适工作分支。credential value 必须留在项目既有 secrets/config 路径，不得进入 code、tests、logs、plans、docs 或 reports。
Verify: manual(integration)

### Requirement: Agent 承接机械决策

implement 必须自行处理定位、项目一致的命名/措辞、微观编辑顺序和相称验证；不得静默决定新产品语义、扩大 scope、添加依赖或吸收未授权外部副作用。
Verify: manual(integration)

### Requirement: TDD 按需保留

implement 必须把 TDD 作为按需证明策略：红→绿 regression 对修复/功能确实便宜、稳定且能区分行为时使用；否则采用已有测试或最窄可否证观察，不得为流程感新建测试基础设施。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 自主组合验证与持久 truth

implement 必须根据 outcome、风险与证据自主组合 check、docs 和最终验证，不得机械执行固定链路，也不得要求用户手动串联。显式 gate/高风险/独立判断可触发 check；显式文档目标、Spec delta 或 verified durable drift 可触发 docs；只有证据 basis 改变时才扩大或重跑。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 组合不放宽能力边界

check 被组合时仍只读，docs 被组合时仍只能记录已有 authority 的 truth；in-scope finding 由 implement 修复，缺失 intent、scope、dependency 或文档 authority 时必须停止并返回具体边界。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 完成状态和报告真实

关联 plan 只有 required outcome 与 acceptance 全部完成后才可标为 done，否则保持 approved。最终报告必须列出实际改动、实际验证、实际使用的支持能力、重要未运行检查与剩余边界，不得暗示 publish/release 已发生。
Verify: [implement contract](../../tests/implement.test.ts)
