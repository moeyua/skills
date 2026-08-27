import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string): string {
  return readFileSync(resolve(REPO_ROOT, path), "utf8");
}

const PRODUCT = read("PRODUCT.md");
const ARCHITECTURE = read("ARCHITECTURE.md");
const SHAPE = read("skills/shape/SKILL.md");
const PLAN = read("skills/plan/SKILL.md");
const PLAN_TEMPLATE = read("skills/plan/references/plan-template.md");
const IMPLEMENT = read("skills/implement/SKILL.md");
const CHECK = read("skills/check/SKILL.md");
const REVIEW = read("skills/check/references/review.md");
const DOCS = read("skills/docs/SKILL.md");

const SPECS = {
  shape: read("specs/shape/spec.md"),
  plan: read("specs/plan/spec.md"),
  implement: read("specs/implement/spec.md"),
  check: read("specs/check/spec.md"),
  docs: read("specs/docs/spec.md"),
} as const;

function requirement(markdown: string, name: string): string {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(
    `^### Requirement: ${escapedName}\\n\\n([\\s\\S]*?)(?=\\n### Requirement:|(?![\\s\\S]))`,
    "m",
  ).exec(markdown);
  expect(match, `missing requirement: ${name}`).not.toBeNull();
  return match![1]!;
}

describe("development integrity", () => {
  it("extracts complete multiline requirement blocks", () => {
    const fixture = `# Fixture Specification

### Requirement: first

line one
line two
Verify: manual(integration)

### Requirement: second

second body
Verify: manual(integration)
`;

    const block = requirement(fixture, "first");
    expect(block).toContain("line one\nline two\nVerify: manual(integration)");
    expect(block).not.toContain("second body");
  });

  it("defines fail-close and clean-break as one product boundary", () => {
    expect(PRODUCT).toMatch(
      /\*\*Fail-close\*\*[\s\S]*(?:failed|failure)[\s\S]*ambiguous[\s\S]*missing[\s\S]*(?:never|not)[\s\S]*(?:success|alternate path)/i,
    );
    expect(PRODUCT).toMatch(
      /\*\*Clean-break\*\*[\s\S]*(?:replace|remove)[\s\S]*superseded[\s\S]*fallback[\s\S]*compatibility[\s\S]*migration[\s\S]*legacy[\s\S]*(?:explicit user|authoritative project)/i,
    );
    expect(ARCHITECTURE).toMatch(/fail-close[\s\S]*clean-break/i);
  });

  it("keeps continuity decisions out of mechanical shaping and planning", () => {
    expect(SHAPE).toMatch(
      /fallback[\s\S]*compatibility[\s\S]*migration[\s\S]*legacy[\s\S]*(?:consequential|authority)/i,
    );
    expect(PLAN).toMatch(
      /fallback[\s\S]*compatibility[\s\S]*migration[\s\S]*legacy[\s\S]*(?:authority|authoritative)/i,
    );
    expect(PLAN_TEMPLATE).not.toContain("and safe migration");
    expect(PLAN_TEMPLATE).toMatch(/transition or migration only when[\s\S]*(?:outcome|contract)/i);
  });

  it("executes and checks clean breaks without masking failure", () => {
    expect(IMPLEMENT).toMatch(
      /fallback[\s\S]*compatibility[\s\S]*migration[\s\S]*legacy[\s\S]*(?:not mechanical|require)[\s\S]*superseded/i,
    );
    expect(IMPLEMENT).toMatch(
      /(?:failed|failure)[\s\S]*ambiguous[\s\S]*missing[\s\S]*(?:non-success|never becomes success)/i,
    );
    expect(CHECK).toMatch(
      /(?:masked failure|failed)[\s\S]*(?:unauthorized|unrequested)[\s\S]*(?:fallback|alternate path)[\s\S]*(?:finding|inconclusive)/i,
    );
    expect(CHECK).toMatch(
      /selected (?:claim|scope)[\s\S]*depends on this boundary[\s\S]*inconclusive[\s\S]*ordinary scoped check/i,
    );
    expect(REVIEW).toMatch(/contract-authorized compatibility|authorized contract continuity/i);
    expect(REVIEW).not.toContain("correctness and compatibility;");
  });

  it("projects the boundary through each capability's persistent spec requirement", () => {
    expect(DOCS).toMatch(
      /clean break[\s\S]*superseded[\s\S]*(?:rather than|not)[\s\S]*(?:both|parallel)/i,
    );

    expect(requirement(SPECS.shape, "只处理实质决策前沿")).toMatch(
      /失败[\s\S]*fallback[\s\S]*authority[\s\S]*clean break/i,
    );
    expect(requirement(SPECS.plan, "plan 保持既定决策、来源与范围")).toMatch(
      /失败[\s\S]*不得擅自增加 fallback[\s\S]*authority[\s\S]*clean break/i,
    );
    expect(requirement(SPECS.implement, "Agent 承接机械决策")).toMatch(
      /fallback[\s\S]*不是机械安全选择[\s\S]*superseded[\s\S]*不得保留双路径/i,
    );
    expect(requirement(SPECS.implement, "完成状态和报告真实")).toMatch(
      /失败[\s\S]*必要状态缺失[\s\S]*exact non-success[\s\S]*不得由 fallback/i,
    );
    expect(requirement(SPECS.check, "verdict 只覆盖实际证据")).toMatch(
      /requested claim[\s\S]*selected scope[\s\S]*普通 scoped check/i,
    );
    expect(requirement(SPECS.docs, "touched range 形成一致文档")).toMatch(
      /clean break[\s\S]*移除 superseded design[\s\S]*authority/i,
    );
  });
});
