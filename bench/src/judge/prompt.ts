/** Judge prompt assembly for outcome quality and proportional interaction. */

export interface JudgePromptInput {
  specText: string;
  requirementNames: string[];
  renderedTranscript: string;
  scenarioNote?: string;
}

export function buildJudgePrompt(input: JudgePromptInput): string {
  const { specText, requirementNames, renderedTranscript, scenarioNote } = input;
  const nameList = requirementNames.map((n) => `- ${n}`).join("\n");
  const scenarioSection =
    scenarioNote === undefined || scenarioNote === "" ? "" : `\n## 场景背景\n\n${scenarioNote}\n`;

  return `你是 squire 仓库 shape skill 的行为质量判卷器。给你 shape 的行为契约（spec 全文）、场景背景和一场完整会话的标准化 transcript。评估它是否用与不确定性和风险相称的交互，产出了有事实支撑、决策完备且实现就绪的塑形结果；不要按个人审美评设计，也不要按固定流程阶段是否出现来判卷。
${scenarioSection}
## 判卷原则

1. **逐条判定**：对下列每条 Requirement 给出 pass / fail / n.a.。
   - pass：transcript 中有正面证据表明该条被遵守；
   - fail：有证据表明该条被违反，或该条要求的行为在触发后缺失；
   - n.a.：该条的触发条件在本会话可观察范围内不存在。
   每条给 evidenceTurns（turn 号数组，引用 transcript 中的 [T 数字] 标记）和一句 reason。只按可观察证据判断，不推测 transcript 外发生了什么。若用户在 transcript 中显式调用其他 skill，shape 的判定范围在该用户消息之前结束；后续动作归下一 skill，不能反算给 shape。shape 自己调用实现则仍是违规。
2. **事实与比例**：先看 agent 是否自己查证仓库和权威来源能回答的事实，再看它是否只把实质意图决策交给用户。已充分指定的请求应直接综合；多个独立的实质问题可以同轮提出，问题多寡本身不构成 pass 或 fail。
3. **决策质量**：检查仍会改变范围、接口、架构、风险或验收的决定是否被解决，推荐是否有理由，用户已定内容和授权是否被复用。未表达的偏好不等于委托：若多个合理默认会产生不同的用户可见语义，agent 必须把它留在实质决策前沿，不能因为自己能推荐就静默写入 plan。不要因为缺少 clarify / approaches / grill / Design Summary 等命名阶段扣分；不存在真实取舍时只有一个推荐方向是正确行为。
4. **交付质量与边界**：named mode 的 plan 应当意图完备、范围清楚、可验证并达到实现就绪；brainstorm 应当停在对话结果。任何实现文件写入或实现调用都是 shape 边界硬违规，即使 plan 已经写出。重复确认、无意义的问题或为凑流程展开假 alternatives 会降低质量。
5. **总分**：给 0–10 的整数或 0.5 步进。
   - 10：事实充分、交互比例恰当、没有可避免轮次，结果完整且实现就绪；
   - 8：结果正确可用，只有一次轻微多余交互、次要理由不足或小的表达缺口；
   - 6：结果仍可用，但存在未解决的实质决定、明显证据不足，或多次可避免交互；
   - 4 及以下：结果无法交给实现、违背用户明确意图、重复确认阻塞进展，或出现实现写入等硬违规。
   n.a. 项完全不影响总分。同一根因造成多条 fail 时只按一个主缺陷折算，不重复扣分。短会话只评已到时机且可观察的行为；正面遵守边界同样可以计入。

## Requirement 清单（共 ${requirementNames.length} 条，输出必须逐条覆盖、名称一字不差）

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

只输出一个 JSON 对象，不要 markdown 代码块，不要任何解释文字：

{
  "requirements": [{ "requirement": "<与清单一字不差>", "verdict": "pass|fail|n.a.", "evidenceTurns": [3, 4], "reason": "…" }],
  "score": 8,
  "summary": "两三句总体诊断，指出最影响结果质量或交互比例的问题"
}`;
}
