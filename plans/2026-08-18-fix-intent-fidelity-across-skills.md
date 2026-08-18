---
mode: fix
title: 在完整 Skills 生命周期中保持意图与验收权威
created: 2026-08-18
status: done
issue: https://github.com/moeyua/skills/issues/42
---

# 在完整 Skills 生命周期中保持意图与验收权威

## Building

修复 Skills 在多轮、跨能力和工件传递中的两类同源失控：一类是用户 outcome、重大决定与授权被 Agent 推断、机制或既成 artifact 静默替换；另一类是执行能力自行选择证据、判断证据充分性并把自己的结果升级成独立验收或 `done`。

保留已经形成的 Intent、Authority、Evidence、Invalidation 四项语义，并增加一个贯穿它们的 Attestation 原则：每个重要状态都必须由有权产生它的主体证明。Attestation 不是第五张状态表，也不是持久 ledger；它回答“谁有权产生这个声明”，从而使一个能力既不能制造自己的上游授权，也不能授予自己的下游验收。

Implement 产生有稳定 basis 的 `candidate`：已实现的完整改动、claimed outcome、本地 evidence 与已知限制。没有独立 Check 时，Implement 可以正常结束在 `implemented` / `locally verified`，但不能声称 `accepted` 或把关联计划标为 `done`。需要 `accepted` / `done` 时，由 Check 独立确定并读取同一 candidate basis、原始 outcome、授权边界和现有 evidence，自行选择相称 review/test/e2e，并给出 Check producer/reference、pass/findings/inconclusive verdict 及独立 acceptance field。finding 只否定 acceptance，不产生修复授权；只有仍 active 的 Implement authorization 或新的显式实现请求才可进入修复，修复后只有在要恢复 accepted/done 时才必须再次 Check。

计划状态变为 `draft → approved → candidate → done`。`candidate` 由 Implement 在实现 outcome、本地 evidence 与 stable basis 已形成时产生；findings/inconclusive 保持 candidate；`done` 只由 acceptance-scoped Check 对同一 basis 的 `pass` + `attested for the exact current candidate` 解锁。计划以单一 recorded Assurance snapshot 保存最后一次获授权投影时的 basis、两类 producer、evidence/limitations、verdict 与 acceptance；它是 time-scoped 历史记录，不证明没有 later result。状态写入仍是消费结果的机械动作，不把实现者重新变成验收者，也不建立历史 ledger。没有关联计划时，同样的 assurance state 只出现在结果报告与 Handoff，不强制创建 artifact。

## Not building

- 不为“dogfood 不是 Check”“测试绿不等于 e2e”等单次借口增加事故规则；它们统一由 claim producer / attestation authority 解决。
- 不强制每个 Implement 都运行完整 Check。小任务可以诚实结束在 candidate 或 locally verified；轻量来自允许低 assurance state，而不是允许低 assurance 冒充 accepted。
- 不让 Implement 自行判定“任务够小”后仍设置 `done`；没有 Check attestation 就没有 independent acceptance。
- 不增加宿主/controller、数据库、receipt service、状态拦截器或机械 completion gate。本次只修改 Markdown Skills、Specs、计划模板和已有契约测试，因此不能承诺形式化强制。
- 不建立通用持久 intent/evidence ledger，不为无关联计划的 Implement 自动创建 plan，也不把 candidate 状态扩成新的项目管理系统。
- 不改变 Check 的只读边界；Check 不修复 finding、不编辑 plan，Implement 只在取得 verdict 后机械投影计划状态。
- 不改变 Plan 的 `local` / `issue` / `both` targets、Issue problem-record 边界、Publish 的 commit/push/PR ownership、Release 的 exact release-set/recovery、六类 durable memory 或 11 个公共能力清单。
- 不恢复旧长 prompt、固定 Shape→Plan→Implement 流水线、universal Outcome Contract、规则森林或统一正文模板。
- 不新增或改造 bench，不用 prompt 正则命中冒充 Agent 行为证明，不承诺不同 fresh sessions 产生相同推理或措辞。
- 本计划不实施、提交、推送、开 PR、发布或编辑既有 Issue。

## Root cause

`skills/implement/SKILL.md:33-47` 同时让 Implement 决定是否组合 Check、选择和解释本地 evidence、并把关联 plan 标为 `done`，而 `skills/check/SKILL.md:24-30` 只有被调用后才产生只读 verdict，`skills/plan/references/plan-template.md` 又缺少 implementation-complete-but-unaccepted 的中间状态；因此执行者可以把 dogfood、测试或任何自选 proxy 当成充分证据，绕过独立判断后仍自我证明完成，这也解释了未来可不断更换借口而复现的同类失控。

## Regression tests

- `manual(integration) — candidate without self-acceptance`（新增）：一个小型 Implement 只执行本地检查且没有调用 Check；修复后可以报告 implemented / locally verified 并正常结束，但关联计划只能到 `candidate`，不得声称 independently reviewed、accepted 或 `done`。
- `manual(integration) — broad change cannot substitute dogfood for review`（新增）：跨 PRODUCT、ARCHITECTURE、Skills 与 Specs 的 change 已跑测试、lint 和 dogfood，但没有 Check verdict；修复后这些 evidence 只能进入 candidate，不能关闭 independent review obligation。
- `manual(integration) — Check owns acceptance`（新增）：Check 独立确定 stable basis，读取完整 diff、原始 outcome、授权与 candidate evidence，自主选择相称 review/test/e2e；只有 basis-matched acceptance pass 才能产生 acceptance，ordinary scoped pass、finding 与 inconclusive 保持 candidate，finding 不能被 Implement 解释成 pass、approved 或 repair authority。
- `manual(integration) — repair reopens acceptance`（新增）：Check 返回 finding 后，未验收 candidate 仍是 candidate；同一次仍 active 的 Implement authorization 或新的显式实现请求才能在编辑前产生 approved，修复产生新 basis，要恢复 accepted/done 必须由后续 Check 重新判断，旧 pass 不得复用。closed done 后出现反证时，later result 在携带它的上下文/Handoff 中 supersede 历史 snapshot，但旧 plan 不自动重开，修复需要新的显式 implementation outcome；只读到 plan 的消费者不得把历史 snapshot 声称为 globally current acceptance。
- `manual(integration) — legacy done is not acceptance`（新增）：历史三状态 plan 只有 `status: done` 且没有完整 Assurance；修复后消费者只能报告 historical implementation completion / acceptance not established，不得伪造 basis、producer 或 verdict，需要 current acceptance 时重新 Check。
- `manual(integration) — direct Implement remains lightweight`（新增）：没有 plan 的清晰小修改可直接 Implement 并以 candidate/local evidence 结束；不得因没有 plan 拒绝工作，也不得为了状态模型自动写 plan。
- `manual(integration) — capability attestation boundaries`（新增）：Shape approval 只来自用户；Plan settled decision 只继承有来源 intent；Docs 不从 code 推出产品意图；Publish/Release 只声明实际交付状态；Handoff 保留 candidate basis、两类 producer 与 pending acceptance。
- `tests/attestation.test.ts`（新增结构化契约测试）及精简后的 `tests/plan.test.ts` / `tests/implement.test.ts`：解析 lifecycle matrix 与 Assurance 字段，保护状态、producer、basis 和 direct-entry 不变量；只验证公共 Markdown 接口，不声称证明 Agent 行为。
- `pnpm test`、`pnpm lint`、`pnpm check` 与 Doctor checker（现有）：保护 11 个 Skill/Spec 配对、references、frontmatter、Plan/Publish/Release 与 durable-memory 等未改结构。

所有行为回归使用一次性 fresh-agent scenario 和正式独立 Check，不写入 `bench/` 或新增自然语言轨迹 fixture。

## Approach

不增加“所有任务必须 Check”的固定流程，而是分离 outcome state 与 assurance state：Implement 始终拥有执行自主权，但只产生 candidate 和自己实际建立的 evidence；Check 是否运行取决于是否要产生独立 acceptance，而不是 Implement 对任务大小的自我分类。这样即使 Implement 跳过 Check，也只能停在较低 assurance 的真实状态，不能自证 `done`。

Attestation 作为 Product 级原则只定义一次；Architecture 记录 claim producer、状态流与写入 owner。每个主 Skill 只保留与自身 outcome 相关的投影：Shape/user approval、Plan/settled source、Implement/candidate、Check/verdict + acceptance field、Docs/truth authority、Publish/Release/exact external state、Handoff/continuation provenance。Specs 记录可观察契约，既有测试保护接口，fresh-agent dogfood 与正式 Check 验证行为。

宿主机械 gate 是另一项产品能力：当前仓库没有生产 runtime 或 controller，不能用 Markdown 伪装成硬保证。本次明确交付 prompt-level authority separation；如果未来要求“无 receipt 时技术上无法写 done”，必须另行 Shape 宿主集成，不在本计划内埋设半成品。

## Key decisions

- Attestation 是四项状态的 producer/provenance 约束，不是第五张状态表或统一输出 schema。
- 一个能力不能制造其所需的上游 authority，也不能自行授予下游 acceptance；artifact 只能携带其来源已有的 authority 和 evidence。
- Shape 的 Design Summary 只由用户响应变成 accepted direction；普通同意不授权下一 public capability。
- Plan lifecycle 增加 `candidate`：`draft` 表示刚写入，`approved` 表示显式或仍 active 的 Implement authorization 正在执行，`candidate` 表示 Implement 声称 outcome 已实现且 stable basis、本地 evidence 与限制已记录，`done` 表示 acceptance-scoped Check 已为同一 basis 产生 pass attestation。
- 旧计划不做伪迁移：legacy `done` 缺少完整 Assurance 时只表示历史 implementation completion，acceptance not established；不批量回填 basis/verdict，也不把旧 artifact 存在当独立验收。
- Implement 不再拥有 `done` 的语义 authority。它可以启动 Check，也可以在不需要 acceptance 时停在 candidate；两条路径都不构成失败。
- Check 保持 read-only，独立确定 stable candidate basis、决定为 claimed outcome 所需的 evidence depth，并返回 Check producer/reference、pass/findings/inconclusive 及 acceptance field。调用者只能依据 basis-matched exact acceptance pass pair 机械写入 `done`，不得重新解释 ordinary scoped pass 或 verdict。
- Check finding 只否定 acceptance，plan 仍是 candidate；若当前 Implement authorization 仍 active 可继续 scope 内修复，否则需要新的显式实现请求，之后才投影为 approved。修复产生新 basis，只有要恢复 accepted/done 时才必须再次 Check，形成按 assurance claim 触发但不自授 repair authority 的闭环。
- 本地测试、lint、dogfood、e2e observation 都保留自己的 evidence identity；只有 Check 可以证明 independent review/acceptance 已发生。
- Direct entry 继续成立。没有 Shape、Plan、Issue、Check 或历史 artifact 时，各能力仍完成自身可授权 outcome，只降低可声明的 assurance，不把流程负担交回用户。
- Publish 可以发布 candidate 或 partial work，但必须准确表示 assurance，不能把 push/PR 状态升级为 accepted correctness；Release 只证明 exact release state，不替底层产品 outcome 验收。
- 现有工作树中的 intent-fidelity 修改是本次同一 coherent fix 的已实现 candidate，不是新设计 authority；实施时按本计划重塑，不丢弃或绕开这些改动。
- Issue #42 保持唯一问题身份并只复用，不编辑正文、不新建替代 Issue。

## Architecture

```text
upstream statement / project fact / tool observation
                    |
                    v
             state or claim
                    |
          authorized producer?
             /             \
           no               yes
           |                 |
    recommendation /         v
      unresolved       attributed state

Implement
  |
  v
Candidate
  - stable, recomputable basis
  - changes
  - claimed outcome
  - local evidence + producer
  - known limitations
  |
  +--------------------------> normal low-assurance finish
  |
  v
Check (read-only, independent)
  |-- findings ----> Candidate (acceptance not established)
  |                       |
  |                active/new Implement authorization
  |                       v
  |                  approved repair ----> new basis/Candidate ----> Check
  |-- inconclusive -> Candidate + missing evidence
  `-- acceptance pass -> exact-candidate attestation -> Done
```

With an associated plan:

```text
draft --user implementation request--> approved
approved --Implement candidate-------> candidate
candidate --Check findings-----------> candidate
candidate --active/new Implement-----> approved
candidate --basis-matched acceptance pass--> done
```

Without a plan, the same semantic states live only in the Implement result and, when needed, Handoff. Check owns the verdict; the caller owns only the mechanical projection of that verdict into an artifact.

## Public surface changes

- Local plan frontmatter accepts `candidate` in addition to `draft`、`approved`、`done`; plan template documents the new lifecycle.
- Legacy `done` without complete Assurance is interpreted as historical implementation completion with acceptance not established; no synthetic migration or backfill is performed.
- Implement no longer reports an unchecked change as accepted/done. It ends with candidate state, exact local evidence and limitations, or composes Check when independent acceptance is needed.
- Check gains an acceptance contract: it evaluates the complete claimed change and evidence sufficiency, returning pass/findings/inconclusive plus an explicit acceptance field without repairs.
- Only a basis-matched `pass` + `attested for the exact current candidate` can produce plan `done`; finding leaves an unaccepted candidate and cannot authorize repair. Active or newly explicit Implement authority must produce `approved` before editing, and the repaired result must be checked again only to regain accepted/done.
- Direct Implement without plan remains valid and creates no artifact; assurance is communicated in the final result/Handoff.
- Shape, Docs, Publish, Release and Handoff expose only the approval/truth/delivery/continuation states their capability is authorized to attest.
- Existing working intent, Design Summary, correction invalidation and proxy-evidence limits remain part of the same fix.

## Spec delta

## MODIFIED Requirements

### Plan — Requirement: local plan lifecycle 区分授权、candidate 与验收

本地 plan 必须支持 `draft → approved → candidate → done`：显式或仍 active 的用户实现授权产生 approved，Implement 在 claimed outcome、stable basis、本地 evidence 与限制已形成后产生 candidate，只有 acceptance-scoped Check 对同一 basis 的 pass + exact-current-candidate attestation 才产生 done。ordinary scoped pass、finding 与 inconclusive 保持 candidate；finding 只否定 acceptance，不产生 approved 或 repair authority。candidate/done 必须保存单一 recorded Assurance snapshot，含 basis、Implement/Check producer、evidence/limitations、verdict 与 acceptance。它只记录最后一次获授权投影时的历史状态；legacy done 缺少完整 Assurance 时只能解释为 historical implementation completion / acceptance not established，不能伪造回填 provenance。消费者声明 current acceptance 前必须核对 basis 和当前上下文可得的 latest applicable Check result，无法建立 applicability 时只能报告历史 snapshot 或重新 Check。closed done 不因新 finding 重开或产生修复授权。Plan artifact 不自行产生任何这些 authority。
Verify: [plan artifact contract](../../tests/plan.test.ts)

### Implement — Requirement: Implement 只产生 candidate 与本地 evidence

Implement 必须报告 stable candidate basis、changes、claimed outcome、实际本地 evidence 与 known limitations，并在 outcome 已实现时产生 candidate；没有 basis-matched exact acceptance pass pair 时不得声称 independently reviewed、accepted 或 done，也不得把 dogfood、测试或自选 proxy 提升为 Check verdict。有关联 plan 时替换 recorded Assurance snapshot；没有关联 plan 时不得为状态跟踪自动创建 plan。
Verify: [implement contract](../../tests/implement.test.ts)

### Implement — Requirement: Check finding 触发修复后重新验收

Check finding 必须使未验收 current candidate 保持 candidate / acceptance not established，不能产生 approved 或 repair authority。只有仍 active 的 Implement authorization 或新的显式实现请求才能在编辑前产生 approved；修复建立新 basis 和 candidate，不能解释、覆盖或自行关闭 finding。只有 subsequent basis-matched acceptance pass 才可恢复 acceptance；若不声明 accepted/done，新 candidate 可诚实结束。closed done 的后续反证不自动授权或重开旧 plan。
Verify: manual(integration)

### Check — Requirement: acceptance verdict 由独立完整证据判断产生

当调用目标是 accepted/done 时，Check 必须独立建立稳定可复算的 candidate basis，读取完整 claimed change、原始 outcome、authorization 与既有 evidence，自主选择足以判断的 review/test/e2e 组合，返回 basis、Check producer/reference、pass/findings/inconclusive 及 `attested for the exact current candidate`、`not requested` 或 `not established`。Check 保持只读；它不修复 finding、不授权修复、不更新 plan，也不得对未检查范围产生 acceptance。
Verify: manual(integration)

### Handoff — Requirement: continuation 保留 candidate 与 attestation state

Handoff 必须在影响继续工作时记录 candidate stable basis、evidence 与 producer、最近 Check producer/reference 和 verdict + acceptance-field pair、Check basis 是否仍匹配 current candidate、findings 或 missing evidence，以及 pending acceptance；不得把 Implement 自报或 artifact 存在升级为 independent acceptance。
Verify: manual(integration)

## Assumptions & risks

- Markdown Skills 仍可能被模型忽略；本次通过语义分权、显式状态和独立 Check 降低自证概率，但不能提供宿主级技术保证。
- `candidate` 是一个公共状态变化，会影响现有 Plan template、Implement lifecycle、Handoff 和相关 tests；实现必须更新全部当前状态匹配，不得留下只接受三状态的隐藏断言。
- Check 的 independence 由独立 context/agent 提供时仍可能有相关系统误差；它提供 separation of authority，不是真值 oracle。Findings 和 inconclusive 必须保留，不能用多数票抹平。
- Direct Implement 没有持久 plan 状态；跨会话继续依赖 Handoff 和实际 working tree。不得为追求统一而自动创建 plan 或 ledger。
- 当前工作树已包含本次 fix 的第一阶段修改。实施必须保留其正确部分、按新契约重塑，并在完整 diff 上正式 Check；不得把此前 dogfood 当成已完成 review。
- Issue #42 正文记录的是同一广义失控问题且已存在。Plan target 只允许复用，不得为了新增 Attestation 方案编辑或替换它。

## Implementation steps

1. 将 Attestation 纳入全局 intent-fidelity 真源
   - outcome: PRODUCT 在 Intent/Authority/Evidence/Invalidation 之上定义 claim producer 原则；ARCHITECTURE 记录 capability attestation ownership、candidate/acceptance flow 和有无 plan 的状态投影，不把同一语义复制成第五张表。
   - scope: `PRODUCT.md`、`ARCHITECTURE.md`。
   - verify: 逐项核对 Key decisions；全局定义只在 PRODUCT，ARCHITECTURE 只记录 producer topology 和 state flow；现有 direct-entry 与 side-effect invariants 保持。

2. 扩展 local plan lifecycle
   - outcome: plan template、Plan runtime contract 与 Spec 支持 `draft → approved → candidate → done`，用结构化 matrix 明确各 transition 的 attestation source、finding/inconclusive 行为和 Plan artifact 无自授权，以 recorded time-scoped Assurance snapshot 保存 stable basis 与 producer，并用 legacy interpretation matrix 阻止旧 done 被升级成 acceptance；Issue targets 与 problem-record contract 不变。
   - scope: `skills/plan/SKILL.md`、`skills/plan/references/plan-template.md`、`specs/plan/spec.md`、`tests/attestation.test.ts`、`tests/plan.test.ts`。
   - verify: Plan contract tests 通过；`rg` 确认所有 plan status vocabulary 一致；local/issue/both、canonical Issue 与 local-first 语义零漂移。

3. 分离 Implement candidate 与 Check acceptance authority
   - outcome: Implement 只产生 stable-basis candidate/local evidence/limitations，basis-matched exact acceptance pass pair 才解锁 done；Check 的 acceptance request 总是审查完整 claimed change 与 evidence sufficiency，返回 basis、producer、verdict 与 acceptance field；finding 保持 candidate 且不授权修复，active/new Implement authorization 修复后只有要恢复 accepted/done 时才必须重新 Check。
   - scope: `skills/implement/SKILL.md`、`specs/implement/spec.md`、`skills/check/SKILL.md`、`specs/check/spec.md`、`skills/check/references/review.md`、`skills/check/references/test.md`、`skills/check/references/e2e.md`、`tests/attestation.test.ts`、`tests/implement.test.ts`。
   - verify: Implement/Check contract tests通过；执行 candidate、pass、finding→repair→recheck、inconclusive 与无 plan direct-entry 五组 manual regressions。

4. 投影跨能力 attestation 边界
   - outcome: Shape、Docs、Publish、Release、Handoff 各自只产生用户 approval、established truth、git/PR state、exact release state 和 continuation state；candidate basis、evidence producer、Check producer/reference、exact verdict + acceptance-field pair 及 basis match 在需要跨会话时保留，其余已有充分边界不重复改写。
   - scope: `skills/shape/SKILL.md`、`specs/shape/spec.md`、`skills/docs/SKILL.md`、`specs/docs/spec.md`、`skills/publish/SKILL.md`、`specs/publish/spec.md`、`skills/release/SKILL.md`、`specs/release/spec.md`、`skills/handoff/SKILL.md`、`specs/handoff/spec.md`。
   - verify: 逐能力记录 changed/unchanged 与依据；不得为复制全局原则修改已有充分文件；Publish/Release 不要求 Plan/Check upstream artifact。

5. 重塑当前 working diff 并完成确定性验证
   - outcome: 现有 intent-fidelity 改动与新增 attestation/state contract 形成一个 coherent diff；无旧三状态断言、无 prompt 事故枚举、无 bench 变化，所有结构与契约检查通过。
   - scope: 完整 working diff、受影响 Skills/Specs/tests、本计划。
   - verify: `pnpm test`；`pnpm lint`；`pnpm check`；`node skills/doctor/scripts/checker.ts . --json`；`git diff --check`；`git status --short -- bench` 为空。

6. 取得正式独立 Check attestation
   - outcome: fresh independent Check 读取本计划、完整 diff、原始 outcome 和全部验证 evidence，给出 pass/findings/inconclusive；finding 由 Implement 修复并重新运行受影响验证，再交给 fresh Check，直到 pass 或准确停在 candidate/inconclusive。
   - scope: 完整 diff 与 verification transcript；Check 全程 read-only。
   - verify: 最终回复引用最后一次 Check verdict 与 acceptance field；没有 exact acceptance pass pair 时计划保持 candidate，不得标记 done。

7. 机械投影最终计划状态并复核声明
   - outcome: 仅在 Check 返回 `pass` + `attested for the exact current candidate` 后把本计划从 candidate 更新为 done；最终报告区分 Implement evidence、dogfood observation、Check attestation 和未运行证据，不把任何一种互相冒充。
   - scope: `plans/2026-08-18-fix-intent-fidelity-across-skills.md`、最终报告。
   - verify: plan status 与最后 verdict 一致；完整 diff 在状态更新后通过 `git diff --check`；未执行 commit/push/PR/release。

## Verification

- command: `pnpm test`
- command: `pnpm lint`
- command: `pnpm check`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [x] 每个关键 claim/state 都能指出有权 producer；artifact 或执行者不能自造上游授权或下游验收。
  - [x] Plan 支持 draft/approved/candidate/done，以结构化 matrix 固定 transition，并以 recorded time-scoped Assurance snapshot 保存 basis 和 producer；legacy done 无完整 Assurance 时 acceptance not established，也不把 snapshot 冒充 globally latest validity。
  - [x] Implement 无 Check 时正常结束在 candidate/local evidence，不声称 accepted/done，也不自动创建 plan。
  - [x] Check 对 acceptance 独立建立 stable basis，读取完整 change 与 evidence，返回 producer、verdict + acceptance field 并保持只读。
  - [x] Finding 保持 candidate 且不产生 repair authority；active/new Implement authorization 修复后才建立新 basis，旧 verdict 不关闭新 candidate；closed done 不被 finding 自动重开或授权修复。
  - [x] Shape approval、Docs truth、Publish/Release external state 和 Handoff continuation 各自不越过 attestation authority，并在相关时传递 basis、producer 与完整 verdict + acceptance-field pair。
  - [x] Direct entry、Plan targets、Issue problem boundary、Publish/Release ownership 与六类 durable memory 保持不变。
  - [x] 没有新增 bench、持久 ledger、宿主 gate、固定全局 pipeline 或事故专用规则。
  - Acceptance projection 只记录在下方 current `## Assurance`；正式 basis-matched pass 之前状态保持 candidate。

## Assurance

- `Candidate basis`: `HEAD 651de9150ea529f51f260790f369d30946357ffa + sha256 38ddfe0f5345b81be3bf5380df160203e30cb727ad02d83b0fa951908ddae039`. Canonical bytes are exactly `utf8("HEAD\0" + HEAD + "\0TRACKED\0") || git-diff-bytes || utf8("\0tests/attestation.test.ts\0") || test-file-bytes || utf8("\0plans/2026-08-18-fix-intent-fidelity-across-skills.md\0") || normalized-plan-bytes`, where `git-diff-bytes` is `git diff --binary HEAD -- .` excluding this plan and the test file, and `normalized-plan-bytes` is exactly `plan.replace(/^status:.*$/m, "status: <projection>").replace(/\n## Assurance\n[\s\S]*$/, "\n")`; the result ends with exactly two LF bytes, representing one trailing blank line.
- `Candidate producer`: Implement in task `01a012b6-9e9a-7651-ba6b-ee5fae66adc9`
- `Evidence and limitations`: `pnpm check` passed; `pnpm test` passed (22 files, 199 tests); `pnpm lint` passed; Doctor returned `[]`; `git diff --check` passed. These are deterministic implementation evidence, not independent acceptance. No bench was added or run; no e2e path applies to this Markdown contract change.
- `Check producer`: `/root/fresh_matrix_acceptance`
- `Verdict`: pass
- `Acceptance`: attested for the exact current candidate
