import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = readFileSync(resolve(REPO_ROOT, "skills/publish/SKILL.md"), "utf8");
const GIT_STATE = readFileSync(
  resolve(REPO_ROOT, "skills/publish/references/git-state.md"),
  "utf8",
);
const PULL_REQUEST = readFileSync(
  resolve(REPO_ROOT, "skills/publish/references/pull-request.md"),
  "utf8",
);
const RECOVERY = readFileSync(resolve(REPO_ROOT, "skills/publish/references/recovery.md"), "utf8");
const PUBLISH = [ENTRY, GIT_STATE, PULL_REQUEST, RECOVERY].join("\n");
const SPEC = readFileSync(resolve(REPO_ROOT, "specs/publish/spec.md"), "utf8");

describe("publish state machine", () => {
  it("routes state, pull-request, and recovery knowledge from the main entry", () => {
    expect(ENTRY).toContain("references/git-state.md");
    expect(ENTRY).toContain("references/pull-request.md");
    expect(ENTRY).toContain("references/recovery.md");
  });

  it("completes only the missing commit, push, and PR actions", () => {
    expect(PUBLISH).toContain("commit → push → pull request");
    expect(PUBLISH).toContain("skip every sub-action whose state is already satisfied");
    expect(SPEC).toContain("按当前状态完成 commit、push 与 PR");
  });

  it("keeps commit history intentional and secrets out", () => {
    expect(PUBLISH).toMatch(/never use `git add -A` or `git add \.`/i);
    for (const term of ["credentials", "private keys", "secret-bearing configuration"]) {
      expect(GIT_STATE).toContain(term);
    }
    expect(PUBLISH).toContain("at most three independently revertible topics");
    expect(PUBLISH).toMatch(/first line (?:is )?at most 72 characters/i);
  });

  it("never rewrites protected or remote history", () => {
    expect(GIT_STATE).toContain("detached HEAD");
    expect(GIT_STATE).toContain("in-progress merge/rebase/cherry-pick");
    expect(GIT_STATE).toContain("resolved default branch");
    expect(PUBLISH).toContain("main`, `master`, `develop`");
    expect(PUBLISH).toContain("Never force-push");
    expect(PUBLISH).toContain("Never amend");
    expect(PUBLISH).toMatch(/never[\s\S]{0,120}change git or gh configuration/i);
  });

  it("builds the PR from the whole branch with a test plan", () => {
    expect(PUBLISH).toContain("git diff <base>...HEAD");
    expect(PUBLISH).toContain("## Summary");
    expect(PUBLISH).toContain("## Test plan");
    expect(PULL_REQUEST).toContain("do not change draft/readiness unless the user explicitly asks");
    expect(PULL_REQUEST).toMatch(
      /temporary body file[\s\S]*(?:remove|delete)[\s\S]*(?:success|failure|ambiguous)/i,
    );
  });

  it("uses an optional Issue without making it a gate", () => {
    expect(PUBLISH).toContain("Closes #N");
    expect(PUBLISH).toContain("No Issue association is a normal state");
  });
});
