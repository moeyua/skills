/**
 * Project health checker — the deterministic, mechanical half of the `health` skill.
 *
 * Ships inside the skill and travels with it (`npx skills add`). Runs on Node 24+
 * directly as `.ts` (type stripping) — zero runtime dependencies, erasable TS only
 * (no enum / namespace / parameter properties), so no build step.
 *
 * Each check RETURNS a Finding[] and never throws on a finding — it is an auditor,
 * not an assertion. The CLI prints them; tests/ import the functions to unit-test
 * the logic against fixtures (that is checking the tool, not squire's products).
 *
 * CLI:  node checker.ts <project-root> [--json]
 *
 * Scope note: model-judgment checks (does the documented behaviour still match the
 * code?) are NOT here — those live in SKILL.md prose. This file is filesystem-only.
 * It deliberately does not scan prose / dir-tree code blocks for path-like words
 * (avoids false positives); it only resolves real markdown links and anchors.
 */

import { readdirSync, readFileSync, statSync, lstatSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";

export interface Finding {
  check: string;
  file: string;
  line?: number;
  message: string;
}

// ---------- file discovery ----------

function walkFiles(root: string, keep: (name: string) => boolean): string[] {
  const out: string[] = [];
  const visit = (dir: string): void => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.startsWith(".") || entry === "node_modules") continue;
      // repo-root plans/ holds historical, point-in-time records — a past plan
      // legitimately references files later renamed or deleted; don't audit it.
      if (dir === root && entry === "plans") continue;
      const full = join(dir, entry);
      let st;
      try {
        st = lstatSync(full);
      } catch {
        continue;
      }
      // Skip symlinks: a directory symlink can point at an ancestor and loop;
      // an in-tree target is reached at its real path anyway.
      if (st.isSymbolicLink()) continue;
      if (st.isDirectory()) visit(full);
      else if (keep(entry)) out.push(full);
    }
  };
  visit(root);
  return out.sort();
}

function markdownFiles(scanRoot: string): string[] {
  return walkFiles(scanRoot, (n) => n.endsWith(".md"));
}

const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;
const URL_PREFIXES = ["http://", "https://", "mailto:", "ftp://", "tel:", "data:"];

function isUrl(raw: string): boolean {
  return URL_PREFIXES.some((p) => raw.startsWith(p)) || raw.includes("://");
}

// Run a callback over every markdown link target outside code fences / inline code.
function forEachLink(text: string, onLink: (raw: string, lineNo: number) => void): void {
  const lines = text.split("\n");
  let inCode = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const scannable = line.replace(/`[^`\n]*`/g, "");
    LINK_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = LINK_RE.exec(scannable)) !== null) {
      onLink(m[1]!.trim(), i + 1);
    }
  }
}

// ---------- 1. squire-format spec conformance (only when squire-format specs/ exist) ----------

const VERIFY_LINK_RE = /^\[[^\]]*\]\(([^)]+)\)$/;
const VERIFY_MANUAL = new Set(["manual(visual)", "manual(integration)"]);

export function checkSpecFormat(root: string): Finding[] {
  const findings: Finding[] = [];
  const specsDir = join(root, "specs");
  if (!existsSync(specsDir)) return findings;
  let domains: string[];
  try {
    domains = readdirSync(specsDir).sort();
  } catch {
    return findings;
  }
  for (const entry of domains) {
    const specPath = join(specsDir, entry, "spec.md");
    try {
      if (!statSync(specPath).isFile()) continue;
    } catch {
      continue;
    }
    const rel = relative(root, specPath);
    const text = readFileSync(specPath, "utf-8");
    if (!text.includes("## Purpose")) {
      findings.push({ check: "spec-format", file: rel, message: "missing ## Purpose" });
    }
    if (!text.includes("## Requirements")) {
      findings.push({ check: "spec-format", file: rel, message: "missing ## Requirements" });
    }
    const lines = text.split("\n");
    const reqStarts: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]!.startsWith("### Requirement:")) reqStarts.push(i);
    }
    if (reqStarts.length === 0) {
      findings.push({ check: "spec-format", file: rel, message: 'no "### Requirement:" entries' });
    }
    for (const start of reqStarts) {
      const name = lines[start]!.replace(/^### Requirement:\s*/, "").trim();
      let end = lines.length;
      for (let i = start + 1; i < lines.length; i++) {
        if (lines[i]!.startsWith("## ") || lines[i]!.startsWith("### ")) {
          end = i;
          break;
        }
      }
      const verifies = lines.slice(start + 1, end).filter((l) => l.startsWith("Verify:"));
      if (verifies.length !== 1) {
        findings.push({
          check: "spec-format",
          file: rel,
          line: start + 1,
          message: `requirement "${name}" has ${verifies.length} Verify lines, need exactly 1`,
        });
        continue;
      }
      const value = verifies[0]!.replace(/^Verify:\s*/, "").trim();
      const link = VERIFY_LINK_RE.exec(value);
      const isRelativeLink = link !== null && !link[1]!.includes("://");
      if (!VERIFY_MANUAL.has(value) && !isRelativeLink) {
        findings.push({
          check: "spec-format",
          file: rel,
          line: start + 1,
          message: `requirement "${name}" Verify invalid: ${JSON.stringify(value)}`,
        });
      }
    }
  }
  return findings;
}

// ---------- 2. markdown links resolve ----------

export function checkMarkdownLinks(root: string, scanRoot: string = root): Finding[] {
  const findings: Finding[] = [];
  for (const path of markdownFiles(scanRoot)) {
    const text = readFileSync(path, "utf-8");
    const rel = relative(root, path);
    forEachLink(text, (raw, lineNo) => {
      if (!raw || raw.startsWith("#") || raw.startsWith("/")) return;
      if (isUrl(raw)) return;
      const target = raw.split("#")[0]!.split("?")[0]!;
      if (!target) return;
      const resolved = resolve(dirname(path), target);
      if (!existsSync(resolved)) {
        findings.push({ check: "link", file: rel, line: lineNo, message: `broken link -> ${raw}` });
      }
    });
  }
  return findings;
}

// ---------- 3. internal anchors resolve (the gap checkMarkdownLinks left) ----------

const LINE_REF_RE = /^L\d+(-L\d+)?$/i;

function headingSlugs(text: string): Set<string> {
  const slugs = new Set<string>();
  for (const line of text.split("\n")) {
    const m = /^#{1,6}\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const slug = m[1]!
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .trim()
      .replace(/\s+/g, "-");
    if (slug) slugs.add(slug);
  }
  return slugs;
}

export function checkInternalAnchors(root: string, scanRoot: string = root): Finding[] {
  const findings: Finding[] = [];
  const slugCache = new Map<string, Set<string> | null>();
  const slugsFor = (p: string): Set<string> | null => {
    if (slugCache.has(p)) return slugCache.get(p)!;
    let result: Set<string> | null = null;
    if (existsSync(p)) result = headingSlugs(readFileSync(p, "utf-8"));
    slugCache.set(p, result);
    return result;
  };
  for (const path of markdownFiles(scanRoot)) {
    const text = readFileSync(path, "utf-8");
    const rel = relative(root, path);
    forEachLink(text, (raw, lineNo) => {
      const hashIdx = raw.indexOf("#");
      if (hashIdx === -1 || isUrl(raw)) return;
      const anchor = raw.slice(hashIdx + 1).split("?")[0]!;
      if (!anchor || LINE_REF_RE.test(anchor)) return; // skip GitHub line refs (#L42)
      const filePart = raw.slice(0, hashIdx);
      const targetFile = filePart === "" ? path : resolve(dirname(path), filePart);
      const slugs = slugsFor(targetFile);
      if (slugs === null) return; // missing target file is a link concern, not anchor
      if (!slugs.has(anchor.toLowerCase())) {
        findings.push({
          check: "anchor",
          file: rel,
          line: lineNo,
          message: `dead anchor -> ${raw}`,
        });
      }
    });
  }
  return findings;
}

// ---------- 4. placeholder markers left in docs ----------

// Match a real marker (`TODO:` / `FIXME:` …), not prose that merely mentions the
// word — docs that explain placeholder rules shouldn't be flagged as having one.
const PLACEHOLDER_RE = /\b(TODO|FIXME|TBD|XXX):/;

export function checkPlaceholders(root: string, scanRoot: string = root): Finding[] {
  const findings: Finding[] = [];
  for (const path of markdownFiles(scanRoot)) {
    const text = readFileSync(path, "utf-8");
    const rel = relative(root, path);
    const lines = text.split("\n");
    let inCode = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.trim().startsWith("```")) {
        inCode = !inCode;
        continue;
      }
      if (inCode) continue;
      const scannable = line.replace(/`[^`\n]*`/g, "");
      if (PLACEHOLDER_RE.test(scannable)) {
        findings.push({
          check: "placeholder",
          file: rel,
          line: i + 1,
          message: `placeholder: ${line.trim().slice(0, 60)}`,
        });
      }
    }
  }
  return findings;
}

// ---------- 5. oversized source files ----------

const CODE_EXT_RE = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|rb|swift|c|cc|cpp|h)$/;
const DEFAULT_SIZE_THRESHOLD = 400;

export function checkFileSizes(
  root: string,
  scanRoot: string = root,
  threshold: number = DEFAULT_SIZE_THRESHOLD,
): Finding[] {
  const findings: Finding[] = [];
  for (const path of walkFiles(scanRoot, (n) => CODE_EXT_RE.test(n))) {
    const count = readFileSync(path, "utf-8").split("\n").length;
    if (count > threshold) {
      findings.push({
        check: "file-size",
        file: relative(root, path),
        message: `${count} lines > ${threshold}`,
      });
    }
  }
  return findings;
}

// ---------- runner + CLI ----------

export function runAll(root: string): Finding[] {
  return [
    ...checkSpecFormat(root),
    ...checkMarkdownLinks(root),
    ...checkInternalAnchors(root),
    ...checkPlaceholders(root),
    ...checkFileSizes(root),
  ];
}

function formatFinding(f: Finding): string {
  const loc = f.line ? `${f.file}:${f.line}` : f.file;
  return `[${f.check}] ${loc} — ${f.message}`;
}

const invokedDirectly =
  process.argv[1] !== undefined && resolve(process.argv[1]).endsWith("checker.ts");

if (invokedDirectly) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const rootArg = args.find((a) => !a.startsWith("--")) ?? ".";
  const findings = runAll(resolve(rootArg));
  if (json) {
    console.log(JSON.stringify(findings, null, 2));
  } else if (findings.length === 0) {
    console.log("No findings.");
  } else {
    for (const f of findings) console.log(formatFinding(f));
  }
}
