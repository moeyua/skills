# Publish Specification

## Purpose

publish skill 根据当前 git/GitHub 状态完成尚未满足的 commit、push、pull request 子动作，并准确保留部分成功状态。

## Requirements

### Requirement: 按当前状态完成 commit、push 与 PR

publish 必须先检查 working tree、branch/upstream、remote 与既有 PR，再只执行缺失的子动作；已有相关 commit、已推送分支或 open PR 必须复用，不得制造空 commit、重复 push 或重复 PR。
Verify: manual(integration)

### Requirement: commit 按主题且不泄露敏感信息

publish 必须用具体路径 staging，绝不使用 `git add -A` / `git add .`，不得 stage secret-like 文件或凭据内容；同一主题默认合并，只把可独立回退的不同意图拆开且不超过三个 commit。
Verify: manual(integration)

### Requirement: commit message 跟随项目历史

message 必须学习近期 history；无明显风格时使用 conventional commits，首行不超过 72 字符并表达 intent/why。不得 amend、空提交或以 `--no-verify` 绕过失败 hook。
Verify: manual(integration)

### Requirement: 保护分支与远程历史

publish 在 detached、merge/rebase/cherry-pick 进行中或 main/master/develop/default branch 时必须在 mutation 前停止；不得 force push、改写 upstream、删除远程分支或修改用户 git/gh config。
Verify: manual(integration)

### Requirement: PR 描述综合整条分支

新 PR 的 title/body 必须从 `<base>..HEAD` 全部 commit 与 `<base>...HEAD` merge-base diff 综合，正文必须包含 `## Summary` 与 `## Test plan`，无实际测试证据时不得伪装成已运行。
Verify: manual(integration)

### Requirement: Issue 关联可选且唯一

存在显式或 plan 中同仓 canonical Issue URL 时，publish 必须在面向 default branch 的 PR 使用 closing reference；不存在 Issue 时必须省略关联并正常 publish，不得按标题搜索或创建 Issue。
Verify: manual(integration)

### Requirement: 非 GitHub 与部分失败如实降级

非 GitHub remote 必须在 push 后提供 manual PR/MR body；push 或 GitHub PR 失败不得回滚已完成的 commit/push，也不得声称原子成功。模糊 PR 结果只能按 head 查询一次，不能盲重试。
Verify: manual(integration)
