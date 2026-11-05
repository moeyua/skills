# Release Specification

## Purpose

release skill 用 release unit、version group 与 tag identity 分别表达单 package 和 monorepo 的版本源、版本协调规则与 GitHub 发布身份：从用户显式或跨轮确认的 release set，在远程默认分支通过一次非 tagging、非 committing、非 publishing 的发布元数据事务生成一个 release commit；事务始终完成版本与依赖传播，并在仓库已定义版本绑定仓库发布元数据时一并完成该内容，再为每个 identity 创建精确 tag 与 GitHub-generated notes Release。缺少完整 identity 时先按项目权威版本策略或有界通用 SemVer 回退提出整组候选并等待下一轮确认。首次使用先建立 RELEASE.md 和项目 CI 配置；日常版本提交直接进入默认分支，核验其检查与适用部署证据。项目 Workflow 确定事件与目标，公共 CI 执行构建和部署。

## Requirements

### Requirement: 项目发布拓扑必须唯一可核验

release 必须从远程默认分支已提交的 RELEASE.md、仓库指令、规格、版本/发布文档、代码、测试、workspace manifests、lockfile 与 release-tool 配置解析项目发布拓扑：release unit 表示一个权威版本源；fixed、linked 或其他 version group 表示工具定义的 unit 协调约束；tag identity 表示一个 tag/GitHub Release 对一个 unit 或 aggregate units 的映射。每个 unit 必须有成员级 current/target version，每个 identity 必须有精确 tag template，拓扑还须解析允许修改的版本 metadata、已验证的 non-tagging/non-committing/non-publishing 事务、dependency propagation，以及项目是否已有与 unit/version 强绑定的仓库发布元数据。存在这种元数据时必须从权威事实确定其版本映射、既有结构与约束、允许路径、内容依据或项目生成工具；不存在时不得创建文件或占位条目。除必需的项目规则入口 RELEASE.md 外，不得要求额外统一版本 manifest、固定元数据文件名或共享 schema。初始化配置不作为版本绑定元数据混入版本提交。version group 名称、常见 changelog 文件名、历史 tag 或历史编辑习惯都不能独立发明拓扑、内容所有权或版本策略；来源冲突、package 多重归属、工具 diff 不透明或无法生成精确 release set 时必须零 mutation 停止。

(Previously: 发布拓扑只覆盖版本、依赖 metadata 与工具配置，并一律排除仓库内 release-note 文件。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 用户显式 tag 可直接执行

当前 release 请求包含一个或多个精确 tag，且这些 tag identity 自身声明的映射能唯一、可见地确定完整 unit targets、tag identities 与项目要求的仓库发布元数据时，release 必须把它们视为已确认 identity，并可在同一轮进入 preflight 与执行流程。既有匹配内容、用户精确提供的内容或项目工具唯一确定的内容本身不增加确认轮次；若显式 tag 根据 version group、依赖传播或 Agent 新归纳的实质性用户可见仓库发布内容扩展 release set，则必须先显示扩展后的完整集合并等待下一轮确认，不能把 tag 授权静默扩张为额外 package 或任意日志正文。

显式 tag 只选择精确目标，不绕过版本合法性。对尚不存在、需要新建发布状态的 identity，identity 自身的 version/sequence 与每个 unit target 都必须相对权威 current version、identity/unit baselines 满足项目策略的 successor、version-group、initial-version 和 prerelease 规则。新 identity 必须是合法后继且不得复用既有 identity version；每个实际 changed unit target 必须是合法 forward successor。aggregate identity 覆盖的 member 只有被权威项目策略明确标记 unchanged 时才可等于 current version，这不属于 identity-version 复用；通用 SemVer 回退不得自行发明 aggregate 或 unchanged-member 语义。未经策略允许的相等 target、降级 target 或新 identity version 复用必须零 mutation 停止；既有 identity 与恢复状态继续按统一 predicate 幂等核验。

(Previously: 只有派生 unit target 或 identity 被视为显式 tag 所确定集合的扩展。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 项目权威版本策略优先于通用 SemVer

当前请求没有完整 tag set 时，release 必须用只读查询按 unit/identity 读取当前版本、最新 Release、此后的变化，以及适用的 RELEASE.md、仓库指令、版本/发布文档和已提交 release-tool 配置。存在可唯一应用的项目权威版本策略时必须优先遵循其 version-group affected subset/target、tag aggregation、bump、prerelease、初始版本与依赖传播规则；只有不存在适用策略且目标为不受 group 约束、可唯一映射的 unit 时，才按最高可观察影响回退通用 SemVer：breaking behavior/side effect 为 major，向后兼容 capability 为 minor，向后兼容 fix 为 patch。通用回退不得猜测 fixed/linked 等 version group 是否全员移动、哪些成员发布、目标版本是否同步或仓库发布元数据是否存在。不得仅从历史 tag 增量或 commit message 模式推断项目策略；无法唯一解析 workspace 变更或内部依赖影响时必须报告歧义并零 mutation。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 候选 release set 跨轮确认后才允许 mutation

release 给出候选 release set 时必须分别列出每个 `unit: current → target`（含 group/propagation 理由）与每个 `identity: tag → covered units`；适用时还须列出版本绑定仓库发布元数据的目标、状态、来源 identity，以及 Agent 归纳的实质性用户可见正文。候选必须记录远程默认分支 tip、每个 identity 的最新 Release tag/peeled target 或 first-release marker、所有 unit current/target version、发布拓扑及项目策略/仓库发布元数据的 source/content identity，并在可见最终回复中明确等待用户 confirm the whole set；recommendation turn 必须结束且零 mutation。仓库没有这种元数据时不得增加占位字段或额外确认轮次。

所有新版本事务路径都必须记录初次解析 topology、policy、unit versions、identity baselines 与仓库发布元数据所用的 remote default tip，并在任何 mutation 前 fetch 后从 fetched commit 重新解析。跨轮候选路径要求 fetched tip 与记录 tip 精确相等，所有 identity baseline、unit target、拓扑、策略及元数据 identity 仍一致；任一变化都必须使旧确认失效、基于最新状态重新提议并再次结束该轮。当前请求显式 tag 的路径不比较 candidate basis，但重新解析后只有 tag 与项目规则仍确定相同完整集合时才可同轮继续；映射变化、集合扩展或新增 Agent 归纳的实质性正文必须展示刷新候选、标记零 mutation 并等待下一轮确认。

(Previously: 候选与 basis 只记录 unit、identity、拓扑和版本策略。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 单次版本事务与 release commit

一个 confirmed release set 必须通过一个已验证的非 tagging、非 committing、非 publishing 发布元数据事务更新每个已确认 changed unit、保持项目策略声明的 unchanged unit 不变、完成依赖传播，并在适用时生成已确认或由项目唯一确定的版本绑定仓库发布元数据。事务可以是一个命令或确定性序列，可组合仓库既有工具与遵循既有结构的有界编辑；项目没有这种元数据时不得创建 changelog、日志条目或占位文件。运行前必须解析完整预期路径与语义结果并核验工具 git side effects；事务不得自行 stage、commit 或改变 git refs，也不得发布 registry 或部署。运行后必须确认 HEAD、index 与相关 refs 未变，并运行足以覆盖已改发布元数据的项目权威验证，失败时停在实际 diff。

release 必须只 stage 已解析路径，以确定性的 `chore(release): <release-set-label>` 创建一个正常 single-parent commit。单 identity 的 label 必须等于 tag；多 identity label 必须按项目策略或稳定 unit 顺序确定。commit 在 push 前必须从 committed tree 核验 parent、subject、每个 unit 目标版本、version-group 约束、依赖传播、适用的仓库发布元数据、changed paths、相对 parent 的完整语义 diff 与 clean tree。版本事务前必须核验发布身份在实际 ruleset/分支保护下具有直推权限；版本提交直接推送默认分支，不走 PR。hook/核验/push 失败不得绕过、自动 amend/discard、放宽保护规则或转成 PR。

(Previously: 事务与 release-commit predicate 只允许版本及依赖 metadata，并要求 semantic version-only diff。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 发布目标必须可核验

working tree 必须 clean，或仅含一个可核验的目标 release-metadata diff；release 必须从 GitHub 解析 default branch，fetch 后只允许 equal、fast-forward、一个经过统一 release-commit predicate 核验的 local release commit ahead，或 default HEAD 等于 remote tip 且只含完整目标 release set metadata 的 diff 恢复状态。其他 dirty、ahead/diverged、无法切换或无法同步必须在后续 mutation 前停止。

(Previously: 唯一可接受的本地 diff 被称为 version-transaction diff。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 创建并逐 identity 精确推送 tag

只有 release commit 已 push、可从远程 default branch 到达、committed tree 满足完整 release set，且该提交所需检查及适用的 Preview 验证通过后，release 才可按确定性 topology 顺序为每个 identity 创建 annotated tag，并逐个只 push `refs/tags/<tag>`。local/remote tag 已存在时仅在 peeled target、covered unit targets、适用仓库发布元数据和同一 release commit 一致时复用；不一致必须停止。不得 force、移动、覆盖或删除 tag。
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 逐 release identity 幂等恢复

每个 identity 的 local tag、remote tag 与 GitHub Release 必须独立核验和记录，仓库发布元数据作为共享 release state 单独记录；已完成状态必须保留，失败时停止在具体位置，重试只补缺失状态。已有 Release 返回 URL 与实际 state；tag 存在而 Release 缺失时只创建 Release。对完整或部分既有 set，任何成功/返回路径前都必须先确认所有既有 identity 指向同一经核验 release commit，且该 tree 满足完整 unit targets、group/propagation 与适用仓库发布元数据约束，否则停止。

每个 GitHub Release 必须使用 `--verify-tag --generate-notes`；存在 identity baseline 时使用 `--notes-start-tag <identity-baseline-tag>`，first release 才省略。GitHub-generated notes 与版本绑定仓库发布元数据是不同输出，前者不得替代或重复后者；prerelease 只来自用户显式要求或权威项目策略。

(Previously: 幂等状态只覆盖 unit targets、tags、GitHub Releases 与 GitHub-generated notes。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 既有发布状态与失败恢复共享同一 predicate

fresh、release-metadata-diff recovery、local-ahead recovery、remote commit reuse 必须使用同一个 release-commit predicate。目标 diff 只在当前 default HEAD 等于 fetched tip、index 未被工具修改、无 conflict/untracked path、所有 changed paths 已解析且语义上精确生成包含适用仓库发布元数据的 confirmed set 时可重试；local-ahead commit 的 parent 必须为 fetched tip。metadata transaction、commit、branch push、每个 tag 与每个 Release 都是有序恢复点；事务若意外 stage/commit/change refs，必须保留并报告精确 HEAD/index/ref 状态且不得再添加 commit/tag。任一阶段失败不得删除已推送对象、伪装原子成功或越过失败点。模糊外部结果只可查询对应 canonical identity 一次，不得盲重试。

(Previously: 可恢复 diff 与统一 predicate 只验证版本及依赖 metadata。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: 发布接入与执行职责边界

Release 负责发布规则、首次 CI 接入、版本/Tag/GitHub Release 及部署证据观察；项目 caller 决定触发与目标，公共 CI 执行构建、制品传递和部署。初始化 PR 由 Publish 在已有授权范围内交付；Release 不合并分支，版本提交不转成 PR。不新增手动部署、回滚、独立 artifact/registry 发布或 release-train 管理，不为没有版本绑定元数据的项目发明 changelog/log 体系。小程序公共路径只上传开发版，不提交审核或正式发布。

(Previously: 所有 repo changelog/release-note 文件无条件排除在 release outcome 外。)
Verify: [release contract](../../tests/release.test.ts)

### Requirement: GitHub 前置失败不制造半个发布

origin 非 GitHub、gh 未认证、仓库不可访问或 default branch 无法解析时，release 必须在 release metadata transaction、commit、push、tag 与 Release 前停止并报告。
Verify: manual(integration)

### Requirement: release state 不替代实现证据

release 只能 attest 已核验的 release metadata commit、tag、GitHub Release state 及实际产生的检查/目标观察；Tag 或 GitHub Release 成功不推定部署成功，部署状态必须单独报告；成功创建或复用 release identity 不得被升级为缺失的实现证据、Verify pass 或产品 outcome 证明。上游 Review 或 Verify 结果按记录转述，包括后续冲突证据，不由 release state 推定。历史 Check 记录保持原来源与时间范围，不改写为 Verify 证明。
Verify: manual(integration)

### Requirement: 项目规则与首次接入

首次使用必须检查仓库和 GitHub 现状，缺少 RELEASE.md 时在工作分支建立项目规则并准备必要 caller。文档记录版本/单元/Tag 对应、版本事务与允许路径、PR 检查和 rebase 约定、版本提交直推权限、触发方式、环境用途/机制/非敏感目标、命令、公共 CI ref、Secret 引用与验证恢复方式；不记录凭据或每次运行日志。已有文档须与真实配置核对，冲突不猜，未合并配置不算可日常发版。初始化配置与版本提交分离，配置 PR 的合并及首次正式版本需要各自既有授权。

接入继续复用选定已发布 MediaStorm 公共 CI，读取真实接口、保留项目工具链、逐项映射 Secrets，先核对会触发部署所需的外部权限与目标。caller 一开始即使用最终自动事件，不引入手动部署阶段、试验正式 Tag 或第二个启用自动化 PR。双环境先通过真实默认分支事件验证 Preview，再通过第一次获授权真实发版验证 Production；期间准确报告 Production 待验证。文件存在或配置检查通过不代表完整接入成功，重入根据实际配置与证据续接。
Verify: manual(integration)

### Requirement: 项目部署配置

有部署需求时支持仅默认分支、仅 Tag、两者同时触发；两者同时存在时默认分支部署 Preview、Tag 部署 Production，Preview 为共享主分支环境。仅一种触发不增加另一环境，网络位置不决定模式。无运行时目标的仓库只建立版本发布约定，不创造部署资源；小程序只记录开发版上传事实。每个独立单元有独立的 Tag、产物和目标并发范围。Tag 的格式、版本/单元对应及提交可达性必须在构建、上传和部署前验证，后续构建绑定精确 Tag commit。
Verify: manual(integration)

### Requirement: 版本提交检查与部署证据

release commit R 直推后，必须把项目检查及部署 run 的 workflow、event/ref、head SHA、run/attempt、产物/镜像身份与 R 对齐。双环境的新 Tag 必须等待 R 的检查、Preview 部署及实际目标验证；其他提交或过期/取消/缺失结果不可替代。Preview 被后续提交覆盖且没有 R 的有效观察时，停在缺失证据处，不验证更新后的页面作为 R，也不强制锁仓或手动部署。无 Preview 的配置只遵循自身验证要求。

Tag 后按每个 exact identity/ref 观察真实部署和实际目标，不读取 latest main 作为发布对象，不把同 SHA 的其他 Tag/run 当成当前发布。默认分支前进不改变 R 或既有 Tag；远程历史发布恢复核验原 committed tree 和可达性，不要求 R 等于最新 tip，不重新 bump。检查、Tag、Release、部署分别保留部分状态；现存 Tag 本身不是检查/部署证明，也不因补 GitHub notes 强制重部署。相同代码的基础设施重跑须有相应授权并复核 ref/commit/目标及预期载荷；代码修复走新 PR 与后续版本，不能移动旧 Tag。等待环境审批、排队或目标不可观察都报告真实未完成状态。
Verify: manual(integration)
