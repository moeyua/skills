/**
 * Unit tests for shared driver helpers.
 */

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect } from "vite-plus/test";
import { endsWithQuestion } from "./common.ts";
import { inspectFixtureWorktree, prepareFixture } from "./fixture.ts";

describe("endsWithQuestion", () => {
  it("detects a plain trailing question", () => {
    expect(endsWithQuestion("目标用户是谁?")).toBe(true);
  });

  it("detects the fullwidth question mark (U+FF1F)", () => {
    // constructed via escape so an editor can never silently downgrade it
    const fullwidth = `确认按这个设计写计划吗${"？"}如果确认,我会写 plans/2026-07-02-fix.md。`;
    expect(endsWithQuestion(fullwidth)).toBe(true);
  });

  it("detects a confirmation request whose last line ends with a period", () => {
    // real driven-session tail: the question mark sits one line above the end
    const tail =
      "唯一需要你确认:是否按推荐设计推进,并把测试脚本修复一起纳入计划?回复“按推荐来”即可,我会先写 plans/ 里的 fix plan。";
    expect(endsWithQuestion(tail)).toBe(true);
  });

  it("stays false for a closing statement", () => {
    expect(endsWithQuestion("建议采用本地优先的归档状态；范围和恢复语义已经明确。 ")).toBe(false);
  });
});

describe("shape driver completion", () => {
  it("does not depend on a plan file signal", () => {
    const driverDir = import.meta.dirname;
    const sources = ["common.ts", "claude.ts", "codex.ts"].map((file) =>
      readFileSync(join(driverDir, file), "utf8"),
    );

    expect(sources.join("\n")).not.toContain("planWritten");
  });
});

describe("fixture worktree evidence", () => {
  it("distinguishes a clean fixture from shell-created changes", () => {
    const source = mkdtempSync(join(tmpdir(), "shape-bench-source-"));
    writeFileSync(join(source, "tracked.txt"), "before\n");
    const workDir = prepareFixture(source, "worktree-test");
    try {
      expect(inspectFixtureWorktree(workDir)).toEqual({ changes: [] });
      writeFileSync(join(workDir, "tracked.txt"), "after\n");
      writeFileSync(join(workDir, "created.txt"), "new\n");
      const observation = inspectFixtureWorktree(workDir);
      expect(observation.changes).toEqual(
        expect.arrayContaining([
          expect.stringContaining("tracked.txt"),
          expect.stringContaining("created.txt"),
        ]),
      );
    } finally {
      rmSync(source, { recursive: true, force: true });
      rmSync(workDir, { recursive: true, force: true });
    }
  });
});
