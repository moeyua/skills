/**
 * Mechanical checker: hard violations that code can judge reliably,
 * so they never depend on LLM-judge discretion.
 *
 * Checks:
 * - shape-write-boundary: files written outside shape's plan output
 * - brainstorm-wrote-plan: plan/design files written in a brainstorm session
 * - plan-placeholder:     plan content carrying intent-level placeholders
 */

import type { NormalizedTranscript, ToolCallEvent } from "../normalize/events.ts";

export type CheckName = "shape-write-boundary" | "brainstorm-wrote-plan" | "plan-placeholder";

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

function invokesAnotherSkill(text: string): boolean {
  const linked = [...text.matchAll(/\[\$([a-z][\w-]*)\]\([^)]+\)/gi)];
  if (linked.some((match) => match[1]?.toLowerCase() !== "shape")) return true;
  const slash = text.trim().match(/^\/([a-z][\w-]*)\b/i);
  return slash !== null && slash[1]?.toLowerCase() !== "shape";
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

export function runChecks(transcript: NormalizedTranscript, opts: CheckOptions = {}): CheckResult {
  const violations: Violation[] = [];
  const { events } = transcript;
  const handoffIndex = events.findIndex(
    (event) => event.kind === "user-message" && invokesAnotherSkill(event.text),
  );
  const shapeEvents = handoffIndex === -1 ? events : events.slice(0, handoffIndex);

  shapeEvents.forEach((e) => {
    if (e.kind !== "file-write") return;
    const isPlan = isPlanPath(e.path);
    const isDesign = isDesignDocPath(e.path);

    if (opts.expectBrainstorm === true && (isPlan || isDesign)) {
      violations.push({
        check: "brainstorm-wrote-plan",
        severity: "hard",
        turn: e.turn,
        evidence: `brainstorm 会话写入了方案文件 ${e.path}(${e.tool})`,
      });
      return;
    }
    if (!isPlan) {
      violations.push({
        check: "shape-write-boundary",
        severity: "hard",
        turn: e.turn,
        evidence: `shape 写入了 plan 之外的文件 ${e.path}(${e.tool})`,
      });
    }
  });

  for (const e of shapeEvents) {
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

  return { violations };
}
