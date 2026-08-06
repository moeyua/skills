import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = readFileSync(join(REPO_ROOT, "rules/memory-catalog.md"), "utf8");
const DOCS_SKILL = readFileSync(join(REPO_ROOT, "skills/docs/SKILL.md"), "utf8");

const MEMORY_TYPES = ["spec", "PRODUCT", "ARCHITECTURE", "DESIGN", "ROADMAP", "README"];
const FORMAT_FILES = [
  "architecture.md",
  "design.md",
  "product.md",
  "readme.md",
  "roadmap.md",
  "spec.md",
];

describe("durable memory architecture", () => {
  it("catalogs exactly six memory types", () => {
    const headings = [...CATALOG.matchAll(/^## ([A-Za-z]+)$/gm)].map((match) => match[1]);
    expect(headings).toEqual(MEMORY_TYPES);
  });

  it("keeps one format for every catalog memory type", () => {
    const actual = readdirSync(join(REPO_ROOT, "skills/docs/references/formats"))
      .filter((file) => file.endsWith(".md"))
      .sort();
    expect(actual).toEqual(FORMAT_FILES);
  });

  it("removes WORKFLOW from the root and docs behavior", () => {
    expect(existsSync(join(REPO_ROOT, "WORKFLOW.md"))).toBe(false);
    expect(CATALOG).not.toContain("## WORKFLOW");
    expect(DOCS_SKILL).not.toContain("WORKFLOW");
  });

  it("lets docs record already-decided PRODUCT truth", () => {
    expect(DOCS_SKILL).toMatch(/PRODUCT[\s\S]*(?:already decided|already established|已决定)/i);
  });
});
