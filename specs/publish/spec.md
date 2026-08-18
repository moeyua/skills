# Publish Specification

## Purpose

publish 根据 canonical git/GitHub 状态完成缺失的 commit、push 和 pull request，并保留每个 durable partial state。

## Requirements

### Requirement: 按当前状态完成 commit、push 与 PR

publish 必须先检查 working tree、branch/upstream、remote、base 与既有 PR，再只执行缺失动作；已有相关 commit、已同步 branch 或 open PR 必须复用。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: explicit staging 且不泄露敏感信息

publish 必须逐路径 review/stage，禁止 `git add -A` 与 `git add .`，并在 secret-like 文件或凭据内容进入 staged diff 时停止。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: commit 保持有意图且可回退

同一主题默认一个 commit，只在不同意图可独立 review/revert 时拆分且至多三个；message 跟随项目历史，禁止 empty commit、amend 或绕过 hook。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: 保护本地和远程历史

detached、in-progress git operation 或 protected/default branch 必须在 mutation 前停止；禁止 force push、删除 remote branch、修改 git/gh config 或推送 protected history。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: PR 来自整条分支

新 PR 的 title/body 必须综合 base..HEAD commits 与 merge-base diff，正文包含 Summary 和只陈述真实证据的 Test plan；既有 open PR 必须复用且不擅自覆盖 authored content。PR create 使用的临时 body file 在成功、失败或结果模糊后都必须清理。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: Issue 关联可选且唯一

只有显式或 plan 已记录的同仓 canonical Issue 才可加入 closing reference；无关联是正常状态，不得按标题搜索。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: partial state 不回滚

commit、push、PR 任一步失败不得撤销此前成功状态；模糊 PR create 只按 exact head 查询一次，非 GitHub remote 在安全 push 后提供 manual PR/MR handoff。
Verify: [publish state machine](../../tests/publish.test.ts)

### Requirement: 发布状态不升级实现验收

publish 只能 attest 实际 commit、push 与 PR state，并准确转述 candidate stable basis、evidence、Check producer/reference、exact verdict + acceptance-field pair 及 checked basis 是否仍匹配 published candidate；发布 candidate、PR 可 review、重复测试结果或缺少完整 Assurance 的 legacy done 不得被升级为 independent acceptance、Check pass 或 done。
Verify: manual(integration)
