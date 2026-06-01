# Commit Specification

## Purpose

commit skill 把工作区改动整理成干净的 git 历史：决定 stage 什么、按主题拆分、生成符合项目风格的 commit message，并在遇到危险状态时停下。

## Requirements

### Requirement: 按主题组织提交

commit 必须按主题组织提交：默认合并(同一主题即使跨多文件)，仅在改动相互独立且意图完全不同时拆分，且拆分不超过 3 个。拆分由 skill 自行判断，不反问用户。

#### Scenario: 单一主题跨多文件

- GIVEN 一个功能改动连带其测试与文档
- WHEN commit 整理
- THEN 合并成一个提交，而非按文件拆开

#### Scenario: 两件不相干的改动

- GIVEN 一次鉴权改动 + 一处无关的 .gitignore 改动
- WHEN commit 整理
- THEN 拆成各自独立、可单独回退的提交

### Requirement: 绝不 stage 敏感文件

commit 必须不 stage `.env*`(`.example` 除外)、`*credentials*` / `*secrets*` / `*.key` / `*.pem`、或任何含 token 的文件；该约束优先于完成提交。stage 必须用具体文件名，不用 `-A` / `.`。

#### Scenario: 改动里混入 .env

- GIVEN 工作区有一个 `.env` 文件
- WHEN commit 选择 stage 的文件
- THEN 不把 `.env` 纳入，并提示用户先移除

### Requirement: message 跟项目历史风格

commit message 必须跟随 `git log` 体现的项目风格；无明显风格时用 conventional commits。首行不超过 72 字符，且说清"为什么"而非只说"改了什么"。

#### Scenario: 项目用中文 body + conventional 主题

- GIVEN `git log` 显示主题用 conventional、body 用中文 bullet
- WHEN 生成 message
- THEN 主题用 conventional、body 用中文 bullet，与历史一致

### Requirement: 危险状态停下报告

遇到以下状态 commit 必须停下并交还用户，不绕过：已 stage 的敏感文件、无可提交内容、pre-commit hook 失败(不得 `--no-verify` 重试)、detached HEAD 或 rebase/merge 进行中、用户要求 `--amend`。

#### Scenario: pre-commit hook 失败

- GIVEN 提交时 pre-commit hook 报错
- WHEN commit 遇到该失败
- THEN 报告 hook 输出并交还用户，不重试、不加 `--no-verify`
