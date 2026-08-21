import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_PATH = resolve(REPO_ROOT, "skills/plan/SKILL.md");
const LOCAL_PATH = resolve(REPO_ROOT, "skills/plan/references/target-local.md");
const ISSUE_PATH = resolve(REPO_ROOT, "skills/plan/references/target-issue.md");
const BOTH_PATH = resolve(REPO_ROOT, "skills/plan/references/target-both.md");
const CHANGE_TYPES = ["fix", "feat", "refactor", "perf"] as const;

type ChangeType = (typeof CHANGE_TYPES)[number];

interface IssueProjection {
  title: string;
  type: ChangeType;
  managedBody: string;
}

interface MockIssueState {
  title: string;
  body: string;
  labels: string[];
}

type MockEditOutcome =
  | "success"
  | "definite-failure"
  | "ambiguous-target"
  | "ambiguous-original"
  | "ambiguous-partial";

const MANAGED_END = "<!-- /codex-plan-managed-issue -->";
const MANAGED_START =
  /<!-- codex-plan-managed-issue: v1 type=(fix|feat|refactor|perf) sha256=([0-9a-f]{64}) -->/g;

function projectionDigest(projection: IssueProjection): string {
  return createHash("sha256")
    .update("codex-plan-managed-issue:v1\0")
    .update(projection.title)
    .update("\0")
    .update(projection.type)
    .update("\0")
    .update(projection.managedBody)
    .digest("hex");
}

function renderManagedBlock(projection: IssueProjection): string {
  return [
    `<!-- codex-plan-managed-issue: v1 type=${projection.type} sha256=${projectionDigest(projection)} -->`,
    projection.managedBody,
    MANAGED_END,
  ].join("\n");
}

function renderManagedIssue(
  projection: IssueProjection,
  before: string = "",
  after: string = "",
): MockIssueState {
  return {
    title: projection.title,
    body: `${before}${renderManagedBlock(projection)}${after}`,
    labels: [projection.type],
  };
}

function parseManagedIssue(issue: MockIssueState):
  | {
      projection: IssueProjection;
      before: string;
      after: string;
    }
  | undefined {
  const starts = [...issue.body.matchAll(MANAGED_START)];
  if (starts.length !== 1) return undefined;

  const start = starts[0]!;
  const startIndex = start.index!;
  const contentStart = startIndex + start[0].length;
  const endIndex = issue.body.indexOf(MANAGED_END, contentStart);
  if (
    endIndex < 0 ||
    issue.body.indexOf(MANAGED_END, endIndex + MANAGED_END.length) >= 0 ||
    issue.body[contentStart] !== "\n" ||
    issue.body[endIndex - 1] !== "\n"
  ) {
    return undefined;
  }

  const type = start[1] as ChangeType;
  const managedLabels = issue.labels.filter((label) => CHANGE_TYPES.includes(label as ChangeType));
  if (managedLabels.length !== 1 || managedLabels[0] !== type) return undefined;

  const projection = {
    title: issue.title,
    type,
    managedBody: issue.body.slice(contentStart + 1, endIndex - 1),
  } satisfies IssueProjection;
  if (projectionDigest(projection) !== start[2]) return undefined;

  return {
    projection,
    before: issue.body.slice(0, startIndex),
    after: issue.body.slice(endIndex + MANAGED_END.length),
  };
}

function sameProjection(left: IssueProjection, right: IssueProjection): boolean {
  return (
    left.title === right.title && left.type === right.type && left.managedBody === right.managedBody
  );
}

function sameIssue(left: MockIssueState, right: MockIssueState): boolean {
  return (
    left.title === right.title &&
    left.body === right.body &&
    [...left.labels].sort().join("\0") === [...right.labels].sort().join("\0")
  );
}

function runMockPairedSync(
  current: MockIssueState,
  desired: IssueProjection,
  options: { identitySame?: boolean; outcome?: MockEditOutcome } = {},
): {
  status: "unchanged" | "updated" | "conflict" | "failed" | "unknown";
  calls: string[];
  remote: MockIssueState;
  temporaryBodiesRemaining: number;
} {
  const calls = ["issue-view"];
  const parsed = parseManagedIssue(current);
  if (options.identitySame === false || !parsed) {
    return {
      status: "conflict",
      calls,
      remote: current,
      temporaryBodiesRemaining: 0,
    };
  }

  if (sameProjection(parsed.projection, desired)) {
    return {
      status: "unchanged",
      calls,
      remote: current,
      temporaryBodiesRemaining: 0,
    };
  }

  const desiredLabels = current.labels.filter((label) => label !== parsed.projection.type);
  if (!desiredLabels.includes(desired.type)) desiredLabels.push(desired.type);
  const target = {
    title: desired.title,
    body: `${parsed.before}${renderManagedBlock(desired)}${parsed.after}`,
    labels: desiredLabels,
  } satisfies MockIssueState;

  const bodyRoot = mkdtempSync(join(tmpdir(), "plan-paired-issue-body-"));
  try {
    const bodyPath = join(bodyRoot, "body.md");
    writeFileSync(bodyPath, target.body);
    calls.push("issue-edit");
    rmSync(bodyPath);

    const outcome = options.outcome ?? "success";
    if (outcome === "success") {
      calls.push("issue-view:verify");
      return {
        status: "updated",
        calls,
        remote: target,
        temporaryBodiesRemaining: readdirSync(bodyRoot).length,
      };
    }

    calls.push("issue-view:reconcile");
    const observed =
      outcome === "ambiguous-target"
        ? target
        : outcome === "ambiguous-partial"
          ? { ...current, body: `${current.body}\npartial remote mutation` }
          : current;
    const status = sameIssue(observed, target)
      ? "updated"
      : sameIssue(observed, current)
        ? "failed"
        : "unknown";
    return {
      status,
      calls,
      remote: observed,
      temporaryBodiesRemaining: readdirSync(bodyRoot).length,
    };
  } finally {
    rmSync(bodyRoot, { recursive: true, force: true });
  }
}

describe("plan paired Issue contract", () => {
  const skill = readFileSync(SKILL_PATH, "utf8");
  const local = readFileSync(LOCAL_PATH, "utf8");
  const issue = readFileSync(ISSUE_PATH, "utf8");
  const both = readFileSync(BOTH_PATH, "utf8");

  it("separates stable Issue identity from mutable managed problem content", () => {
    expect(skill).toMatch(
      /canonical.+identity.+(?:stable|same).+(?:revise|update).+(?:content|problem record)/is,
    );
    expect(skill).not.toContain("editing existing Issues");
    expect(local).toMatch(/zero GitHub mutation/i);
    expect(issue).toMatch(/reused without editing/i);
    expect(both).toMatch(/implementation-only.+`unchanged`/is);
    expect(both).toMatch(/problem.+projection.+same.+canonical.+`updated`/is);
    expect(both).toMatch(/identity.+(?:split|merge|different problem).+before.+mutation/is);
    expect(both).toMatch(/managed block.+SHA-256/is);
    expect(both).toMatch(/outside.+managed block.+preserv/is);
    expect(both).toMatch(/missing.+marker.+digest mismatch.+`conflict`/is);
    expect(both).toMatch(
      /explicit adoption authority.+retain the entire fetched body byte-for-byte.+human-owned/is,
    );
    expect(both).toMatch(/adoption has no `unchanged` path/i);
    expect(both).toMatch(/created.+unchanged.+updated.+conflict.+failed.+unknown/is);
    expect(both).toMatch(/ambiguous.+read.+exactly once.+desired digest.+never retry/is);
    expect(both).not.toContain("never edit an existing Issue");
  });

  it("updates only the Issue-owned projection", () => {
    expect(both).toMatch(/managed problem projection/i);
    for (const field of ["why", "observable", "constraints", "non-goals", "evidence"]) {
      expect(both).toContain(field);
    }
    expect(both).toMatch(
      /technical approach.+architecture.+path-level.+(?:ordering|implementation order).+verification.+(?:excluded|never|not)/is,
    );
    expect(both).toMatch(/change-type label.+managed.+unrelated labels.+preserv/is);
  });
});

describe("plan paired Issue synchronization harness", () => {
  const originalProjection = {
    title: "Stale problem record",
    type: "fix",
    managedBody: "## Problem\n\nThe recorded behavior is stale.",
  } satisfies IssueProjection;
  const original = {
    ...renderManagedIssue(
      originalProjection,
      "Human context before.\n\n",
      "\n\nHuman notes after.",
    ),
    labels: ["fix", "triage"],
  } satisfies MockIssueState;

  it("does not edit for an implementation-only plan revision", () => {
    const result = runMockPairedSync(original, originalProjection);

    expect(result.status).toBe("unchanged");
    expect(result.calls).toEqual(["issue-view"]);
    expect(result.remote).toEqual(original);
  });

  it("updates the managed projection and preserves human-owned content", () => {
    const desired = {
      title: "Current problem record",
      type: "feat",
      managedBody: "## Gap\n\nThe current capability is missing.",
    } satisfies IssueProjection;
    const result = runMockPairedSync(original, desired);

    expect(result.status).toBe("updated");
    expect(result.calls).toEqual(["issue-view", "issue-edit", "issue-view:verify"]);
    expect(result.remote.title).toBe(desired.title);
    expect(result.remote.body).toMatch(/^Human context before\.\n\n<!-- codex-plan-managed-issue:/);
    expect(result.remote.body).toMatch(
      /<!-- \/codex-plan-managed-issue -->\n\nHuman notes after\.$/,
    );
    expect(result.remote.labels.sort()).toEqual(["feat", "triage"]);
    expect(parseManagedIssue(result.remote)?.projection).toEqual(desired);
    expect(result.temporaryBodiesRemaining).toBe(0);
  });

  it.each([
    {
      name: "managed content changed outside Plan",
      issue: { ...original, body: original.body.replace("recorded behavior", "human rewrite") },
      identitySame: true,
    },
    {
      name: "legacy Issue has no ownership marker",
      issue: { ...original, body: "Legacy body without a managed block." },
      identitySame: true,
    },
    {
      name: "the bounded problem identity changed",
      issue: original,
      identitySame: false,
    },
  ])("returns conflict without mutation when $name", ({ issue, identitySame }) => {
    const desired = { ...originalProjection, managedBody: "Changed problem." };
    const result = runMockPairedSync(issue, desired, { identitySame });

    expect(result.status).toBe("conflict");
    expect(result.calls).toEqual(["issue-view"]);
    expect(result.remote).toEqual(issue);
  });

  it.each([
    { outcome: "definite-failure", status: "failed" },
    { outcome: "ambiguous-original", status: "failed" },
    { outcome: "ambiguous-target", status: "updated" },
    { outcome: "ambiguous-partial", status: "unknown" },
  ] as const)("reconciles a non-success edit once: $outcome", ({ outcome, status }) => {
    const desired = { ...originalProjection, managedBody: "Current problem." };
    const result = runMockPairedSync(original, desired, { outcome });

    expect(result.status).toBe(status);
    expect(result.calls).toEqual(["issue-view", "issue-edit", "issue-view:reconcile"]);
    expect(result.temporaryBodiesRemaining).toBe(0);
  });
});
