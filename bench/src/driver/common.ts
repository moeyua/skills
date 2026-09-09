/**
 * Shared driver types and helpers for both host adapters.
 */

import { copyFileSync, cpSync, readFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import ts from "typescript";

import { execFileSync } from "node:child_process";
import {
  hashTree,
  hashText,
  toolVersion,
  type ExecutionIdentity,
  type SkillSource,
} from "../identity.ts";
import type { NormalizedTranscript, ToolCallEvent } from "../normalize/events.ts";
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
  const skillsRoot = opts.skillsRoot ?? resolve("skills");
  // Resolve both required entries before mutating the disposable fixture.
  for (const skill of ["shape", "explore"]) {
    readFileSync(resolve(skillsRoot, skill, "SKILL.md"), "utf8");
  }
  return {
    source: installSkillSnapshot(workDir, host, "shape", skillsRoot),
    explore: {
      source: installSkillSnapshot(workDir, host, "explore", skillsRoot),
      loadEvidence: null,
    },
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
  transcript: NormalizedTranscript,
  identity: ExecutionIdentity,
): ExecutionIdentity {
  return {
    ...identity,
    loadEvidence: observeSourceLoad(transcript, identity.source),
    explore:
      identity.explore == null
        ? null
        : {
            ...identity.explore,
            loadEvidence: observeSourceLoad(transcript, identity.explore.source),
          },
  };
}

function observeSourceLoad(
  transcript: NormalizedTranscript,
  source: SkillSource | null,
): string | null {
  if (source === null) return null;
  const path = join(source.installedPath, "SKILL.md");
  let content: string;
  try {
    if (hashTree(source.installedPath) !== source.installedHash) return null;
    content = readFileSync(path, "utf8").trim();
    if (content === "") return null;
  } catch {
    return null;
  }
  const injections = transcript.events
    .filter((event) => event.kind === "skill-injection")
    .filter((event) => {
      const name =
        event.name ?? (event.path === undefined ? undefined : basename(dirname(event.path)));
      return name === undefined || name === basename(source.installedPath);
    });
  if (injections.some((event) => event.path !== path || event.body?.trim() !== content))
    return null;
  if (injections.length > 0)
    return `Host skill injection: ${path}; entry content matched; no conflicting same-name injection; installed tree unchanged`;
  for (const event of transcript.events) {
    if (
      event.kind !== "tool-call" ||
      event.callId === undefined ||
      !(
        (JSON.stringify(event.input) ?? "").includes(path) ||
        readsRelativeEntry(event, transcript.session.cwd, path)
      )
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
      return `T${event.turn} ${event.name} ${event.callId}: ${path}; entry content matched; installed tree unchanged`;
  }
  return null;
}

/** Recognize only literal single-file reads; never infer cwd through shell or JavaScript execution. */
function readsRelativeEntry(event: ToolCallEvent, cwd: string | undefined, entry: string): boolean {
  const matches = (cmd: unknown, workdir: unknown = cwd): boolean => {
    if (typeof cmd !== "string" || typeof workdir !== "string") return false;
    const read = cmd
      .trim()
      .match(/^cat[ \t]+(?:--[ \t]+)?(?:'([^'\r\n]+)'|"([^"$`\\\r\n]+)"|([^\s'"\\$`;&|<>()]+))$/);
    const file = read?.[1] ?? read?.[2] ?? read?.[3];
    const directory = isAbsolute(workdir)
      ? workdir
      : cwd !== undefined && isAbsolute(cwd)
        ? resolve(cwd, workdir)
        : undefined;
    return (
      directory !== undefined &&
      file !== undefined &&
      !isAbsolute(file) &&
      resolve(directory, file) === entry
    );
  };
  if (event.name === "exec_command" || event.name === "functions.exec_command") {
    if (typeof event.input !== "object" || event.input === null) return false;
    const input = event.input as Record<string, unknown>;
    return matches(input.cmd, input.workdir);
  }
  if (event.name !== "exec" || typeof event.input !== "string") return false;
  const script = ts.createSourceFile(
    "tool.js",
    event.input,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.JS,
  );
  let found = false;
  let understood = true;
  const isLiteral = (node: ts.Node): boolean =>
    ts.isStringLiteralLike(node) ||
    ts.isNumericLiteral(node) ||
    [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(
      node.kind,
    ) ||
    (ts.isArrayLiteralExpression(node) && node.elements.every(isLiteral));
  const visit = (node: ts.Node): void => {
    if (ts.isSourceFile(node)) {
      for (const statement of node.statements) visit(statement);
      return;
    }
    if (ts.isExpressionStatement(node)) {
      visit(node.expression);
      return;
    }
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (declaration.initializer !== undefined) visit(declaration.initializer);
        else understood = false;
      }
      return;
    }
    if (ts.isAwaitExpression(node)) {
      visit(node.expression);
      return;
    }
    if (!ts.isCallExpression(node)) {
      understood = false;
      return;
    }
    if (ts.isIdentifier(node.expression) && node.expression.text === "text") {
      if (node.arguments.length !== 1) {
        understood = false;
        return;
      }
      for (const argument of node.arguments) visit(argument);
      return;
    }
    if (
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "Promise" &&
      ["all", "allSettled"].includes(node.expression.name.text)
    ) {
      const calls = node.arguments[0];
      if (
        node.arguments.length === 1 &&
        calls !== undefined &&
        ts.isArrayLiteralExpression(calls)
      ) {
        for (const call of calls.elements) visit(call);
      } else understood = false;
      return;
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "tools" &&
      node.expression.name.text === "exec_command"
    ) {
      const input = node.arguments[0];
      if (
        node.arguments.length === 1 &&
        input !== undefined &&
        ts.isObjectLiteralExpression(input)
      ) {
        let cmd: string | undefined;
        let workdir = cwd;
        let literal = true;
        for (const property of input.properties) {
          if (
            !ts.isPropertyAssignment(property) ||
            ts.isComputedPropertyName(property.name) ||
            !isLiteral(property.initializer)
          ) {
            literal = false;
            break;
          }
          const key = property.name.text;
          if (key === "cmd" || key === "workdir") {
            if (!ts.isStringLiteralLike(property.initializer)) {
              literal = false;
              break;
            }
            if (key === "cmd") cmd = property.initializer.text;
            else workdir = property.initializer.text;
          }
        }
        if (literal && matches(cmd, workdir)) found = true;
        if (!literal) understood = false;
      } else understood = false;
    } else understood = false;
  };
  visit(script);
  return understood && found;
}
