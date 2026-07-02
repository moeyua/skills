/**
 * Transcript normalizer entry: format detection + dispatch to host parsers.
 */

import { readFileSync } from "node:fs";
import { parseClaudeLines } from "./claude.ts";
import { parseCodexLines } from "./codex.ts";
import type { Host, NormalizedTranscript } from "./events.ts";

export type { Host, NormalizedTranscript, BenchEvent, SessionInfo } from "./events.ts";

const CODEX_LINE_TYPES = new Set(["session_meta", "turn_context", "event_msg", "response_item"]);
const CLAUDE_LINE_TYPES = new Set([
  "user",
  "assistant",
  "queue-operation",
  "attachment",
  "file-history-snapshot",
  "last-prompt",
  "summary",
  "system",
]);

function readJsonLines(path: string): object[] {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (cause) {
    throw new Error(`无法读取 transcript:${path}(${String(cause)})`, { cause });
  }
  const lines: object[] = [];
  const rawLines = text.split("\n");
  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i]?.trim();
    if (raw === undefined || raw === "") continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) lines.push(parsed);
    } catch {
      throw new Error(`无法解析 transcript:${path} 第 ${i + 1} 行不是合法 JSON`);
    }
  }
  if (lines.length === 0) {
    throw new Error(`无法解析 transcript:${path} 为空`);
  }
  return lines;
}

function detectFromLines(lines: object[]): Host | null {
  for (const line of lines.slice(0, 10)) {
    const o = line as { type?: string; payload?: unknown; uuid?: string; sessionId?: string };
    if (typeof o.type !== "string") continue;
    if (CODEX_LINE_TYPES.has(o.type) && typeof o.payload === "object") return "codex";
    if (CLAUDE_LINE_TYPES.has(o.type) && (o.uuid !== undefined || o.sessionId !== undefined)) {
      return "claude";
    }
  }
  return null;
}

export function detectFormat(path: string): Host | null {
  return detectFromLines(readJsonLines(path));
}

export function normalizeTranscript(path: string): NormalizedTranscript {
  const lines = readJsonLines(path);
  const host = detectFromLines(lines);
  if (host === "claude") return parseClaudeLines(lines, path);
  if (host === "codex") return parseCodexLines(lines, path);
  throw new Error(
    `无法解析 transcript:${path} 未能识别格式(既不是 claude projects JSONL,也不是 codex rollout JSONL)`,
  );
}
