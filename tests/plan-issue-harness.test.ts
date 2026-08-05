import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, it } from "vite-plus/test";

const CHANGE_TYPES = ["fix", "feat", "refactor", "perf"] as const;

type MockCreateOutcome =
  | "success"
  | "definite-failure"
  | "ambiguous-one-match"
  | "ambiguous-not-one";

interface MockBatchItem {
  type: (typeof CHANGE_TYPES)[number];
  outcome?: MockCreateOutcome;
  reused?: boolean;
}

function hashTree(root: string): string {
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

function runMockIssueBatch(
  projectRoot: string,
  existingLabels: string[],
  items: MockBatchItem[],
): {
  calls: string[];
  createdLabels: string[];
  ledger: string[];
  overall: string;
  treeHashBefore: string;
  treeHashAfter: string;
  temporaryBodiesRemaining: number;
} {
  const treeHashBefore = hashTree(projectRoot);
  const calls = ["auth-status", "repo-view", "label-list"];
  const createdLabels: string[] = [];
  const ledger = Array<string>(items.length).fill("pending");
  const bodyRoot = mkdtempSync(join(tmpdir(), "plan-issue-bodies-"));

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
      treeHashBefore,
      treeHashAfter: hashTree(projectRoot),
      temporaryBodiesRemaining: readdirSync(bodyRoot).length,
    };
  } finally {
    rmSync(bodyRoot, { recursive: true, force: true });
  }
}

describe("plan Issue batch integration harness", () => {
  it("records mock gh calls and keeps issue target project writes at zero", () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), "plan-issue-project-"));
    writeFileSync(join(fixtureRoot, "sentinel.txt"), "unchanged\n");

    try {
      const fixtures = [
        {
          name: "created labels survive a definite Issue failure",
          existingLabels: [],
          items: [
            { type: "feat", outcome: "definite-failure" },
            { type: "fix", outcome: "success" },
          ],
          calls: [
            "auth-status",
            "repo-view",
            "label-list",
            "label-create:feat",
            "label-create:fix",
            "issue-create:1",
          ],
          createdLabels: ["feat", "fix"],
          ledger: ["failed", "not-attempted"],
          overall: "failed",
        },
        {
          name: "ambiguous create reconciles once and stops",
          existingLabels: [],
          items: [
            { type: "feat", outcome: "ambiguous-one-match" },
            { type: "fix", outcome: "success" },
          ],
          calls: [
            "auth-status",
            "repo-view",
            "label-list",
            "label-create:feat",
            "label-create:fix",
            "issue-create:1",
            "marker-query:1",
          ],
          createdLabels: ["feat", "fix"],
          ledger: ["created", "not-attempted"],
          overall: "partial",
        },
        {
          name: "case-only label collision blocks before mutation",
          existingLabels: ["Feat"],
          items: [{ type: "feat", outcome: "success" }],
          calls: ["auth-status", "repo-view", "label-list"],
          createdLabels: [],
          ledger: ["blocked"],
          overall: "blocked",
        },
      ] satisfies Array<{
        name: string;
        existingLabels: string[];
        items: MockBatchItem[];
        calls: string[];
        createdLabels: string[];
        ledger: string[];
        overall: string;
      }>;

      for (const fixture of fixtures) {
        const result = runMockIssueBatch(fixtureRoot, fixture.existingLabels, fixture.items);
        expect(result.calls, `${fixture.name}: gh transcript`).toEqual(fixture.calls);
        expect(result.createdLabels, `${fixture.name}: persistent label side effects`).toEqual(
          fixture.createdLabels,
        );
        expect(result.ledger, `${fixture.name}: complete ledger`).toEqual(fixture.ledger);
        expect(result.overall, `${fixture.name}: aggregate result`).toBe(fixture.overall);
        expect(result.treeHashAfter, `${fixture.name}: project tree hash`).toBe(
          result.treeHashBefore,
        );
        expect(result.temporaryBodiesRemaining, `${fixture.name}: temp cleanup`).toBe(0);
      }

      const bothCollision = runMockIssueBatch(
        fixtureRoot,
        ["Feat"],
        [{ type: "feat", outcome: "success" }],
      );
      const bothOverall = bothCollision.overall === "success" ? "success" : "partial";
      expect(bothCollision.calls, "both collision: read-only preflight transcript").toEqual([
        "auth-status",
        "repo-view",
        "label-list",
      ]);
      expect(bothCollision.createdLabels, "both collision: no label mutation").toEqual([]);
      expect(
        bothCollision.calls.some((call) => call.startsWith("issue-create")),
        "both collision: no Issue mutation",
      ).toBe(false);
      expect(bothOverall, "both collision: valid local plan makes remote failure partial").toBe(
        "partial",
      );
      expect(bothCollision.treeHashAfter, "both collision: mock project tree hash").toBe(
        bothCollision.treeHashBefore,
      );
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });
});
