import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { AUDIT_PATH, readCorrectionOutcomes } from "./plan-audit.ts";
import {
  hashTree,
  runMockIssueBatch,
  runMockIssueCorrections,
  type CorrectionSnapshot,
  type MockCorrection,
} from "./plan-issue-harness.ts";
import {
  parseManagedIssue,
  renderManagedIssue,
  runMockPairedCorrection,
  type IssueProjection,
} from "./plan-paired-issue.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET_PATHS = {
  local: resolve(REPO_ROOT, "skills/plan/references/target-local.md"),
  issue: resolve(REPO_ROOT, "skills/plan/references/target-issue.md"),
  both: resolve(REPO_ROOT, "skills/plan/references/target-both.md"),
};

describe("plan post-generation audit contract", () => {
  const skill = readFileSync(resolve(REPO_ROOT, "skills/plan/SKILL.md"), "utf8");

  it("links Plan and all three target contracts to the shared audit reference", () => {
    expect(existsSync(AUDIT_PATH)).toBe(true);
    expect(skill).toContain("references/audit.md");
    for (const path of Object.values(TARGET_PATHS)) {
      expect(readFileSync(path, "utf8"), path).toContain("](audit.md)");
    }
  });

  it("resolves the audit support link to the current Review entry", () => {
    const audit = readFileSync(AUDIT_PATH, "utf8");
    const links = [...audit.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) =>
      resolve(dirname(AUDIT_PATH), match[1]!),
    );
    expect(links).toContain(resolve(REPO_ROOT, "skills/review/SKILL.md"));
    expect(existsSync(resolve(REPO_ROOT, "skills/review/SKILL.md"))).toBe(true);
  });

  it("defines correction results separately from permission to continue", () => {
    expect(Object.fromEntries(readCorrectionOutcomes())).toEqual({
      "edit-success-target-match": { result: "corrected", continues: true },
      "edit-definite-failure-original": { result: "failed", continues: false },
      "edit-definite-failure-target-match": { result: "corrected", continues: false },
      "edit-ambiguous-target-match": { result: "corrected", continues: false },
      "edit-unmatched-or-unreadable": { result: "unknown", continues: false },
      "prewrite-conflict": { result: "conflict", continues: false },
      "label-failure": { result: "failed", continues: false },
    });
  });
});

describe("plan Issue audit correction mock traces", () => {
  const snapshot = (index: number): CorrectionSnapshot => ({
    url: `https://github.com/owner/repo/issues/${index + 1}`,
    title: `Problem ${index + 1}`,
    body: `## Problem\n\nKnown behavior.\n\n<!-- codex-plan-issue-batch: test-batch/${index + 1} -->`,
    labels: ["fix", "triage"],
  });
  const correction = (index: number, event = "edit-success-target-match"): MockCorrection => ({
    index,
    baseline: snapshot(index),
    current: snapshot(index),
    event,
  });
  const withProject = (run: (root: string) => void) => {
    const root = mkdtempSync(join(tmpdir(), "plan-issue-audit-"));
    writeFileSync(join(root, "sentinel.txt"), "unchanged\n");
    try {
      const before = hashTree(root);
      run(root);
      expect(hashTree(root), "mock correction phase must not write the project").toBe(before);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  };

  it("edits created rows once and leaves reused rows read-only without replacing the ledger", () => {
    withProject((root) => {
      const generation = runMockIssueBatch(
        root,
        ["fix"],
        [{ type: "fix" }, { type: "fix", reused: true }, { type: "fix" }],
      );
      const result = runMockIssueCorrections(generation, [
        correction(0),
        correction(1),
        correction(2),
      ]);

      expect(result.results).toEqual(["corrected", "read-only", "corrected"]);
      expect(result.ledger).toEqual(["created", "reused", "created"]);
      expect(result.calls).toEqual(
        [0, 2].flatMap((index) => [
          `issue-view:${snapshot(index).url}`,
          `issue-edit:${snapshot(index).url}`,
          `issue-view:${snapshot(index).url}`,
        ]),
      );
    });
  });

  it.each(["title", "body", "labels", "url"] as const)(
    "stops before editing when the created Issue's protected %s changed",
    (field) => {
      withProject((root) => {
        const generation = runMockIssueBatch(root, ["fix"], [{ type: "fix" }, { type: "fix" }]);
        const first = correction(0);
        first.current = {
          ...first.current,
          [field]: field === "labels" ? ["feat", "triage"] : "human change",
        };
        const result = runMockIssueCorrections(generation, [first, correction(1)]);

        expect(result.results).toEqual(["conflict", "not-attempted"]);
        expect(result.calls).toEqual([`issue-view:${snapshot(0).url}`]);
        expect(result.ledger).toEqual(generation.ledger);
      });
    },
  );

  it("allows unrelated labels while bounding corrections to one edit per canonical Issue", () => {
    withProject((root) => {
      const generation = runMockIssueBatch(root, ["fix"], [{ type: "fix" }]);
      const first = correction(0);
      first.current.labels.push("human-label");
      const result = runMockIssueCorrections(generation, [first, correction(0)]);

      expect(result.results).toEqual(["corrected", "not-attempted"]);
      expect(result.calls).toEqual([
        `issue-view:${snapshot(0).url}`,
        `issue-edit:${snapshot(0).url}`,
        `issue-view:${snapshot(0).url}`,
      ]);
      expect(first.current.labels).toEqual(["fix", "triage", "human-label"]);
    });
  });

  it.each([
    { event: "edit-definite-failure-original", result: "failed" },
    { event: "edit-definite-failure-target-match", result: "corrected" },
    { event: "edit-ambiguous-target-match", result: "corrected" },
    { event: "edit-unmatched-or-unreadable", result: "unknown" },
    { event: "label-failure", result: "failed" },
  ])("reads back each attempted edit once and stops after $event", ({ event, result: status }) => {
    withProject((root) => {
      const generation = runMockIssueBatch(root, [], [{ type: "fix" }, { type: "fix" }]);
      const result = runMockIssueCorrections(generation, [
        { ...correction(0, event), missingLabel: "feat" },
        correction(1),
      ]);
      expect(result.results).toEqual([status, "not-attempted"]);
      expect(result.createdLabels).toEqual(event === "label-failure" ? ["fix"] : ["fix", "feat"]);
      expect(result.calls).toEqual([
        `issue-view:${snapshot(0).url}`,
        "label-create:feat",
        ...(event === "label-failure"
          ? []
          : [`issue-edit:${snapshot(0).url}`, `issue-view:${snapshot(0).url}`]),
      ]);
      expect(result.ledger).toEqual(generation.ledger);
    });
  });

  it.each(["definite-failure", "ambiguous-one-match", "ambiguous-not-one"] as const)(
    "does not restart a batch stopped by %s, even if its last row reconciles as created",
    (outcome) => {
      withProject((root) => {
        const generation = runMockIssueBatch(root, [], [{ type: "fix", outcome }]);
        const result = runMockIssueCorrections(generation, [correction(0)]);

        expect(generation.stopped).toBe(true);
        expect(result.calls).toEqual([]);
        expect(result.results).toEqual(["not-attempted"]);
        expect(result.ledger).toEqual(generation.ledger);
        expect(result.createdLabels).toEqual(["fix"]);
      });
    },
  );
});

describe("plan paired Issue audit correction mock traces", () => {
  const projection = {
    title: "Problem recorded at audit time",
    type: "fix",
    managedBody: "## Problem\n\nThe result is missing a required constraint.",
  } satisfies IssueProjection;
  const baseline = renderManagedIssue(
    projection,
    "Human notes before.\n\n",
    "\n\nHuman notes after.",
  );
  const desired = {
    ...projection,
    managedBody: `${projection.managedBody}\n\nThe required constraint applies.`,
  };

  it("preserves the latest outside body and unrelated labels while correcting the audited projection", () => {
    const current = {
      ...baseline,
      body: `New human context.\n${baseline.body}\nNew human follow-up.`,
      labels: ["fix", "new-human-label"],
    };
    const result = runMockPairedCorrection(baseline, current, desired);

    expect(result.status).toBe("corrected");
    expect(result.continues).toBe(true);
    expect(result.calls).toEqual(["issue-view", "issue-edit", "issue-view:verify"]);
    expect(parseManagedIssue(result.remote)).toEqual({
      projection: desired,
      before: "New human context.\nHuman notes before.\n\n",
      after: "\n\nHuman notes after.\nNew human follow-up.",
    });
    expect([...result.remote.labels].sort()).toEqual(["fix", "new-human-label"]);
  });

  it("rejects a valid new envelope that no longer matches the audit baseline", () => {
    const current = renderManagedIssue({
      ...projection,
      title: "Concurrent valid managed revision",
    });
    const result = runMockPairedCorrection(baseline, current, desired);

    expect(parseManagedIssue(current)).toBeDefined();
    expect(result.status).toBe("conflict");
    expect(result.continues).toBe(false);
    expect(result.calls).toEqual(["issue-view"]);
    expect(result.remote).toEqual(current);
  });

  it.each([
    {
      name: "missing ownership",
      current: { ...baseline, body: "Human-owned body" },
      identitySame: true,
    },
    {
      name: "invalid digest",
      current: { ...baseline, title: "Human title change" },
      identitySame: true,
    },
    {
      name: "extra change-type label",
      current: { ...baseline, labels: ["fix", "feat"] },
      identitySame: true,
    },
    { name: "changed problem identity", current: baseline, identitySame: false },
  ])("does not acquire repair ownership after $name", ({ current, identitySame }) => {
    const result = runMockPairedCorrection(baseline, current, desired, { identitySame });

    expect(result.status).toBe("conflict");
    expect(result.continues).toBe(false);
    expect(result.calls).toEqual(["issue-view"]);
    expect(result.remote).toEqual(current);
  });

  it.each([
    { outcome: "definite-failure", status: "failed" },
    { outcome: "ambiguous-original", status: "unknown" },
    { outcome: "definite-failure-target", status: "corrected" },
    { outcome: "ambiguous-target", status: "corrected" },
    { outcome: "ambiguous-partial", status: "unknown" },
  ] as const)(
    "keeps correction outcome and continuation distinct after $outcome",
    ({ outcome, status }) => {
      const result = runMockPairedCorrection(baseline, baseline, desired, { outcome });

      expect(result.status).toBe(status);
      expect(result.continues).toBe(false);
      expect(result.calls).toEqual(["issue-view", "issue-edit", "issue-view:reconcile"]);
    },
  );

  it("does not edit the Issue for implementation-only correction or restart a stopped original operation", () => {
    const unchanged = runMockPairedCorrection(baseline, baseline, projection);
    expect(unchanged.status).toBe("unchanged");
    expect(unchanged.calls).toEqual(["issue-view"]);

    const stopped = runMockPairedCorrection(baseline, baseline, desired, { originalStopped: true });
    expect(stopped.status).toBe("not-attempted");
    expect(stopped.calls).toEqual([]);
    expect(stopped.remote).toEqual(baseline);
  });
});
