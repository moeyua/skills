# Implement Specification

## Purpose

implement skill 把已授权 change 落实为代码与测试，并在自身 outcome 内通过 check 的只读结果完成修复闭环。

## Requirements

### Requirement: plan 是可选上下文而非入口门禁

implement 有 plan 时必须读取并遵循其仍有效的意图与范围；没有 plan 时可从足够明确的当前请求执行，不得因 shape、plan 或 Issue 没有运行或不存在而拒绝工作。显式请求、关联 plan、当前会话依次决定冲突语义。
Verify: manual(integration)

### Requirement: 实施前建立可靠事实与安全工作区

implement 必须检查当前分支、工作树、项目指令、目标文件和验证方式；上下文不足时按需取得 explore context。与任务可安全分离的用户改动必须原样保留，重叠或归属不明时必须停止，不得自动 stash、提交、丢弃或覆盖。
Verify: manual(integration)

### Requirement: 不在受保护分支上动工

首次实现编辑前，若当前在 main、master、develop 或 detached HEAD，implement 必须建立工作分支；有 plan 时使用其 slug，无 plan 时从共享 change type 与主题派生 slug。
Verify: manual(integration)

### Requirement: 共享 change type 决定实现证明

implement 必须从共享真源确定 `fix`、`feat`、`refactor` 或 `perf`：有测试框架的 fix/feat 走红→绿，refactor 保护行为不变量，perf 以可比 baseline/target/measurement 验证。change type 不依赖 plan frontmatter 才能成立。
Verify: manual(integration)

### Requirement: 守授权范围且承接机械决策

implement 必须自行处理行级定位、项目一致的命名/措辞和微观编辑顺序，不把这些当成意图缺口；不得顺手修无关问题、静默扩大 scope、决定新产品语义或添加未授权依赖。
Verify: manual(integration)

### Requirement: 不绕过质量门

implement 不得使用 `--no-verify`、`--force`、`@ts-ignore`、`eslint-disable`、test skip 或重复重试制造成功；失败测试必须作为证据处理，疑似 flaky 最多重试一次。
Verify: manual(integration)

### Requirement: 实现完成后自动运行 check

实现自身验证通过后，implement 必须以本次 scope、diff、可用 plan 和验证证据调用既有独立 check；check 仍保持只读与可单独调用，implement 不得改写其行为契约。
Verify: manual(integration)

### Requirement: 实现范围内 findings 自动修复并重新 check

check 判定 needs work 且 blocker 位于已授权实现范围内时，implement 必须修复、重跑相关实现验证并再次 check，直到 holds up 或触及退出边界；非阻塞 observation 不得为了清空报告而诱发 scope creep。
Verify: manual(integration)

### Requirement: 意图或范围问题退出自动闭环

finding 需要 intent change、scope expansion、new dependency，或同一问题在无新证据下重复出现构成 no progress 时，implement 必须退出循环并准确报告所需决定；不得固定次数盲重试或自行扩大授权。
Verify: manual(integration)

### Requirement: plan 状态跟随真实完成

使用 draft plan 的明确 implement 调用可把它标为 approved；只有实现、验证和 check 闭环全部完成后才能标为 done。无 plan 时不得为了流程完整创建占位 plan。
Verify: manual(integration)
