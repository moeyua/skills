# Implement Specification

## Purpose

implement skill 把已授权 change 落实为代码与测试，先通过独立 check 完成实现修复闭环，再按证据同步已经 earned 的 durable docs，并以完整 diff 的最终 verdict 与工作总结结束 outcome。

## Requirements

### Requirement: plan 是可选上下文而非入口门禁

implement 有 plan 时必须读取并遵循其仍有效的意图与范围；没有 plan 时可从足够明确的当前请求执行，不得因 shape、plan 或 Issue 没有运行或不存在而拒绝工作。显式请求、关联 plan、当前会话依次决定冲突语义。
Verify: manual(integration)

### Requirement: 实施前建立可靠事实与安全工作区

implement 必须检查当前分支、工作树、项目指令、目标文件、相关 durable claim 和验证方式；上下文不足时按需取得 explore context。与任务可安全分离的用户改动必须原样保留，重叠或归属不明时必须停止，不得自动 stash、提交、丢弃或覆盖。
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

实现自身验证通过后，implement 必须先以本次 scope、完整 implementation diff、可用 plan 和验证证据调用既有独立 check；docs 有写入时必须再对代码、测试、plan 与文档的完整 diff 调用 final check。standalone check 始终只读且可独立调用。

(Previously: implement 只在实现验证后运行一次 check 修复闭环，不进入 docs 或完整-diff final gate。)
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 实现范围内 findings 自动修复并重新 check

initial/final check 判定 needs work 且 blocker 位于已授权范围内时，implement 必须修复、重跑相关验证并再次 check；repair 改变已经记录的 durable truth 时必须先重新同步 docs。非阻塞 observation 不得为了清空报告而诱发 scope creep。

(Previously: 自动修复只覆盖 docs 之前的单一 implement↔check loop。)
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 满足持久化触发条件时自动运行 docs

initial check holds up 后，关联 plan 含 `## Spec delta`、当前请求显式命名 catalog/named document target，或 verified change 使一个可定位的现有 durable claim 失真时，implement 必须调用独立 docs；无这些证据时不得因为 catalog 存在、惯例或“可能有用”而制造文档。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 文档动作具有可见判定

每次 implement 必须把 docs 报告为 `updated`、`not needed` 或 `stopped`，并给出 trigger/跳过原因、targets 与 authority，或所缺的具体决定。docs 判定没有 earned update 时不得创建空文件或 section。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 文档后的完整状态必须通过最终 check

docs 产生 diff 时，implement 的 final verdict 必须来自覆盖实现、测试、plan 与文档的 complete-diff check；docs 无写入时 initial holds-up verdict 可直接作为 final，不得为了 ceremony 重复相同 gate。final repair 改变 truth 时必须重新同步 docs 后再 check。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: docs 与 check 的独立边界保持不变

自动组合不得放宽 docs 的 catalog、authority、anti-invention 或独立入口，也不得改变 check 的只读与独立入口；implement 负责编排和修复，docs 只记录已有 authority 的 truth，check 只裁决。
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 意图或范围问题退出自动闭环

finding 或 docs claim 需要 intent change、scope expansion、new dependency、缺失 authority，或同一问题在无新证据下重复出现构成 no progress 时，implement 必须退出循环并准确报告所需决定；不得固定次数盲重试或自行扩大授权。

(Previously: 退出边界只描述 check finding，不包含 docs authority 与 complete-diff loop。)
Verify: manual(integration)

### Requirement: plan 状态跟随真实完成

使用 draft plan 的明确 implement 调用可把它标为 approved；只有实现、验证、initial check、必要 docs、complete-diff final check，以及 every plan outcome/required acceptance 全部完成后才能标为 done。必需 command、manual check 或 observable outcome 未完成时必须保持 approved 并报告；无 plan 时不得创建占位 plan。

(Previously: plan done 只要求实现、验证与 check 闭环完成。)
Verify: [implement contract](../../tests/implement.test.ts)

### Requirement: 最终总结覆盖完整 outcome

implement 的最终报告必须覆盖 branch/plan、changed paths、verification、所有 check rounds、docs state、final verdict，以及实现、验证、持久 truth 和准确 skipped 工作的 concise Summary；不得暗示未运行的 docs、publish 或 release 已发生。
Verify: [implement contract](../../tests/implement.test.ts)
