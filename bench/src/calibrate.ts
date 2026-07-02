/**
 * Gold-case calibration: judge each golden case, compare against the manual
 * grading baseline, report per-requirement direction agreement and score gap.
 *
 * `partial` in manual.json tolerates either pass or fail from the judge —
 * the humans themselves called it half-satisfied. Exit is non-zero on any
 * direction conflict or |score - manualScore| > 1.
 *
 * Usage: node bench/src/calibrate.ts [--repeat N]
 */

import { readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { normalizeTranscript } from "./normalize/index.ts";
import { judgeTranscript, type JudgeResult } from "./judge/index.ts";
import type { NormalizedTranscript } from "./normalize/events.ts";

interface ManualBaseline {
  case: string;
  manualScore: number;
  transcript: { kind: "rollout" | "normalized"; path: string };
  requirements: Record<string, "pass" | "fail" | "partial" | "n.a.">;
  notes?: string;
}

interface CaseOutcome {
  name: string;
  scores: number[];
  conflicts: string[];
  agreements: number;
  compared: number;
}

function expandHome(path: string): string {
  return path.startsWith("~/") ? join(homedir(), path.slice(2)) : path;
}

function loadCaseTranscript(caseDir: string, baseline: ManualBaseline): NormalizedTranscript {
  if (baseline.transcript.kind === "rollout") {
    return normalizeTranscript(expandHome(baseline.transcript.path));
  }
  const raw = readFileSync(join(caseDir, baseline.transcript.path), "utf8");
  return JSON.parse(raw) as NormalizedTranscript;
}

function compareOne(
  baseline: ManualBaseline,
  judge: JudgeResult,
  outcome: CaseOutcome,
  round: number,
): void {
  if (judge.status !== "ok") {
    outcome.conflicts.push(`第 ${round} 次判卷 judge-error:${judge.errors.join(";")}`);
    return;
  }
  outcome.scores.push(judge.verdict.score);
  for (const [name, manual] of Object.entries(baseline.requirements)) {
    const judged = judge.verdict.requirements.find((r) => r.requirement === name);
    if (judged === undefined) {
      outcome.conflicts.push(`第 ${round} 次:judge 未覆盖「${name}」`);
      continue;
    }
    outcome.compared += 1;
    if (manual === "partial") {
      outcome.agreements += 1; // 人工也只判了半对,pass/fail 都算方向一致
      continue;
    }
    if (judged.verdict === manual) {
      outcome.agreements += 1;
    } else {
      outcome.conflicts.push(
        `第 ${round} 次:「${name}」人工=${manual},judge=${judged.verdict}(${judged.reason})`,
      );
    }
  }
}

export function runCalibration(goldenRoot: string, repoRoot: string, repeat: number): number {
  const caseDirs = readdirSync(goldenRoot)
    .filter((d) => d.startsWith("case-"))
    .sort();
  let failed = false;

  for (const dir of caseDirs) {
    const caseDir = join(goldenRoot, dir);
    const baseline = JSON.parse(
      readFileSync(join(caseDir, "manual.json"), "utf8"),
    ) as ManualBaseline;
    const transcript = loadCaseTranscript(caseDir, baseline);
    const outcome: CaseOutcome = {
      name: baseline.case,
      scores: [],
      conflicts: [],
      agreements: 0,
      compared: 0,
    };
    console.log(`\n== ${baseline.case}(人工 ${baseline.manualScore} 分,判 ${repeat} 次)`);
    for (let round = 1; round <= repeat; round++) {
      const judge = judgeTranscript(transcript, { repoRoot });
      compareOne(baseline, judge, outcome, round);
      const last = outcome.scores[outcome.scores.length - 1];
      console.log(`  第 ${round} 次:score=${last ?? "judge-error"}`);
    }
    const scoreGaps = outcome.scores.map((s) => Math.abs(s - baseline.manualScore));
    const maxGap = scoreGaps.length > 0 ? Math.max(...scoreGaps) : Infinity;
    const jitter =
      outcome.scores.length > 1 ? Math.max(...outcome.scores) - Math.min(...outcome.scores) : 0;
    console.log(
      `  逐项方向一致 ${outcome.agreements}/${outcome.compared};分差最大 ${maxGap};判分抖动 ${jitter}`,
    );
    for (const c of outcome.conflicts) console.log(`  ✗ ${c}`);
    if (outcome.conflicts.length > 0 || maxGap > 1) failed = true;
  }
  return failed ? 1 : 0;
}

function main(): void {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: { repeat: { type: "string", default: "1" } },
  });
  const repeat = Number(values.repeat);
  const repoRoot = process.cwd();
  process.exitCode = runCalibration(join(repoRoot, "bench/golden"), repoRoot, repeat);
}

if (process.argv[1]?.endsWith("calibrate.ts") === true) {
  main();
}
