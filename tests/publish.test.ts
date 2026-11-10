import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = readFileSync(resolve(REPO_ROOT, "skills/engineering/publish/SKILL.md"), "utf8");
const GIT_STATE = readFileSync(
  resolve(REPO_ROOT, "skills/engineering/publish/references/git-state.md"),
  "utf8",
);
const PULL_REQUEST = readFileSync(
  resolve(REPO_ROOT, "skills/engineering/publish/references/pull-request.md"),
  "utf8",
);
const RECOVERY = readFileSync(
  resolve(REPO_ROOT, "skills/engineering/publish/references/recovery.md"),
  "utf8",
);
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

  it("prefers rebase and falls back to squash only when rebase is unavailable", () => {
    const commands = PULL_REQUEST.split("\n").filter((line) => /^\s+gh pr merge /.test(line));
    expect(commands).toHaveLength(2);
    expect(commands.filter((command) => command.includes("--rebase"))).toHaveLength(1);
    expect(commands.filter((command) => command.includes("--squash"))).toHaveLength(1);
    for (const command of commands) {
      expect(command).toContain("--match-head-commit");
      expect(command).not.toMatch(/--admin|--auto|--delete-branch|--merge\b/);
    }
    expect(PULL_REQUEST).toMatch(/canBeRebased/);
    expect(PULL_REQUEST).toMatch(
      /squash[\s\S]*only when[\s\S]*(cannot be rebased|does not allow rebase)/i,
    );
    expect(PULL_REQUEST).toMatch(
      /reviews?, checks?, (or )?branch protection[\s\S]*not[\s\S]*squash|never switch to squash/i,
    );
    expect(PULL_REQUEST).toMatch(/actual conflict[\s\S]*report/i);
    expect(RECOVERY).toMatch(/ambiguous rebase[\s\S]*(do not|never) (fall back|switch) to squash/i);
    expect(ENTRY).not.toContain("rebase merge is the sole merge operation");
    expect(SPEC).toContain("### Requirement: 当前 PR 检查");
    expect(SPEC).toContain("### Requirement: 显式授权的合并：优先 rebase，必要时 squash");
    expect(SPEC).not.toContain("显式授权的 rebase 合并");
  });
});
