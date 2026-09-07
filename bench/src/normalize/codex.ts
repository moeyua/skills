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
 * source. When those events are absent, current host content_item_kinds and
 * turn_id distinguish user.text from context; older metadata-less rollouts
 * retain their existing response_item fallback. Selected skill injections
 * remain separate evidence and never increment user turns.
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
    effort?: string;
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
    output?: unknown;
    internal_chat_message_metadata_passthrough?: {
      turn_id?: string;
      content_item_kinds?: string[];
    };
  };
}

function contentText(content: { type?: string; text?: string }[] | undefined): string {
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => typeof b.text === "string")
    .map((b) => b.text)
    .join("\n");
}

function toolOutputText(output: unknown): string {
  if (typeof output === "string") return output;
  if (!Array.isArray(output) || output.length === 0)
    return "[工具结果文本不可得：缺失或未知输出结构]";
  return output
    .map((block: unknown) => {
      if (typeof block === "object" && block !== null) {
        const value = block as { type?: unknown; text?: unknown };
        if (
          ["input_text", "output_text", "text"].includes(String(value.type)) &&
          typeof value.text === "string"
        )
          return value.text;
      }
      return "[工具结果文本不可得：非文本或未知 content block；原始数据保留于 rawOutput]";
    })
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
  const semanticTurns = new Map<string, number>();
  let sessionId: string | undefined;
  let cwd: string | undefined;
  const models = new Set<string>();
  const efforts = new Set<string>();

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
      if (p.model !== undefined) models.add(p.model);
      if (p.effort !== undefined) efforts.add(p.effort);
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
        if (p.role === "user") {
          const kinds = p.internal_chat_message_metadata_passthrough?.content_item_kinds;
          for (const [index, block] of (p.content ?? []).entries()) {
            if (
              kinds?.[index] !== "skills.selected_skill_instructions" ||
              typeof block.text !== "string"
            )
              continue;
            const rawText = block.text;
            events.push({
              kind: "skill-injection",
              turn,
              timestamp,
              name: rawText.match(/<name>([^<]+)<\/name>/)?.[1]?.trim(),
              path: rawText.match(/<path>([^<]+)<\/path>/)?.[1]?.trim(),
              body: rawText.match(/<\/path>\s*([\s\S]*?)\s*<\/skill>\s*$/)?.[1],
              rawText,
            });
          }
        }
        const text = contentText(p.content);
        if (text.trim() === "") break;
        if (p.role === "assistant") {
          events.push({ kind: "assistant-message", turn, timestamp, text });
        } else if (p.role === "user" && !hasUserMessageEvents) {
          const metadata = p.internal_chat_message_metadata_passthrough;
          const kinds = metadata?.content_item_kinds;
          if (Array.isArray(kinds)) {
            // Current hosts identify actual user text independently of its content.
            const userText = contentText(
              p.content?.filter((_, index) => kinds[index] === "user.text"),
            );
            if (userText === "") break;
            const previous =
              metadata?.turn_id === undefined ? undefined : semanticTurns.get(metadata.turn_id);
            if (previous === undefined) {
              turn += 1;
              if (metadata?.turn_id !== undefined) semanticTurns.set(metadata.turn_id, turn);
            }
            events.push({
              kind: "user-message",
              turn: previous ?? turn,
              timestamp,
              text: userText,
            });
          } else if (!isInjectedUserText(text)) {
            // Existing rollouts without semantic metadata retain their native fallback.
            turn += 1;
            events.push({ kind: "user-message", turn, timestamp, text });
          }
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
          output: toolOutputText(p.output),
          ...(typeof p.output !== "string" && { rawOutput: p.output }),
        });
        break;
      }
      default:
        break; // reasoning, web_search_call, tool_search_* carry no flow signal
    }
  }

  const model = models.size === 1 ? [...models][0] : undefined;
  const effort = efforts.size === 1 ? [...efforts][0] : undefined;
  const session: SessionInfo = {
    host: "codex",
    sessionId: sessionId ?? "",
    cwd,
    model,
    ...(effort !== undefined && { effort }),
  };
  return { session, events, turnCount: turn, sourcePath };
}
