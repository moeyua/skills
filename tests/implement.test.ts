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
    expect(IMPLEMENT_SPEC).toContain("Requirement: plan 是可选上下文");
    expect(IMPLEMENT).not.toContain("No plan yet? Run `/shape` first");
  });

  it("loads the shared change-type evidence source", () => {
    expect(IMPLEMENT).toContain("references/change-types.md");
  });
});

describe("implement adaptive composition", () => {
  it("retains TDD as an on-demand proof strategy", () => {
    expect(IMPLEMENT).toMatch(/TDD[\s\S]*(?:when|where|if)/i);
    expect(IMPLEMENT_SPEC).toContain("Requirement: TDD 按需保留");
    expect(IMPLEMENT_SPEC).not.toContain("fix/feat 走红→绿");
  });

  it("owns capability composition instead of forcing a chain or handing it to the user", () => {
    expect(IMPLEMENT_SPEC).toContain("自主组合");
    expect(IMPLEMENT).toMatch(/check[\s\S]*docs/i);
    expect(IMPLEMENT).not.toContain("implement does not call either automatically");
    expect(IMPLEMENT_SPEC).not.toContain("实现完成后自动运行 check");
  });

  it("keeps check read-only and docs authority-bound", () => {
    expect(CHECK).toMatch(/read-only|只读/i);
    expect(DOCS).toMatch(/authoritative|authority|权威/i);
  });

  it("keeps the associated plan lifecycle and credential boundary explicit", () => {
    expect(IMPLEMENT).toMatch(/draft[\s\S]*approved[\s\S]*before[\s\S]*(?:edit|implementation)/i);
    expect(IMPLEMENT).toMatch(/done[\s\S]*(?:not|never)[\s\S]*(?:replay|reopen)/i);
    for (const destination of ["code", "tests", "logs", "plans", "docs", "reports"]) {
      expect(IMPLEMENT).toContain(destination);
    }
  });
});
