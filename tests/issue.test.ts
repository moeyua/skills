import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FORMATS_PATH = resolve(REPO_ROOT, "skills/issue/references/formats.md");
const SKILL_PATH = resolve(REPO_ROOT, "skills/issue/SKILL.md");

const EXPECTED_LABELS = ["fix", "feat", "refactor", "perf"] as const;

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

function extractSchema(markdown: string, mode: keyof typeof REQUIRED_SECTIONS): string {
  const pattern = "^## `" + mode + "`\\n\\n([\\s\\S]*?)(?=\\n## `|(?![\\s\\S]))";
  const match = new RegExp(pattern, "m").exec(markdown);
  expect(match, `missing centralized ${mode} schema`).not.toBeNull();
  return match![1]!;
}

describe("issue format contract", () => {
  const formats = readFileSync(FORMATS_PATH, "utf8");

  it("keeps label metadata and schemas aligned to exactly four named modes", () => {
    const metadata = /^## Label metadata\n\n([\s\S]*?)(?=\n## `fix`)/m.exec(formats);
    expect(metadata, "missing label metadata table").not.toBeNull();

    const metadataLabels = [...metadata![1]!.matchAll(/^\| `([a-z]+)`\s+\|/gm)].map(
      (match) => match[1]!,
    );
    const schemaModes = [...formats.matchAll(/^## `([a-z]+)`$/gm)].map((match) => match[1]!);

    expect(metadataLabels).toEqual(EXPECTED_LABELS);
    expect(schemaModes).toEqual(EXPECTED_LABELS);
    expect(metadataLabels).toEqual(schemaModes);
    expect(formats).not.toMatch(/(?:^## |^\| )`brainstorm`/m);
  });

  it.each(Object.entries(REQUIRED_SECTIONS))(
    "locks the semantic section order for %s",
    (mode, expected) => {
      const schema = extractSchema(formats, mode as keyof typeof REQUIRED_SECTIONS);
      const sections = [...schema.matchAll(/^\| `([a-z_]+)`\s+\|/gm)].map((match) => match[1]!);

      expect(sections).toEqual(expected);
    },
  );
});

describe("issue language contract", () => {
  const skill = readFileSync(SKILL_PATH, "utf8");
  const formats = readFileSync(FORMATS_PATH, "utf8");

  it("keeps language resolution in the skill and format structure in the reference", () => {
    expect(skill).toContain("Use the user's current language for every user-visible field.");
    expect(skill).toContain("An explicit language request overrides the surrounding conversation");
    expect(formats).not.toContain("user's current language");
    expect(formats).not.toContain("explicit language request");
    expect(formats).toContain("Render each semantic section as one natural visible `##` heading");
  });
});

describe("issue GitHub preflight", () => {
  const skill = readFileSync(SKILL_PATH, "utf8");

  it("checks only the active github.com account", () => {
    expect(skill).toContain("gh auth status --active --hostname github.com");
  });
});
