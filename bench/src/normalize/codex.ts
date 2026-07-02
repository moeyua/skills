/**
 * Parser for codex CLI rollout JSONL
 * (~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl).
 *
 * Line shape: {timestamp, type, payload}. Types observed from real sessions
 * (codex 0.1xx): session_meta / turn_context / event_msg / response_item.
 *
 * Real user inputs surface twice: as event_msg{user_message} and as
 * response_item message/user (mixed in with injected AGENTS.md, sandbox
 * instructions, environment context). event_msg is the authoritative user-turn
 * source; response_item user messages are only used as a fallback when a
 * rollout contains no user_message events at all.
 */

import type { BenchEvent, NormalizedTranscript, SessionInfo } from "./events.ts";

const INJECTED_USER_PREFIXES = [
  "<permissions instructions>",
  "<environment_context>",
  "<turn_context>",
  "<turn_aborted>",
  "<user_instructions>",
  "# AGENTS.md",
];

interface CodexLine {
  timestamp?: string;
  type?: string;
  payload?: {
    type?: string;
    // session_meta
    id?: string;
    cwd?: string;
    // turn_context
    model?: string;
    // event_msg
    message?: string;
    // response_item message
    role?: string;
    content?: { type?: string; text?: string }[];
    // function_call / custom_tool_call
    name?: string;
    arguments?: string;
    input?: string;
    call_id?: string;
    // *_output
    output?: string;
  };
}

function contentText(content: { type?: string; text?: string }[] | undefined): string {
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => typeof b.text === "string")
    .map((b) => b.text)
    .join("\n");
}

function isInjectedUserText(text: string): boolean {
  return INJECTED_USER_PREFIXES.some((p) => text.startsWith(p));
}

export function parseApplyPatchPaths(patch: string): string[] {
  const paths: string[] = [];
  for (const line of patch.split("\n")) {
    const marker = ["*** Add File: ", "*** Update File: ", "*** Delete File: "].find((m) =>
      line.startsWith(m),
    );
    if (marker !== undefined) paths.push(line.slice(marker.length).trim());
  }
  return paths;
}

function parseArguments(args: string | undefined): unknown {
  if (args === undefined) return undefined;
  try {
    return JSON.parse(args);
  } catch {
    return args;
  }
}

export function parseCodexLines(lines: object[], sourcePath: string): NormalizedTranscript {
  const hasUserMessageEvents = lines.some((raw) => {
    const line = raw as CodexLine;
    return line.type === "event_msg" && line.payload?.type === "user_message";
  });

  const events: BenchEvent[] = [];
  let turn = 0;
  let sessionId: string | undefined;
  let cwd: string | undefined;
  let model: string | undefined;

  for (const raw of lines) {
    const line = raw as CodexLine;
    const p = line.payload;
    if (p === undefined) continue;
    const timestamp = line.timestamp;

    if (line.type === "session_meta") {
      sessionId ??= p.id;
      cwd ??= p.cwd;
      continue;
    }
    if (line.type === "turn_context") {
      model ??= p.model;
      continue;
    }
    if (line.type === "event_msg") {
      if (p.type === "user_message" && typeof p.message === "string") {
        turn += 1;
        events.push({ kind: "user-message", turn, timestamp, text: p.message });
      }
      continue;
    }
    if (line.type !== "response_item") continue;

    switch (p.type) {
      case "message": {
        const text = contentText(p.content);
        if (text.trim() === "") break;
        if (p.role === "assistant") {
          events.push({ kind: "assistant-message", turn, timestamp, text });
        } else if (p.role === "user" && !hasUserMessageEvents && !isInjectedUserText(text)) {
          turn += 1;
          events.push({ kind: "user-message", turn, timestamp, text });
        }
        break;
      }
      case "function_call": {
        if (typeof p.name !== "string") break;
        events.push({
          kind: "tool-call",
          turn,
          timestamp,
          name: p.name,
          callId: p.call_id,
          input: parseArguments(p.arguments),
        });
        break;
      }
      case "custom_tool_call": {
        if (typeof p.name !== "string") break;
        events.push({
          kind: "tool-call",
          turn,
          timestamp,
          name: p.name,
          callId: p.call_id,
          input: p.input,
        });
        if (p.name === "apply_patch" && typeof p.input === "string") {
          for (const path of parseApplyPatchPaths(p.input)) {
            events.push({ kind: "file-write", turn, timestamp, path, tool: "apply_patch" });
          }
        }
        break;
      }
      case "function_call_output":
      case "custom_tool_call_output": {
        events.push({
          kind: "tool-result",
          turn,
          timestamp,
          callId: p.call_id,
          output: p.output ?? "",
        });
        break;
      }
      default:
        break; // reasoning, web_search_call, tool_search_* carry no flow signal
    }
  }

  const session: SessionInfo = { host: "codex", sessionId: sessionId ?? "", cwd, model };
  return { session, events, turnCount: turn, sourcePath };
}
