import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { readCorrectionOutcomes } from "./plan-audit.ts";

const CHANGE_TYPES = ["fix", "feat", "refactor", "perf"] as const;

export type MockCreateOutcome =
  | "success"
  | "definite-failure"
  | "ambiguous-one-match"
  | "ambiguous-not-one";

export interface MockBatchItem {
  type: (typeof CHANGE_TYPES)[number];
  outcome?: MockCreateOutcome;
  reused?: boolean;
}

export function hashTree(root: string): string {
  const hash = createHash("sha256");
  const visit = (directory: string): void => {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      hash.update(relative(root, path));
      if (statSync(path).isDirectory()) {
        visit(path);
      } else {
        hash.update(readFileSync(path));
      }
    }
  };

  visit(root);
  return hash.digest("hex");
}

export function runMockIssueBatch(
  projectRoot: string,
  existingLabels: string[],
  items: MockBatchItem[],
): {
  calls: string[];
  createdLabels: string[];
  ledger: string[];
  overall: string;
  stopped: boolean;
  treeHashBefore: string;
  treeHashAfter: string;
  temporaryBodiesRemaining: number;
} {
  const treeHashBefore = hashTree(projectRoot);
  const calls = ["auth-status", "repo-view", "label-list"];
  const createdLabels: string[] = [];
  const ledger = Array<string>(items.length).fill("pending");
  const bodyRoot = mkdtempSync(join(tmpdir(), "plan-issue-bodies-"));
  let stopped = false;

  try {
    for (const [index, item] of items.entries()) {
      if (item.reused) {
        calls.push(`issue-view:${index + 1}`);
        ledger[index] = "reused";
      }
    }

    const candidates = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.reused);
    const collisionIndexes = candidates
      .filter(
        ({ item }) =>
          !existingLabels.includes(item.type) &&
          existingLabels.some((label) => label.toLowerCase() === item.type),
      )
      .map(({ index }) => index);

    if (collisionIndexes.length > 0) {
      for (const [index] of items.entries()) {
        ledger[index] = collisionIndexes.includes(index) ? "blocked" : "not-attempted";
      }
      return {
        calls,
        createdLabels,
        ledger,
        overall: "blocked",
        stopped: true,
        treeHashBefore,
        treeHashAfter: hashTree(projectRoot),
        temporaryBodiesRemaining: readdirSync(bodyRoot).length,
      };
    }

    for (const { item } of candidates) {
      if (!existingLabels.includes(item.type) && !createdLabels.includes(item.type)) {
        calls.push(`label-create:${item.type}`);
        createdLabels.push(item.type);
      }
    }

    for (const { item, index } of candidates) {
      const bodyPath = join(bodyRoot, `${index + 1}.md`);
      writeFileSync(bodyPath, `mock body ${index + 1}\n`);
      calls.push(`issue-create:${index + 1}`);
      rmSync(bodyPath);

      const outcome = item.outcome ?? "success";
      if (outcome === "success") {
        ledger[index] = "created";
        continue;
      }

      stopped = true;
      if (outcome === "definite-failure") {
        ledger[index] = "failed";
      } else {
        calls.push(`marker-query:${index + 1}`);
        ledger[index] = outcome === "ambiguous-one-match" ? "created" : "unknown";
      }

      for (let later = index + 1; later < ledger.length; later += 1) {
        if (ledger[later] === "pending") {
          ledger[later] = "not-attempted";
        }
      }
      break;
    }

    const completed = ledger.filter((status) => status === "created" || status === "reused").length;
    const overall = ledger.every((status) => status === "created" || status === "reused")
      ? "success"
      : completed > 0
        ? "partial"
        : "failed";

    return {
      calls,
      createdLabels,
      ledger,
      overall,
      stopped,
      treeHashBefore,
      treeHashAfter: hashTree(projectRoot),
      temporaryBodiesRemaining: readdirSync(bodyRoot).length,
    };
  } finally {
    rmSync(bodyRoot, { recursive: true, force: true });
  }
}

export interface CorrectionSnapshot {
  url: string;
  title: string;
  body: string;
  labels: string[];
}

export interface MockCorrection {
  index: number;
  baseline: CorrectionSnapshot;
  current: CorrectionSnapshot;
  event: string;
  missingLabel?: string;
}

// This is a contract-driven mock transcript, not an Agent integration run.
export function runMockIssueCorrections(
  generation: ReturnType<typeof runMockIssueBatch>,
  corrections: MockCorrection[],
) {
  const policy = readCorrectionOutcomes();
  const calls: string[] = [];
  const results: string[] = [];
  const createdLabels = [...generation.createdLabels];
  const attemptedUrls = new Set<string>();
  let stopped = generation.stopped || generation.overall !== "success";
  for (const correction of corrections) {
    if (stopped || attemptedUrls.has(correction.baseline.url)) {
      results.push("not-attempted");
      continue;
    }
    if (generation.ledger[correction.index] !== "created") {
      results.push("read-only");
      continue;
    }

    const { baseline, current } = correction;
    calls.push(`issue-view:${baseline.url}`);
    const types = (snapshot: CorrectionSnapshot) =>
      snapshot.labels.filter((label) =>
        CHANGE_TYPES.includes(label as (typeof CHANGE_TYPES)[number]),
      );
    const baselineMatches =
      current.url === baseline.url &&
      current.title === baseline.title &&
      current.body === baseline.body &&
      types(current).length === 1 &&
      types(baseline).length === 1 &&
      types(current)[0] === types(baseline)[0];
    const event = baselineMatches ? correction.event : "prewrite-conflict";
    const transition = policy.get(event);
    if (!transition) throw new Error(`Missing correction event: ${event}`);
    if (event !== "prewrite-conflict") {
      if (correction.missingLabel) {
        calls.push(`label-create:${correction.missingLabel}`);
        if (event !== "label-failure") createdLabels.push(correction.missingLabel);
      }
      if (event.startsWith("edit-")) {
        attemptedUrls.add(baseline.url);
        calls.push(`issue-edit:${baseline.url}`, `issue-view:${baseline.url}`);
      }
    }
    results.push(transition.result);
    stopped = !transition.continues;
  }
  return { calls, results, createdLabels, ledger: [...generation.ledger] };
}
