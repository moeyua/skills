import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { runMockIssueBatch, type MockBatchItem } from "./plan-issue-harness.ts";

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
