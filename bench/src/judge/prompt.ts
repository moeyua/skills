/**
 * Judge prompt assembly. Phase segmentation comes first because the observed
 * failure modes are all "a phase silently didn't happen" — per-requirement
 * verdicts only make sense against identified phase boundaries.
 */

export interface JudgePromptInput {
  specText: string;
  requirementNames: string[];
  renderedTranscript: string;
  scenarioNote?: string;
}

export const PHASE_NAMES = [
  "context",
  "clarify",
  "approaches",
  "grill",
  "design-summary",
  "plan",
] as const;

export function buildJudgePrompt(input: JudgePromptInput): string {
  const { specText, requirementNames, renderedTranscript, scenarioNote } = input;
  const nameList = requirementNames.map((n) => `- ${n}`).join("\n");
  const scenarioSection =
    scenarioNote === undefined || scenarioNote === "" ? "" : `\n## 场景背景\n\n${scenarioNote}\n`;

  return `你是 squire 仓库 shape skill 的流程遵守度判卷器。给你 shape 的行为契约(spec 全文)和一场完整会话的标准化 transcript。只评「流程是否被遵守」,不评设计质量好坏。
${scenarioSection}
## 判卷步骤

1. **阶段切分**:先在 transcript 上标出各阶段出现的 turn 区间。阶段固定为:${PHASE_NAMES.join(" | ")}。一个阶段若从未发生,turns 记 null 并在 notes 里说明判断依据。阶段可以交错出现,给出主要区间即可。
2. **逐条判定**:对下列每条 Requirement 给出 pass / fail / n.a.:
   - pass:transcript 中有正面证据表明该条被遵守;
   - fail:有证据表明该条被违反,或该条要求的行为在应发生处未发生;
   - n.a.:该条的触发条件在本会话中不存在(例如未跨结构变更则 Architecture 段那条为 n.a.)。
   每条给 evidenceTurns(turn 号数组,引用 transcript 中的 [T 数字] 标记)和一句话 reason。宁可引用具体 turn,不要空泛描述。
3. **总分**:0-10 的整数或 0.5 步进。刻度:10=全程严格遵守;8=流程完整但有轻微偏差(如个别问题合并、grill 被压缩成打包确认但关键决策仍逐一经过用户、某阶段偏薄);6=有明确的阶段缺失或降级(如没有 2-3 approaches、grill 完全未发生、design gate 被跳过);4 及以下=多处相互独立的阶段缺失或出现硬违规(如未经确认直接写实现)。注意区分「阶段被压缩但实质发生」与「阶段完全缺失」:前者属 8 档的轻微偏差,后者才进 6 档。若一条 Requirement 只是部分满足,verdict 按主要事实判,并在 reason 里注明 partial。计分规则:(a) n.a. 项完全不影响总分;(b) 多条 fail 若同出一个根因(例如「一次性给出完整方案」同时导致 approaches 缺失、grill 未逐枝、决策未逐个交回),按一个主缺陷折算,不逐条重复扣分;(c) 对片段或短会话,只评可观察部分的遵守度,不为尚未到时机的阶段追加惩罚,正面遵守的项(约束被尊重、未抢跑写文件)同样计入。

## Requirement 清单(共 ${requirementNames.length} 条,输出必须逐条覆盖、名称一字不差)

${nameList}

## shape spec 全文

<spec>
${specText}
</spec>

## 会话 transcript

<transcript>
${renderedTranscript}
</transcript>

## 输出格式

只输出一个 JSON 对象,不要 markdown 代码块,不要任何解释文字:

{
  "phases": [{ "phase": "clarify", "turns": [2, 5], "notes": "…" }, { "phase": "grill", "turns": null, "notes": "…" }],
  "requirements": [{ "requirement": "<与清单一字不差>", "verdict": "pass|fail|n.a.", "evidenceTurns": [3, 4], "reason": "…" }],
  "score": 7,
  "summary": "两三句总体诊断,指出最主要的流程缺陷"
}`;
}
