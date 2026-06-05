---
mode: fix
title: explore 可靠读取 memory-catalog.md（修措辞坑）
created: 2026-06-05
status: done
---

# explore 可靠读取 memory-catalog.md（修措辞坑）

## Building

修 explore SKILL.md Step 2 的措辞坑：当前 `memory-catalog.md` 只在一段 blockquote 里被「指给你看」式地提及（作为 artifact 的定义出处），从没有一句叫 agent 读它本身。结果在一个布局与 catalog 默认不一致的项目里，agent 把 catalog 降级成可选、判它冗余、跳过不读。本方案把 catalog 改成 Step 2 的**显式第一读**，并写清「读 catalog 这份规则 ≠ 读它所列的 artifact」，附上为什么（catalog 是判断「本项目什么算持久记忆」的规则，项目布局越偏离默认越要先读它）。

## Not building

- **不**动行为层（anti-patterns.md 不加 #3）——用户明确把打击面定在「只修 explore 措辞」；「漏读后不停下补、带空缺自信发言」这层 stop-to-fill 行为本方案不覆盖。
- **不**加机械 check（scripts/checks.ts 不动）——用户选了纯措辞修，没要「凡 symlink 进 skill 的 rule 必须有读它的祈使句」这条 check。
- 不改 explore 的 frontmatter description / when_to_use。
- 不改其它 skill（persist / health 对 catalog 的引用各自独立，本次不碰）。

## Approach

把 Step 2 里那段引用 catalog 的 blockquote 拆成两段正文：

1. 先一句**加粗祈使句**：先读 `references/memory-catalog.md` 全文，这是必读、不是可选，且**不等于**读它所列的 artifact——catalog 是「规则」（每类记忆装什么 / 给谁 / 权威源 / 边界），artifact 是「实例」。补一句 why：要靠这些定义才知道**本项目**什么算持久记忆，项目布局偏离 catalog 默认时尤甚（正是这次出事的场景）。
2. 再接原来的 artifact 清单（README / ARCHITECTURE / … / specs），措辞从 blockquote 的「指给你看」改成正文的「命令你读」。

**最小选项**（备选）：只在原句后补一句「并先读 `memory-catalog.md` 本身」。它只杀掉三个成因里的第一个（无祈使句）；agent 自述的另外两个（清单内联导致「看着冗余」、预算偏见抬高开文件门槛）不解决。所以我不取最小选项——三个成因同源于这段措辞，一并修才彻底。

## Premise collapse

本方案假设这次漏读主要由**措辞**驱动（无祈使句 + 清单内联 + blockquote 的软语气）。若真正驱动是**行为层**（明知该读却带空缺继续说，即 agent 自述的「真根因」），那再好的措辞也挡不住同类失败——只是这次换一份非祈使提及的文档复现。agent 自己的结论正是「行为层才 load-bearing」，而用户这次把它划出 scope。所以这条前提脆弱且已知：本方案赌「去掉措辞坑能显著降低复现」，但**不**声称能消除这一类失败。

## Key decisions

1. **catalog 提到 Step 2 的第一读，且降级 blockquote 为正文** — 同时杀掉 agent 自述的三个成因：无祈使句（→ 加祈使句）、看着冗余（→ 显式写「规则 ≠ 实例」）、预算偏见（→ 给 why 抬高它的优先级）。单加一句只解决第一个。
2. **写清「读 catalog ≠ 读 artifact 清单」** — 这是「冗余」误判的直接解药：内联的只是一串文件名，catalog 文件里是每类的定义/归属/边界，恰是漏掉的东西。
3. **spec 带一条轻量 delta，但本次不动 specs/** — 把「catalog 是必读、先于 artifact」写进 explore 契约，防止 spec 漂移；按 squire 流程由 persist 在 build 后落，不在本方案的代码改动里。
4. **接受无机械护栏** — 用户选 B 不选 C，措辞将来可能漂回坑里，这是用户已接受的残余风险（见 Risks）。

## Public surface changes

None。改的是 explore SKILL.md 的指令正文，不动 frontmatter / API / 文件接口。`references/memory-catalog.md` 的引用路径保持不变（symlink 仍在），markdown 链接仍有效。

## Spec delta

explore 的行为契约从「笼统地读全部关键文档」收紧为「catalog 是必读且先于 artifact」。供 persist 在 build 后记录。

```markdown
## MODIFIED Requirements

### Requirement: 先 Overview 再深入

explore 必须先完成 Overview（确认项目身份、读全部存在的关键文档、摸清结构），用户指定范围时才进入 Scoped Deep-dive；即便用户只点名某模块，也先做 Overview 建骨架，不直接跳进去。Overview 中**必须先读 `references/memory-catalog.md` 全文**——它是判断「本项目什么算持久记忆」的规则，先于、且区别于读它所列的各份 artifact。（Previously: 只笼统要求「读全部存在的关键文档」，未把 catalog 列为先于 artifact 的必读。）
```

> 若你想让 specs/ 完全不动，删掉本节即可——本方案的代码改动不依赖它。

## Implementation steps

1. 改 explore SKILL.md Step 2 措辞
   - change: [skills/explore/SKILL.md:51-60](skills/explore/SKILL.md#L51-L60)——把第 53-58 行的 blockquote 段替换为两段正文：第一段是「先读 `references/memory-catalog.md` 全文」的加粗祈使句 + 「规则 ≠ 实例」的区分 + why；第二段接原 artifact 清单（README / ARCHITECTURE / PRODUCT / DESIGN / WORKFLOW / ROADMAP / specs）及其下的「Beyond the catalog, also read…」子列表，语气改为正文祈使。第 51 行（read in full every doc that exists）和第 60 行（record path + summary）保留。
   - verify: 重读该段，确认含「明确叫你读 `memory-catalog.md`」的祈使句，且含「读 catalog ≠ 读它所列 artifact」的区分句。
2. 跑测试确认无结构回归
   - change: 无（验证步）
   - verify: `pnpm test` 全绿——`memory-catalog.md` 链接仍有效（check #5）、references 路径仍在（check #4）、frontmatter / Outcome Contract 等结构 check 不受影响。

## Verification

- command: `pnpm test`
- checklist (manual):
  - [ ] explore SKILL.md Step 2 含一句明确祈使「先读 `references/memory-catalog.md` 全文」
  - [ ] 该段写清「catalog 是规则，区别于它所列的 artifact」
  - [ ] 该段给了 why（项目布局偏离默认时为何更要先读）
  - [ ] blockquote 软语气已改为正文祈使
  - [ ] `references/memory-catalog.md` 引用与链接保持有效

## Rollback

单文件改动，`git checkout -- skills/explore/SKILL.md`（或 revert 对应 commit）即可完全回退。无外部状态变更。

## Regression tests

项目有测试框架（vitest / smoke），但用户本次明确不加机械 check，所以没有「失败于旧措辞、通过于新措辞」的自动断言。回归保护退化为：

- **自动**：现有 smoke 套件保持全绿，确保改动没破坏 frontmatter / 链接 / references 等结构 invariant（`pnpm test`）。
- **手动复现**：在一个布局与 catalog 默认不一致的项目里跑 `/explore`，确认 agent 在 Overview 阶段读了 `memory-catalog.md` 本身（而非只读它列出的几份 doc）。

> 残余风险：无机械护栏，未来 SKILL.md 措辞编辑可能把祈使句改回软语气、坑复现。这是选 B（纯措辞修）而非 C（措辞 + check）所接受的代价。要消除得回到 C。

## Risks & Unknowns

- **措辞会漂回**：无 check 守，将来编辑可能重新软化 catalog 的读指令 / 影响。缓解：本次把 why 写进正文，让后续编辑者看到「为什么必读」，降低误删概率；彻底解决需选 C。
- **行为层未覆盖**（前提脆弱的延伸）：「带空缺自信发言」的 stop-to-fill 失败本次不修，同类失败可经另一份非祈使提及的文档复现。owner: 用户（已知划出 scope），blocker: no。
