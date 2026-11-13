# 项目发布规则

本仓库发布 AI 技能集合，交付物是 Git Tag 和 GitHub Release。仓库没有运行时服务，不发布 npm 包，也不需要部署环境、MediaStorm 部署工作流或部署 Secrets。

## 版本与发布单元

| 项目           | 约定                                            |
| -------------- | ----------------------------------------------- |
| 仓库与默认分支 | `moeyua/skills`，`main`                         |
| 发布单元       | 整个仓库，单一版本；技能不独立发版              |
| 唯一版本来源   | 根目录 `package.json` 的 `version`              |
| Tag            | `v<version>`，例如 `v5.0.0`；使用 annotated tag |
| GitHub Release | 每个 Tag 对应一个同名、非 draft 的正式 Release  |
| 版本规则       | SemVer，按上次正式发布以来的最高影响选择版本    |

不兼容的技能调用约定、必需流程或副作用变化升级 major；向后兼容的新能力升级 minor；向后兼容的修复升级 patch。目录内部重组本身不决定版本级别，应检查实际调用与安装契约是否变化。只发布稳定的 `X.Y.Z`；预发布需要先更新项目规则。

新版本必须同时大于当前 `package.json` 版本和最近已发布版本，Tag 不可复用。用户未指定精确版本时，Release 展示完整候选和远程 `main` 的依据，等待下一条用户消息确认；确认后依据变化则重新提出候选。

仓库没有 workspace 版本联动、依赖版本传播或版本绑定的 CHANGELOG。`pnpm-lock.yaml` 不保存根包版本。GitHub Release 使用从上一正式 Tag 起生成的发布说明；不为发版新增或更新仓库内的发布日志。

## PR 与质量检查

普通开发与发布规则设置通过 PR 进入 `main`。合并前核对当前提交的检查结果；只有用户明确要求合并时，才绑定已检查的 head SHA 合并：优先 rebase，无法 rebase 时 squash。

`.github/workflows/quality.yml` 的 `Quality` 工作流包含 `quality` job（显示名 `Quality`），对目标为 `main` 的 PR 和每次 `main` push 运行，不过滤版本文件或提交消息。Node 使用 24，pnpm 使用 `package.json` 的 `packageManager` 版本。

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm exec vp check
pnpm test
```

依赖安装跳过生命周期脚本，因为根包的 `install` 脚本会安装全局技能。CI 使用不带 `--fix` 的 `vp check`，执行格式、lint 和类型检查；本地 `pnpm check` 会自动修改文件，不能将这些无关修改混入版本提交。仓库没有应用构建命令或构建产物。

合并前必须核对当前 PR 的 `Quality` 成功结果以及 GitHub 实际要求的其他检查、评审和合并条件。文档中的检查约定不等于已经设置了 GitHub 分支保护，也不能覆盖平台规则。

## 日常发版

1. 读取已合并的本文件，获取远程 `main`、最新正式 Release 和 Tag 的实际目标，确定唯一发布单元及合法版本。
2. 使用已认证的 GitHub 用户完成发布。该用户须具有仓库写权限，并在当时的分支保护与 ruleset 下可以直接向 `main` 推送版本提交；不能仅凭仓库 write 权限推断。无该权限时停止，不更改保护、不改走版本 PR。
3. 从干净且与远程同步的 `main` 执行下面的版本命令。只允许 `package.json` 的 `version` 改为已确认版本；命令不能创建提交、Tag、暂存内容或发布包。

   ```sh
   npm version <version> --no-git-tag-version --ignore-scripts
   pnpm exec vp check package.json
   ```

4. 检查 HEAD、index 和 refs 未被版本命令改变，且 diff 只有预期版本字段。仅暂存 `package.json`，创建单一正常提交 `chore(release): v<version>`，直接推送 `main`。发布配置不属于版本提交。
5. 将该版本提交记为 R。等待 `.github/workflows/quality.yml` 的 `push` 运行成功，核对 `refs/heads/main`、R 的完整 SHA、run ID 和当前 attempt。父提交、其他工作流或更新后的 main 检查不能替代 R。未成功前不得创建新 Tag。
6. 在 R 创建 annotated tag，且只推送这个精确 Tag ref。核实远程 Tag 解引用后仍指向 R，再创建同名 GitHub Release，以上一正式 Tag 为发布说明起点。

版本提交与 Tag 由已认证用户通过 Git/`gh` 发布，不能改用会抑制后续 push 工作流的 Actions `GITHUB_TOKEN`。质量工作流仅有 `contents: read` 权限，不负责修改版本、创建 Tag 或 GitHub Release。

## 验证与恢复

分别报告版本提交、R 的 `Quality` 运行、每个 Tag 的远程目标及 GitHub Release。Tag push 不触发部署；本仓库没有 Preview 或 Production 验收。

R 已推送但检查未成功时保留 R，不重新 bump，也不创建 Tag。检查缺失、排队、失败或取消均不能视为通过；先报告具体运行和阻塞条件。需要修改源码时通过新的开发 PR 处理，不能将修复夹入原版本提交。

Tag 或 Release 已部分完成时，核验原提交的 parent、版本字段、允许路径和全部已存在对象，只补齐仍缺失且已获授权的步骤。main 后续前进不使原 R 失效；不能因此重复版本事务。已有 Tag 指向其他提交时停止，不移动或删除 Tag，也不改写历史。GitHub Release 创建失败不撤销已经成功推送的 Tag。

首次设置以规则和质量工作流合并、对应 main 检查通过为完成依据；不为测试初始化而创建虚构版本。
