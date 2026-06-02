---
mode: feat
title: 加 checkSpecFormat —— 机械守住每条 Requirement 都有合法 Verify
created: 2026-06-02
status: done
---

# 加 checkSpecFormat —— 机械守住每条 Requirement 都有合法 Verify

## Building

给 `scripts/checks.ts` 加一个 `checkSpecFormat`,把 spec 的结构 invariant 从"靠纪律"变成"机械守"(squire 哲学 #4)。它检查每个 `specs/<domain>/spec.md`:有 `## Purpose` 与 `## Requirements`;每条 `### Requirement:` 恰有一行 `Verify:`;`Verify:` 取值合法(指向测试的 markdown 链接 / `manual(visual)` / `manual(integration)`)。配单元测试(tmpdir fixture)+ smoke `it()`,跟其余 8 个 check 同构。

这补上 [2026-06-02-feat-spec-verify-field](2026-06-02-feat-spec-verify-field.md) 留下的缺口:`Verify` 链接断了现成 `checkMarkdownLinks` 能抓,但"漏写 Verify / Verify 拼错"没人抓。`checkSpecFormat` 把"Verify 这根线存在且合法"焊死。

**硬前置**:现有 7 份 specs(explore/shape/build/test/review/commit/propose)仍是旧 Scenario 格式、**无 Verify**(已核实:Verify 计数全 0)。不先迁,新 check 一上来就让它们红。所以本 plan **先迁 7 份、再加 check**。

## Not building

- **不验 Requirement 的 RFC 2119 关键词**(必须/SHALL 是否出现)——噪音大、易误报,只验结构与 Verify。
- **不验 `Verify:` 链接指向的测试是否真覆盖该 Requirement**——`checkMarkdownLinks` 只保证文件在;"测了没测到点上"无法机械判,不做。
- **不引入 `manual(behavior)` 第三类**——squire 自身 skill-行为 spec 落 `manual(integration)`;是否需要第三类是独立的未决问题(见 Risks),本 plan 不动取值集合。
- **不动 spec skill / 其余文档 / loop / 别的 check**——只加这一个 check + 迁 7 份 specs。

## Approach

两段,各自可独立交付:

1. **迁移**:7 份 specs 去掉内联 `#### Scenario:`、每条 Requirement 补一行 `Verify:`。squire 的 skill 行为是 agent prose、无自动测试可背书 → 全部 `manual(integration)`(跟已迁的 seed `specs/spec/spec.md` 一致)。迁完现有 8 个 check 仍绿、且为第 2 段铺好合规的 live 数据。
2. **加 check**:TDD —— 先写 `checkSpecFormat` 的单元测试(红)→ 实现函数(绿)→ 在 smoke 加 `it()` 跑 live repo(此时 8 份 specs 已合规,绿)。

**最小可行版**:只迁 7 份、不加 check。否决理由:那只是把格式铺开,"漏写/写错 Verify"仍无机械防线——缺口还在。所以必须含 check 本体。

## Premise collapse

**赌的是"check 的严格(每条 Requirement 必须有 Verify)对 squire 自己也成立"**。结果是 squire 全部 spec 的 Requirement 都落 `manual(integration)`——这看着"全人工、没几个 test 背书"。但这不证伪 check:`manual(integration)` 是合法取值,check 照过;它只是如实暴露"squire 自身行为没有自动测试"这一事实。若日后觉得该区分"agent-prose 行为"与"E2E 太慢",那是给取值集合加 `manual(behavior)` 的**另一个** plan,不影响本 check 的结构。

## Key decisions

1. **`checkSpecFormat(root)` 的规则**(对每个 `specs/<domain>/spec.md`):
   - 必须含 `## Purpose` 和 `## Requirements`;
   - 至少一条 `### Requirement:`;
   - 每条 `### Requirement:` 块内**恰有一行** `^Verify:`;
   - 该 `Verify:` 值匹配三者之一:markdown 链接 `[...](...)` / `manual(visual)` / `manual(integration)`。
   - 任一违反 → `throw new Error(...)`,消息带 `file:行号/Requirement 名`,风格同其余 check。
2. **发现方式**:扫 `specs/` 下每个子目录的 `spec.md`;`specs/` 不存在则 no-op(不报错——别的项目可能没 specs)。
3. **取值集合固定为 3 种**,在 check 里以常量/正则写死,与 spec SKILL.md 的定义一致。
4. **squire 7 份 specs 全迁 `manual(integration)`**(agent-prose 行为,无单测)。
5. **TDD**:check 是真 TS 代码,先红测试后实现;单元测试用 tmpdir fixture(同 `tests/checks.test.ts` 现有风格)。
6. **范围**:`scripts/checks.ts` + `tests/checks.test.ts` + `tests/smoke/verify-skills.test.ts` + 7 份 `specs/*/spec.md`。

## Public surface changes

- **新增库函数** `checkSpecFormat(root: string): void`(`scripts/checks.ts` 导出),throw-on-violation,与现有 check 同形。
- **smoke 新增一个 `it()`**:整库第 43 项检查。
- 无 API / config / CLI / 依赖变化。

## Interface boundary

**`checkSpecFormat(root: string): void`**

- **输入**:repo 根路径。
- **行为**:遍历 `specs/<domain>/spec.md`,逐条验证上面 Key decision #1 的规则。
- **输出 / side effects**:无返回;**首个违反**即 `throw Error`(消息含定位)。全合规则静默返回。无文件写入。
- **不暴露**:不验 RFC 2119 关键词、不验链接目标是否真覆盖(那是 `checkMarkdownLinks` 与人的事)。
- **`specs/` 缺失**:no-op 返回(不抛)。

## Acceptance scenarios

(这些就是 TDD 的单元测试靶子,tmpdir fixture)

1. **happy**:Given 一个 `specs/x/spec.md` 含 `## Purpose`、`## Requirements`、两条各带合法 `Verify:` 的 Requirement,When `checkSpecFormat`,Then 不抛。
2. **漏写 Verify**:Given 一条 Requirement 没有 `Verify:` 行,Then 抛,消息指出哪条 Requirement。
3. **Verify 取值非法**:Given `Verify: manual(typo)` 或 `Verify: 随便写的`,Then 抛。
4. **Verify 是合法链接**:Given `Verify: [t](../../test/x.test.ts)`,Then 不抛(仅验格式合法;链接是否解析由 `checkMarkdownLinks` 管)。
5. **多于一行 Verify**:Given 一条 Requirement 下有两行 `Verify:`,Then 抛。
6. **缺结构**:Given 缺 `## Purpose` 或 `## Requirements`,Then 抛。
7. **specs/ 缺失**:Given 无 `specs/` 目录,Then 不抛(no-op)。
8. **live 整库**:When 对当前 repo 跑(7 份已迁 + seed),Then 不抛;`pnpm test` 43 全绿。

## Implementation steps

1. **迁移 7 份 specs 到 Verify 格式**
   - change:`specs/{explore,shape,build,test,review,commit,propose}/spec.md` —— 每条 Requirement 删去其 `#### Scenario:` 块、补一行 `Verify: manual(integration)`;Requirement 陈述若依赖 scenario 才完整,把要点并进陈述句。保留 `## Purpose` / `## Requirements` 结构。
   - verify:`pnpm test`(现有 8 check 仍绿:这步还没加新 check);人读 7 份均无内联 Scenario、每条 Requirement 一行 Verify。
2. **写 `checkSpecFormat` 单元测试(红)**
   - change:`tests/checks.test.ts` —— 加 specs fixture 辅助(往 tmpdir 写 `specs/<d>/spec.md`)+ 覆盖 Acceptance scenarios #1-#7 的 `it()`;import 还不存在的 `checkSpecFormat`。
   - verify:`pnpm test` —— 这些新测试**红**(函数未实现)。一上来就绿则说明没真覆盖,停下修测试。
3. **实现 `checkSpecFormat`(绿)**
   - change:`scripts/checks.ts` —— 加并导出 `checkSpecFormat(root)`,按 Key decision #1 实现。
   - verify:`pnpm test` —— 第 2 步的单元测试转**绿**。
4. **smoke 接入 live 检查**
   - change:`tests/smoke/verify-skills.test.ts` —— import `checkSpecFormat`,加一个 `it("checkSpecFormat: every specs/*/spec.md is structurally valid with a legal Verify per requirement", () => expect(() => checkSpecFormat(REPO_ROOT)).not.toThrow())`。
   - verify:`pnpm test` —— 该 `it()` 绿(7 份已迁 + seed 合规);整库 43 全绿。

## Verification

- command:`pnpm test`(= `vp test run`)→ 43 全绿(原 42 + checkSpecFormat smoke 1);`pnpm typecheck` → clean。
- checklist(manual):
  - [ ] 故意删某 spec 一条 Requirement 的 Verify → `pnpm test` 转红、消息指出该 Requirement → 改回
  - [ ] 故意写 `Verify: manual(xxx)` 非法值 → 转红 → 改回
  - [ ] 7 份 specs 均已迁(无 `#### Scenario:`、每条一行 Verify)
  - [ ] spec skill / loop / 其余 check 未被动(范围未蔓延)

## Rollback

- 纯库代码 + 测试 + 文档,git 可逆:还原 `scripts/checks.ts`、`tests/checks.test.ts`、`tests/smoke/verify-skills.test.ts` 与 7 份 specs 即可。
- 无数据迁移、无新依赖、无可执行 CLI 入口(check 仍只经 vitest 触发)。

## Risks & Unknowns

- **squire 全部 spec 落 `manual(integration)`**:暴露"自身行为无自动测试"的事实;是否给取值集加 `manual(behavior)` 区分"agent-prose 行为" vs "E2E 太慢",留作独立 plan。**blocker**:否(`manual(integration)` 合法,check 照过)。
- **迁移时 scenario 信息丢失**:旧 specs 的 `#### Scenario:` 含一些 given/when/then 细节;迁移要点应并进 Requirement 陈述,不能直接丢。**owner**:build 时逐条并入,**blocker**:否。
- **check 解析的健壮性**:`### Requirement:` 块边界靠下一个 `###`/`##` 切分;需确保 fixture 覆盖"最后一条 Requirement""Requirement 后紧跟 `## Out of scope`"等边界。已在 Acceptance #1/#5 覆盖。
