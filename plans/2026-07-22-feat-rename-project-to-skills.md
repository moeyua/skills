---
mode: feat
title: 将 Squire 完整改名为 Skills
created: 2026-07-22
status: done
issue: https://github.com/moeyua/skills/issues/25
---

# 将 Squire 完整改名为 Skills

## Building

把当前项目的活动身份从 `Squire` 完整迁移为 `Skills`：产品展示名使用 `Skills`，私有开发包使用 `@moeyua/skills`，GitHub 仓库从 `moeyua/squire` 改为 `moeyua/skills`，本地目录从 `/Users/moeyua/Developer/Workspace/squire` 改为 `/Users/moeyua/Developer/Workspace/skills`。旧的 `moeyua/skills` 已由维护者归档并让出名称；实施前仍须重新确认目标远端和本地路径可用。

活动文档、skill 指令、spec、测试、checker 与 bench 中作为产品专名或产品格式名出现的 `Squire` / `squire` 一并对齐。原有骑士隐喻 slogan 改为直接描述“面向软件开发与持久项目记忆的一组聚焦 skills”的定位，不把普通名词 `skills`、`skills/` 产品目录或外部 `skills` 安装 CLI 误当成品牌引用修改。

## Not building

- 不改变 11 个公共 skill 的名称、行为、触发方式、Outcome Contract、能力图或安装结果。
- 不合并、删除、迁移或重写已经归档的旧 `moeyua/skills` 仓库及其历史。
- 不改写已有 `plans/` 历史文件；它们保留当时使用 `Squire` 名称的决策快照。
- 不重命名外部 `skills` npm 依赖，不改 `npx skills add ...`、`skills add ...` 等安装器命令，也不发布同名 npm 包。
- 不改变 GitHub 仓库可见性；当前仓库继续保持 private。
- 不升级依赖、不顺带调整产品能力、不重新安装 host 侧 skills，也不把改名扩展成营销文案重写。

## Approach

采用按语义分类的身份迁移，不做无差别全局替换：产品专名改为 `Skills`；描述所属关系时优先使用 `this skill suite`、`Skills project` 等不歧义表达；测试临时目录和代码注释使用新的 `skills-*` 身份；外部 CLI、普通复数名词和 `skills/` 目录保持原义。预先增加最小身份契约，再逐类消除活动引用，最后用排除 `plans/` 的全文扫描守住遗漏和误改。

GitHub 仓库改名和本地目录移动是非事务性外部步骤，必须放在内容修改与整库验证之后执行。远端先重新检查 `moeyua/skills` 未被占用，再显式改名并更新 `origin`；本地目录移动前重新检查目标路径不存在，并作为最后一步执行，之后所有命令都从新路径运行。

## Key decisions

1. **统一身份：**展示名为 `Skills`，GitHub 与本地 slug 为 `skills`，`package.json` 名称为 `@moeyua/skills`。使用 scoped package name，避免根项目与其 `skills` CLI devDependency 形成裸同名身份。
2. **旧入口由新项目接管：**复用 `moeyua/skills` 是有意的入口接管；旧仓改名产生的 GitHub 重定向会因名称复用而失效，旧 clone 或安装来源不再指向归档仓。
3. **保持 private：**改名不隐含公开发布，新仓库沿用 `moeyua/squire` 当前的 private 可见性。
4. **活动真源改透、历史计划不动：**根 durable docs、活动 skill/spec、代码、测试和 bench 使用新身份；实施前已经存在的 `plans/` 不批量改写。
5. **移除旧隐喻：**`Your AI agent has the horsepower. Squire gives it the road.` 不做机械换名，而由当前产品定位的描述性短句取代。
6. **能力表面不变：**`skills/` 目录、11 个 skill 名和外部 `skills` 安装器都不是此次重命名对象。

## Interface boundary

| Surface                  | Current                                    | Target                                     |
| ------------------------ | ------------------------------------------ | ------------------------------------------ |
| Product display name     | `Squire`                                   | `Skills`                                   |
| Root package identity    | `squire`                                   | `@moeyua/skills`                           |
| GitHub repository        | `moeyua/squire`                            | `moeyua/skills`                            |
| Git remote               | `https://github.com/moeyua/squire.git`     | `https://github.com/moeyua/skills.git`     |
| Local repository path    | `/Users/moeyua/Developer/Workspace/squire` | `/Users/moeyua/Developer/Workspace/skills` |
| Visibility               | private                                    | private                                    |
| Installed skill commands | 11 existing commands                       | unchanged                                  |
| Installer CLI            | external `skills` package                  | unchanged                                  |

仓库使用者会看到新的名称、URL、包身份与描述性定位；skill 调用者不应观察到能力或命令变化。若实施时目标 GitHub 名称或本地路径被占用，迁移必须在对应副作用前停止并报告，不覆盖、删除或猜测处理占用对象。

## Public surface changes

- README、PRODUCT、ARCHITECTURE、ROADMAP 与 RESOLVER 的产品标题和自述从 `Squire` 迁移为 `Skills`。
- 活动 skill 与 spec 中的产品所属、格式名称和安装后生态引用使用新身份或无歧义的通用表达。
- GitHub canonical repository URL 变为 `https://github.com/moeyua/skills`；旧 `moeyua/squire` URL 由 GitHub 的仓库改名重定向处理。
- 根 `package.json` 暴露 `@moeyua/skills` 作为 private workspace identity；依赖的 `skills` CLI 仍解析为独立 devDependency。
- 本地开发入口迁移到 `/Users/moeyua/Developer/Workspace/skills`；旧 cwd 在目录移动后失效。

## Spec delta

### `specs/converge/spec.md`

**MODIFIED**

- `逐份状态判定与幂等收敛`：将“对齐到 squire 当前规范”的产品身份改为 Skills 当前格式；逐文档状态机、幂等性和同装依赖行为不变。

### `specs/doctor/spec.md`

**MODIFIED**

- `主检查——文档声称 vs 代码实际`：把 `squire 格式文档` 迁移为 Skills 格式文档，逐条 Requirement 审计语义不变。
- `两类对象、自适应且探不到即跳过`：把“squire 写的文档 / squire 格式”迁移为 Skills 所维护的格式身份，任意项目审计边界不变。

### `specs/handoff/spec.md`

**MODIFIED**

- `不绑定 host 的继续说明`：将“squire 不拥有的能力”改为 Skills 项目不拥有的能力，host-neutral 边界不变。

没有新增或移除 requirement；其余 spec 不改变可观察行为。

## Acceptance scenarios

### Scenario: 活动产品身份完整迁移

- **Given** 当前仓库活动内容仍使用 `Squire` / `squire`
- **When** 完成内容与 metadata 迁移
- **Then** `package.json` 名称为 `@moeyua/skills`，双语 README 与 durable docs 展示 `Skills`，排除既有 `plans/` 后不再出现旧产品身份

### Scenario: skill 能力与外部安装器保持稳定

- **Given** 仓库提供 11 个独立 skill，并依赖外部 `skills` CLI 安装它们
- **When** 项目身份改名
- **Then** skill inventory、目录、frontmatter 名称和安装命令保持不变，完整测试与 CLI discovery 仍通过

### Scenario: GitHub 名称成功接管

- **Given** `moeyua/squire` 存在、为 private 且 `moeyua/skills` 未被占用
- **When** 执行仓库改名并显式更新本地 remote
- **Then** `moeyua/skills` 存在、仍为 private，`origin` 指向新 URL，关联 Issue 可通过改名后的 canonical URL 读取

### Scenario: 外部目标发生冲突

- **Given** 实施时 `moeyua/skills` 或本地 `/Users/moeyua/Developer/Workspace/skills` 已存在
- **When** 对应迁移步骤做 preflight
- **Then** 在任何覆盖或删除前停止并准确报告，已完成的内容修改和其他外部状态保持原状

### Scenario: 本地目录最后迁移

- **Given** 内容验证和远端改名已经完成，且本地目标路径不存在
- **When** 从 workspace 父目录移动仓库
- **Then** 新路径是有效 git worktree，symlink 仍解析，旧路径不再存在，后续命令全部以新路径为 cwd

### Scenario: 历史记录保持原貌

- **Given** 既有 `plans/` 记录了 Squire 名称下的历史决策
- **When** 扫描和修改活动身份
- **Then** 既有计划文件内容不因改名而变化，新计划及其 Issue 关联可按当前迁移状态更新

## Implementation steps

1. 建立目标项目身份的最小机械契约并取得 red 证据。
   - outcome: 测试明确要求 root package 为 `@moeyua/skills`、双语 README 与 durable docs 使用 `Skills` 标题；在内容迁移前只因当前旧身份而失败。
   - scope: `tests/project-identity.test.ts`, `package.json`, `README.md`, `README.zh-CN.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `ROADMAP.md`
   - verify: `pnpm exec vp test run tests/project-identity.test.ts` 预期失败，失败项仅指向尚未迁移的目标身份。
2. 迁移活动文档、指令契约和技术文本中的项目身份。
   - outcome: package、根 durable docs、RESOLVER、活动 skill/spec、共享规则、checker、测试注释/临时前缀与 shape bench 全部使用 `Skills` 或无歧义通用表达；旧 slogan 被描述性定位取代；外部 CLI、普通 `skills` 名词和既有计划未被误改。
   - scope: `package.json`, `README.md`, `README.zh-CN.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `skills/RESOLVER.md`, `skills/*/SKILL.md`, `skills/docs/references/formats/`, `skills/doctor/scripts/checker.ts`, `rules/anti-patterns.md`, `specs/`, `tests/`, `bench/src/judge/prompt.ts`
   - verify: `pnpm exec vp test run tests/project-identity.test.ts && ! rg -n -i --hidden -g '!.git' -g '!node_modules' -g '!plans/**' 'squire' .`
3. 验证 package identity、symlink 和完整能力表面没有因重命名漂移。
   - outcome: `@moeyua/skills` 仍把外部 `skills@1.5.10` 解析为 devDependency；共享 references 保持 symlink；11-skill inventory、spec pairing、Markdown 链接、格式和类型检查全部通过。
   - scope: `package.json`, `pnpm-lock.yaml`, `skills/`, `rules/`, `specs/`, `tests/`, `bench/`, root durable docs
   - verify: `pnpm why skills --depth 0 && pnpm check && pnpm test && pnpm lint && node skills/doctor/scripts/checker.ts . --json && git diff --check`
4. 在重新验证目标空闲后把 GitHub 仓库改名并更新 canonical remote。
   - outcome: GitHub 仓库成为 private 的 `moeyua/skills`，本地 `origin` 显式指向新 URL；若本计划已关联 Issue，则读取改名后的 canonical Issue URL 并只更新本计划 frontmatter 中的关联。
   - scope: GitHub repository settings for `moeyua/squire`, local git remote `origin`, `plans/2026-07-22-feat-rename-project-to-skills.md`
   - verify: `gh repo view moeyua/skills --json nameWithOwner,url,isPrivate,isArchived && git remote get-url origin`，并用 `gh issue view` 验证关联 Issue 仍是同一对象。
5. 最后迁移本地目录并从新 cwd 做收尾检查。
   - outcome: repository 位于 `/Users/moeyua/Developer/Workspace/skills`，旧路径消失，git worktree、remote 和相对 symlink 均有效；实施会话切换到新 cwd。
   - scope: `/Users/moeyua/Developer/Workspace/squire`, `/Users/moeyua/Developer/Workspace/skills`
   - verify: 从 `/Users/moeyua/Developer/Workspace` 确认只有目标目录存在，再以新路径运行 `git status --short --branch`, `git remote -v`, `find skills -type l -maxdepth 4 -exec test -e {} \;`。

## Verification

- command: `pnpm check`
- command: `pnpm test`
- command: `pnpm lint`
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `pnpm why skills --depth 0`
- command: `git diff --check`
- command: `! rg -n -i --hidden -g '!.git' -g '!node_modules' -g '!plans/**' 'squire' .`
- checklist (manual):
  - [ ] 展示名、package identity、GitHub slug、origin 与本地目录全部为约定的 Skills 身份。
  - [ ] GitHub 仓库保持 private、未归档，关联 Issue 仍可访问且没有创建重复对象。
  - [ ] 11 个 skill、外部 `skills` CLI 命令和安装 discovery 未变化。
  - [ ] 原 Squire slogan 与骑士隐喻不再出现在活动产品文案中。
  - [ ] 既有 `plans/` 除本计划状态/Issue URL 外没有内容变化。
  - [ ] 所有共享 reference 仍为有效相对 symlink。
  - [ ] 本地目录移动后，IDE 或后续 agent 已从 `/Users/moeyua/Developer/Workspace/skills` 重新打开项目。

## Rollback

内容改动在发布前可按本计划涉及的具体文件恢复；发布后使用正常 revert 保留历史。GitHub 和本地目录迁移不是 git 内容回滚的一部分：若需要回退，先确认 `moeyua/squire` 与旧本地路径仍空闲，再把本地目录从 `skills` 移回 `squire`、把 `origin` 改回旧 URL、最后将 GitHub 仓库从 `moeyua/skills` 改回 `moeyua/squire`。任何目标被重新占用时停止，不覆盖或删除占用对象。已归档的旧仓库不参与回滚。

## Assumptions & risks

- **旧入口重用：**GitHub 明确说明复用仓库旧名称会取消原重定向；本次把它视为有意接管。旧仓消费者访问 `moeyua/skills` 后会命中新项目，或因新项目保持 private 而无法访问，不会自动到达归档仓。
- **普通名词碰撞：**`Skills`、`skills/` 与外部 `skills` CLI 同形，机械替换很容易改坏安装命令或产生歧义；实施必须逐条按语义审阅命中。
- **Issue URL 在改名后变化：**GitHub 会重定向仓库网页和 git 操作，但 plan 应以改名后查询到的 canonical Issue URL 为准，且不得按标题另建 Issue。
- **目录移动会使 cwd 失效：**本地 rename 必须最后执行；完成后工具、IDE 与后续会话需要切换到新绝对路径。
- **目标空闲是时点事实：**计划创建时 `moeyua/skills` 和 `/Users/moeyua/Developer/Workspace/skills` 均空闲；实施不能依赖旧检查，必须在副作用前重新验证。
- **可见性差异：**被归档的旧仓曾为 public，而新仓保持 private；本次只更名，不把仓库公开。
