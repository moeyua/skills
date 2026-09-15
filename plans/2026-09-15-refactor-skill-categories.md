---
mode: refactor
title: 按用途组织技能目录与导航
created: 2026-09-15
status: candidate
issue: https://github.com/moeyua/skills/issues/58
---

# 按用途组织技能目录与导航

## Building

将现有技能从 `skills/<name>/` 整理为 `skills/<category>/<name>/`，用根 README 和分类 README 提供按用途浏览的入口，让后续工程、设计及通用工作技能有明确的位置。同步目录移动影响的检查、资源引用和当前文档，保持现有 13 个技能的名称、能力和安装入口稳定。

用户已经确认：采用 `engineering`、`design`、`productivity` 用途分类；实验、低频和弃用内容分别可放入 `in-progress`、`misc`、`deprecated`；有实际技能时再建立分类；分类内提供 README 导航。用户已取消全部技能重命名，并明确将本次范围限定为组织方式。Plan 已生成本地计划；用户随后调用 Implement，授权本计划的本地实施与验证，不授权提交、推送或发布。

## Not building

- 不重命名、新增、拆分或合并技能，不改变触发描述、内部方法、支持调用、权限或副作用边界。
- 不引入用户调用与模型调用分层、插件清单、安装过滤策略、分类注册表或新依赖。
- 不创建空分类、占位技能或独立的逐技能用户文档网站；本次不加入设计类技能。
- 不重排 `specs/`、`rules/` 或历史 `plans/`，不改写历史决定和验收记录。
- 不保留旧源码目录的代理、别名或兼容链接，不修改用户当前的全局安装和宿主配置。

## Current evidence

- 源码基线：`45d45b5e76528eedf23e3fdd3f640b4e63fe630a`；规划前工作树干净。
- `skills/` 现有 13 个直接子技能目录，`skills/RESOLVER.md` 是人读的路由索引；每个技能在 `specs/<name>/spec.md` 有对应契约。
- `tests/checks.ts` 的 `findSkillFiles` 只发现一层技能；Resolver 的路径解析及 Docs 格式目录也固定在旧布局。`tests/skill-architecture.test.ts` 把 `skills/` 的直接子目录当作技能集合。
- 多项测试直接读取 `skills/<name>/...`，`tests/checker.test.ts` 直接导入 Doctor 脚本。当前双语 README、ARCHITECTURE、Resolver 及 `rules/memory-catalog.md` 包含受移动影响的路径。
- 共有五个共享资源符号链接：Shape、Plan、Implement 的 `change-types.md`，以及 Explore、Docs 的 `memory-catalog.md`；各自指向根 `rules/` 中唯一的语义真源。
- 仓库现用 `skills@1.5.10`。其 README 的 Skill Discovery 节及 `dist/cli.mjs` 的 `discoverSkills` 已支持 `skills/<category>/<name>/SKILL.md`，因此无需更换安装器或增加 `--full-depth`。分类层的 `SKILL.md` 会遮蔽更深技能，应继续避免这种入口。
- 规划时执行 `DISABLE_TELEMETRY=1 node node_modules/skills/dist/cli.mjs add . --list`，实际列出当前全部 13 个名称。此结果只证明当前布局的发现基线，移动后的发现与安装仍须实施时验证。

## Architecture

当前技能内容和导航平铺在 `skills/`。目标结构在技能之上增加一个组织层，技能目录内的入口、参考资料和脚本仍由该技能拥有。

本次实际落盘结构：

```text
skills/
├── RESOLVER.md
├── engineering/
│   ├── README.md
│   ├── converge/
│   ├── debug/
│   ├── docs/
│   ├── doctor/
│   ├── explore/
│   ├── implement/
│   ├── plan/
│   ├── publish/
│   ├── release/
│   ├── review/
│   ├── shape/
│   └── verify/
└── productivity/
    ├── README.md
    └── handoff/
```

分类原则：

- `engineering`：开发、软件架构、测试及工程项目维护。现有 Shape 仍按当前项目设计职责归入此类。
- `design`：UI/UX、交互、视觉、品牌和设计系统等以设计成果为主的工作；将设计实现为代码的工作属于 `engineering`。当前没有该类技能，因此只记录分类规则，首次加入实际技能时建立目录及 README。
- `productivity`：通用工作、学习和信息整理；现有 Handoff 放在这里。
- `in-progress`、`misc`、`deprecated` 是有相应内容时使用的同级分类。此次没有技能被重新标记为实验、低频或弃用，也不新增安装器对这些名称的特殊处理。
- 一个技能只有一个规范目录。未来新增用途分类沿用相同目录深度与导航方式，不要求修改分类白名单；所有技能名在整个仓库内仍须唯一。

导航职责：根 `README.md` 和 `README.zh-CN.md` 展示分类、主要入口及安装用法；实际存在的每个分类以一个 `README.md` 列出全部所属技能，每项是一句说明和指向该技能 `SKILL.md` 的相对链接。分类 README 沿用仓库英文主文档惯例。保留 `skills/RESOLVER.md` 的完整名称映射和易混淆能力说明，只更新分类组织及实际入口路径，不复制到每个分类 README。

`specs/<name>/spec.md` 继续按稳定的技能名称配对。根 `rules/` 保持真源位置；移动后只修复那五个符号链接的相对深度。现有跨技能相对链接的调用双方均在 `engineering/` 中，仍是同级技能；核对源树和实际安装结果，不因为分类改变而重写调用方法。

## Behavior invariants

1. 安装器发现并提供同一组 13 个技能，frontmatter `name`、description、调用名称和现有可选元数据不变；分类不成为命令前缀。
2. 每个技能的实际职责、读写授权、返回结果和支持能力关系不变，包含 Shape → Explore、Plan → Review、Verify → Review，以及 Converge 使用 Docs/Doctor 资源。
3. 所有参考资料和 Doctor 脚本随所属技能完整移动；五个共享链接仍指向原来的两个真源，安装副本中相关内容也可读取。
4. Skill 与 Spec 仍按名称一一对应；六类持久记忆的定义和格式不变。
5. 默认安装入口、按名称选装、默认链接方式与 `--copy` 方式继续可用；没有新插件入口或旧路径兼容层。
6. 名称在分类之间保持全局唯一；分类 README 与 Resolver 不被误识别为技能，分类层不放 `SKILL.md`。

允许改变的是源码路径、与之直接相关的测试定位、共享链接深度、分类导航和当前文档里的路径投影。Doctor 的仓库内调用路径随源码移动更新，其脚本接口和输出保持不变。

## Regression coverage

| 不变量                            | 现有保护                                                                                                | 本次补充或调整                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 13 个名称、frontmatter 与目录一致 | `tests/checks.ts`、`tests/skill-architecture.test.ts`、smoke                                            | 两层分类发现；不同类别中的重复名称显式报错；安装器名单与预期逐项一致               |
| 技能职责与支持关系                | 各技能契约测试，包含 `tests/plan-audit.test.ts`、`tests/implement.test.ts`、`tests/attestation.test.ts` | 更新真实源码定位；前后比较技能内容，除确有必要的路径修正外无语义差异               |
| 资源、共享真源与脚本可用          | `checkReferencesExist`、`checkMarkdownLinks`、架构与 memory-catalog 测试、`tests/checker.test.ts`       | 新位置的五个 `realpath` 一致性，临时安装后的资源读取与 Doctor 调用                 |
| Spec 和记忆格式一致               | `checkSpecPairing`、`checkMemoryCatalog`、`tests/durable-memory.test.ts`                                | 按稳定名称配对，Docs 格式读取定位随移动调整，保留缺失/孤儿反例                     |
| 安装方式与选装稳定                | 现用安装器及其发现源码                                                                                  | 移动后运行真实 CLI 列表；两个隔离临时项目分别验证默认安装与 `--copy`               |
| 分类与导航完整                    | Resolver 检查、Markdown 链接检查                                                                        | 分类及无关 README 不误识别；分类入口不能遮蔽技能；导航遗漏、旧路径和重复名称的反例 |

验证辅助函数继续集中在 `tests/checks.ts`，沿用现有目录扫描模式识别 `skills/<category>/<name>/SKILL.md`，不增加通用多层搜索框架或新的运行时组件。扫描不进入技能自身的 `references/`、`scripts/` 等内部目录。更新现有临时 fixture 到分类布局，不以保留旧布局测试为由加入兼容路径。Resolver 检查应对照实际发现的完整相对路径与名称，避免只校验末尾名称而放过不存在的分类路径。

## Implementation steps

1. 更新技能发现与组织约束的独立测试。
   - prerequisite: 用户另行授权实施。
   - outcome: 检查能识别分类布局，并能拒绝跨分类重名、分类入口遮蔽和导航中的无效位置；独立 fixture 覆盖未来有设计技能的情况，产品源码不加入占位技能。
   - scope: `tests/checks.ts`、`tests/checks.test.ts`、`tests/memory-catalog.test.ts`、`tests/smoke/verify-skills.test.ts`、`tests/skill-architecture.test.ts`。
   - verify: 运行独立 fixture 测试；核对名称、引用、Spec 配对和格式缺失反例仍有效。改造期依赖真实布局的测试在下一步一并恢复，不提交中间失败状态。
2. 移动全部技能并恢复引用和真实仓库检查。
   - prerequisite: 步骤 1。
   - outcome: 12 个工程技能与 Handoff 各自到位，入口名称不变；共享资源可解析，现有测试从新位置读取相同契约。
   - scope: `skills/<name>/` → `skills/engineering/<name>/`（Handoff 除外），`skills/handoff/` → `skills/productivity/handoff/`；五个 references 符号链接；`skills/RESOLVER.md`；所有直接读取这些路径的 `tests/*.ts`，包括 Doctor 导入、Plan 测试辅助模块与 fixtures。
   - verify: `node node_modules/vite-plus/bin/vp test run`；对比移动前后技能名称与内容，确认旧源码位置消失；检查五个链接的 `realpath` 和两个共享真源，检查根及分类层都没有 `SKILL.md`。
3. 建立分类导航并同步当前说明。
   - prerequisite: 步骤 2。
   - outcome: 用户可从双语根 README 进入分类，再进入任一现有技能；设计与状态分类的按需建立规则清楚，当前文档中的路径可用。
   - scope: `skills/engineering/README.md`、`skills/productivity/README.md`、`README.md`、`README.zh-CN.md`、`skills/RESOLVER.md`、`ARCHITECTURE.md`、`rules/memory-catalog.md`；仅修复其他当前文件中确受移动影响的路径，不改变 Specs 的行为要求。
   - verify: 分类清单无遗漏或重复，全部相对链接指向真实入口；Doctor 文档命令已更新；运行 Markdown 链接检查和 Doctor，将既有非本次 finding 与移动导致的问题区分；历史计划保持原样。
4. 验证实际发现和隔离安装，完成整体检查。
   - prerequisite: 步骤 2、3。
   - outcome: 分类布局下发现的仍是原 13 个名称，安装及其资源可用，源码和文档不存在遗留的活动旧路径。
   - scope: 本次变更、三个仓库外临时项目、临时项目内由安装器创建的文件；完成后按 Implement 契约记录候选证据。
   - verify: 执行下述 Verification；临时项目验证结束后清理自己创建的目录，不运行仓库的全局 `install` 脚本。

## Verification

本机的包管理器入口已观察到自动触发安装生命周期；以下命令直接使用已安装的工具完成相同验证，避免检查时重新安装依赖或技能。

- command: `node node_modules/vite-plus/bin/vp test run`。
- command: `node node_modules/vite-plus/bin/vp check`；直接调用已安装工具，只检查格式、lint 与类型。
- command: `node node_modules/vite-plus/bin/vp lint`。
- command: `DISABLE_TELEMETRY=1 node node_modules/skills/dist/cli.mjs add . --list`；移动后必须仍发现原 13 个名称，既不遗漏 Handoff，也不把分类列为技能。
- command: `node skills/engineering/doctor/scripts/checker.ts . --json`；确认新路径可执行，并检查本次影响的链接与文件。
- command: `node --input-type=module -e 'import { checkMarkdownLinks } from "./tests/checks.ts"; checkMarkdownLinks(process.cwd());'`；覆盖双语根入口及分类导航，沿用检查器对根历史 `plans/` 的排除。
- integration: 使用三个由 `mktemp -d` 创建的隔离项目，以绝对路径运行仓库现有 `node_modules/skills/dist/cli.mjs`，来源指向本仓库，均使用项目级安装。
  - 准备：在三个临时项目中先建立 `.claude/`，并在对应项目工作目录下指定 Codex 与 Claude Code；现用 CLI 在该目录不存在时会跳过 Claude Code 默认链接安装，所以该前提必须显式满足。
  - 默认方式：第一个项目安装全部 13 个技能；核对 `.agents/skills/<name>` 的完整名称集合，以及 `.claude/skills/<name>` 的符号链接类型和 `realpath` 目标。CLI 返回成功、共享副本存在或 `skipped` 均不能替代 Claude Code 链接验证。
  - 复制方式：第二个项目同样安装全部 13 个技能并传 `--copy`；检查两种宿主各自的实际技能目录是可独立读取的副本。
  - 资源：前两个项目都读取技能内部资源、Shape/Explore 和 Plan/Review 相对入口、Converge 的 Docs/Doctor 资源及五个共享文档；从各安装位置运行 Doctor，以对应临时项目为检查根并传 `--json`，确认返回可解析的 JSON。
  - 按名选装：第三个全新项目只选装 `handoff`，核对两个宿主实际只获得该技能，没有类别前缀或其他技能。
  - 不加 `-g`，不覆盖真实项目或全局安装，验证后清理本次创建的临时项目。
- checklist (manual):
  - [x] 根 README → 分类 README → 技能入口的导航覆盖全部 13 个名称，链接真实有效。
  - [x] 本次只有 `engineering` 与 `productivity` 两个有内容的分类目录；`design` 与三种状态目录的规则已有说明，无空目录或占位内容。
  - [x] 安装命令不需要新增分类前缀、额外深度参数或插件配置。
  - [x] 现有技能职责、调用策略、名称和 Spec 行为均未改变，只有必要的路径投影发生变化。
  - [x] 旧技能目录未保留别名或代理；对当前文件搜索旧路径并逐项核对，历史计划不作为本次清理目标。

## Assumptions & risks

- 分类目录改变源码引用深度，容易出现安装器能列出技能、共享资源却不可读的情况；因此列表检查和实际安装资源检查均为完成条件。
- 仅验证技能名称不足以发现同名遮蔽或 Resolver 指向错误分类；发现阶段必须拒绝重名，导航检查必须验证真实路径。
- 现用安装器不会因为目录叫 `deprecated` 或 `in-progress` 就自动改变其安装资格。本次没有这类实际内容，因此仅规定放置位置，不声称或实现发布过滤；未来有相关需求时再按明确授权处理。
- 此计划的验证证明目录、引用和安装接口稳定，不把静态检查等同于模型行为的新一轮验收。

## Assurance

- Candidate basis: `45d45b5e76528eedf23e3fdd3f640b4e63fe630a + sha256:58ec91dce0f2990ba015b7b68fdf46639e63f3c55a82eab3b810326e96f47498`；包含相对基线的全部变化路径、删除项与未忽略的新文件，仅规范化本计划的 status 和本节。复算方法见下方。
- Candidate producer: Implement（本任务）。
- Evidence and limitations:
  - 本地结构已落盘：Engineering 12 个技能、Productivity 1 个技能，双语根导航、两个分类 README 和 Resolver 覆盖全部 13 个名称；没有空分类或旧源码兼容目录。
  - 从基线逐项核对全部 48 个技能资源：43 个普通文件内容逐字节不变，五个符号链接从新位置仍解析到原来的两个共享真源；无缺失或额外技能文件。Resolver 的 Common distinctions 及后文不变，memory-catalog 只更新格式目录路径，活动文件中无实际技能的旧路径残留。
  - 格式化后完整测试为 17 个文件、182 项通过；随后把重复测试改为参数化写法，受影响的 39 项测试全部通过，场景数量不变。最终直接调用已安装工具：`node node_modules/vite-plus/bin/vp check` 通过格式、lint 和类型检查；`node node_modules/vite-plus/bin/vp lint` 通过。
  - 新位置 Doctor 的机械检查返回 `[]`，Markdown 链接检查通过。首次 Doctor 报告新增测试文件超过 400 行，已通过合并重复测试写法消除；没有修改阈值或删减场景。此处为机械检查和本地内容核对，不声称独立全项目审计。
  - 真实安装器列表仍为原 13 个名称。三个隔离项目分别通过默认安装、`--copy` 与只选装 `handoff`；Codex 与 Claude Code 均核对实际目录或链接、全部资源内容和跨技能引用，前两种安装从两种宿主的安装位置调用 Doctor 均返回可解析 JSON。临时项目已清理。
  - 计划生成阶段的独立 Review（`/root/audit_skill_categories_plan`）发现 Claude Code 默认链接验证需预建 `.claude/`；计划和实际验证已修正。该 Review 覆盖当时的计划，不构成本次实现的独立验收。
  - 执行偏差：此前 `pnpm check` 在执行检查前自动运行依赖安装及仓库 `install` 生命周期，误触发 13 个技能的全局重装，违反本计划排除范围。这是 Implement 的执行失误。后续检查改为直接调用已安装的 `node_modules/vite-plus/bin/vp`，对应相同的 test/check/lint 工具，避免再次经由该包管理器入口触发生命周期。
  - 全局影响核对以仓库基线为比较对象：48 个预期安装资源均存在，13 个 Claude Code 技能链接有效；其中 Docs 与 Explore 的两份 `references/memory-catalog.md` 内容仅有上述目录路径变化。没有重装前的全局快照，无法确认是否覆盖过用户的自定义内容；未执行全局恢复操作。该宿主状态不属于候选源码身份，不能声称已恢复到重装前。
  - GitHub 登录已在沙箱外只读预检确认正常；此前 token 失效判断已撤回。恢复完成 Plan 配套产物后，Issue 已创建为 https://github.com/moeyua/skills/issues/58，新增标签为 `refactor`，canonical URL、标题、正文、标签及 managed digest 已回读精确核对。首次创建命令被自动审批拒绝且未执行；核实仓库公开状态与归属并缩减正文后重新获准，随后创建成功。工作保留在 `refactor/skill-categories`，未提交或推送。
  - 本次配对产物独立 Review（`/root/audit_category_pair`）原 verdict 为 `findings`：计划仍保留已知会触发安装生命周期的 `pnpm` 验证命令。已将后续执行指引改为直接调用已安装的 `vp`；审阅者定向复核修正有效，并确认没有剩余阻塞性规划 finding。Issue managed digest 为 `c7d678e42d223acc120dbdbe84baad49b6312c28a6d2cf29d940b3631f46574d`，问题投影不变，因此未进行 Issue 编辑。
  - 独立 Verify（`/root/verify_skill_categories`）复验 17 文件 / 182 项测试、格式/lint/类型、Doctor 与 Markdown 链接；逐项比对 48 个技能资源，并在三个隔离项目验证默认、复制和单独选装，完成 194 次安装资源内容比对及四次安装位置 Doctor 调用。Issue 也已由验证者独立回读一致。计划命令修正经其重新核对，候选 basis 一致。
- Verify producer: `/root/verify_skill_categories`；[独立验收报告](/Users/moeyua/.codex/visualizations/2026/09/15/01a0a3cc-dfca-7c71-b55d-63f01cd6d905/skill-categories-verify.md)。
- Verdict: findings。
- Acceptance: not established；源码组织和安装验证满足要求，但实施期间已发生未经授权的全局重装，且缺少事前快照，完整授权范围的验收未建立。该事件无法由源码修正消除，也未声称恢复；计划保持 candidate。

### 候选源码复算

以下只读命令沿用仓库已有计划的复算方式：完整变化路径、Git 文件模式、内容 SHA-256 和删除项均参与计算；本计划正文仍参与，只有 status 与 Assurance 投影被排除。安装检查和上述宿主副作用是本任务记录的观测结果，源码身份本身不能重建这些观测。

```sh
python3 - <<'PY'
from pathlib import Path
import hashlib
import json
import re
import stat
import subprocess

root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
base = "45d45b5e76528eedf23e3fdd3f640b4e63fe630a"
plan = "plans/2026-09-15-refactor-skill-categories.md"

def git(*args):
    return subprocess.check_output(["git", "-C", str(root), *args]).decode("utf-8")

changed = set(git("diff", "--no-renames", "--name-only", "-z", base).split("\0"))
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
    ],
}
canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
print(base + " + sha256:" + hashlib.sha256(canonical).hexdigest())
PY
```
