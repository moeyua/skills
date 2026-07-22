/**
 * Unit tests for the LLM judge: spec extraction, transcript rendering,
 * output schema validation, and the retry/judge-error path with an
 * injected fake model. No real model calls here.
 */

import { describe, it, expect } from "vite-plus/test";
import { join } from "node:path";
import { extractRequirements, loadShapeSpec } from "./spec.ts";
import { renderTranscript, renderTranscriptCapped } from "./render.ts";
import { buildJudgePrompt } from "./prompt.ts";
import { parseJudgeOutput } from "./schema.ts";
import { judgeTranscript } from "./index.ts";
import type { NormalizedTranscript } from "../normalize/events.ts";

const REPO_ROOT = join(import.meta.dirname, "../../..");

function sampleTranscript(): NormalizedTranscript {
  return {
    session: { host: "codex", sessionId: "s1", cwd: "/tmp/x", model: "gpt-5.5" },
    events: [
      { kind: "user-message", turn: 1, timestamp: undefined, text: "/shape 加个导出" },
      {
        kind: "tool-call",
        turn: 1,
        timestamp: undefined,
        name: "exec_command",
        callId: "c1",
        input: { cmd: "ls" },
      },
      {
        kind: "tool-result",
        turn: 1,
        timestamp: undefined,
        callId: "c1",
        output: "x".repeat(5000),
      },
      { kind: "assistant-message", turn: 1, timestamp: undefined, text: "目标用户是谁?" },
      { kind: "user-message", turn: 2, timestamp: undefined, text: "内部运营" },
      {
        kind: "file-write",
        turn: 2,
        timestamp: undefined,
        path: "plans/2026-06-01-feat-export.md",
        tool: "apply_patch",
      },
    ],
    turnCount: 2,
    sourcePath: "/tmp/x.jsonl",
  };
}

describe("extractRequirements", () => {
  it("extracts requirements from the live shape spec without pinning its content", () => {
    // the judge follows spec updates by design — assert structure, not count
    const spec = loadShapeSpec(REPO_ROOT);
    const reqs = extractRequirements(spec);
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    for (const r of reqs) {
      expect(r.name.length).toBeGreaterThan(0);
      expect(r.body.length).toBeGreaterThan(0);
    }
  });

  it("keeps the requirement body attached", () => {
    const reqs = extractRequirements(
      "## Requirements\n\n### Requirement: 甲\n\n必须做甲。\nVerify: manual\n\n### Requirement: 乙\n\n必须做乙。\n",
    );
    expect(reqs).toHaveLength(2);
    expect(reqs[0]?.body).toContain("必须做甲");
  });
});

describe("renderTranscript", () => {
  it("renders turn markers, tool activity, and file writes", () => {
    const text = renderTranscript(sampleTranscript());
    expect(text).toContain("[T1] USER:");
    expect(text).toContain("/shape 加个导出");
    expect(text).toContain("TOOL_CALL exec_command");
    expect(text).toContain("[T2] FILE_WRITE plans/2026-06-01-feat-export.md");
  });

  it("truncates long tool results", () => {
    const text = renderTranscript(sampleTranscript(), { maxToolOutputChars: 200 });
    expect(text).not.toContain("x".repeat(300));
    expect(text).toContain("…(截断");
  });

  it("caps total rendering within a budget while keeping turn markers", () => {
    const t = sampleTranscript();
    const bulky = Array.from({ length: 200 }, (_, i) => ({
      kind: "tool-result" as const,
      turn: 1,
      timestamp: undefined,
      callId: `c${i}`,
      output: "y".repeat(3000),
    }));
    t.events = [...t.events, ...bulky];
    const text = renderTranscriptCapped(t, 50_000);
    expect(text.length).toBeLessThanOrEqual(51_000);
    expect(text).toContain("[T1] USER:");
  });
});

describe("buildJudgePrompt", () => {
  it("embeds the spec, the transcript, and the requirement count", () => {
    const prompt = buildJudgePrompt({
      specText: "### Requirement: 甲\n\n必须做甲。",
      requirementNames: ["甲"],
      renderedTranscript: "[T1] USER: hi",
    });
    expect(prompt).toContain("必须做甲");
    expect(prompt).toContain("[T1] USER: hi");
    expect(prompt).toContain("共 1 条");
    expect(prompt).toContain("比例");
    expect(prompt).toContain("重复确认");
    expect(prompt).toContain("会话结论");
    expect(prompt).toContain("未表达的偏好不等于委托");
    expect(prompt).toContain("显式调用其他 skill");
    expect(prompt).toContain("任何文件写入");
    expect(prompt).not.toContain("named mode");
    expect(prompt).not.toContain("阶段固定为");
  });
});

describe("parseJudgeOutput", () => {
  const names = ["甲", "乙"];
  const valid = JSON.stringify({
    requirements: [
      { requirement: "甲", verdict: "pass", evidenceTurns: [1], reason: "ok" },
      { requirement: "乙", verdict: "n.a.", evidenceTurns: [], reason: "未触发" },
    ],
    score: 8,
    summary: "整体良好",
  });

  it("accepts valid output", () => {
    const v = parseJudgeOutput(valid, names);
    expect(v.score).toBe(8);
    expect(v.requirements[1]?.verdict).toBe("n.a.");
    expect(v).not.toHaveProperty("phases");
  });

  it("tolerates markdown fences around the JSON", () => {
    const v = parseJudgeOutput("```json\n" + valid + "\n```", names);
    expect(v.score).toBe(8);
  });

  it("rejects output missing a requirement", () => {
    const missing = JSON.stringify({
      requirements: [{ requirement: "甲", verdict: "pass", evidenceTurns: [], reason: "" }],
      score: 5,
      summary: "",
    });
    expect(() => parseJudgeOutput(missing, names)).toThrowError(/乙/);
  });

  it("rejects unknown verdicts and out-of-range scores", () => {
    const bad = JSON.stringify({
      requirements: [
        { requirement: "甲", verdict: "maybe", evidenceTurns: [], reason: "" },
        { requirement: "乙", verdict: "pass", evidenceTurns: [], reason: "" },
      ],
      score: 11,
      summary: "",
    });
    expect(() => parseJudgeOutput(bad, names)).toThrowError(/verdict|score/);
  });
});

describe("judgeTranscript with injected model", () => {
  const specText = "### Requirement: 甲\n\n必须做甲。\nVerify: manual\n";
  const goodResponse = JSON.stringify({
    requirements: [{ requirement: "甲", verdict: "pass", evidenceTurns: [1], reason: "ok" }],
    score: 9,
    summary: "遵守良好",
  });

  it("returns ok on first valid response", () => {
    const result = judgeTranscript(sampleTranscript(), {
      specText,
      runModel: () => goodResponse,
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.verdict.score).toBe(9);
      expect(result.attempts).toBe(1);
    }
  });

  it("retries once on invalid output, then succeeds", () => {
    let calls = 0;
    const result = judgeTranscript(sampleTranscript(), {
      specText,
      runModel: () => {
        calls += 1;
        return calls === 1 ? "not json at all" : goodResponse;
      },
    });
    expect(result.status).toBe("ok");
    expect(calls).toBe(2);
  });

  it("marks judge-error after two invalid responses", () => {
    const result = judgeTranscript(sampleTranscript(), {
      specText,
      runModel: () => "garbage",
    });
    expect(result.status).toBe("judge-error");
    if (result.status === "judge-error") {
      expect(result.attempts).toBe(2);
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});
