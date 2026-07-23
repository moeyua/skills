# Release Specification

## Purpose

release skill 从用户显式或跨轮确认的版本 tag 在远程默认分支生成一个 package-version release commit，再以精确 git tag 与 GitHub-generated notes 发布同一 commit；缺少 tag 时先按项目权威版本策略或通用 SemVer 回退给出候选并等待确认，不承担部署与制品分发。

## Requirements

### Requirement: 用户显式 tag 可直接执行

当前 release 请求已经包含可按仓库既有 prefix 映射为唯一 package version 的精确 tag 时，release 必须把它视为已确认 identity，并可在同一轮进入既有 preflight 与执行流程。

(Previously: 所有 release 都要求用户预先给出精确 tag，缺少时只询问。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 项目权威版本策略优先于通用 SemVer

当前请求没有 tag 时，release 必须用只读查询从远程默认分支读取最新 Release、此后的变化、权威根 package，以及适用于它的仓库指令、版本/发布文档和已提交 release-tool 配置。存在可唯一应用的项目权威版本策略时必须优先遵循；只有不存在适用策略时，才按最高可观察影响回退通用 SemVer：breaking behavior/side effect 为 major，向后兼容 capability 为 minor，向后兼容 fix 为 patch。不得仅从历史 tag 增量或 commit message 模式推断项目策略；权威来源冲突或无法产生唯一候选时必须报告冲突并零 mutation。候选 tag、采用的策略来源或通用回退、SemVer 理由与变更证据必须出现在可见的最终回复中。

(Previously: 缺少 tag 时直接按最高可观察影响应用通用 SemVer。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 候选版本跨轮确认后才允许 mutation

release 给出候选 tag 时必须同时记录远程默认分支 tip、作为基线的最新 Release tag/target，以及项目策略来源及内容 identity 或通用回退标记，然后结束当前轮次；该 recommendation turn 不得切换分支、修改版本、commit、push、创建 tag 或 GitHub Release。下一条用户消息无歧义地确认候选后，release 必须在任何 mutation 前用相同只读真源复核这些 identity，并在 fetch 后且切分支或修改 package version 前要求 fetched remote tip 与记录的 basis tip 精确相等、其余 identity 仍未变化。全部相等才允许继续；任一变化都必须使旧确认失效、基于最新状态重新提议并再次结束该轮，即使新候选 tag 相同也要重新确认。上下文已明确唯一候选时，用户无需重复输入 tag；assistant 自己选出的候选不能在同一轮自我确认。
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
