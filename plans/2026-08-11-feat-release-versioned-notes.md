---
mode: feat
title: 让 Release 管理版本绑定的仓库内更新日志
created: 2026-08-11
status: done
issue: https://github.com/moeyua/skills/issues/38
---

# 让 Release 管理版本绑定的仓库内更新日志

## Building

让 `release` 对一个 release set 所需的完整仓库发布元数据负责：始终更新已解析的版本与依赖元数据；当仓库权威证据表明存在与版本强绑定的仓库内更新日志时，同时准备该版本的日志内容、验证完整 diff，并在同一个 release commit 中提交。仓库没有这种日志时保持现有 version-only 行为，不创建新的 changelog 或 release-note 体系。

Agent 继续拥有具体探测与执行判断：从仓库指令、规格、代码、测试和既有发布工具识别日志约束，适配项目已有路径与格式，并选择足以证明结果的验证方式。Skill 只规定可观察结果和高后果安全边界，不引入统一配置、固定文件名、固定 schema 或僵化命令流水线。

## Not building

- 不要求项目新增 release manifest、专用脚本、统一日志文件名或统一字段结构。
- 不把普通 README、设计文档、迁移说明或任意 changelog 自动纳入 release；只有可唯一识别的版本绑定发布元数据属于事务。
- 不让 `release` 凭空创建仓库原本不存在的更新日志体系。
- 不改变 deployment、rollback、artifact upload、registry publish、自动 PR 或合并分支仍不属于 `release` 的边界。
- 不把 GitHub-generated Release notes 与仓库内、随产品构建交付的更新日志混为同一个 artifact。
- 不用精确提示词、固定步骤顺序或单一实现路径替代 Agent 的仓库级判断。

## Approach

在现有 release topology、release set 和单一可恢复事务之上，引入“可选的版本绑定仓库发布元数据”概念，而不是新增一种固定日志产品。模型层负责判断这种元数据是否存在、其内容是否已经确定以及它是否扩展了待确认的 release set；执行层允许一个确定性序列同时产生版本与已识别日志 diff；恢复层用同一个扩展后的 release-commit predicate 核验 fresh、version-diff、local-ahead 和 remote reuse 状态。

主 `SKILL.md` 只表达所有权、何时加载 model/execution/recovery reference 以及不可越过的外部副作用边界。日志识别、候选内容、允许路径、语义 diff 和恢复细节留在条件 reference 中。测试保护“有则共同发布、无则不创建、歧义则不猜、发布对象可恢复”这些行为，不锁死文件名、格式或逐命令脚本。

## Key decisions

- 版本号和已存在的版本绑定更新日志属于同一个 release metadata outcome；把日志预先交给 Implement/Publish 不是通用必经阶段。
- 是否存在仓库内更新日志由 Agent 从权威仓库事实判断，不要求显式配置，但仅凭常见文件名或历史习惯不足以发明所有权。
- Agent 推导出的用户可见日志正文如果实质扩展了待发布内容，应复用现有候选确认机制使完整 release set 可见；已经存在、由项目工具确定或由用户精确提供的内容不机械增加额外确认轮次。
- release commit 可以包含版本、依赖传播和已解析的日志元数据，不再要求 semantic version-only；仍必须是边界明确、语义可验证的单一 release transaction。
- GitHub Release 继续使用 GitHub-generated notes；仓库内日志是可选的第二个发布输出，两者各自按项目既有用途存在。
- 保持轻量上下文原则：只增加能够改变判断或保护公开不可逆状态的约束，其余探测、内容归纳、命令选择与验证深度由 Agent 决定。

## Interface boundary

- **Actor / entry:** 用户请求一个显式或由项目策略推导的 GitHub release set。
- **Repository inputs:** 远程默认分支中的仓库指令、规格、版本/发布文档、代码、测试、manifest、lockfile、release-tool 配置与已有版本绑定日志；不要求其中任一固定形态。
- **Candidate:** 每个 unit target 与 tag identity 保持现有可见性；当 Agent 需要生成实质性的仓库内日志内容时，候选同时展示足以确认的日志正文及其仓库依据。
- **Success:** 同一个已验证并推送的 release commit 包含完整目标版本、依赖传播结果和仓库要求的目标版本日志；随后每个精确 tag 与 GitHub Release 指向该 commit。
- **No-log success:** 仓库不存在版本绑定日志时，只修改项目既有版本/依赖元数据，不创建日志文件或条目。
- **Failure:** 日志所有权、目标版本映射、格式或完整内容无法唯一确定，实际 diff 越界，或仓库验证失败时，在下一项公开副作用前停止并报告准确状态。
- **Internal freedom:** 文件发现、格式适配、变更摘要方式、工具调用、验证命令和微观顺序由 Agent 按仓库证据选择，只受 release set、diff、confirmation 和 recovery 不变量约束。

## Public surface changes

- `release` 的仓库写入从“版本与依赖 metadata”扩展为“版本、依赖以及项目已有且与版本绑定的发布 metadata”。
- 候选 release set 在必要时包含 Agent 推导的仓库内更新日志正文，使一次确认覆盖实际将发布的用户可见内容。
- release 结果报告区分仓库内日志与 GitHub-generated notes，并说明前者是生成、复用、不适用还是因歧义阻塞。
- fresh、失败恢复和既有 release commit 复用都按同一个包含可选日志的 predicate 判定。

## Spec delta

- MODIFIED `项目发布拓扑必须唯一可核验`：拓扑除版本源、identity、版本工具和依赖传播外，还可包含由仓库权威事实确定的版本绑定发布元数据；不要求固定配置或 schema，无法唯一识别时不得猜测。
- MODIFIED `用户显式 tag 可直接执行`：精确 tag 仍可直接确定版本 identity；若完成发布还需要 Agent 新生成实质性的用户可见日志内容，则该新增内容按现有 expanded-set 判断决定是否先可见确认，而不是由 tag 静默授权任意正文。
- MODIFIED `候选 release set 跨轮确认后才允许 mutation`：候选 basis 在适用时记录版本绑定日志的来源与已确认内容；没有此类日志的仓库不增加候选字段或确认轮次。
- MODIFIED `单次版本事务与 release commit`：允许一个 non-tagging、non-committing、non-publishing 的确定性序列产生版本、依赖传播和已解析日志 metadata；release-commit predicate 验证完整语义 diff，不再限定 version-only。
- MODIFIED `逐 release identity 幂等恢复`：GitHub-generated notes 保持现有行为，同时报告并复用匹配的仓库内日志状态。
- MODIFIED `既有发布状态与失败恢复共享同一 predicate`：可恢复 diff 与 commit 必须精确满足目标 release set 所需的版本、依赖和可选日志内容，任何额外路径或不匹配内容均停止。
- MODIFIED `通用发布仍排除部署与制品`：移除对所有仓库内 release-note 文件的一刀切禁止，改为仅允许项目已有、可唯一识别且与版本绑定的发布 metadata；仍不创建任意 changelog、自动 PR、部署或分发制品。

## Acceptance scenarios

### Scenario: 项目具有版本绑定更新日志

- **Given** 远程默认分支的规格、测试或代码唯一表明每个包版本必须存在一个仓库内日志条目，当前目标版本尚无该条目
- **When** 用户请求 release，Agent 从上个 release 后的变化准备完整 release set
- **Then** 候选在必要时包含目标版本日志正文，确认后版本与日志进入同一个经过验证的 release commit，tag 和 GitHub Release 才在该 commit 推送后创建

### Scenario: 项目没有仓库内更新日志

- **Given** 权威仓库事实没有定义与版本绑定的日志 artifact
- **When** 用户请求一个合法 release set
- **Then** release 保持版本/依赖 metadata、tag 和 GitHub Release 行为，不创建 changelog、release-notes 文件或占位条目

### Scenario: 精确 tag 仍需要 Agent 起草日志

- **Given** 用户提供精确 tag，但仓库要求目标版本日志且正文既不存在、也不能由确定性项目工具唯一生成
- **When** release 解析完整待发布内容
- **Then** Agent 不把 tag 当作对任意日志文案的隐式授权，而按内容是否实质扩展 release set 决定展示候选；确认覆盖版本 identity 和实际用户可见正文

### Scenario: 既有目标日志可以复用

- **Given** 远程默认分支已存在符合项目规则、版本与内容均匹配的目标日志条目
- **When** release 解析或恢复同一个 release set
- **Then** 它复用既有内容，不重复追加、不改写已经确定的正文，也不因此机械增加确认轮次

### Scenario: 日志线索存在但所有权或格式不唯一

- **Given** 多个文件或规则对目标版本日志给出冲突含义，或只能从文件名和历史习惯猜测
- **When** release 尝试建立完整 release topology
- **Then** 它报告冲突证据并零 mutation 停止，不任选路径、不新建日志体系，也不退化为已知会失败的 version-only 发布

### Scenario: 完整事务验证或 commit hook 失败

- **Given** 版本与日志 diff 已生成，但出现未解析路径、内容不满足仓库校验，或 hook 改写了实际 commit
- **When** release 在默认分支 push 前核验完整事务
- **Then** 它保留并报告精确 diff 或本地 commit/status，在 push、tag 和 GitHub Release 前停止，不自动丢弃、amend 或吞入额外改动

### Scenario: 从完整 release metadata 状态恢复

- **Given** 先前执行留下了仅包含目标版本、依赖传播和已确认日志的工作树 diff、本地 release commit 或远程 release commit
- **When** 用户以同一个 release set 重跑
- **Then** release 用统一 predicate 复用已完成状态并只补后续缺失动作；任何正文、版本、basis 或额外 diff 不匹配时停止

### Scenario: 不同仓库采用不同日志结构

- **Given** 两个仓库分别使用 TypeScript 数据目录与 release-tool 管理的 Markdown changelog，且两者都能从权威事实确定版本绑定关系
- **When** Agent 分别执行 release
- **Then** 两者满足同一可观察 outcome，但 Agent 无需寻找统一文件名、字段 schema、配置键或固定命令序列

## Implementation steps

1. 先用 Release 契约测试锁定可选版本绑定日志的行为边界。
   - outcome: 测试表达有日志则纳入完整 release set、无日志则保持 version-only、Agent 推导内容按实质扩展判断确认、歧义不猜、统一 predicate 可恢复以及主入口继续轻量；当前 blanket exclusion 和 version-only predicate 使新增断言取得 red 证据。
   - scope: `tests/release.test.ts`
   - verify: `pnpm exec vp test run tests/release.test.ts` 在 runtime contract 修改前仅因新增行为断言失败。
2. 扩展 release set 模型与轻量入口的所有权边界。
   - outcome: 主 Skill 简洁声明版本绑定仓库 metadata 属于 release outcome，并按需路由；model reference 让 Agent 从权威事实识别可选日志、形成必要候选与 basis，同时避免固定配置、文件名、schema 和无条件确认。
   - scope: `skills/release/SKILL.md`, `skills/release/references/model.md`
   - verify: `pnpm exec vp test run tests/release.test.ts` 通过 topology、candidate、absence 和 ambiguity 相关断言，且人工复核主文件未演变为逐步工作流。
3. 将执行和恢复谓词从 version-only 扩展为完整 release metadata。
   - outcome: 一个可验证的确定性事务可更新版本、依赖和已解析日志路径；commit、push、tag 顺序保持，fresh/diff/local-ahead/remote reuse 共用扩展 predicate，GitHub-generated notes 与仓库内日志分别报告。
   - scope: `skills/release/references/execution.md`, `skills/release/references/recovery.md`
   - verify: `pnpm exec vp test run tests/release.test.ts` 通过 transaction、commit predicate、partial failure、reuse 和 bounded exclusion 断言。
4. 同步 Release 规格、产品边界与公共说明。
   - outcome: Spec 合并本计划的 requirement 修改；PRODUCT 不再一刀切排除仓库已有的版本绑定日志，同时继续禁止 release-train 扩张；ARCHITECTURE 记录可选 metadata 的数据流与统一恢复谓词；Resolver 和双语 README 准确描述扩展后的 outcome，且不增加固定全局工作流。
   - scope: `specs/release/spec.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `skills/RESOLVER.md`, `README.md`, `README.zh-CN.md`
   - verify: `rg -n "changelog|release-note|release notes|version-only|版本元数据" skills/release specs/release PRODUCT.md ARCHITECTURE.md skills/RESOLVER.md README.md README.zh-CN.md` 的剩余命中均符合新边界；`node skills/doctor/scripts/checker.ts . --json` 返回空 findings。
5. 运行完整项目门禁并人工检查 Agent 自主性没有被机械测试反向锁死。
   - outcome: Release 定向测试、全量测试、lint、格式/类型检查、文档链接检查与 diff hygiene 全部通过；契约测试只保护结果与安全不变量，不要求固定路径、schema、配置或命令顺序。
   - scope: 本计划列出的全部路径
   - verify: `pnpm check && pnpm test && pnpm lint && node skills/doctor/scripts/checker.ts . --json && git diff --check`。

## Verification

- command: `pnpm exec vp test run tests/release.test.ts`
- command: `pnpm check`
- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [x] 有版本绑定仓库日志的项目由 `release` 在同一 release set 和 commit 中完成版本与日志。
  - [x] 没有这种日志的项目保持现有行为，不产生新文件、占位条目或额外确认。
  - [x] Agent 可以适配不同日志路径、格式和项目工具，Skill 与测试没有要求统一 schema 或固定命令流水线。
  - [x] Agent 推导的实质性用户可见正文在公开发布前可见，但确定性或既有内容不会机械增加确认轮次。
  - [x] fresh、失败恢复和既有远程状态使用同一个包含可选日志的 release-commit predicate。
  - [x] deployment、rollback、artifact、registry publish、自动 PR 和无权威依据的 changelog/log 体系创建仍明确排除。

## Assumptions & risks

- **“版本绑定”需要权威证据。** 规格、测试、代码消费关系或项目发布工具可以共同建立事实；仅有常见文件名或历史提交模式不足。实现应给 Agent 判断空间，但必须能解释采用或排除某个 artifact 的依据。
- **用户可见文案不总是确定性的。** 变更归纳可能存在多种合理表达；通过现有候选模型暴露实质性新增内容，而不是规定每个 tag 都固定多一轮确认。
- **允许路径扩大增加误提交风险。** 扩展 predicate 必须验证语义内容和目标 release set，不能因为路径被识别为日志就接受文件内任意改动。
- **恢复状态组合增多。** 仍维持一个统一 predicate，避免为每种日志格式建立独立状态机或兼容分支。
- **过度测试会削弱 Agent 自主性。** 测试应断言 ownership、absence、ambiguity、confirmation、diff 和 recovery 等可观察不变量，不匹配精确 prose 或微观步骤。
