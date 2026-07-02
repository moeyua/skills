/**
 * bench CLI. Subcommands:
 *   judge <transcript.jsonl...>  — normalize + check + LLM-judge existing sessions
 *   run [--scenario id] [--host claude|codex] [--repeat N] [--baseline dir]
 *                                — drive scenarios end to end, then judge
 *
 * Unrecognized files are reported with path and reason; remaining valid files
 * still get judged; any error makes the exit code non-zero.
 */

import { parseArgs } from "node:util";
import { join } from "node:path";
import { existsSync, writeFileSync } from "node:fs";
import { normalizeTranscript } from "./normalize/index.ts";
import { runChecks } from "./checks/index.ts";
import { judgeTranscript, type JudgeOptions } from "./judge/index.ts";
import {
  buildSessionReport,
  loadReportsFromDir,
  renderSummaryMarkdown,
  writeResults,
  type SessionReport,
} from "./report.ts";
import { loadScenarios, type ScenarioCard } from "./scenario.ts";
import { runClaudeScenario } from "./driver/claude.ts";
import { runCodexScenario } from "./driver/codex.ts";
import { collectTranscript, type DriveResult } from "./driver/common.ts";

export interface JudgeCommandOptions {
  repoRoot?: string;
  outRoot?: string;
  expectBrainstorm?: boolean;
  runModel?: (prompt: string) => string;
  model?: string;
  log?: (line: string) => void;
}

export interface JudgeCommandResult {
  exitCode: number;
  reports: SessionReport[];
  failures: { path: string; error: string }[];
  outDir: string | null;
}

export function runJudgeCommand(
  paths: string[],
  opts: JudgeCommandOptions = {},
): JudgeCommandResult {
  const log = opts.log ?? console.log;
  const repoRoot = opts.repoRoot ?? process.cwd();
  const outRoot = opts.outRoot ?? join(repoRoot, "bench/results");
  const reports: SessionReport[] = [];
  const failures: { path: string; error: string }[] = [];

  if (paths.length === 0) {
    log("用法:pnpm bench:judge <transcript.jsonl...>");
    return { exitCode: 1, reports, failures, outDir: null };
  }

  for (const path of paths) {
    let transcript;
    try {
      transcript = normalizeTranscript(path);
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : String(cause);
      failures.push({ path, error });
      log(`✗ ${path}:${error}`);
      continue;
    }
    log(`判卷中:${path}(${transcript.session.host},${transcript.turnCount} 轮)…`);
    const checks = runChecks(transcript, { expectBrainstorm: opts.expectBrainstorm });
    const judgeOpts: JudgeOptions = { repoRoot, runModel: opts.runModel, model: opts.model };
    const judge = judgeTranscript(transcript, judgeOpts);
    const report = buildSessionReport(transcript, checks, judge);
    reports.push(report);
    log(
      judge.status === "ok"
        ? `  → 总分 ${judge.verdict.score},机械违规 ${checks.violations.length} 项`
        : `  → judge-error:${judge.errors.join(";")}`,
    );
  }

  let outDir: string | null = null;
  if (reports.length > 0) {
    outDir = writeResults(outRoot, reports);
    log(`结果已写入 ${outDir}`);
  }

  const hasJudgeError = reports.some((r) => r.judge.status === "judge-error");
  const exitCode = failures.length > 0 || hasJudgeError ? 1 : 0;
  return { exitCode, reports, failures, outDir };
}

function main(): void {
  const { positionals, values } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      brainstorm: { type: "boolean", default: false },
      model: { type: "string" },
      scenario: { type: "string" },
      host: { type: "string" },
      repeat: { type: "string", default: "1" },
      baseline: { type: "string" },
      "max-turns": { type: "string", default: "30" },
    },
  });
  const [command, ...rest] = positionals;
  if (command === "judge") {
    const result = runJudgeCommand(rest, {
      expectBrainstorm: values.brainstorm,
      model: values.model,
    });
    process.exitCode = result.exitCode;
    return;
  }
  if (command === "run") {
    void runRunCommand({
      scenario: values.scenario,
      host: values.host,
      repeat: Number(values.repeat),
      baselineDir: values.baseline,
      maxTurns: Number(values["max-turns"]),
      model: values.model,
    }).then((code) => {
      process.exitCode = code;
    });
    return;
  }
  console.error(`未知子命令:${command ?? "(空)"}。可用:judge / run`);
  process.exitCode = 1;
}

interface RunCommandOptions {
  scenario?: string;
  host?: string;
  repeat: number;
  baselineDir?: string;
  maxTurns: number;
  model?: string;
}

const HOSTS = ["claude", "codex"] as const;

async function runRunCommand(opts: RunCommandOptions): Promise<number> {
  const repoRoot = process.cwd();
  const scenariosDir = join(repoRoot, "bench/scenarios");
  const fixturesRoot = join(repoRoot, "bench/fixtures");
  const outRoot = join(repoRoot, "bench/results");

  if (opts.host !== undefined && !HOSTS.includes(opts.host as (typeof HOSTS)[number])) {
    console.error(`--host 只接受 claude / codex,收到:${opts.host}`);
    return 1;
  }
  if (opts.baselineDir !== undefined && !existsSync(opts.baselineDir)) {
    console.error(`--baseline 目录不存在:${opts.baselineDir}`);
    return 1;
  }
  let cards: ScenarioCard[];
  try {
    cards = loadScenarios(scenariosDir, fixturesRoot);
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : String(cause));
    return 1;
  }
  const allIds = cards.map((c) => c.id);
  if (opts.scenario !== undefined) {
    cards = cards.filter((c) => c.id === opts.scenario);
    if (cards.length === 0) {
      console.error(`--scenario 未匹配任何场景卡:${opts.scenario}(可用:${allIds.join("、")})`);
      return 1;
    }
  }
  const hosts = opts.host === undefined ? [...HOSTS] : [opts.host as (typeof HOSTS)[number]];

  const reports: SessionReport[] = [];
  const archives: DriveResult[] = [];
  let anyRunError = false;

  for (const card of cards) {
    for (const host of hosts) {
      for (let run = 1; run <= opts.repeat; run++) {
        console.log(`▶ ${card.id} @ ${host} #${run}(mode 期望:${card.mode})`);
        let drive: DriveResult;
        try {
          drive =
            host === "claude"
              ? await runClaudeScenario(card, fixturesRoot, {
                  maxTurns: opts.maxTurns,
                  model: opts.model,
                  log: console.log,
                })
              : runCodexScenario(card, fixturesRoot, {
                  maxTurns: opts.maxTurns,
                  model: opts.model,
                  log: console.log,
                });
        } catch (cause) {
          anyRunError = true;
          console.log(`  ✗ 驱动异常:${cause instanceof Error ? cause.message : String(cause)}`);
          continue;
        }
        if (drive.status === "error") anyRunError = true;
        console.log(
          `  驱动结束:${drive.status},${drive.turns} 轮,session=${drive.sessionId}${drive.error === undefined ? "" : `,错误:${drive.error}`}`,
        );
        if (drive.transcriptPath === "") continue;

        let transcript;
        try {
          transcript = normalizeTranscript(drive.transcriptPath);
        } catch (cause) {
          anyRunError = true;
          console.log(
            `  ✗ transcript 解析失败:${cause instanceof Error ? cause.message : String(cause)}`,
          );
          continue;
        }
        const checks = runChecks(transcript, { expectBrainstorm: card.mode === "brainstorm" });
        const judge = judgeTranscript(transcript, {
          repoRoot,
          scenarioNote: `这是驱动器场景「${card.title}」(期望 mode:${card.mode})。用户由模拟器扮演,初始意图:${card.initialIntent}`,
        });
        reports.push(
          buildSessionReport(transcript, checks, judge, {
            scenarioId: card.id,
            host,
            run,
            driveStatus: drive.status,
            ...(drive.error !== undefined && { driveError: drive.error }),
          }),
        );
        archives.push(drive);
        const last = reports.at(-1);
        console.log(
          last?.judge.status === "ok"
            ? `  → 总分 ${String(last.score)},机械违规 ${last.mechanicalViolations.length} 项`
            : `  → judge-error`,
        );
      }
    }
  }

  if (reports.length === 0) {
    console.error("没有任何可判卷的 run。");
    return 1;
  }
  const outDir = writeResults(outRoot, reports);
  // archive raw transcripts next to the verdicts — sourcePath points into
  // ~/.claude / ~/.codex, which the user may clean up at any time
  for (const d of archives) {
    try {
      collectTranscript(d, outDir);
    } catch (cause) {
      console.error(
        `transcript 归档失败:${d.transcriptPath}(${cause instanceof Error ? cause.message : String(cause)})`,
      );
    }
  }
  if (opts.baselineDir !== undefined) {
    const baseline = loadReportsFromDir(opts.baselineDir);
    writeFileSync(join(outDir, "report.md"), renderSummaryMarkdown(reports, baseline));
  }
  console.log(`结果已写入 ${outDir}`);
  const hasJudgeError = reports.some((r) => r.judge.status === "judge-error");
  return anyRunError || hasJudgeError ? 1 : 0;
}

if (process.argv[1]?.endsWith("cli.ts") === true) {
  main();
}
