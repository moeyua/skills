import { describe, expect, it } from "vite-plus/test";
import type { BenchEvent, NormalizedTranscript } from "../normalize/events.ts";
import { runChecks } from "./index.ts";

function transcript(events: BenchEvent[], turnCount = 3): NormalizedTranscript {
  return {
    session: { host: "claude", sessionId: "test", cwd: "/repo", model: undefined },
    events,
    turnCount,
    sourcePath: "/tmp/test.jsonl",
  };
}

function writeCall(turn: number, path: string): BenchEvent[] {
  return [
    {
      kind: "tool-call",
      turn,
      timestamp: undefined,
      name: "Write",
      callId: "c1",
      input: { file_path: path, content: "content" },
    },
    { kind: "file-write", turn, timestamp: undefined, path, tool: "Write" },
  ];
}

describe("shape-write-boundary", () => {
  it.each([
    "/repo/src/export.ts",
    "/repo/plans/2026-07-21-feat-x.md",
    "/repo/DESIGN.md",
    "/home/u/.claude/projects/x/memory/MEMORY.md",
  ])("flags every file write, including %s", (path) => {
    const hits = runChecks(transcript(writeCall(2, path))).violations.filter(
      (violation) => violation.check === "shape-write-boundary",
    );

    expect(hits).toHaveLength(1);
    expect(hits[0]?.evidence).toContain(path);
  });

  it("stops attributing writes to shape after an explicit user handoff", () => {
    const t = transcript([
      {
        kind: "user-message",
        turn: 2,
        timestamp: undefined,
        text: "[$plan](/home/u/.agents/skills/plan/SKILL.md)",
      },
      ...writeCall(2, "/repo/plans/2026-07-21-feat-x.md"),
    ]);

    expect(runChecks(t).violations).toHaveLength(0);
  });
});

describe("shape-implementation-boundary", () => {
  it("flags an assistant-side implement skill invocation", () => {
    const t = transcript([
      {
        kind: "tool-call",
        turn: 2,
        timestamp: undefined,
        name: "Skill",
        callId: "c2",
        input: { skill: "implement", args: "build it" },
      },
    ]);

    const hits = runChecks(t).violations.filter(
      (violation) => violation.check === "shape-implementation-boundary",
    );
    expect(hits).toHaveLength(1);
  });

  it("allows read-only context tools and explore", () => {
    const t = transcript([
      {
        kind: "tool-call",
        turn: 1,
        timestamp: undefined,
        name: "Read",
        callId: "c1",
        input: { file_path: "/repo/README.md" },
      },
      {
        kind: "tool-call",
        turn: 1,
        timestamp: undefined,
        name: "Skill",
        callId: "c2",
        input: { skill: "explore" },
      },
    ]);

    expect(runChecks(t).violations).toHaveLength(0);
  });

  it("does not mistake a read-only task guard for an implementation request", () => {
    const t = transcript([
      {
        kind: "tool-call",
        turn: 1,
        timestamp: undefined,
        name: "Task",
        callId: "c1",
        input: {
          description: "Inspect the existing implementation",
          prompt: "Read the relevant files and report facts. Do not implement changes.",
        },
      },
    ]);

    expect(runChecks(t).violations).toHaveLength(0);
  });

  it("flags a generic task explicitly delegated to implementation", () => {
    const t = transcript([
      {
        kind: "tool-call",
        turn: 1,
        timestamp: undefined,
        name: "Task",
        callId: "c1",
        input: { prompt: "Implement the approved change and run its tests." },
      },
    ]);

    expect(
      runChecks(t).violations.filter(
        (violation) => violation.check === "shape-implementation-boundary",
      ),
    ).toHaveLength(1);
  });
});

describe("adaptive conversation has no ceremony checker", () => {
  it("allows one question tool carrying a material frontier", () => {
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
});
