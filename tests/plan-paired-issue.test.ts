import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import {
  parseManagedIssue,
  renderManagedIssue,
  runMockPairedSync,
  type IssueProjection,
  type MockIssueState,
} from "./plan-paired-issue.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_PATH = resolve(REPO_ROOT, "skills/plan/SKILL.md");
const LOCAL_PATH = resolve(REPO_ROOT, "skills/plan/references/target-local.md");
const ISSUE_PATH = resolve(REPO_ROOT, "skills/plan/references/target-issue.md");
const BOTH_PATH = resolve(REPO_ROOT, "skills/plan/references/target-both.md");

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
