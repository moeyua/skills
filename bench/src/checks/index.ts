/** Mechanical checks for the selected skill's side-effect boundary. */

import { PUBLIC_SKILLS, type PublicSkill } from "../judge/spec.ts";
import type { NormalizedTranscript, ToolCallEvent } from "../normalize/events.ts";

export type CheckName =
  `${PublicSkill}-${"write-boundary" | "implementation-boundary" | "worktree-evidence"}`;

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
  skill: PublicSkill;
  worktreeChanges?: string[] | undefined;
  worktreeCheckError?: string;
}

export function invokedSkill(text: string): PublicSkill | undefined {
  // Code samples and quotations describe invocations; they do not invoke them.
  const prose = text
    .replace(/```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)/g, "")
    .replace(/^\s*>.*$/gm, "")
    .replace(/`[^`]*`|“[^”]*”|「[^」]*」|『[^』]*』|"[^"\n]*"/g, "");
  const names = [...prose.matchAll(/\[\$([a-z][\w-]*)\]\([^)]+\)/gi)].map((match) =>
    match[1]?.toLowerCase(),
  );
  const slash = prose.trim().match(/^\/([a-z][\w-]*)\b/i);
  if (slash !== null) names.push(slash[1]?.toLowerCase());
  const skills = PUBLIC_SKILLS.filter((skill) => names.includes(skill));
  // Multiple distinct explicit skills do not establish a single action owner.
  return skills.length === 1 ? skills[0] : undefined;
}

/** Explicit user transitions select ownership; agent-generated support calls do not. */
export function ownedEvents(transcript: NormalizedTranscript, skill: PublicSkill) {
  let owner: PublicSkill = skill;
  return transcript.events.filter((event) => {
    if (event.kind === "user-message" && !event.sidechain)
      owner = invokedSkill(event.text) ?? owner;
    return owner === skill;
  });
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

export function runChecks(transcript: NormalizedTranscript, opts: RunCheckOptions): CheckResult {
  const violations: Violation[] = [];
  const warnings: Violation[] = [];
  const { skill } = opts;
  const readOnly = ["shape", "explore", "check", "doctor", "handoff"].includes(skill);
  const skillEvents = ownedEvents(transcript, skill);
  const hasHandoff = skillEvents.length !== transcript.events.length;

  for (const event of skillEvents) {
    if (readOnly && event.kind === "file-write") {
      violations.push({
        check: `${skill}-write-boundary`,
        severity: "hard",
        turn: event.turn,
        evidence: `${skill} 请求写入文件 ${event.path}(${event.tool});此事件证明写入请求，不单独证明落盘成功`,
      });
      continue;
    }
    if (readOnly && event.kind === "tool-call" && invokesImplement(event)) {
      violations.push({
        check: `${skill}-implementation-boundary`,
        severity: "hard",
        turn: event.turn,
        evidence: `${skill} 通过 ${event.name} 调用了 implement`,
      });
    }
  }

  if (opts.worktreeChanges === undefined || opts.worktreeCheckError !== undefined || hasHandoff) {
    warnings.push({
      check: `${skill}-worktree-evidence`,
      severity: "warn",
      turn: transcript.turnCount,
      evidence: `无法核验 fixture 工作树: ${opts.worktreeCheckError ?? (hasHandoff ? "多个能力共享工作树，无法按 owner 分配最终变更" : "未提供工作树证据")}`,
    });
  } else if (
    readOnly &&
    !hasHandoff &&
    opts.worktreeChanges !== undefined &&
    opts.worktreeChanges.length > 0
  ) {
    violations.push({
      check: `${skill}-write-boundary`,
      severity: "hard",
      turn: transcript.turnCount,
      evidence: `${skill} 结束后的 fixture 工作树存在变更: ${opts.worktreeChanges.join("; ")}`,
    });
  }

  return { violations, warnings };
}
