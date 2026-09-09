# skills bench

仓库开发期行为评测工具：已有 Claude Code / Codex 会话可以按 11 个公共 skill 的 spec 判卷；自动驱动仍限于 Shape。它评估实际能力结果、授权边界和相称交互，不以固定流程、问题数量或标题格式评分，也不替代独立 Check 验收。

## 使用

```bash
# skill 必填，不推断也不默认 Shape；格式自动识别
pnpm bench:judge --skill implement <transcript.jsonl...>

# 可提供该会话采集的执行身份；同次命令所有 transcript 必须共享该身份
pnpm bench:judge --skill check --metadata execution.json \
  --model <judge模型> --effort high <transcript.jsonl>

# 自动 Shape 场景：临时项目内装载指定源码，默认当前仓库 skills/
pnpm bench:run --scenario <id> --host codex --model gpt-6-astra \
  --effort high --skills-root /path/to/before/skills --repeat 3

# 其他参数：--baseline <results目录>、--max-turns N（默认30）
# gold 校准（prompt/render/schema 改变后必须执行，调用真实模型）
node bench/src/calibrate.ts --repeat 3
```

`--skill` 支持 explore、shape、plan、implement、check、docs、publish、release、converge、doctor、handoff；相应读取 `specs/<skill>/spec.md`。自动驱动与 gold 校准显式传 Shape。其他能力使用隔离会话、归档真实 transcript，再选目标 skill 判卷；不建立通用副作用驱动器。Issue / Publish / Release 的评测只在 stub 或隔离 fixture 中观察，不发布真实远程状态。

所有模型调用会计费。一次驱动包括 Shape 会话、user-sim 和 judge。日常用 `--scenario` / `--host` 过滤；缺省运行所有场景 × 双 host。`run --model/--effort` 指被评模型；`judge --model/--effort` 指判卷模型。Claude effort 支持 low / medium / high / xhigh / max；实际可用等级取决于模型与宿主。

## 源码与身份

驱动器复制 fixture 并初始化临时 Git 仓库，先检查所选 `skillsRoot` 中 Shape 和 Explore 的入口均可读，再将两者复制到项目级 `.agents/skills/`（Codex）或 `.claude/skills/`（Claude Code），同时解引用 shared references。任一入口缺失时准备失败，不借用全局版本。每个技能复制前后计算含路径与文件内容的 SHA-256；安装作为 fixture 初始状态提交，避免将安装误判为模型写入。不会覆盖全局 skills，也不会安装新依赖。宿主现有登录和配置仍可能影响执行。版本、设置来源等已知诊断放在 `toolEnvironmentDetails`；driver 不能核验实际 user config、MCP、工具与权限的完整身份，因此 `toolEnvironment` 保持 null，不将诊断 JSON 冒充可比条件。

驱动提示指向临时项目中的精确 Shape `SKILL.md`，由 Shape 读取同安装集合的 Explore。对每个技能，只有宿主结构化 skill 注入的路径与完整正文匹配，或关联工具调用及结果包含该 entry 完整内容，且安装树未变化时，才记录其 `loadEvidence`。同名旧版本或其他路径的注入与新源码读取混用时，该技能的证据为 null，不能声称纯指定版本装载。两份证据分别核验，读取 Shape 不证明已经读取 Explore；读取技能正文也不证明完成了项目 Overview，后者须结合原始会话中的事实读取与判断核对。提示中的路径和复制成功本身不是已加载证明。临时目录保留以便诊断。

相对路径仅对已观察工作目录或显式字面量 `workdir` 下的单文件 `cat` 读取核验。Code-mode 使用现有 TypeScript parser 识别受限的字面量调用和批处理；遇到动态目录、shell 控制、未知 JavaScript 控制流或提前退出时不推断读取已发生，保留证据缺失。

每个 JSON 报告包括：

- `skill`：被评公共名称。
- `identity.source`：源码目录、安装路径、源码 hash 与安装 hash。
- `identity.explore`：Shape 必需支持的 `{ source, loadEvidence }`，分别记录 Explore 的同类源码身份和实际装载证据；不可得时为 null。
- `session.model`、`identity.modelRequested`、`effortRequested/effortObserved`：实际可观察模型与请求设置分开；Codex turn context 可提供实际 effort。
- `identity.toolEnvironment`、`scenarioHash`、`fixtureHash`、`loadEvidence`：宿主版本/条件、场景、fixture 与装载证据。
- `judge.identity`：skill、spec hash、包含 spec 的 rubric hash、请求/观察到的 judge 模型、effort 与调用方式。CLI envelope 的单一 `modelUsage` 可识别实际 judge 模型；实际 judge effort 无直接观察时仍为 null。

**null 表示不可得**，不能用请求值补造实际设置。`--metadata` 接受 `src/identity.ts` 的完整 `ExecutionIdentity` JSON（含 `explore`，不可得则显式 null），仅适用于有归档证据的执行条件；没有 metadata 的已有会话保留未知源码、场景与工具条件，不猜测当前仓库就是当时使用版本。历史报告缺少 Explore 身份时仍可读取，但不能据此声称 Shape 的完整指定源码已装载。

## 判定与比较

normalizer → 按 skill 的机械检查 + LLM judge → JSON / Markdown reporter，保留现有 adapter 结构。Codex 工具结果支持真实 string 与 content-block 数组；提取已知文本块、在 `rawOutput` 保留原始结构，未知或非文本块显式标记文本不可得。用户轮次优先使用 `event_msg.user_message`；缺失时按宿主 `content_item_kinds` / `turn_id` 区分正文与注入，现存无 metadata 的旧 rollout 保留原 fallback。宿主 selected skill 注入作为独立事件保留，不增加用户轮次。Requirement 在运行时从选定 spec 加载，judge 输出逐项 `pass|fail|n.a.`、证据轮次、理由和 0–10 总分；两次输出无效则 `judge-error`，不中断其余合法文件。格式不可识别的输入列路径和原因，其余文件仍判卷，整体退出非 0。

机械只读边界适用于 Shape / Explore / Check / Doctor / Handoff；Implement / Docs 等能力的合法写入不套用 Shape 禁写规则，其范围与外部副作用由 spec 判卷。写工具事件证明模型发出了写入请求，**不单独证明落盘成功**；宿主阻止只证明阻止发生，不能当作模型主动守住边界。最终 `git status --porcelain` 只证明仍存在的 Git-visible 改动，捕获不到已经恢复或被忽略的瞬时写入。没有 fixture 或跨 skill 共用工作树时，缺失归属证据单列 warning。

用户开头的 `/公共skill` 或正文中唯一明确的 `[$skill](...)` 调用选择后续动作归属，直到下一次显式用户调用；Markdown 调用可以带自然语言前缀；代码示例、引文及多个不同 skill 的歧义引用不推定 handoff，未知 slash 命令不会抹去归属。再次调用原 skill 后重新纳入其判定。Agent 内部支持调用不构成用户 handoff，不能用它提前结束调用方任务或豁免越界；组合语义仍按 owner 的授权和 spec 判定。

矩阵按 **skill + requirement identity** 分行。重复运行波动及 baseline 对比只在模型、实际 effort、工具条件、场景、fixture、judge 与 rubric 身份相同且源码装载可核验时分组。Shape 还要求 Explore 的源码/安装 hash 一致且装载证据非空，并将 Explore hash 纳入比较条件；before/after 允许主 Shape 源码变化，Explore 来源变化不能混比。重复运行波动要求主技能源码也相同。不能换用各自 spec 后混分，旧报告或关键条件缺失显示“不可比”，不以同名 requirement、默认设置或旧 rubric 补齐。其他公共能力的比较不要求 Explore。确认是否可避免、检查是否重复需要结合人工证据；轮次、输出长度和分数不是独立质量结论。

## 场景与产物

`scenarios/<id>.md` frontmatter 包含 id（同文件名）、kind（explore 或四种 change type）、title、fixture；正文包含初始意图、意图卡、答题策略。user-sim 只按卡片回答，未知项回答“你决定”。现有 `scenario.test.ts` 机械验证结构。

产物写到 `bench/results/<timestamp>/`（gitignored）：每会话判定 JSON、驱动原始 transcript 归档、`report.md`。transcript-only 输入由调用者自行归档。`codex exec resume` 失败保留已有 transcript 并中止 run；SDK 非 success 记 error，达到 max-turns 记 timeout。assistant 最终消息未请求用户输入仅是现有 headless 收束启发式，不能证明 mid-turn steering 或独立 agent 上下文。

`golden/` 保留人工基准和校准记录。judge prompt / render / schema 变更后须运行三次 gold 校准，逐项方向与人工一致、总分差 ≤1，并记录抖动；历史 rubric 分数不可直接比较。单元测试不调用真实模型，不可替代 Astra 行为证据。
