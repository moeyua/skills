---
mode: fix
title: Release 版本判断遵循 SemVer 的 0.x、公开 API 与预发布规则
created: 2026-11-10
status: done
issue: https://github.com/moeyua/skills/issues/70
---

# Release 版本判断遵循 SemVer 的 0.x、公开 API 与预发布规则

## Building

Release 推导候选版本，以及首次设置时写入项目 `RELEASE.md` 的版本规则，都严格遵循 Semantic Versioning：

- 0.x 阶段（初始开发期，SemVer §4）：破坏性变更升 minor，其余变更（新能力、修复）升 patch。
- `1.0.0` 表示正式定义公开 API（SemVer §5），只能由用户明确宣布或明确给出该版本；Release 不会从变更内容推导出 `1.0.0`。
- 1.0 之后：只有对项目声明的公开 API 做不兼容变更才升 major（SemVer §8）；只含向后兼容缺陷修复时升 patch（SemVer §6），其余变更升 minor。项目没有声明公开 API 时，不提出 major 候选，按同一规则给出 minor 或 patch 候选，并在候选依据中写明公开 API 未声明。
- 预发布版本（SemVer §9）只在项目规则允许时使用；用户显式要求预发布也必须在项目许可范围内，不许可时报告并零 mutation。版本先后按 SemVer §11 比较。

这样 `0.6.1` 删除一个页面，候选最多是 `0.7.0`。

## Not building

- 不迁移其他项目已有的 `RELEASE.md`（如 peekaboo 中的“破坏性行为变更使用 major”）；项目已有的权威版本策略仍优先于通用规则，是否改写由用户决定。
- 不改变“项目权威策略优先”“推导出的候选需下一条用户消息确认”“显式 tag 仍校验合法性”等既有规则。
- 不改动本仓库 `RELEASE.md`：它已处于 1.x 之后，并已把技能调用约定、必需流程和副作用声明为不兼容判断依据。
- 不涉及 Release 的检查分工、CI 接入或通用化改造（另行计划），不引入版本工具依赖。

## Root cause

[model.md:34](../skills/engineering/release/references/model.md) 的通用回退把“breaking behavior or side effect → major”套用到所有版本，没有区分 SemVer 的 0.x 初始开发期、`1.0.0` 的公开 API 声明和预发布通道；[project-policy.md:42](../skills/engineering/release/references/project-policy.md) 又要求首次设置时把“所选 SemVer 规则”写入项目 `RELEASE.md`，却没有要求记录版本阶段和公开 API 范围，于是这条不分阶段的规则被固化进项目策略（例如 peekaboo `RELEASE.md:7`“破坏性行为变更使用 major”，其历史中出现 `v0.10.1 → v1.0.0`），之后作为项目权威策略继续生效，删除一个页面即把 `0.6.1` 推到 `1.0.0`。[specs/release/spec.md:27](../specs/release/spec.md) 记录了同一规则。

## Key decisions

- 用户决定：版本规则严格遵循 SemVer；设计总结中已确认 0.x 破坏性变更升 minor、其余升 patch，`1.0.0` 只由用户明确宣布，1.0 之后仅对声明的公开 API 不兼容变更升 major，预发布仅在项目规则允许时使用。
- SemVer 规范本身没有规定 0.x 内如何递增；“破坏性 → minor”采用 npm `^` 等工具的通行约定，并在规则中注明。
- 公开 API 的范围由项目在 `RELEASE.md` 中声明；Release 不替项目认定页面、路由等是否属于公开 API。
- 1.0 之后未声明公开 API 时给出 minor 或 patch 候选（按 SemVer §6 patch 仅限缺陷修复），而不是停止：这是从“major 仅针对声明的公开 API”和 SemVer 推出的确定动作，推导出的候选仍需用户下一条消息确认。
- 预发布许可以项目规则为准，因此 `execution.md` 与 spec 中“用户显式要求即可添加预发布”的表述一并收紧。

## Implementation steps

1. 先写回归测试
   - outcome: `tests/release.test.ts` 新增用例，覆盖下方 Regression tests 列出的全部断言。改动前这些断言失败。
   - scope: `tests/release.test.ts`
   - verify: `pnpm exec vp test run tests/release.test.ts` 新断言在改规则前失败

2. 改写通用版本推导与候选依据
   - outcome: `model.md` 的 “Select the set” 通用回退按上方 Building 的四条规则推导，包括 1.0 之后未声明公开 API 时给出 minor 或 patch 候选；“Candidate and basis” 增加版本阶段与公开 API 声明来源（或“未声明”）两个字段；显式 tag 校验中的预发布与先后比较遵循项目许可和 SemVer §11。`execution.md` 中添加预发布状态的条件改为“项目规则允许，且用户显式要求或策略要求”。项目权威策略优先、group 不猜测等原有限制保持不变。
   - scope: `skills/engineering/release/references/model.md`, `skills/engineering/release/references/execution.md`
   - verify: `pnpm exec vp test run tests/release.test.ts` 通过

3. 首次设置记录完整版本规则
   - outcome: `project-policy.md` 要求 `RELEASE.md` 记录当前版本阶段（0.x 或 1.0 之后）、对应的递增规则、1.0 之后的公开 API 范围、`1.0.0` 需由用户宣布、是否允许预发布；不再只写一条不分阶段的 SemVer 规则。
   - scope: `skills/engineering/release/references/project-policy.md`
   - verify: `pnpm exec vp test run tests/release.test.ts` 通过

4. 更新 spec
   - outcome: 按下方 Spec delta 修改 release spec。
   - scope: `specs/release/spec.md`
   - verify: `pnpm test` 通过

5. 整体检查
   - outcome: 格式、lint、类型与全部测试通过。
   - scope: 全仓库
   - verify: `pnpm exec vp check && pnpm test`

## Regression tests

- `tests/release.test.ts` — 新增 “follows SemVer stages for generic version selection”（新增覆盖）：
  - 条件：读取 `model.md`、`project-policy.md` 与 `specs/release/spec.md`。
  - 期望：
    - `model.md` 写明 0.x 破坏性 → minor、其余 → patch；`1.0.0` 只来自用户明确宣布或给出；1.0 之后 major 仅针对声明的公开 API；未声明时不提出 major，而给出 minor 或 patch 候选；patch 仅限缺陷修复；预发布仅在项目规则允许时使用；不再包含 “breaking behavior or side effect → major”。
    - `model.md` 的候选依据清单含版本阶段与公开 API 声明来源字段。
    - `execution.md` 不再包含 “only when explicitly requested or required by authoritative policy” 这一不需项目许可的表述。
    - `project-policy.md` 要求记录版本阶段、公开 API 范围和预发布许可。
    - spec 含 “通用 SemVer 区分 0.x、公开 API 与预发布”；spec 不再包含 “breaking behavior/side effect 为 major” 与 “prerelease 只来自用户显式要求或权威项目策略”。
  - 当前规则下失败（`model.md:34` 仍为不分阶段的 major 规则，`execution.md:83` 与 `spec.md:64` 允许不经项目许可的预发布），修复后通过。
- 既有用例 “prefers repository policy and validates forward successors” 保持通过，用于确认项目策略优先与严格递增规则未被破坏。

## Spec delta

- MODIFIED `release` / Requirement: 项目权威版本策略优先于通用 SemVer — 回退部分改为：只有不存在适用策略且目标为不受 group 约束、可唯一映射的 unit 时，按 “通用 SemVer 区分 0.x、公开 API 与预发布” 推导；删除 “breaking behavior/side effect 为 major” 的不分阶段表述，其余内容不变。
- MODIFIED `release` / Requirement: 逐 release identity 幂等恢复（`specs/release/spec.md:64`）— “prerelease 只来自用户显式要求或权威项目策略”改为“prerelease 须在项目规则允许范围内，并来自用户显式要求或权威项目策略”。
- ADDED `release` / Requirement: 通用 SemVer 区分 0.x、公开 API 与预发布 — 0.x 阶段破坏性变更为 minor、其余为 patch；`1.0.0` 只来自用户明确宣布或明确给出，不由变更推导；1.0 之后只有对项目声明的公开 API 的不兼容变更为 major，仅含向后兼容缺陷修复为 patch，其余为 minor；未声明公开 API 时不提出 major，按同一规则给出 minor 或 patch 并在候选依据中报告；预发布仅在项目规则允许时使用（用户显式要求也不例外），版本先后按 SemVer 比较。首次设置必须在 `RELEASE.md` 记录版本阶段、公开 API 范围与预发布许可。
  Verify: [release contract](../../tests/release.test.ts)

## Verification

- command: `pnpm exec vp check && pnpm test`
- checklist (manual):
  - [ ] 对一个当前为 `0.6.1`、无项目版本策略、自上次发布以来删除了一个页面的项目请求发版，候选为 `0.7.0`，而不是 `1.0.0`
  - [ ] 对 1.x 项目、`RELEASE.md` 未声明公开 API、自上次发布以来删除了一个页面时，候选为下一个 minor，候选依据写明公开 API 未声明
  - [ ] 项目规则不允许预发布时，用户要求 `v1.2.0-rc.1` 会被报告且零 mutation
  - [ ] 新项目首次设置生成的 `RELEASE.md` 写明版本阶段、公开 API 范围和是否允许预发布

## Assurance

- Evidence and limitations: 新增用例 “follows SemVer stages for generic version selection” 在改规则前失败、改后通过；既有 “prefers repository policy and validates forward successors” 保持通过；`pnpm exec vp check` 与 `pnpm test`（185 项）全部通过。手工清单（对真实 0.x 与 1.x 项目推导候选、首次设置生成的 `RELEASE.md`）未执行，需在下次实际发版或设置时观察。已接入项目的 `RELEASE.md` 未迁移，仍按其原有策略执行。
- Verify: not run
