/**
 * Validation checks for Skills.
 *
 * All checks are library functions: take repo root (or pre-collected data),
 * throw on failure. Driver is `tests/smoke/verify-skills.test.ts`, which wraps
 * each check in a vitest `it()` for unified reporting.
 *
 * Each check has a corresponding unit test in `tests/checks.test.ts` using
 * tmpdir fixtures, so logic is exercised without depending on the live repo.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { parseFrontmatter, type SkillFrontmatter } from "./frontmatter.ts";

// ---------- skill file discovery ----------

export function findSkillFiles(root: string): string[] {
  const skillsDir = join(root, "skills");
  const result: string[] = [];
  for (const category of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = join(skillsDir, category.name);
    if (existsSync(join(categoryDir, "SKILL.md"))) {
      throw new Error(`CATEGORY SKILL.md DISALLOWED: ${categoryDir}; would shadow nested skills`);
    }
    for (const skill of readdirSync(categoryDir, { withFileTypes: true })) {
      if (!skill.isDirectory()) continue;
      const skillPath = join(categoryDir, skill.name, "SKILL.md");
      if (existsSync(skillPath) && statSync(skillPath).isFile()) result.push(skillPath);
    }
  }
  return result.sort();
}

export function checkSkillFiles(root: string): Map<string, SkillFrontmatter> {
  const skillFiles = findSkillFiles(root);
  if (skillFiles.length === 0) {
    throw new Error("NO SKILLS FOUND: expected skills/*/*/SKILL.md");
  }
  const out = new Map<string, SkillFrontmatter>();
  for (const path of skillFiles) {
    const skillDir = basename(dirname(path));
    const fields = parseFrontmatter(path);
    if (fields.name !== skillDir) {
      throw new Error(`NAME MISMATCH: ${path} frontmatter name=${fields.name} dir=${skillDir}`);
    }
    if (out.has(skillDir)) {
      throw new Error(`DUPLICATE SKILL NAME: ${skillDir} appears in multiple categories (${path})`);
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
      // The repo-root plans/ holds historical, point-in-time records: a past plan
      // legitimately links to files later renamed or deleted, so don't gate on them.
      if (entry === "plans" && dir === root) continue;
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

export function checkMarkdownLinks(root: string, scanRoot: string = root): void {
  for (const path of collectMarkdownFiles(scanRoot)) {
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
  for (const container of [root, join(root, "skills")]) {
    const rootSkill = join(container, "SKILL.md");
    if (existsSync(rootSkill)) {
      throw new Error(
        `ROOT SKILL.md DISALLOWED at ${rootSkill}; breaks 'npx skills add' nested discovery`,
      );
    }
  }
}

// ---------- resolver consistency ----------

const SKILL_REF_RE = /\bskills\/(?:[a-z][a-z0-9_-]*\/)+SKILL\.md/g;

export function checkResolverConsistency(
  root: string,
  skills: Map<string, SkillFrontmatter>,
): void {
  const resolverPath = join(root, "skills", "RESOLVER.md");
  if (!existsSync(resolverPath)) {
    throw new Error(`MISSING RESOLVER: ${resolverPath}`);
  }
  const text = readFileSync(resolverPath, "utf-8");
  const actualPaths = new Set(
    findSkillFiles(root).map((path) => relative(root, path).split(sep).join("/")),
  );
  const referenced = new Set<string>();
  const paths = new Set<string>();
  SKILL_REF_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SKILL_REF_RE.exec(text)) !== null) {
    referenced.add(basename(dirname(match[0])));
    paths.add(match[0]);
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
  for (const path of paths) {
    if (!actualPaths.has(path)) {
      throw new Error(`RESOLVER PATH MISMATCH: ${path} is not a discovered skill entry`);
    }
  }
}

// ---------- category navigation ----------

export function checkCategoryReadmes(root: string): void {
  const categories = new Map<string, Set<string>>();
  for (const path of findSkillFiles(root)) {
    const category = dirname(dirname(path));
    if (!categories.has(category)) categories.set(category, new Set());
    categories.get(category)!.add(resolve(path));
  }
  for (const [category, expected] of categories) {
    const readme = join(category, "README.md");
    if (!existsSync(readme)) throw new Error(`CATEGORY README MISSING: ${readme}`);
    const referenced = new Set<string>();
    LINK_RE.lastIndex = 0;
    for (const match of readFileSync(readme, "utf8").matchAll(LINK_RE)) {
      const target = match[1]!.trim().split(/[?#]/)[0]!;
      if (!target.endsWith("/SKILL.md") && target !== "SKILL.md") continue;
      const path = resolve(category, target);
      if (!expected.has(path)) throw new Error(`CATEGORY README STALE: ${readme} -> ${target}`);
      if (referenced.has(path))
        throw new Error(`CATEGORY README DUPLICATE: ${readme} -> ${target}`);
      referenced.add(path);
    }
    const missing = [...expected].filter((path) => !referenced.has(path));
    if (missing.length > 0) {
      throw new Error(
        `CATEGORY README GAP: ${readme} is missing ${missing.map((path) => basename(dirname(path))).join(", ")}`,
      );
    }
  }
}

// ---------- skill <-> spec pairing ----------

// Every skill carries a behavior contract in specs/<name>/spec.md, and every
// spec domain must still have its skill (cf. checkResolverConsistency).
export function checkSpecPairing(root: string, skills: Map<string, SkillFrontmatter>): void {
  const specsDir = join(root, "specs");
  const domains = new Set<string>();
  if (existsSync(specsDir)) {
    for (const entry of readdirSync(specsDir)) {
      if (existsSync(join(specsDir, entry, "spec.md"))) domains.add(entry);
    }
  }
  const missing = [...skills.keys()].filter((s) => !domains.has(s));
  if (missing.length > 0) {
    throw new Error(
      `SPEC MISSING: skills without specs/<name>/spec.md: ${missing.sort().join(", ")}`,
    );
  }
  const orphan = [...domains].filter((d) => !skills.has(d));
  if (orphan.length > 0) {
    throw new Error(
      `SPEC ORPHAN: specs/ domains without a matching skill: ${orphan.sort().join(", ")}`,
    );
  }
}

// ---------- memory catalog <-> formats sync ----------

// The catalog indexes each memory artifact and points to its format spec via a
// `references/formats/<name>.md` reference. document owns those format files.
// Keep the index and the files in lockstep (cf. checkResolverConsistency).
const FORMAT_REF_RE = /references\/formats\/([a-z0-9-]+\.md)/g;

export function checkMemoryCatalog(root: string): void {
  const catalogPath = join(root, "rules", "memory-catalog.md");
  if (!existsSync(catalogPath)) return; // no catalog → nothing to check
  const text = readFileSync(catalogPath, "utf-8");

  const referenced = new Set<string>();
  FORMAT_REF_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FORMAT_REF_RE.exec(text)) !== null) referenced.add(match[1]!);

  const formatsDir = join(root, "skills", "engineering", "docs", "references", "formats");
  const actual = new Set<string>(
    existsSync(formatsDir) ? readdirSync(formatsDir).filter((f) => f.endsWith(".md")) : [],
  );

  const missing = [...referenced].filter((f) => !actual.has(f));
  if (missing.length > 0) {
    throw new Error(
      `MEMORY FORMAT MISSING: catalog points to ${missing.sort().join(", ")} but no such file under skills/engineering/docs/references/formats/`,
    );
  }
  const orphan = [...actual].filter((f) => !referenced.has(f));
  if (orphan.length > 0) {
    throw new Error(
      `MEMORY FORMAT ORPHAN: ${orphan.sort().join(", ")} under skills/engineering/docs/references/formats/ is not referenced by rules/memory-catalog.md`,
    );
  }
}
