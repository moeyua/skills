import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RELEASE = readFileSync(resolve(REPO_ROOT, "skills/release/SKILL.md"), "utf8");
const SPEC = readFileSync(resolve(REPO_ROOT, "specs/release/spec.md"), "utf8");

describe("release boundary", () => {
  it("executes directly when the user supplies an exact tag", () => {
    expect(RELEASE).toContain("user supplied an exact tag in the current request");
    expect(RELEASE).toContain("treat it as the confirmed release identity");
    expect(SPEC).toContain("用户显式 tag 可直接执行");
  });

  it("recommends one SemVer candidate when the user omits the tag", () => {
    expect(RELEASE).toContain("When the user did not provide a tag");
    expect(RELEASE).toContain("derive one candidate tag with SemVer");
    expect(RELEASE).toContain("changes since the latest release");
    expect(RELEASE).toContain("put the candidate in the final response");
    expect(RELEASE).not.toContain("Never derive the next version");
  });

  it("prefers the project's authoritative version policy over generic SemVer", () => {
    expect(RELEASE).toContain("resolve the authoritative project version policy");
    expect(RELEASE).toContain(
      "repository instructions, versioning or release documentation, and committed release-tool configuration",
    );
    expect(RELEASE).toContain("takes precedence over the generic SemVer mapping");
    expect(RELEASE).toContain("Only when no applicable authoritative project policy exists");
    expect(RELEASE).toContain(
      "Do not infer a project policy only from historical tag increments or commit-message patterns",
    );
    expect(RELEASE).toContain(
      "If applicable authoritative sources conflict or cannot produce one exact candidate",
    );
    expect(RELEASE).toContain("report the sources and conflict and stop without mutation");
    expect(RELEASE).toContain(
      "Version policy: <project source | generic SemVer fallback, proposed only>",
    );
    expect(SPEC).toContain("项目权威版本策略优先于通用 SemVer");
  });

  it("ends the recommendation turn before any release mutation", () => {
    expect(RELEASE).toContain("End the current turn after that final response");
    expect(RELEASE).toContain("Do not switch branches, change a version, commit, push, tag");
    expect(RELEASE).toContain("in the recommendation turn");
  });

  it("continues only after the next user message confirms the candidate", () => {
    expect(RELEASE).toContain("next user message unambiguously confirms that candidate");
    expect(RELEASE).toContain("does not need to repeat the tag");
    expect(RELEASE).toContain("Only that later user confirmation unlocks release mutation");
    expect(SPEC).toContain("候选版本跨轮确认后才允许 mutation");
  });

  it("revalidates the candidate basis after cross-turn confirmation", () => {
    expect(RELEASE).toContain(
      "record the remote default-branch tip, latest Release identity, and applied policy identity",
    );
    expect(RELEASE).toContain("Before any release mutation after cross-turn confirmation");
    expect(RELEASE).toContain("re-query those canonical identities");
    expect(RELEASE).toContain("If any identity changed, invalidate the earlier confirmation");
    expect(RELEASE).toContain(
      "return the refreshed candidate in the final response, and end the turn",
    );
    expect(SPEC).toContain("任一变化都必须使旧确认失效");
  });

  it("matches the fetched default tip to the confirmed basis before mutation", () => {
    expect(RELEASE).toContain(
      "Immediately after `git fetch origin <default-branch>` on a cross-turn candidate path",
    );
    expect(RELEASE).toContain("before `git switch` or any package-version mutation");
    expect(RELEASE).toContain(
      "require the fetched remote tip to equal the recorded candidate-basis tip exactly",
    );
    expect(RELEASE).toContain("A post-fetch basis mismatch invalidates the confirmation");
    expect(SPEC).toContain("fetch 后且切分支或修改 package version 前");
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
