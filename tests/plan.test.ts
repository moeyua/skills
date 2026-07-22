import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FORMATS_PATH = resolve(REPO_ROOT, "skills/plan/references/issue-formats.md");
const TEMPLATE_PATH = resolve(REPO_ROOT, "skills/plan/references/plan-template.md");
const SKILL_PATH = resolve(REPO_ROOT, "skills/plan/SKILL.md");

const EXPECTED_CHANGE_TYPES = ["fix", "feat", "refactor", "perf"] as const;

const REQUIRED_SECTIONS = {
  fix: ["background", "problem", "reproduction", "expected", "actual", "scope", "acceptance"],
  feat: ["background", "goal", "user_scenario", "scope", "non_goals", "acceptance"],
  refactor: ["background", "refactor_goal", "behavior_invariants", "scope", "acceptance"],
  perf: [
    "background",
    "performance_problem",
    "metric",
    "baseline",
    "target",
    "measurement",
    "scope",
    "acceptance",
  ],
} as const;

function extractSchema(markdown: string, type: keyof typeof REQUIRED_SECTIONS): string {
  const pattern = "^## `" + type + "`\\n\\n([\\s\\S]*?)(?=\\n## `|(?![\\s\\S]))";
  const match = new RegExp(pattern, "m").exec(markdown);
  expect(match, `missing centralized ${type} schema`).not.toBeNull();
  return match![1]!;
}

describe("plan artifact contract", () => {
  const skill = readFileSync(SKILL_PATH, "utf8");
  const template = readFileSync(TEMPLATE_PATH, "utf8");

  it("always writes the local plan before attempting the optional Issue", () => {
    expect(skill).toMatch(/write the local plan.+before.+GitHub Issue/is);
    expect(skill).toContain("Issue failure never invalidates, removes, or blocks the local plan");
  });

  it("records at most one canonical Issue association", () => {
    expect(skill).toContain("at most one GitHub Issue");
    expect(skill).toContain("never search by title");
    expect(template).toContain("issue: <canonical GitHub Issue URL; include only after success>");
  });

  it("does not require an earlier shape session", () => {
    expect(skill).toContain("Do not require shape");
  });
});

describe("plan Issue projection contract", () => {
  const skill = readFileSync(SKILL_PATH, "utf8");
  const formats = readFileSync(FORMATS_PATH, "utf8");

  it("keeps label metadata and schemas aligned to the four shared change types", () => {
    const metadata = /^## Label metadata\n\n([\s\S]*?)(?=\n## `fix`)/m.exec(formats);
    expect(metadata, "missing label metadata table").not.toBeNull();

    const metadataLabels = [...metadata![1]!.matchAll(/^\| `([a-z]+)`\s+\|/gm)].map(
      (match) => match[1]!,
    );
    const schemaTypes = [...formats.matchAll(/^## `([a-z]+)`$/gm)].map((match) => match[1]!);

    expect(metadataLabels).toEqual(EXPECTED_CHANGE_TYPES);
    expect(schemaTypes).toEqual(EXPECTED_CHANGE_TYPES);
    expect(metadataLabels).toEqual(schemaTypes);
    expect(formats).not.toMatch(/(?:^## |^\| )`brainstorm`/m);
  });

  it.each(Object.entries(REQUIRED_SECTIONS))(
    "locks the semantic section order for %s",
    (type, expected) => {
      const schema = extractSchema(formats, type as keyof typeof REQUIRED_SECTIONS);
      const sections = [...schema.matchAll(/^\| `([a-z_]+)`\s+\|/gm)].map((match) => match[1]!);

      expect(sections).toEqual(expected);
    },
  );

  it("uses the user's language and the active GitHub account", () => {
    expect(skill).toContain("Use the user's current language for every user-visible Issue field");
    expect(skill).toContain("gh auth status --active --hostname github.com");
    expect(formats).toContain("Render each semantic section as one natural visible `##` heading");
  });
});
