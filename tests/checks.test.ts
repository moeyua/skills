/**
 * Unit tests for tests/checks.ts.
 *
 * Each test builds an isolated fake repo in tmpdir so the checks run on
 * controlled fixtures, not the live Skills repo. The live-repo verification
 * lives in tests/smoke/verify-skills.test.ts.
 */

import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  findSkillFiles,
  checkSkillFiles,
  checkDescriptionConformance,
  checkReferencesExist,
  checkMarkdownLinks,
  checkNoRootSkill,
  checkResolverConsistency,
  checkSpecPairing,
  checkCategoryReadmes,
} from "./checks.ts";

// ---------- fixture helper ----------

interface SkillSpec {
  name: string;
  category?: string;
  description?: string;
  body?: string;
}

interface RepoOpts {
  resolver?: string;
  rootSkill?: boolean;
}

const DEFAULT_BODY = "# Stub\n\nA lightweight capability guide.\n";

function defaultDesc(name: string): string {
  return `${name} skill placeholder body that crosses forty chars. Use when triggered. Not for unrelated cases.`;
}

function buildFrontmatter(s: SkillSpec): string {
  return [
    "---",
    `name: ${s.name}`,
    `description: "${s.description ?? defaultDesc(s.name)}"`,
    "---",
    "",
  ].join("\n");
}

function makeRepo(skills: SkillSpec[], opts: RepoOpts = {}): string {
  const root = mkdtempSync(join(tmpdir(), "skills-fix-"));
  mkdirSync(join(root, "skills"), { recursive: true });
  for (const s of skills) {
    const dir = join(root, "skills", s.category ?? "engineering", s.name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), buildFrontmatter(s) + (s.body ?? DEFAULT_BODY));
  }
  for (const category of new Set(skills.map((s) => s.category ?? "engineering"))) {
    const links = skills
      .filter((s) => (s.category ?? "engineering") === category)
      .map((s) => `- [${s.name}](./${s.name}/SKILL.md): A fixture skill.`)
      .join("\n");
    writeFileSync(join(root, "skills", category, "README.md"), `# ${category}\n\n${links}\n`);
  }
  const resolverBody =
    opts.resolver ??
    skills.map((s) => `- skills/${s.category ?? "engineering"}/${s.name}/SKILL.md`).join("\n");
  writeFileSync(join(root, "skills", "RESOLVER.md"), `# Resolver\n\n${resolverBody}\n`);
  if (opts.rootSkill) {
    writeFileSync(join(root, "SKILL.md"), "should not be here");
  }
  return root;
}

let activeRoots: string[] = [];

function repo(skills: SkillSpec[], opts: RepoOpts = {}): string {
  const r = makeRepo(skills, opts);
  activeRoots.push(r);
  return r;
}

beforeEach(() => {
  activeRoots = [];
});

afterEach(() => {
  for (const r of activeRoots) rmSync(r, { recursive: true, force: true });
});

// ---------- tests ----------

describe("findSkillFiles", () => {
  it("finds skill entries across categories without a category whitelist", () => {
    const root = repo([
      { name: "a", category: "design" },
      { name: "b", category: "research" },
    ]);
    const files = findSkillFiles(root);
    expect(files).toHaveLength(2);
    expect(files[0]).toContain("a/SKILL.md");
    expect(files[1]).toContain("b/SKILL.md");
  });

  it("skips non-directory entries like RESOLVER.md", () => {
    const root = repo([{ name: "a" }]);
    const files = findSkillFiles(root);
    expect(files).toHaveLength(1);
  });

  it("does not discover examples nested inside a skill", () => {
    const root = repo([{ name: "a" }]);
    const nested = join(root, "skills", "engineering", "a", "references", "example");
    mkdirSync(nested, { recursive: true });
    writeFileSync(join(nested, "SKILL.md"), buildFrontmatter({ name: "example" }));
    expect(findSkillFiles(root)).toHaveLength(1);
  });

  it("rejects a category entry that would shadow its skills", () => {
    const root = repo([{ name: "a" }]);
    writeFileSync(
      join(root, "skills", "engineering", "SKILL.md"),
      buildFrontmatter({ name: "engineering" }),
    );
    expect(() => findSkillFiles(root)).toThrow(/CATEGORY SKILL.md DISALLOWED/);
  });
});

describe("checkSkillFiles", () => {
  it("returns a map of name -> frontmatter", () => {
    const root = repo([{ name: "alpha" }, { name: "beta" }]);
    const map = checkSkillFiles(root);
    expect(map.size).toBe(2);
    expect(map.get("alpha")?.name).toBe("alpha");
  });

  it("throws when skills dir is empty", () => {
    const root = mkdtempSync(join(tmpdir(), "empty-"));
    activeRoots.push(root);
    mkdirSync(join(root, "skills"));
    expect(() => checkSkillFiles(root)).toThrow(/NO SKILLS FOUND/);
  });

  it("throws when frontmatter name disagrees with dir", () => {
    const root = repo([{ name: "real" }]);
    // Sneak in a SKILL.md whose frontmatter name doesn't match the dir.
    const sneaky = join(root, "skills", "engineering", "real", "SKILL.md");
    writeFileSync(sneaky, buildFrontmatter({ name: "different" }) + DEFAULT_BODY);
    expect(() => checkSkillFiles(root)).toThrow(/NAME MISMATCH/);
  });

  it("rejects names duplicated across categories instead of hiding one", () => {
    const root = repo([{ name: "same" }, { name: "same", category: "design" }]);
    expect(() => checkSkillFiles(root)).toThrow(/DUPLICATE SKILL NAME.*same/);
  });
});

describe("checkDescriptionConformance", () => {
  it("passes for compliant description", () => {
    const root = repo([{ name: "x" }]);
    const map = checkSkillFiles(root);
    expect(() => checkDescriptionConformance(map)).not.toThrow();
  });

  it("fails when too short (<40 chars)", () => {
    const root = repo([{ name: "x", description: "short. Use when. Not for." }]);
    const map = checkSkillFiles(root);
    expect(() => checkDescriptionConformance(map)).toThrow(/TOO SHORT/);
  });

  it("fails when missing 'Use when'", () => {
    const root = repo([
      {
        name: "x",
        description: "Long enough description without the magic phrase. Not for unrelated.",
      },
    ]);
    const map = checkSkillFiles(root);
    expect(() => checkDescriptionConformance(map)).toThrow(/USE-WHEN/);
  });

  it("fails when missing 'Not for'", () => {
    const root = repo([
      {
        name: "x",
        description: "Long enough description with magic phrase. Use when triggered.",
      },
    ]);
    const map = checkSkillFiles(root);
    expect(() => checkDescriptionConformance(map)).toThrow(/EXCLUSION/);
  });

  it("fails when starting with article", () => {
    const root = repo([
      {
        name: "x",
        description: "The skill that does it. Use when triggered. Not for unrelated.",
      },
    ]);
    const map = checkSkillFiles(root);
    expect(() => checkDescriptionConformance(map)).toThrow(/ARTICLE/);
  });
});

describe("checkReferencesExist", () => {
  it("passes when no references mentioned", () => {
    const root = repo([{ name: "x" }]);
    expect(() => checkReferencesExist(root)).not.toThrow();
  });

  it("passes when referenced file exists", () => {
    const root = repo([{ name: "x", body: `${DEFAULT_BODY}\nsee references/foo.md\n` }]);
    mkdirSync(join(root, "skills", "engineering", "x", "references"));
    writeFileSync(join(root, "skills", "engineering", "x", "references", "foo.md"), "# foo");
    expect(() => checkReferencesExist(root)).not.toThrow();
  });

  it("fails when referenced file missing", () => {
    const root = repo([{ name: "x", body: `${DEFAULT_BODY}\nsee references/missing.md\n` }]);
    expect(() => checkReferencesExist(root)).toThrow(/BROKEN REFERENCE/);
  });
});

describe("checkMarkdownLinks", () => {
  it("passes for external URLs (not checked)", () => {
    const root = repo([{ name: "x", body: `${DEFAULT_BODY}\n[link](https://example.com)\n` }]);
    expect(() => checkMarkdownLinks(root)).not.toThrow();
  });

  it("passes when relative link target exists", () => {
    const root = repo([{ name: "x", body: `${DEFAULT_BODY}\n[ref](./SKILL.md)\n` }]);
    expect(() => checkMarkdownLinks(root)).not.toThrow();
  });

  it("fails when relative link target missing", () => {
    const root = repo([{ name: "x", body: `${DEFAULT_BODY}\n[ref](./nope.md)\n` }]);
    expect(() => checkMarkdownLinks(root)).toThrow(/BROKEN MARKDOWN LINK/);
  });

  it("ignores links inside code fences", () => {
    const root = repo([
      {
        name: "x",
        body: `${DEFAULT_BODY}\n\n\`\`\`\n[broken](./nope.md)\n\`\`\`\n`,
      },
    ]);
    expect(() => checkMarkdownLinks(root)).not.toThrow();
  });

  it("ignores links inside inline code (single backticks)", () => {
    const root = repo([
      {
        name: "x",
        body: `${DEFAULT_BODY}\n\nQuote a snippet: \`[broken](./nope.md)\` here.\n`,
      },
    ]);
    expect(() => checkMarkdownLinks(root)).not.toThrow();
  });

  it("ignores markdown files under the repo-root plans/ (historical, point-in-time refs)", () => {
    const root = repo([{ name: "x" }]);
    mkdirSync(join(root, "plans"));
    writeFileSync(
      join(root, "plans", "2026-01-01-foo.md"),
      "# Plan\n\n[gone](../deleted/file.md)\n",
    );
    expect(() => checkMarkdownLinks(root)).not.toThrow();
  });

  it("still checks a nested plans/ dir (only the repo-root plans/ is exempt)", () => {
    const root = repo([{ name: "x" }]);
    mkdirSync(join(root, "skills", "engineering", "x", "plans"));
    writeFileSync(join(root, "skills", "engineering", "x", "plans", "p.md"), "[gone](./nope.md)\n");
    expect(() => checkMarkdownLinks(root)).toThrow(/BROKEN MARKDOWN LINK/);
  });
});

describe("checkNoRootSkill", () => {
  it("passes when no root SKILL.md", () => {
    const root = repo([{ name: "x" }]);
    expect(() => checkNoRootSkill(root)).not.toThrow();
  });

  it("fails when root SKILL.md exists", () => {
    const root = repo([{ name: "x" }], { rootSkill: true });
    expect(() => checkNoRootSkill(root)).toThrow(/ROOT SKILL.md DISALLOWED/);
  });

  it("fails when the skills container has its own SKILL.md", () => {
    const root = repo([{ name: "x" }]);
    writeFileSync(join(root, "skills", "SKILL.md"), buildFrontmatter({ name: "skills" }));
    expect(() => checkNoRootSkill(root)).toThrow(/ROOT SKILL.md DISALLOWED/);
  });
});

describe("checkResolverConsistency", () => {
  it("passes when RESOLVER.md lists every skill", () => {
    const root = repo([{ name: "a" }, { name: "b" }]);
    const map = checkSkillFiles(root);
    expect(() => checkResolverConsistency(root, map)).not.toThrow();
  });

  it("fails when skill not listed in RESOLVER.md", () => {
    const root = repo([{ name: "a" }, { name: "b" }], {
      resolver: "- skills/engineering/a/SKILL.md",
    });
    const map = checkSkillFiles(root);
    expect(() => checkResolverConsistency(root, map)).toThrow(/RESOLVER GAP.*b/);
  });

  it("fails when RESOLVER.md references non-existent skill", () => {
    const root = repo([{ name: "a" }], {
      resolver: "- skills/engineering/a/SKILL.md\n- skills/engineering/ghost/SKILL.md",
    });
    const map = checkSkillFiles(root);
    expect(() => checkResolverConsistency(root, map)).toThrow(/RESOLVER STALE.*ghost/);
  });

  it.each(["skills/design/a/SKILL.md", "skills/a/SKILL.md"])(
    "rejects a real name at an invalid path: %s",
    (path) => {
      const root = repo([{ name: "a" }], { resolver: `- ${path}` });
      expect(() => checkResolverConsistency(root, checkSkillFiles(root))).toThrow(
        /RESOLVER PATH MISMATCH/,
      );
    },
  );
});

describe("checkCategoryReadmes", () => {
  it("requires complete navigation for each populated category", () => {
    const root = repo([{ name: "a" }, { name: "b", category: "design" }]);
    expect(() => checkCategoryReadmes(root)).not.toThrow();
  });

  it("rejects a missing category README", () => {
    const root = repo([{ name: "a" }]);
    rmSync(join(root, "skills", "engineering", "README.md"));
    expect(() => checkCategoryReadmes(root)).toThrow(/CATEGORY README MISSING/);
  });

  it.each([
    ["omitted skills", ["./a/SKILL.md"], /CATEGORY README GAP.*b/],
    ["cross-category entries", ["../design/c/SKILL.md"], /CATEGORY README STALE/],
    ["duplicate entries", ["./a/SKILL.md", "./a/SKILL.md"], /CATEGORY README DUPLICATE/],
  ])("rejects %s", (_case, targets, error) => {
    const root = repo([{ name: "a" }, { name: "b" }, { name: "c", category: "design" }]);
    writeFileSync(
      join(root, "skills", "engineering", "README.md"),
      `# Engineering\n\n${targets.map((target) => `- [skill](${target}): A skill.`).join("\n")}\n`,
    );
    expect(() => checkCategoryReadmes(root)).toThrow(error);
  });
});

function addSpec(root: string, domain: string): void {
  const dir = join(root, "specs", domain);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "spec.md"), "# Spec\n\n## Purpose\n\nstub\n");
}

describe("checkSpecPairing", () => {
  it("passes when every skill has a spec and every spec has a skill", () => {
    const root = repo([{ name: "a" }, { name: "b" }]);
    addSpec(root, "a");
    addSpec(root, "b");
    const map = checkSkillFiles(root);
    expect(() => checkSpecPairing(root, map)).not.toThrow();
  });

  it("fails when a skill has no spec (also covers a missing specs/ dir)", () => {
    const root = repo([{ name: "a" }, { name: "b" }]);
    addSpec(root, "a");
    const map = checkSkillFiles(root);
    expect(() => checkSpecPairing(root, map)).toThrow(/SPEC MISSING.*b/);
  });

  it("fails on an orphan spec domain with no matching skill", () => {
    const root = repo([{ name: "a" }]);
    addSpec(root, "a");
    addSpec(root, "ghost");
    const map = checkSkillFiles(root);
    expect(() => checkSpecPairing(root, map)).toThrow(/SPEC ORPHAN.*ghost/);
  });
});
