import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const AUDIT_PATH = resolve(REPO_ROOT, "skills/plan/references/audit.md");

export interface CorrectionOutcome {
  result: "corrected" | "failed" | "unknown" | "conflict";
  continues: boolean;
}

// Read the shipped policy, not a second implementation of its state machine.
// Consumers exercise mock traces; they do not prove that an Agent obeys the policy.
export function readCorrectionOutcomes(): Map<string, CorrectionOutcome> {
  const markdown = readFileSync(AUDIT_PATH, "utf8");
  const section = /^#{2,3} Correction outcomes\n([\s\S]*?)(?=\n#{2,3} |(?![\s\S]))/m.exec(markdown);
  if (!section) throw new Error("Missing Plan correction outcomes table");
  const lines = section[1]!.split("\n").filter((line) => line.startsWith("|"));
  const cells = (line: string) =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim().replaceAll("`", ""));
  if (cells(lines[0] ?? "").join(",") !== "event,result,continue") {
    throw new Error("Unexpected Plan correction outcomes columns");
  }

  const outcomes = new Map<string, CorrectionOutcome>();
  for (const line of lines.slice(2)) {
    const [event, result, continues] = cells(line);
    if (
      !event ||
      outcomes.has(event) ||
      !["corrected", "failed", "unknown", "conflict"].includes(result ?? "") ||
      !["yes", "no"].includes(continues ?? "")
    ) {
      throw new Error(`Invalid Plan correction outcome: ${line}`);
    }
    outcomes.set(event, {
      result: result as CorrectionOutcome["result"],
      continues: continues === "yes",
    });
  }
  return outcomes;
}
