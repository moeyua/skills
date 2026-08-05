import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string): string {
  return readFileSync(resolve(REPO_ROOT, path), "utf8");
}

const ENTRY = read("skills/release/SKILL.md");
const MODEL = read("skills/release/references/model.md");
const EXECUTION = read("skills/release/references/execution.md");
const RECOVERY = read("skills/release/references/recovery.md");
const SPEC = read("specs/release/spec.md");

const requirementNames = [...SPEC.matchAll(/^### Requirement: (.+)$/gm)].map((match) => match[1]!);

describe("release progressive interface", () => {
  it("keeps the main entry as a router to model, execution, and recovery", () => {
    expect(ENTRY).toContain("references/model.md");
    expect(ENTRY).toContain("references/execution.md");
    expect(ENTRY).toContain("references/recovery.md");
  });

  it("models single-package and monorepo release state without guessing", () => {
    for (const term of [
      "release unit",
      "version group",
      "tag identity",
      "release set",
      "release topology",
      "dependency propagation",
    ]) {
      expect(MODEL).toContain(term);
    }
    expect(MODEL).toMatch(/fixed or linked/);
    expect(MODEL).toMatch(/stop without mutation/);
    expect(requirementNames).toContain("项目发布拓扑必须唯一可核验");
  });

  it("keeps explicit-tag execution bounded and expanded sets confirmable", () => {
    expect(ENTRY).toMatch(/supplied exact tag[\s\S]*current turn/i);
    expect(ENTRY).toMatch(/derived or expanded[\s\S]*next user message/i);
    expect(MODEL).toMatch(/propagated unit without its own tag[\s\S]*confirmation/i);
    expect(requirementNames).toContain("用户显式 tag 可直接执行");
    expect(requirementNames).toContain("候选 release set 跨轮确认后才允许 mutation");
  });

  it("prefers repository policy and validates forward successors", () => {
    expect(MODEL).toMatch(/policy[\s\S]*takes precedence over the generic SemVer mapping/i);
    expect(MODEL).toContain(
      "strictly greater than both its current version and latest released unit version",
    );
    expect(MODEL).toContain("policy explicitly marks that unit unchanged");
    expect(requirementNames).toContain("项目权威版本策略优先于通用 SemVer");
  });

  it("records and revalidates the exact candidate basis", () => {
    expect(MODEL).toContain("Confirmation: awaiting confirmation of the whole set");
    expect(MODEL).toContain("Mutation: none");
    expect(MODEL).toMatch(/fetched remote tip[\s\S]*recorded candidate-basis tip exactly/i);
    expect(MODEL).toContain("post-fetch basis mismatch invalidates the confirmation");
  });

  it("uses one side-effect-free version transaction and one verified commit", () => {
    expect(EXECUTION).toContain("origin GitHub remote");
    expect(EXECUTION).toContain("working GitHub CLI authentication");
    expect(EXECUTION).toContain("clean tree");
    expect(EXECUTION).toContain("git merge --ff-only origin/<default-branch>");
    expect(EXECUTION).toContain("same verified release commit");
    expect(EXECUTION).toContain("one verified non-tagging version transaction");
    expect(EXECUTION).toContain("non-committing and non-publishing");
    expect(EXECUTION).toContain("must not stage files");
    expect(EXECUTION).toContain("HEAD, index, and refs remain unchanged");
    expect(EXECUTION).toContain('git commit -m "chore(release): <release-set-label>"');
    expect(EXECUTION).toMatch(/multiple identities[\s\S]*stable unit order[\s\S]*exact tags/i);
    expect(EXECUTION).toContain("release-commit predicate");
    expect(requirementNames).toContain("单次版本事务与 release commit");
  });

  it("publishes each exact tag and GitHub Release only after branch verification", () => {
    expect(EXECUTION).toContain("Never create the tag until the remote default branch contains");
    expect(EXECUTION).toContain("git push origin refs/tags/<tag>");
    expect(EXECUTION).toContain("--verify-tag --generate-notes");
    expect(EXECUTION).toContain("--notes-start-tag <identity-baseline-tag>");
    expect(requirementNames).toContain("创建并逐 identity 精确推送 tag");
    expect(requirementNames).toContain("逐 release identity 幂等恢复");
  });

  it("recovers canonical partial state without destructive rollback", () => {
    expect(RECOVERY).toContain("One validated version diff");
    expect(RECOVERY).toContain("One validated local release commit ahead");
    expect(RECOVERY).toContain("do not repeat the version transaction or commit");
    expect(RECOVERY).toContain("do not delete the tag");
    expect(RECOVERY).toContain("There is no destructive rollback");
    expect(requirementNames).toContain("既有发布状态与失败恢复共享同一 predicate");
  });

  it("retains the bounded release exclusions", () => {
    expect(ENTRY).toMatch(/Never[\s\S]*deploy[\s\S]*registry package/i);
    expect(RECOVERY).toContain(
      "no deployment, rollback, changelog, artifact upload, registry publish, or automatic PR",
    );
    expect(requirementNames).toContain("通用发布仍排除部署与制品");
  });
});
