---
mode: feat
title: Release 通用化，并让 Tag 发布不重跑测试
created: 2026-11-10
status: done
issue: https://github.com/moeyua/skills/issues/71
---

# Release 通用化，并让 Tag 发布不重跑测试

## Building

Release 成为通用的发布 Skill：在任何 GitHub 项目上都能独立建立 `RELEASE.md`、连接项目的 CI 并发布版本，不依赖、也不内置某个公共 CI 的接口细节。项目使用某个公共 CI（例如 MediaStorm 的 storminfra）时，`RELEASE.md` 记录该 CI 提供方及其已发布 ref，具体接线以提供方自己的文档或 Skill 为准。

同时固定 PR、默认分支和 Tag 三类事件的检查分工，消除同一版本提交的重复测试：

- PR：完整质量检查。
- 默认分支提交（包括版本提交 R）：完整质量检查；双环境下再构建、部署并验证 Preview。
- 版本 Tag：只做 Tag 身份校验、按目标环境构建、部署和轻量上线确认，不重跑质量检查和测试。Release 在打 Tag 前要求 R 的默认分支检查通过（双环境下还要求 Preview 已验证），这是 Tag 阶段可以跳过测试的前提。
- Release 等 Tag 的部署运行结束、轻量上线确认通过后再报告结果。

## Not building

- 不修改 storminfra 的 workflow、README 或其 Skill（另有计划）；不迁移已接入项目的 `RELEASE.md` 或 caller，迁移由用户决定。
- 不设计跨 run 产物复用机制；构建配置相同时能否复用产物取决于 CI 提供方的能力。
- 不改变版本规则（另有计划 `2026-11-10-fix-release-semver-stages.md`）和 Publish 的合并方式（另有计划 `2026-11-10-fix-publish-merge-fallback.md`）。
- 不增加手动部署、回滚、独立 registry 发布；不改变版本提交直推、精确 Tag、跨轮确认、恢复等既有规则。
- 不改本仓库 `RELEASE.md`：本仓库没有部署，Tag 不触发任何运行。
- 不处理发版时 CI 之外约 10 分钟的操作开销：设计总结已把它列为待定项，需要先从一次真实发版测出时间花在哪里，再决定是否收紧 Release 的步骤。

## Interface boundary

**入口与路由**：`SKILL.md` 的 description 与正文不再写 “MediaStorm CI”，改为 “project release rules and CI connection”。CI 接入参考从 `references/ci-contract.md`（MediaStorm 专属）改为通用的 `references/ci-connection.md`，旧文件删除，不保留兼容别名。

**`ci-connection.md` 保留的通用规则**：

- CI 提供方与 ref：使用项目已有 workflow，或 `RELEASE.md` 记录的公共 CI 提供方及其已发布、不可随意漂移的 ref（不引用 `main` 这类开发分支）；接入前读取该 ref 的真实接口与提供方文档；提供方提供接入 Skill 或指南时以其为接线依据。
- 事件与门槛：PR 质量检查与部署分离；分支部署拒绝 Tag ref，Tag 部署拒绝分支 ref；Tag 触发的任何构建/上传/部署前完成格式、可达性、版本对应校验，并构建校验过的 Tag 提交（原 ci-contract 的四条门槛原样保留，可由提供方的可复用校验实现）。
- 上面 Building 中的三类事件检查分工。
- Secrets 逐项映射、不把凭据写入 Git/日志/产物；按目标区分并发范围，不取消进行中的 Production；推送身份必须能触发后续工作流。
- 不支持的目标报告缺口，不插入任意部署脚本。

**移出 Release 的内容**：COS、Docker（image-only / managed config）、小程序上传、`internal-deploy` runner、`@ci-v2` 引用、`TENCENT_*` / `WECHAT_*` / `RUNTIME_ENV_FILE` / `FEISHU_WEBHOOK_URL` 等提供方专属接口与诊断。除 `ci-contract.md` 外，还包括 `project-policy.md` 中的 COS 示例与小程序段落、`onboarding.md` 中的 “Docker/mini-program conditions” 与 “shared interface” 空测试命令说法。小程序段落里的通用原则改写为与提供方无关的表述：交付物不是面向用户的正式发布（例如开发版上传）时，按实际交付如实记录和报告，不称为 Production 上线。

**提供方暂不支持无检查的 Tag 路径时**：Release 仍按提供方已发布接口接线，让 Tag 运行只保留提供方强制要求的最少步骤（例如 storminfra `ci-v2` 的 `build-static.yml` 强制非空 `check_command`，但允许 `test_command` 为空以跳过测试），在 `RELEASE.md` 和结果中把这一差异记为已知限制，不阻断接入或发版。storminfra 的 v3 分层（另有计划 `mediastormDev/storminfra-frontend` 的 `plans/2026-11-10-feat-ci-v3-layered-workflows.md`）落地后，这一限制随之消失。

**`RELEASE.md` 新增记录项**（`project-policy.md`）：CI 提供方、其已发布 ref 与接入文档位置（使用公共 CI 时）；各事件运行哪些检查（Tag 不重跑测试）；各环境的构建配置是否不同；Production 的轻量上线确认方式，以及项目需要的额外 Production 验证（默认没有）。

**部署证据**（`deployment-evidence.md`）：打 Tag 前门槛不变（R 的检查，双环境再加 Preview 验证）；Tag 后观察精确 Tag 的运行直至结束并执行记录的轻量上线确认，确认产物身份对应 R；Tag 运行中没有测试步骤是预期行为，不当作证据缺失。

## Acceptance scenarios

| Given                                                  | When                      | Then                                                                                                                                  |
| ------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 一个不使用任何公共 CI 的 GitHub 项目，只安装了 Release | 首次设置发布              | 基于项目自身 workflow 建立 `RELEASE.md` 与触发配置，不读取或要求 storminfra                                                           |
| 项目使用 storminfra，`RELEASE.md` 记录了提供方与 ref   | 首次设置或日常发版        | Release 按记录读取提供方已发布接口与文档接线，自身参考中不出现 storminfra 专属接口                                                    |
| 双环境项目，R 的默认分支检查与 Preview 验证均通过      | Release 推送 Tag          | Tag 运行只含身份校验、Production 构建、部署与上线确认（提供方强制保留的步骤除外，并记为已知限制）；Release 等其结束并报告上线确认结果 |
| R 的默认分支检查失败或缺失                             | 用户要求发版              | 不创建 Tag，报告具体运行与缺口                                                                                                        |
| Tag 运行部署成功但上线确认失败                         | Release 观察结果          | 报告部署完成、上线确认失败，保留 Tag 与 Release，不重打 Tag                                                                           |
| 项目在 `RELEASE.md` 声明 Production 需要额外验证       | Tag 部署完成              | Release 执行该额外验证后再报告                                                                                                        |
| 仅 Tag 部署的项目                                      | 版本提交 R 推送到默认分支 | 默认分支运行完整质量检查且不部署；Tag 运行不重跑测试                                                                                  |

## Implementation steps

1. 先写测试
   - outcome: `tests/release.test.ts` 断言：入口、references 与 release spec 不含 `MediaStorm`、`storminfra`、`ci-v2`、`internal-deploy`、`TENCENT_SECRET`、`deploy-cos`、`deploy-docker`、`upload-miniapp`、`COS`、`mini-program`、`小程序`、`AppID`；`ci-connection.md` 写明提供方不支持时保留其强制的最少步骤并记为已知限制；入口路由到 `references/ci-connection.md` 且 `ci-contract.md` 不存在；`ci-connection.md` 写明 Tag 运行不重跑质量检查和测试、四条 Tag 门槛、提供方 ref 记录；`project-policy.md` 要求记录 CI 提供方、事件检查分工与轻量上线确认；`deployment-evidence.md` 写明 Tag 运行无测试是预期、等待运行结束并执行上线确认；spec 含新的 Requirement 名。改动前失败。
   - scope: `tests/release.test.ts`
   - verify: `pnpm exec vp test run tests/release.test.ts` 新断言在改动前失败

2. 用通用 CI 接入参考替换 MediaStorm 契约
   - outcome: 新建 `ci-connection.md`，内容为上面 Interface boundary 列出的通用规则；删除 `ci-contract.md`；`SKILL.md` 与 `onboarding.md` 改为路由到新文件，并去掉对 MediaStorm 的描述。
   - scope: `skills/engineering/release/SKILL.md`, `skills/engineering/release/references/ci-connection.md`, `skills/engineering/release/references/ci-contract.md`, `skills/engineering/release/references/onboarding.md`
   - verify: `pnpm exec vp test run tests/release.test.ts` 中第 1 步新增的入口、参考与禁用词断言通过（spec 相关断言要到第 3 步才通过）

3. 更新 spec
   - outcome: 按 Spec delta 修改 release spec。
   - scope: `specs/release/spec.md`
   - verify: `pnpm exec vp test run tests/release.test.ts` 中 spec 相关断言通过

4. 固定事件检查分工与 Tag 后观察
   - outcome: `project-policy.md` 增加 Interface boundary 中的 `RELEASE.md` 记录项，把部署选择表中 Tag 一列写为“校验、构建、部署、上线确认，不重跑测试”，并移除 COS 示例与小程序段落（保留改写后的通用原则）；`deployment-evidence.md` 按 Interface boundary 更新 Tag 后观察；`onboarding.md` 的检查配置要求 PR 和默认分支运行完整质量检查、Tag 运行不含质量检查（提供方不支持时按已知限制处理），并移除 “Docker/mini-program conditions” 与 “shared interface” 的提供方说法。
   - scope: `skills/engineering/release/references/project-policy.md`, `skills/engineering/release/references/deployment-evidence.md`, `skills/engineering/release/references/onboarding.md`
   - verify: `pnpm exec vp test run tests/release.test.ts` 全部通过

5. 同步描述 Release 与 MediaStorm 关系的文档
   - outcome: 不再把 Release 描述为接入 MediaStorm CI、替代 onboard-ci 或包含 COS/Docker/小程序契约（含 `PRODUCT.md:94` 的小程序开发版说法与 `ARCHITECTURE.md:212`）；改为通用 Release，可搭配公共 CI 提供方及其自带的接入指南使用。
   - scope: `PRODUCT.md`, `ARCHITECTURE.md`, `README.md`, `README.zh-CN.md`（`skills/RESOLVER.md` 与 `skills/engineering/README.md` 的 Release 描述已与提供方无关，不改）
   - verify: `rg -n -i "mediastorm|storminfra|onboard-ci|ci-contract|\bCOS\b|mini-program|小程序" skills/engineering/release specs/release PRODUCT.md ARCHITECTURE.md README.md README.zh-CN.md` 无结果

6. 整体检查
   - outcome: 格式、lint、类型与全部测试通过。
   - scope: 全仓库
   - verify: `pnpm exec vp check && pnpm test`

## Spec delta

- MODIFIED `release` / Requirement: 发布接入与执行职责边界 — “首次 CI 接入” 改为与提供方无关的 CI 连接；项目 caller 决定触发与目标，CI（项目自身或记录的公共 CI 提供方）执行构建、制品传递和部署；删除对小程序公共路径的具体描述（属于提供方）。
- MODIFIED `release` / Requirement: 项目规则与首次接入 — 第二段 “接入继续复用选定已发布 MediaStorm 公共 CI” 改为 “使用项目自身 workflow 或 `RELEASE.md` 记录的 CI 提供方已发布 ref，读取其真实接口与提供方接入文档”；文档记录项增加 CI 提供方、事件检查分工与上线确认方式。
- MODIFIED `release` / Requirement: 项目部署配置 — 增加：Tag 触发的运行只做 Tag 校验、目标构建、部署与轻量上线确认，不重跑质量检查与测试（提供方强制保留的步骤记为已知限制）；删除 “小程序只记录开发版上传事实”，改为通用表述：非正式发布的交付按实际交付如实记录。
- MODIFIED `release` / Requirement: 版本提交检查与部署证据 — 增加：R 的默认分支检查通过是 Tag 阶段跳过测试的前提；Tag 后观察到运行结束并完成记录的上线确认再报告；Tag 运行中没有测试不视为证据缺失；项目声明的额外 Production 验证照常执行。
- ADDED `release` / Requirement: 事件检查分工 — PR 与默认分支提交运行完整质量检查；双环境默认分支再部署并验证 Preview；版本 Tag 不重跑质量检查和测试，只做校验、构建、部署与上线确认。
  Verify: [release contract](../../tests/release.test.ts)

## Assumptions & risks

- 不经 Release、直接手动推送的 Tag 不会经过“R 检查通过”这道门槛，而 Tag 运行又不跑测试。本计划不处理这一情况；是否在 Tag 校验中再核对 R 的默认分支检查结果，属于 CI 侧的取舍。
- storminfra 项目在 v3 落地前，Tag 运行仍会执行 `check_command`（只能跳过测试），因此只能省下重复测试的时间，省不下重复静态检查的时间。
- 三份计划都会修改 `specs/release/spec.md`，本计划还与 Publish 计划同改 `onboarding.md`、`project-policy.md`；按顺序逐份实施可避免冲突。

## Verification

- command: `pnpm exec vp check && pnpm test`
- checklist (manual):
  - [ ] 在一个不使用 storminfra 的项目上首次设置 Release，不出现任何 storminfra 专属要求
  - [ ] 双环境项目发版时，Tag 运行没有测试步骤，Release 在运行结束和上线确认后才报告
  - [ ] R 的默认分支检查失败时，Release 不创建 Tag

## Assurance

- Evidence and limitations: 新增用例 “stays provider-neutral and leaves CI wiring to the recorded provider” 与改写的 “ships project rules and onboarding knowledge…” 在改动前失败、改后通过；`pnpm exec vp check` 与 `pnpm test`（186 项）全部通过；`rg` 确认 Release 入口、references、release spec、PRODUCT、ARCHITECTURE 与双语 README 不再含 MediaStorm、storminfra、onboard-ci、ci-contract、COS、小程序等提供方专属内容。手工清单（在不使用 storminfra 的项目上首次设置、双环境发版中观察 Tag 运行无测试步骤、R 检查失败时不打 Tag）未执行。storminfra v3 落地前，Tag 运行仍需执行 `check_command`，按计划记为已知限制。
- Verify: not run
