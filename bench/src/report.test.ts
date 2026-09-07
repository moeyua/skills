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
import { unknownExecution } from "./identity.ts";
import type { JudgeResult } from "./judge/index.ts";

function transcript(id: string): NormalizedTranscript {
  return {
    session: { host: "codex", sessionId: id, cwd: "/tmp/x", model: "gpt-5.5" },
    events: [],
    turnCount: 12,
    sourcePath: `/sessions/${id}.jsonl`,
  };
}

const judgeIdentity = {
  skill: "shape" as const,
  specHash: "spec",
  rubricHash: "rubric",
  modelRequested: "judge",
  modelObserved: "judge",
  effort: "high",
  effortRequested: "high",
  runner: "injected",
};

function comparable(report: SessionReport): SessionReport {
  report.identity = {
    ...unknownExecution(),
    source: {
      root: "/source",
      installedPath: "/installed",
      hash: "source",
      installedHash: "source",
    },
    loadEvidence: "read",
    effortObserved: "high",
    toolEnvironment: "test",
    scenarioHash: "scenario",
    fixtureHash: "fixture",
  };
  return report;
}

function okJudge(score: number, verdicts: [string, "pass" | "fail" | "n.a."][]): JudgeResult {
  return {
    identity: judgeIdentity,
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

  it("reports unavailable mechanical evidence as a warning, not a violation", () => {
    const report = buildSessionReport(
      transcript("warning"),
      {
        violations: [],
        warnings: [
          {
            check: "shape-worktree-evidence",
            severity: "warn",
            turn: 12,
            evidence: "fixture unavailable",
          },
        ],
      },
      okJudge(8, [["甲", "pass"]]),
    );
    expect(report.mechanicalViolations).toHaveLength(0);
    expect(report.mechanicalWarnings).toHaveLength(1);
    const markdown = renderSummaryMarkdown([report]);
    expect(markdown).toContain("机械检查违规\n\n无。");
    expect(markdown).toContain("机械证据警告");
    expect(markdown).toContain("fixture unavailable");
  });

  it("carries judge-error with a null score", () => {
    const report = buildSessionReport(
      transcript("s2"),
      { violations: [] },
      {
        identity: judgeIdentity,
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
    const md = renderSummaryMarkdown([comparable(r1), comparable(r2)]);
    expect(md).toContain("| shape / 甲 |");
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
        identity: judgeIdentity,
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
    const md = renderSummaryMarkdown([comparable(r1), comparable(r2)]);
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
    expect(rates.get("shape / 甲")).toBe(0.5);
    expect(rates.get("shape / 乙")).toBe(0);
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
    const lines = renderBaselineComparison(run.map(comparable), base.map(comparable)).join("\n");
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
    const lines = renderBaselineComparison(run.map(comparable), base.map(comparable)).join("\n");
    expect(lines).toContain("无显著背离");
  });
});

describe("comparison identity", () => {
  it("isolates identical requirement names across skills", () => {
    const shape = comparable(
      buildSessionReport(transcript("a"), { violations: [] }, okJudge(8, [["甲", "pass"]])),
    );
    const implement = { ...shape, skill: "implement" as const };
    const rates = requirementFailRates([shape, implement]);
    expect([...rates.keys()]).toEqual(["shape / 甲", "implement / 甲"]);
    const markdown = renderSummaryMarkdown([shape, implement]);
    expect(markdown).toContain("| shape / 甲 | ✓ | — |");
    expect(markdown).toContain("| implement / 甲 | — | ✓ |");
  });
  it.each(["rubric", "model", "effort", "missing", "tools", "config"])(
    "does not compare mismatched %s evidence",
    (field) => {
      const current = comparable(
        buildSessionReport(transcript("current"), { violations: [] }, okJudge(8, [["甲", "pass"]])),
      );
      const baseline = structuredClone(current);
      if (field === "rubric") baseline.judge.identity.rubricHash = "old-rubric";
      if (field === "model") baseline.session.model = "different-model";
      if (field === "effort") baseline.identity.effortObserved = "low";
      if (field === "missing") baseline.identity.loadEvidence = null;
      if (field === "tools") {
        baseline.identity.toolEnvironment = null;
        baseline.identity.toolEnvironmentDetails = {
          host: "codex",
          version: "known",
          node: "known",
          platform: "known",
          settings: "user",
          toolsObserved: null,
        };
      }
      if (field === "config")
        baseline.identity.toolEnvironment = "different-user-config-mcp-permissions";
      const text = renderBaselineComparison([current], [baseline]).join("\n");
      expect(text).toContain("不可比");
      expect(text).not.toContain("无显著背离");
    },
  );
});
