/**
 * Unit tests for scripts/setup-rule.mjs.
 *
 * Only the pure upsertBlock is tested here — the file-writing main() is guarded
 * by a direct-run check, so importing the module has no side effects.
 */

import { describe, it, expect } from "vite-plus/test";
import { upsertBlock } from "../scripts/setup-rule.mjs";

describe("upsertBlock", () => {
  it("adds a marked block to empty text", () => {
    const out = upsertBlock("", "output-style", "@~/.claude/rules/output-style.md");
    expect(out).toContain("<!-- praxis:output-style start -->");
    expect(out).toContain("@~/.claude/rules/output-style.md");
    expect(out).toContain("<!-- praxis:output-style end -->");
  });

  it("appends after existing content and preserves it", () => {
    const out = upsertBlock("# My CLAUDE.md\n\nsome notes", "output-style", "BODY");
    expect(out).toContain("# My CLAUDE.md");
    expect(out).toContain("some notes");
    expect(out).toContain("BODY");
  });

  it("is idempotent — re-running replaces the block, no duplicate", () => {
    const once = upsertBlock("base", "r", "v1");
    const twice = upsertBlock(once, "r", "v2");
    const blockCount = twice.split("<!-- praxis:r start -->").length - 1;
    expect(blockCount).toBe(1);
    expect(twice).toContain("v2");
    expect(twice).not.toContain("v1");
    expect(twice).toContain("base");
  });
});
