# Release Specification

## Purpose

release skill 从显式版本 tag 在远程默认分支生成一个 package-version release commit，再以精确 git tag 与 GitHub-generated notes 发布同一 commit；它只承担单一根 package 的有界版本准备，不承担部署与制品分发。

## Requirements

### Requirement: 从显式输入或权威版本源确定 tag

release 必须要求显式、精确且能按仓库既有 prefix 映射为唯一 package version 的 tag；缺少 tag、prefix/版本映射不唯一时必须在 mutation 前询问，不得从当前 version、commit、change type 或历史 tag 猜 next version。

(Previously: tag 可按显式输入、项目权威版本源的顺序解析，且 release 不修改版本文件。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 发布目标必须可核验

working tree 必须 clean，或仅含一个可核验的目标 version diff；release 必须从 GitHub 解析 default branch，fetch 后只允许 equal、fast-forward、一个经过 parent/message/version/diff 全量核验的 local release commit ahead，或 default HEAD 等于 remote tip 且只改变权威 version metadata 的 diff 恢复状态。其他 dirty、ahead/diverged、无法切换或无法同步必须在后续 mutation 前停止。

(Previously: target 默认为 HEAD，只要求可从远程 default branch 到达。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 发布前生成并推送版本提交

根 package version 与目标不同时，release 必须使用项目已验证的 non-tagging package-manager command 更新版本，仅 stage 该命令产生的权威 version metadata，以 `chore(release): <tag>` 创建正常 commit；commit 后、push 前必须从 committed tree 重新核验 subject、parent、目标 version、changed paths、semantic version-only diff 与 clean tree，再直接 push default branch。hook/核验/push 失败不得绕过、自动 amend/discard 或转成 PR。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 版本准备只接受单一权威 package

release 只可处理一个权威根 package 与一个已验证的 non-tagging version command；多个独立 version source、workspace policy 不唯一、缺少 version、命令语义未核验或 version diff 含无关路径时必须停止，不得任选策略或宽泛提交。
Verify: manual(integration)

### Requirement: 创建并精确推送 tag

只有 release commit 已 push 且经核验可从远程 default branch 到达后，release 才可创建 annotated tag 并只 push `refs/tags/<tag>`；local/remote tag 已存在时仅在 peeled target 与 package version 一致时复用，不一致必须停止。不得 force、移动、覆盖或删除 tag。

(Previously: tag 只需指向既有 target，不要求同一次 release 先生成版本提交。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 以 tag 创建生成 notes 的 GitHub Release

remote tag 验证后，release 必须使用 `gh release create <tag> --verify-tag --generate-notes` 创建一个 GitHub Release；既有 Release 必须返回其 URL 与实际 state，不得重复创建或静默改写 notes/state。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 既有发布状态幂等恢复

目标 version diff、local/remote release commit、tag 或 Release 已存在时，release 必须核验并只补缺失阶段；version diff 只有在当前 default HEAD 等于 fetched remote tip、无 conflict/untracked path 且语义上只把权威 metadata 改为目标版本时才可重试 commit；fresh、local-ahead recovery 与 remote reuse 必须使用同一个 release-commit predicate，核验 single parent、subject/tag、目标 version、resolved paths 与相对 parent 的 semantic version-only diff，其中 local ahead 的 parent 还必须为 remote tip。历史 tag 内 package version 不一致必须报告且不得回写。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 通用发布仍排除部署与制品

release 不部署、不回滚、不上传 artifact、不生成 repo changelog/release-note 文件、不发布 registry package、不自动创建 PR，也不合并分支；这些能力不得因 version commit 进入 release outcome 而被顺带吸收。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: GitHub 前置失败不制造半个发布

origin 非 GitHub、gh 未认证、仓库不可访问或 default branch 无法解析时，release 必须在 package mutation、commit、push、tag 与 Release 前停止并报告。
Verify: manual(integration)

### Requirement: 部分 side effect 准确保留和报告

version command、local release commit、post-commit validation、default-branch push、local/remote tag 与 GitHub Release 是有序恢复点；任一阶段失败必须保留并报告实际状态，不得删除已推送对象、伪装原子成功或越过失败点继续。模糊外部结果只可查询对应 canonical identity 一次，不得盲重试。

(Previously: 恢复点只覆盖 local/remote tag 与 GitHub Release。)
Verify: [release contract](../../tests/release.test.ts)
