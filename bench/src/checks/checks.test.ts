/**
 * Unit tests for the mechanical checker.
 *
 * Each case builds a minimal in-memory event stream — the checker never
 * touches disk, so violations are asserted against controlled fixtures.
 */

import { describe, it, expect } from "vite-plus/test";
import { runChecks } from "./index.ts";
import type { BenchEvent, NormalizedTranscript } from "../normalize/events.ts";

function transcript(events: BenchEvent[], turnCount = 3): NormalizedTranscript {
  return {
    session: { host: "claude", sessionId: "test", cwd: "/repo", model: undefined },
    events,
    turnCount,
    sourcePath: "/tmp/test.jsonl",
  };
}

function writeCall(turn: number, path: string, content: string): BenchEvent[] {
  return [
    {
      kind: "tool-call",
      turn,
      timestamp: undefined,
      name: "Write",
      callId: "c1",
      input: { file_path: path, content },
    },
    { kind: "file-write", turn, timestamp: undefined, path, tool: "Write" },
  ];
}

describe("shape-write-boundary", () => {
  it("flags implementation file writes before a plan is written", () => {
    const t = transcript([
      ...writeCall(2, "/repo/src/export.ts", "export const x = 1"),
      ...writeCall(3, "/repo/plans/2026-06-01-feat-x.md", "---\nmode: feat\n---"),
    ]);
    const violations = runChecks(t).violations;
    const hits = violations.filter((v) => v.check === "shape-write-boundary");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.turn).toBe(2);
    expect(hits[0]?.evidence).toContain("src/export.ts");
  });

  it("flags implementation writes when no plan is ever written", () => {
    const t = transcript(writeCall(2, "/repo/src/export.ts", "code"));
    expect(runChecks(t).violations.filter((v) => v.check === "shape-write-boundary")).toHaveLength(
      1,
    );
  });

  it("allows plan writes but flags memory writes", () => {
    const t = transcript([
      ...writeCall(1, "/repo/plans/2026-06-01-feat-x.md", "---\nmode: feat\n---"),
      ...writeCall(2, "/home/u/.claude/projects/x/memory/note.md", "note"),
      ...writeCall(2, "/home/u/.claude/projects/x/memory/MEMORY.md", "index"),
    ]);
    const hits = runChecks(t).violations.filter((v) => v.check === "shape-write-boundary");
    expect(hits).toHaveLength(2);
    expect(hits.every((v) => v.evidence.includes("memory"))).toBe(true);
  });

  it("still flags implementation writes after the plan is written", () => {
    const t = transcript([
      ...writeCall(2, "/repo/plans/2026-06-01-feat-x.md", "---\nmode: feat\n---"),
      ...writeCall(3, "/repo/src/export.ts", "code"),
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "shape-write-boundary")).toHaveLength(
      1,
    );
  });

  it("stops attributing writes to shape after an explicit skill handoff", () => {
    const t = transcript([
      ...writeCall(2, "/repo/plans/2026-06-01-feat-x.md", "---\nmode: feat\n---"),
      {
        kind: "user-message",
        turn: 3,
        timestamp: undefined,
        text: "[$implement](/home/u/.agents/skills/implement/SKILL.md)",
      },
      ...writeCall(3, "/repo/src/export.ts", "code"),
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "shape-write-boundary")).toHaveLength(
      0,
    );
  });
});

describe("brainstorm-wrote-plan", () => {
  it("flags plan writes when the session is expected to stay in brainstorm", () => {
    const t = transcript(writeCall(2, "/repo/plans/2026-06-01-feat-x.md", "x"));
    const violations = runChecks(t, { expectBrainstorm: true }).violations;
    const hits = violations.filter((v) => v.check === "brainstorm-wrote-plan");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.evidence).toContain("plans/2026-06-01-feat-x.md");
  });

  it("flags design docs too", () => {
    const t = transcript(writeCall(2, "/repo/docs/design.md", "x"));
    expect(
      runChecks(t, { expectBrainstorm: true }).violations.filter(
        (v) => v.check === "brainstorm-wrote-plan",
      ),
    ).toHaveLength(1);
  });

  it("stays silent outside brainstorm expectation", () => {
    const t = transcript(writeCall(2, "/repo/plans/2026-06-01-feat-x.md", "x"));
    expect(runChecks(t).violations.filter((v) => v.check === "brainstorm-wrote-plan")).toHaveLength(
      0,
    );
  });
});

describe("plan-placeholder", () => {
  it("flags TBD/TODO in plan file content (claude Write)", () => {
    const t = transcript(writeCall(2, "/repo/plans/2026-06-01-feat-x.md", "## Steps\n\n1. TBD"));
    const hits = runChecks(t).violations.filter((v) => v.check === "plan-placeholder");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.evidence).toContain("TBD");
  });

  it("flags placeholders in codex apply_patch plan content", () => {
    const t = transcript([
      {
        kind: "tool-call",
        turn: 2,
        timestamp: undefined,
        name: "apply_patch",
        callId: "c2",
        input:
          "*** Begin Patch\n*** Add File: plans/2026-06-01-feat-x.md\n+## Steps\n+1. 待定\n*** End Patch",
      },
      {
        kind: "file-write",
        turn: 2,
        timestamp: undefined,
        path: "plans/2026-06-01-feat-x.md",
        tool: "apply_patch",
      },
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "plan-placeholder")).toHaveLength(1);
  });

  it("flags placeholders written through MultiEdit", () => {
    const t = transcript([
      {
        kind: "tool-call",
        turn: 2,
        timestamp: undefined,
        name: "MultiEdit",
        callId: "c3",
        input: {
          file_path: "/repo/plans/2026-06-01-feat-x.md",
          edits: [{ old_string: "a", new_string: "## Steps\n1. TODO" }],
        },
      },
      {
        kind: "file-write",
        turn: 2,
        timestamp: undefined,
        path: "/repo/plans/2026-06-01-feat-x.md",
        tool: "MultiEdit",
      },
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "plan-placeholder")).toHaveLength(1);
  });

  it("does not flag clean plan content", () => {
    const t = transcript(
      writeCall(2, "/repo/plans/2026-06-01-feat-x.md", "## Steps\n\n1. build the parser"),
    );
    expect(runChecks(t).violations.filter((v) => v.check === "plan-placeholder")).toHaveLength(0);
  });
});

describe("adaptive conversation has no ceremony checker", () => {
  it("allows a plan without a literal Design Summary marker", () => {
    const t = transcript([
      { kind: "user-message", turn: 1, timestamp: undefined, text: "直接写计划" },
      ...writeCall(1, "/repo/plans/2026-07-21-feat-x.md", "---\nmode: feat\n---"),
    ]);
    expect(runChecks(t).violations).toHaveLength(0);
  });

  it("allows one AskUserQuestion call carrying a material frontier", () => {
    const t = transcript([
      {
        kind: "tool-call",
        turn: 2,
        timestamp: undefined,
        name: "AskUserQuestion",
        callId: "c1",
        input: { questions: [{ question: "A?" }, { question: "B?" }] },
      },
    ]);
    expect(runChecks(t).violations).toHaveLength(0);
  });

  it("allows several user-facing questions in one assistant message", () => {
    const t = transcript([
      {
        kind: "assistant-message",
        turn: 2,
        timestamp: undefined,
        text: "公开链接还是登录后访问?\n链接是否过期?\n是否允许下载?",
      },
    ]);
    expect(runChecks(t).violations).toHaveLength(0);
  });
});
