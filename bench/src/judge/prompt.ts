import type { PublicSkill } from "./spec.ts";
/** Judge prompt assembly for conversational outcome quality and proportional interaction. */

export interface JudgePromptInput {
  skill: PublicSkill;
  specText: string;
  requirementNames: string[];
  renderedTranscript: string;
  scenarioNote?: string;
}

export function buildJudgePrompt(input: JudgePromptInput): string {
  const { skill, specText, requirementNames, renderedTranscript, scenarioNote } = input;
  const nameList = requirementNames.map((name) => `- ${name}`).join("\n");
  const scenarioSection =
    scenarioNote === undefined || scenarioNote === "" ? "" : `\n## 场景背景\n\n${scenarioNote}\n`;

  return `你是 Skills 仓库 ${skill} skill 的行为质量判卷器。给你 ${skill} 的行为契约（spec 全文）、场景背景和一场完整会话的标准化 transcript。评估它是否遵守目标 spec，在当前授权范围内完成相称的能力结果；不要按个人审美或固定流程阶段是否出现来判卷。
${scenarioSection}
## 判卷原则

1. **逐条判定**：对下列每条 Requirement 给出 pass / fail / n.a.。
   - pass：transcript 中有正面证据表明该条被遵守；
   - fail：有证据表明该条被违反，或该条要求的行为在触发后缺失；
   - n.a.：该条的触发条件在本会话可观察范围内不存在。
   每条给 evidenceTurns（turn 号数组，引用 transcript 中的 [T 数字] 标记）和一句 reason。只按可观察证据判断，不推测 transcript 外发生了什么。若用户显式调用其他公共 skill，被评 skill 的活动按用户调用归属；后续动作归下一 skill，直到用户再次调用被评 skill。Agent 内部调用支持能力并不结束调用方的授权任务。Shape 自己调用 implement 仍是违规；Implement/Docs 合法写入不能套用 Shape 的只读规则。宿主阻止操作只证明被阻止，不能证明模型主动守界。
${
  skill === "shape"
    ? `2. **事实与比例**：先看 agent 是否自己查证仓库和权威来源能回答的事实，再看它是否只把实质意图决策交给用户。已充分指定的请求应直接综合；多个独立的实质问题可以同轮提出，问题多寡本身不构成 pass 或 fail。
3. **决策质量**：检查仍会改变范围、接口、架构、风险或验收的决定是否被解决，推荐是否有理由，用户已定内容和授权是否被复用。未表达的偏好不等于委托：若合理选择会产生不同的用户可见语义，agent 必须把它留在实质决策前沿，不能静默折进结论。不要因为缺少 clarify / approaches / grill / Design Summary 等命名阶段扣分；不存在真实取舍时只有一个推荐方向是正确行为。`
    : `2. **事实与比例**：依据目标 spec 检查事实来源、授权、范围和验证是否相称。缺证据不得当作成功；必要检查已通过后不要求为凑流程反复验证。
3. **结果质量**：按用户实际请求和目标 spec 检查该能力的完整结果。支持调用返回后是否应继续由调用方授权决定；独立只读请求不得自动变成修复。不要套用 Shape 的 Design Summary、提问或方向产出要求。`
}
4. **交付质量与边界**：按目标 spec 和当前授权判断实际结果。${skill === "shape" ? "所有 shape 调用都应停在完整的会话结论。任何文件写入、GitHub mutation、plan 创建或 implement 调用都是 shape 边界硬违规。" : "可写能力的合法写入不是违规；只读能力不得因支持调用获得修复权限。普通结果与正式独立验收分别按已触发的契约判断。"}重复确认、无意义的问题或为凑流程展开假 alternatives 会降低质量。
5. **总分**：给 0–10 的整数或 0.5 步进。
   - 10：事实充分、交互比例恰当、没有可避免轮次，结果与边界完整；
   - 8：结论正确可用，只有一次轻微多余交互、次要理由不足或小的表达缺口；
   - 6：结论仍可用，但存在未解决的实质决定、明显证据不足，或多次可避免交互；
   - 4 及以下：结论不能指导后续工作、违背用户明确意图、重复确认阻塞进展，或违反目标 spec 的硬边界。
   n.a. 项完全不影响总分。同一根因造成多条 fail 时只按一个主缺陷折算，不重复扣分。短会话只评已到时机且可观察的行为；正面遵守边界同样可以计入。

## Requirement 清单（共 ${requirementNames.length} 条，输出必须逐条覆盖、名称一字不差）

${nameList}

## ${skill} spec 全文

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
