import { existsSync, lstatSync, readdirSync, realpathSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { findSkillFiles } from "./checks.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PUBLIC_SKILLS = [
  "converge",
  "debug",
  "docs",
  "doctor",
  "explore",
  "handoff",
  "implement",
  "plan",
  "publish",
  "release",
  "review",
  "shape",
  "verify",
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
    expect(directories(join(REPO_ROOT, "skills"))).toEqual(["engineering", "productivity"]);
    expect(
      findSkillFiles(REPO_ROOT)
        .map((path) => basename(dirname(path)))
        .sort(),
    ).toEqual(PUBLIC_SKILLS);
    expect(directories(join(REPO_ROOT, "skills", "engineering"))).toEqual(
      PUBLIC_SKILLS.filter((name) => name !== "handoff"),
    );
    expect(directories(join(REPO_ROOT, "skills", "productivity"))).toEqual(["handoff"]);
    expect(directories(join(REPO_ROOT, "specs"))).toEqual(PUBLIC_SKILLS);
  });

  it("shares one canonical change-type contract", () => {
    const source = join(REPO_ROOT, "rules", "change-types.md");
    expect(existsSync(source)).toBe(true);

    for (const skill of CHANGE_TYPE_CONSUMERS) {
      const reference = join(
        REPO_ROOT,
        "skills",
        "engineering",
        skill,
        "references",
        "change-types.md",
      );
      expect(existsSync(reference), `${skill} change-type reference`).toBe(true);
      expect(lstatSync(reference).isSymbolicLink(), `${skill} reference should be a symlink`).toBe(
        true,
      );
      expect(realpathSync(reference)).toBe(realpathSync(source));
    }
  });
});
