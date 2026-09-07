/**
 * Shared driver types and helpers for both host adapters.
 */

import { copyFileSync, cpSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

import { execFileSync } from "node:child_process";
import { hashTree, hashText, toolVersion, type ExecutionIdentity } from "../identity.ts";
import type { ScenarioCard } from "../scenario.ts";
import type { PublicSkill } from "../judge/spec.ts";

/** Install a content snapshot inside the disposable project, never the user directory. */
export function installSkillSnapshot(
  workDir: string,
  host: "claude" | "codex",
  skill: PublicSkill,
  skillsRoot = resolve("skills"),
): NonNullable<ExecutionIdentity["source"]> {
  const root = resolve(skillsRoot, skill);
  const installedPath = join(
    workDir,
    host === "codex" ? ".agents/skills" : ".claude/skills",
    skill,
  );
  const hash = hashTree(root);
  // filter selects Node's JS copy path; the native fast path ignores dereference
  // on macOS (nodejs/node#59168), reproduced locally on Node 24.20.0.
  cpSync(root, installedPath, {
    recursive: true,
    dereference: true,
    filter: () => true,
    errorOnExist: true,
    force: false,
  });
  const installedHash = hashTree(installedPath);
  if (hash !== installedHash) throw new Error("源码在快照复制期间变化，拒绝运行");
  readFileSync(join(installedPath, "SKILL.md"), "utf8");
  // Installation is fixture preparation, not a model-produced worktree mutation.
  execFileSync("git", ["-C", workDir, "add", "--", installedPath]);
  execFileSync("git", [
    "-C",
    workDir,
    "-c",
    "user.name=bench",
    "-c",
    "user.email=bench@local",
    "commit",
    "-qm",
    "skill snapshot",
  ]);
  return { root, installedPath, hash, installedHash };
}

export function driverIdentity(
  workDir: string,
  host: "claude" | "codex",
  card: ScenarioCard,
  fixturesRoot: string,
  opts: { skillsRoot?: string; model?: string; effort?: string },
): ExecutionIdentity {
  return {
    source: installSkillSnapshot(workDir, host, "shape", opts.skillsRoot),
    modelRequested: opts.model ?? null,
    effortRequested: opts.effort ?? null,
    effortObserved: null,
    // Host version and setting-source names do not identify loaded config/MCP/tools.
    toolEnvironment: null,
    toolEnvironmentDetails: {
      host,
      version: toolVersion(host),
      node: process.version,
      platform: process.platform,
      settings: host === "claude" ? ["user", "project"] : "user config; workspace-write",
      toolsObserved: null,
    },
    scenarioHash: hashText(JSON.stringify(card)),
    fixtureHash: hashTree(join(fixturesRoot, card.fixture)),
    loadEvidence: null,
  };
}

export interface DriveResult {
  identity: ExecutionIdentity;
  scenario: string;
  host: "claude" | "codex";
  sessionId: string;
  transcriptPath: string;
  turns: number;
  status: "completed" | "timeout" | "error";
  workDir: string;
  worktreeChanges: string[] | undefined;
  worktreeCheckError?: string;
  error?: string;
}

/**
 * cheap heuristic: the assistant's final text is waiting for a user reply.
 * Biased loose on purpose — a rhetorical question only costs one extra
 * "你决定" round, while a missed real question kills the whole session.
 */
export function endsWithQuestion(text: string): boolean {
  const tail = text.trimEnd().slice(-400);
  // ？ is the fullwidth question mark — spelled as an escape because a
  // literal one is visually identical to ASCII "?" and silently degraded once
  if (/[?？]/.test(tail)) return true;
  return /(请确认|请回复|回复[「"']|告诉我|请选择|需要你确认|等你确认)/.test(tail);
}

export function collectTranscript(result: DriveResult, destDir: string): string {
  const dest = join(destDir, `${result.scenario}-${result.host}-${result.sessionId}.jsonl`);
  copyFileSync(result.transcriptPath, dest);
  return dest;
}

/** Match host injection or correlated tool text; conflicting same-name injection prevents a pure-source claim. */
export function observeSkillLoad(
  transcript: import("../normalize/events.ts").NormalizedTranscript,
  identity: ExecutionIdentity,
): ExecutionIdentity {
  if (identity.source === null) return identity;
  const path = join(identity.source.installedPath, "SKILL.md");
  let content: string;
  try {
    if (hashTree(identity.source.installedPath) !== identity.source.installedHash)
      return { ...identity, loadEvidence: null };
    content = readFileSync(path, "utf8").trim();
    if (content === "") return { ...identity, loadEvidence: null };
  } catch {
    return { ...identity, loadEvidence: null };
  }
  const injections = transcript.events
    .filter((event) => event.kind === "skill-injection")
    .filter(
      (event) =>
        event.name === undefined || event.name === basename(identity.source!.installedPath),
    );
  if (injections.some((event) => event.path !== path || event.body?.trim() !== content))
    return { ...identity, loadEvidence: null };
  if (injections.length > 0)
    return {
      ...identity,
      loadEvidence: `Host skill injection: ${path}; entry content matched; no conflicting same-name injection; installed tree unchanged`,
    };
  for (const event of transcript.events) {
    if (
      event.kind !== "tool-call" ||
      event.callId === undefined ||
      !(JSON.stringify(event.input) ?? "").includes(path)
    )
      continue;
    const result = transcript.events.find(
      (candidate) => candidate.kind === "tool-result" && candidate.callId === event.callId,
    );
    if (result?.kind !== "tool-result") continue;
    const outputs = [result.output];
    // Batched exec results contain one JSON command envelope per text block.
    for (const part of [result.output, ...result.output.split("\n")]) {
      try {
        const envelope = JSON.parse(part) as { output?: unknown } | null;
        if (typeof envelope?.output === "string") outputs.push(envelope.output);
      } catch {
        // Plain text carries its evidence directly.
      }
    }
    if (outputs.some((output) => output.includes(content)))
      return {
        ...identity,
        loadEvidence: `T${event.turn} ${event.name} ${event.callId}: ${path}; entry content matched; installed tree unchanged`,
      };
  }
  return { ...identity, loadEvidence: null };
}
