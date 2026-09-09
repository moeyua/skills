/** Evidence identities. null always means unobserved, never a default value. */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export function hashText(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

/** Follows shared reference symlinks; paths and bytes both contribute. */
export function hashTree(root: string): string {
  const hash = createHash("sha256");
  function walk(relative: string): void {
    for (const name of readdirSync(join(root, relative)).sort()) {
      const path = join(relative, name);
      const absolute = join(root, path);
      if (statSync(absolute).isDirectory()) walk(path);
      else {
        const bytes = readFileSync(absolute);
        hash.update(JSON.stringify([path, bytes.length]));
        hash.update(bytes);
      }
    }
  }
  walk("");
  return hash.digest("hex");
}

export interface SkillSource {
  root: string;
  installedPath: string;
  hash: string;
  installedHash: string;
}

export interface ExecutionIdentity {
  source: SkillSource | null;
  /** Required support for Shape; null means its source was not observed. */
  explore: { source: SkillSource; loadEvidence: string | null } | null;
  modelRequested: string | null;
  effortRequested: string | null;
  effortObserved: string | null;
  /** Verified identity of the complete tool/config/permission environment; not diagnostic JSON. */
  toolEnvironment: string | null;
  toolEnvironmentDetails?: {
    host: string;
    version: string | null;
    node: string;
    platform: string;
    settings: string | string[];
    toolsObserved: null;
  };
  scenarioHash: string | null;
  fixtureHash: string | null;
  loadEvidence: string | null;
}

export function unknownExecution(): ExecutionIdentity {
  return {
    source: null,
    explore: null,
    modelRequested: null,
    effortRequested: null,
    effortObserved: null,
    toolEnvironment: null,
    scenarioHash: null,
    fixtureHash: null,
    loadEvidence: null,
  };
}

export function toolVersion(command: string): string | null {
  const result = spawnSync(command, ["--version"], { encoding: "utf8", timeout: 10_000 });
  return result.status === 0 ? result.stdout.trim() : null;
}

export function parseExecutionIdentity(value: unknown): ExecutionIdentity {
  if (typeof value !== "object" || value === null)
    throw new Error("metadata 必须为 ExecutionIdentity JSON 对象");
  const record = value as Record<string, unknown>;
  for (const key of [
    "modelRequested",
    "effortRequested",
    "effortObserved",
    "toolEnvironment",
    "scenarioHash",
    "fixtureHash",
    "loadEvidence",
  ]) {
    if (record[key] !== null && typeof record[key] !== "string")
      throw new Error(`metadata.${key} 必须为 string 或 null（不可得）`);
  }
  if (record.source !== null) validateSource(record.source, "metadata.source");
  if (record.explore !== null) {
    if (typeof record.explore !== "object" || record.explore === undefined)
      throw new Error("metadata.explore 必须为 Explore 装载身份对象或 null");
    const explore = record.explore as Record<string, unknown>;
    validateSource(explore.source, "metadata.explore.source");
    if (explore.loadEvidence !== null && typeof explore.loadEvidence !== "string")
      throw new Error("metadata.explore.loadEvidence 必须为 string 或 null（不可得）");
  }
  return value as ExecutionIdentity;
}

function validateSource(value: unknown, label: string): void {
  if (typeof value !== "object" || value === null) throw new Error(`${label} 必须为源码身份对象`);
  const source = value as Record<string, unknown>;
  for (const key of ["root", "installedPath", "hash", "installedHash"]) {
    if (typeof source[key] !== "string" || source[key] === "")
      throw new Error(`${label}.${key} 必须为非空 string`);
  }
}
