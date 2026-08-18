import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = readFileSync(
  resolve(REPO_ROOT, "skills/plan/references/plan-template.md"),
  "utf8",
);
const IMPLEMENT = readFileSync(resolve(REPO_ROOT, "skills/implement/SKILL.md"), "utf8");
const CHECK = readFileSync(resolve(REPO_ROOT, "skills/check/SKILL.md"), "utf8");

interface Transition {
  event: string;
  authority: string;
  from: string;
  to: string;
  verdict: string;
  acceptance: string;
}

function section(markdown: string, heading: string): string {
  const pattern = new RegExp(`^## ${heading}\\n\\n([\\s\\S]*?)(?=\\n## |(?![\\s\\S]))`, "m");
  const match = pattern.exec(markdown);
  expect(match, `missing ${heading} section`).not.toBeNull();
  return match![1]!;
}

function parseTransitionMatrix(markdown: string): Transition[] {
  const lines = section(markdown, "Lifecycle transition matrix")
    .split("\n")
    .filter((line) => line.startsWith("|"));
  expect(lines.length, "transition matrix must include header, divider, and rows").toBeGreaterThan(
    2,
  );

  const cells = (line: string) =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim().replaceAll("`", ""));
  expect(cells(lines[0]!)).toEqual([
    "event",
    "authority/source",
    "from",
    "to",
    "verdict",
    "acceptance",
  ]);

  return lines.slice(2).map((line) => {
    const [event, authority, from, to, verdict, acceptance] = cells(line);
    return { event, authority, from, to, verdict, acceptance } as Transition;
  });
}

describe("attestation state contract", () => {
  it("defines the exact authorized lifecycle transitions", () => {
    expect(parseTransitionMatrix(TEMPLATE)).toEqual([
      {
        event: "plan-created",
        authority: "Plan artifact authorization",
        from: "none",
        to: "draft",
        verdict: "none",
        acceptance: "not established",
      },
      {
        event: "implementation-authorized",
        authority: "explicit user request or active Implement scope",
        from: "draft/candidate",
        to: "approved",
        verdict: "unchanged",
        acceptance: "unchanged",
      },
      {
        event: "candidate-produced",
        authority: "Implement",
        from: "approved",
        to: "candidate",
        verdict: "not run",
        acceptance: "not established",
      },
      {
        event: "scoped-pass",
        authority: "Check",
        from: "candidate",
        to: "candidate",
        verdict: "pass",
        acceptance: "not requested",
      },
      {
        event: "findings",
        authority: "Check",
        from: "candidate",
        to: "candidate",
        verdict: "findings",
        acceptance: "not established",
      },
      {
        event: "inconclusive",
        authority: "Check",
        from: "candidate",
        to: "candidate",
        verdict: "inconclusive",
        acceptance: "not established",
      },
      {
        event: "acceptance-pass",
        authority: "independent Check",
        from: "candidate",
        to: "done",
        verdict: "pass",
        acceptance: "attested for the exact current candidate",
      },
    ]);
  });

  it("persists one complete current assurance snapshot", () => {
    const assurance = section(TEMPLATE, "Recorded assurance snapshot");
    const fields = [...assurance.matchAll(/^- `([^`]+)`:/gm)].map((match) => match[1]);
    expect(fields).toEqual([
      "Candidate basis",
      "Candidate producer",
      "Evidence and limitations",
      "Check producer",
      "Verdict",
      "Acceptance",
    ]);
    expect(assurance).toContain("stable, independently recomputable identity");
    expect(assurance).toContain("do not append a history ledger");
    expect(assurance).toContain("not proof of globally latest validity");
  });

  it("does not upgrade legacy done plans without provenance", () => {
    const lines = section(TEMPLATE, "Legacy status interpretation")
      .split("\n")
      .filter((line) => line.startsWith("|"));
    const cells = (line: string) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim().replaceAll("`", ""));

    expect(cells(lines[0]!)).toEqual([
      "observed plan state",
      "Assurance record",
      "meaning",
      "acceptance",
    ]);
    expect(lines.slice(2).map(cells)).toEqual([
      [
        "done",
        "missing or incomplete",
        "historical implementation completion only",
        "not established",
      ],
      [
        "done",
        "complete basis-matched acceptance-pass",
        "time-scoped exact-basis accepted snapshot",
        "attested for the exact current candidate",
      ],
    ]);
  });

  it("keeps findings read-only and acceptance basis-scoped", () => {
    expect(IMPLEMENT).toContain("Check findings alone never create authorization");
    expect(IMPLEMENT).toContain("`findings` leave it at `candidate`");
    expect(CHECK).toContain("Report that basis and the Check producer/reference");
    expect(CHECK).toContain("Check findings deny acceptance but do not authorize repair");
    expect(CHECK).toContain("basis-matched `pass`");
  });
});
