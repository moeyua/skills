---
name: push
description: '把当前 branch 推到 origin 并在 GitHub 开 PR；PR 描述基于整 branch 历史。Use when 用户说 "开 PR" / "提评审" 或 commit 完要推到远端开 PR。Not for 本地 commit（用 commit）、写 release notes、非 GitHub 远端（不自动开 PR）。'
when_to_use: "push, 开 PR, MR, 提 PR, 推送, pull request, merge request"
dispatch_intent: "推送 branch 到 origin 并在 GitHub 自动创建 PR"
---

# Push

push 把当前 branch 推到 origin 并在 GitHub 开 PR——一气呵成：并行收集 git/gh context、push、`gh pr create`。所有约束的根目的是让推送和 PR 反映**完整 branch 历史**：title/body 基于整 branch 综合而不只看最新 commit，force 操作和保护分支永远不动，用户的 git/gh 配置永远不改。

GitHub-only：非 GitHub 远端就完成 push，跳过 `gh pr create`，让用户手动开 PR/MR。

## Outcome Contract

- Outcome: 当前 branch push 到 origin；GitHub 远端时 PR 已创建并返回 URL
- Done when: PR URL 已返回（GitHub）或 push 成功 + 手动开 PR 提示（其他）
- Evidence: `gh pr view` / `git push` 的实际输出
- Output: PR URL + title + body 摘要

## 流程

并行收集：

```bash
git status --short
git branch --show-current
git remote -v
gh auth status
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
gh pr list --head <current-branch> --json number,url,state
```

检查"什么情况下停下来"列出的条件，通过后拿 base branch 跑：

```bash
git log <base>..HEAD --oneline
git diff <base>...HEAD       # 注意三个点——branch 跟 base 共同祖先后的改动
```

基于**整 branch** 信息生成 PR title + body——不是最新一个 commit；只看 HEAD 容易漏掉前面 commit 的主题。然后：

```bash
git push -u origin <current-branch>
gh pr create --title "..." --body "..."
```

返回 PR URL。

## PR 描述

title 一句话讲整 PR 在干什么（基于全部 commits 综合）。

body 强制结构：

```markdown
## Summary

- 1-3 bullet，一句话一项，讲改了什么

## Test plan

- [ ] reviewer 可验证的检查点
- N/A 如果是纯文档/配置/无行为变更

🤖 Generated with Claude Code
```

- Summary 基于整 branch 综合，不只是最新 commit
- **Test plan section 强制写**——即使 N/A 也明确写 "N/A 因为 X"；section 缺失比 N/A 更不清晰，reviewer 会问"那测了没"
- footer 默认加，除非项目 anti-patterns 反对

## 什么情况下停下来

push 的失败模式是"硬推 / 越界用户配置"。下面这些情况停下并报告：

- **当前在 `main` / `master` / `develop` 等保护分支**——拒绝；让用户 `git checkout -b <name>` 后再调。直接推到主分支或保护分支是 destructive 操作。
- **有 uncommitted changes**——push 假定 commit 都做完；报告状态让用户先 `/commit` 或显式放弃。
- **`gh` 没装 / `gh auth status` 失败**——报告安装或登录命令；不要用 raw GitHub API / curl 替代 `gh`，认证管理交给 gh 才有保证。
- **没有 `origin` remote**——报告，让用户 `git remote add origin ...`。
- **已有开着的 PR**——报告 PR # 和 URL，让用户决定继续 push 到已有 PR 还是放弃。
- **remote 不是 GitHub**（URL 不含 `github.com`）——完成 `git push` 跳过 `gh pr create`，输出"非 GitHub 远端，请手动开 PR/MR"和已准备好的 PR body。
- **用户要 `--force` / `--force-with-lease`**——拒绝；force push 改写远端历史，作为默认操作太危险；用户真要 force 自己跑。
- **想改 `git config` / `gh config`**——永远不动用户配置。
- **想删除 remote branch**——永远不删；这是 destructive 操作。
