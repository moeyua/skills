/**
 * claude CLI wrapper: single-shot headless call, prompt on stdin.
 *
 * All bench model calls go through the user's existing claude login —
 * no API keys, no runtime SDK dependency (Key decision 4 in the plan).
 * `--bare` skips hooks/plugins so judge calls stay clean and cheap.
 */

import { spawnSync } from "node:child_process";

export interface RunClaudeOptions {
  model?: string;
  timeoutMs?: number;
  effort?: string;
  onModel?: (model: string | null) => void;
}

interface ClaudeEnvelope {
  result?: string;
  is_error?: boolean;
  subtype?: string;
  modelUsage?: Record<string, unknown>;
}

export function runClaudeText(prompt: string, opts: RunClaudeOptions = {}): string {
  const args = ["-p", "--bare", "--output-format", "json"];
  if (opts.model !== undefined) args.push("--model", opts.model);
  if (opts.effort !== undefined) args.push("--effort", opts.effort);
  const res = spawnSync("claude", args, {
    input: prompt,
    encoding: "utf8",
    timeout: opts.timeoutMs ?? 600_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (res.error !== undefined) {
    throw new Error(`claude CLI 调用失败:${String(res.error)}`);
  }
  if (res.status !== 0) {
    throw new Error(`claude CLI 退出码 ${String(res.status)}:${(res.stderr ?? "").slice(0, 500)}`);
  }
  let envelope: ClaudeEnvelope;
  try {
    envelope = JSON.parse(res.stdout) as ClaudeEnvelope;
  } catch {
    throw new Error(`claude CLI 输出不是 JSON envelope:${res.stdout.slice(0, 200)}`);
  }
  if (envelope.is_error === true || typeof envelope.result !== "string") {
    throw new Error(`claude CLI 返回错误(subtype=${envelope.subtype ?? "?"})`);
  }
  const models = Object.keys(envelope.modelUsage ?? {});
  opts.onModel?.(models.length === 1 ? models[0]! : null);
  return envelope.result;
}
