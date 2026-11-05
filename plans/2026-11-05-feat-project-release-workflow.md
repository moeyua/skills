---
mode: feat
title: 统一项目发布接入与日常发版
created: 2026-11-05
status: done
issue: https://github.com/moeyua/skills/issues/66
---

# 统一项目发布接入与日常发版

## Building

让使用者通过 Publish 完成 PR 发布、检查及明确要求的 rebase 合并，通过 Release 完成项目首次发布配置和后续版本发布。Release 首次写入项目的 `RELEASE.md`，接入现有 MediaStorm 公共 CI，之后依据项目约定执行；以真实的默认分支部署和首次 Tag 发布验证接入结果，不增加手动部署阶段。Release 接替独立 onboard-ci，保留现有版本集合、版本绑定元数据、精确 Tag、GitHub Release 和幂等恢复能力。

这是一个跨两个技能的完整发布能力变更。用户已明确授权按本计划实现，包括安装替换；PR、合并、版本发布和业务部署仍需各自的授权。

## Not building

- 不开发或改写 MediaStorm 公共 Workflow，不构建跨 CI 平台的通用部署框架，不增加运行时调度器。
- 不把 PR 检查或合并交给 Release，不让 Publish 默认合并，不让版本提交改走 PR。
- 不保留 onboard-ci 的独立入口、别名或兼容转发，不照搬旧的禁止 Preview、按公开/内部属性强制选择环境、手动部署后再启用自动事件的规则。
- 不新增回滚、任意服务器脚本、独立 registry 发布、小程序审核或正式发布能力；公共 CI 原本需要的镜像推送或制品传递仍由相应 Workflow 执行。
- 不引入 release-it、release-please 或新的版本工具依赖。release-it 是本次讨论的参考，现有项目工具及 Release 事务继续承担版本操作。
- 不增加第七类持久记忆，不强制创建 changelog，不重写历史计划，不升级无关依赖或重构其他技能。

## Key decisions

以下均来自本次用户决定及已确认的设计：

1. Publish 管 PR 发布与 CI 检查；只有用户明确要求合并时才执行，方式固定为 rebase。
2. 有部署需求的项目支持三种配置：仅默认分支部署、仅 Tag 部署、默认分支与 Tag 都部署。双环境配置固定为默认分支 → Preview、Tag → Production；Preview 是共享的主分支环境，不是每个 PR 的临时环境。实际默认分支从仓库读取，不硬编码 `main`。
3. Release 首次创建 `RELEASE.md` 并完成 CI 设置，之后根据它执行日常发版；继续复用 MediaStorm 公共 CI。
4. 版本提交直接推送远程默认分支，不开 PR。首次配置必须核对执行身份确实具备该权限，Release 自身严格校验允许路径和完整语义 diff。
5. 首次接入直接使用最终自动事件。双环境项目先验证 Preview，Production 留待首次真实发版验证；不要求额外手动部署、试验性正式 Tag 或第二个“启用自动化”PR。
6. 双环境下，版本提交 R 会再次触发 Preview；R 自身检查及 Preview 验证通过后才推送指向 R 的 Tag。Tag、GitHub Release 和实际部署分别报告结果。
7. 用 RELEASE.md 记录项目规则，用项目 Workflow 固定事件、目标和参数，用公共 CI 执行构建与部署；环境名、部署机制、目标身份分别表达，不建立排列组合式公共接口。

## Evidence

- `skills/engineering/publish/SKILL.md` 目前禁止 merge；其 `references/pull-request.md` 负责 PR 创建/复用，但缺少对当前 PR 的必需 CI 检查和受授权的 rebase 合并契约。
- `skills/engineering/release/{SKILL.md,references/model.md,references/execution.md,references/recovery.md}` 已支持单包和 monorepo、版本绑定元数据、一个版本提交直推默认分支、逐 identity Tag/Release 及部分状态恢复；目前不负责项目初始化和部署观察。现有 spec 中“不要求固定文件名”针对发布拓扑，需与新增的项目规则入口区分。
- `PRODUCT.md`、`ARCHITECTURE.md`、`skills/RESOLVER.md`、双语 README、工程分类 README、`specs/{publish,release}/spec.md` 及对应测试都描述当前旧边界，必须随实现更新。公共技能清单仍为 13 个。
- onboard-ci 源材料在 `/Users/moeyua/.agents/skills/onboard-ci/SKILL.md` 与 `references/ci-contract.md`；它不在本仓库。`/Users/moeyua/.claude/skills/onboard-ci` 是指向该目录的符号链接，本次检查未发现 `/Users/moeyua/.codex/skills/onboard-ci`。安装是快照，源码改动不会自动替换安装副本。
- 已核对本机 `storminfra-frontend` 仓库中 `ci-v2` 的提交 `127046bb4cb855a62559c1932622cd04168dfd2c`：COS 的 `environment` 为 string；Docker 支持 `managed_config`、`compose_file`、`RUNTIME_ENV_FILE`，但不提供同名 environment 输入；小程序接口只上传开发版。该记录是本机 ref 的观察，实施时再次读取选用的已发布接口，不宣称它是永远不变的最新版本。
- 当前项目使用 pnpm 11.5.1、Vite+ 和 TypeScript；测试入口来自 `package.json`，无需新依赖。`gh pr merge --help` 支持 `--rebase` 和 `--match-head-commit`，可限定要合并的已检查 PR head。
- 参考成熟分工：[GitHub 复用 Workflow](https://docs.github.com/en/actions/concepts/workflows-and-actions/reusing-workflow-configurations)、[事件与分支/Tag 过滤](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)、[release-it](https://github.com/release-it/release-it)。采用项目配置与公共执行分离的方式，不复制工具默认的广泛 staging、follow-tags 或 registry 发布副作用。

## Interface boundary

### Publish

输入为用户要求的提交/PR 工作，或明确指定的合并动作。已有 PR 可以直接进入检查或合并，无需为了合并制造新提交。检查当前 head 对应的必需检查、评审要求、draft 状态和可合并性；pending、失败、缺失或过期证据不得当作通过。没有必需检查的仓库须根据已记录的项目检查约定报告实际证据，不能声称不存在的检查已通过。

合并前再次读取 PR head 和条件，使用精确 head 约束的 rebase 合并并核验结果。head 改变则重新检查；不降级为 squash/merge commit，不用管理员绕过、自动合并队列替代、force push 或自动修复冲突。没有合并授权就返回可审阅 PR 和检查结果。commit/push/PR、检查和合并分别保留真实部分状态。

### Release 初始化及项目文档

缺少 `RELEASE.md` 时，先读取项目与 GitHub 的已有事实，再生成规则文档及必要的最小 CI caller 改动；已有文档时核对它与 Workflow、工具配置的对应关系，不能仅凭文件存在判定接入完成。规则冲突或必需目标信息缺失时报告具体缺口，不静默覆盖或执行另一套默认流程。

`RELEASE.md` 是人工可读的项目文档，不引入解析器或固定机器 schema。至少记录：实际默认分支；版本源和 release unit/tag 对应关系；版本递增及发布元数据规则；版本事务与允许路径；PR 检查及 rebase 约定；直推版本提交所需身份权限；项目选用的触发方式；每个实际环境的用途、机制、非敏感目标、构建配置与验证方式；精确 Workflow/check 标识与公共 CI ref；失败后的继续位置。凭据只记录引用名称，不记录值；不把运行日志或每次发版状态反复写回该文档。

首次设置改动走普通 PR，由 Publish 在已获授权范围内交付；初始化本身不隐含合并或首次正式发版授权。初始化 PR 的检查不依赖部署密钥，部署 Workflow 从一开始包含最终自动事件；合并导致的首次部署是该配置的明确后果。权限、Secrets、runner、服务器和目标须在会触发部署的合并前就绪；缺少外部权限时报告未完成项，不为了完成接入而扩大访问范围或绕过规则。

只用主分支部署时，首次真实主分支事件验证相应环境；只用 Tag 时，配置完成后等待首次真实 Tag 验证，不创建 Preview；双环境时分别记录 Preview 已验证和 Production 待首次发版验证。没有运行时部署需求的仓库依据现有 Release 的用途，只建立版本发布约定，不强制引入云资源或部署 Workflow，这不是新增部署模式。

### 公共 CI 接入

在 Release 的条件引用中承接旧 onboard-ci 的事实调查、项目命令保持、目标核验和接口契约：静态站点使用 build-static → deploy-cos，Docker 使用 deploy-docker，小程序使用 build-static → upload-miniapp。每个项目只生成其所需路径，独立单元保持各自的 Tag、artifact 和目标并发范围。

小程序仍只交付开发版；规则文档和结果必须如实记录上传阶段，不称为 Production 正式上线，不套用网站的 Preview/Production 完成判据。未支持的目标报告缺口，不通过任意 SSH 命令扩展公共接口。

业务 caller 使用已发布的 `@ci-v2`，逐项映射 Secrets；事件与目标由 caller 确定。初始化时读取该 ref 的真实接口，使用项目现有命令，不强制换构建工具。保留 Docker 的镜像 digest、Compose、运行时配置和主机信任契约，COS 的产物/缓存规则及小程序 AppID 核验，移除旧接入文档中与本次决定冲突的环境和手动阶段规则。环境是业务用途；仅在公共接口支持时才传 GitHub Environment 输入。

### Release 日常执行和恢复

从远程默认分支的 `RELEASE.md` 与权威配置解析 release set，保留现有精确 tag 可直接执行、推导/扩展集合跨轮确认、basis 重新核验及完整元数据事务规则。初始化变更不得混入发布元数据事务或版本提交。

版本提交 R 推送前核验直推权限和完整语义；不允许时停止，不自动转 PR 或更改保护规则。推送后读取与 R 精确对应的检查和部署 run。双环境下需要 R 的检查与 Preview 实际验证通过，不能借用父提交、另一个 run 或更新后的 Preview 证据。R 的 Preview 被后续提交覆盖且缺少 R 的有效验证记录时，报告证据缺口，不把当前站点算作 R 通过。没有 Preview 的配置不制造 Preview 门槛，而遵守项目对应的检查与已有部署要求。

随后只推送每个已确认的精确 Tag ref，并创建对应 GitHub Release。Tag Workflow 在构建/部署前验证格式、版本与单元映射、提交对默认分支的可达性；后续构建 checkout Tag 的提交，不重新读取默认分支最新代码。采用的身份必须能触发该事件，不能在未来移入 Actions 后误用不会触发后续 push Workflow 的身份而报告成功。

读取并报告精确 Tag/ref 对应部署及实际目标的验证证据。等待中的环境审批、排队、不可观察目标与失败都是实际未完成状态，不升级为上线成功。不增设额外手动部署验收，已有人工环境保护也不得静默移除。

保留版本事务、提交、推送、每个 Tag 和 Release 的恢复点；新增 R 检查/Preview 和目标部署的观察点。Tag 或 Release 已成功而部署失败时保留已有对象；已授权的同 Tag 基础设施重跑沿用相同代码和目标，不重新打 Tag。代码修复通过新 PR 和后续合法版本交付。恢复较早 release set 时，核验原 release commit 及各 identity，不错误要求已经前进的默认分支仍等于 R。

## Architecture

当前：Publish 交付 PR；Release 只处理版本与 GitHub 发布；安装目录中的 onboard-ci 单独接入 CI。

目标：两个轻量入口，首次接入、项目规则、CI 接口与部署证据放在 Release 的条件引用中。公共 CI 保持不变；onboard-ci 被完整替代。

```text
首次 Release -> RELEASE.md + 项目 caller -> Publish -> PR 检查 -> 按要求 rebase
日常开发 --------------------------------> Publish --------------------+
                                                                       |
                                                                 默认分支更新
                                                                       |
                                                          公共 CI -> Preview
                                                                       |
用户发版 -> Release -> 版本提交 R 直推 -> R 检查及 Preview 验证 -> 精确 Tag
                                                                       |
                                                     +-----------------+---------------+
                                                     |                                 |
                                                GitHub Release                公共 CI -> Production
```

图示为已确认的双环境路径，单触发项目只保留自己选用的部署边。Release 保留结果观察与发布身份，公共 CI 保留部署执行，Publish 保留 PR 状态与合并权限。

## Public surface changes

- Publish 增加检查当前 PR 和按要求 rebase 合并的能力；提交、PR 创建和合并仍是可分别授权的结果。
- Release 的可用入口增加项目首次发布设置，支持读取/建立 `RELEASE.md`、接入公共 CI 及观察部署结果。
- 仓库继续发布原有 13 个技能，不把 onboard-ci 作为第 14 个技能加入再保留。
- 项目命名文件 `RELEASE.md` 归 Release 初始化和项目约定维护，现有 Docs 对用户指定文档的通用能力不变，memory catalog 不扩展。

## Acceptance scenarios

| Given                                                  | When                       | Then                                                                                     |
| ------------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------- |
| 项目没有 RELEASE.md，已有构建及部署信息                | 首次调用 Release           | 从事实生成项目规则与最小 CI 配置；不在信息未确定时猜目标，不混入版本提交                 |
| 初始化配置和外部前提已就绪                             | 用户要求 Publish 并合并    | 检查通过后 rebase；直接由最终主分支事件部署 Preview，没有手动阶段或启用自动化的第二个 PR |
| Preview 已验证，尚未真实发版                           | 报告首次接入               | 明确 Production 待首次发版验证，不宣称完整上线                                           |
| PR 当前 head 的检查失败、等待或已过期                  | 检查/请求合并              | 返回实际阻断项，不合并或改用其他合并方式                                                 |
| PR 检查通过但未获合并授权                              | Publish 完成               | 返回 PR 及检查证据，不合并                                                               |
| 用户要求合并，检查后 head 发生变化                     | 执行 rebase 合并           | 精确 head 约束阻止旧证据合并，刷新检查后再决定                                           |
| 双环境项目准备版本 R                                   | Release 发版               | R 直推默认分支、不创建 PR；R 检查及 Preview 验证通过后才推送指向 R 的 Tag                |
| R 的检查失败、Preview 失败或被更新覆盖且无有效验证记录 | 准备创建 Tag               | 保留已完成提交，报告缺口，不用别的提交证据打 Tag                                         |
| 身份不能直推默认分支                                   | 初始化核对或日常 preflight | 报告所需权限与未完成动作，不更改为 PR 或绕过保护                                         |
| Production 的 Tag/ref 或版本不合法                     | 自动 Tag Workflow 开始     | 在任何构建上传或部署前拒绝，无 Production 副作用                                         |
| 合法 Tag 指向已验证 R，main 后续继续前进               | Production 部署            | 构建发布 R，并分别报告 Tag、Release、部署和实际环境验证结果                              |
| 已有 Tag/Release，Production 失败                      | 按同一版本恢复             | 复用发布身份，按授权补相同代码的失败阶段；不移动 Tag、不重复版本提交                     |
| 仅主分支部署、仅 Tag 部署或没有运行时目标              | 初始化及后续发布           | 各自只执行已选路径；不新增第二环境、Preview 门槛或云资源                                 |
| 原有 monorepo、传播版本或版本绑定元数据                | 执行/恢复发布              | 原 release set、候选确认、精确路径、统一 predicate 和逐 identity 恢复规则继续成立        |
| 规则文档与真实 Workflow 冲突，或旧初始化只完成一部分   | 再次调用 Release           | 基于实际文件与 run 报告冲突/续接位置，不因文件存在跳过初始化或盲目重复发布               |
| 使用小程序公共路径                                     | Tag 上传成功               | 只报告开发版上传，不宣称完成审核或 Production 正式发布                                   |
| 新 Publish/Release 已安装且可访问全部引用              | 退役旧入口                 | onboard-ci 及其实际安装链接不再可调用；没有别名、转发或对安装目录源材料的运行时依赖      |

## Implementation steps

1. 建立新行为契约与回归边界。
   - outcome: 用现有测试方式保护 PR 检查/合并授权、项目规则入口、三种部署配置、初始化真实事件验证、版本提交直推及 R 证据边界，同时保留既有 release-set 不变量；断言语义边界与引用完整性，不逐句锁死新提示词。
   - scope: `tests/publish.test.ts`、`tests/release.test.ts`；仅在必要时扩展 `tests/skill-architecture.test.ts` 的入口/引用断言，不新增测试框架。
   - verify: `pnpm exec vp test run tests/publish.test.ts tests/release.test.ts`；新增契约在实现前能暴露旧的禁止 merge、缺少初始化和 R 部署观察行为。
2. 完成 Publish 的 PR 检查与受授权 rebase 合并。
   - outcome: 能复用已有 PR、读取当前 head 的检查与合并条件、只在明确请求时合并，并保留失败/模糊结果的精确恢复点；现有 staging、历史及敏感信息保护不变。
   - scope: `skills/engineering/publish/SKILL.md`、`references/pull-request.md`、`references/recovery.md`；必要时在 `references/git-state.md` 区分本地发布 mutation 与对已有 PR 的远程检查/合并，不放宽普通发布对默认分支的保护。
   - verify: Publish 定向测试通过；按验收表演练“只检查”“失败检查”“head 改变”“明确 rebase 合并”四种分支，确认不会 force push 或默认合并。
3. 将项目配置与公共 CI 接入知识纳入 Release。
   - outcome: 入口按初始化或日常发版路由；新增条件引用承接项目规则格式、接入契约和真实事件验证，源材料完整纳入仓库；不再依赖安装目录中的 onboard-ci。
   - scope: `skills/engineering/release/SKILL.md`；新增 `references/project-policy.md`、`references/onboarding.md`、`references/ci-contract.md`；只读参考旧 onboard-ci 和选定公共 CI ref。
   - verify: Release 定向测试及引用/架构测试通过；从一个静态站点示例生成隔离的 caller 草稿，使用 actionlint 校验，并对照发布 ref 的 inputs/secrets；验证三种部署配置、无部署仓库及小程序边界。草稿不发布、不部署。
4. 接通日常发布中的 R 验证、Tag 部署观察及恢复。
   - outcome: 版本事务保持不变；R 直推后依据项目约定核对精确检查/部署证据；Tag/Release/部署可分别恢复及报告，失败不引入 PR、移动 Tag 或虚假成功。
   - scope: `skills/engineering/release/references/model.md`、`references/execution.md`、`references/recovery.md` 及必要的新项目规则引用。
   - verify: Release 定向测试通过；按验收表演练双环境完整路径、R 失败、默认分支前进、Tag 已成功而部署失败、跨单元部分成功。实际会话证据与静态检查分开记录。
5. 同步当前规格与用户入口。
   - outcome: specs、产品边界、架构、路由和使用说明准确表达新职责；删除当前文档中的冲突规则，保留历史计划和无关内容。README 给出首次设置及日常发版的最小使用示例。
   - scope: `specs/publish/spec.md`、`specs/release/spec.md`、`PRODUCT.md`、`ARCHITECTURE.md`、`skills/RESOLVER.md`、`README.md`、`README.zh-CN.md`、`skills/engineering/README.md`。
   - verify: `pnpm check`、`pnpm test`、`pnpm lint`、`node skills/engineering/doctor/scripts/checker.ts . --json`；检查冲突用语仅在历史记录或明确非目标中出现。`pnpm check` 带修复副作用，检查并排除无关文件改动。
6. 安装替换并退役旧入口，完成关联计划记录。
   - outcome: 前五步验证完成后，用现有 installer 只更新 Publish/Release，再移除已确认的旧 onboard-ci 安装及链接；不留下兼容入口，不改其他技能或宿主配置。关联计划由 Implement 按已有生命周期记录实际证据和限制。
   - scope: 仓库中本计划的状态与 Assurance；安装目标 `/Users/moeyua/.agents/skills/{publish,release,onboard-ci}` 及对应 Codex/Claude Code 的实际技能链接。实施时先重新确认链接与 installer 管理状态，避免删除无关内容。
   - verify: 使用已安装 CLI 的 `skills add . -g -a claude-code -a codex --skill publish release -y` 更新指定技能，再用 `skills remove onboard-ci -g -a claude-code -a codex -y` 定向退役；检查安装的 Publish/Release 及所有引用可读、旧入口不可发现。若 installer 对未登记的旧目录不生效，仅清除已核对的该目录和指向它的链接，验证没有其他对象受影响。宿主写权限不足时保留明确未完成项，不把仅源码完成称为已退役。

## Spec delta

- ADDED `publish`「当前 PR 检查」：检查精确 head 的必需 CI 与项目合并条件，返回真实通过、等待、失败或证据缺口。
- ADDED `publish`「显式授权的 rebase 合并」：仅在用户要求且精确 head 条件满足时合并；不自动合并、不降级策略、不绕过保护；保留合并结果核验与部分状态。
- MODIFIED `publish`「按当前状态完成 commit、push 与 PR」「保护本地和远程历史」「partial state 不回滚」「发布状态不升级实现证据」：覆盖检查/合并结果，明确本地历史保护不阻止已授权的 GitHub rebase 合并，也不把 CI 绿灯当作独立 Verify。
- ADDED `release`「项目规则与首次接入」：首次建立 RELEASE.md、核对权限与目标、配置最终自动事件；不额外手动部署，以实际分支/Tag 结果完成分阶段验收。
- ADDED `release`「项目部署配置」：三种触发组合及双环境固定映射，独立记录用途、机制和目标；没有部署需求则不创造部署，小程序只报告开发版交付。
- ADDED `release`「版本提交检查与部署证据」：R 直推后按项目约定验证对应检查，双环境额外要求 R 的 Preview 实际证据；失败/缺失不得打 Tag；Tag 部署绑定精确 release commit，分别报告发布与部署。
- MODIFIED `release`「项目发布拓扑必须唯一可核验」「项目权威版本策略优先于通用 SemVer」：RELEASE.md 成为必需的项目规则入口，真实工具拓扑仍由项目确定，冲突不猜；不要求额外统一 manifest。
- MODIFIED `release`「单次版本事务与 release commit」「创建并逐 identity 精确推送 tag」「逐 release identity 幂等恢复」「既有发布状态与失败恢复共享同一 predicate」：明确直推、不混入初始化配置、R 门槛及分阶段部署观察/恢复，维持原版本集合与身份谓词。
- MODIFIED `release`「通用发布仍排除部署与制品」为「发布接入与执行职责边界」：Release 拥有配置与结果观察，公共 CI 拥有部署执行；保持回滚、任意 registry 发布、小程序正式发布及自动业务合并等非目标。
- MODIFIED `release`「release state 不替代实现证据」：可报告实际 CI/目标观察，但 Tag/Release 成功不推定部署成功或独立 Verify pass。

## Verification

- command: `pnpm exec vp test run tests/publish.test.ts tests/release.test.ts tests/skill-architecture.test.ts`
- command: `pnpm check`
- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/engineering/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [x] 离线演练 Acceptance scenarios，记录入口、实际行为与失败停点；命令回放、产物验证和情境推演的范围见 Assurance，不把它们称为真实线上验证。
  - [ ] 首次设置 PR 的真实合并直接触发 Preview；首个真实正式版本验证 Production，没有额外手动部署或第二个启用 PR。
  - [ ] 版本提交直推、R 检查与 Preview、精确 Tag、Production 目标证据能够串到同一版本；没有凭最新 main 或其他 run 冒充。
  - [x] 单触发、无部署和小程序路径在离线情境推演中不被强行套成双环境网站。
  - [x] 旧 onboard-ci 入口已退役，新的接入引用可随 Release 独立安装；仍只有原有 13 个公共技能。
  - [x] 本次仅执行隔离演练，没有真实业务部署；首次上线留在该项目另行授权的设置/发布任务中验证。

## Assumptions & risks

- GitHub 规则可能禁止直推。用户已选择直推版本提交，因此接入时应暴露必要身份权限；不能以这一事实重新改成版本 PR，也不能由文档承诺越过平台保护。
- Preview 会随 main 变化。发布前核对 R 的检查、部署及目标观察身份；遇到 R 被覆盖又无有效验证证据时停在该点，不新增锁仓或隐式手动部署机制。
- 公共 `ci-v2` 接口和实际安装状态会变化；实现时刷新所选 ref 的输入契约及本机链接事实。检查真实声明，不机械复制旧 onboard-ci 的 Docker 输入或环境政策。
- 本仓库本身没有应用部署目标。隔离 caller 校验和行为会话能证明技能变更的相应部分；首次真实 Preview/Production 验证属于使用该技能的业务项目任务，未执行时作为已知验证限制记录。
- onboard-ci 的退役涉及仓库外安装目录，不能仅靠 Git diff 证明完成；需单独报告安装路径验证和宿主权限限制。

## Assurance

- Evidence and limitations:
  - Implement 完成 Publish/Release、相关 specs、产品/架构/路由和双语 README 更新。没有新增发布工具依赖，没有改动公共 CI。工作位于 `feat/project-release-workflow`，本次变更未提交或推送。
  - 定向契约测试先出现 3 failed / 15 passed，暴露旧入口缺少受 head 约束的合并和新初始化引用；实现后 Publish、Release 与技能架构测试共 20 项通过。主代理执行 `pnpm check`、`pnpm test`、`pnpm lint`：格式、类型、lint 通过，17 个测试文件、184 项测试全部通过。`pnpm check --fix` 未改动范围外文件；`git diff --check` 通过，Doctor 返回 `[]`。两个技能均通过 skill-creator 的 `quick_validate.py`，复用本机现有 Python/PyYAML。
  - 支持性源码 Review（`release_review`）结论为 pass，核对完整 diff、新增引用、原发布不变量及公共接口；没有可证实的缺陷。公共 CI 只读核验确认远程 `ci-v2` 指向 `127046bb4cb855a62559c1932622cd04168dfd2c`，五个 workflow 与本地对应版本逐字节一致。
  - `onboarding_trial` 在隔离静态站点实际使用新 Release，生成 `RELEASE.md`、最终双触发 caller 和 Tag gate。冻结安装、check、真实构建测试、build、产物检查、actionlint 1.7.12、公共接口 inputs/Secrets 匹配、8 个事件/ref 门禁场景均通过；隔离版本事务只改两个清单，不产生提交或 Tag。主代理检查了实际产物和日志。临时记录：`/tmp/release-onboarding-trial.7nhNt8/DELIVERY.md`。
  - `publish_trial` 在四个独立本地 Git fixture 中执行 50 次模拟 gh 调用并记录完整 trace：仅检查、失败检查、A→B 且 pending 三种状态均无 merge；稳定 A 且已授权时恰好一次 `--rebase --match-head-commit A`，回读 PR merged 与目标提交一致。主代理检查了 trace 和结果。临时记录：`/private/tmp/publish-trial-20261105-8ec42d/report.md`。这是命令回放，GitHub 状态和远端合并均为模拟。
  - `release_scenarios` 完成 A–M 共 13 个离线情境推演，覆盖单触发、无部署、小程序、完整双环境路径、R 检查失败/Preview 被覆盖、历史 R 恢复、多单元部分成功、直推权限不足、规则冲突、未合并初始化和首次 Production 待验证。主代理复核下一动作与停点。临时记录：`/tmp/release-scenarios-ae886c9231f9.md`；这些推演没有执行发布命令，不作为真实服务证据。
  - 通过现有 installer 只安装 Publish/Release，逐文件比对安装内容与源码一致（4/8 个文件，含全部 3/7 份引用），Claude Code 链接及 Codex 共享技能发现均正常。installer 移除旧链接后仍残留 onboard-ci 共享目录，按计划核实其三个文件并定向删除；三个安装路径及 CLI 清单均不再存在旧入口。安装前后 718 个无关技能目录/文件/链接记录完全一致。临时记录：`/tmp/release-install-result.json`。
  - 尚未在真实 GitHub 执行 PR 合并、版本直推、Tag/Release 或 Preview/Production 部署；上方两项线上验收保留未勾选。静态断言只覆盖公开契约，离线场景不能证明所有模型调用或外部服务行为。actionlint 未运行不可用的 ShellCheck/pyflakes；隔离站点可选 HTTP 检查因沙箱禁止端口绑定未执行，文件内容检查未被当作目标 HTTP 验证。真实环境验证属于后续业务项目的已授权发布任务。
- Verify: not run
