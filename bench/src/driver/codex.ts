/**
 * codex CLI driver: full shape session via `codex exec` + `codex exec resume`.
 *
 * shape reaches codex as a user-level skill installed by the skills CLI
 * (~/.agents/skills/shape), invoked the way real sessions invoke it:
 * a markdown link to the SKILL.md plus the intent. Free-text questions are
 * answered by the user-sim; a resume failure aborts the run and keeps the
 * rollout transcript judgeable (per the plan's error contract).
 */

import { spawnSync } from "node:child_process";
import { globSync, mkdtempSync, readFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { prepareFixture } from "./fixture.ts";
import { simulateUser } from "./user-sim.ts";
import { endsWithQuestion, type DriveResult } from "./common.ts";
import type { ScenarioCard } from "../scenario.ts";

export interface CodexDriverOptions {
  model?: string;
  maxTurns?: number;
  runSimModel?: (prompt: string) => string;
  log?: (line: string) => void;
  timeoutMs?: number;
}

function extractSessionId(stdout: string): string {
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || !trimmed.startsWith("{")) continue;
    try {
      const o = JSON.parse(trimmed) as {
        type?: string;
        thread_id?: string;
        session_id?: string;
        payload?: { id?: string };
      };
      // codex exec --json emits {"type":"thread.started","thread_id":"…"};
      // the thread id doubles as the rollout session id for `exec resume`
      if (o.type === "thread.started" && typeof o.thread_id === "string") return o.thread_id;
      if (typeof o.session_id === "string") return o.session_id;
      if (o.type === "session_meta" && typeof o.payload?.id === "string") return o.payload.id;
    } catch {
      continue;
    }
  }
  return "";
}

function findRollout(sessionId: string): string | null {
  const matches = globSync(join(homedir(), ".codex/sessions/**/", `rollout-*${sessionId}.jsonl`));
  return matches[0] ?? null;
}

export function runCodexScenario(
  card: ScenarioCard,
  fixturesRoot: string,
  opts: CodexDriverOptions = {},
): DriveResult {
  const log = opts.log ?? (() => {});
  const maxTurns = opts.maxTurns ?? 30;
  const timeout = opts.timeoutMs ?? 900_000;
  const workDir = prepareFixture(join(fixturesRoot, card.fixture), card.id);
  const scratch = mkdtempSync(join(tmpdir(), `shape-bench-codex-out-`));
  const lastMessageFile = join(scratch, "last-message.txt");

  const skillPath = join(homedir(), ".agents/skills/shape/SKILL.md");
  let prompt = `[$shape](${skillPath}) ${card.initialIntent}`;
  let history = "";
  let sessionId = "";
  let turns = 0;

  const finish = (status: DriveResult["status"], error?: string): DriveResult => {
    const transcriptPath = sessionId === "" ? null : findRollout(sessionId);
    return {
      scenario: card.id,
      host: "codex",
      sessionId,
      transcriptPath: transcriptPath ?? "",
      turns,
      status: transcriptPath === null && status !== "error" ? "error" : status,
      workDir,
      ...(error !== undefined && { error }),
      ...(transcriptPath === null && error === undefined && { error: "找不到 rollout JSONL" }),
    };
  };

  while (turns < maxTurns) {
    turns += 1;
    history += `\n[用户] ${prompt}`;
    // resume rejects -C / -s and follows the process cwd, so pin it via spawnSync cwd
    const args =
      sessionId === ""
        ? [
            "exec",
            "--json",
            "-C",
            workDir,
            "-s",
            "workspace-write",
            "--skip-git-repo-check",
            "-o",
            lastMessageFile,
          ]
        : ["exec", "resume", sessionId, "--json", "--skip-git-repo-check", "-o", lastMessageFile];
    if (opts.model !== undefined) args.push("-m", opts.model);
    args.push(prompt);

    const res = spawnSync("codex", args, {
      cwd: workDir,
      encoding: "utf8",
      input: "",
      timeout,
      maxBuffer: 256 * 1024 * 1024,
    });
    if (res.error !== undefined || res.status !== 0) {
      const detail = res.error !== undefined ? String(res.error) : (res.stderr ?? "").slice(0, 500);
      const phase = sessionId === "" ? "codex exec 启动失败" : "codex exec resume 失败,run 中止";
      return finish("error", `${phase}:${detail}`);
    }
    if (sessionId === "") {
      sessionId = extractSessionId(res.stdout);
      if (sessionId === "") {
        return finish("error", "无法从 codex --json 输出中解析 session id");
      }
    }

    let finalText = "";
    try {
      finalText = readFileSync(lastMessageFile, "utf8");
    } catch {
      finalText = "";
    }
    history += `\n[助手] ${finalText}`;
    log(`  T${turns} 助手:${finalText.slice(0, 80).replaceAll("\n", " ")}`);

    if (!endsWithQuestion(finalText)) {
      return finish("completed");
    }
    prompt = simulateUser({ card, history, question: finalText }, { runModel: opts.runSimModel });
  }
  return finish("timeout");
}
