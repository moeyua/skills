import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = readFileSync(
  resolve(REPO_ROOT, "skills/engineering/plan/references/plan-template.md"),
  "utf8",
);
const IMPLEMENT = readFileSync(
  resolve(REPO_ROOT, "skills/engineering/implement/references/assurance.md"),
  "utf8",
);
const VERIFY = readFileSync(
  resolve(REPO_ROOT, "skills/engineering/verify/references/acceptance.md"),
  "utf8",
);

interface Transition {
  event: string;
  authority: string;
  from: string;
  to: string;
}

function section(markdown: string, heading: string): string {
  const pattern = new RegExp(`^## ${heading}\\n\\n([\\s\\S]*?)(?=\\n## |(?![\\s\\S]))`, "m");
  const match = pattern.exec(markdown);
  expect(match, `missing ${heading} section`).not.toBeNull();
  return match![1]!;
}

const cells = (line: string) =>
  line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim().replaceAll("`", ""));

function tableRows(markdown: string, heading: string): string[][] {
  const lines = section(markdown, heading)
    .split("\n")
    .filter((line) => line.startsWith("|"));
  expect(lines.length, `${heading} must include header, divider, and rows`).toBeGreaterThan(2);
  return [lines[0]!, ...lines.slice(2)].map(cells);
}

function parseTransitionMatrix(markdown: string): Transition[] {
  const [header, ...rows] = tableRows(markdown, "Lifecycle transition matrix");
  expect(header).toEqual(["event", "authority/source", "from", "to"]);
  return rows.map(([event, authority, from, to]) => ({ event, authority, from, to }) as Transition);
}

describe("plan lifecycle contract", () => {
  it("defines only the draft, approved, and done transitions", () => {
    expect(parseTransitionMatrix(TEMPLATE)).toEqual([
      {
        event: "plan-created",
        authority: "Plan artifact authorization",
        from: "none",
        to: "draft",
      },
      {
        event: "implementation-authorized",
        authority: "explicit user request or active Implement scope",
        from: "draft",
        to: "approved",
      },
      {
        event: "implementation-delivered",
        authority: "Implement",
        from: "approved",
        to: "done",
      },
    ]);
  });

  it("records assurance without gating done", () => {
    const assurance = section(TEMPLATE, "Recorded assurance");
    const fields = [...assurance.matchAll(/^- `([^`]+)`:/gm)].map((match) => match[1]);
    expect(fields).toEqual(["Evidence and limitations", "Verify"]);
    expect(assurance).toMatch(/known limitations[\s\S]*never block[\s\S]*`done`/i);
    expect(assurance).toMatch(/cross-platform evidence[\s\S]*PR CI/i);
    expect(assurance).toMatch(/never suggest[\s\S]*(?:another machine|between machines)/i);
  });

  it("reads merged legacy plans as done", () => {
    const [header, ...rows] = tableRows(TEMPLATE, "Legacy status interpretation");
    expect(header).toEqual(["observed plan state", "implementation merged", "read as"]);
    expect(rows).toEqual([
      ["approved or candidate", "yes", "done"],
      ["candidate", "no", "approved"],
      ["done", "any", "done"],
    ]);
  });

  it("keeps independent Verify optional and decoupled from done", () => {
    expect(IMPLEMENT).toContain("../../verify/references/acceptance.md");
    const currentTemplate = TEMPLATE.replace(section(TEMPLATE, "Legacy status interpretation"), "");
    for (const text of [currentTemplate, IMPLEMENT, VERIFY]) {
      expect(text).not.toContain("attested for the exact current candidate");
      expect(text).not.toContain("acceptance-pass");
      expect(text).not.toMatch(/\bcandidate\b/);
    }
    expect(VERIFY).toContain("`pass`");
    expect(VERIFY).toContain("`findings`");
    expect(VERIFY).toContain("`inconclusive`");
  });
});
