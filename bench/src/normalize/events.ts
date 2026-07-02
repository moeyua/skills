/**
 * Unified event stream for shape-bench transcripts.
 *
 * Both claude projects JSONL and codex rollout JSONL normalize to this model;
 * the mechanical checker and the LLM judge only ever consume these types.
 *
 * Turn semantics: a turn is one real user input (slash command included).
 * Machine-injected context (skill bodies, AGENTS.md, sandbox instructions)
 * never increments the turn counter. Events before the first user input
 * carry turn 0.
 */

export type Host = "claude" | "codex";

export interface SessionInfo {
  host: Host;
  sessionId: string;
  cwd: string | undefined;
  model: string | undefined;
}

interface BaseEvent {
  turn: number;
  timestamp: string | undefined;
  /** true for claude subagent (sidechain) activity */
  sidechain?: boolean;
}

export interface UserMessageEvent extends BaseEvent {
  kind: "user-message";
  text: string;
}

export interface AssistantMessageEvent extends BaseEvent {
  kind: "assistant-message";
  text: string;
}

export interface ToolCallEvent extends BaseEvent {
  kind: "tool-call";
  name: string;
  callId: string | undefined;
  input: unknown;
}

export interface ToolResultEvent extends BaseEvent {
  kind: "tool-result";
  callId: string | undefined;
  output: string;
}

export interface FileWriteEvent extends BaseEvent {
  kind: "file-write";
  path: string;
  tool: string;
}

export type BenchEvent =
  | UserMessageEvent
  | AssistantMessageEvent
  | ToolCallEvent
  | ToolResultEvent
  | FileWriteEvent;

export interface NormalizedTranscript {
  session: SessionInfo;
  events: BenchEvent[];
  turnCount: number;
  sourcePath: string;
}
