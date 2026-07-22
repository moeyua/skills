/**
 * Shared driver types and helpers for both host adapters.
 */

import { copyFileSync } from "node:fs";
import { join } from "node:path";

export interface DriveResult {
  scenario: string;
  host: "claude" | "codex";
  sessionId: string;
  transcriptPath: string;
  turns: number;
  status: "completed" | "timeout" | "error";
  workDir: string;
  error?: string;
}

/**
 * cheap heuristic: the assistant's final text is waiting for a user reply.
 * Biased loose on purpose — a rhetorical question only costs one extra
 * "你决定" round, while a missed real question kills the whole session.
 */
export function endsWithQuestion(text: string): boolean {
  const tail = text.trimEnd().slice(-400);
  // ？ is the fullwidth question mark — spelled as an escape because a
  // literal one is visually identical to ASCII "?" and silently degraded once
  if (/[?？]/.test(tail)) return true;
  return /(请确认|请回复|回复[「"']|告诉我|请选择|需要你确认|等你确认)/.test(tail);
}

export function collectTranscript(result: DriveResult, destDir: string): string {
  const dest = join(destDir, `${result.scenario}-${result.host}-${result.sessionId}.jsonl`);
  copyFileSync(result.transcriptPath, dest);
  return dest;
}
