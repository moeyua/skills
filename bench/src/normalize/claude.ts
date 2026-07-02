/**
 * Parser for Claude Code projects JSONL
 * (~/.claude/projects/<hash>/<session-id>.jsonl).
 *
 * Line shapes observed from real sessions (Claude Code 2.x):
 * - {type:"user", message:{content: string | Block[]}, isSidechain, ...}
 * - {type:"assistant", message:{model, content: Block[]}, ...}
 * - other types (queue-operation, attachment, file-history-snapshot,
 *   last-prompt, summary, system) carry no conversation content.
 * Blocks: text / thinking / tool_use{id,name,input} / tool_result{tool_use_id}.
 */

import type { BenchEvent, NormalizedTranscript, SessionInfo } from "./events.ts";

const FILE_WRITE_TOOLS: Record<string, string> = {
  Write: "file_path",
  Edit: "file_path",
  MultiEdit: "file_path",
  NotebookEdit: "notebook_path",
};

interface ClaudeLine {
  type?: string;
  isSidechain?: boolean;
  timestamp?: string;
  sessionId?: string;
  cwd?: string;
  message?: {
    role?: string;
    model?: string;
    content?: string | ContentBlock[];
  };
}

interface ContentBlock {
  type?: string;
  text?: string;
  id?: string;
  name?: string;
  input?: unknown;
  tool_use_id?: string;
  content?: string | ContentBlock[];
}

function blockText(content: string | ContentBlock[] | undefined): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n");
}

export function parseClaudeLines(lines: object[], sourcePath: string): NormalizedTranscript {
  const events: BenchEvent[] = [];
  let turn = 0;
  let sessionId: string | undefined;
  let cwd: string | undefined;
  let model: string | undefined;
  // index into events of the user-message currently open for grouping;
  // consecutive user text lines (command + injected skill body) are one turn
  let openUserMessage: number | null = null;

  for (const raw of lines) {
    const line = raw as ClaudeLine;
    if (line.type !== "user" && line.type !== "assistant") continue;
    sessionId ??= line.sessionId;
    const sidechain = line.isSidechain === true;
    const timestamp = line.timestamp;
    const content = line.message?.content;

    if (line.type === "user") {
      const blocks = Array.isArray(content) ? content : [];
      const toolResults = blocks.filter((b) => b.type === "tool_result");
      if (toolResults.length > 0) {
        openUserMessage = null;
        for (const b of toolResults) {
          events.push({
            kind: "tool-result",
            turn,
            timestamp,
            callId: b.tool_use_id,
            output: blockText(b.content),
            ...(sidechain && { sidechain }),
          });
        }
        continue;
      }
      if (sidechain) continue; // subagent prompts are agent-generated, not user turns
      const text = blockText(content);
      if (text.trim() === "") continue;
      cwd ??= line.cwd;
      if (openUserMessage !== null) {
        const prev = events[openUserMessage];
        if (prev?.kind === "user-message") {
          prev.text += `\n${text}`;
          continue;
        }
      }
      turn += 1;
      events.push({ kind: "user-message", turn, timestamp, text });
      openUserMessage = events.length - 1;
      continue;
    }

    // assistant
    if (!sidechain) openUserMessage = null;
    model ??= line.message?.model;
    const blocks = Array.isArray(content) ? content : [];
    for (const b of blocks) {
      if (b.type === "text" && typeof b.text === "string" && b.text.trim() !== "") {
        events.push({
          kind: "assistant-message",
          turn,
          timestamp,
          text: b.text,
          ...(sidechain && { sidechain }),
        });
      } else if (b.type === "tool_use" && typeof b.name === "string") {
        events.push({
          kind: "tool-call",
          turn,
          timestamp,
          name: b.name,
          callId: b.id,
          input: b.input,
          ...(sidechain && { sidechain }),
        });
        const pathField = FILE_WRITE_TOOLS[b.name];
        if (pathField !== undefined) {
          const input = b.input as Record<string, unknown> | undefined;
          const path = input?.[pathField];
          if (typeof path === "string") {
            events.push({
              kind: "file-write",
              turn,
              timestamp,
              path,
              tool: b.name,
              ...(sidechain && { sidechain }),
            });
          }
        }
      }
    }
  }

  const session: SessionInfo = { host: "claude", sessionId: sessionId ?? "", cwd, model };
  return { session, events, turnCount: turn, sourcePath };
}
