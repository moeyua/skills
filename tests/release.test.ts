import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RELEASE = readFileSync(resolve(REPO_ROOT, "skills/release/SKILL.md"), "utf8");
const SPEC = readFileSync(resolve(REPO_ROOT, "specs/release/spec.md"), "utf8");

describe("release boundary", () => {
  it("resolves a tag without inventing or changing a project version", () => {
    expect(RELEASE).toContain("explicit tag → authoritative project version source");
    expect(RELEASE).toContain("Never edit a version file");
    expect(SPEC).toContain("从显式输入或权威版本源确定 tag");
  });

  it("creates and pushes a tag before the GitHub Release", () => {
    expect(RELEASE).toContain("git push origin refs/tags/<tag>");
    expect(RELEASE).toContain("gh release create <tag> --verify-tag --generate-notes");
  });

  it("uses generated notes and excludes project-specific release work", () => {
    expect(RELEASE).toContain("GitHub-generated notes are the release notes");
    expect(RELEASE).toContain("no deployment, rollback, changelog, artifact upload");
  });

  it("reports partial state without destructive rollback", () => {
    expect(RELEASE).toContain("do not delete the tag");
    expect(RELEASE).toContain("report the exact completed state");
  });

  it("is idempotent for an existing tag or release", () => {
    expect(RELEASE).toContain("reuse an existing tag only when its target matches");
    expect(RELEASE).toContain("return the existing Release URL");
  });
});
