---
name: implement
description: '按 think 出的 plan 文件严格执行代码改动；项目有测试就走 TDD。Use when 用户说 "实施" / "implement" / "按计划做" / "整" / "可以干" / "直接改" 或 think 出 plan 后切实施。Not for 还没 plan 就动手（先 think）、纯写文档、绕过 plan 改代码。'
when_to_use: "implement, 实施, 实现, 写代码, 按计划, 落实, 整, 可以干, 直接改"
dispatch_intent: "按 plan 文件严格执行代码改动"
---

# Implement

implement 把一份 approved 的 plan 翻译成符合项目风格的代码。意图判断已经在 think 阶段做完了，这里只做执行——不重新设计、不顺手修无关、不偏离 plan。下面所有规则的根目的都是防止你执行时回头改意图。

没有 plan 就调 `/think` 先出方案。

## Outcome Contract

- Outcome: plan 的 implementation steps 全部完成，verification 通过，改动符合项目风格
- Done when: 所有 step 跑完 verify 通过，plan 文件 frontmatter `status` 改为 `done`
- Evidence: 改动过的每个文件 + plan.verification 命令的实际输出
- Output: 改动清单 + verify 结果 + 任何偏离 surface

## 前置：拿到 plan，确认可执行

并行做这几件事：

1. **定位 plan**：用户消息含路径就用那个；否则找 `plans/` 下最新 `status: approved` 的 plan（YYYY-MM-DD 排序）。找不到就报告状态让用户指定路径或先 `/think`，不要凭印象推测目标。
2. **读 plan 全文**：plan 是这次实施的唯一 ground truth；不读就开干等于猜。
3. **看项目骨架**：`git status --short` 看工作树脏不脏，`git log --oneline -5` 学项目 commit 风格，`ls package.json pnpm-lock.yaml Cargo.toml ...` 确认项目类型和测试 framework。

下面这些条件任一不满足就报告状态停下，让用户决定，不要硬上：

- **plan status 是 approved**——如果是 draft 且 implement 是被 `/implement` / "可以干" / "按计划做" 这类 approval 信号唤起，把 status 改成 approved 再继续（命令本身即用户 approval）。done 说明已经实施过，停下问用户。
- **plan 无 placeholder**（`TBD` / `TODO` / `implement later` / `similar to step N`）——这是 plan 没写完的信号，回 think 补完整。
- **工作树 clean**——脏的工作树可能藏着用户未保存的改动，硬上会盖掉；让用户自己决定先 commit 还是放弃。
- **plan 假设的关键文件 / 接口仍存在**——简单 grep plan 提到的路径和函数名。漂移说明 plan 跟当下代码不同步，回 think 修。

## 标准流程

按 plan 的 implementation steps 顺序执行，每步可独立 verify。先看项目有没有测试 framework（`package.json` 的 `scripts.test*`、或存在 `tests/` / `__tests__/` / `*.test.*` / `*.spec.*` / `*_test.go` 等），再决定走哪条。

**有 framework + plan mode 是 fix / feat → 走 TDD**：

1. 按 plan 的 regression test / acceptance scenarios 写或更新测试。
2. 跑测试，必须 red。一开始就 green 说明测试没真覆盖那个 scenario——停下改测试。
3. 写实现代码。
4. 跑测试，必须 green。green 不了就报告失败让用户决定；不要 retry 多次 / 删测试 / 加 `--no-verify`。
5. 进下一 step。

**没 framework，或 plan mode 是 refactor / perf → 不走 TDD**：

1. 改代码。
2. 跑 plan 里 verification 段写的命令证明 step 完成。
3. 进下一 step。

每个 step 的 red→green / verify 输出在过程中就 surface 给用户，不要埋头跑完所有 step 才汇报——中间出问题早暴露早决策。

全部 step 跑完 → 跑 plan.verification 全套 → 改 plan `status: done` → 输出报告。

### TDD 适用矩阵

| plan mode  | TDD    | 怎么做                                          |
| ---------- | ------ | ----------------------------------------------- |
| `fix`      | 强适用 | regression test 先 red → 修复 green             |
| `feat`     | 强适用 | acceptance scenarios 先 red → 实现 green        |
| `refactor` | 不适用 | 既有测试是 invariant 守护，跑既有测试保持 green |
| `perf`     | 不适用 | baseline → 优化 → 再测量到 target               |

refactor / perf 不走 TDD，是因为它们的 invariant 是"行为不变"或"性能数字"——不能用"先写 red 测试再 green"表达；既有测试当守护网更合适。

## 工程约束

这些约束的共同根因都是"实施时不重新判断意图"。意图判断在 think 阶段，implement 时回头改是 scope creep 的源头。

- **代码风格跟项目走**（缩进 / 命名 / import 顺序 / 错误处理）。项目现成的风格反映了团队实际选择，包括很多没写在 lint 规则里的隐含约定——引入新风格让 reviewer 多花一遍力气消化。
- **依赖不动**：plan 没明确写就不引新依赖、不升降级、不动 lockfile。引入新依赖是产品决策，归 think 阶段。
- **Scope 紧守 plan**：plan 之外不改文件，不顺手修无关 bug，不顺手 refactor。发现的问题可以在最终 report 里 note 出来，但不要动手——动手就脱离 reviewer 视野。
- **Comments 默认不写**：好的命名比 comment 重要；只在 why 不明显时写（隐藏约束 / 反直觉取舍 / workaround 原因）。不写 "this function does X"，不写 plan 路径或 issue 编号——那些属于 commit message。
- **错误处理只针对真实场景**：不为不会发生的情况加 try/catch / null check。冗余防御让代码可读性变差，还会掩盖真出错时的根因。
- **不绕过质量门**：`--no-verify` / `--force` / `// @ts-ignore` / `// eslint-disable` 都不用。工具拦下来的东西硬绕过等于把信号丢掉。
- **测试 fail 是信号不是麻烦**：不删、不弱化、不 skip 既有测试让代码"通过"——代价是失去测试的意义。
- **Secrets 走配置**：不硬编码 token / API key / 密码，走环境变量或项目惯用配置。
- **测试代码也是代码**：以上所有约束同样适用；只覆盖 plan 的 acceptance scenarios，不多写不少写。

## 什么情况下停下来

implement 最常见的失败模式是"明明该停却硬上"。下面这些情况遇到就报告状态让用户决定，不要自己想办法绕：

- **plan 跟代码不符**（路径错 / 函数不存在 / 假设不成立）——plan 漂移；回 think 修 plan，别自己微调路径"让它对上"。
- **需要引入 plan 没写的新依赖**——回 think 修 plan，或改用项目已有方案。绝不静默 `pnpm add`。
- **TDD 写完测试一开始就 green**——测试没真覆盖那个 scenario；改测试再试。
- **verify 跑不通且 retry 一次仍失败**——别静默 skip 别删测试，报告失败信息让用户决定。
- **想改 plan 文件让自己更好实施**——implement 永远不改 plan 内容，只改 `status: done`。要改 plan 回 think。
- **项目没测试 framework 却想硬走 TDD**——按 plan.verification 走，不要凭空造测试基础设施。
- **凭印象写 API / 调用语法 / 框架特性**——先 grep 项目已有用法或查文档；这是 `rules/anti-patterns.md` #1。

## 完成后输出

```
Implemented plans/<path>.md (now status: done)

Changes:
- <file>: <一句话描述>
- ...

Tests:
- <test-file>: N tests added/changed (TDD: red → green)

Verify: <command> → pass

下一步：跑 review 把关 / 调 commit 入库 / 继续下一个 plan
```
