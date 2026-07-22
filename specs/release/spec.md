# Release Specification

## Purpose

release skill 把一个已存在的 commit 以 git tag 与 GitHub-generated release notes 发布，不承担项目版本修改或部署流程。

## Requirements

### Requirement: 从显式输入或权威版本源确定 tag

release 必须按显式 tag、项目唯一权威版本源的顺序解析标识，并沿用仓库既有 `v` 前缀；来源或前缀不唯一时必须询问，不得猜 next version 或修改版本文件。
Verify: manual(integration)

### Requirement: 发布目标必须可核验

默认 target 为 HEAD，用户可显式指定 commit；working tree 必须 clean，target 必须可从远程 default branch 到达。无新 commit 时默认 no-op，除非用户显式确认同 commit alias tag。
Verify: manual(integration)

### Requirement: 创建并精确推送 tag

无 tag 时 release 必须创建 annotated tag 并只 push `refs/tags/<tag>`；local/remote tag 已存在时仅在 target 一致时复用，不一致必须停止。不得 force、移动、覆盖或删除 tag。
Verify: manual(integration)

### Requirement: 以 tag 创建生成 notes 的 GitHub Release

remote tag 验证后，release 必须使用 `gh release create <tag> --verify-tag --generate-notes` 创建一个 GitHub Release；既有 Release 必须返回其 URL，不得重复创建或静默改写 notes/state。
Verify: manual(integration)

### Requirement: 不修改版本也不承担项目发布流程

release 不得修改 package/version 文件，不部署、不回滚、不生成 repo changelog/release-note 文件、不上传 artifact，也不 push branch 或合并 PR。
Verify: manual(integration)

### Requirement: GitHub 前置失败不制造半个发布

origin 非 GitHub、gh 未认证、仓库不可访问或 default branch 无法解析时，release 必须在创建 tag 前停止并报告。
Verify: manual(integration)

### Requirement: 部分 side effect 准确保留和报告

local tag 创建后 push 失败时不得删除 local tag；tag 已推送而 Release 创建失败时不得删 remote tag。模糊结果只可查询一次，不得盲重试或伪装成原子成功。
Verify: manual(integration)
