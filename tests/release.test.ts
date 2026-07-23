import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RELEASE = readFileSync(resolve(REPO_ROOT, "skills/release/SKILL.md"), "utf8");
const SPEC = readFileSync(resolve(REPO_ROOT, "specs/release/spec.md"), "utf8");

describe("release boundary", () => {
  it("requires one explicit target tag without inventing the next version", () => {
    expect(RELEASE).toContain("Require an explicit target tag");
    expect(RELEASE).toContain("Never derive the next version");
    expect(SPEC).toContain("从显式输入或权威版本源确定 tag");
  });

  it("switches to and fast-forwards the remote default branch", () => {
    expect(RELEASE).toContain("git switch <default-branch>");
    expect(RELEASE).toContain("git merge --ff-only origin/<default-branch>");
    expect(RELEASE).toContain("A dirty tree or diverged default branch stops before mutation");
  });

  it("creates and pushes a package-version release commit before the tag", () => {
    expect(RELEASE).toContain("pnpm version <version> --no-git-tag-version");
    expect(RELEASE).toContain('git commit -m "chore(release): <tag>"');
    expect(RELEASE).toContain("git push origin <default-branch>:<default-branch>");
    expect(RELEASE).toContain(
      "Never create the tag until the remote default branch contains `<release-commit>`",
    );
    expect(RELEASE).toContain("git push origin refs/tags/<tag>");
    expect(RELEASE).toContain("gh release create <tag> --verify-tag --generate-notes");
  });

  it("uses generated notes and retains the bounded release exclusions", () => {
    expect(RELEASE).toContain("GitHub-generated notes are the release notes");
    expect(RELEASE).toContain(
      "no deployment, rollback, changelog, artifact upload, registry publish, or automatic PR",
    );
    expect(RELEASE).not.toContain("Never edit a version file");
  });

  it("reports partial state without destructive rollback", () => {
    expect(RELEASE).toContain("keep and report the local release commit");
    expect(RELEASE).toContain("do not create a tag");
    expect(RELEASE).toContain("do not delete the tag");
    expect(RELEASE).toContain("report the exact completed state");
  });

  it("recovers one validated local release commit after a branch push failure", () => {
    expect(RELEASE).toContain("one validated local release commit ahead");
    expect(RELEASE).toContain("its parent is the fetched remote default tip");
    expect(RELEASE).toContain("retry only the default-branch push");
  });

  it("validates the committed release tree before push and on every commit reuse path", () => {
    expect(RELEASE).toContain("release-commit predicate");
    expect(RELEASE).toContain("After `git commit`, validate `HEAD`");
    expect(RELEASE).toContain("semantic diff against its parent changes only");
    expect(RELEASE).toContain("index and working tree are clean after the commit");
    expect(RELEASE).toContain("fresh commit, local-ahead recovery, and remote commit reuse");
  });

  it("recovers one validated version diff after a commit failure", () => {
    expect(RELEASE).toContain("one validated version diff");
    expect(RELEASE).toContain("the local default-branch `HEAD` equals the fetched remote tip");
    expect(RELEASE).toContain("resume at staged-diff verification and commit");
  });

  it("is idempotent across release commit, tag, and Release state", () => {
    expect(RELEASE).toContain("do not repeat the version bump or release commit");
    expect(RELEASE).toContain("reuse an existing tag only when its target matches");
    expect(RELEASE).toContain("return the existing Release URL");
  });
});
