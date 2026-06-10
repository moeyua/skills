---
mode: feat
title: verify 默认全面把关 + 统一 subagent 执行
created: 2026-06-10
status: done
---

# verify 默认全面把关 + 统一 subagent 执行

## Building

把 verify 从「按用户措辞挑一个 mode 单跑」改成名实相符的合并前大门:

1. **默认路由补全**:用户消息无明确 mode 线索(含裸 `/verify`)时,默认跑全面把关——review + test 必跑,e2e 按适用性(改动触及用户可见行为、且项目有可启动路径)带上;显式 cue 仍然收窄到单 mode,现有路由表不动,只填「无 cue」这个目前未定义的格子。
2. **执行模型统一**:每个 mode 各起一个干净上下文的 subagent 执行,主会话只做路由、汇集与综合裁决——废除「单 mode inline / 多 mode 才 subagent」的双轨。理由:(a) 客观性——build 完接 verify 时,同一上下文 review 自己刚写的代码会自我确认,干净 subagent 只喂 diff 和 plan,独立重建判断;(b) 上下文隔离——diff 全文、测试失败输出、e2e 工具调用记录都截在 subagent 里,主会话只留 verdict。
3. 报告里标明哪些 mode 跑了、哪些被跳过及原因(对齐 health 的「探不到即跳过并标明」)。

## Not building

- 不改三个 mode 各自的内部行为(review 5 维 + confidence 过滤、test 跑套件 + flaky 重试一次、e2e 找启动路径)——只改「跑哪些、在哪跑」。
- 不改显式 cue 的收窄语义——「跑下测试」仍只跑 test。
- 不加新 mode、不动 aspect filter。
- 不把 subagent 执行写进 spec(它是执行方式,不是对外可观察契约;见 Key decisions #3)。
- 不动 `when_to_use` 触发词(避免扰动 Jaccard 检查与现有路由)。

## Approach

只改 prose(SKILL.md)+ 契约(spec)+ 记录(ROADMAP),无代码。最小方案是只补默认路由、不动执行模型;不取——「单 mode 不开 subagent」与「默认单跑」是同一根因(verify 把把关力度押在措辞上)的两半,且 review 客观性问题只有 subagent 能解,拆开做会让 SKILL.md 的执行段改两遍。

## Premise collapse

- 本方案假设**裸 `/verify` 的用户意图 = 完整把关**(2026-06-10 维护者已确认)。若实际更常用裸 `/verify` 表达「快速看一眼」,默认全跑会变成每次付重型成本——届时把默认收窄回 review + test、e2e 永远显式,只需改 SKILL.md 路由段一处。
- 本方案假设 **host 有 subagent 能力**(Claude Code 的 Task/Agent 工具)。设计上不押注它:SKILL.md 写明无 subagent 能力时退化为顺序 inline 执行——把关完整性优先于执行模型,门不因执行方式缺位而变窄。

## Key decisions

1. **默认 = review + test 必跑、e2e 按适用性**,而非三个无脑全开——review 是判断、test 是 ground truth,都便宜且 WORKFLOW 本就以 `pnpm test` 全绿为门禁;e2e 重且对纯文档/纯内部改动是噪音。跳过必须在报告标明原因。
2. **统一 per-mode subagent,主会话只路由 + 综合**——规则更简单(单/多 mode 不再两套行为),且客观性、上下文隔离的收益对单 mode 同样成立;「don't pay subagent overhead for one」省的是一次 spawn,付出的是 review 独立性。
3. **默认路由进 spec,subagent 执行不进 spec**——前者是对外可观察行为(裸 verify → 哪些检查发生、报告含什么);后者是实现细节,照 memory-catalog 的 spec Boundary(不记实现步骤)排除,SKILL.md 里写清即可。
4. **ROADMAP 对应条目移除**——「review / e2e 单跑也应各起 subagent」就此落地,record-only 文件只留未做项。
5. **降级路径写进 SKILL.md**——无 subagent 能力 → 顺序 inline 跑同样的 mode 集合,报告注明执行方式;门的宽度不变。

## Public surface changes

- `skills/verify/SKILL.md`:路由表新增默认行;执行段改为统一 subagent 模型(含降级);报告模板 Modes 行增加 skipped 标注;frontmatter `description` 微调以反映「默认全面把关」(保持 "Use when"+"Not for"、40-500 字符)。
- `specs/verify/spec.md`:新增一条 requirement(见 Spec delta)。
- `ROADMAP.md`:移除已落地条目。
- 无代码、无 API、无 config 变更。

## Spec delta

```markdown
## ADDED Requirements

### Requirement: 无明确 mode 线索时默认全面把关

用户消息无明确 mode 线索(含裸 `/verify`)时,verify 必须默认跑 review + test 两个 mode,并在改动触及用户可见行为且项目有可启动路径时加跑 e2e;被跳过的 mode 必须在报告中标明及原因。显式 mode 线索仍收窄到对应 mode,不默认扩展。
Verify: manual(integration)
```

## Implementation steps

1. 改 `skills/verify/SKILL.md` 路由段([SKILL.md:25-33](../skills/verify/SKILL.md#L25-L33))
   - change: 路由表加默认行(`无 mode 线索 / 裸 /verify → full gate:review + test,e2e 按适用性`);第 33 行执行段重写——删去「A single mode runs inline」,改为「每个 mode 各起一个 subagent(干净上下文,只喂 diff / plan / 必要命令),主会话汇集综合;host 无 subagent 能力时退化为顺序 inline,mode 集合不变」,并按哲学 #5 补 why(客观性 + 上下文隔离)。
   - verify: 通读改后段落,确认显式 cue 收窄语义未被覆盖;`pnpm test` 过 smoke。
2. 改 `skills/verify/SKILL.md` 报告模板([SKILL.md:86-108](../skills/verify/SKILL.md#L86-L108))
   - change: `Modes:` 行改为列出实跑 mode + `skipped: <mode>(原因)`;模板下方注一句「跳过的 mode 必须标明原因」。
   - verify: 模板与 Spec delta 的报告要求一致。
3. 微调 frontmatter `description`([SKILL.md:3](../skills/verify/SKILL.md#L3))
   - change: 在现有句式内补「defaults to the full gate (review + test, e2e when applicable) when no mode is named」之意,保留 "Use when"+"Not for" 结构。
   - verify: `pnpm test`(checkDescription 守 40-500 字符与必含短语)。
4. 合并 Spec delta 进 `specs/verify/spec.md`
   - change: 按上面 ADDED 段追加 requirement(照 document 的合并规则:ADDED 追加)。
   - verify: `pnpm test`(skill↔spec 配对与格式检查);此步已做,后续 `/document` 无剩余工作。
5. 移除 `ROADMAP.md` 已落地条目([ROADMAP.md:11](../ROADMAP.md#L11))
   - change: 删除「`verify` 的 review / e2e 也走 subagent」一行。
   - verify: 通读 ROADMAP 确认无残留引用。
6. 全量门禁
   - change: 无
   - verify: `pnpm test` 全绿;`node skills/health/scripts/checker.ts . --json` 返回 `[]`(advisory)。

## Verification

- command: `pnpm test`
- checklist (manual):
  - [ ] 重装后(symlink 即时生效)裸 `/verify` 一次真实改动:review + test 各在 subagent 跑,报告含综合 verdict 与 skipped 标注
  - [ ] 「跑下测试」仍只跑 test
  - [ ] 纯文档改动时 e2e 被跳过且报告标明原因
  - [ ] `specs/verify/spec.md` 新 requirement 在,格式过 smoke

## Rollback

全部是文档/prose 改动,`git revert` 对应 commit 即回滚;无外部状态。若只想撤默认路由保留 subagent 统一(或反之),两者在 SKILL.md 里是独立段落,可单独回改。

## Risks & Unknowns

- **e2e 适用性是模型判断**:可能误跑(浪费)或误跳(漏检)。缓解:跳过必须标明原因,用户可用显式 cue 强制;误判积累成模式时再补 Gotcha。
- **裸 `/verify` 成本上升**:每次至少两个 subagent。缓解:这正是「门」的定价,要快速看一眼用显式 cue 收窄。
- **subagent 拿不到主会话里的口头约束**(用户在会话中说过的临时要求):主会话路由时须把这类约束写进 subagent prompt——已在 step 1 的「只喂 diff / plan / 必要命令」中含「必要上下文由主会话显式传入」之意,SKILL.md 措辞落实。

## Interface boundary

- **对外暴露**(用户可观察):裸 `/verify` → 全面把关;显式 cue → 收窄;报告 `Modes:` 行含实跑 + skipped(原因);综合 verdict 一份(非各 subagent 原始输出)。
- **输入**:用户消息(路由依据)、git diff / plan / 测试命令 / app 启动路径(subagent 输入,主会话显式传入)。
- **输出**:成功 → Verify Summary(现有模板 + skipped 标注);失败(如 app 起不来)→ 作为 finding 报告,不改源强启(现行为不变)。
- **副作用**:test / e2e 照旧执行代码与起 app(观察性);无文件修改、无提交推送(现行为不变)。
- **不暴露**:subagent 的派生方式、数量、prompt 内容——执行细节不进 spec,不构成对外承诺(无 subagent 时降级,外部可见行为不变)。

## Acceptance scenarios

- Given 工作区有一份触及用户可见行为的改动且项目可启动,when 用户裸 `/verify`,then review、test、e2e 三个 mode 各自在 subagent 中执行,报告给出综合 verdict,`Modes:` 行列出三者。
- Given 工作区改动为纯文档,when 用户裸 `/verify`,then review + test 跑,e2e 跳过且报告标明「纯文档改动,无可观察 app 行为」类原因。
- Given 用户消息为「跑下测试」,when verify 路由,then 只跑 test mode(在 subagent 中),不扩展到 review / e2e。
- Given 项目无测试框架,when 用户裸 `/verify`,then review 照跑,test 按现有 stop 规则报告「无框架」而非硬造基建,门降级但报告完整说明。
- Given host 无 subagent 能力,when 任一 verify 运行,then mode 集合不变、顺序 inline 执行,报告注明执行方式。
