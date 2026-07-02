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
