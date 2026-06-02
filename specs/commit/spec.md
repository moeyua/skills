# Commit Specification

## Purpose

commit skill 把工作区改动整理成干净的 git 历史：决定 stage 什么、按主题拆分、生成符合项目风格的 commit message，并在遇到危险状态时停下。

## Requirements

### Requirement: 按主题组织提交

commit 必须按主题组织提交：默认合并（同一主题即使跨多文件），仅在改动相互独立且意图完全不同时拆成各自可单独回退的提交，且拆分不超过 3 个。拆分由 skill 自行判断，不反问用户。
Verify: manual(integration)

### Requirement: 绝不 stage 敏感文件

commit 必须不 stage `.env*`（`.example` 除外）、`*credentials*` / `*secrets*` / `*.key` / `*.pem`、或任何含 token 的文件；该约束优先于完成提交。stage 必须用具体文件名，不用 `-A` / `.`。
Verify: manual(integration)

### Requirement: message 跟项目历史风格

commit message 必须跟随 `git log` 体现的项目风格；无明显风格时用 conventional commits。首行不超过 72 字符，且说清"为什么"而非只说"改了什么"。
Verify: manual(integration)

### Requirement: 危险状态停下报告

遇到以下状态 commit 必须停下并交还用户，不绕过：已 stage 的敏感文件、无可提交内容、pre-commit hook 失败（不得 `--no-verify` 重试）、detached HEAD 或 rebase/merge 进行中、用户要求 `--amend`。
Verify: manual(integration)
