import { describe, it, expect } from "vite-plus/test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseFrontmatter, FrontmatterError } from "./frontmatter.ts";

function writeStub(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), "skills-test-"));
  const path = join(dir, "SKILL.md");
  writeFileSync(path, content);
  return path;
}

describe("parseFrontmatter", () => {
  it("parses minimal valid frontmatter", () => {
    const path = writeStub(`---
name: explore
description: "Use when ... . Not for ..."
---

body`);
    const result = parseFrontmatter(path);
    expect(result).toEqual({
      name: "explore",
      description: "Use when ... . Not for ...",
    });
    rmSync(path);
  });

  it("rejects file not starting with ---", () => {
    const path = writeStub("no frontmatter here");
    expect(() => parseFrontmatter(path)).toThrow(FrontmatterError);
    rmSync(path);
  });

  it("rejects missing closing ---", () => {
    const path = writeStub("---\nname: foo\n");
    expect(() => parseFrontmatter(path)).toThrow(FrontmatterError);
    rmSync(path);
  });

  it("rejects missing required field (name)", () => {
    const path = writeStub(`---
description: "x"
---
`);
    expect(() => parseFrontmatter(path)).toThrow(/MISSING name/);
    rmSync(path);
  });
});
