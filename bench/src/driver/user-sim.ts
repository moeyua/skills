/**
 * User simulator: answers the shaping model's questions from a scenario
 * card's intent card, via one claude CLI call per question.
 *
 * The sim never invents facts — anything the intent card doesn't cover is
 * answered "你决定", so scenario runs stay comparable across hosts and
 * repeats. Model invocation is injectable for tests.
 */

import { runClaudeText } from "../judge/claude-cli.ts";
import type { ScenarioCard } from "../scenario.ts";

export interface QuestionOption {
  label: string;
  description?: string;
}

export interface UserSimInput {
  card: ScenarioCard;
  /** rendered conversation so far, newest last */
  history: string;
  /** the question the shaping model just asked */
  question: string;
  /** present when the question came through AskUserQuestion */
  options?: QuestionOption[];
}

export interface UserSimOptions {
  runModel?: (prompt: string) => string;
  model?: string;
}

export function buildUserSimPrompt(input: UserSimInput): string {
  const { card, history, question, options } = input;
  const optionsSection =
    options === undefined || options.length === 0
      ? ""
      : `\n## 选项(这是一道选择题,从中选一个)\n\n${options
          .map((o) => `- ${o.label}${o.description === undefined ? "" : `:${o.description}`}`)
          .join("\n")}\n`;

  return `你在一场对话测试中扮演「用户」。一个开发助手正在帮你塑形需求,它刚刚问了你一个问题。你要以用户身份回答。

## 你的人设与真实意图(只有你知道,不要主动全盘托出)

${card.intentCard}

## 答题策略(严格执行)

${card.answerPolicy}

铁律:
- 意图卡和答题策略没覆盖的信息,一律回答「你决定」,不要编造新事实、新约束或新偏好。
- 一次只回答它问的这个问题,不要抢答、不要主动追加需求。
- 像真实用户一样说话:简短、口语、中文;不要客套,不要解释你的策略。
${optionsSection}
## 对话历史

<history>
${history}
</history>

## 它刚问你的问题

${question}

## 输出

只输出你作为用户的回复文本${options !== undefined && options.length > 0 ? "(若从选项中选,输出所选项的 label 原文;需要补充时在后面加一句话)" : ""},不要任何前缀或解释。`;
}

export function simulateUser(input: UserSimInput, opts: UserSimOptions = {}): string {
  const prompt = buildUserSimPrompt(input);
  const runModel = opts.runModel ?? ((p: string) => runClaudeText(p, { model: opts.model }));
  return runModel(prompt).trim();
}

/**
 * Map a free-text sim reply back onto an AskUserQuestion option label —
 * the answers record expects the label verbatim. Falls back to the raw
 * reply when nothing matches (a legitimate "other" answer).
 */
export function matchOptionLabel(reply: string, options: QuestionOption[]): string {
  for (const o of options) {
    if (reply === o.label || reply.startsWith(o.label)) return o.label;
  }
  for (const o of options) {
    if (reply.includes(o.label)) return o.label;
  }
  return reply;
}
