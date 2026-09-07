/**
 * Unit tests for the transcript normalizer.
 *
 * Sanitized sample JSONL files in ./samples/ mirror the real on-disk shapes:
 * - claude: ~/.claude/projects/<hash>/<session-id>.jsonl
 * - codex:  ~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl
 */

import { describe, it, expect } from "vite-plus/test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeTranscript, detectFormat } from "./index.ts";
import type { BenchEvent } from "./events.ts";

const SAMPLES = join(import.meta.dirname, "samples");
const CLAUDE_SAMPLE = join(SAMPLES, "claude-sample.jsonl");
const CODEX_SAMPLE = join(SAMPLES, "codex-sample.jsonl");

function ofKind<K extends BenchEvent["kind"]>(events: BenchEvent[], kind: K) {
  return events.filter((e): e is Extract<BenchEvent, { kind: K }> => e.kind === kind);
}

describe("detectFormat", () => {
  it("detects claude projects JSONL", () => {
    expect(detectFormat(CLAUDE_SAMPLE)).toBe("claude");
  });

  it("detects codex rollout JSONL", () => {
    expect(detectFormat(CODEX_SAMPLE)).toBe("codex");
  });

  it("returns null for unrecognized JSONL", () => {
    const dir = mkdtempSync(join(tmpdir(), "bench-detect-"));
    const file = join(dir, "other.jsonl");
    writeFileSync(file, `{"foo":"bar"}\n{"baz":1}\n`);
    try {
      expect(detectFormat(file)).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("normalizeTranscript / claude", () => {
  const t = normalizeTranscript(CLAUDE_SAMPLE);

  it("extracts session info", () => {
    expect(t.session.host).toBe("claude");
    expect(t.session.sessionId).toBe("aaaa-1111");
    expect(t.session.cwd).toBe("/tmp/demo");
    expect(t.session.model).toBe("claude-opus-4-8");
  });

  it("groups consecutive user lines into one turn", () => {
    // slash-command line + injected skill body = turn 1; "就按 A 做" = turn 2
    expect(t.turnCount).toBe(2);
    const users = ofKind(t.events, "user-message");
    expect(users).toHaveLength(2);
    expect(users[0]?.text).toContain("<command-name>/shape</command-name>");
    expect(users[0]?.text).toContain("# Shape");
    expect(users[1]?.text).toBe("就按 A 做");
    expect(users[1]?.turn).toBe(2);
  });

  it("captures tool calls and results", () => {
    const calls = ofKind(t.events, "tool-call").filter((e) => !e.sidechain);
    expect(calls.map((c) => c.name)).toEqual(["Read", "AskUserQuestion", "Write"]);
    const ask = calls[1];
    expect(ask?.input).toMatchObject({ questions: [{ header: "方向" }] });
    const results = ofKind(t.events, "tool-result");
    expect(results.some((r) => r.output.includes("User selected: A"))).toBe(true);
  });

  it("derives file-write events from Write tool calls", () => {
    const writes = ofKind(t.events, "file-write");
    expect(writes).toHaveLength(1);
    expect(writes[0]?.path).toBe("/tmp/demo/plans/2026-06-01-feat-x.md");
    expect(writes[0]?.turn).toBe(2);
  });

  it("keeps sidechain tool activity flagged, without turn inflation", () => {
    const sidechainCalls = ofKind(t.events, "tool-call").filter((e) => e.sidechain);
    expect(sidechainCalls.map((c) => c.name)).toEqual(["Bash"]);
    // sidechain user prompts are agent-generated, not user turns
    expect(t.turnCount).toBe(2);
  });

  it("captures assistant text but not thinking", () => {
    const texts = ofKind(t.events, "assistant-message");
    expect(texts).toHaveLength(1);
    expect(texts[0]?.text).toContain("Plan written");
  });
});

describe("normalizeTranscript / codex", () => {
  const t = normalizeTranscript(CODEX_SAMPLE);

  it("extracts session info", () => {
    expect(t.session.host).toBe("codex");
    expect(t.session.sessionId).toBe("0197-cccc");
    expect(t.session.cwd).toBe("/tmp/demo2");
    expect(t.session.model).toBe("gpt-5.5");
  });

  it("counts user turns from user_message events only", () => {
    expect(t.turnCount).toBe(2);
    const users = ofKind(t.events, "user-message");
    expect(users.map((u) => u.text)).toEqual(["/shape 我想加一个导出功能", "导出 CSV 就行"]);
  });

  it("skips injected context and duplicate response_item user messages", () => {
    const users = ofKind(t.events, "user-message");
    expect(users).toHaveLength(2);
    expect(users.some((u) => u.text.includes("<permissions instructions>"))).toBe(false);
  });

  it("does not double-count assistant messages mirrored in agent_message events", () => {
    const texts = ofKind(t.events, "assistant-message");
    expect(texts).toHaveLength(2);
    expect(texts[0]?.text).toBe("这个导出功能的目标用户是谁?");
  });

  it("captures function calls with parsed arguments", () => {
    const calls = ofKind(t.events, "tool-call");
    const exec = calls.find((c) => c.name === "exec_command");
    expect(exec?.input).toEqual({ cmd: "ls" });
    const results = ofKind(t.events, "tool-result");
    expect(results.some((r) => r.output === "README.md\nsrc")).toBe(true);
  });

  it("derives file-write events from apply_patch", () => {
    const writes = ofKind(t.events, "file-write");
    expect(writes).toHaveLength(1);
    expect(writes[0]?.path).toBe("plans/2026-06-02-feat-export.md");
    expect(writes[0]?.tool).toBe("apply_patch");
    expect(writes[0]?.turn).toBe(2);
  });
});

describe("normalizeTranscript / errors", () => {
  it("rejects unrecognized files with path and reason", () => {
    const dir = mkdtempSync(join(tmpdir(), "bench-norm-"));
    const file = join(dir, "weird.jsonl");
    writeFileSync(file, `{"foo":"bar"}\n`);
    try {
      expect(() => normalizeTranscript(file)).toThrowError(/weird\.jsonl.*未能识别/s);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects empty files", () => {
    const dir = mkdtempSync(join(tmpdir(), "bench-norm-"));
    const file = join(dir, "empty.jsonl");
    writeFileSync(file, "");
    try {
      expect(() => normalizeTranscript(file)).toThrowError(/empty\.jsonl/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("Codex tool result content blocks", () => {
  it("renders actual input_text blocks and preserves their original payload", async () => {
    const { parseCodexLines } = await import("./codex.ts");
    const { renderTranscript } = await import("../judge/render.ts");
    const output = [
      { type: "input_text", text: "Script completed\nOutput:\n" },
      {
        type: "input_text",
        text: JSON.stringify({ exit_code: 0, output: "tests 4\npass 4\nfail 0\n" }),
      },
    ];
    const t = parseCodexLines(
      [
        {
          type: "response_item",
          payload: { type: "custom_tool_call_output", call_id: "call-test", output },
        },
      ],
      "/fixture/rollout.jsonl",
    );
    const result = ofKind(t.events, "tool-result")[0];
    expect(typeof result?.output).toBe("string");
    expect(result?.output).toContain("pass 4");
    expect(result).toHaveProperty("rawOutput", output);
    const rendered = renderTranscript(t);
    expect(rendered).toContain("pass 4");
    expect(rendered).not.toContain("[object Object]");
  });
  it.each(
    [
      undefined,
      null,
      { unexpected: true },
      [],
      [{ type: "image", image_url: "image" }],
      [{ type: "future_text", text: "not an observed text type" }],
    ].map((output) => ({ output })),
  )("marks unavailable tool text for %j instead of inferring content", async ({ output }) => {
    const { parseCodexLines } = await import("./codex.ts");
    const t = parseCodexLines(
      [{ type: "response_item", payload: { type: "function_call_output", output } }],
      "/fixture/rollout.jsonl",
    );
    const result = ofKind(t.events, "tool-result")[0];
    expect(result?.output).toContain("工具结果文本不可得");
    expect(result).toHaveProperty("rawOutput", output);
  });
  it("keeps text and marks non-text blocks in mixed output", async () => {
    const { parseCodexLines } = await import("./codex.ts");
    const t = parseCodexLines(
      [
        {
          type: "response_item",
          payload: {
            type: "function_call_output",
            output: [{ type: "text", text: "known" }, { type: "image" }],
          },
        },
      ],
      "/fixture/rollout.jsonl",
    );
    const result = ofKind(t.events, "tool-result")[0];
    expect(result?.output).toContain("known");
    expect(result?.output).toContain("工具结果文本不可得");
  });
});

describe("Codex metadata user turns", () => {
  it("counts one user request while excluding host-tagged context and selected skill injection", async () => {
    const { parseCodexLines } = await import("./codex.ts");
    const message = (texts: string[], kinds: string[]) => ({
      type: "response_item",
      payload: {
        type: "message",
        role: "user",
        content: texts.map((text) => ({ type: "input_text", text })),
        internal_chat_message_metadata_passthrough: { turn_id: "t1", content_item_kinds: kinds },
      },
    });
    const t = parseCodexLines(
      [
        { type: "event_msg", payload: { type: "task_started" } },
        message(
          [
            "<recommended_plugins>host data</recommended_plugins>",
            "# AGENTS.md host instructions",
            "<environment_context>host data</environment_context>",
          ],
          ["plugins.recommendations", "agents_md.instructions", "environments.environment_context"],
        ),
        message(["<skill> this is literal text in the user's real request"], ["user.text"]),
        message(["More text from the same user turn"], ["user.text"]),
        message(
          ["<skill>selected skill instructions</skill>"],
          ["skills.selected_skill_instructions"],
        ),
        { type: "event_msg", payload: { type: "task_complete" } },
      ],
      "/fixture/rollout.jsonl",
    );
    expect(t.turnCount).toBe(1);
    expect(ofKind(t.events, "user-message").map((event) => event.text)).toEqual([
      "<skill> this is literal text in the user's real request",
      "More text from the same user turn",
    ]);
    expect(ofKind(t.events, "user-message").every((event) => event.turn === 1)).toBe(true);
  });
});
