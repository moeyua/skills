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

describe("project skill snapshots", () => {
  it("loads the specified source including dereferenced shared references, without dirtying the fixture", async () => {
    const { mkdirSync, symlinkSync, lstatSync } = await import("node:fs");
    const { installSkillSnapshot, observeSkillLoad, driverIdentity } = await import("./common.ts");
    const { unknownExecution } = await import("../identity.ts");
    const { hashTree } = await import("../identity.ts");
    const source = mkdtempSync(join(tmpdir(), "bench-snapshot-"));
    mkdirSync(join(source, "skills/shape/references"), { recursive: true });
    writeFileSync(
      join(source, "skills/shape/SKILL.md"),
      "---\nname: shape\n---\n# Snapshot version\n",
    );
    writeFileSync(join(source, "shared.md"), "shared before\n");
    symlinkSync("../../../shared.md", join(source, "skills/shape/references/shared.md"));
    const fixture = mkdtempSync(join(tmpdir(), "bench-fixture-"));
    writeFileSync(join(fixture, "README.md"), "fixture\n");
    const workDir = prepareFixture(fixture, "snapshot");
    try {
      const snapshot = installSkillSnapshot(workDir, "codex", "shape", join(source, "skills"));
      expect(snapshot.installedPath).toBe(join(workDir, ".agents/skills/shape"));
      expect(readFileSync(join(snapshot.installedPath, "SKILL.md"), "utf8")).toContain(
        "Snapshot version",
      );
      expect(lstatSync(join(snapshot.installedPath, "references/shared.md")).isSymbolicLink()).toBe(
        false,
      );
      const driver = driverIdentity(
        workDir,
        "claude",
        {
          id: "test",
          title: "test",
          kind: "feat",
          fixture: ".",
          initialIntent: "test",
          intentCard: "test",
          answerPolicy: "test",
          path: "test.md",
        },
        fixture,
        { skillsRoot: join(source, "skills") },
      );
      expect(driver.toolEnvironment).toBeNull();
      expect(driver.toolEnvironmentDetails?.toolsObserved).toBeNull();
      expect(snapshot.hash).toBe(snapshot.installedHash);
      const entry = join(snapshot.installedPath, "SKILL.md");
      const identity = { ...unknownExecution(), source: snapshot };
      const transcript: import("../normalize/events.ts").NormalizedTranscript = {
        session: { host: "codex", sessionId: "test", cwd: workDir, model: undefined },
        sourcePath: "/tmp/test.jsonl",
        turnCount: 1,
        events: [
          {
            kind: "tool-call",
            name: "exec_command",
            callId: "load",
            input: { cmd: `cat ${entry}` },
            timestamp: undefined,
            turn: 1,
          },
        ],
      };
      expect(observeSkillLoad(transcript, identity).loadEvidence).toBeNull();
      transcript.events.push({
        kind: "tool-result",
        callId: "load",
        output: JSON.stringify({ output: readFileSync(entry, "utf8") }),
        timestamp: undefined,
        turn: 1,
      });
      expect(observeSkillLoad(transcript, identity).loadEvidence).toContain(entry);
      const { parseCodexLines } = await import("../normalize/codex.ts");
      const contentBlocks = parseCodexLines(
        [
          {
            type: "response_item",
            payload: {
              type: "custom_tool_call",
              name: "exec",
              call_id: "load",
              input: `cat ${entry}`,
            },
          },
          {
            type: "response_item",
            payload: {
              type: "custom_tool_call_output",
              call_id: "load",
              output: [
                { type: "input_text", text: "Script completed\nOutput:" },
                {
                  type: "input_text",
                  text: JSON.stringify({ exit_code: 0, output: readFileSync(entry, "utf8") }),
                },
              ],
            },
          },
        ],
        "/fixture/rollout.jsonl",
      );
      expect(observeSkillLoad(contentBlocks, identity).loadEvidence).toContain(entry);
      const injection = (path: string, body: string) => ({
        type: "response_item",
        payload: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: `<skill>\n<name>shape</name>\n<path>${path}</path>\n${body}\n</skill>`,
            },
          ],
          internal_chat_message_metadata_passthrough: {
            turn_id: "t1",
            content_item_kinds: ["skills.selected_skill_instructions"],
          },
        },
      });
      const localInjection = parseCodexLines(
        [injection(entry, readFileSync(entry, "utf8"))],
        "/fixture/local.jsonl",
      );
      expect(localInjection.turnCount).toBe(0);
      expect(observeSkillLoad(localInjection, identity).loadEvidence).toContain(
        "Host skill injection",
      );
      const oldInjection = parseCodexLines(
        [injection("/home/user/.agents/skills/shape/SKILL.md", "# Previous global Shape body")],
        "/fixture/mixed.jsonl",
      );
      expect(
        observeSkillLoad(
          { ...contentBlocks, events: [...oldInjection.events, ...contentBlocks.events] },
          identity,
        ).loadEvidence,
      ).toBeNull();

      expect(inspectFixtureWorktree(workDir).changes).toEqual([]);
      writeFileSync(join(source, "shared.md"), "shared after\n");
      expect(hashTree(join(source, "skills/shape"))).not.toBe(snapshot.hash);
      expect(readFileSync(join(snapshot.installedPath, "references/shared.md"), "utf8")).toBe(
        "shared before\n",
      );
      expect(() =>
        installSkillSnapshot(workDir, "codex", "shape", join(source, "missing")),
      ).toThrow();
    } finally {
      for (const dir of [source, fixture, workDir]) rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("execution metadata", () => {
  it("requires explicit unknown fields instead of accepting an empty identity", async () => {
    const { parseExecutionIdentity, unknownExecution } = await import("../identity.ts");
    expect(parseExecutionIdentity(unknownExecution()).source).toBeNull();
    expect(() => parseExecutionIdentity({})).toThrow(/metadata/);
    expect(() => parseExecutionIdentity({ ...unknownExecution(), source: {} })).toThrow(/source/);
  });
});
