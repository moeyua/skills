/**
 * Unit tests for checkMemoryCatalog (tests/checks.ts).
 *
 * Split out of checks.test.ts: the catalog<->formats lockstep check has its
 * own self-contained fixture (no shared skill-repo helpers), and keeping it
 * here holds both files under the size advisory.
 */

import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkMemoryCatalog } from "./checks.ts";

let activeRoots: string[] = [];

beforeEach(() => {
  activeRoots = [];
});

afterEach(() => {
  for (const r of activeRoots) rmSync(r, { recursive: true, force: true });
});

function catalogRepo(catalogBody: string, formatFiles: string[]): string {
  const root = mkdtempSync(join(tmpdir(), "squire-cat-"));
  mkdirSync(join(root, "rules"), { recursive: true });
  writeFileSync(join(root, "rules", "memory-catalog.md"), catalogBody);
  const fdir = join(root, "skills", "docs", "references", "formats");
  mkdirSync(fdir, { recursive: true });
  for (const f of formatFiles) writeFileSync(join(fdir, f), "# fmt\n");
  activeRoots.push(root);
  return root;
}

describe("checkMemoryCatalog", () => {
  const CATALOG = `# Memory Catalog

## spec
- **Format**: \`references/formats/spec.md\`

## ARCHITECTURE
- **Format**: \`references/formats/architecture.md\`

## PRODUCT
- **Format**: \`references/formats/product.md\`
`;

  it("passes when referenced format files exist and none are orphaned", () => {
    const root = catalogRepo(CATALOG, ["spec.md", "architecture.md", "product.md"]);
    expect(() => checkMemoryCatalog(root)).not.toThrow();
  });

  it("throws when a catalog-referenced format file is missing", () => {
    const root = catalogRepo(CATALOG, ["spec.md", "product.md"]);
    expect(() => checkMemoryCatalog(root)).toThrow(/MEMORY FORMAT MISSING.*architecture/);
  });

  it("throws on an orphan format file not referenced by the catalog", () => {
    const root = catalogRepo(CATALOG, ["spec.md", "architecture.md", "product.md", "extra.md"]);
    expect(() => checkMemoryCatalog(root)).toThrow(/MEMORY FORMAT ORPHAN.*extra/);
  });

  it("is a no-op when the catalog does not exist", () => {
    const root = mkdtempSync(join(tmpdir(), "squire-nocat-"));
    activeRoots.push(root);
    expect(() => checkMemoryCatalog(root)).not.toThrow();
  });
});
