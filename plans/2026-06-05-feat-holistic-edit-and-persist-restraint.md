---
mode: feat
title: 跨 skill「整体最优而非打补丁」规则 + persist 克制泛化
created: 2026-06-05
status: done
---

# 跨 skill「整体最优而非打补丁」规则 + persist 克制泛化

## Building

两笔互补的 squire 自治修改，合在一份 plan、各自能独立 ship：

- **Phase 1（件二）**：给 `rules/anti-patterns.md` 加第 3 条跨 skill 规则——改动时优先「触碰范围内的整体最优」，不在已有结构上局部打补丁。规则随 `rules/` 经各 SKILL.md 顶部指针「本会话加载一次」对所有 skill 生效，无需往 SKILL.md 重复抄。
- **Phase 2（件一）**：把 persist 现在只覆盖 **spec** 目标的「不够格不记」克制，重排成一条 **target-general** 的「够格才占一个位置」把关——往任何记忆 artifact 加内容前先判断是否 memory-worthy，不够格就不开新段、不新建 artifact、不加新条目。

两者正交：Phase 1 管「加的时候怎么加」（编辑质量），Phase 2 管「要不要加」（编辑范围）。Phase 2 的落地本身遵守 Phase 1 的规则（reshape 而非 append），所以构建顺序 Phase 1 在前。

## Not building

- 不往 build / persist / 其他 SKILL.md 重复抄 Phase 1 的规则（symlink + 顶部指针已覆盖，重复即违反本规则自身）。
- 不改 persist 的 record/correct/backfill 三 mode 本身，不改 anti-invention / create-if-missing 语义——只加「够格才占位置」这一层把关。
- 不给不同目标定**不同**的 worthiness 门槛（一条通则，spec 现有门槛降级为其实例）。
- 不在本 plan 内编辑 `specs/persist/spec.md`——spec delta 由 build 后的 `/persist` 记录（走正常闭环）。
- 不动 PRODUCT.md（这是行为约束，非哲学/边界变更）。

## Approach

最小整体解：

- **Phase 1** 只动 `rules/anti-patterns.md` 一个实体文件（已核实：7 个 `skills/*/references/anti-patterns.md` 均为指向它的 symlink）。按现有两行的 Wrong/Right 详写风格补第 3 行。承重澄清写进规则正文：**「整体最优」指「触碰范围内的整体」，是编辑质量，不是扩大 scope**——不借此重写无关整篇、不越 plan 范围改无关文件（build 的「守方案范围」仍成立）。这条澄清同时钉死 Phase 1 与 Phase 2 之间的张力（「别打补丁」不等于「动不动重写」，与「克制少加」不冲突）。
- **Phase 2** 重排 persist SKILL.md 现有的 `## Progressive rigor — keep it lightweight`（spec 专属）→ 一条 target-general 的克制段：通则在前（任何 artifact 加内容前判断够不够格），spec 的 Lite/Full + 「无对外行为不记录」降为通则下的一个实例；并在段内交叉引用 Phase 1 的规则（「怎么加」见 anti-patterns）。同步把 `## When to stop` 里 spec 专属的那条 stop 收敛成 target-general。写法是**行为约束**（persist 自己不加），不是内容禁令（项目不许有）。

不给第二方案：两个 Phase 的取舍都不接近临界（已在 clarify 定）。最小项即「只做 Phase 1 / 只做 Phase 2」，本 plan 两 Phase 独立可拆。

## Premise collapse

本 plan 假设「整体最优」可以被**界定在「触碰范围内」**，从而不与 build 的 scope 纪律、persist 的 correct-mode 最小编辑相撞。若这个边界没在规则文本里划清，规则就会被读成「license 重写整篇」，反过来破坏件一的克制、并与 build「守方案范围」矛盾——届时这条规则弊大于利。

应对：把边界子句直接写进规则 Right 列（「整体最优指触碰范围内的整体，不是整个仓库；不扩大 scope」），并用一条 acceptance scenario 专门验「不扩大 scope」这一面。

## Key decisions

1. **件二固化成 `rules/anti-patterns.md` 一行，不进 SKILL.md** — rules 经顶部指针全会话共享，进 SKILL.md 是重复（自我违反本规则）。已核实 symlink 方向。
2. **件一是「泛化」而非「新增平行规则」** — 把 spec 专属克制抽成通则、spec 门槛降级为实例，而非在旁边再加一段 target-general 文字（dogfood Phase 1：reshape 而非 append）。
3. **承重澄清 = 边界子句** — 「整体最优」限定在「触碰范围内」，写进规则正文，化解张力。
4. **spec delta 走闭环，不在 build 内写 spec** — Phase 2 改 persist 行为 → persist spec 有 delta → 由 build 后 `/persist` 记录，dogfood 闭环。
5. **构建顺序 Phase 1 → Phase 2** — 让 Phase 2 的实现遵守刚加的规则；但两 Phase 无文件级依赖，各自能单独 ship。

## Public surface changes

squire 没有代码 API；此处「surface」= 各 skill 的行为契约（prose）。

- **Phase 1**：新增一条对所有 skill 可见的跨 skill 编辑规则（经加载的 anti-patterns.md）。无代码接口变更。
- **Phase 2**：persist 的行为契约新增一条 target-general「够格才占位置」把关。`specs/persist/spec.md` 将由 build 后的 persist 记录（见 Spec delta）。

## Spec delta

仅 Phase 2 改变 persist 的可观察行为。Phase 1 改的是 `rules/`（非 spec-governed artifact），无 specs/ delta。

```markdown
## ADDED Requirements

### Requirement: 不够 memory-worthy 不开新位置

persist 写任一记忆 artifact 前必须判断该内容是否够格占一个位置：不够 memory-worthy 的内容，必须不开新段、不新建 artifact、不加新条目，而非追加凑数。此约束跨所有目标（spec / ARCHITECTURE / DESIGN / WORKFLOW / ROADMAP / README）；spec 的「无对外可见行为不记录」是它的一个实例。约束写成 persist 自身的行为（persist 不加），不写成内容禁令（项目不许有该内容）。
Verify: manual(integration)
```

> 现有 requirement「默认产出轻量记忆」不动——它管 Lite/Full 的 rigor 级别（spec 专属的另一根轴），与本条「要不要占位置」正交，无需 MODIFY，避免制造重复。

## Implementation steps

### Phase 1 — 跨 skill 规则（独立可 ship）

1. 给 `rules/anti-patterns.md` 的表格补第 3 行
   - change: `rules/anti-patterns.md` — 在现有 2 行后追加一行，列为 `#` / `Pattern` / `Wrong` / `Right`，按现有详写风格：
     - **Pattern**：改动时在原有基础上局部打补丁，而非考虑整体最优。
     - **Wrong**：给已有结构 bolt 上一段/一行就收手——为「最小改动」牺牲整体，留下重复段落、错位的归属、越堆越长且无人重排的结构；把「只动我这块」误当成「在我这块里随便接上去」。
     - **Right**：在你触碰的范围内优先选全局更干净的结果——该重排就重排、该合并重复就合并，而不是在旁边再加一块补丁。边界：这是编辑**质量**，不是扩大 scope——不借此重写无关整篇、不越过 plan/方案的范围去改无关文件（build 的「守方案范围」仍成立）；「整体」指触碰范围内的整体，不是整个仓库。
   - verify: `pnpm test`（smoke：markdown 链接 / references 路径仍有效）；目视确认表格 3 行对齐、Wrong/Right 完整。

### Phase 2 — persist 克制泛化（独立可 ship，建议在 Phase 1 之后构建）

2. 重排 persist SKILL.md 的克制段
   - change: `skills/persist/SKILL.md:67-74` — 把 `## Progressive rigor — keep it lightweight` 重排为一条 target-general 克制段：
     - 段首通则（英文，匹配该文件语言）：往任何 artifact 加内容前判断是否 memory-worthy；不够格则不开新段、不新建 artifact、不加新条目，跨所有目标而非仅 spec；存疑即视为不够格、说明并跳过。
     - 一句指向 Phase 1：这是「要不要加」的克制；「加的时候怎么加」见 `references/anti-patterns.md`（reshape 而非 bolt-on）。
     - 现有 Lite / Full / 「When not to record at all」收为「spec target 的实例」子块，文字保留、归属下移，不重复通则。
   - verify: `pnpm test`（smoke：Outcome Contract 四字段、links 有效）；目视确认段落是重排非追加、无重复表述。
3. 收敛 `## When to stop` 的 spec 专属 stop 条款
   - change: `skills/persist/SKILL.md:90` — 把「The change has no externally observable behavior (for spec memory) — there's nothing to record」调整为 target-general 措辞（内容不够格占位置时 → 不加并说明），与步骤 2 通则一致、不另起重复条目。
   - verify: `pnpm test`；目视确认 stop 列表无重复、与克制段呼应。

## Verification

- command: `pnpm test`（= `vp test run`，含 frontmatter / Outcome Contract / references / markdown links / RESOLVER 一致性等 smoke）
- checklist (manual)：
  - [ ] `rules/anti-patterns.md` 第 3 行 Wrong/Right 完整，含「触碰范围内 / 不扩大 scope」边界子句
  - [ ] persist SKILL.md 克制段是**重排**（spec 内容归属下移为实例），不是新增一段平行文字
  - [ ] persist 克制写成行为约束（persist 不加），非内容禁令（项目不许有）
  - [ ] 克制段交叉引用了 anti-patterns 的「怎么加」规则
  - [ ] `## When to stop` 无重复条目
  - [ ] 全文无 `--no-verify` 类绕过、无个人路径 / AI 署名（portable surface check 通过）

## Rollback

两 Phase 都是纯文档/规则编辑，无外部状态变更。回滚 = `git revert` 对应 commit（或分 Phase 各一个 commit，单独 revert）。无迁移、无数据、无远程副作用。

## Risks & Unknowns

- **「整体最优」被误读为「重写整篇」**：impact = 破坏克制、与 build scope 纪律矛盾。mitigation = 边界子句写进规则 Right 列 + acceptance scenario 专验「不扩大 scope」。
- **persist 克制泛化后误伤 create-if-missing**：impact = 该建的 artifact 不建。mitigation = 通则只管「内容够不够格占位置」，不改 create-if-missing「该目标需要就建、出生带权威源内容」的语义；二者正交，步骤 2 文字需点明。
- **Unknown**：无阻塞项。各目标共用一条 worthiness 门槛是否够（vs 逐目标定不同门槛）—— 已在 clarify 判定通则足矣；若日后某目标需特殊门槛，再以 correct/新 plan 补注，非本 plan blocker。

## Mode-specific

### Interface boundary

- **Phase 1 暴露**：一条跨 skill 行为规则，对所有 7 个 skill 在会话内生效（经 anti-patterns.md 加载）。**不暴露**：无代码 API / CLI / 配置；不进任何单个 SKILL.md 正文。
- **Phase 2 暴露**：persist 在所有记忆目标上的「够格才占位置」把关行为；对应 `specs/persist/spec.md` 的一条 ADDED requirement（build 后由 persist 记录）。**不暴露**：不改三 mode 路由、不改 anti-invention / create-if-missing；不给逐目标差异化门槛留接口（MVP 即一条通则）。
- **Inputs/Outputs**：N/A（行为契约变更，非函数接口）。
- **Side effects**：仅文件编辑（`rules/anti-patterns.md`、`skills/persist/SKILL.md`）；无 git / 网络 / 外部服务。

### Acceptance scenarios

- **happy（Phase 2 克制生效）**：Given persist 收到一笔变更，其拟加内容对目标不够 memory-worthy（如给 ARCHITECTURE 加一个琐碎决策、给 README 加一条非入口细节），when 跑 persist，then persist 不开新段/不新建/不加条目，并说明「不够格、跳过」——任何目标，不止 spec。
- **happy（Phase 1 重排生效）**：Given build/persist 改一处已有结构，when 编辑，then 选触碰范围内全局更干净的重排（合并重复、调整归属），而非旁边 bolt 一块补丁。
- **error/边界（不扩大 scope）**：Given Phase 1 规则，when agent 想借「整体最优」重写无关整篇 / 改 plan 范围外的文件，then 规则的边界子句挡住——「整体」限于触碰范围，build 的「守方案范围」仍成立。
- **edge（克制 ≠ 永不加）**：Given 拟加内容**够格**（真实改变了项目当前是什么），when 跑 persist，then 照常加——克制是把关不是禁加。
- **edge（不误伤最小编辑）**：Given correct mode 的一处最小、慎重编辑，when 应用 Phase 1 规则，then 不被 license 成整篇重写——「整体最优」限于被触碰范围。
