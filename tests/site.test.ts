import { describe, expect, it } from "vite-plus/test";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { parseSkills } from "../site/src/skills.ts";

const root = resolve(import.meta.dirname, "..", "skills");

function readTree(dir: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    files[relative(root, path)] = readFileSync(path, "utf-8");
  }
  return files;
}

const skills = parseSkills(readTree(root));
const byName = (name: string) => skills.find((s) => s.name === name);

describe("parseSkills", () => {
  it("parses every skill in the repo with a name and description", () => {
    const count = Object.keys(readTree(root)).filter((p) => p.endsWith("/SKILL.md")).length;
    expect(skills).toHaveLength(count);
    for (const skill of skills) {
      expect(skill.name).toMatch(/^[a-z-]+$/);
      expect(skill.description.length).toBeGreaterThan(10);
    }
  });

  it("reads category, manual-only flag, and credits from the files", () => {
    expect(byName("shape")).toMatchObject({
      category: "engineering",
      manualOnly: false,
      credits: expect.stringContaining("mattpocock"),
    });
    expect(byName("explain")).toMatchObject({ category: "productivity", manualOnly: true });
  });

  it("lists each skill's other files by path inside the skill", () => {
    expect(byName("docs")?.files.map((f) => f.path)).toContain("references/formats/adr.md");
    expect(byName("debug")?.files.map((f) => f.path)).toEqual(["scripts/hitl-loop.template.sh"]);
    expect(byName("shape")?.files).toEqual([]);
  });

  it("keeps the body without frontmatter", () => {
    const body = byName("shape")?.body ?? "";
    expect(body.startsWith("---")).toBe(false);
    expect(body).toContain("design tree");
  });
});
