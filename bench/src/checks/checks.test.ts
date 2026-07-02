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

describe("hard-gate: implementation writes before a plan exists", () => {
  it("flags implementation file writes before the plan is written", () => {
    const t = transcript([
      ...writeCall(2, "/repo/src/export.ts", "export const x = 1"),
      ...writeCall(3, "/repo/plans/2026-06-01-feat-x.md", "---\nmode: feat\n---"),
    ]);
    const violations = runChecks(t).violations;
    const hits = violations.filter((v) => v.check === "hard-gate");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.turn).toBe(2);
    expect(hits[0]?.evidence).toContain("src/export.ts");
  });

  it("flags implementation writes when no plan is ever written", () => {
    const t = transcript(writeCall(2, "/repo/src/export.ts", "code"));
    expect(runChecks(t).violations.filter((v) => v.check === "hard-gate")).toHaveLength(1);
  });

  it("does not flag plan or memory writes", () => {
    const t = transcript([
      ...writeCall(1, "/repo/plans/2026-06-01-feat-x.md", "---\nmode: feat\n---"),
      ...writeCall(2, "/home/u/.claude/projects/x/memory/note.md", "note"),
      ...writeCall(2, "/home/u/.claude/projects/x/memory/MEMORY.md", "index"),
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "hard-gate")).toHaveLength(0);
  });

  it("does not flag implementation writes after the plan is written", () => {
    const t = transcript([
      ...writeCall(2, "/repo/plans/2026-06-01-feat-x.md", "---\nmode: feat\n---"),
      ...writeCall(3, "/repo/src/export.ts", "code"),
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "hard-gate")).toHaveLength(0);
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

describe("multi-question", () => {
  it("flags a single AskUserQuestion carrying multiple questions", () => {
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
    const hits = runChecks(t).violations.filter((v) => v.check === "multi-question");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.severity).toBe("hard");
  });

  it("flags multiple AskUserQuestion calls within one turn", () => {
    const t = transcript([
      {
        kind: "tool-call",
        turn: 2,
        timestamp: undefined,
        name: "AskUserQuestion",
        callId: "c1",
        input: { questions: [{ question: "A?" }] },
      },
      {
        kind: "tool-call",
        turn: 2,
        timestamp: undefined,
        name: "AskUserQuestion",
        callId: "c2",
        input: { questions: [{ question: "B?" }] },
      },
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "multi-question")).toHaveLength(1);
  });

  it("does not flag sequential one-at-a-time asks answered in between", () => {
    // claude answers arrive as tool_result and never advance the turn, so a
    // spec-compliant clarify loop keeps many asks inside one turn
    const t = transcript([
      {
        kind: "tool-call",
        turn: 1,
        timestamp: undefined,
        name: "AskUserQuestion",
        callId: "c1",
        input: { questions: [{ question: "A?" }] },
      },
      {
        kind: "tool-result",
        turn: 1,
        timestamp: undefined,
        callId: "c1",
        output: "User selected: 甲",
      },
      {
        kind: "tool-call",
        turn: 1,
        timestamp: undefined,
        name: "AskUserQuestion",
        callId: "c2",
        input: { questions: [{ question: "B?" }] },
      },
      {
        kind: "tool-result",
        turn: 1,
        timestamp: undefined,
        callId: "c2",
        output: "User selected: 乙",
      },
      {
        kind: "tool-call",
        turn: 1,
        timestamp: undefined,
        name: "AskUserQuestion",
        callId: "c3",
        input: { questions: [{ question: "C?" }] },
      },
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "multi-question")).toHaveLength(0);
  });

  it("warns on an assistant message asking several questions at once", () => {
    const t = transcript([
      {
        kind: "assistant-message",
        turn: 2,
        timestamp: undefined,
        text: "目标用户是谁?\n预算多少?\n上线时间呢?",
      },
    ]);
    const hits = runChecks(t).violations.filter((v) => v.check === "multi-question");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.severity).toBe("warn");
  });

  it("counts fullwidth question marks (U+FF1F) too", () => {
    const q = "？";
    const t = transcript([
      {
        kind: "assistant-message",
        turn: 2,
        timestamp: undefined,
        text: `目标用户是谁${q}\n预算多少${q}\n上线时间呢${q}`,
      },
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "multi-question")).toHaveLength(1);
  });

  it("does not flag one question per turn", () => {
    const t = transcript([
      {
        kind: "tool-call",
        turn: 2,
        timestamp: undefined,
        name: "AskUserQuestion",
        callId: "c1",
        input: { questions: [{ question: "A?" }] },
      },
      { kind: "user-message", turn: 3, timestamp: undefined, text: "答 A" },
      {
        kind: "assistant-message",
        turn: 3,
        timestamp: undefined,
        text: "明白了。那接下来只剩一个问题:成功标准是什么?",
      },
    ]);
    expect(runChecks(t).violations.filter((v) => v.check === "multi-question")).toHaveLength(0);
  });
});
