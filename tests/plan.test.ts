import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FORMATS_PATH = resolve(REPO_ROOT, "skills/plan/references/issue-formats.md");
const TEMPLATE_PATH = resolve(REPO_ROOT, "skills/plan/references/plan-template.md");
const SKILL_PATH = resolve(REPO_ROOT, "skills/plan/SKILL.md");
const TARGET_LOCAL_PATH = resolve(REPO_ROOT, "skills/plan/references/target-local.md");
const TARGET_ISSUE_PATH = resolve(REPO_ROOT, "skills/plan/references/target-issue.md");
const TARGET_BOTH_PATH = resolve(REPO_ROOT, "skills/plan/references/target-both.md");

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

  it("preserves local, issue, and both targets with both as the omitted default", () => {
    expect(skill).toContain("`local`");
    expect(skill).toContain("`issue`");
    expect(skill).toContain("`both`");
    expect(skill).toMatch(/(?:omitted|省略)[\s\S]*`both`/i);
    expect(() => readFileSync(TARGET_LOCAL_PATH, "utf8")).not.toThrow();
    expect(() => readFileSync(TARGET_ISSUE_PATH, "utf8")).not.toThrow();
    expect(() => readFileSync(TARGET_BOTH_PATH, "utf8")).not.toThrow();
  });

  it("writes local before Issue for the both target and preserves partial success", () => {
    const both = readFileSync(TARGET_BOTH_PATH, "utf8");
    expect(both).toMatch(/local[\s\S]*before[\s\S]*Issue/i);
    expect(both).toMatch(/Issue failure[\s\S]*(?:never|does not)[\s\S]*(?:invalid|remove)/i);
  });

  it("records at most one canonical Issue association", () => {
    expect(skill).toContain("at most one GitHub Issue identity");
    expect(skill).toContain("never search by title");
    expect(template).toContain("issue: <canonical GitHub Issue URL; include only after success>");
  });

  it("does not require an earlier shape session", () => {
    expect(skill).toMatch(/(?:does not require|Do not require)[\s\S]*shape/i);
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
    const local = readFileSync(TARGET_LOCAL_PATH, "utf8");
    const issue = readFileSync(TARGET_ISSUE_PATH, "utf8");
    const both = readFileSync(TARGET_BOTH_PATH, "utf8");
    expect(skill).not.toContain("gh auth status --active --hostname github.com");
    expect(issue).toContain("gh auth status --active --hostname github.com");
    expect(both).toContain("gh auth status --active --hostname github.com");
    expect(local).toMatch(
      /canonical Issue URL[\s\S]*(?:authenticate|authentication)[\s\S]*read-only/i,
    );
    expect(issue).toContain("user's language");
    expect(issue + both).toContain("safe temporary body file");
    expect(both).toMatch(
      /temporary body file[\s\S]*(?:remove|delete)[\s\S]*(?:success|failure|ambiguous)/i,
    );
    expect(formats).toContain("Render each semantic section as one natural visible `##` heading");
  });

  it("projects each Issue create candidate through its own type and batch labels", () => {
    expect(formats).toMatch(/each create candidate[\s\S]*its own[\s\S]*(?:type|schema)/i);
    expect(formats).toMatch(/all missing[\s\S]*change-type labels[\s\S]*at most once/i);
  });

  it("resolves canonical repository identity and maps label creation failure", () => {
    const issue = readFileSync(TARGET_ISSUE_PATH, "utf8");
    const both = readFileSync(TARGET_BOTH_PATH, "utf8");
    expect(both).toMatch(/explicit repository[\s\S]*canonical Issue URL[\s\S]*current repository/i);
    expect(issue).toMatch(/label creation fails[\s\S]*first create candidate[\s\S]*not-attempted/i);
  });
});
