import { describe, expect, it } from "vite-plus/test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "skills");

function findSkillFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findSkillFiles(path);
    return entry.name === "SKILL.md" ? [path] : [];
  });
}

function frontmatterField(text: string, field: string): string | undefined {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  const line = match?.[1]?.split("\n").find((l) => l.startsWith(`${field}:`));
  return line
    ?.slice(field.length + 1)
    .trim()
    .replace(/^"(.*)"$/, "$1");
}

const skillFiles = findSkillFiles(root);

describe("skills", () => {
  it("finds skills", () => {
    expect(skillFiles.length).toBeGreaterThan(0);
  });

  it("has unique names", () => {
    const names = skillFiles.map((f) => basename(dirname(f)));
    expect(new Set(names).size).toBe(names.length);
  });

  for (const file of skillFiles) {
    const dir = dirname(file);
    const text = readFileSync(file, "utf-8");

    describe(basename(dir), () => {
      it("names itself after its directory", () => {
        expect(frontmatterField(text, "name")).toBe(basename(dir));
      });

      it("has a description", () => {
        expect(frontmatterField(text, "description")?.length ?? 0).toBeGreaterThan(10);
      });

      it("links only to files that exist", () => {
        const links = [...text.matchAll(/\]\(([^)#\s]+)\)/g)]
          .map((m) => m[1] ?? "")
          .filter((href) => !/^[a-z]+:/.test(href));
        for (const href of links) {
          expect(existsSync(join(dir, href)), `${href} in ${file}`).toBe(true);
        }
      });
    });
  }
});
