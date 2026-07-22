import { existsSync, lstatSync, readdirSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PUBLIC_SKILLS = [
  "check",
  "converge",
  "docs",
  "doctor",
  "explore",
  "handoff",
  "implement",
  "plan",
  "publish",
  "release",
  "shape",
] as const;

const CHANGE_TYPE_CONSUMERS = ["shape", "plan", "implement"] as const;

function directories(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

describe("public skill architecture", () => {
  it("exposes exactly the soft-linked capability set", () => {
    expect(directories(join(REPO_ROOT, "skills"))).toEqual(PUBLIC_SKILLS);
    expect(directories(join(REPO_ROOT, "specs"))).toEqual(PUBLIC_SKILLS);
  });

  it("shares one canonical change-type contract", () => {
    const source = join(REPO_ROOT, "rules", "change-types.md");
    expect(existsSync(source)).toBe(true);

    for (const skill of CHANGE_TYPE_CONSUMERS) {
      const reference = join(REPO_ROOT, "skills", skill, "references", "change-types.md");
      expect(existsSync(reference), `${skill} change-type reference`).toBe(true);
      expect(lstatSync(reference).isSymbolicLink(), `${skill} reference should be a symlink`).toBe(
        true,
      );
      expect(realpathSync(reference)).toBe(realpathSync(source));
    }
  });
});
