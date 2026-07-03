---
mode: fix
title: shape 文档机械化——修复 grill / design gate / 决策交回三条 Requirement 的稳定失守
created: 2026-07-03
status: done
---

# shape 文档机械化(grill 枚举分档 + design gate 固定标记)

## Building

把 shape 的三条稳定失守 Requirement 从纪律描述改成机械停下点:grill 前强制枚举 load-bearing 决策清单并按清单长度分档(≤3 合并一轮、≥4 逐个问);design summary 定为固定标题 `Design Summary` 的独立消息,对它的确认是写 plan 的唯一解锁条件;spec 三条同步 MODIFIED;bench 机械 checker 新增 `design-gate-skipped` 硬规则,让 gate 从 judge 模糊判定升格为代码可判。

## Not building

- 不动 shaping 协议骨架(brainstorm-first 结构不变,阶段顺序不变)
- 不改其余 10 条 Requirement 及其判卷方式
- 不新增 skill、reference 文件或 host 层强制机制(AskUserQuestion 硬编码等属升级路线,见 Premise collapse)
- 不改 judge prompt 与校准基准(判卷侧只加机械规则)
- 不在本 plan 内跑回归全量矩阵(验收命令列出,跑与否由用户按成本决定时机)

## Root cause

> 根因是 `skills/shape/references/shaping-protocol.md` 的 Grill 与 Present design 两节在「选定推荐 approach 之后」只给了纪律性行为描述(interview / walk down / ask whether it looks right),没有任何机械停下点,导致模型在该滑点把 grill、design summary、决策交回三步一路压缩成一次打包确认或直接写 plan。

证据:两轮 bench 数据的正反对照——凡有显式停下动作的步骤(mode 选择、approach 选择、AskUserQuestion)16/16 场全部被遵守;纯纪律链条上,逐枝 grill 真实基线 6/6 fail、最有利的合成场景仍 7/14 fail,design gate 真实 5/6 fail(典型形态:用户回应其他问题的「行/YES」被错认为设计确认),决策交回真实 5/6 fail(load-bearing 决策无声并入 plan)。三条同根因:滑点在「approach 选定 → plan 写出」之间无机械锚。

## Approach

**选定:全链机械化(文档、契约、测量三处对齐)。** 协议文档写入机械动作,spec 同步为机械可验的契约表述,bench checker 把 gate 检查落成代码——修复与测量用同一套锚点,回归对比不依赖 judge 方差。

考虑过的替代:

- **只动协议文档,spec 与 checker 不动**:改动最小,但契约还是旧表述、judge 按旧标准判,新机制是否被遵守只能靠总分间接观察,测不准这次修复本身。未选。
- **协议结构重排(grill 并入 approaches 展示)**:消灭滑点本身,但动协议骨架;brainstorm-first 重写刚落地,诊断数据不支持这么深的改动。未选。

## Premise collapse

本方案假设**「枚举决策清单」这个新的机械动作会像既有停下点一样被遵守**(依据:16 场里显式停下动作零失守)。若它也被滑过,说明文档层机械化已到天花板,升级方向是 host 层强制(把清单与 gate 做成 AskUserQuestion 的硬编码调用),那超出本 plan 且要先验证跨 host 可行性。

## Key decisions

1. **枚举清单是无条件停下点,档位由清单长度机械决定** — 分档判据必须自身可验证,否则「小任务」的认定成为新滑点;3 条为界(gold case 1 被人工容忍的打包量级恰为 3 条,真实 fail 案例均为 5-10 条全并入)。
2. **design summary 用英文结构锚 `Design Summary` 作固定标题** — 语言无关、机械可查;先例是 spec 的 `### Requirement:` 英文结构标签惯例。末尾只问一件事,杜绝「行」字回应被张冠李戴。
3. **checker 规则查「plan 写入前标记消息存在性」而非语义** — 机械层只判可机械判的(标记出现过没有);「确认是否针对该消息」「清单是否实质」仍归 judge 的决策交回条。
4. **文本量封顶:协议两节净增 ≤15 行、SKILL.md 净增 ≤3 行** — 用重写换空间(anti-pattern #3:重塑所触段落,不叠补丁);超限即机械化设计不干净,回炉。
5. **spec 决策交回条只轻改** — 它是跨阶段泛化条款,点名清单确认与 gate 确认为强制实例即可;实质判定留给 judge,防止形式化清单骗过机械检查。

## Architecture

None——不跨模块边界:协议文档、spec、checker 各自在既有位置就地修改。

## Public surface changes

- `skills/shape/` 文档行为变化(随下次 `npx skills add .` 重装生效)
- `specs/shape/spec.md` 三条 Requirement MODIFIED
- bench checker 新增违规类型 `design-gate-skipped`(报告 JSON 的 `mechanicalViolations[].check` 新增枚举值)
- 无 CLI / API / 依赖变化

## Spec delta

## MODIFIED Requirements

### Requirement: 逐枝 grill 推荐方案

选定推荐 approach 后,shape 必须先枚举本方案的 load-bearing 决策清单(范围界、公共接口、数据流、错误处理、回滚、测试、迁移顺序、架构触发、脆弱假设中实际在场的)并展示给用户;清单 ≤3 条时可合并为一轮确认且每条附推荐答案,≥4 条时必须逐个提问、每问附推荐。未经清单确认的决策不得写入 plan 的 Key decisions。(Previously: 只要求 interview 式逐枝下行、一次一问,无枚举动作与档位判据。)
Verify: bench 场景 feat-midsize-sharing / fix-multi-constraint-import + judge 逐条判定

### Requirement: plan 前 design summary gate

design summary 必须以固定标题 `Design Summary` 开头、独立成一条消息,末尾只提出一个问题:是否确认这份设计。只有用户对该消息的确认可解锁写 plan;对其他问题的肯定答复不构成设计确认。(Previously: 只要求在写 plan 前展示设计并询问,无固定标记与单一问句约束。)
Verify: bench 机械 checker `design-gate-skipped`(plan 写入前标记消息存在性)+ judge 判定确认针对性

### Requirement: 决策点把串联交回用户

(轻改)在原表述基础上点名:grill 决策清单的确认与 Design Summary 的确认是本条的两个强制实例;实质性判定(决策是否真被交回而非形式化列举)仍按对话证据判。(Previously: 无强制实例点名。)
Verify: manual(integration) + bench judge 逐条判定

## Interface boundary

不适用(fix mode 无新对外接口;行为边界即上述 Spec delta)。

## Regression tests

- `bench/src/checks/checks.test.ts`:新增 `design-gate-skipped` 正反用例——反例:事件流含 plan file-write 且其前无含 `Design Summary` 的 assistant-message → 1 条 hard 违规;正例:标记消息在 plan 写入前出现 → 0 条。新测试,修复前红(规则不存在)。
- 行为级回归 = bench 全量矩阵(见 Verification):以 `bench/results/2026-07-02T11-59-28-054Z` 为改前基准,同条件(全 8 卡 × 双 host × repeat 1)对比。旧文档跑出 grill 50% fail 即「失败测试」,新文档跑出 ≤25% 即绿。

## Implementation steps

1. shaping-protocol.md 重写 Grill 与 Present design 两节
   - outcome: Grill 节含枚举动作、3 条档位线、合并/逐问两种形态与「未上清单不得进 Key decisions」;Present design 节定义 `Design Summary` 固定标题、独立消息、单一确认问句;两节合计净增 ≤15 行,原纪律性描述被收进机械动作而非并存
   - scope: `skills/shape/references/shaping-protocol.md`
   - verify: `pnpm test` 通过(smoke 链接与结构检查);人工核对行数与两形态描述完整
2. SKILL.md 同步 HARD-GATE 与 checklist
   - outcome: HARD-GATE 含「写 plans/ 的前置 = Design Summary 消息已出现且获确认」;checklist 第 4/5 步措辞替换为机械动作;净增 ≤3 行
   - scope: `skills/shape/SKILL.md`
   - verify: `pnpm test` 通过;diff 行数核对
3. spec 三条 MODIFIED 合入
   - outcome: `specs/shape/spec.md` 三条按上述 Spec delta 更新,含 `(Previously:)`;其余 10 条不动
   - scope: `specs/shape/spec.md`
   - verify: `pnpm test` 通过;`bench/src/judge/spec.ts` 提取仍为 13 条
4. bench checker 新增 `design-gate-skipped`
   - outcome: 事件流中首个 plan file-write 之前无「文本含 Design Summary 标题的非 sidechain assistant-message」→ hard 违规,附 plan 路径为证据;brainstorm 会话(无 plan 写入)不触发
   - scope: `bench/src/checks/index.ts` + `bench/src/checks/checks.test.ts`
   - verify: `pnpm test` 通过,正反用例各绿(TDD:先红后绿)
5. 重装 skill 并冒烟一场
   - outcome: `pnpm install`(skills add)后,`pnpm bench:run --scenario fix-csv-export-broken --host codex` 跑通,transcript 中出现枚举清单与 Design Summary 标记,checker 新规则零违规
   - scope: 运行验证,不改文件
   - verify: 该场 report 中 `design-gate-skipped` 不出现,grill 条判 pass
6. 回归说明写入 golden 校准记录
   - outcome: `bench/golden/README.md` 追加一行说明:spec 三条已 MODIFIED,gold case 人工基准按旧契约判卷,校准比对时这三条按方向一致(partial 容差)解读,不因新机械要求追溯判罚旧会话
   - scope: `bench/golden/README.md`
   - verify: 文件含该说明;`node bench/src/calibrate.ts` 仍通过(分差 ≤1)

## Verification

- command: `pnpm test`(checker 新规则正反用例 + 全库 smoke)
- command: `node bench/src/calibrate.ts`(gold case 校准不回退)
- command: `pnpm install && pnpm bench:run`(全 8 卡 × 双 host,与 `bench/results/2026-07-02T11-59-28-054Z` 同条件对比;跑的时机由用户按成本决定)
- checklist (manual):
  - [ ] grill fail 率 50% → ≤25%(判分噪声 ±0.5 之上的信号)
  - [ ] 决策交回 fail 率不升(改前 19%)
  - [ ] 双 host 总分均值不降(改前 claude 8.2 / codex 7.8)
  - [ ] `design-gate-skipped` 全场零 hard 违规
  - [ ] 协议两节净增 ≤15 行、SKILL.md ≤3 行

## Rollback

三处独立可逆:revert 协议两文件即回旧行为(重装 skill 生效);revert spec 三条(含 Previously 可直接还原);checker 规则删除即回旧检查面。bench 结果目录不受影响,基准矩阵仍在。

## Risks & Unknowns

- **形式主义清单**(为过清单而列清单):机械层只保证清单出现,实质性由 judge 的决策交回条继续判;若回归中出现「清单齐全但总分掉」,按此路径诊断。owner: 用户解读回归报告,blocker: no。
- **合成场景高估**(基线一致性已证驱动器偏乐观):回归对比只在同条件矩阵内做结论,不外推真实体验;真实体验的验证靠后续真实会话再判卷。owner: 用户,blocker: no。
- **gold case 契约漂移**:人工基准按旧契约,校准解读规则见步骤 6;下一个真实会话 gold case 宜按新契约重建。owner: 用户,blocker: no。
