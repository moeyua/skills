---
mode: fix
title: bench codex 驱动器 resume 轮 cwd 漂移,会话写穿真仓库
created: 2026-07-03
status: done
---

# 修复 codex resume 轮 cwd 漂移

## Building

bench codex 驱动器的多轮会话从 resume 轮起工作目录漂到调用进程所在的仓库根,修复为全程锁定临时 fixture 目录:`spawnSync("codex", …)` 增加 `cwd: workDir`。

## Not building

- 不加通用写穿检测护栏(用户已裁决:只修根因)
- 不动 claude driver(实证零穿透)
- 不改 bench 对外契约与报告格式
- 不在本 plan 内重跑 GPT-5.5 全组洗数据(单场验证即可;整组重跑由用户择时)

## Root cause

> 根因是 `bench/src/driver/codex.ts` 的 resume 分支在 `codex exec resume` 不接受 `-C` 后未以任何方式指定工作目录,子进程继承 bench 调用进程的 cwd(仓库根)而非会话原目录,sandbox 可写边界随之漂移,模型的相对/绝对路径写入全部落在真仓库。

实证:GPT-5.5 组 rollout 的 `turn_context.cwd` 首轮为临时目录、resume 轮变为仓库根;四处仓库污染(plans/ ×3、bench/fixtures/ ×1)全部发生在 resume 轮;claude 侧(SDK 每轮显式传 cwd)八场零穿透。该缺陷是「resume 不接受 -C」修复(19872c1 之前)删参数时的残留。

## Approach

**选定:spawnSync 统一加 `cwd: workDir`**,exec 与 resume 两分支共用,首轮 `-C` 保留作冗余保护。替代:只对 resume 分支特判——无收益,统一选项更简单。护栏方案(跑前后对比仓库文件清单)已由用户裁决不做。

## Premise collapse

本方案假设 codex resume 的沙箱与路径解析都跟随进程 cwd。若某版本 codex 改为持久化会话 cwd,本选项与之一致,无冲突。

## Key decisions

1. 两分支共用 `cwd: workDir` 而非 resume 特判 — 冗余保护无害,代码更简单。
2. 验证走真实会话而非单测 — cwd 是子进程属性,纯单测覆盖不到;接受一场模型成本。
3. 不加护栏、不记 ROADMAP — 用户裁决;修掉即非搁置项。

## Architecture

None。

## Public surface changes

None(行为修复,无接口变化)。

## Spec delta

None(bench 契约中「fixture 复制到临时目录运行」的既有承诺,本修复使其在 codex 多轮下真正成立)。

## Regression tests

- 无法用纯单测覆盖(子进程 cwd);回归验证为真实会话:重跑一场 codex 多轮场景,断言 rollout 中所有 `turn_context.cwd` 均为临时目录,且运行前后 `git status --porcelain` 无差异。旧代码下该断言必红(本次四处污染即证据)。

## Implementation steps

1. codex driver 加 cwd
   - outcome: `spawnSync("codex", …)` 携带 `cwd: workDir`,exec 与 resume 分支共用
   - scope: `bench/src/driver/codex.ts`
   - verify: `pnpm test` 全绿
2. 真实会话回归验证
   - outcome: 一场 codex 多轮场景(fix-multi-constraint-import)跑通;rollout 全部 `turn_context.cwd` 为临时目录;运行前后仓库 `git status --porcelain` 一致
   - scope: 运行验证,不改文件
   - verify: 上述两项断言输出

## Verification

- command: `pnpm test`
- command: `node bench/src/cli.ts run --scenario fix-multi-constraint-import --host codex --max-turns 15` + rollout cwd 核对 + `git status --porcelain` 前后对比
- checklist (manual):
  - [ ] resume 轮 `turn_context.cwd` 不再是仓库根
  - [ ] 跑完仓库无新增 untracked

## Rollback

revert `bench/src/driver/codex.ts` 单文件。

## Risks & Unknowns

None——单文件单选项,错误路径由既有 `res.error` 分支承接。
