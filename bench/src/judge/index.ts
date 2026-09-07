/**
 * LLM judge orchestration: prompt → claude CLI → schema validation,
 * one retry on invalid output, then judge-error (the batch never aborts
 * on a single bad judgement).
 */

import { loadSkillSpec, extractRequirements, type PublicSkill } from "./spec.ts";
import { renderTranscriptCapped } from "./render.ts";
import { buildJudgePrompt } from "./prompt.ts";
import { parseJudgeOutput, type JudgeVerdict } from "./schema.ts";
import { runClaudeText } from "./claude-cli.ts";
import { hashText } from "../identity.ts";
import { readFileSync } from "node:fs";
import type { NormalizedTranscript } from "../normalize/events.ts";

export type { JudgeVerdict, RequirementVerdict } from "./schema.ts";

export interface JudgeOptions {
  skill: PublicSkill;
  /** spec 原文;缺省时从 repoRoot 读 specs/<skill>/spec.md */
  specText?: string;
  repoRoot?: string;
  /** 注入模型调用(测试用);缺省走 claude CLI */
  runModel?: (prompt: string) => string;
  model?: string;
  effort?: string;
  scenarioNote?: string;
}

export interface JudgeIdentity {
  skill: PublicSkill;
  specHash: string;
  rubricHash: string;
  modelRequested: string | null;
  modelObserved: string | null;
  effort: string | null;
  effortRequested: string | null;
  runner: string;
}

export type JudgeResult = { identity: JudgeIdentity } & (
  | { status: "ok"; verdict: JudgeVerdict; attempts: number; rawResponse: string }
  | { status: "judge-error"; errors: string[]; attempts: number; rawResponse: string }
);

export function judgeTranscript(transcript: NormalizedTranscript, opts: JudgeOptions): JudgeResult {
  const specText = opts.specText ?? loadSkillSpec(opts.repoRoot ?? process.cwd(), opts.skill);
  const requirementNames = extractRequirements(specText).map((r) => r.name);
  const prompt = buildJudgePrompt({
    skill: opts.skill,
    specText,
    requirementNames,
    renderedTranscript: renderTranscriptCapped(transcript),
    scenarioNote: opts.scenarioNote,
  });
  const identity: JudgeIdentity = {
    skill: opts.skill,
    specHash: hashText(specText),
    rubricHash: hashText(
      ["prompt.ts", "render.ts", "schema.ts"]
        .map((file) => readFileSync(new URL(file, import.meta.url), "utf8"))
        .join("\n") + specText,
    ),
    modelRequested: opts.model ?? null,
    modelObserved: null,
    effort: null,
    effortRequested: opts.effort ?? null,
    runner: opts.runModel === undefined ? "claude-cli" : "injected",
  };
  const runModel =
    opts.runModel ??
    ((p: string) =>
      runClaudeText(p, {
        model: opts.model,
        effort: opts.effort,
        onModel: (model) => {
          identity.modelObserved = model;
        },
      }));

  const errors: string[] = [];
  let raw = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      raw = runModel(prompt);
      const verdict = parseJudgeOutput(raw, requirementNames);
      return { identity, status: "ok", verdict, attempts: attempt, rawResponse: raw };
    } catch (cause) {
      errors.push(`第 ${attempt} 次:${cause instanceof Error ? cause.message : String(cause)}`);
    }
  }
  return { identity, status: "judge-error", errors, attempts: 2, rawResponse: raw };
}
