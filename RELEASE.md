# 发布规则

本仓库发布 skill 集合，交付物是 Git Tag 和 GitHub Release。没有运行时服务，不发 npm 包，不部署。

## 改动怎么进 main

默认分支 `main`（`moeyua/skills`）。改动在用户同意后直接推到 `main`，不开 PR。

## 检查

推送前在本地跑：

```sh
pnpm check
pnpm test
```

`pnpm check` 会自动修复格式，修出来的改动要先 commit 再推。

CI：`.github/workflows/quality.yml` 的 `Quality` 在每次推送到 `main`（以及指向 `main` 的 PR）时运行 `pnpm exec vp check`（不带 `--fix`）和 `pnpm test`。依赖安装带 `--ignore-scripts`，因为根包的 `install` 脚本会全局安装 skill。

## 环境

没有环境，推送和打 tag 都不触发部署。

## 版本

| 项目     | 约定                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 发布单元 | 整个仓库一个版本，skill 不单独发版                                                           |
| 版本来源 | 只在 tag 里；`package.json` 没有 `version` 字段，也没有东西读它                              |
| Tag      | `v<version>`，annotated，不复用                                                              |
| 版本规则 | SemVer：skill 的调用方式或必需流程不兼容变化升 major；向后兼容的新能力升 minor；修复升 patch |

只发稳定的 `X.Y.Z`。没有 CHANGELOG，发布说明由上一个 Tag 以来的 commit 标题生成（改动直接推送，不经 PR，GitHub 自动生成的说明会漏掉它们）。

## 发版步骤

没有版本 commit。

1. 选定 `main` 上要发布的 commit，确认它自己的 `Quality` 已经跑绿。父提交或更新的 commit 绿了不算。
2. 在这个 commit 上打 annotated tag，只推这一个 tag，确认远程 tag 指向它。
3. 建 GitHub Release，说明由 `git log --no-merges --format='- %s (%h)' <上一个 tag>..v<version>` 生成，末尾附 compare 链接：`gh release create v<version> --verify-tag --title v<version> --notes-file <文件>`。

用用户自己的凭据推送，不用 Actions 的 `GITHUB_TOKEN`。

## 发版中途失败

已经成功的部分保留。不移动、不删除 tag，不改写历史。

- tag 推了但 Release 没建成：只补建 Release。
- 同名 tag 已指向别的 commit：停下来报告。

## 特殊情况

无。
