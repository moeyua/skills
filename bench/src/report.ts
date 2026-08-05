/**
 * Reporter: per-session judgement JSON + summary Markdown matrix.
 *
 * The matrix answers the diagnosis question directly: which requirement
 * breaks, in which sessions, on which host.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { NormalizedTranscript, SessionInfo } from "./normalize/events.ts";
import type { CheckResult, Violation } from "./checks/index.ts";
import type { JudgeResult } from "./judge/index.ts";

export interface RunLabel {
  scenarioId: string;
  host: "claude" | "codex";
  run: number;
  driveStatus?: "completed" | "timeout" | "error";
  driveError?: string;
}

export interface SessionReport {
  session: SessionInfo;
  sourcePath: string;
  turnCount: number;
  mechanicalViolations: Violation[];
  mechanicalWarnings: Violation[];
  judge: JudgeResult;
  score: number | null;
  runLabel?: RunLabel;
}

export function buildSessionReport(
  transcript: NormalizedTranscript,
  checks: CheckResult,
  judge: JudgeResult,
  runLabel?: RunLabel,
): SessionReport {
  return {
    session: transcript.session,
    sourcePath: transcript.sourcePath,
    turnCount: transcript.turnCount,
    mechanicalViolations: checks.violations,
    mechanicalWarnings: checks.warnings ?? [],
    judge,
    score: judge.status === "ok" ? judge.verdict.score : null,
    ...(runLabel !== undefined && { runLabel }),
  };
}

function shortLabel(report: SessionReport): string {
  if (report.runLabel !== undefined) {
    const { scenarioId, host, run } = report.runLabel;
    return `${scenarioId}@${host}#${run}`;
  }
  const base = basename(report.sourcePath).replace(/\.jsonl$/, "");
  const tail = base.length > 24 ? `…${base.slice(-20)}` : base;
  return `${report.session.host}:${tail}`;
}

function verdictMark(verdict: "pass" | "fail" | "n.a."): string {
  if (verdict === "pass") return "✓";
  if (verdict === "fail") return "✗";
  return "n.a.";
}

export function renderSummaryMarkdown(
  reports: SessionReport[],
  baseline?: SessionReport[],
): string {
  const lines: string[] = ["# shape bench 判卷汇总", ""];
  const labels = reports.map(shortLabel);

  const requirementNames: string[] = [];
  for (const r of reports) {
    if (r.judge.status !== "ok") continue;
    for (const req of r.judge.verdict.requirements) {
      if (!requirementNames.includes(req.requirement)) requirementNames.push(req.requirement);
    }
  }

  lines.push("## Requirement × 会话矩阵", "");
  lines.push(`| Requirement | ${labels.join(" | ")} |`);
  lines.push(`| --- | ${labels.map(() => "---").join(" | ")} |`);
  for (const name of requirementNames) {
    const cells = reports.map((r) => {
      if (r.judge.status !== "ok") return "judge-error";
      const req = r.judge.verdict.requirements.find((x) => x.requirement === name);
      return req === undefined ? "—" : verdictMark(req.verdict);
    });
    lines.push(`| ${name} | ${cells.join(" | ")} |`);
  }
  const scoreCells = reports.map((r) => (r.score === null ? "judge-error" : String(r.score)));
  lines.push(`| **总分 (0-10)** | ${scoreCells.join(" | ")} |`);
  lines.push("");

  const repeated = new Map<string, SessionReport[]>();
  for (const r of reports) {
    if (r.runLabel === undefined) continue;
    const key = `${r.runLabel.scenarioId}@${r.runLabel.host}`;
    const list = repeated.get(key) ?? [];
    list.push(r);
    repeated.set(key, list);
  }
  const groups = [...repeated.entries()].filter(([, list]) => list.length > 1);
  if (groups.length > 0) {
    lines.push("## 重复运行波动", "");
    lines.push("| 场景@host | 逐次总分 | 波动幅度 |");
    lines.push("| --- | --- | --- |");
    for (const [key, list] of groups) {
      const scores = list.map((r) => r.score);
      const nums = scores.filter((s): s is number => s !== null);
      const jitter = nums.length > 1 ? Math.max(...nums) - Math.min(...nums) : 0;
      lines.push(`| ${key} | ${scores.map((s) => s ?? "judge-error").join(" / ")} | ${jitter} |`);
    }
    lines.push("");
  }

  const abnormal = reports.filter(
    (r) => r.runLabel?.driveStatus !== undefined && r.runLabel.driveStatus !== "completed",
  );
  if (abnormal.length > 0) {
    lines.push("## 驱动异常", "");
    for (const r of abnormal) {
      lines.push(
        `- ${shortLabel(r)}:${r.runLabel?.driveStatus}${r.runLabel?.driveError === undefined ? "" : `(${r.runLabel.driveError})`}`,
      );
    }
    lines.push("");
  }

  if (baseline !== undefined && baseline.length > 0) {
    lines.push(...renderBaselineComparison(reports, baseline));
  }

  lines.push("## 机械检查违规", "");
  let anyViolation = false;
  for (const r of reports) {
    if (r.mechanicalViolations.length === 0) continue;
    anyViolation = true;
    lines.push(`### ${shortLabel(r)}`, "");
    for (const v of r.mechanicalViolations) {
      lines.push(`- [${v.severity}] ${v.check} @T${v.turn}:${v.evidence}`);
    }
    lines.push("");
  }
  if (!anyViolation) lines.push("无。", "");

  lines.push("## 机械证据警告", "");
  let anyWarning = false;
  for (const r of reports) {
    const warnings = r.mechanicalWarnings ?? [];
    if (warnings.length === 0) continue;
    anyWarning = true;
    lines.push(`### ${shortLabel(r)}`, "");
    for (const warning of warnings) {
      lines.push(`- [${warning.severity}] ${warning.check} @T${warning.turn}:${warning.evidence}`);
    }
    lines.push("");
  }
  if (!anyWarning) lines.push("无。", "");

  lines.push("## 各会话摘要", "");
  for (const r of reports) {
    lines.push(`### ${shortLabel(r)}`, "");
    lines.push(`- 来源:\`${r.sourcePath}\``);
    lines.push(`- 轮次:${r.turnCount},模型:${r.session.model ?? "?"}`);
    if (r.judge.status === "ok") {
      lines.push(`- 总分:${r.judge.verdict.score}`);
      lines.push(`- 判语:${r.judge.verdict.summary}`);
      const failed = r.judge.verdict.requirements.filter((x) => x.verdict === "fail");
      for (const f of failed) {
        lines.push(`- ✗ ${f.requirement}(T${f.evidenceTurns.join(",T")}):${f.reason}`);
      }
    } else {
      lines.push(`- judge-error:${r.judge.errors.join(";")}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function writeResults(outRoot: string, reports: SessionReport[]): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = join(outRoot, stamp);
  mkdirSync(dir, { recursive: true });
  for (const r of reports) {
    const name =
      r.runLabel === undefined
        ? basename(r.sourcePath).replace(/\.jsonl$/, "")
        : `${r.runLabel.scenarioId}-${r.runLabel.host}-${r.runLabel.run}`;
    writeFileSync(join(dir, `${name}.json`), JSON.stringify(r, null, 2));
  }
  writeFileSync(join(dir, "report.md"), renderSummaryMarkdown(reports));
  return dir;
}

/** per-requirement fail rate across ok-judged sessions */
export function requirementFailRates(reports: SessionReport[]): Map<string, number> {
  const counts = new Map<string, { fail: number; judged: number }>();
  for (const r of reports) {
    if (r.judge.status !== "ok") continue;
    for (const req of r.judge.verdict.requirements) {
      if (req.verdict === "n.a.") continue;
      const c = counts.get(req.requirement) ?? { fail: 0, judged: 0 };
      c.judged += 1;
      if (req.verdict === "fail") c.fail += 1;
      counts.set(req.requirement, c);
    }
  }
  const rates = new Map<string, number>();
  for (const [name, c] of counts) {
    if (c.judged > 0) rates.set(name, c.fail / c.judged);
  }
  return rates;
}

/**
 * Step-12 consistency check: compare driver-run failure modes against the
 * real-session baseline. A requirement that diverges sharply points at the
 * harness (user-sim / headless distribution shift), not at the skill.
 */
export function renderBaselineComparison(
  reports: SessionReport[],
  baseline: SessionReport[],
): string[] {
  const runRates = requirementFailRates(reports);
  const baseRates = requirementFailRates(baseline);
  const names = [...new Set([...runRates.keys(), ...baseRates.keys()])];
  const lines: string[] = ["## 与真实会话基线对比", ""];
  lines.push("| Requirement | 本次 fail 率 | 基线 fail 率 | 一致性 |");
  lines.push("| --- | --- | --- | --- |");
  const suspects: string[] = [];
  for (const name of names) {
    const run = runRates.get(name);
    const base = baseRates.get(name);
    const fmt = (v: number | undefined) => (v === undefined ? "—" : `${Math.round(v * 100)}%`);
    let verdict = "一致";
    if (run !== undefined && base !== undefined && Math.abs(run - base) >= 0.5) {
      verdict = "显著不一致 → harness 疑点";
      suspects.push(name);
    } else if (run === undefined || base === undefined) {
      verdict = "仅一侧有数据";
    }
    lines.push(`| ${name} | ${fmt(run)} | ${fmt(base)} | ${verdict} |`);
  }
  lines.push("");
  if (suspects.length > 0) {
    lines.push(`显著不一致项(优先怀疑 harness 而非 skill):${suspects.join("、")}。`, "");
  } else {
    lines.push("驱动器失败模式分布与真实基线无显著背离。", "");
  }
  return lines;
}

export function loadReportsFromDir(dir: string): SessionReport[] {
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as SessionReport);
}
