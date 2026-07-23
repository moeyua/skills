import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IMPLEMENT = readFileSync(resolve(REPO_ROOT, "skills/implement/SKILL.md"), "utf8");
const IMPLEMENT_SPEC = readFileSync(resolve(REPO_ROOT, "specs/implement/spec.md"), "utf8");
const CHECK = readFileSync(resolve(REPO_ROOT, "skills/check/SKILL.md"), "utf8");
const DOCS = readFileSync(resolve(REPO_ROOT, "skills/docs/SKILL.md"), "utf8");

describe("implement entry contract", () => {
  it("accepts a clear request without requiring a plan", () => {
    expect(IMPLEMENT).toContain("A plan is optional context, not an entry gate");
    expect(IMPLEMENT_SPEC).toContain("没有 plan 时可从足够明确的当前请求执行");
    expect(IMPLEMENT).not.toContain("No plan yet? Run `/shape` first");
  });

  it("derives scope and change type from the best available context", () => {
    expect(IMPLEMENT).toContain("references/change-types.md");
    expect(IMPLEMENT).toContain("explicit request → associated plan → current conversation");
  });
});

describe("implement check loop", () => {
  it("always invokes the standalone check gate after implementation", () => {
    expect(IMPLEMENT).toContain("Invoke check after the implementation verification passes");
    expect(IMPLEMENT_SPEC).toContain("实现完成后自动运行 check");
  });

  it("repairs only in-scope blockers and rechecks", () => {
    expect(IMPLEMENT).toContain(
      "fix only blockers that are inside the authorized implementation scope",
    );
    expect(IMPLEMENT).toContain("run check again");
    expect(IMPLEMENT_SPEC).toContain("实现范围内 findings 自动修复并重新 check");
  });

  it("stops on changed intent, scope expansion, new dependencies, or no progress", () => {
    for (const boundary of ["intent change", "scope expansion", "new dependency", "no progress"]) {
      expect(IMPLEMENT).toContain(boundary);
    }
  });

  it("does not change standalone check's read-only boundary", () => {
    expect(CHECK).toContain("check runs and reads them, never edits");
    expect(CHECK).not.toContain("invoke implement");
  });
});

describe("implement durable-docs finish", () => {
  it("invokes docs only for one of three evidence-backed triggers", () => {
    expect(IMPLEMENT).toContain("associated plan contains `## Spec delta`");
    expect(IMPLEMENT).toContain("request explicitly names a catalog or document target");
    expect(IMPLEMENT).toContain("verified change makes an existing durable claim false");
    expect(IMPLEMENT).toContain("Do not invoke docs merely because the catalog exists");
  });

  it("runs a complete-diff check after docs and resynchronizes changed truth", () => {
    expect(IMPLEMENT).toContain(
      "Run the initial check loop before deciding whether to write durable docs",
    );
    expect(IMPLEMENT).toContain("invoke check again on the complete diff");
    expect(IMPLEMENT).toContain("re-run docs before the next complete-diff check");
  });

  it("preserves standalone docs authority and independent entry", () => {
    expect(DOCS).toContain("Docs records truth that has already been established");
    expect(DOCS).toContain("Every skill is independently invoked");
    expect(IMPLEMENT).toContain("docs keeps its existing catalog and source-discipline contract");
  });

  it("reports the docs decision and a complete final summary", () => {
    expect(IMPLEMENT).toContain("Docs: updated | not needed | stopped");
    expect(IMPLEMENT).toContain("Summary:");
    expect(IMPLEMENT).toContain("Do not continue into publish or release");
  });

  it("marks a plan done only after every required outcome is complete", () => {
    expect(IMPLEMENT).toContain("every plan outcome and required acceptance is complete");
    expect(IMPLEMENT).toContain("leave the plan approved and report the incomplete requirement");
  });
});
