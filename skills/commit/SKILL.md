---
name: commit
description: '生成符合项目风格的 commit message 并入库，一次性完成；明显多主题时自动拆成多个 commit。Use when 用户改完代码要入库、说"提交一下" "commit" "入库" 或输入 $commit。Not for 推送远端或开 PR（用 push）、写 release notes、为发布做版本号管理。'
when_to_use: "commit, 提交, 入库, message, 整理变更, 拆 commit, $commit"
dispatch_intent: "生成 commit 并入库，必要时自动拆分多主题"
---

# Commit: 一次性完成入库

参考 Claude Code 官方 `commit-commands/commit` 的极简风格——进入 skill 后**一气呵成**，一条消息内并行调用收集 context 的命令 + stage + commit + verify status，不要中间停下来问用户。

## Outcome Contract

- Outcome: 一个干净的 git commit，message 符合项目历史风格
- Done when: `git status` 显示 working tree clean（或仅剩未触动的 unrelated 改动）；commit hash + message 已报告给用户
- Evidence: `git status` / `git diff HEAD` / `git log --oneline -10` 的实际输出（不依赖回忆）；commit 后再跑一次 `git status` 验证
- Output: commit hash + message + stage 决策报告（"我 stage 了 X 跳过了 Y 因为 Z"）

## 标准流程

进入 skill 时**并行**跑以下命令收集 context（一次 message 多个 tool call）：

```bash
git status --short
git diff HEAD                  # staged + unstaged 一起看
git log --oneline -10          # 学项目 message 风格
git branch --show-current
```

基于输出**直接执行**（仍然一条 message 内并行）：

1. 评估混杂程度（见"拆 commit 判断"）
2. 选要 stage 的文件（见"Stage 决策"）
3. 起 commit message（见"Message 起草"）
4. `git add <specific files>` + `git commit -m "..."`；多主题时分组按顺序连续执行
5. `git status` 确认

**不要中间停下来问用户**。除非碰到 Hard Stops（见下方）。拆不拆 commit 是 agent 自己决定的判断题，不询问。

## 拆 commit 判断

看完 diff 后判断改动是不是围绕**一个主题**：

- ✅ 单主题示例（即使涉及多文件也是 single commit）：
  - 修 bug X，触发多文件改动
  - 改一个接口签名 + N 个调用点同步更新
  - 加一个功能，含 src + tests + docs
  - 重构一个模块
  - 升级一个依赖 + 适配代码
- ⚠️ 明显多主题示例（**拆分**成多个 commit）：
  - 同时改了 auth 逻辑 + 完全不相关的 logging 格式
  - 修 bug + 顺手改了无关的 .gitignore / 配置
  - feature 改动 + 大段不相关的 refactor
  - 一边修代码一边改 README（**且 README 改的内容不是这次代码改的文档**）

**判断原则保守**：

- 含糊时合一（single commit）
- 只有当两组改动**彼此可以独立 revert 而不影响对方**、**属于完全不同的 intent** 时才拆
- 拆不超过 3 个（更多通常意味着用户应该手动 stage 分次调用）

拆分后**连续执行**，不问用户：第一组 add+commit → 第二组 add+commit → ... → 最后 `git status` 一次验证。报告里清楚说每个 commit 的主题 + hash。

## Stage 决策

- 已 staged → 沿用，不动 unstaged
- 全部 unstaged → 选**与 commit 主题相关**的文件 stage，**用 specific filenames**（不用 `git add -A` / `.`）
- 排除（永不 stage，碰到要在报告里警告）：
  - `.env*`（不含 `.env.example`）
  - `*credentials*` / `*secrets*` / `*.key` / `*.pem`
  - `.DS_Store`
  - 任何明显含 token / API key 的文件
- 输出报告里**显式列出**：stage 了什么、跳过了什么、为什么

## Message 起草

**强制先看 `git log --oneline -10` 学项目风格**：

- 项目用 conventional commits（`feat:` / `fix:` / `chore:`...）→ 跟着用
- 项目用别的格式（"Update X" / 全小写 / 全大写）→ 跟着用
- 项目历史多样、看不出风格 → 用 conventional commits 作 fallback

内容要求：

- 1-2 句话讲**为什么**而不只是**做了什么**——好的 message 是给 6 个月后的自己看的
- 第一行 ≤ 72 字符
- body（如有）解释动机 / 影响范围 / 不明显的取舍
- 不要 "Various changes" / "Fix stuff" / "Update files" 这种无内容句

**Co-Authored-By**：默认加 `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`。除非项目的 `rules/anti-patterns.md` 或 README 显式反对 AI 署名。

## Hard Stops（碰到必须停下来问用户）

- **检测到 secret-like 文件被请求 commit**（例如用户已经 `git add .env`）→ 报告 + 询问，**不要静默 commit**
- **`git status` 显示 nothing to commit** → 报告，**不创建空 commit**
- **pre-commit hook 失败** → 报告 hook 输出，**不要 retry、不要加 `--no-verify`**。让用户决定修 hook 还是修代码
- **当前在 detached HEAD / 中途 rebase / 中途 merge** → 报告状态，**不要硬 commit**
- **`--amend` 请求** → 拒绝。永远新 commit；amend 是危险操作（会改 history），由用户手动处理

## 永不做的事

| 行为                       | 原因                                      |
| -------------------------- | ----------------------------------------- |
| `git add -A` / `git add .` | 可能误 commit secrets                     |
| `git commit --no-verify`   | 跳 hook 是用户的显式决定，不是 skill 默认 |
| `git commit --amend`       | 改 history 风险，永远新 commit            |
| `git config ...`           | 不动用户配置                              |
| 创建 empty commit          | 没意义                                    |
| 在 detached HEAD 上 commit | 容易丢                                    |
| 凭记忆写 commit message    | 必须基于真实 diff                         |

## Gotchas

| What happened                                          | Rule                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| 中途停下来问"要不要 commit / 要不要拆"，破坏一次性体验 | 没碰到 Hard Stops 就直接 commit；拆不拆是 agent 自己的判断题 |
| 把明显多主题的改动合成一个 commit                      | 按"拆 commit 判断"评估，明显多主题就拆，不询问               |
| 含糊地拆了 5 个 commit 让用户回头收拾                  | 拆是保守动作；含糊时合一；拆不超过 3 个                      |
| message 用 "Various changes" / "Update files"          | 必须讲为什么；看不出动机就重读 diff                          |
| 静默 commit 了 .env                                    | secret-like 文件永远在 Hard Stops 里报告询问                 |
| 用 `git add -A` 一锅端                                 | 用 specific filenames                                        |
| 误把 unrelated 文件 stage 进去                         | 看 diff 主题相关性，与主题无关的 unstaged 保持不动           |
| pre-commit hook 失败后跑 `--no-verify`                 | 永远不跳 hook，让用户决定                                    |
| 写完 commit 没跑 `git status` 验证                     | 末尾必须 verify 一次                                         |
