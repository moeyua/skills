/**
 * Unit tests for the judge CLI command: mixed valid/invalid inputs must judge
 * the valid ones, report the invalid ones with reasons, and exit non-zero.
 * The model is injected; the spec comes from a temp repo root.
 */

import { describe, it, expect } from "vite-plus/test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runJudgeCommand } from "./cli.ts";

const CLAUDE_SAMPLE = join(import.meta.dirname, "normalize/samples/claude-sample.jsonl");

const SPEC = `# Shape Specification

## Requirements

### Requirement: 甲

必须做甲。
Verify: manual(integration)
`;

const GOOD_RESPONSE = JSON.stringify({
  phases: [{ phase: "clarify", turns: [1, 2], notes: "" }],
  requirements: [{ requirement: "甲", verdict: "pass", evidenceTurns: [1], reason: "ok" }],
  score: 8,
  summary: "ok",
});

function tempRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "bench-cli-"));
  mkdirSync(join(dir, "specs/shape"), { recursive: true });
  writeFileSync(join(dir, "specs/shape/spec.md"), SPEC);
  return dir;
}

describe("runJudgeCommand", () => {
  it("judges valid files, reports invalid ones, and exits non-zero", () => {
    const repoRoot = tempRepo();
    const badFile = join(repoRoot, "weird.jsonl");
    writeFileSync(badFile, `{"foo":1}\n`);
    const logs: string[] = [];
    try {
      const result = runJudgeCommand([CLAUDE_SAMPLE, badFile], {
        repoRoot,
        outRoot: join(repoRoot, "results"),
        runModel: () => GOOD_RESPONSE,
        log: (l) => logs.push(l),
      });
      expect(result.exitCode).toBe(1);
      expect(result.reports).toHaveLength(1);
      expect(result.reports[0]?.score).toBe(8);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0]?.error).toContain("未能识别");
      expect(result.outDir).not.toBeNull();
      if (result.outDir !== null) {
        expect(existsSync(join(result.outDir, "report.md"))).toBe(true);
        expect(readdirSync(result.outDir).some((f) => f.endsWith(".json"))).toBe(true);
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("exits zero when every file judges cleanly", () => {
    const repoRoot = tempRepo();
    try {
      const result = runJudgeCommand([CLAUDE_SAMPLE], {
        repoRoot,
        outRoot: join(repoRoot, "results"),
        runModel: () => GOOD_RESPONSE,
        log: () => {},
      });
      expect(result.exitCode).toBe(0);
      expect(result.failures).toHaveLength(0);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("exits non-zero with usage when no paths are given", () => {
    const logs: string[] = [];
    const result = runJudgeCommand([], { log: (l) => logs.push(l) });
    expect(result.exitCode).toBe(1);
    expect(logs.join("\n")).toContain("用法");
  });
});
