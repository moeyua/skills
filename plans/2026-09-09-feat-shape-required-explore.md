---
mode: feat
title: Shape 必须先 Explore 当前项目
created: 2026-09-09
status: candidate
issue: https://github.com/moeyua/skills/issues/50
---

# Shape 必须先 Explore 当前项目

## Building

每次进入 Shape，都先使用 Explore 的 context 模式建立当前目标项目的事实基础，再提出项目相关的方向、比较或 Design Summary。项目熟悉、需求简单、方向已经确定，都不能成为跳过 Explore 的理由。已读且仍然有效的事实按 Explore 现有规范复用，缺失或过时的部分必须补齐。

授权来源：用户明确要求“在 shape 时一定要 explore 当前项目”，在看到相应 Design Summary 后调用 Plan，并随后调用 Implement 授权落实本计划。计划与 Issue 已创建，当前执行范围为本计划的实现和验证。

## Not building

- 不把其他公共能力改成必须先执行 Explore 或 Shape，也不建立全局固定流程。
- 不改写 Explore 的固定 Overview、渐进深入方法或独立报告格式，不把其正文复制进 Shape。
- 不增加独立 Explore 报告、探索完成确认、自动实现、提交、发布或安装宿主技能的动作。
- 不增加通用技能依赖管理器、自动安装或缺少 Explore 时的替代探索路径。
- 不扩展 bench 到其他能力的自动驱动，不升级依赖，不改写历史 plans 或 ROADMAP。

## Current evidence

- `skills/shape/SKILL.md` 当前仅要求在事实阻碍判断时调查，并在项目陌生时使用 Explore context；`specs/shape/spec.md` 的“事实缺口由 Agent 调查”保留同样的可选语义。
- `skills/explore/SKILL.md` 已要求先完成固定 Overview，允许复用仍有效的已读事实，并在 context 模式返回事实、路径和缺证据项，由调用方继续。
- `skills/converge/SKILL.md` 已有读取共同安装的其他技能资料、缺少必需技能时明确报告的本地模式，可沿用其定位方式。
- `PRODUCT.md` 与 `ARCHITECTURE.md` 允许在授权 outcome 内组合支持能力，支持结果返回当前调用方；无需额外用户调用，也不转移外部副作用授权。
- `bench/src/driver/common.ts` 的 `driverIdentity()` 当前只安装 Shape 快照；`ExecutionIdentity.source` 和 `observeSkillLoad()` 只覆盖一个入口。新的行为依赖 Explore，现有记录不足以证明使用了同一所选源码中的 Explore。
- `README.md` 说明安装是快照；源码变更不会自动更新 `/Users/moeyua/.agents/skills/`。本次规划时全局 Shape、Explore 正文与仓库源码一致。

## Interface boundary

- 用户继续直接调用 Shape，输入为当前议题与目标项目上下文，无需先单独调用 Explore。当前项目指本次议题所针对的项目；技能安装目录不自动成为被探索对象。
- Shape 在形成项目相关建议前加载 Explore 并执行 context 模式。Overview 依照 Explore 的唯一规范确认项目根和身份，读取 README、manifest、适用指令及必要架构/全局文档，建立职责、入口与运行/验证命令，再按议题选择深入范围。
- 复用已读事实只减少重复读取，不取消 Explore 前置要求；同一讨论后续轮次在事实仍有效时继续使用已有上下文，项目或范围变化时补齐受影响部分。
- Explore 支持调用返回后继续 Shape；不触发独立报告，也不触发“切换公共 outcome 前审阅”的停止规则。Shape 完成时仍输出 Design Summary，守住只读及用户审阅边界。
- 找不到 Explore，或无法确定/访问目标项目时，明确说明具体缺口，不声称探索已完成，不输出依赖缺失事实的已确定方向。可继续不依赖该缺口的意图澄清；需要用户提供的仅限不可从现有环境确定的信息。
- Shape 运行需要 Explore 可用。入口优先定位同一安装集合内的 Explore；缺失时搜索宿主已提供的技能位置，仍不可得则按上述缺口处理，不从记忆复刻其规范或自动安装。
- bench 保持现有 CLI 与场景接口，所选 `skillsRoot` 同时提供 Shape 和 Explore。报告包含两者的源码、安装及实际装载身份，缺少证据时明确不可得；其他公共能力的 transcript 判卷不因本次变更获得 Explore 前置要求。

## Key decisions

- **用户决定**：每次 Shape 必须先 Explore 当前项目，不能保留仅陌生项目才触发的旧分支。
- **沿用既有契约**：固定 Overview、有效事实复用、context 返回调用方，以及 Shape 只读和 Design Summary 审阅。
- **实现选择**：复用现有技能定位与 bench 快照/装载核验机制，仅补齐 Shape 对 Explore 的必要支持关系；不引入第二份探索规范或通用依赖框架。

## Architecture

当前是 Shape 按条件取 Explore 上下文，bench 只证明 Shape 的装载。目标是 Shape 入口始终消费 Explore context，再继续自己的方向讨论；bench 在同一临时项目中提供所选源码的两个技能及其引用，并逐一核验身份。

复用 `installSkillSnapshot()`、`hashTree()` 和已有宿主注入/关联读取证据。扩展现有执行身份、解析及报告，使 Shape、Explore 均有源码路径、安装路径、源码 hash、安装 hash 和装载证据。按显式技能集合复用安装/核验逻辑即可，不推断任意依赖图。Shape 比较条件必须覆盖两者；任一安装树变化、错误版本注入或缺失装载证据，都不能声称完整的指定源码已装载。历史缺少该信息的 Shape 记录保留证据缺失，不反推或补造 Explore 身份。

## Implementation steps

1. 建立 Shape 必经 Explore 的入口契约及相应说明。
   - prerequisite: 无。
   - outcome: 每次 Shape 在项目相关设计前执行 Explore context，复用有效事实并补齐缺口；支持调用返回后继续 Shape，最终审阅边界仍明确。
   - scope: `skills/shape/SKILL.md`、`specs/shape/spec.md`、`skills/RESOLVER.md`、`PRODUCT.md`、`ARCHITECTURE.md`、`README.md`、`README.zh-CN.md`。只同步与此次依赖、入口和安装要求直接相关的说明；Explore 现有规范保持为唯一来源。
   - verify: 核对下方 Spec delta、技能引用和对应文档一致性；`pnpm exec vp test run tests/skill-architecture.test.ts tests/development-integrity.test.ts tests/smoke/verify-skills.test.ts`。不把精确提示词匹配当作实际执行 Explore 的证明。
2. 补齐 Shape 评测中的 Explore 快照与来源证据。
   - prerequisite: 步骤 1 的契约已确定。
   - outcome: Codex 与 Claude 驱动均从同一 `skillsRoot` 在临时项目安装 Shape 和 Explore 及必要引用；快照作为 fixture 初始状态，实际会话分别核验两者装载。缺少 Explore 源码时准备失败，不借用未知全局安装继续运行。
   - scope: `bench/src/driver/common.ts`、`bench/src/identity.ts`、`bench/src/report.ts`、对应测试、`bench/README.md`；`bench/src/driver/codex.ts`、`bench/src/driver/claude.ts`、`bench/src/cli.ts` 及其测试只调整执行身份的必要传递与消费。
   - verify: `pnpm exec vp test run bench/src/driver/common.test.ts bench/src/report.test.ts bench/src/cli.test.ts`；临时目录测试覆盖两个技能及共享引用、干净工作树、缺少 Explore 源码、版本冲突、安装后修改、缺少任一装载证据和比较资格。错误/历史输入不得伪造完整来源身份。
3. 用实际会话验证先探索、再形成方向的行为。
   - prerequisite: 步骤 1、2。
   - outcome: 陌生项目、已有有效上下文、简单且方向已定的需求都满足前置探索；缺失项目/技能被如实处理；Explore 作为支持调用不提前结束 Shape。
   - scope: `bench/scenarios/` 与必要 fixture、`bench/src/scenario.test.ts`、`bench/results/` 本次证据；优先复用 `notes-app` 与现有场景结构，补充测试输入，已读上下文与缺失条件可使用隔离会话后通过现有 `bench:judge` 判卷，不为它们增加通用驱动协议。
   - verify: 完成 Acceptance scenarios。至少陌生项目、已有上下文、简单且方向已定三个正常场景保留真实 GPT-6 Astra 会话及完整工具记录，提示不额外提醒“先探索”；按更新后的同一 Shape Spec 判卷并人工核对读取顺序、来源与实际引用。其余边界保留实际隔离会话证据。单元测试或复制成功不能替代模型行为证明。
4. 完成变更检查并记录证据边界。
   - prerequisite: 步骤 3。
   - outcome: 行为、文档、测试和评测记录相互对应，变更限于本计划；实现结果只声称实际取得的证明。
   - scope: 上述变更文件及本计划后续状态/Assurance 投影。
   - verify: 执行 Verification 中的仓库检查，检查自动格式修复未带入无关改动；关联计划依据实际 Implement/Check 结果流转，不凭本轮 Plan 或静态检查标记 done。

## Acceptance scenarios

| 场景               | Given / When                                                 | Then                                                                                                                            |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 陌生项目           | 新会话直接调用 Shape 讨论项目需求，未额外要求探索            | 先加载 Explore 并完成固定 Overview、必要模块调查，再基于项目事实提出方向；可追溯实际读取证据                                    |
| 已有上下文         | 当前会话已完成同一项目的 Explore，证据仍有效；再次进入 Shape | 仍按 Explore context 检查覆盖范围，复用有效事实、补齐当前议题缺口，不以熟悉项目取消前置要求，也不机械重读全部文件               |
| 简单且方向已定     | 用户提供完整、范围很小的需求，并直接调用 Shape               | 先满足探索要求，再直接综合方向；不因简单而跳过，也不重复询问已定产品选择                                                        |
| 项目或范围变化     | 旧 Explore 上下文属于另一项目，或当前议题涉及未覆盖模块      | 正确定位目标项目并补足其 Overview/范围证据，不把旧项目或技能安装目录当成当前项目                                                |
| Explore 不可用     | 隔离环境中无法定位 Explore 技能，随后调用 Shape              | 明确报告技能缺口，不从记忆替代，不自动安装，不声称已探索或形成有项目依据的确定方向                                              |
| 项目不可确定或访问 | Explore 可用，但没有可定位或可访问的目标项目                 | 明确报告所缺信息或访问条件；只有不可检索的信息才交给用户，不假装完成探索                                                        |
| 支持调用与结束     | Explore context 正常返回                                     | Shape 继续讨论并输出一个 Design Summary；没有单独 Explore 报告、探索确认轮次、文件写入或自动进入其他交付能力                    |
| 评测来源完整性     | 使用指定源码运行两种宿主的 Shape 驱动                        | Shape 和 Explore 快照均可核验；错误版本、缺失证据或树变化不计为完整指定源码装载；缺证据的历史记录不能进入声称完整来源可比的分组 |

## Spec delta

### `specs/shape/spec.md`

**ADDED — Requirement: 每次先 Explore 当前项目**

每次进入 Shape，必须在形成项目相关方向、比较或 Design Summary 前使用 Explore context，完成其固定 Overview 并按议题进行必要深入。项目熟悉、需求简单或方向已定均不得跳过。允许按 Explore 规范复用仍有效的已读事实，补齐缺口；项目/范围变化时更新相关上下文。无法定位 Explore 或无法确定/访问目标项目时必须明确报告缺口，不伪造探索完成，不从记忆替代必需规范，不输出依赖缺失事实的已确定方向。
Verify: manual(integration)

**MODIFIED — Requirement: 事实缺口由 Agent 调查**

删除“陌生结构可自主组合 explore context”的条件性表述。必经 Explore 之后，影响判断的剩余可发现事实仍由 Agent 从项目或权威来源调查，不交回用户；对待定意图继续调查不依赖答案的事实。Explore context 返回事实、路径及缺证据项后，Shape 继续当前授权的只读方向讨论。
Verify: manual(integration)

**MODIFIED — Requirement: 会话结论必须通过 Design Summary 审阅**

保留 Shape 结束及切换另一公共 outcome 前的 Design Summary 和只读审阅边界，明确内部 Explore context 支持调用不构成公共 outcome 切换，不要求提前结束 Shape 或增加一次 Summary/确认。普通同意仍不授权 Plan、Implement 或交付。
Verify: manual(integration)

## Verification

- command: `pnpm test`
- command: `pnpm lint`
- command: `pnpm check`；该命令含自动修复，执行后检查 diff 范围。
- command: `node skills/doctor/scripts/checker.ts . --json`
- behavior: 从现有 `pnpm bench:run --scenario <本次场景 id> --host codex --model gpt-6-astra --effort high --skills-root <被测 skills 绝对路径>` 入口运行实际正常场景；隔离续谈/缺失条件通过 `pnpm bench:judge --skill shape <实际 transcript 路径>` 判卷。尖括号参数在执行时替换为本次实际路径和场景，不构成待定产品决定。
- evidence: 保存实际源码/装载身份、fixture 与场景、模型与可观察设置、原始 transcript、judge 输出和人工对照；宿主或权限导致缺证据时如实报告。只有判卷 prompt/render/schema 被实际修改时才按 bench 既有要求执行三次 gold 校准。
- checklist (manual):
  - [x] 所有正常 Shape 场景均有先完成 Explore context、后形成方向的证据，且没有依靠提示额外提醒触发。陌生场景的首轮已取得证据，后续默认 user-sim 失败，未宣称自动整场完成。
  - [ ] 复用上下文、范围变化、技能缺失和项目缺失场景符合上表，未伪造完成或增加替代路径。复用、切换及项目缺失已有人工核对；缺 Explore 的自动判卷因缺少权限上下文与人工结论存在分歧，保留待核验。
  - [x] Explore 支持调用正常返回 Shape，最终 Design Summary 与只读边界完整。
  - [x] bench 分别记录两种技能的实际源码与装载证据，缺证据不制造可比结论。复杂调用不能自动核验时保留 null，并另附人工关联证据。
  - [x] 11 个公共 Skill/Spec、共享引用与其他能力直接进入的契约保持一致；仅 Shape 增加必需支持关系。
  - [x] 实现验证与独立正式验收分开报告；无匹配候选依据的独立 Check 不标记 done。

## Assurance

- Candidate basis: `6b60343f2efe19a3a02466e44d72ac2be7e87acb + sha256:1f4331eb5bbe5d8c348dc85239f2835a7ecbff175225f824f0e061622ed30c5c`；覆盖相对基线的完整变更，复算方法见下方。仅本计划 status 和 Assurance 投影不参与身份。
- Candidate producer: Implement，当前任务 `/root`；本地分支 `feat/shape-required-explore`。
- Evidence and limitations: `pnpm test` 通过 27 个文件、329 项测试；`pnpm check` 的格式、lint、类型检查通过，`pnpm lint` 通过；Shape 的 skill-creator 格式校验通过，`git diff --check` 通过。Doctor 输出 100 条发现，均在被 Git 忽略的评测归档：84 条历史快照相对链接，16 条本次原始会话内相对 fixture 链接；本次产品、源码和正式文档无发现，未为清零而修改原始证据。Codex/Claude 双技能快照、独立来源核验及比较限制均有单元验证；真实模型行为只覆盖 Codex Astra/high。
- Behavior evidence: `bench/results/2026-09-09-required-explore-review/manual-observation.md` 与 `final-source-ledger.json` 记录陌生项目、简单需求、上下文复用、项目切换、缺项目及缺 Explore 的实际会话和人工核对。默认 Claude user-sim/judge 失败后，通过现有注入接口由真实 Astra 补判：四组 10 分，缺 Explore 一组 6 分、两项 fail。原始权限上下文明确禁止读取已列出的宿主技能目录，而标准化判卷材料省略该上下文；保留自动失败和人工分歧。陌生/缺项目的 Explore 自动装载证据仍为 null，另有原始关联调用可人工核对；所有 toolEnvironment 为空，不声称完整自动行为通过或与历史来源严格可比。判卷 prompt/render/schema 未变更，无新增校准结论。
- Check producer: 独立只读 `/root/implementation_review`，普通 scoped Check；归档 `bench/results/2026-09-09-required-explore-review/independent-review.md`。已发现并修复相对读取的未执行控制流及动态参数误判；最后独立复核 38 项回归通过，未发现此次修正的新问题。此结论限于所述修正和回归，未对完整候选出具正式验收证明。
- Verdict: pass
- Acceptance: not requested

### 候选源码复算

沿用仓库既有计划的完整差异身份算法。在含基线提交的仓库中保持待核验候选的文件字节、符号链接和执行位，运行以下只读命令。文件集合是基线到当前工作树的所有变化路径及全部未被 Git 忽略的未跟踪路径；不依赖预生成清单。后续源码、测试或计划正文变化均须重新计算，不能仅凭分支名沿用结论。

```sh
python3 - <<'PY'
from pathlib import Path
import hashlib
import json
import re
import stat
import subprocess

root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
base = "6b60343f2efe19a3a02466e44d72ac2be7e87acb"
plan = "plans/2026-09-09-feat-shape-required-explore.md"

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
        "git-ignored local evaluation evidence (separately identified)",
    ],
}
canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
print(base + " + sha256:" + hashlib.sha256(canonical).hexdigest())
PY
```

### 本地证据范围

评测原始会话、失败尝试、判卷、人工说明及 Doctor 输出留在被 Git 忽略的 `bench/results/`，未提交或上传，也不属于候选源码身份。`bench/results/2026-09-09-required-explore-review/evidence-manifest.json` 单独列出归档路径和内容 SHA-256；其文件 SHA-256 为 `4313297ecfe92c7e43042ff1a0ed51ad7a73ec73914d0a3f8b9af9a76739e6b6`。只持有仓库源码不能复现原始会话或据此声称正式验收。
