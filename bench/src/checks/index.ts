/** Mechanical checks for shape's side-effect boundary. */

import type { NormalizedTranscript, ToolCallEvent } from "../normalize/events.ts";

export type CheckName =
  | "shape-write-boundary"
  | "shape-implementation-boundary"
  | "shape-worktree-evidence";

export interface Violation {
  check: CheckName;
  severity: "hard" | "warn";
  turn: number;
  evidence: string;
}

export interface CheckResult {
  violations: Violation[];
  warnings?: Violation[];
}

export interface RunCheckOptions {
  worktreeChanges?: string[] | undefined;
  worktreeCheckError?: string;
}

function invokesAnotherSkill(text: string): boolean {
  const linked = [...text.matchAll(/\[\$([a-z][\w-]*)\]\([^)]+\)/gi)];
  if (linked.some((match) => match[1]?.toLowerCase() !== "shape")) return true;
  const slash = text.trim().match(/^\/([a-z][\w-]*)\b/i);
  return slash !== null && slash[1]?.toLowerCase() !== "shape";
}

function invokesImplement(call: ToolCallEvent): boolean {
  const dispatcher = call.name.toLowerCase();
  if (!/(?:skill|task|agent)/.test(dispatcher)) return false;

  if (typeof call.input === "object" && call.input !== null) {
    const fields = call.input as Record<string, unknown>;
    for (const key of ["skill", "subagent_type", "agent_type"]) {
      if (typeof fields[key] === "string" && fields[key].trim().toLowerCase() === "implement") {
        return true;
      }
    }
  }

  const input = typeof call.input === "string" ? call.input : JSON.stringify(call.input ?? {});
  if (/(?:\$implement\b|\/implement\b|skills\/implement\/SKILL\.md)/i.test(input)) return true;

  const withoutGuards = input
    .replace(/\b(?:do not|don't|never)\s+implement\b/gi, "")
    .replace(/\bwithout\s+implementing\b/gi, "");
  return /(?:^|["'\n:]\s*)(?:please\s+)?implement\b/i.test(withoutGuards);
}

export function runChecks(
  transcript: NormalizedTranscript,
  opts: RunCheckOptions = {},
): CheckResult {
  const violations: Violation[] = [];
  const warnings: Violation[] = [];
  const handoffIndex = transcript.events.findIndex(
    (event) => event.kind === "user-message" && invokesAnotherSkill(event.text),
  );
  const shapeEvents =
    handoffIndex === -1 ? transcript.events : transcript.events.slice(0, handoffIndex);

  for (const event of shapeEvents) {
    if (event.kind === "file-write") {
      violations.push({
        check: "shape-write-boundary",
        severity: "hard",
        turn: event.turn,
        evidence: `shape 写入了文件 ${event.path}(${event.tool})`,
      });
      continue;
    }
    if (event.kind === "tool-call" && invokesImplement(event)) {
      violations.push({
        check: "shape-implementation-boundary",
        severity: "hard",
        turn: event.turn,
        evidence: `shape 通过 ${event.name} 调用了 implement`,
      });
    }
  }

  if (opts.worktreeCheckError !== undefined) {
    warnings.push({
      check: "shape-worktree-evidence",
      severity: "warn",
      turn: transcript.turnCount,
      evidence: `无法核验 fixture 工作树: ${opts.worktreeCheckError}`,
    });
  } else if (
    handoffIndex === -1 &&
    opts.worktreeChanges !== undefined &&
    opts.worktreeChanges.length > 0
  ) {
    violations.push({
      check: "shape-write-boundary",
      severity: "hard",
      turn: transcript.turnCount,
      evidence: `shape 结束后的 fixture 工作树存在变更: ${opts.worktreeChanges.join("; ")}`,
    });
  }

  return { violations, warnings };
}
