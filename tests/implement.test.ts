import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IMPLEMENT = readFileSync(resolve(REPO_ROOT, "skills/implement/SKILL.md"), "utf8");
const IMPLEMENT_SPEC = readFileSync(resolve(REPO_ROOT, "specs/implement/spec.md"), "utf8");
const CHECK = readFileSync(resolve(REPO_ROOT, "skills/check/SKILL.md"), "utf8");

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
