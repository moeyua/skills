/**
 * Unit tests for scripts/checks.ts.
 *
 * Each test builds an isolated fake repo in tmpdir so the checks run on
 * controlled fixtures, not the live praxis repo. The live-repo verification
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
  checkOutcomeContract,
  checkReferencesExist,
  checkMarkdownLinks,
  checkNoRootSkill,
  checkTriggerJaccard,
  checkResolverConsistency,
} from "../scripts/checks.ts";

// ---------- fixture helper ----------

interface SkillSpec {
  name: string;
  description?: string;
  when_to_use?: string;
  dispatch_intent?: string;
  body?: string;
}

interface RepoOpts {
  resolver?: string;
  rootSkill?: boolean;
}

const DEFAULT_BODY = `# Stub

## Outcome Contract

- Outcome: ok
- Done when: ok
- Evidence: ok
- Output: ok
`;

function defaultDesc(name: string): string {
  return `${name} skill placeholder body that crosses forty chars. Use when triggered. Not for unrelated cases.`;
}

function buildFrontmatter(s: SkillSpec): string {
  return [
    "---",
    `name: ${s.name}`,
    `description: "${s.description ?? defaultDesc(s.name)}"`,
    `when_to_use: "${s.when_to_use ?? `${s.name}-trigger, $${s.name}`}"`,
    `dispatch_intent: "${s.dispatch_intent ?? `${s.name} intent`}"`,
    "---",
    "",
  ].join("\n");
}

function makeRepo(skills: SkillSpec[], opts: RepoOpts = {}): string {
  const root = mkdtempSync(join(tmpdir(), "praxis-fix-"));
  mkdirSync(join(root, "skills"), { recursive: true });
  for (const s of skills) {
    const dir = join(root, "skills", s.name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), buildFrontmatter(s) + (s.body ?? DEFAULT_BODY));
  }
  const resolverBody = opts.resolver ?? skills.map((s) => `- skills/${s.name}/SKILL.md`).join("\n");
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
  it("finds SKILL.md for each skill subdir", () => {
    const root = repo([{ name: "a" }, { name: "b" }]);
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
    const sneaky = join(root, "skills", "real", "SKILL.md");
    writeFileSync(sneaky, buildFrontmatter({ name: "different" }) + DEFAULT_BODY);
    expect(() => checkSkillFiles(root)).toThrow(/NAME MISMATCH/);
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

describe("checkOutcomeContract", () => {
  it("passes when section and 4 fields present", () => {
    const root = repo([{ name: "x" }]);
    expect(() => checkOutcomeContract(root)).not.toThrow();
  });

  it("fails when Outcome Contract section missing", () => {
    const root = repo([{ name: "x", body: "# Stub\n\nno contract here\n" }]);
    expect(() => checkOutcomeContract(root)).toThrow(/MISSING OUTCOME CONTRACT/);
  });

  it("fails when a field missing", () => {
    const root = repo([
      {
        name: "x",
        body: "## Outcome Contract\n\n- Outcome: ok\n- Done when: ok\n- Evidence: ok\n",
      },
    ]);
    expect(() => checkOutcomeContract(root)).toThrow(/Output:/);
  });
});

describe("checkReferencesExist", () => {
  it("passes when no references mentioned", () => {
    const root = repo([{ name: "x" }]);
    expect(() => checkReferencesExist(root)).not.toThrow();
  });

  it("passes when referenced file exists", () => {
    const root = repo([{ name: "x", body: `${DEFAULT_BODY}\nsee references/foo.md\n` }]);
    mkdirSync(join(root, "skills", "x", "references"));
    writeFileSync(join(root, "skills", "x", "references", "foo.md"), "# foo");
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
});

describe("checkTriggerJaccard", () => {
  it("passes when keyword sets are disjoint", () => {
    const root = repo([
      { name: "a", when_to_use: "alpha, $a" },
      { name: "b", when_to_use: "beta, $b" },
    ]);
    const map = checkSkillFiles(root);
    expect(() => checkTriggerJaccard(map)).not.toThrow();
  });

  it("fails when keyword sets overlap above threshold", () => {
    const root = repo([
      { name: "a", when_to_use: "shared, common, words" },
      { name: "b", when_to_use: "shared, common, words" },
    ]);
    const map = checkSkillFiles(root);
    expect(() => checkTriggerJaccard(map)).toThrow(/TRIGGER OVERLAP/);
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
      resolver: "- skills/a/SKILL.md",
    });
    const map = checkSkillFiles(root);
    expect(() => checkResolverConsistency(root, map)).toThrow(/RESOLVER GAP.*b/);
  });

  it("fails when RESOLVER.md references non-existent skill", () => {
    const root = repo([{ name: "a" }], {
      resolver: "- skills/a/SKILL.md\n- skills/ghost/SKILL.md",
    });
    const map = checkSkillFiles(root);
    expect(() => checkResolverConsistency(root, map)).toThrow(/RESOLVER STALE.*ghost/);
  });
});
