# Release Specification

## Purpose

release skill 用 release unit、version group 与 tag identity 分别表达单 package 和 monorepo 的版本源、版本协调规则与 GitHub 发布身份：从用户显式或跨轮确认的 release set，在远程默认分支通过一次非 tagging、非 committing、非 publishing 的版本事务生成一个 release commit，再为每个 identity 创建精确 tag 与 GitHub-generated notes Release；缺少完整 identity 时先按项目权威版本策略或有界通用 SemVer 回退提出整组候选并等待下一轮确认，不承担部署与制品分发。

## Requirements

### Requirement: 项目发布拓扑必须唯一可核验

release 必须从远程默认分支已提交的仓库指令、版本/发布文档、workspace manifests、lockfile 与 release-tool 配置解析项目发布拓扑：release unit 表示一个权威版本源；fixed、linked 或其他 version group 表示工具定义的 unit 协调约束；tag identity 表示一个 tag/GitHub Release 对一个 unit 或 aggregate units 的映射。每个 unit 必须有成员级 current/target version，每个 identity 必须有精确 tag template，拓扑还须声明允许修改的版本 metadata、已验证的非 tagging/non-committing/non-publishing 版本命令及其 git-side-effect 配置与 dependency propagation。version group 的名称本身不授权推断行为：linked 组成员可保留不同当前版本并只发布 affected subset，fixed 在不同工具中也必须以其权威配置/文档为准。历史 tag 只能验证已解析模板，不能独立发明版本策略或拓扑。来源冲突、package 多重归属、工具 diff 不透明或无法生成精确 release set 时必须零 mutation 停止。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 用户显式 tag 可直接执行

当前 release 请求包含一个或多个精确 tag，且这些 tag identity 自身声明的映射能唯一、可见地确定完整 unit targets 与 tag identities 时，release 必须把它们视为已确认 identity，并可在同一轮进入 preflight 与执行流程。若显式 tag 根据 version group 或依赖传播规则会派生额外 unit target/identity，则必须先显示扩展后的完整 release set，并等待下一轮确认；额外 unit 即使按策略没有自己的 tag 也属于扩展，不能把单 tag 授权扩张为隐式多 package 发布。

显式 tag 只选择精确目标，不绕过版本合法性。对尚不存在、需要新建发布状态的 identity，identity 自身的 version/sequence 与每个 unit target 都必须相对权威 current version、identity/unit baselines 满足项目策略的 successor、version-group、initial-version 和 prerelease 规则。新 identity 必须是合法后继且不得复用既有 identity version；每个实际 changed unit target 必须是合法 forward successor。aggregate identity 覆盖的 member 只有被权威项目策略明确标记 unchanged 时才可等于 current version，这不属于 identity-version 复用；通用 SemVer 回退不得自行发明 aggregate 或 unchanged-member 语义。未经策略允许的相等 target、降级 target 或新 identity version 复用必须零 mutation 停止；既有 identity 与恢复状态继续按统一 predicate 幂等核验。

Verify: [release contract](../../tests/release.test.ts)

### Requirement: 项目权威版本策略优先于通用 SemVer

当前请求没有完整 tag set 时，release 必须用只读查询按 unit/identity 读取当前版本、最新 Release、此后的变化，以及适用的仓库指令、版本/发布文档和已提交 release-tool 配置。存在可唯一应用的项目权威版本策略时必须优先遵循其 version-group affected subset/target、tag aggregation、bump、prerelease、初始版本与依赖传播规则；只有不存在适用策略且目标为不受 group 约束、可唯一映射的 unit 时，才按最高可观察影响回退通用 SemVer：breaking behavior/side effect 为 major，向后兼容 capability 为 minor，向后兼容 fix 为 patch。通用回退不得猜测 fixed/linked 等 version group 是否全员移动、哪些成员发布或目标版本是否同步。不得仅从历史 tag 增量或 commit message 模式推断项目策略；无法唯一解析 workspace 变更或内部依赖影响时必须报告歧义并零 mutation。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 候选 release set 跨轮确认后才允许 mutation

release 给出候选 release set 时必须分别列出每个 `unit: current → target`（含 group/propagation 理由）与每个 `identity: tag → covered units`，并记录远程默认分支 tip、每个 identity 的最新 Release tag/peeled target 或 first-release marker、所有 unit current/target version、发布拓扑与项目策略的 source/content identity。候选必须出现在可见最终回复中，并明确等待用户 confirm the whole set；recommendation turn 必须结束且零 mutation。下一条用户消息无歧义确认整组候选后，release 才可继续，用户不需要重复 tags。

所有路径都必须记录初次解析 topology、policy、unit versions 与 identity baselines 所用的 remote default tip，并在任何 mutation 前 fetch 后从 fetched commit 重新解析。跨轮候选路径还要求 fetched tip 与记录 tip 精确相等，所有 identity baseline、unit target、拓扑和策略 identity 仍一致；任一变化都必须使旧确认失效、基于最新状态重新提议并再次结束该轮，即使文本化候选未变化也须再次确认。当前请求显式 tag 的路径不比较 candidate basis，但重新解析后只有 tag 自身仍确定相同 unit targets/identities、全部 target 仍是合法后继且没有新增传播目标时才可同轮继续；映射变化或 set 扩展必须展示刷新后的完整 set、标记零 mutation，并等待下一轮确认。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 单次版本事务与 release commit

一个 confirmed release set 必须通过一个已验证的非 tagging、非 committing、非 publishing 版本事务更新每个已确认 changed unit、保持每个项目策略声明的 unchanged unit 不变，并且只修改项目拓扑声明的 package-manager/release-tool-owned 版本和依赖 metadata。事务可以是一个命令或仓库声明的确定性命令序列，但运行前必须解析完整预期路径、语义 diff 与工具 commit/staging 配置；事务不得自行 stage、commit 或改变 git refs，也不得发布 registry、部署或生成 changelog/release-note 文件。无法禁用并核验工具 git side effects 时必须在 mutation 前停止；运行后必须确认 HEAD、index 与相关 refs 未变，才可由 release 自己 stage 并创建唯一 release commit。

release 必须只 stage 已解析路径，以确定性的 `chore(release): <release-set-label>` 创建一个正常 single-parent commit。单 identity 的 label 必须等于 tag；多 identity label 必须按项目策略或稳定 unit 顺序确定。commit 在 push 前必须从 committed tree 核验 parent、subject、每个 unit 目标版本、项目定义的 version-group 约束、依赖传播结果、changed paths、semantic version-only diff 与 clean tree。hook/核验/push 失败不得绕过、自动 amend/discard 或转成 PR。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 发布目标必须可核验

working tree 必须 clean，或仅含一个可核验的目标 version-transaction diff；release 必须从 GitHub 解析 default branch，fetch 后只允许 equal、fast-forward、一个经过统一 release-commit predicate 核验的 local release commit ahead，或 default HEAD 等于 remote tip 且只含完整目标 release set metadata 的 diff 恢复状态。其他 dirty、ahead/diverged、无法切换或无法同步必须在后续 mutation 前停止。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 创建并逐 identity 精确推送 tag

只有 release commit 已 push 且经核验可从远程 default branch 到达后，release 才可按确定性 topology 顺序为每个 identity 创建 annotated tag，并逐个只 push `refs/tags/<tag>`。local/remote tag 已存在时仅在 peeled target、covered unit targets 和同一 release commit 一致时复用；不一致必须停止。不得 force、移动、覆盖或删除 tag。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 逐 release identity 幂等恢复

每个 identity 的 local tag、remote tag 与 GitHub Release 必须独立核验和记录；已完成 identity 必须保留，失败时停止在具体 identity，重试只补缺失 identity。已有 Release 返回 URL 与实际 state；tag 存在而 Release 缺失时只创建 Release。对完整或部分既有 set，任何成功/返回路径前都必须先确认所有既有 identity 指向同一经核验 release commit，且该 tree 满足完整 unit targets 与 group/propagation 约束，否则停止。

每个 GitHub Release 必须使用 `--verify-tag --generate-notes`；存在 identity baseline 时使用 `--notes-start-tag <identity-baseline-tag>`，first release 才省略。不得合成或写入 notes 文件；prerelease 只来自用户显式要求或权威项目策略。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 既有发布状态与失败恢复共享同一 predicate

fresh、version-diff recovery、local-ahead recovery、remote commit reuse 必须使用同一个 release-commit predicate。目标 version diff 只在当前 default HEAD 等于 fetched tip、index 未被工具修改、无 conflict/untracked path 且语义上精确生成 confirmed set 时可重试；local-ahead commit 的 parent 必须为 fetched tip。version transaction、commit、branch push、每个 tag 与每个 Release 都是有序恢复点；事务若意外 stage/commit/change refs，必须保留并报告精确 HEAD/index/ref 状态且不得再添加 commit/tag。任一阶段失败不得删除已推送对象、伪装原子成功或越过失败点。模糊外部结果只可查询对应 canonical identity 一次，不得盲重试。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 通用发布仍排除部署与制品

release 不部署、不回滚、不上传 artifact、不生成 repo changelog/release-note 文件、不发布 registry package、不自动创建 PR，也不合并分支；monorepo 支持不能把这些 outcome 顺带吸收。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: GitHub 前置失败不制造半个发布

origin 非 GitHub、gh 未认证、仓库不可访问或 default branch 无法解析时，release 必须在 version transaction、commit、push、tag 与 Release 前停止并报告。
Verify: manual(integration)
