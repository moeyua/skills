---
name: commit
description: '生成符合项目风格的 commit 并入库；明显多主题时自动拆分。Use when 用户说"提交" / "commit" / "入库" / `$commit`。Not for 推送远端或开 PR（用 push）、写 release notes。'
when_to_use: "commit, 提交, 入库, message, 整理变更, 拆 commit, $commit"
dispatch_intent: "生成 commit 并入库，必要时拆分多主题"
---

# Commit

进入 skill 后一气呵成：并行收集 context、决定 stage、commit、verify。不打断用户，除非碰到 Hard Stop。

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
- 否则 → specific filenames 选与主题相关的（不用 `-A` / `.`）
- 永不 stage：`.env*`（除 `.example`）、`*credentials*` / `*secrets*` / `*.key` / `*.pem` / `.DS_Store` / 任何含 token 的文件

## Message

学项目风格 from `git log --oneline -10`。无明显风格则用 conventional commits。

- 第一行 ≤ 72 字符
- 讲为什么，不只是做了什么
- 默认加 `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`，除非项目 anti-patterns 明文反对

## 拆 commit

合一（默认）：单主题，即使涉及多文件——修 bug + 触发的同步改动；feature + tests + docs；接口签名改 + 调用点更新。

拆分（agent 自己判断不询问）：彼此可独立 revert、intent 完全不同——auth 改动 + 不相关 logging；bug 修复 + 顺手改 `.gitignore`。

含糊时合一。拆不超过 3 个。

## Hard Stops

- 请求 commit 含 secret-like 文件（如 staged `.env`）
- nothing to commit
- pre-commit hook fail：报告输出，不 retry，不加 `--no-verify`
- detached HEAD / 进行中 rebase / merge
- 用户要 `--amend`：拒绝，永远新 commit

## Gotchas

| 情况                               | 规则                          |
| ---------------------------------- | ----------------------------- |
| `git add -A` / `.`                 | 用 specific filenames         |
| `--no-verify` 跳 hook              | 永远不跳，hook 失败由用户决定 |
| `--amend`                          | 永远新 commit                 |
| commit 含 `.env` 等 secret-like    | 列入 Stage 排除清单           |
| empty commit                       | nothing to commit 报告即停    |
| "Various changes" / "Update files" | 必须讲为什么                  |
| 中途问"要不要拆"                   | agent 自己判断                |
