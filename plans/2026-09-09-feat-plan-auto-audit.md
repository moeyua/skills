---
mode: feat
title: Plan 完成后自动审计并修订
created: 2026-09-09
status: candidate
issue: https://github.com/moeyua/skills/issues/54
---

# Plan 完成后自动审计并修订

## Building

让 Plan 在本轮所选 target 的产物生成结束后、最终汇报前，自动完成一轮规划质量审计，并由 Plan 修订已有需求和项目证据足以确定的问题。用户无需另行调用 Check 或逐项批准明确修订；最终能够看到实际产物、审计结论、修订验证结果和剩余问题。`local`、`issue`、`both` 均适用，审查内容随产物职责变化。

## Not building

- 不增加公共 Skill、执行引擎、后台自动化、通用审计账本或新的依赖，不恢复 bench。
- 不把 Plan 审计扩展为项目整体 Doctor、实现验收、代码修改、Publish、Release 或全局技能安装。
- 不增加必须先运行 Shape 的入口要求，不改变默认 `both`、target 选择、同仓条目边界或一个条目一个 canonical Issue 的身份规则。
- 不进行多轮完整审计循环，不把修订后的定向核对冒充新的独立审计通过。
- 不赋予纯 `issue` 对调用前已存在且仅被复用的 Issue 的编辑权，不接管人工内容、任意 Issue 维护或项目管理字段。

## Key decisions

- 用户明确要求的是「plan 做完后，自动进行一轮审计」，并明确选择「自动修订」。审计发生在本轮产物生成阶段结束之后，而非用写入前格式校验替代。
- 采用 Shape 中提出的实现方向：复用 Check，在新的独立上下文中审阅本轮产物，再把结果交回仍有产物授权的 Plan。独立上下文和以下远程修订规则是实现方案，不记为用户逐项指定的条件。
- 沿用仓库现有的支持调用方式：`skills/shape/SKILL.md` 由调用方持有公共 outcome，`skills/implement/SKILL.md` 组合只读 Check 后由调用方完成修订。扩展 Check 的规划审查适用范围，不复制一套审查 Skill。
- 现有 `skills/plan/references/target-issue.md` 禁止编辑所有既有 Issue；本功能仅增加「本轮确定创建、且仍与本轮写入基线匹配」的修订例外。调用前已有的复用 Issue 仍只读，原有 marker 用于本轮身份核验，不扩展为永久写入所有权。
- `both` 复用当前 managed envelope、digest、canonical URL 和外部内容保护规则。原始创建/同步与审计后的修订是两个有界操作阶段；每个可写 Issue 最多追加一次修订 edit，每次 edit 都有自己的写前验证和一次回读，失败或歧义不重试。
- 审计属于规划质量保障。新计划始终是 `draft`，不生成实现 `candidate`、正式 Acceptance 或 `done`，也不把规划审计放入实现专用的 `## Assurance`。

## Interface boundary

### 触发与输入

Plan 保留各 target 的生成顺序和事务约束。在所选 target 的生成阶段到达终点后，对本轮已核实、可读取的实际产物执行一次审计，再汇报。`both` 远程部分失败但本地计划有效、或 `issue` 批次部分完成时，也审查已有产物并明确未覆盖部分；没有任何可读产物时报告未执行及原始失败原因，不捏造审计结果。

审计输入包含用户原始需求、明确决定与纠正、约束和非目标、相关项目证据、所选 target、实际产物内容与可定位版本、生成阶段的结果及已知限制。提供这些原始依据和必要路径，不使用完整历史 fork，不把 Plan 自己的摘要或结论当作唯一判断依据。独立上下文自行读取相关事实和实际产物，不能取得必需证据时返回 `inconclusive`。

Check 优先从同安装集合加载，缺失时查找宿主可用 Skill；缺少 Check、独立执行上下文或产物访问能力时明确报告 `inconclusive` 和受影响范围，保留已有产物，不静默改为自检、不自动安装。审计不递归调用 Plan，不生成额外产物。

### 审查与修订

- 本地计划：核对需求和已定决策的保真、范围、事实依据、步骤顺序与依赖、可实施性，以及验证能否证明目标；按变更类型检查适用的证据，排除纯文风偏好。
- Issue：核对问题、已知事实、条目身份、外部约束和可观察结果，防止夹带实现方案；未知解决方案或完整验收不构成纯 `issue` 的缺陷。
- `both`：额外核对本地方案与问题记录的语义一致性，同时保留各自职责。
- Check 只读，返回恰好一个 `pass`、`findings` 或 `inconclusive`，标明实际审查范围、版本、具体发现和缺失证据。发现必须能对应原始目标、项目事实或既有契约。
- Plan 依据发现修订其有权写入的本轮产物；项目事实能回答的问题和已定范围内的明确纠正直接完成。涉及新的需求、重大取舍或无法解决的证据冲突时，不代替用户决定，完成其他独立修订并报告具体待决项。
- 修订后仅回读并核对发现项及受影响的关联内容。原审计 verdict 和修订验证结果分别报告；修订会使旧版本结论失去对新版本的覆盖，不自行把 `findings` 改成独立 `pass`。仍有缺陷或证据不足时如实保留，不开启第二轮完整审计。

### 写入边界和失败行为

- `local`：仅修订本地计划，零 GitHub mutation。
- `issue`：保持零项目写入。只能修订本轮确定创建的 Issue，修订前按 canonical URL 读取，核对 title、完整 body、单一 change-type label 与本轮写入快照一致，并保留 batch marker；其他 labels 和项目字段不获得写入权。基线不一致则保留远端内容并报告冲突。仅复用的既有 Issue 可以产生 finding，但不自动编辑。
- `both`：必要时先修订并验证本地计划，再同步同一 canonical Issue 的问题投影；只变实施方案时不 edit Issue。远程修订须同时验证受管 ownership、当前受管投影仍与审计基线匹配，以及同一 bounded problem 身份，保留回读时的 block 外正文、comments、无关 labels 和其他字段。
- 任何远程修订都不能恢复已因失败、冲突或歧义停止的原始事务。`issue` 批次中止后只读审计已有 Issue，不修订远端或恢复未尝试条目；`both` 远程部分未成功时仍可修订本地计划，远端问题继续保留其原始状态。
- 只有原始远程事务明确成功时，才进入获准的远程修订阶段。每个 Issue 最多一次追加 edit；写前核验、label 冲突检查、安全临时 body file 及清理延续 target 契约。需要变更类型时沿用现有精确 label 和 ownership 规则，不改写其他 labels。
- 每次修订 edit 后按 canonical URL 回读一次；完整目标状态匹配才证明修订成功，确定失败且原状态完整保留则记修订失败，其他或不可核实状态记未知。不按标题搜索、不创建替代 Issue、不重试，不把读回成功宣称为 GitHub 的原子 compare-and-swap。
- 修订阶段首个远程冲突、失败或未知结果停止后续远程修订；保留已完成修订及原始创建/复用 ledger，报告后续未尝试修订，不删除或回滚已成功产物。

### 输出

保留原 target 的生成结果、已核实路径/URL、创建 labels 和逐项 ledger；新增简洁的审计范围与 verdict、已修订项及验证、未解决项和未审计范围。修订阶段创建的 labels 同样计入本轮副作用报告。生成成功只表示产物存在，不能掩盖审计或修订失败；仅在所需审计已完成且没有未解决的阻塞项时，才可宣称本轮规划收尾完成。部分成功不切换 target，不撤销已有产物，也不自动进入 Implement。

## Acceptance scenarios

1. Given 一份内容正确的 `local` 计划，When 生成阶段结束，Then 自动且仅启动一次独立审计，返回限定范围的 `pass`，计划保持 `draft`，没有远程调用或实现修改。
2. Given 本地计划遗漏用户明确约束、引用不存在的路径或验证不能证明目标，When 审计返回具体 findings，Then Plan 据原始证据修订并定向核对，分别报告原 findings 与修订结果，不把自检称为独立 pass。
3. Given finding 需要改变已定需求或重大取舍，When Plan 处理结果，Then 明确指出冲突和需要用户决定的内容，先完成独立且确定的修订，不静默替换方向。
4. Given `both` 的问题投影与本地计划不一致，When 自动修订，Then 先修订本地再修订同一受管 Issue，并保留人工内容；仅实施细节修订不产生远程 edit。
5. Given 成功的纯 `issue` 批次同时包含本轮 created 和既有 reused 条目，When 二者有可操作发现，Then 仅对基线一致的 created 条目追加至多一次 edit；reused 保持只读并报告未修订原因，全程零项目写入。
6. Given 审计后远程受保护内容被人修改、managed envelope 无效或问题身份改变，When 尝试修订，Then 写前返回冲突并停止后续远程修订；无覆盖、接管、替代 Issue 或重试。
7. Given 原始远程事务失败、模糊或中途停批，When 审计收尾，Then 保留原 ledger 和停批状态，仅审查可读产物；`both` 可独立修订有效本地计划，不恢复远程事务。
8. Given 修订 edit 返回确定失败或模糊结果，When 回读，Then 只按完整原状态/目标状态判定失败、成功或未知；不重试、不续写后续条目，准确报告所有已创建 labels 和未尝试修订。
9. Given 缺少 Check、独立上下文或必需原始证据，When 应当审计，Then 保留产物并报告 `inconclusive` 和缺口，不冒充自检通过。完全没有可读产物时明确报告未执行。
10. Given 纯 `issue` 的问题边界清楚但解决方案未知，When 审计，Then 不要求实现步骤、完整解决方案或人为补齐验收，不新增范围。
11. Given 用户直接进入 Plan、未先运行 Shape，或同一计划之后重新调用 Plan 修订，When 本次产物生成结束，Then 每次调用各审计一轮，复用仍有效项目事实；内部修订不会触发递归 Plan 或无限审计。

## Public surface changes

Plan 新增必经的规划审计与自动修订收尾；Check 明确支持规划产物的只读审查和返回授权调用方。纯 `issue` 增加仅限本轮新建内容的一次修订权限，`both` 明确区分原始同步和审计后的有界修订。Plan 安装需要可用 Check 及独立审计上下文；缺失时如实报告有限结果。公共 Skill 名称、安装入口和实现生命周期不变。

## Spec delta

- ADDED `specs/plan/spec.md`「产物生成后必须完成一轮规划审计」：三个 target 的触发点、独立输入、部分产物覆盖、缺失能力和单轮边界。
- ADDED `specs/plan/spec.md`「Plan 自动修订有证据且已获授权的审计发现」：调用方修订、重大决定保留、定向验证、原审计与修订结果区分。
- MODIFIED `specs/plan/spec.md`「issue target 零项目写入并支持同仓批量」「issue 批次具有稳定事务语义」「三个 target 具有独立完成语义」「Issue 保持安全且范围有限」：本轮 created 的有限 edit 例外、原始 ledger 与收尾结果分离、两阶段停批和 labels 记录；既有 reused 继续只读。
- MODIFIED `specs/plan/spec.md`「both target local-first 并建立唯一 Issue 关联」「paired Issue 受控同步且保护外部编辑」「产物共享意图且不重复确认」：local-first 自动修订、审计基线匹配、一次追加 edit 和严格回读，不扩大身份或人工内容所有权。
- MODIFIED `specs/check/spec.md` 对应选择证据、方法路由、verdict 与只读边界要求：支持计划/问题记录审计和返回 Plan；规划审计不加载实现 acceptance 协议，普通 Check 不因此一律要求子代理。

## Implementation steps

1. 建立本地 Plan 到只读审计再自动修订的最小完整路径。
   - outcome: `local` 生成后必经一次独立 Check，Plan 修订确定问题、核对并报告；缺失能力和重大决策有明确有限结果。
   - scope: `skills/plan/SKILL.md`, 新增 `skills/plan/references/audit.md`, `skills/plan/references/target-local.md`, `skills/check/SKILL.md`, `skills/check/references/review.md`, `tests/plan.test.ts`。
   - verify: `pnpm test -- tests/plan.test.ts` 覆盖审计入口、只读/写入所有权和 draft 不升级；在项目外临时副本中通过实际调用观察验收场景 1、2、3、9，保留原始输出和修订前后产物。
2. 将同一审计收尾扩展到两个远程 target 的有限修订。
   - outcome: `issue` 和 `both` 遵守本计划写入边界；审计覆盖已有产物，原事务失败不恢复，原始 ledger 与修订结果均真实可核验。
   - scope: `skills/plan/references/target-issue.md`, `skills/plan/references/target-both.md`, `skills/plan/references/issue-formats.md`, `skills/plan/references/audit.md`, `tests/plan.test.ts`, `tests/plan-issue-harness.test.ts`, `tests/plan-paired-issue.test.ts`。
   - verify: `pnpm test -- tests/plan.test.ts tests/plan-issue-harness.test.ts tests/plan-paired-issue.test.ts`；扩展现有 mock transaction traces，覆盖场景 4–8 和 10 的可写/只读条目、写前冲突、读回、调用次数、label 记录、停批及零项目写入，不向真实仓库发送失败演练请求。
3. 同步直接受影响的规格、路由和安装说明。
   - outcome: Skill 与 Spec、用户入口、架构和产品的支持调用描述一致；主 Skill 仅保留必经入口与边界，审计细则和远程事务留在各自 reference。
   - scope: `specs/plan/spec.md`, `specs/check/spec.md`, `skills/RESOLVER.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `README.md`, `README.zh-CN.md`；仅在现有断言与新契约冲突处更新 `tests/development-integrity.test.ts`, `tests/attestation.test.ts`, `tests/skill-architecture.test.ts`。
   - verify: `node skills/doctor/scripts/checker.ts . --json`；检查 11 个公共 Skill、既有 Shape→Explore 约束和实现验收生命周期保持一致，README 清楚说明 Plan 的 Check 支持依赖，不修改历史计划或新增记忆类别。
4. 验证完整行为并记录实际证据。
   - outcome: 真实调用证明自动触发、审查发现和修订，而契约/模拟测试证明权限及事务边界；证据区分实跑、模拟和未覆盖项。
   - scope: 本次修改的 Skill、references、Specs、上述 tests 和本计划的实施证据；行为验证在项目外临时副本与 fake GitHub 接口中进行。
   - verify: `pnpm test`, `pnpm check`, `node skills/doctor/scripts/checker.ts . --json`, `git diff --check`；实际会话至少覆盖本地修订、`both` 不一致、混合 created/reused、远程冲突、不可独立审计与直接 Plan 入口。保存实际审计次数、工具调用、产物变化和最终输出；静态规则与 mock 通过不替代 Agent 行为证据。

## Verification

- command: `pnpm test -- tests/plan.test.ts tests/plan-issue-harness.test.ts tests/plan-paired-issue.test.ts`
- command: `pnpm test`
- command: `pnpm check`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [ ] 三个 target 均在生成阶段结束后自动审计一次，内部修订不递归触发。原生 local 完整入口已确认一次独立审计；远程恢复路径已验证修订，但完整远程生成入口和 CLI 子代理次数仍有下述证据限制。
  - [x] 审计使用原始需求与实际项目证据，能发现预置的遗漏、越界与无效验证。
  - [x] 明确问题自动修订并定向核对，重大取舍、证据缺失和剩余问题准确报告。
  - [x] Issue 修订限定于本轮新建或 `both` 可写受管内容，写前核验、人工内容保护和停批规则有效。
  - [x] 原始事务和修订阶段的失败、歧义、labels 与未尝试条目分别如实记录。
  - [x] 原审计结论不被修订后自检升级为独立通过，draft 不升级，无实现或交付副作用。
  - [x] 实际会话证据与模拟/静态结果明确区分，直接入口和既有 Shape→Explore 行为保持有效。

## Assumptions & risks

- 新的独立审计上下文依赖宿主能力；没有可用执行能力时只能报告未能建立审计结论，不能承诺 Markdown 可以强制宿主提供该能力。
- GitHub 的回读和写前快照检查不是原子 CAS。复用现有有限事务和一次回读只能证明该时点的观察，不增加通用锁或后台一致性机制。
- 一轮审计后的定向验证不建立对修订版本的新独立 verdict；输出必须保留这一证据边界。
- 当前检出为 `feat/remove-bench`，包含已发布的 bench 删除工作。此 Plan 仅新增规划产物；后续 Implement 按届时分支/PR 状态选择本任务工作分支，沿用已移除 bench 的项目结构，不混改既有删除记录。

## Assurance

- Candidate basis: `17eb171f4dd6a98a9c6d7d94a172eeba59c7dd6d + sha256:7216ccff90c563866e60d1fe03d5f9be01a1ff0d07ddfc752adde013f9a48b34`。覆盖相对已合并主分支基线的完整仓库变更和未忽略的新文件；仅排除本计划 status 与 Assurance 投影，外部行为证据另以内容 manifest 标识。
- Candidate producer: Implement，当前任务 `/root`，分支 `feat/plan-auto-audit`。实施基线为 `17eb171f4dd6a98a9c6d7d94a172eeba59c7dd6d`；上一项 bench 删除已合并，本次未改动其历史计划或归档。
- Evidence and limitations: `pnpm test` 通过 17 个文件、169 项测试；`pnpm check` 的格式、lint 和类型检查通过（24 个检查文件），Doctor 输出 `[]`，`git diff --check` 通过。Plan/Check 均通过 skill-creator 的 `quick_validate.py`，使用已有临时 PyYAML 依赖；未新增项目依赖。原生成事务断言保留，新修订测试按职责拆分，各文件不超过 400 行。测试中的状态表和 fake transaction traces 验证契约与模拟调用，不声称证明 Agent 必然遵守。
- Check producer: `/root/audit_implementation_review`，独立只读静态 Check，覆盖已授权计划、Plan/Check、references、Specs、直接文档及拆分测试结构。其返回后只有机械格式化与本计划证据记录变化，核心语义未改；该 review 没有运行行为会话或提供正式 acceptance。
- Verdict: pass
- Acceptance: not requested

### 实际行为证据

执行者 `/root/audit_behavior` 完成 8 个隔离场景，报告为 `/private/tmp/plan-auto-audit-behavior-QO2cjY/REPORT.md`。完整原生直接 Plan local 入口自动启动一次独立审查者 `/root/audit_behavior/forward_direct/check_csv_plan`（`fork_turns=none`）；根任务通过宿主返回直接核验该子代理实际完成报告。审查与最终计划同为 SHA-256 `7a11c1bf735934e3ff94ee11586d25489f4cfe746494d64372e8b36727830a61`，审查者读取原始需求、项目事实和实际产物，限定规划质量返回 pass，计划保持 draft。

恢复场景由真实 Agent 执行：本地错误的排序/写文件及不存在的验证命令得到自动修订；两份产物不一致时先修本地，再对同一模拟 Issue 追加一次 edit 并紧接一次回读；人工正文、labels 和 comments 保留。混合批次仅修订本轮 created #101，reused #42 原样保留且项目零写入。摘要冲突场景只修本地、远程零 edit；独立上下文不可用场景返回 inconclusive 并原样保留草稿。作者保留原 findings 与修订验证的区别，没有改称新独立 pass。

远程场景从明确模拟的生成完成记录恢复，使用只保存状态和真实调用的 fake gh，没有实际 create 证据，也不证明真实 GitHub 并发 CAS。CLI JSONL 未展开 spawn payload 和子代理读取流，所以这些 CLI 场景的独立审计次数未能单独确认；原生直接入口的完整来源证据不能替它们补齐。失败/模糊返回/label 失败及停止续批的完整矩阵由确定性 mock 覆盖，后续再次 Plan 调用未另开真实会话。所以上方涉及三个 target 完整入口与次数的总验收项保持未勾选；其余勾选项结合静态审查、mock 与报告列出的实际观察，不提升为完整实现验收。

原始请求、Skill 副本、CLI JSONL、原生委派/报告、产物与模拟远端前后快照已保留在该临时证据目录。`evidence-sha256.json` 包含 188 个文件/链接条目，排除 fixture `.git` 和 manifest 自身；manifest 的 SHA-256 为 `aac0aef6e3fbcdfb61a5ec1bed4d3e8bb134fede4f5a484233801aaaa1e48a65`，根任务已逐项复核。源 Skill 相对后续会话副本只有 audit 表格格式空白差异；最早 CLI direct-local 还缺少后来补齐的明确 Check 相对链接，独立触发以更新后的原生场景为准。证据位于项目外临时目录，不随 Git 提交或保证永久保存。

未更新全局 Skill 快照，未提交、推送或修改真实 Issue；当前结果是带明确验证边界的 candidate。

### 候选源码复算

以下只读命令按完整变化路径、文件模式、内容 SHA-256 和删除项计算身份。它包含本计划正文，只规范化本计划自己的 status 和 Assurance；其他计划、文件和未忽略的新文件均不被排除。行为证据按上方独立 manifest 校验。

```sh
python3 - <<'PY'
from pathlib import Path
import hashlib
import json
import re
import stat
import subprocess

root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
base = "17eb171f4dd6a98a9c6d7d94a172eeba59c7dd6d"
plan = "plans/2026-09-09-feat-plan-auto-audit.md"

def git(*args):
    return subprocess.check_output(["git", "-C", str(root), *args]).decode("utf-8")

changed = set(git("diff", "--name-only", "-z", base).split("\0"))
changed.update(git("ls-files", "--others", "--exclude-standard", "-z").split("\0"))
rows = []
for name in sorted(changed - {""}):
    path = root / name
    if not path.exists() and not path.is_symlink():
        rows.append({"path": name, "mode": "absent", "sha256": None})
        continue
    mode = "120000" if path.is_symlink() else (
        "100755" if path.stat().st_mode & stat.S_IXUSR else "100644"
    )
    content = str(path.readlink()).encode("utf-8") if path.is_symlink() else path.read_bytes()
    if name == plan:
        body = re.sub(r"(?m)^status: .*$", "status: <excluded projection>", content.decode("utf-8"), count=1)
        body = re.sub(r"(?ms)^## Assurance\n.*?(?=^## |\Z)", "", body)
        content = (body.rstrip() + "\n").encode("utf-8")
    rows.append({"path": name, "mode": mode, "sha256": hashlib.sha256(content).hexdigest()})

payload = {
    "baseRevision": base,
    "files": rows,
    "exclusions": [
        "associated plan status line and Assurance section",
        "isolated behavior evidence outside repository (separately identified)",
    ],
}
canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
print(base + " + sha256:" + hashlib.sha256(canonical).hexdigest())
PY
```
