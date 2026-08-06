/**
 * Fixture preparation shared by both drivers.
 *
 * Fixtures are committed as plain directories (a nested .git cannot live in
 * the parent repo), so each run copies the fixture into a temp dir and
 * creates a fresh git repo there — every run starts from an identical,
 * version-controlled state.
 */

import { cpSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

export interface FixtureWorktreeObservation {
  changes: string[];
  error?: string;
}

export function prepareFixture(fixtureDir: string, label: string): string {
  const workDir = mkdtempSync(join(tmpdir(), `shape-bench-${label}-`));
  cpSync(fixtureDir, workDir, { recursive: true });
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", workDir, ...args], { encoding: "utf8" });
  git("init", "-q");
  git("-c", "user.name=shape-bench", "-c", "user.email=bench@local", "add", "-A");
  git(
    "-c",
    "user.name=shape-bench",
    "-c",
    "user.email=bench@local",
    "commit",
    "-q",
    "-m",
    "fixture baseline",
  );
  return workDir;
}

export function inspectFixtureWorktree(workDir: string): FixtureWorktreeObservation {
  try {
    const output = execFileSync(
      "git",
      ["-C", workDir, "status", "--porcelain=v1", "--untracked-files=all"],
      { encoding: "utf8" },
    );
    return { changes: output.split("\n").filter((line) => line.length > 0) };
  } catch (cause) {
    return {
      changes: [],
      error: cause instanceof Error ? cause.message : String(cause),
    };
  }
}
