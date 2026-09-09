---
mode: feat
title: 移除 bench 开发评测工具
created: 2026-09-09
status: candidate
issue: https://github.com/moeyua/skills/issues/52
---

# 移除 bench 开发评测工具

## Building

完整移除仓库内的 bench 开发评测工具，包括自动驱动、判卷、场景、fixture、golden、专用依赖和开发命令。清理现有配置与活动文档中的接线，保留公共 Skills、Specs、Doctor 和现有仓库测试。历史评测记录移到仓库外完整保留，核验后提供保存位置。

授权来源：用户通过 Shape 确定删除 bench，在历史记录处置问题上明确选择“保留”，随后调用 Plan，并通过 Implement 明确授权实施。当前范围为本地归档、删除和验证。已发布的 Shape 必须先 Explore 当前项目这一契约继续有效。

## Not building

- 不删除或弱化 Shape 的 Explore 前置规则，不调整其他公共 Skill 行为。
- 不引入替代评测框架、兼容命令或废弃入口代理。
- 不升级无关依赖，不修改全局 Skill 安装或用户配置。
- 不改写历史计划的决策、验证结论或旧候选依据，不删除 Issue #50 或 PR #51。
- 不在规划阶段实施、提交、推送、更新 PR 或发布版本。

## Current evidence

- 当前源码基线为 `eed2bf0d355608a081027bbb8c6c8e14f17e50a6`，包含已发布至 PR #51 的 Shape 前置规则及 bench 双技能来源核验。
- bench 位于独立的 `bench/` 目录，源码、测试、场景和固定样本均在其内；`bench/results/` 是未被 Git 跟踪的本地评测产物，当前目录总量约 77 MB。
- `package.json` 提供 `bench:run`、`bench:judge`；`vite.config.ts` 与 `tsconfig.json` 分别将 bench 纳入测试、类型扫描。
- `@anthropic-ai/claude-agent-sdk` 只由 bench 使用；TypeScript 与其余开发工具仍服务于仓库检查。
- 双语 README、ARCHITECTURE 和 `.gitignore` 存在活动引用。历史 Astra 计划另有三处指向 bench 文件的相对链接。
- 当前 `tests/`、公共 Skills、Specs 和 Doctor 不引用 bench；未来实施仍须验证删除后的完整仓库状态。

## Interface boundary

- 删除后仓库不再提供 `bench:run`、`bench:judge`，也不提供对应源码、样本或自动判卷能力；旧命令按包管理器的普通缺失脚本行为报错。
- `pnpm test`、`pnpm check`、`pnpm lint` 及 Doctor 入口继续可用，Skill 安装和 11 个公共能力的契约保持不变。
- Shape 每次仍先调用 Explore context；删除评测工具不改变被评测的行为要求，也不把静态测试视为模型行为证明。
- 未跟踪的本地评测产物保存在仓库同级的 `skills-archives/bench/` 下，每次归档使用唯一时间戳子目录。使用非临时目录，完整复制并核验成功后才删除原位置，最终提供绝对路径；该归档不形成仓库中的替代工具或兼容路径。

## Key decisions

- **用户决定**：删除 bench，历史评测记录移到仓库外保留；先完成计划再实施。
- **分类**：使用 feat 记录开发命令及评测能力的主动移除；此处存在调用方可观察的边界变化，不声称只是保持行为不变的重构。
- **必要清理**：通过现有 pnpm 删除专用 SDK 并重算锁文件，保留仍需使用的 TypeScript；禁用本次依赖操作的生命周期脚本，避免触发项目 install 脚本中的全局 Skill 安装。
- **历史证据**：只将失效的历史源码链接改指已核验的对应 Git 提交。原始记录、旧分数及旧 Check 结论保持其时间范围，不投影为本次验收。
- **归档选择**：当前项目的归档根为 `/Users/moeyua/Developer/Workspace/skills-archives/bench/`，实施时创建唯一子目录并保留原相对结构。校验全部文件的相对路径、数量、内容 SHA-256 及符号链接目标；既有 manifest 只覆盖部分产物，不能替代完整目录核验。目标不可写、空间不足或校验不一致时保留源记录，先解决该具体问题，不改用临时目录或继续删除。

## Implementation steps

1. 确认待删除范围并保全本地产物。
   - prerequisite: 用户明确授权实施本计划。
   - outcome: 当前分支、工作树所有权和 bench 专用依赖已确认；全部本地原始评测资料已复制到仓库外的非临时归档，并通过完整性核验。
   - scope: `bench/`、`bench/results/`、`package.json`、当前 Git 状态及上述归档目录；检查 bench 内其他未跟踪文件，属于历史评测资料的也纳入保留范围。
   - verify: 核对源与归档的全部路径、文件数量、内容哈希及符号链接目标，并复核已有证据 manifest；不覆盖已有归档或无关用户改动。复制或核验失败时源记录仍完整。
2. 移除工具和开发接线。
   - prerequisite: 步骤 1。
   - outcome: 仓库中没有 bench 目录、命令、专用依赖或扫描入口，剩余工具正常运行。
   - scope: `bench/`、`package.json`、`pnpm-lock.yaml`、`vite.config.ts`、`tsconfig.json`、`.gitignore`。
   - verify: 目录不存在；活动配置无 bench 引用；SDK 不在 manifest、锁文件及本地依赖链接中；锁文件不升级无关依赖。
3. 同步受影响的当前说明和历史链接。
   - prerequisite: 步骤 2。
   - outcome: 用户入口和架构只描述仍存在的工具，历史材料的引用仍可追溯，Shape 前置契约完整。
   - scope: `README.md`、`README.zh-CN.md`、`ARCHITECTURE.md`；`plans/2026-09-07-feat-astra-skill-behavior.md` 仅修复三处历史源码链接。
   - verify: 活动文档没有 bench 入口或能力声明；历史链接指向确实包含目标文件的提交；公共 Skill/Spec 无本轮行为修改。
4. 验证并记录实施候选。
   - prerequisite: 步骤 2、3。
   - outcome: 剩余仓库检查通过，计划记录完整删除范围、当前证据和限制。
   - scope: 本次全部变更及本计划状态/Assurance。
   - verify: 执行 Verification；检查自动格式修改范围，计算完整候选依据，不沿用已删除代码的旧局部 Check。

## Acceptance scenarios

| Given / When                             | Then                                                               |
| ---------------------------------------- | ------------------------------------------------------------------ |
| 实施删除后检查目录、脚本和依赖           | bench 整体不存在，两条开发命令和专用 SDK 已移除，无兼容或替代入口  |
| 执行保留的仓库检查                       | 测试、格式、lint、类型和 Doctor 检查正常运行                       |
| 使用原有公共 Skills                      | Skill/Spec 契约保持一致，Shape 仍必须先取得 Explore context        |
| bench 中存在未跟踪的历史产物             | 全部复制到仓库外的非临时归档并核验成功后才删除源记录，提供实际位置 |
| 归档目录不可写、空间不足或内容校验不一致 | 保留原始记录并报告具体问题，修复前不执行依赖归档成功的删除         |
| 阅读当前文档与历史计划                   | 当前说明无失效工具入口，必要历史链接可追溯且不改写原结论           |

## Spec delta

**REMOVED — 仓库开发接口：bench 评测命令与自动驱动/判卷能力。** 此接口的当前权威记录是 `package.json` 与 bench 使用说明，没有独立的公共 Skill Spec；删除对应入口及说明，不为退役工具新增 Spec。11 个公共 Skill Spec 无行为变更。

## Verification

- command: `pnpm test`
- command: `pnpm check`；包含格式、lint、类型检查，完成后核对自动修复范围。
- command: `node skills/doctor/scripts/checker.ts . --json`
- command: `git diff --check`
- checklist (manual):
  - [x] bench 目录、运行入口、专用 SDK 和活动配置引用已完整移除。
  - [x] 剩余测试和检查通过，没有为删除工具而弱化或跳过保留的测试。
  - [x] 全部原始产物已保全到仓库外的非临时目录并核验，保存位置明确，失败路径不会丢失源记录。
  - [x] 文档及历史链接准确，公共 Skill/Spec 行为保持不变。
  - [x] 本次实现与旧候选、旧评测和正式验收结论分开记录。

## Assurance

- Candidate basis: `eed2bf0d355608a081027bbb8c6c8e14f17e50a6 + sha256:5506fbcbff0d0a645a47abeca6030bc62d3375a31bbcad0f74d4f767f8213ec6`；覆盖相对此次实施基线的完整仓库差异，包含删除项，仅排除本计划 status 和 Assurance 投影。保留产物另以归档 manifest 的 SHA-256 标识，见下方。
- Candidate producer: Implement，当前任务 `/root`，分支 `feat/shape-required-explore`。
- Evidence and limitations: `pnpm test` 通过 16 个文件、141 项测试；`pnpm check` 的格式、lint 和类型检查通过，Doctor 输出 `[]`，`git diff --check` 通过。bench 目录、两条命令、专用 SDK、本地依赖链接和活动引用均已移除；锁文件仅删除 912 行依赖记录，无新增版本。公共 Skills、Specs、tests、PRODUCT 及已发布的 Shape 计划没有本轮修改。历史 Astra 计划仅将三处源码链接指向已核验的旧提交。
- Preservation evidence: 删除前对源与归档做全量目录比对，5,124 个普通文件、5 个符号链接、1,669 个目录、64,303,758 字节一致；逐项核对相对路径、模式、内容 SHA-256 和符号链接目标，另复核既有 manifest 中的 141 个证据文件。归档脚本只复制并核验，源目录在成功后由独立步骤再次核验才删除；未进行磁盘故障注入测试。符号链接保留原目标，其中五条仍指向本仓库的共享规则，未改写原始证据。
- Check producer: none；本轮未执行独立 Check，旧 bench 实现的局部复核结论不适用于本次删除。历史评测记录及其已知限制不构成当前候选的正式验收。
- Verdict: not run
- Acceptance: not established

### 历史评测归档

已保存在非临时目录 `/Users/moeyua/Developer/Workspace/skills-archives/bench/2026-09-09T09-47-42Z-838f2ae6/`，原始目录结构位于其 `results/` 下。完整目录身份存于 `archive-manifest.json`，文件 SHA-256 为 `82fc74e172078300682c7605a4689ac54b8148e95a219b4847c308e46e9dd716`。该文件记录每个条目的路径、类型、模式、文件大小与内容哈希或链接目标，可据此重新核对归档。

既有 `results/2026-09-09-required-explore-review/evidence-manifest.json` 的 SHA-256 仍为 `4313297ecfe92c7e43042ff1a0ed51ad7a73ec73914d0a3f8b9af9a76739e6b6`；其中 `bench/results/` 前缀映射为归档内的 `results/`。归档不属于 Git 发布内容，仅有源码副本不能证明本地记录保留状态。

### 候选源码复算

在包含基线提交的仓库内，对待核验工作树运行以下只读命令。文件集合取基线到工作树的所有变化及未被 Git 忽略的未跟踪路径；不存在的路径以删除项参与身份。保持文件字节、符号链接目标及执行位不变；状态和 Assurance 的排除不延伸到其他计划正文。此命令复算仓库候选，归档按上方独立 manifest 核验。

```sh
python3 - <<'PY'
from pathlib import Path
import hashlib
import json
import re
import stat
import subprocess

root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
base = "eed2bf0d355608a081027bbb8c6c8e14f17e50a6"
plan = "plans/2026-09-09-feat-remove-bench.md"

def git(*args):
    return subprocess.check_output(["git", "-C", str(root), *args]).decode("utf-8")

changed = set(git("diff", "--name-only", "-z", base).split("\0"))
changed.update(git("ls-files", "--others", "--exclude-standard", "-z").split("\0"))
rows = []
for name in sorted(changed - {""}):
    path = root / name
    if not path.exists() and not path.is_symlink():
        rows.append({"path": name, "mode": "absent", "sha256": None})
        continue
    mode = "120000" if path.is_symlink() else (
        "100755" if path.stat().st_mode & stat.S_IXUSR else "100644"
    )
    content = str(path.readlink()).encode("utf-8") if path.is_symlink() else path.read_bytes()
    if name == plan:
        body = re.sub(r"(?m)^status: .*$", "status: <excluded projection>", content.decode("utf-8"), count=1)
        body = re.sub(r"(?ms)^## Assurance\n.*?(?=^## |\Z)", "", body)
        content = (body.rstrip() + "\n").encode("utf-8")
    rows.append({"path": name, "mode": mode, "sha256": hashlib.sha256(content).hexdigest()})

payload = {
    "baseRevision": base,
    "files": rows,
    "exclusions": [
        "associated plan status line and Assurance section",
        "preserved local archive outside repository (separately identified)",
    ],
}
canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
print(base + " + sha256:" + hashlib.sha256(canonical).hexdigest())
PY
```
