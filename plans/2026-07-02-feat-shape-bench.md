---
mode: feat
title: shape benchmark——流程遵守度判卷器 + 全流程自动驱动器
created: 2026-07-02
status: done
---

# shape benchmark(判卷器 + 驱动器)

## Building

一套评测 shape 流程遵守度的 benchmark:对已有真实会话和自动跑出的会话,逐条判定 `specs/shape/spec.md` 的 13 条 Requirement,定位失败环节,支撑反向优化 skill 文档;同时具备回归(改 SKILL.md 前后对比)与模型对比(Claude Code/Opus 4.8 vs codex/GPT 5.5)能力。分两个可独立交付的阶段:判卷器先行(立刻可判已有真实会话),驱动器在后(自动产生新会话)。

## Not building

- 不评「设计质量好坏」,只评流程遵守度
- 不做 CI 集成(跑一轮调用大量模型,成本决定手动触发)
- 不支持 claude / codex 之外的 host
- 不修改 shape skill 本身(那是诊断结果出来之后的独立工作)
- 不更新 shape spec 的 `Verify: manual(integration)` 字段(判卷器落地后的自然后续,另行处理)
- 不做统计聚合 UI,报告止于 JSON + Markdown 矩阵

## Approach

**选定:判卷器先行的双阶段 harness(方案 C)。** 统一 transcript 判卷器(归一化 + 机械检查 + LLM judge)先落地,直接判用户机器上已有的真实 shape 会话(含两个已人工判卷的 codex 失败案例),先出诊断基线;驱动器(模拟用户 + 双 host adapter)随后建,复用判卷器。理由:诊断是首要目标,真实失败数据的诊断价值高于合成场景,且真实基线可反过来校准 judge 和检验驱动器保真度。

考虑过的替代:

- **方案 A(一步建成全自动 harness)**:模拟用户与 AskUserQuestion 拦截两个高风险件未经验证就压上全部,judge 也没在真实数据上校准过,诊断可信度存疑。未选,但其组件全部保留在本 plan 的阶段二。
- **方案 B(只做判卷器,永远人工驱动)**:工作量最小、用户行为最真实,但「稳定性」是统计问题,人工驱动撑不起回归与模型对比。未选。

## Premise collapse

本方案假设 **headless + 模拟用户跑出的流程遵守度,与真实交互时同分布**。若不成立,驱动器测的是「headless 里的 shape」而非用户遇到的问题。缓解已内建:判卷器先在真实会话上出基线(步骤 6),驱动器跑出的失败模式与真实基线对不上时(步骤 12),优先怀疑 harness 而非 skill。

## Key decisions

1. **全流程执行形态,不做单轮切片** — 用户观察到的失败(approaches 缺失、grill 不发生、design gate 退化)全部发生在完整多轮流程中,切片抓不到跨轮退化。
2. **机械检查 + LLM judge 分层** — 硬违规(HARD-GATE、brainstorm 写文件、占位词)用代码判最可靠;阶段是否发生/退化是模糊判定,交给 judge。符合「能机械守的不靠纪律」。
3. **judge 先做阶段切分再逐条判定** — 已见失败模式的本质是「阶段不可识别」,rubric 形式化用户人工判卷的思路:先在 transcript 标出 context/clarify/approaches/grill/design summary/plan 的边界,再逐阶段、逐 Requirement 判。
4. **模型调用全走 claude CLI** — 复用已有认证,零 API key、零运行时依赖,与仓库 `dependencies` 为空的现状一致。同族偏置可接受:主诊断对象是 codex 会话(无自评问题),Opus 会话靠 gold 校准 + 机械检查兜底。
5. **Claude 侧 driver 用 Agent SDK 而非 `claude -p` 循环** — AskUserQuestion 在 `-p` 下的行为官方文档未确认,SDK 的 `canUseTool` 回调是已查证的拦截代答机制(引入 `@anthropic-ai/claude-agent-sdk` devDependency)。
6. **场景 fixture 用合成小 git 仓库并提交进仓库** — 保证每次跑的起点一致,回归对比才有意义;真实项目副本不可提交、随项目演化失真。
7. **判卷输出逐 Requirement 判定 + 0-10 总分** — 逐条判定映射契约、服务反向优化;总分刻度对齐用户已有人工判卷习惯(6/10、8/10),便于校准和回归对比。
8. **judge 运行时读取 `specs/shape/spec.md`** — 不把 Requirement 内容硬拷进 prompt 模板,spec 更新后 judge 自动跟随。

## Architecture

新增顶层 `bench/` 工具层,六个组件:

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

- **normalizer 是两条输入路径的汇合点**:`~/.claude/projects/<hash>/<session-id>.jsonl` 与 `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` 两种格式都归一化为统一事件流(轮次、user/assistant 消息、tool call、文件写入、时间序);checker 与 judge 只认统一格式,新 host 只需加 parser。
- **driver 各 adapter 职责**:在临时目录复制 fixture → 以 `/shape <初始意图>` 启动会话 → 每轮把模型提问交给 user-sim 生成回复 → 喂回会话(claude 侧经 SDK resume/`canUseTool`,codex 侧经 `codex exec resume <session-id>`)→ 直到 plan 写出、模型明确停止或达轮次上限 → 收集 transcript。
- **分阶段迁移**:阶段一(normalizer + checker + judge + reporter + `bench:judge`)独立可 ship,交付真实会话诊断;阶段二(场景集 + user-sim + 双 adapter + `bench:run`)在其上叠加,交付回归与模型对比。

## Public surface changes

- 新增 `bench/` 顶层目录(`src/`、`scenarios/`、`fixtures/`、`golden/`、`results/`,其中 `results/` gitignore)
- `package.json`:新增 scripts `bench:judge`、`bench:run`;新增 devDependency `@anthropic-ai/claude-agent-sdk`
- `.gitignore`:新增 `bench/results/`
- 不触碰任何 `skills/`、`specs/`、`rules/` 现有文件

## Spec delta

None——bench 是仓库开发工具,不改变任何 skill 的对外行为契约。(后续可另行把 shape spec 各条 `Verify: manual(integration)` 改为引用 bench 场景,不在本 plan 范围。)

## Interface boundary

**Public API(CLI,经 pnpm scripts)**:

- `pnpm bench:judge <transcript.jsonl...>` — 判已有会话。输入:一个或多个 claude/codex 会话 JSONL 路径(格式自动探测)。
- `pnpm bench:run [--scenario <id>] [--host claude|codex] [--repeat <N>]` — 驱动器跑场景并自动判卷。缺省跑全场景 × 双 host × 1 次。

**输入约定**:

- transcript 必须是 claude projects JSONL 或 codex rollout JSONL;无法识别的文件报错并指出路径与原因,exit 非 0。
- `--scenario` 必须匹配 `bench/scenarios/` 下的场景 id,`--host` 只接受 `claude` / `codex`。
- 场景卡格式:YAML frontmatter(`id`、`mode`(期望 mode)、`title`、`fixture`(fixtures 下的目录名))+ 正文三节:初始意图(作为 `/shape` 参数的原话)、意图卡(隐藏动机、约束、成功标准)、答题策略(开放问题如何答、意图卡外的信息一律答「你决定」)。

**输出约定**:

- 成功:`bench/results/<run-timestamp>/` 下,每会话一份判定 JSON(阶段切分、逐条 Requirement `pass|fail|n.a.|judge-error` + 证据轮次引用、机械检查结果、0-10 总分)+ 一份汇总 `report.md`(场景 × Requirement × host 矩阵;`--repeat >1` 时展示各次结果与波动)。
- 失败:单个会话 judge 两次输出不合 schema → 该会话标 `judge-error`,其余继续;codex `exec resume` 失败 → 该 run 中止,已有 transcript 保留可判;会话超 30 轮未进入 plan 阶段 → 标 `timeout`(本身是诊断信号)。整体 exit code:有任何 run 级错误为非 0。

**副作用**:调用 claude CLI(计费)与 codex CLI;driver 在系统临时目录复制 fixture 运行并写 transcript;向 `bench/results/` 写报告。不修改仓库其他文件,不联网(模型调用经 CLI 除外)。

**Not exposed**:judge prompt 内部结构、统一事件流的中间表示——均可演化,不提供编程 API,只承诺 CLI 与报告 JSON 的字段。

## Acceptance scenarios

1. Given 一份已有 codex shape 会话 JSONL,when `pnpm bench:judge <file>`,then 产出判定 JSON:含阶段切分、13 条 Requirement 各有 `pass|fail|n.a.` 与证据轮次、机械检查清单、0-10 总分。
2. Given 两个 gold case(截图对应的 codex 会话)及其人工判卷基准,when 运行校准比对,then 逐项判定方向与人工一致、总分差 ≤1;不一致处有 rubric 修订记录。
3. Given 一张 feat 场景卡,when `pnpm bench:run --scenario <id> --host codex`,then 完整会话 transcript 落盘、自动判卷、报告生成。
4. Given 同一场景,when `--host claude`,then Agent SDK 驱动下 AskUserQuestion 被 user-sim 代答,流程同上。
5. Given 一个格式无法识别的 JSONL,when `bench:judge`,then 报错指出该文件与原因,exit 非 0,其余合法文件正常判卷。
6. Given judge 连续两次输出不合 schema,when 判卷,then 该会话标 `judge-error`,汇总矩阵如实展示,不中断整批。
7. Given brainstorm 场景,when 会话中模型写出了 `plans/` 或 design 文件,then 机械 checker 对「brainstorm mode 不写方案文件」判 fail 并给出文件写入事件为证据。
8. Given `--repeat 3`,when bench:run,then 三次结果分别记录,矩阵展示逐次判定与波动。

## Implementation steps

**阶段一:判卷器**

1. transcript normalizer:统一事件流模型 + claude/codex 两个 parser
   - outcome: 两种真实会话 JSONL 均可转为统一事件流(轮次、消息、tool call、文件写入、时间序),格式自动探测,无法识别时报错指明原因
   - scope: `bench/src/normalize/`(事件类型定义、claude parser、codex parser)+ 同目录单测与脱敏样例 fixture
   - verify: `pnpm test` 通过 normalizer 单测(两种格式样例各至少 1 份)
2. 机械 checker
   - outcome: 对统一事件流输出硬违规清单:design 确认前修改实现文件(HARD-GATE)、brainstorm 会话写 plan/design 文件、plan 文件含占位词(TBD/TODO/待定)、一条消息多问的近似检测(多个 AskUserQuestion 或多问句)
   - scope: `bench/src/checks/` + 单测(构造违规事件流样例)
   - verify: `pnpm test` 通过 checker 单测,每类违规各有正反用例
3. LLM judge
   - outcome: 经 claude CLI 单次调用产出结构化判定:阶段切分 → 逐条 Requirement `pass|fail|n.a.` + 证据轮次 → 0-10 总分;Requirement 内容运行时读自 `specs/shape/spec.md`;schema 校验失败重试一次后标 `judge-error`
   - scope: `bench/src/judge/`(prompt 组装、claude CLI 调用封装、输出 schema 校验)
   - verify: 对一份真实会话跑通,输出通过 schema 校验
4. reporter + `bench:judge` CLI
   - outcome: `pnpm bench:judge <files...>` 端到端可用,`bench/results/<timestamp>/` 下产出每会话判定 JSON + 汇总 report.md
   - scope: `bench/src/report.ts`、`bench/src/cli.ts`、`package.json` scripts、`.gitignore`
   - verify: 对 ≥2 份真实会话运行命令,产物齐全、矩阵可读
5. gold case 校准
   - outcome: 两个 codex gold case 的 judge 判定与人工判卷(6/10、8/10 及逐项理由)方向一致、总分差 ≤1;人工基准以结构化形式存入 `bench/golden/`,rubric 修订过程有记录
   - scope: `bench/golden/`、`bench/src/judge/` prompt 调整
   - verify: 校准比对输出显示逐项方向一致(acceptance scenario 2)
6. 真实会话基线诊断
   - outcome: 用户挑选的已有真实 shape 会话(含两个 gold case,建议 ≥5 份)全部判卷,产出第一份诊断基线报告,失败模式按 Requirement 汇总
   - scope: 运行产物 `bench/results/`(不提交)
   - verify: 基线报告存在,每份会话有逐条判定,汇总含失败模式分布

**阶段二:驱动器**

7. 场景卡格式 + 初始场景集 + fixtures
   - outcome: 7-8 张场景卡提交(5 个 mode 各 1 张基础卡 + 2-3 张失败定向卡:带多重约束的 fix、易诱发「直接给方案」的中型 feat,取材自基线报告与 gold case 失败模式);每张卡对应一个合成小 git 仓库 fixture
   - scope: `bench/scenarios/*.md`、`bench/fixtures/*`、场景卡 frontmatter 校验(并入现有 `pnpm check` 体系或 bench 单测)
   - verify: 校验通过:每张卡 frontmatter 完整、三节齐全、fixture 目录存在且为合法 git 仓库
8. 模拟用户(user-sim)
   - outcome: 给定意图卡 + 对话历史 +(claude 侧)AskUserQuestion 选项,经 claude CLI 生成用户回复;意图卡未覆盖的信息一律答「你决定」;回复策略可在单测中用注入的假模型输出验证
   - scope: `bench/src/driver/user-sim.ts` + 单测
   - verify: `pnpm test` 通过 user-sim 单测;对 gold case 对话片段人工抽查回复合理
9. claude adapter(Agent SDK)
   - outcome: SDK 驱动完整 shape 会话:临时目录复制 fixture、`settingSources` 加载用户级 skills、`canUseTool` 拦截 AskUserQuestion 交 user-sim 代答、文本问题经多轮 resume 代答、transcript 落盘;实现首步先做最小 spike 验证 `canUseTool` 对 AskUserQuestion 的拦截代答可行(见 Risks)
   - scope: `bench/src/driver/claude.ts`、`package.json` devDependency
   - verify: `pnpm bench:run --scenario <某 feat 卡> --host claude` 跑通全流程并自动判卷
10. codex adapter
    - outcome: `codex exec` 启动 + `codex exec resume <session-id>` 多轮驱动完整会话,shape 的文本提问由 user-sim 代答,rollout JSONL 收集判卷;resume 失败即中止并保留已有 transcript
    - scope: `bench/src/driver/codex.ts`
    - verify: `pnpm bench:run --scenario <同一张卡> --host codex` 跑通全流程并自动判卷
11. `bench:run` 编排 + 汇总矩阵
    - outcome: 缺省全场景 × 双 host 跑通,自动判卷,汇总矩阵为 场景 × Requirement × host;`--repeat N` 逐次记录并展示波动;`--scenario`/`--host` 过滤可用
    - scope: `bench/src/cli.ts`、`bench/src/report.ts`
    - verify: 全量跑一轮,矩阵覆盖所有场景与 host;`--repeat 2` 的波动展示正确
12. 基线一致性检查(脆弱假设验证)
    - outcome: 驱动器跑出的失败模式分布与步骤 6 真实基线对比,一致性结论写入汇总报告;显著不一致项标记为 harness 疑点而非 skill 问题
    - scope: `bench/src/report.ts`(对比小节)
    - verify: 汇总报告含基线对比小节,列出一致/不一致项

## Verification

- command: `pnpm test`(normalizer / checker / user-sim / 场景卡校验等纯逻辑单测,不调模型)
- command: `pnpm bench:judge <真实会话>`(判卷器端到端)
- command: `pnpm bench:run --scenario <id> --host codex && pnpm bench:run --scenario <id> --host claude`(驱动器端到端)
- checklist (manual):
  - [ ] 两个 gold case 判定与人工判卷方向一致(总分差 ≤1)
  - [ ] 真实会话基线报告已产出且失败模式与截图观察吻合
  - [ ] 全场景双 host 汇总矩阵可读,能直接回答「哪条 Requirement 在哪个 host 上最常被破坏」
  - [ ] 全程未配置任何 API key

## Rollback

`bench/` 目录完全独立,无运行时依赖侵入:回滚 = 删除 `bench/`、revert `package.json` 的 scripts 与 devDependency、revert `.gitignore` 一行。不影响任何 skill、spec 或现有测试。`bench/results/` 未提交,无需处理。

## Risks & Unknowns

- **Agent SDK `canUseTool` 拦截 AskUserQuestion 的实际形态**:文档确认回调存在,但对该工具代答的返回格式需实测。缓解:步骤 9 首先做最小 spike;若不可行,退路是 claude 侧改用 `claude -p --resume` 循环并实测 AskUserQuestion 在 `-p` 下的行为。owner: implement,blocker: 仅对步骤 9。
- **codex rollout JSONL 无正式 schema,版本间可能变化**:parser 按当前版本编写,带格式探测,不识别时报错而非静默错判。owner: implement,blocker: no。
- **judge 自身方差**:结构化输出 + gold 校准缓解;校准步骤中对同一会话重复判 3 次,量化一次判定抖动,写入 `bench/golden/` 作为解读矩阵时的噪声参考。owner: implement,blocker: no。
- **成本**:全量 `bench:run` 一轮 ≈ 8 场景 × 2 host × 数十轮对话 + judge 调用,开销可观。缓解:`--scenario`/`--host` 过滤是默认工作方式,全量跑留给回归节点;报告中记录每 run 的轮次数便于估算。owner: 用户,blocker: no。
- **模拟用户分布偏移(即 Premise collapse)**:步骤 12 的基线一致性检查承接。owner: implement,blocker: no。
