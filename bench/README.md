# shape bench

评测 shape skill 流程遵守度的 benchmark:只评「流程是否被遵守」,不评设计质量好坏。三个用途,按优先级:失败诊断(定位哪条 Requirement 在哪被破坏)、回归对比(改 `skills/shape/` 文档前后跑分)、模型对比(Claude Code vs codex)。

这是仓库开发工具,不属于 skills 交付物;运行时零依赖,所有模型调用复用本机 claude CLI 登录,不需要任何 API key。

## 快速开始

```bash
# 判已有会话(输入 claude projects JSONL 或 codex rollout JSONL,格式自动识别)
pnpm bench:judge <transcript.jsonl...>

# 驱动器:跑场景 → 收 transcript → 自动判卷
pnpm bench:run [--scenario <id>] [--host claude|codex] [--repeat N] \
               [--baseline <results目录>] [--max-turns N]

# gold case 校准(rubric 改动后必跑;--repeat 3 量化判分抖动)
node bench/src/calibrate.ts [--repeat 3]
```

成本提示:一场 `bench:run` = 完整多轮 shape 会话 + user-sim 若干次 + judge 一次。`--scenario`/`--host` 过滤是日常工作方式;缺省全量(8 场景 × 双 host)留给回归节点。

## 架构

```
场景卡 + fixture ──► driver(双 adapter)──► 原始 transcript(JSONL)
                    claude: Agent SDK           │
                    codex:  exec/resume         ▼
已有真实会话 JSONL ────────────────────► normalizer(统一事件流)
                                              │
                                   ┌──────────┴──────────┐
                                   ▼                     ▼
                             机械 checker           LLM judge(claude -p)
                             (硬违规,代码判)      (阶段切分+逐条 Requirement)
                                   └──────────┬──────────┘
                                              ▼
                                    reporter(JSON + Markdown 矩阵)
```

- `src/normalize/` — 两种会话格式归一化为统一事件流;新增 host 只需加 parser
- `src/checks/` — 机械可判的硬违规:HARD-GATE(design 确认前写实现文件)、brainstorm 写方案文件、plan 占位词、一轮多问
- `src/judge/` — 先阶段切分(context/clarify/approaches/grill/design-summary/plan),再逐条判定;Requirement 清单**运行时读自 `specs/shape/spec.md`**,spec 更新自动跟随
- `src/driver/` — user-sim 按意图卡答题;claude 侧经 Agent SDK `canUseTool` 代答 AskUserQuestion,codex 侧经 `exec`/`exec resume` 多轮驱动
- `scenarios/` + `fixtures/` — 场景卡与合成项目;fixture 以普通目录提交,driver 复制到临时目录后现场 `git init`,保证每次起点一致
- `golden/` — 人工判卷基准与校准记录(rubric 修订史、判分抖动),见 [golden/README.md](golden/README.md)

## 场景卡格式

`scenarios/<id>.md`,YAML frontmatter `id`(=文件名)/ `mode`(期望 mode)/ `title` / `fixture`(fixtures 下目录名),正文三节缺一不可:

- **初始意图** — 作为 shape 调用参数的用户原话
- **意图卡** — 隐藏动机、约束、成功标准(只有 user-sim 知道,不主动全盘托出)
- **答题策略** — 开放问题如何答;意图卡未覆盖的信息一律答「你决定」

格式由 `src/scenario.test.ts` 机械校验(frontmatter 齐全、三节非空、fixture 目录存在)。

## 结果解读

产物在 `bench/results/<timestamp>/`(gitignored):每会话判定 JSON + 原始 transcript 归档 + `report.md`。

- **矩阵**:Requirement × 会话,`✓ / ✗ / n.a. / judge-error`;总分 0-10 对齐人工判卷刻度(8=流程完整有轻微偏差,6=有阶段缺失或降级,≤4=多处独立缺失或硬违规)
- **判分噪声**:校准实测单会话抖动约 ±0.5,分差 ≤0.5 不构成回归信号
- **`--repeat >1`**:逐次分数与波动幅度单列——波动本身就是「无法稳定遵守」的量化证据
- **`--baseline`**:与真实会话基线的逐条 fail 率对比;显著不一致(≥50 个百分点)标「harness 疑点」——先怀疑模拟用户/headless 分布偏移,再怀疑 skill

## 行为契约

bench 不是 skill,不进 `specs/`(`checkSpecPairing` 强制 specs↔skills 配对);对外契约固化于此:

- **输入**:transcript 必须是 claude projects JSONL 或 codex rollout JSONL;无法识别的文件报错并指出路径与原因,其余合法文件继续判卷,整体 exit 非 0
- **判定输出**:逐条 Requirement `pass|fail|n.a.` + 证据轮次引用 + 0-10 总分;judge 输出两次不合 schema → 该会话标 `judge-error`,不中断整批
- **驱动器错误语义**:codex `exec resume` 失败 → 该 run 中止,已有 transcript 保留可判;SDK 会话以非 success 结局(如 `error_max_turns`)→ 标 `error`,不当完整会话判分;超 `--max-turns`(默认 30)未收束 → 标 `timeout`(本身是诊断信号)
- **完成信号**:以 plan 文件真实落盘为准,不信任「implement this plan」字样(模型会预告式提及)
- **副作用**:调用 claude / codex CLI(计费);fixture 在系统临时目录运行;仅向 `bench/results/` 写产物,不修改仓库其他文件
- **Not exposed**:judge prompt 内部结构、统一事件流中间表示——均可演化,只承诺 CLI 与报告 JSON 字段

## 校准纪律

改动 judge prompt / render / schema 后,必须重跑 `node bench/src/calibrate.ts --repeat 3`:逐项方向与人工基准一致、总分差 ≤1、抖动录入 [golden/README.md](golden/README.md) 的校准结果表,修订动因追加进 rubric 修订记录——没有记录的 rubric 调整等于没校准。
