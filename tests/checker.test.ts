/**
 * Unit tests for skills/doctor/scripts/checker.ts — the doctor skill's bundled
 * deterministic checker. checker.ts is tool code; exercising it on tmpdir
 * fixtures is checking the tool, not running it on squire's real products.
 *
 * The checks RETURN findings (never throw), so tests assert on the array.
 */

import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  checkSpecFormat,
  checkMarkdownLinks,
  checkInternalAnchors,
  checkPlaceholders,
  checkFileSizes,
} from "../skills/doctor/scripts/checker.ts";

let roots: string[] = [];

function makeRoot(): string {
  const r = mkdtempSync(join(tmpdir(), "health-fix-"));
  roots.push(r);
  return r;
}

function write(root: string, rel: string, content: string): void {
  const full = join(root, rel);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, content);
}

beforeEach(() => {
  roots = [];
});

afterEach(() => {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
});

const VALID_SPEC = `# X Specification

## Purpose

p

## Requirements

### Requirement: foo
The system SHALL do foo.
Verify: manual(integration)
`;

describe("checkSpecFormat", () => {
  it("returns no findings for a valid squire-format spec", () => {
    const root = makeRoot();
    write(root, "specs/x/spec.md", VALID_SPEC);
    expect(checkSpecFormat(root)).toEqual([]);
  });

  it("flags a requirement with no Verify line", () => {
    const root = makeRoot();
    write(
      root,
      "specs/x/spec.md",
      `# X\n\n## Purpose\n\np\n\n## Requirements\n\n### Requirement: foo\nThe system SHALL do foo.\n`,
    );
    const findings = checkSpecFormat(root);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.message).toMatch(/foo.*0 Verify/);
  });

  it("flags a missing ## Purpose", () => {
    const root = makeRoot();
    write(
      root,
      "specs/x/spec.md",
      `# X\n\n## Requirements\n\n### Requirement: foo\nThe system SHALL do foo.\nVerify: manual(integration)\n`,
    );
    expect(checkSpecFormat(root).some((f) => /Purpose/.test(f.message))).toBe(true);
  });

  it("flags a requirement with two Verify lines", () => {
    const root = makeRoot();
    write(
      root,
      "specs/x/spec.md",
      `# X\n\n## Purpose\n\np\n\n## Requirements\n\n### Requirement: foo\nThe system SHALL do foo.\nVerify: manual(visual)\nVerify: manual(integration)\n`,
    );
    expect(checkSpecFormat(root).some((f) => /2 Verify/.test(f.message))).toBe(true);
  });

  it("flags an invalid Verify value (e.g. external URL)", () => {
    const root = makeRoot();
    write(
      root,
      "specs/x/spec.md",
      `# X\n\n## Purpose\n\np\n\n## Requirements\n\n### Requirement: foo\nThe system SHALL do foo.\nVerify: [t](https://example.com/x.test.ts)\n`,
    );
    expect(checkSpecFormat(root).some((f) => /Verify invalid/.test(f.message))).toBe(true);
  });

  it("is a no-op when no specs/ dir (non-squire project)", () => {
    expect(checkSpecFormat(makeRoot())).toEqual([]);
  });
});

describe("checkMarkdownLinks", () => {
  it("flags a broken relative link", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "see [x](./gone.md)\n");
    const findings = checkMarkdownLinks(root);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.message).toMatch(/gone\.md/);
  });

  it("passes a resolving link and ignores external URLs", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "[self](./a.md) and [ext](https://example.com)\n");
    expect(checkMarkdownLinks(root)).toEqual([]);
  });

  it("ignores links inside code fences", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "text\n\n```\n[broken](./gone.md)\n```\n");
    expect(checkMarkdownLinks(root)).toEqual([]);
  });

  it("can be scoped to a subtree", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "[broken](./gone.md)\n");
    write(root, "skills/x.md", "[ok](./x.md)\n");
    expect(checkMarkdownLinks(root, join(root, "skills"))).toEqual([]);
  });

  it("skips repo-root plans/ (historical, point-in-time records)", () => {
    const root = makeRoot();
    write(root, "plans/2026-01-01-old.md", "[gone](./deleted.md)\n");
    expect(checkMarkdownLinks(root)).toEqual([]);
  });

  it("does not traverse into symlinked directories", () => {
    const root = makeRoot();
    write(root, "real/doc.md", "[gone](./missing.md)\n");
    symlinkSync(join(root, "real"), join(root, "link"));
    const findings = checkMarkdownLinks(root);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.file).toBe("real/doc.md");
  });
});

describe("checkInternalAnchors", () => {
  it("flags a dead heading anchor", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "# Title\n\njump to [x](#no-such-heading)\n");
    const findings = checkInternalAnchors(root);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.message).toMatch(/no-such-heading/);
  });

  it("passes a live heading anchor", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "# Real Heading\n\n[x](#real-heading)\n");
    expect(checkInternalAnchors(root)).toEqual([]);
  });

  it("skips GitHub line-ref anchors (#L42)", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "# T\n\n[code](./a.md#L10-L20)\n");
    expect(checkInternalAnchors(root)).toEqual([]);
  });

  it("matches a CJK heading anchor (Unicode-aware slug)", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "# 文档 vs 代码\n\n[x](#文档-vs-代码)\n");
    expect(checkInternalAnchors(root)).toEqual([]);
  });
});

describe("checkPlaceholders", () => {
  it("flags a TODO/TBD/FIXME marker", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "intro\n\nTODO: finish this\n");
    expect(checkPlaceholders(root)).toHaveLength(1);
  });

  it("ignores markers inside code fences and inline code", () => {
    const root = makeRoot();
    write(root, "docs/a.md", "```\nTODO inside code\n```\n\nuse `TODO` literally\n");
    expect(checkPlaceholders(root)).toEqual([]);
  });

  it("reports a real marker (TODO:) but not an explanatory mention", () => {
    const root = makeRoot();
    write(root, "docs/real.md", "TODO: finish this\n");
    write(root, "docs/explain.md", 'a placeholder like "TODO" or TBD is a red flag\n');
    const findings = checkPlaceholders(root);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.file).toBe("docs/real.md");
  });
});

describe("checkFileSizes", () => {
  it("flags a file over the threshold", () => {
    const root = makeRoot();
    write(root, "src/big.ts", "x\n".repeat(50));
    const findings = checkFileSizes(root, root, 10);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.message).toMatch(/> 10/);
  });

  it("passes a file under the threshold", () => {
    const root = makeRoot();
    write(root, "src/small.ts", "x\n".repeat(5));
    expect(checkFileSizes(root, root, 10)).toEqual([]);
  });
});
