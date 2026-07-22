/**
 * Claude Code driver: runs a scenario card through a full shape session via
 * the Agent SDK.
 *
 * AskUserQuestion is intercepted in canUseTool and answered by the user-sim
 * (spike-verified: behavior "allow" + updatedInput.answers keyed by question
 * text). Free-text questions are answered by resuming the session with a
 * simulated reply. Every other tool call is allowed — a HARD-GATE violation
 * must be observable, not blocked by the harness.
 */

import { globSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { prepareFixture } from "./fixture.ts";
import { simulateUser, matchOptionLabel, type QuestionOption } from "./user-sim.ts";
import { endsWithQuestion, type DriveResult } from "./common.ts";
import type { ScenarioCard } from "../scenario.ts";

export interface ClaudeDriverOptions {
  model?: string;
  maxTurns?: number;
  /** injectable user-sim model (tests) */
  runSimModel?: (prompt: string) => string;
  log?: (line: string) => void;
}

interface AskQuestion {
  question: string;
  options?: QuestionOption[];
  multiSelect?: boolean;
}

function findTranscript(sessionId: string): string | null {
  const matches = globSync(join(homedir(), ".claude/projects/*/", `${sessionId}.jsonl`));
  return matches[0] ?? null;
}

export async function runClaudeScenario(
  card: ScenarioCard,
  fixturesRoot: string,
  opts: ClaudeDriverOptions = {},
): Promise<DriveResult> {
  const log = opts.log ?? (() => {});
  const maxTurns = opts.maxTurns ?? 30;
  const workDir = prepareFixture(join(fixturesRoot, card.fixture), card.id);
  let history = "";
  let sessionId = "";
  let turns = 0;
  let prompt = `/shape ${card.initialIntent}`;

  const canUseTool = async (
    toolName: string,
    input: Record<string, unknown>,
  ): Promise<
    | { behavior: "allow"; updatedInput: Record<string, unknown> }
    | { behavior: "deny"; message: string }
  > => {
    if (toolName === "AskUserQuestion") {
      const questions = (input as { questions?: AskQuestion[] }).questions ?? [];
      const answers: Record<string, string> = {};
      for (const q of questions) {
        const reply = simulateUser(
          { card, history, question: q.question, options: q.options },
          { runModel: opts.runSimModel },
        );
        const answer =
          q.options === undefined || q.options.length === 0
            ? reply
            : matchOptionLabel(reply, q.options);
        answers[q.question] = answer;
        history += `\n[AskUserQuestion] ${q.question}\n[用户] ${answer}`;
        log(`  AskUserQuestion:${q.question.slice(0, 60)} → ${answer.slice(0, 60)}`);
      }
      return { behavior: "allow", updatedInput: { questions, answers } };
    }
    return { behavior: "allow", updatedInput: input };
  };

  const finish = (status: DriveResult["status"]): DriveResult => {
    const transcriptPath = sessionId === "" ? null : findTranscript(sessionId);
    return {
      scenario: card.id,
      host: "claude",
      sessionId,
      transcriptPath: transcriptPath ?? "",
      turns,
      status: transcriptPath === null && status !== "error" ? "error" : status,
      workDir,
      ...(transcriptPath === null && { error: "找不到会话 transcript JSONL" }),
    };
  };

  try {
    while (turns < maxTurns) {
      turns += 1;
      history += `\n[用户] ${prompt}`;
      let finalText = "";
      let resultSubtype = "";
      const q = query({
        prompt,
        options: {
          cwd: workDir,
          model: opts.model,
          settingSources: ["user"],
          canUseTool,
          ...(sessionId !== "" && { resume: sessionId }),
        },
      });
      for await (const msg of q) {
        if (msg.type === "result") {
          sessionId = msg.session_id;
          resultSubtype = msg.subtype;
          finalText = msg.subtype === "success" ? msg.result : "";
        }
      }
      if (resultSubtype !== "success") {
        // SDK error endings (error_max_turns, error_during_execution…) come
        // back as a result subtype, not a thrown error — a truncated session
        // must not be judged as a completed one
        const result = finish("error");
        result.error = `SDK 会话异常结束:${resultSubtype === "" ? "无 result 消息" : resultSubtype}`;
        return result;
      }
      history += `\n[助手] ${finalText}`;
      log(`  T${turns} 助手:${finalText.slice(0, 80).replaceAll("\n", " ")}`);

      if (!endsWithQuestion(finalText)) {
        return finish("completed");
      }
      prompt = simulateUser({ card, history, question: finalText }, { runModel: opts.runSimModel });
    }
    return finish("timeout");
  } catch (cause) {
    const result = finish("error");
    result.error = cause instanceof Error ? cause.message : String(cause);
    return result;
  }
}
