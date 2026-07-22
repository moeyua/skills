/**
 * Render a normalized transcript into judge-readable text.
 *
 * Turn markers anchor the judge's evidence references; long tool outputs and
 * injected context are truncated because flow compliance lives in the visible
 * conversation structure, not in tool payloads.
 */

import type { NormalizedTranscript } from "../normalize/events.ts";

export interface RenderOptions {
  maxToolOutputChars?: number;
  maxUserMessageChars?: number;
  maxAssistantMessageChars?: number;
  maxToolInputChars?: number;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…(截断,原 ${text.length} 字符)`;
}

export function renderTranscript(
  transcript: NormalizedTranscript,
  opts: RenderOptions = {},
): string {
  const maxTool = opts.maxToolOutputChars ?? 600;
  const maxUser = opts.maxUserMessageChars ?? 4000;
  const maxAssistant = opts.maxAssistantMessageChars ?? 8000;
  const maxInput = opts.maxToolInputChars ?? 400;

  const lines: string[] = [];
  for (const e of transcript.events) {
    const tag = e.sidechain === true ? " (subagent)" : "";
    const t = `[T${e.turn}]`;
    switch (e.kind) {
      case "user-message":
        lines.push(`${t} USER: ${truncate(e.text, maxUser)}`);
        break;
      case "assistant-message":
        lines.push(`${t} ASSISTANT${tag}: ${truncate(e.text, maxAssistant)}`);
        break;
      case "tool-call": {
        const input = typeof e.input === "string" ? e.input : JSON.stringify(e.input ?? {});
        lines.push(`${t} TOOL_CALL ${e.name}${tag}: ${truncate(input, maxInput)}`);
        break;
      }
      case "tool-result":
        if (e.sidechain === true) break;
        lines.push(`${t} TOOL_RESULT: ${truncate(e.output, maxTool)}`);
        break;
      case "file-write":
        lines.push(`${t} FILE_WRITE ${e.path}(${e.tool})${tag}`);
        break;
    }
  }
  return lines.join("\n");
}

/**
 * Fit the rendering into a character budget by tightening truncation in
 * stages; flow structure (turn markers, questions, file writes) survives,
 * bulky tool payloads go first. Last resort keeps head and tail.
 */
export function renderTranscriptCapped(
  transcript: NormalizedTranscript,
  budgetChars = 300_000,
): string {
  const stages: RenderOptions[] = [
    {},
    { maxToolOutputChars: 200, maxAssistantMessageChars: 4000, maxToolInputChars: 200 },
    {
      maxToolOutputChars: 80,
      maxAssistantMessageChars: 2000,
      maxUserMessageChars: 1500,
      maxToolInputChars: 120,
    },
  ];
  let rendered = "";
  for (const opts of stages) {
    rendered = renderTranscript(transcript, opts);
    if (rendered.length <= budgetChars) return rendered;
  }
  const half = Math.floor(budgetChars / 2);
  return `${rendered.slice(0, half)}\n…(会话过长,中段已截断)…\n${rendered.slice(-half)}`;
}
