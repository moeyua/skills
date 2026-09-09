import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readCorrectionOutcomes } from "./plan-audit.ts";

const CHANGE_TYPES = ["fix", "feat", "refactor", "perf"] as const;

type ChangeType = (typeof CHANGE_TYPES)[number];

export interface IssueProjection {
  title: string;
  type: ChangeType;
  managedBody: string;
}

export interface MockIssueState {
  title: string;
  body: string;
  labels: string[];
}

type MockEditOutcome =
  | "success"
  | "definite-failure"
  | "definite-failure-target"
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

export function renderManagedIssue(
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

export function parseManagedIssue(issue: MockIssueState):
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

export function runMockPairedSync(
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
      outcome === "ambiguous-target" || outcome === "definite-failure-target"
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

// Reuse the original synchronization mock; the shipped correction policy owns
// the additional phase's outcome and stop rule. This is not Agent-run evidence.
export function runMockPairedCorrection(
  baseline: MockIssueState,
  current: MockIssueState,
  desired: IssueProjection,
  options: { identitySame?: boolean; outcome?: MockEditOutcome; originalStopped?: boolean } = {},
) {
  if (options.originalStopped) {
    return { status: "not-attempted", calls: [], remote: current, continues: false };
  }
  const policy = readCorrectionOutcomes();
  const parsedBaseline = parseManagedIssue(baseline);
  const parsedCurrent = parseManagedIssue(current);
  if (
    !parsedBaseline ||
    !parsedCurrent ||
    !sameProjection(parsedBaseline.projection, parsedCurrent.projection)
  ) {
    const transition = policy.get("prewrite-conflict")!;
    return {
      status: transition.result,
      calls: ["issue-view"],
      remote: current,
      continues: transition.continues,
    };
  }

  const result = runMockPairedSync(current, desired, options);
  if (result.status === "unchanged") return { ...result, continues: true };
  const event =
    result.status === "conflict"
      ? "prewrite-conflict"
      : result.status === "updated"
        ? options.outcome === "definite-failure-target"
          ? "edit-definite-failure-target-match"
          : options.outcome === "ambiguous-target"
            ? "edit-ambiguous-target-match"
            : "edit-success-target-match"
        : options.outcome === "definite-failure" && sameIssue(result.remote, current)
          ? "edit-definite-failure-original"
          : "edit-unmatched-or-unreadable";
  const transition = policy.get(event);
  if (!transition) throw new Error(`Missing correction event: ${event}`);
  return { ...result, status: transition.result, continues: transition.continues };
}
