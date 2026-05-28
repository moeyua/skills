---
name: commit
description: '生成符合项目风格的 commit 并入库；明显多主题时自动拆分。Use when 用户说"提交" / "commit" / "入库"。Not for 推送远端或开 PR（用 push）、写 release notes。'
when_to_use: "commit, 提交, 入库, message, 整理变更, 拆 commit"
dispatch_intent: "生成 commit 并入库，必要时拆分多主题"
---

# Commit

commit 把 working tree 的改动整理成干净的 git 历史——一气呵成：收集 context、决定 stage、commit、verify。不打断用户，除非碰到不能继续的事。所有约束的根目的是让 commit 历史**真实记录意图**：一个 commit 一个主题，message 讲为什么不只是讲做了什么，secrets 永远不进版本库。

## Outcome Contract

- Outcome: 干净的 git commit，message 跟项目历史风格一致
- Done when: 末次 `git status` 显示 working tree clean（或仅剩 unrelated 改动）
- Evidence: `git status` / `git diff HEAD` / `git log --oneline -10` 的实际输出
- Output: 每个 commit 的 hash + message + stage 决策（"stage 了 X，跳过 Y 因为 Z"）

## 流程

并行收集：

```bash
git status --short
git diff HEAD
git log --oneline -10
git branch --show-current
```

基于输出决定 stage / message / commit，并行执行。多主题时连续多个 add+commit。末尾 `git status` 验证一次。

## Stage

- 已 staged → 沿用
- 否则 → specific filenames 选与主题相关的（**不用 `-A` / `.`**——一锅端容易扫进 secrets 或不相关改动）
- 永不 stage：`.env*`（除 `.example`）、`*credentials*` / `*secrets*` / `*.key` / `*.pem` / `.DS_Store` / 任何含 token 的文件——这是不可挽回的泄漏，比正确性优先

## Message

学项目风格 from `git log --oneline -10`。无明显风格则用 conventional commits。

- 第一行 ≤ 72 字符
- **讲为什么，不只是做了什么**——"Various changes" / "Update files" 是浪费 reviewer 时间，未来回头看也看不出意图
- 默认加 `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`，除非项目 anti-patterns 明文反对

## 拆 commit

**合一（默认）**：单主题，即使涉及多文件——修 bug + 触发的同步改动；feature + tests + docs；接口签名改 + 调用点更新。

**拆分（agent 自己判断不询问）**：彼此可独立 revert、intent 完全不同——auth 改动 + 不相关 logging；bug 修复 + 顺手改 `.gitignore`。

含糊时合一。拆不超过 3 个。**中途别问用户"要不要拆"**——这种判断是 commit skill 自己的工作，问回去等于把活推回去。

## 什么情况下停下来

commit 失败模式是"硬塞进去 / 绕过工具"。下面这些情况停下并报告：

- **请求 commit 含 secret-like 文件**（staged `.env` 等）——拒绝；让用户先取消 stage。secrets 一旦进版本库基本不可挽回。
- **nothing to commit**——报告即停，不创建 empty commit。
- **pre-commit hook fail**——报告 hook 输出让用户决定；**不 retry，不加 `--no-verify`** 绕过。hook 拦下的东西通常是 lint / type / 测试错误，绕过就是丢失信号。
- **detached HEAD / 进行中 rebase / merge**——git 状态特殊，先让用户处理完再 commit。
- **用户要求 `git commit --amend`**——拒绝，永远新 commit。amend 改写历史是 destructive 操作，作为默认操作太危险；用户真要 amend 自己跑。
