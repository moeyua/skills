# Publish Specification

## Purpose

publish 根据 canonical git/GitHub 状态完成缺失的 commit、push 和 pull request，检查当前 PR，并在用户明确要求时执行 rebase 合并；分别保留各阶段的实际结果。

## Requirements

### Requirement: 按当前状态完成 commit、push 与 PR

本地发布前必须检查 working tree、branch/upstream、remote、base 与既有 PR，再只执行缺失动作；已有相关 commit、已同步 branch 或 open PR 必须复用。已有 PR 的检查或合并请求可以直接进入远程状态核验，不制造新提交或修改无关本地工作。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: explicit staging 且不泄露敏感信息

publish 必须逐路径 review/stage，禁止 `git add -A` 与 `git add .`，并在 secret-like 文件或凭据内容进入 staged diff 时停止。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: commit 保持有意图且可回退

同一主题默认一个 commit，只在不同意图可独立 review/revert 时拆分且至多三个；message 跟随项目历史，禁止 empty commit、amend 或绕过 hook。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: 保护本地和远程历史

detached、in-progress git operation 或 protected/default branch 必须在本地 commit/branch push 前停止；禁止 force push、删除 remote branch、修改 git/gh config 或推送 protected history。该限制不禁止用户明确授权且满足当前条件的 GitHub rebase 合并，也不授权为合并重写本地分支。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: PR 来自整条分支

新 PR 的 title/body 必须综合 base..HEAD commits 与 merge-base diff，正文包含 Summary 和只陈述真实证据的 Test plan；既有 open PR 必须复用且不擅自覆盖 authored content。PR create 使用的临时 body file 在成功、失败或结果模糊后都必须清理。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: Issue 关联可选且唯一

只有显式或 plan 已记录的同仓 canonical Issue 才可加入 closing reference；无关联是正常状态，不得按标题搜索。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: partial state 不回滚

commit、push、PR、检查、合并的部分状态独立保留；任一步失败不得撤销此前成功状态。模糊 PR create 只按 exact head 查询一次，模糊 merge 只读取该 exact PR 一次，不盲重试；已合并 PR 返回真实 merge 结果。非 GitHub remote 在安全 push 后提供 manual PR/MR handoff。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: 发布状态不升级实现证据

publish 只能 attest 实际 commit、push、PR、检查与合并 state；发布或重复测试结果不得被升级为 Verify pass。关联 plan 的状态与 Assurance 改动属于本次交付的相关路径，必须与代码一起提交、进入同一个 PR。Review finding 与 Verify 结果按记录转述，不升级。历史 Check 记录保留原字段、来源及时间范围，不改写为 Verify 证明。
Verify: manual(integration)

### Requirement: 当前 PR 检查

publish 必须读取 exact PR 的当前 head、base、draft、必需 CI、评审要求和可合并性；检查需匹配 head 和适用 run attempt。等待、失败、取消、缺失、过期或不可读证据不能算通过，skipped/neutral 只能按项目实际契约解释。没有 required checks 时应明确记录该事实并检查项目约定的验证，不发明成功结果。检查不授权自动修复或重跑有部署副作用的 Workflow。
Verify: manual(integration)

### Requirement: 显式授权的 rebase 合并

只有用户明确要求合并该 PR 时，publish 才可刷新 head/base/检查/评审/draft/可合并性，在全部条件满足且仓库允许 rebase 时，使用绑定已检查 head 的 rebase 合并。head 变化使旧证据失效；不得转 squash、merge commit、管理员绕过、自动合并或不兼容的 merge queue，也不自动解决冲突或删除分支。合并后读取真实 PR 与结果 commit，queued/open/unknown 不得报告为 merged。
Verify: [publish state machine](../../tests/publish.test.ts)
