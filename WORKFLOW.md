# Squire Workflow

> 本项目自己的开发流程,供协作 agent 与贡献者遵守。只记维护者陈述的现行流程——未来的流程设想归 [ROADMAP.md](./ROADMAP.md);产品的使用流程(用户怎么用 squire skills)见 [README.md](./README.md)。

## 流程阶段

变更按大小分级:

- **实质变更**(新增 skill、行为/契约变更、跨文件改动):走完整 core loop:
  `/shape` 出方案 → `/implement` 落地(自动开工作分支)→ `/check` 把关 → `/docs` 记录持久记忆(plan 已把文档更新列为实施步骤时,此步常无剩余工作;与代码同 PR 原子合入)→ `/commit` → `/pr` 开 PR 合并。
  `explore` 不作为默认阶段:缺少项目/模块上下文时由当前 skill 按需做 context preflight;维护者需要独立理解报告时才主动 `/explore`。
- **小修**(typo、文档微调、无行为影响的整理):可直接 commit 到 main,仍须过 pre-commit hook 与 `pnpm test`。

skill 之间不自动串联——每步完成即停,由维护者决定下一步(PRODUCT 哲学 #3)。

## 各阶段约定与门禁

- **方案**:named mode 的 plan 写入 `plans/YYYY-MM-DD-<slug>.md`,frontmatter `status` 走 draft → approved → done;plan 文件随实现一起入库,作为历史快照不再回改(specs 才是持久契约)。
- **分支**:不在 main 上动工;工作分支名取 plan 文件名去掉日期前缀(`plans/2026-06-09-feat-handoff-skill.md` → `feat-handoff-skill`)。
- **提交**:按主题拆分、不超过 3 个;message 跟随 `git log` 风格——conventional commits,`type(scope): 中文主题`,首行 ≤ 72 字符、说 why;不 stage 敏感文件;pre-commit hook 自动跑 `vp fmt`,hook 失败不得 `--no-verify` 绕过。
- **可合并门禁**:`pnpm test` 全绿——单元测试 + 整库 smoke,机械守 frontmatter / Outcome Contract / 触发词 Jaccard / markdown links / RESOLVER 一致性 / skill↔spec 配对等 invariant;新增或改 skill 时,`skills/RESOLVER.md` 与 `specs/<name>/spec.md` 必须同步(checkResolverConsistency / checkSpecPairing 会拦)。`node skills/doctor/scripts/checker.ts . --json` 为 advisory,期望返回 `[]`。
- **PR**:`gh pr create`,标题与正文综合整条分支历史;正文必含 Test plan(无需测试也写 "N/A because X");不 force push、不推保护分支。
- **发布**:改 `package.json` 的 `version` → `pnpm test` → `git tag vX.Y.Z` → `git push --tags`;使用者重跑 `npx skills add .` 拉最新。

## 构建与命令

```bash
pnpm install                                      # 装依赖;install script 同时把 skills 装到本机 agent(skills add . -g --all)
pnpm test                                         # = vp test run:单元测试 + 整库 smoke,一条管线
pnpm exec vp test run --filter=verify-skills      # 只跑整库 smoke(单个测试文件同理换 filter)
pnpm lint                                         # = vp lint
pnpm format                                       # = vp fmt
pnpm check                                        # = vp check --fix
node skills/doctor/scripts/checker.ts . --json    # 随 doctor skill 装的零依赖确定性检查器(advisory)
npx skills add . -g -a claude-code -y             # 手动装/重装 skills 到 Claude Code(共享 store 存安装时快照,改仓内文件后重跑本命令生效)
```
