/**
 * LLM judge orchestration: prompt → claude CLI → schema validation,
 * one retry on invalid output, then judge-error (the batch never aborts
 * on a single bad judgement).
 */

import { loadShapeSpec, extractRequirements } from "./spec.ts";
import { renderTranscriptCapped } from "./render.ts";
import { buildJudgePrompt } from "./prompt.ts";
import { parseJudgeOutput, type JudgeVerdict } from "./schema.ts";
import { runClaudeText } from "./claude-cli.ts";
import type { NormalizedTranscript } from "../normalize/events.ts";

export type { JudgeVerdict, RequirementVerdict, PhaseSegment } from "./schema.ts";

export interface JudgeOptions {
  /** spec 原文;缺省时从 repoRoot 读 specs/shape/spec.md */
  specText?: string;
  repoRoot?: string;
  /** 注入模型调用(测试用);缺省走 claude CLI */
  runModel?: (prompt: string) => string;
  model?: string;
  scenarioNote?: string;
}

export type JudgeResult =
  | { status: "ok"; verdict: JudgeVerdict; attempts: number; rawResponse: string }
  | { status: "judge-error"; errors: string[]; attempts: number; rawResponse: string };

export function judgeTranscript(
  transcript: NormalizedTranscript,
  opts: JudgeOptions = {},
): JudgeResult {
  const specText = opts.specText ?? loadShapeSpec(opts.repoRoot ?? process.cwd());
  const requirementNames = extractRequirements(specText).map((r) => r.name);
  const prompt = buildJudgePrompt({
    specText,
    requirementNames,
    renderedTranscript: renderTranscriptCapped(transcript),
    scenarioNote: opts.scenarioNote,
  });
  const runModel = opts.runModel ?? ((p: string) => runClaudeText(p, { model: opts.model }));

  const errors: string[] = [];
  let raw = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      raw = runModel(prompt);
      const verdict = parseJudgeOutput(raw, requirementNames);
      return { status: "ok", verdict, attempts: attempt, rawResponse: raw };
    } catch (cause) {
      errors.push(`第 ${attempt} 次:${cause instanceof Error ? cause.message : String(cause)}`);
    }
  }
  return { status: "judge-error", errors, attempts: 2, rawResponse: raw };
}
