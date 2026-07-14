import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FORMATS_PATH = resolve(REPO_ROOT, "skills/issue/references/formats.md");
const SKILL_PATH = resolve(REPO_ROOT, "skills/issue/SKILL.md");

const EXPECTED_LABELS = ["fix", "feat", "refactor", "perf"] as const;

const REQUIRED_HEADINGS = {
  fix: ["背景", "问题描述", "复现步骤", "预期行为", "实际行为", "范围", "验收标准"],
  feat: ["背景", "目标", "用户场景", "范围", "非目标", "验收标准"],
  refactor: ["背景", "重构目标", "行为不变量", "范围", "验收标准"],
  perf: ["背景", "性能问题", "衡量指标", "当前基线", "目标", "测量方式", "范围", "验收标准"],
} as const;

function extractTemplate(markdown: string, mode: keyof typeof REQUIRED_HEADINGS): string {
  const pattern = "^## `" + mode + "`\\n\\n```markdown\\n([\\s\\S]*?)\\n```$";
  const match = new RegExp(pattern, "m").exec(markdown);
  expect(match, `missing centralized ${mode} template`).not.toBeNull();
  return match![1]!;
}

describe("issue format contract", () => {
  const formats = readFileSync(FORMATS_PATH, "utf8");

  it("keeps label metadata and templates aligned to exactly four named modes", () => {
    const metadataLabels = [...formats.matchAll(/^\| `([a-z]+)`\s+\|/gm)].map((match) => match[1]!);
    const templateModes = [...formats.matchAll(/^## `([a-z]+)`$/gm)].map((match) => match[1]!);

    expect(metadataLabels).toEqual(EXPECTED_LABELS);
    expect(templateModes).toEqual(EXPECTED_LABELS);
    expect(metadataLabels).toEqual(templateModes);
    expect(formats).not.toMatch(/(?:^## |^\| )`brainstorm`/m);
  });

  it.each(Object.entries(REQUIRED_HEADINGS))(
    "locks the Chinese headings for %s",
    (mode, expected) => {
      const template = extractTemplate(formats, mode as keyof typeof REQUIRED_HEADINGS);
      const headings = [...template.matchAll(/^## (.+)$/gm)].map((match) => match[1]!);

      expect(headings).toEqual(expected);
      expect(headings.every((heading) => /^[\p{Script=Han}]+$/u.test(heading))).toBe(true);
    },
  );
});

describe("issue GitHub preflight", () => {
  const skill = readFileSync(SKILL_PATH, "utf8");

  it("checks only the active github.com account", () => {
    expect(skill).toContain("gh auth status --active --hostname github.com");
  });
});
