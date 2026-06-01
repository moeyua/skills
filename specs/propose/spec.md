# Propose Specification

## Purpose

propose skill 把当前分支推到 origin 并在 GitHub 开 PR：标题与正文据整条分支历史综合，绝不碰 force 操作、受保护分支或用户的 git/gh 配置。

## Requirements

### Requirement: 不推受保护分支、不带未提交改动

当前在受保护分支（main / master / develop）时 propose 必须拒绝，要求先开工作分支；存在未提交改动时必须停下，要求先提交或显式丢弃。

#### Scenario: 当前在 main

- GIVEN 当前分支是 main
- WHEN 调 propose
- THEN 拒绝并要求 `git checkout -b <name>`，不直接推 main

### Requirement: PR 描述据整分支综合

PR 标题与正文必须综合整条分支的所有 commit，而非只看最新一个 commit。

#### Scenario: 分支有多个 commit

- GIVEN 分支含方案、实现、修复等多个 commit
- WHEN 生成 PR 描述
- THEN Summary 覆盖整条分支的主题，不遗漏早先 commit

### Requirement: PR 正文必须含 Test plan

PR 正文必须包含 Test plan 段；即使无需测试也必须写明"N/A because X"，不留空。

### Requirement: 绝不做破坏性远程操作

propose 必须不 force push、不修改用户 git/gh 配置、不删远程分支；用户要求 force 时拒绝，由用户自己执行。

### Requirement: 非 GitHub remote 跳过开 PR

remote 不是 GitHub 时，propose 必须完成 `git push` 后跳过 `gh pr create`，并提示用户手动开 PR/MR、附上准备好的 PR 正文。
