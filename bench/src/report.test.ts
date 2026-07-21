/**
 * Unit tests for the reporter: per-session JSON shape and the
 * session × requirement summary matrix.
 */

import { describe, it, expect } from "vite-plus/test";
import {
  buildSessionReport,
  renderSummaryMarkdown,
  renderBaselineComparison,
  requirementFailRates,
  type SessionReport,
} from "./report.ts";
import type { NormalizedTranscript } from "./normalize/events.ts";
import type { JudgeResult } from "./judge/index.ts";

function transcript(id: string): NormalizedTranscript {
  return {
    session: { host: "codex", sessionId: id, cwd: "/tmp/x", model: "gpt-5.5" },
    events: [],
    turnCount: 12,
    sourcePath: `/sessions/${id}.jsonl`,
  };
}

function okJudge(score: number, verdicts: [string, "pass" | "fail" | "n.a."][]): JudgeResult {
  return {
    status: "ok",
    attempts: 1,
    rawResponse: "{}",
    verdict: {
      requirements: verdicts.map(([requirement, verdict]) => ({
        requirement,
        verdict,
        evidenceTurns: [2],
        reason: "r",
      })),
      score,
      summary: "s",
    },
  };
}

describe("buildSessionReport", () => {
  it("combines session, checks, and judge verdict", () => {
    const report = buildSessionReport(
      transcript("s1"),
      {
        violations: [
          {
            check: "shape-write-boundary",
            severity: "hard",
            turn: 3,
            evidence: "写了 src/x.ts",
          },
        ],
      },
      okJudge(6, [["甲", "pass"]]),
    );
    expect(report.session.sessionId).toBe("s1");
    expect(report.turnCount).toBe(12);
    expect(report.mechanicalViolations).toHaveLength(1);
    expect(report.judge.status).toBe("ok");
    expect(report.score).toBe(6);
  });

  it("carries judge-error with a null score", () => {
    const report = buildSessionReport(
      transcript("s2"),
      { violations: [] },
      {
        status: "judge-error",
        errors: ["bad json"],
        attempts: 2,
        rawResponse: "x",
      },
    );
    expect(report.score).toBeNull();
    expect(report.judge.status).toBe("judge-error");
  });
});

describe("renderSummaryMarkdown", () => {
  it("renders a requirement × session matrix with scores and violations", () => {
    const r1 = buildSessionReport(
      transcript("session-aaa"),
      { violations: [] },
      okJudge(8, [
        ["甲", "pass"],
        ["乙", "fail"],
      ]),
    );
    const r2 = buildSessionReport(
      transcript("session-bbb"),
      {
        violations: [
          {
            check: "shape-write-boundary",
            severity: "hard",
            turn: 2,
            evidence: "写了 src/x.ts",
          },
        ],
      },
      okJudge(6, [
        ["甲", "n.a."],
        ["乙", "pass"],
      ]),
    );
    const md = renderSummaryMarkdown([r1, r2]);
    expect(md).toContain("| 甲 |");
    expect(md).toContain("✓");
    expect(md).toContain("✗");
    expect(md).toContain("n.a.");
    expect(md).toContain("8");
    expect(md).toContain("shape-write-boundary");
  });

  it("marks judge-error sessions in the matrix", () => {
    const bad: SessionReport = buildSessionReport(
      transcript("s3"),
      { violations: [] },
      {
        status: "judge-error",
        errors: ["x"],
        attempts: 2,
        rawResponse: "",
      },
    );
    const md = renderSummaryMarkdown([bad]);
    expect(md).toContain("judge-error");
  });

  it("shows per-run scores and jitter for repeated runs", () => {
    const r1 = buildSessionReport(
      transcript("r1"),
      { violations: [] },
      okJudge(8, [["甲", "pass"]]),
      { scenarioId: "feat-x", host: "codex", run: 1, driveStatus: "completed" },
    );
    const r2 = buildSessionReport(
      transcript("r2"),
      { violations: [] },
      okJudge(6.5, [["甲", "fail"]]),
      { scenarioId: "feat-x", host: "codex", run: 2, driveStatus: "completed" },
    );
    const md = renderSummaryMarkdown([r1, r2]);
    expect(md).toContain("重复运行波动");
    expect(md).toContain("feat-x@codex");
    expect(md).toContain("8 / 6.5");
    expect(md).toContain("1.5");
  });
});

describe("requirementFailRates", () => {
  it("computes fail rates ignoring n.a.", () => {
    const r1 = buildSessionReport(
      transcript("a"),
      { violations: [] },
      okJudge(8, [
        ["甲", "fail"],
        ["乙", "n.a."],
      ]),
    );
    const r2 = buildSessionReport(
      transcript("b"),
      { violations: [] },
      okJudge(7, [
        ["甲", "pass"],
        ["乙", "pass"],
      ]),
    );
    const rates = requirementFailRates([r1, r2]);
    expect(rates.get("甲")).toBe(0.5);
    expect(rates.get("乙")).toBe(0);
  });
});

describe("renderBaselineComparison", () => {
  it("flags sharply diverging requirements as harness suspects", () => {
    const run = [
      buildSessionReport(transcript("x"), { violations: [] }, okJudge(5, [["甲", "fail"]]), {
        scenarioId: "s",
        host: "claude",
        run: 1,
      }),
    ];
    const base = [
      buildSessionReport(transcript("y"), { violations: [] }, okJudge(8, [["甲", "pass"]])),
    ];
    const lines = renderBaselineComparison(run, base).join("\n");
    expect(lines).toContain("与真实会话基线对比");
    expect(lines).toContain("harness 疑点");
    expect(lines).toContain("甲");
  });

  it("reports consistency when distributions agree", () => {
    const run = [
      buildSessionReport(transcript("x"), { violations: [] }, okJudge(8, [["甲", "pass"]])),
    ];
    const base = [
      buildSessionReport(transcript("y"), { violations: [] }, okJudge(8, [["甲", "pass"]])),
    ];
    const lines = renderBaselineComparison(run, base).join("\n");
    expect(lines).toContain("无显著背离");
  });
});
