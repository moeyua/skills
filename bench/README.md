# shape bench

评测 shape skill 的行为质量：它是否用与不确定性和风险相称的交互，产出有事实支撑、决策完备、可交给 implement 的结果。bench 不把固定阶段、问题数量或标题格式当作质量，也不评价具体产品设计的个人审美。三个用途按优先级是：失败诊断、`skills/shape/` 回归对比、Claude Code 与 codex 的模型对比。

这是仓库开发工具，不属于 skills 交付物；运行时零依赖，所有 judge 与 user-sim 模型调用复用本机 claude CLI 登录，不需要 API key。

## 快速开始

```bash
# 判已有会话（输入 claude projects JSONL 或 codex rollout JSONL，格式自动识别）
pnpm bench:judge <transcript.jsonl...>

# 驱动器：跑场景 → 收 transcript → 自动判卷
pnpm bench:run [--scenario <id>] [--host claude|codex] [--repeat N] \
               [--baseline <results目录>] [--max-turns N]

# gold case 校准（rubric 改动后必跑；--repeat 3 量化判分抖动）
node bench/src/calibrate.ts [--repeat 3]
```

成本提示：一场 `bench:run` = 完整 shape 会话 + user-sim 若干次 + judge 一次。`--scenario` / `--host` 过滤是日常工作方式；缺省全量（9 场景 × 双 host）留给回归节点。

## 架构

```text
场景卡 + fixture ──► driver（双 adapter）──► 原始 transcript（JSONL）
                    claude: Agent SDK             │
                    codex:  exec/resume           ▼
已有真实会话 JSONL ─────────────────────► normalizer（统一事件流）
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                              机械 checker             LLM judge（claude -p）
                         （输出边界与占位符）       （逐 Requirement 结果质量）
                                    └───────────┬───────────┘
                                                ▼
                                      reporter（JSON + Markdown）
```

- `src/normalize/` — 两种会话格式归一化为统一事件流；新增 host 只需加 parser。
- `src/checks/` — 只检查机械可知的边界：shape 写了实现/非 plan 文件、brainstorm 写方案、plan 含意图占位。它不判断问题数量、固定 summary 或阶段顺序。
- `src/judge/` — 逐条评估 grounding、交互比例、实质决策覆盖、推荐质量、已定内容复用与交付 readiness；Requirement 清单运行时读自 `specs/shape/spec.md`，spec 更新自动跟随。
- `src/driver/` — user-sim 按意图卡答题；claude 侧经 Agent SDK `canUseTool` 代答 AskUserQuestion，codex 侧经 `exec` / `exec resume` 多轮驱动。
- `scenarios/` + `fixtures/` — 场景卡与合成项目；fixture 复制到临时目录后现场 `git init`，保证每次起点一致。
- `golden/` — 人工判卷基准与校准记录（rubric 修订史、判分抖动），见 [golden/README.md](golden/README.md)。

## 场景卡格式

`scenarios/<id>.md` 的 YAML frontmatter 包含 `id`（等于文件名）、`mode`、`title`、`fixture`，正文三节缺一不可：

- **初始意图** — 作为 shape 调用参数的用户原话。
- **意图卡** — 隐藏动机、约束、成功标准；只有 user-sim 知道，不主动全盘托出。
- **答题策略** — 开放问题如何答；意图卡未覆盖的信息一律答“你决定”。

格式由 `src/scenario.test.ts` 机械校验。

## 结果解读

产物在 `bench/results/<timestamp>/`（gitignored）：每会话判定 JSON、原始 transcript 归档与 `report.md`。

- **矩阵**：Requirement × 会话，`✓ / ✗ / n.a. / judge-error`。10 分表示事实充分、交互恰当、无可避免轮次且结果实现就绪；8 分表示正确可用但有轻微多余交互或小缺口；6 分表示仍可用但有未决实质决定、证据不足或多次可避免交互；4 分及以下表示结果不可实施、违背明确意图、重复确认阻塞或出现硬违规。
- **轮次**：turn count 是交互成本的诊断信号，不是越少越好的独立分数；遗漏实质决策不会因轮次少而得分。
- **判分噪声**：以最近一次 gold 校准记录为准；微小分差必须结合逐项 verdict 和抖动解读。
- **`--repeat >1`**：逐次分数与波动幅度单列，暴露行为和判卷稳定性。
- **`--baseline`**：与真实会话基线的逐条 fail 率对比；显著不一致（≥50 个百分点）标“harness 疑点”，先检查模拟用户/headless 分布偏移。

## 行为契约

bench 不是 skill，不进 `specs/`（`checkSpecPairing` 强制 specs ↔ skills 配对）；对外契约固化于此：

- **输入**：transcript 必须是 claude projects JSONL 或 codex rollout JSONL；无法识别的文件报错并指出路径与原因，其余合法文件继续判卷，整体 exit 非 0。
- **判定范围**：同一 host transcript 中，用户显式调用其他 skill 时，shape 判定在该用户消息前结束；没有显式 handoff 时，写完 plan 也不会解除 shape 的输出边界。
- **判定输出**：逐条 Requirement `pass|fail|n.a.` + 证据轮次 + 0–10 总分；judge 输出两次不合 schema 时，该会话标 `judge-error`，不中断整批。
- **驱动器错误语义**：codex `exec resume` 失败则该 run 中止并保留已有 transcript；SDK 非 success 结局标 `error`；超过 `--max-turns`（默认 30）未收束标 `timeout`。
- **完成信号**：以 plan 文件真实落盘为准，不信任“implement this plan”字样。
- **副作用**：调用 claude / codex CLI（计费）；fixture 在系统临时目录运行；只向 `bench/results/` 写产物，不修改仓库其他文件。
- **Not exposed**：judge prompt 与统一事件流中间表示可演化；只承诺 CLI 与报告 JSON 字段。

## 校准纪律

改动 judge prompt / render / schema 后，必须重跑 `node bench/src/calibrate.ts --repeat 3`：逐项方向与人工基准一致、总分差 ≤1、抖动录入 [golden/README.md](golden/README.md) 的校准结果表，修订动因追加进 rubric 修订记录。历史流程 rubric 的分数不得与 outcome-first rubric 直接比较。
