---
mode: refactor
title: 重命名三个 skill（think→shape / implement→build / push→propose），项目名待定
created: 2026-05-29
status: draft
---

# Rename skills

> 本 plan 故意不完整：skill 名已定，**项目名 praxis 改成什么还没定**，所以涉及项目名的改动（package.json name、README/ARCHITECTURE/PRODUCT 里的 "praxis" 字样）留空，等名字定了再补一节。

## Building

把三个 skill 改名，让整套命名更统一、准确、好辨识：

- `think` → `shape`（塑形：把模糊想法塑成方案；不平、不撞模型的 thinking）
- `implement` → `build`（构建：比 implement 更短、更直白）
- `push` → `propose`（提议：精确卡在"开 PR、等评审"这一步，不像 push 只抓 git 那一下、也不像 ship 暗示已交付）

改透的范围：目录名（= 触发命令）+ frontmatter `name` + 所有**当前**文档/skill 里对这三个 skill 名的引用。

最终七个：`explore · shape · build · test · review · commit · propose`。

## Not building

- **不改任何 skill 的能力、流程、Outcome Contract**——纯改名。
- **不动项目名 praxis**——还没定，单独一节后补。
- **不动 `git push` 等真实命令**：propose 这个 skill 仍然执行 `git push`，SKILL.md 里 `git push` / force-push / 推到 main 这些是 git 操作，保留；只改"作为 skill 身份"的 push。
- **不动普通词义的出现**：implement SKILL.md 里 "pushing through"（普通动词）、anti-patterns 里 "reference implementation"、`scripts/checks.ts` 与 `tests/checks.test.ts` 里的 `Array.push()`——全部保留。
- **不动 plans/ 历史文件**：它们是带日期的决策记录，当时就叫 think/implement/push，改了等于篡改历史。

## Approach

`git mv` 三个目录（保留 history，且 `references/` 里指向 `../../../rules/` 的 symlink 移动后相对深度不变、仍解析）→ 改 frontmatter `name` → 改各 SKILL.md 自身标题/开头/交叉引用 → 改顶层文档（README / ARCHITECTURE / PRODUCT / RESOLVER）。每改完跑 `pnpm test` 验一致性。

## Key decisions

1. **shape / build / propose** — 经多轮取舍定下：build/propose 透明度高、propose 不越界；shape 是"澄清→成形"双义里用户拍板的选择。
2. **plans/ 不动** — 历史记录优先于"全仓库无 stale 引用"。
3. **push 的真实 git 命令保留** — skill 身份变了，但它干的事没变，仍 push 分支。

## Public surface changes

- 目录/触发命令：`/think`→`/shape`、`/implement`→`/build`、`/push`→`/propose`。
- frontmatter `name`：三处。
- 触发词（when_to_use）：自然语言触发词（"open PR"/"推送"/"提评审"等用户真会说的）保留，按需补 "propose"；保证 Jaccard < 0.5 仍成立。

## Implementation steps

每步跑 `pnpm test`。

1. `git mv skills/think skills/shape`、`skills/implement skills/build`、`skills/push skills/propose`；确认 symlink 不断。
2. 改三个 SKILL.md 的 frontmatter `name` + 标题 + "X does Y" 开头；propose 里区分 skill 身份 vs `git push` 命令。
3. 改 7 个 SKILL.md 里对这三个名的交叉引用（`/think fix`、"go back to think"、"use push" 等）。
4. 改 README / ARCHITECTURE / PRODUCT / RESOLVER 里的 skill 名引用（含工作流图 `explore → think → ...`、think mode 段标题等）。
5. `pnpm test` 全绿（frontmatter / Outcome Contract / RESOLVER 路由一致性 / Jaccard / markdown 链接）。

## Verification

- command: `pnpm test`
- checklist：
  - [ ] `skills/shape` `skills/build` `skills/propose` 存在，symlink 不断
  - [ ] 三个 frontmatter `name` 已改
  - [ ] 无 stale 的 `/think` `/implement` `/push` 引用（plans/ 除外）
  - [ ] `git push` 等真实命令、`Array.push()`、"reference implementation" 未被误改
  - [ ] RESOLVER 列出 shape/build/propose

## Rollback

纯 git：`git mv` 回退 + `git checkout`。无外部状态变化（不碰 `~/.claude`、不开 PR）。

## Risks & Unknowns

- **Unknown: 项目名 praxis 改成什么** —— 未定。涉及 package.json `name`、README/ARCHITECTURE/PRODUCT 的 "praxis" 字样、致谢等，**本 plan 不覆盖**，定名后补一节。owner: 用户，blocker: 否（skill 改名不依赖项目名）。
- **Risk: 漏改或误改**（skill 名 vs git push 命令 vs 普通动词混在一起）。Mitigation: 逐文件按上下文改，不全局替换；`pnpm test` 的路由一致性 + 链接检查兜底。
