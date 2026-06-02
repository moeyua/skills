/**
 * Validation checks for squire skills.
 *
 * All checks are library functions: take repo root (or pre-collected data),
 * throw on failure. Driver is `tests/smoke/verify-skills.test.ts`, which wraps
 * each check in a vitest `it()` for unified reporting.
 *
 * Each check has a corresponding unit test in `tests/checks.test.ts` using
 * tmpdir fixtures, so logic is exercised without depending on the live repo.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { parseFrontmatter, parseWhenToUseKeywords, type SkillFrontmatter } from "./frontmatter.ts";

// ---------- skill file discovery ----------

export function findSkillFiles(root: string): string[] {
  const skillsDir = join(root, "skills");
  const entries = readdirSync(skillsDir);
  const result: string[] = [];
  for (const entry of entries) {
    const skillPath = join(skillsDir, entry, "SKILL.md");
    try {
      if (statSync(skillPath).isFile()) {
        result.push(skillPath);
      }
    } catch {
      // Not a skill directory (e.g. RESOLVER.md). Skip.
    }
  }
  return result.sort();
}

export function checkSkillFiles(root: string): Map<string, SkillFrontmatter> {
  const skillFiles = findSkillFiles(root);
  if (skillFiles.length === 0) {
    throw new Error("NO SKILLS FOUND: expected skills/*/SKILL.md");
  }
  const out = new Map<string, SkillFrontmatter>();
  for (const path of skillFiles) {
    const skillDir = basename(dirname(path));
    const fields = parseFrontmatter(path);
    if (fields.name !== skillDir) {
      throw new Error(`NAME MISMATCH: ${path} frontmatter name=${fields.name} dir=${skillDir}`);
    }
    out.set(skillDir, fields);
  }
  return out;
}

// ---------- description conformance ----------

const ARTICLE_PREFIXES = new Set(["the", "a", "an", "this", "it"]);

export function checkDescriptionConformance(skills: Map<string, SkillFrontmatter>): void {
  for (const [name, fields] of skills) {
    const desc = fields.description.trim();
    const length = desc.length;
    if (length < 40) {
      throw new Error(
        `DESCRIPTION TOO SHORT: ${name} (${length} chars); need >=40 for reliable agent routing`,
      );
    }
    if (length > 500) {
      throw new Error(`DESCRIPTION TOO LONG: ${name} (${length} chars); trim to <=500`);
    }
    const firstWord = desc.split(/\s+/)[0]?.toLowerCase() ?? "";
    if (ARTICLE_PREFIXES.has(firstWord)) {
      throw new Error(
        `DESCRIPTION STARTS WITH ARTICLE: ${name}; start with a verb/action phrase. Got: ${JSON.stringify(desc.slice(0, 60))}`,
      );
    }
    const lower = desc.toLowerCase();
    if (!lower.includes("use when")) {
      throw new Error(
        `DESCRIPTION MISSING USE-WHEN CUE: ${name}; description must include "Use when ..."`,
      );
    }
    if (!lower.includes("not for")) {
      throw new Error(
        `DESCRIPTION MISSING EXCLUSION CLAUSE: ${name}; description must include "Not for ..."`,
      );
    }
  }
}

// ---------- outcome contract ----------

const OUTCOME_FIELDS = ["Outcome:", "Done when:", "Evidence:", "Output:"];

export function checkOutcomeContract(root: string): void {
  for (const path of findSkillFiles(root)) {
    const text = readFileSync(path, "utf-8");
    if (!text.includes("## Outcome Contract")) {
      throw new Error(`MISSING OUTCOME CONTRACT: ${path}`);
    }
    const section = text.split("## Outcome Contract", 2)[1]?.split("\n## ", 2)[0] ?? "";
    const missing = OUTCOME_FIELDS.filter((field) => !section.includes(field));
    if (missing.length > 0) {
      throw new Error(`INCOMPLETE OUTCOME CONTRACT: ${path}; missing: ${missing.join(", ")}`);
    }
  }
}

// ---------- references existence ----------

// Matches references/X.md or agents/X.md or scripts/X.ext in skill body.
const REF_RE = /(?<![/.\w])(?:references|agents|scripts)\/[\w/.-]+/g;

export function checkReferencesExist(root: string): void {
  for (const path of findSkillFiles(root)) {
    const skillDir = dirname(path);
    const text = readFileSync(path, "utf-8");
    const refs = new Set<string>(text.match(REF_RE) ?? []);
    for (const ref of refs) {
      const target = join(skillDir, ref);
      if (!existsSync(target)) {
        throw new Error(`BROKEN REFERENCE: ${path} references ${ref} but file does not exist`);
      }
    }
  }
}

// ---------- markdown links ----------

const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;
const URL_PREFIXES = ["http://", "https://", "mailto:", "ftp://", "tel:", "data:"];

function collectMarkdownFiles(root: string): string[] {
  const files: string[] = [];
  const visit = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith(".") || entry === "node_modules") continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        visit(full);
      } else if (entry.endsWith(".md")) {
        files.push(full);
      }
    }
  };
  visit(root);
  return files.sort();
}

export function checkMarkdownLinks(root: string): void {
  for (const path of collectMarkdownFiles(root)) {
    const text = readFileSync(path, "utf-8");
    let inCode = false;
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.trim().startsWith("```")) {
        inCode = !inCode;
        continue;
      }
      if (inCode) continue;
      const scannable = line.replace(/`[^`\n]*`/g, "");
      LINK_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = LINK_RE.exec(scannable)) !== null) {
        const raw = match[1]!.trim();
        if (!raw || raw.startsWith("#") || raw.startsWith("/")) continue;
        if (URL_PREFIXES.some((p) => raw.startsWith(p)) || raw.includes("://")) continue;
        const target = raw.split("#")[0]!.split("?")[0]!;
        if (!target) continue;
        const resolved = resolve(dirname(path), target);
        if (!existsSync(resolved)) {
          throw new Error(`BROKEN MARKDOWN LINK: ${path}:${i + 1} -> ${raw}`);
        }
      }
    }
  }
}

// ---------- no root SKILL.md ----------

export function checkNoRootSkill(root: string): void {
  const rootSkill = join(root, "SKILL.md");
  if (existsSync(rootSkill)) {
    throw new Error(
      `ROOT SKILL.md DISALLOWED at ${rootSkill}; breaks 'npx skills add' nested discovery`,
    );
  }
}

// ---------- trigger keyword overlap (Jaccard) ----------

const JACCARD_THRESHOLD = 0.5;

export function checkTriggerJaccard(skills: Map<string, SkillFrontmatter>): void {
  const names = [...skills.keys()].sort();
  for (let i = 0; i < names.length; i++) {
    const a = names[i]!;
    const setA = parseWhenToUseKeywords(skills.get(a)!.when_to_use);
    for (let j = i + 1; j < names.length; j++) {
      const b = names[j]!;
      const setB = parseWhenToUseKeywords(skills.get(b)!.when_to_use);
      const shared = new Set([...setA].filter((kw) => setB.has(kw)));
      const union = new Set([...setA, ...setB]);
      if (union.size === 0) continue;
      const jaccard = shared.size / union.size;
      if (jaccard >= JACCARD_THRESHOLD) {
        throw new Error(
          `TRIGGER OVERLAP: ${a} vs ${b} jaccard=${jaccard.toFixed(2)} shared=${[...shared].sort().join(", ")}`,
        );
      }
    }
  }
}

// ---------- resolver consistency ----------

const SKILL_REF_RE = /skills\/([a-z][a-z0-9_-]*)\/SKILL\.md/g;

export function checkResolverConsistency(
  root: string,
  skills: Map<string, SkillFrontmatter>,
): void {
  const resolverPath = join(root, "skills", "RESOLVER.md");
  if (!existsSync(resolverPath)) {
    throw new Error(`MISSING RESOLVER: ${resolverPath}`);
  }
  const text = readFileSync(resolverPath, "utf-8");
  const referenced = new Set<string>();
  SKILL_REF_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SKILL_REF_RE.exec(text)) !== null) {
    referenced.add(match[1]!);
  }
  const expected = new Set(skills.keys());
  const missing = [...expected].filter((s) => !referenced.has(s));
  if (missing.length > 0) {
    throw new Error(`RESOLVER GAP: skills missing from RESOLVER.md: ${missing.sort().join(", ")}`);
  }
  const stale = [...referenced].filter((s) => !expected.has(s));
  if (stale.length > 0) {
    throw new Error(
      `RESOLVER STALE: RESOLVER.md references non-existent skills: ${stale.sort().join(", ")}`,
    );
  }
}

// ---------- spec format ----------

// A `Verify:` value is legal as a relative-path markdown link (a local test),
// or one of the manual kinds. External URLs (with `://`) are rejected: they
// also slip past checkMarkdownLinks, so they'd leave the requirement unverified.
const VERIFY_LINK_RE = /^\[[^\]]*\]\(([^)]+)\)$/;
const VERIFY_MANUAL = new Set(["manual(visual)", "manual(integration)"]);

export function checkSpecFormat(root: string): void {
  const specsDir = join(root, "specs");
  if (!existsSync(specsDir)) return;
  for (const entry of readdirSync(specsDir).sort()) {
    const specPath = join(specsDir, entry, "spec.md");
    try {
      if (!statSync(specPath).isFile()) continue;
    } catch {
      continue; // not a domain dir with a spec.md
    }
    const text = readFileSync(specPath, "utf-8");
    if (!text.includes("## Purpose")) {
      throw new Error(`SPEC MISSING PURPOSE: ${specPath}`);
    }
    if (!text.includes("## Requirements")) {
      throw new Error(`SPEC MISSING REQUIREMENTS: ${specPath}`);
    }
    const lines = text.split("\n");
    const reqStarts: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^### Requirement:/.test(lines[i]!)) reqStarts.push(i);
    }
    if (reqStarts.length === 0) {
      throw new Error(`SPEC NO REQUIREMENTS: ${specPath} has no "### Requirement:" entries`);
    }
    for (const start of reqStarts) {
      const name = lines[start]!.replace(/^### Requirement:\s*/, "").trim();
      let end = lines.length;
      for (let i = start + 1; i < lines.length; i++) {
        if (/^#{2,3} /.test(lines[i]!)) {
          end = i;
          break;
        }
      }
      const verifies = lines.slice(start + 1, end).filter((l) => /^Verify:/.test(l));
      if (verifies.length !== 1) {
        throw new Error(
          `SPEC VERIFY COUNT: ${specPath} requirement "${name}" has ${verifies.length} Verify lines, need exactly 1`,
        );
      }
      const value = verifies[0]!.replace(/^Verify:\s*/, "").trim();
      const link = VERIFY_LINK_RE.exec(value);
      const isRelativeLink = link !== null && !link[1]!.includes("://");
      if (!VERIFY_MANUAL.has(value) && !isRelativeLink) {
        throw new Error(
          `SPEC VERIFY INVALID: ${specPath} requirement "${name}": ${JSON.stringify(value)} — expected a relative markdown link to a test, or manual(visual)/manual(integration)`,
        );
      }
    }
  }
}
