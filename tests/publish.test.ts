import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISH = readFileSync(resolve(REPO_ROOT, "skills/publish/SKILL.md"), "utf8");
const SPEC = readFileSync(resolve(REPO_ROOT, "specs/publish/spec.md"), "utf8");

describe("publish state machine", () => {
  it("completes only the missing commit, push, and PR actions", () => {
    expect(PUBLISH).toContain("commit → push → pull request");
    expect(PUBLISH).toContain("skip every sub-action whose state is already satisfied");
    expect(SPEC).toContain("按当前状态完成 commit、push 与 PR");
  });

  it("keeps commit history intentional and secrets out", () => {
    expect(PUBLISH).toMatch(/never use `git add -A` or `git add \.`/i);
    expect(PUBLISH).toContain("at most three independently revertible topics");
    expect(PUBLISH).toContain("first line at most 72 characters");
  });

  it("never rewrites protected or remote history", () => {
    expect(PUBLISH).toContain("main`, `master`, `develop`");
    expect(PUBLISH).toContain("Never force-push");
    expect(PUBLISH).toContain("Never amend");
    expect(PUBLISH).toContain("Never change git or gh configuration");
  });

  it("builds the PR from the whole branch with a test plan", () => {
    expect(PUBLISH).toContain("git diff <base>...HEAD");
    expect(PUBLISH).toContain("## Summary");
    expect(PUBLISH).toContain("## Test plan");
  });

  it("uses an optional Issue without making it a gate", () => {
    expect(PUBLISH).toContain("Closes #N");
    expect(PUBLISH).toContain("No Issue association is a normal state");
  });
});
