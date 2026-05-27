import { describe, it, expect } from "vite-plus/test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseFrontmatter,
  parseWhenToUseKeywords,
  FrontmatterError,
} from "../scripts/frontmatter.ts";

function writeStub(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), "praxis-test-"));
  const path = join(dir, "SKILL.md");
  writeFileSync(path, content);
  return path;
}

describe("parseFrontmatter", () => {
  it("parses minimal valid frontmatter", () => {
    const path = writeStub(`---
name: explore
description: "Use when ... . Not for ..."
when_to_use: "a, b, c"
dispatch_intent: "test"
---

body`);
    const result = parseFrontmatter(path);
    expect(result.name).toBe("explore");
    expect(result.description).toBe("Use when ... . Not for ...");
    expect(result.when_to_use).toBe("a, b, c");
    expect(result.dispatch_intent).toBe("test");
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

describe("parseWhenToUseKeywords", () => {
  it("splits comma-separated keywords and lowercases", () => {
    const set = parseWhenToUseKeywords("Fix, Crash , error");
    expect(set).toEqual(new Set(["fix", "crash", "error"]));
  });

  it("returns empty set for empty input", () => {
    expect(parseWhenToUseKeywords("")).toEqual(new Set());
  });
});
