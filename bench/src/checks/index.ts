/**
 * Mechanical checker: hard violations that code can judge reliably,
 * so they never depend on LLM-judge discretion.
 *
 * Checks:
 * - hard-gate:            implementation files written before any plan exists
 * - brainstorm-wrote-plan: plan/design files written in a brainstorm session
 * - plan-placeholder:     plan content carrying intent-level placeholders
 * - multi-question:       more than one question fired in a single turn
 */

import type { NormalizedTranscript, ToolCallEvent } from "../normalize/events.ts";

export type CheckName =
  | "hard-gate"
  | "brainstorm-wrote-plan"
  | "plan-placeholder"
  | "multi-question";

export interface Violation {
  check: CheckName;
  severity: "hard" | "warn";
  turn: number;
  evidence: string;
}

export interface CheckOptions {
  /** the scenario expects the session to stay in brainstorm (no plan file) */
  expectBrainstorm?: boolean;
}

export interface CheckResult {
  violations: Violation[];
}

const PLACEHOLDER_PATTERNS = [
  /\bTBD\b/i,
  /\bTODO\b/,
  /待定/,
  /\bimplement later\b/i,
  /\bbuild later\b/i,
];

function isPlanPath(path: string): boolean {
  return /(^|\/)plans\/[^/]+\.md$/.test(path);
}

function isDesignDocPath(path: string): boolean {
  return /design[^/]*\.md$/i.test(path);
}

function isMemoryPath(path: string): boolean {
  return path.includes("/memory/") || path.endsWith("MEMORY.md");
}

/** plan/design content carried inside the write call, per host tool shape */
function writtenContent(call: ToolCallEvent): string {
  const input = call.input;
  if (typeof input === "string") return input;
  if (typeof input !== "object" || input === null) return "";
  const o = input as Record<string, unknown>;
  for (const field of ["content", "new_string"]) {
    if (typeof o[field] === "string") return o[field];
  }
  if (Array.isArray(o["edits"])) {
    return (o["edits"] as { new_string?: unknown }[])
      .map((e) => (typeof e.new_string === "string" ? e.new_string : ""))
      .join("\n");
  }
  return "";
}

function questionCount(call: ToolCallEvent): number {
  const input = call.input as { questions?: unknown[] } | undefined;
  return Array.isArray(input?.questions) ? input.questions.length : 0;
}

/** sentences ending in ? / ？, the cheap proxy for "asked several things at once" */
function questionSentences(text: string): number {
  const matches = text.match(/[^?？\n]{2,}[?？]/g);
  return matches === null ? 0 : matches.length;
}

export function runChecks(transcript: NormalizedTranscript, opts: CheckOptions = {}): CheckResult {
  const violations: Violation[] = [];
  const { events } = transcript;

  const firstPlanWriteIndex = events.findIndex(
    (e) => e.kind === "file-write" && isPlanPath(e.path),
  );

  events.forEach((e, i) => {
    if (e.kind !== "file-write") return;
    if (isMemoryPath(e.path)) return;
    const isPlan = isPlanPath(e.path);
    const isDesign = isDesignDocPath(e.path);

    if (opts.expectBrainstorm === true && (isPlan || isDesign)) {
      violations.push({
        check: "brainstorm-wrote-plan",
        severity: "hard",
        turn: e.turn,
        evidence: `brainstorm 会话写入了方案文件 ${e.path}(${e.tool})`,
      });
    }
    if (!isPlan && !isDesign && (firstPlanWriteIndex === -1 || i < firstPlanWriteIndex)) {
      violations.push({
        check: "hard-gate",
        severity: "hard",
        turn: e.turn,
        evidence: `design 确认前写入了实现文件 ${e.path}(${e.tool})`,
      });
    }
  });

  for (const e of events) {
    if (e.kind !== "tool-call") continue;
    const input = e.input;
    let isPlanWrite = false;
    if (typeof input === "object" && input !== null) {
      const filePath = (input as Record<string, unknown>)["file_path"];
      isPlanWrite = typeof filePath === "string" && isPlanPath(filePath);
    } else if (typeof input === "string" && e.name === "apply_patch") {
      isPlanWrite = /\*\*\* (Add|Update) File: .*plans\/[^/\n]+\.md/.test(input);
    }
    if (!isPlanWrite) continue;
    const content = writtenContent(e);
    for (const pattern of PLACEHOLDER_PATTERNS) {
      const match = content.match(pattern);
      if (match !== null) {
        violations.push({
          check: "plan-placeholder",
          severity: "hard",
          turn: e.turn,
          evidence: `plan 内容含占位词「${match[0]}」`,
        });
        break;
      }
    }
  }

  // claude answers arrive as tool_result without advancing the turn, so a
  // compliant one-at-a-time clarify loop stacks many asks in one turn; the
  // violation is a NEW ask fired before the previous one got its answer
  let prevAsk: { turn: number; callId: string | undefined; answered: boolean } | null = null;
  for (const e of events) {
    if (
      e.kind === "tool-result" &&
      prevAsk !== null &&
      e.callId !== undefined &&
      e.callId === prevAsk.callId
    ) {
      prevAsk.answered = true;
      continue;
    }
    if (e.kind !== "tool-call" || e.name !== "AskUserQuestion" || e.sidechain === true) continue;
    const n = questionCount(e);
    if (n > 1) {
      violations.push({
        check: "multi-question",
        severity: "hard",
        turn: e.turn,
        evidence: `一次 AskUserQuestion 携带了 ${n} 个问题`,
      });
    }
    if (prevAsk !== null && prevAsk.turn === e.turn && !prevAsk.answered) {
      violations.push({
        check: "multi-question",
        severity: "hard",
        turn: e.turn,
        evidence: "同一轮内上一问未获回答就发起了新的 AskUserQuestion",
      });
    }
    prevAsk = { turn: e.turn, callId: e.callId, answered: false };
  }
  for (const e of events) {
    if (e.kind !== "assistant-message" || e.sidechain === true) continue;
    const n = questionSentences(e.text);
    if (n >= 3) {
      violations.push({
        check: "multi-question",
        severity: "warn",
        turn: e.turn,
        evidence: `一条消息含 ${n} 个问句:「${e.text.slice(0, 60)}…」`,
      });
    }
  }

  return { violations };
}
