import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string): string {
  return readFileSync(resolve(REPO_ROOT, path), "utf8");
}

const ENTRY = read("skills/engineering/release/SKILL.md");
const MODEL = read("skills/engineering/release/references/model.md");
const EXECUTION = read("skills/engineering/release/references/execution.md");
const RECOVERY = read("skills/engineering/release/references/recovery.md");
const SPEC = read("specs/release/spec.md");
const PRODUCT = read("PRODUCT.md");
const ARCHITECTURE = read("ARCHITECTURE.md");

const requirementNames = [...SPEC.matchAll(/^### Requirement: (.+)$/gm)].map((match) => match[1]!);

describe("release progressive interface", () => {
  it("keeps the main entry as a router to model, execution, and recovery", () => {
    expect(ENTRY).toContain("references/model.md");
    expect(ENTRY).toContain("references/execution.md");
    expect(ENTRY).toContain("references/recovery.md");
  });

  it("stays provider-neutral and leaves CI wiring to the recorded provider", () => {
    const names = ["project-policy", "onboarding", "ci-connection", "deployment-evidence"];
    const sources = [
      ENTRY,
      SPEC,
      ...names.map((name) => read(`skills/engineering/release/references/${name}.md`)),
    ];
    for (const source of sources) {
      expect(source).not.toMatch(
        /MediaStorm|storminfra|ci-v2|internal-deploy|TENCENT_SECRET|deploy-cos|deploy-docker|upload-miniapp|\bCOS\b|mini-program|小程序|AppID/i,
      );
    }
    expect(
      existsSync(resolve(REPO_ROOT, "skills/engineering/release/references/ci-contract.md")),
    ).toBe(false);
    const CONNECTION = read("skills/engineering/release/references/ci-connection.md");
    const POLICY = read("skills/engineering/release/references/project-policy.md");
    const EVIDENCE = read("skills/engineering/release/references/deployment-evidence.md");
    expect(CONNECTION).toMatch(/tag run[s]? (does|do) not rerun quality checks or tests/i);
    expect(CONNECTION).toMatch(/provider[\s\S]*published ref/i);
    expect(CONNECTION).toMatch(/known limitation/i);
    for (const gate of ["prefix", "reachab", "metadata", "validated version"]) {
      expect(CONNECTION).toContain(gate);
    }
    expect(POLICY).toMatch(/CI provider/i);
    expect(POLICY).toMatch(/light post-deploy confirmation/i);
    expect(EVIDENCE).toMatch(/no test step[\s\S]*expected/i);
    expect(EVIDENCE).toMatch(/light post-deploy confirmation/i);
    expect(requirementNames).toContain("事件检查分工");
  });

  it("ships project rules and onboarding knowledge without an external skill dependency", () => {
    for (const name of ["project-policy", "onboarding", "ci-connection", "deployment-evidence"]) {
      const path = `skills/engineering/release/references/${name}.md`;
      expect(existsSync(resolve(REPO_ROOT, path)), path).toBe(true);
      const reference = read(path);
      expect(reference).not.toMatch(/\.agents\/skills|\.claude\/skills|onboard-ci\/SKILL\.md/);
      expect(ENTRY).toContain(`references/${name}.md`);
    }
    expect(SPEC).toContain("### Requirement: 项目规则与首次接入");
    expect(SPEC).toContain("### Requirement: 版本提交检查与部署证据");
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

  it("follows SemVer stages for generic version selection", () => {
    const POLICY = read("skills/engineering/release/references/project-policy.md");
    expect(MODEL).not.toContain("breaking behavior or side effect → major");
    expect(MODEL).toMatch(/0\.y\.z[\s\S]*breaking[^\n]*→ minor[\s\S]*→ patch/);
    expect(MODEL).toMatch(/`1\.0\.0`[^\n]*only[^\n]*user (explicitly )?(declares|supplies)/i);
    expect(MODEL).toMatch(/major only[^\n]*declared public API/i);
    expect(MODEL).toMatch(/public API is undeclared[^\n]*(never|no) major[^\n]*minor or patch/i);
    expect(MODEL).toMatch(/patch[^\n]*only[^\n]*bug fixes/i);
    expect(MODEL).toMatch(/prerelease[^\n]*only when the project policy allows/i);
    expect(MODEL).toMatch(/Version stage:/);
    expect(MODEL).toMatch(/Public API source:/);
    expect(EXECUTION).not.toContain(
      "only when explicitly requested or required by authoritative policy",
    );
    expect(POLICY).toMatch(/version stage[\s\S]*public API[\s\S]*prerelease/i);
    expect(requirementNames).toContain("通用 SemVer 区分 0.x、公开 API 与预发布");
    expect(SPEC).not.toContain("breaking behavior/side effect 为 major");
    expect(SPEC).not.toContain("prerelease 只来自用户显式要求或权威项目策略");
  });

  it("records and revalidates the exact candidate basis", () => {
    expect(MODEL).toContain("Confirmation: awaiting confirmation of the whole set");
    expect(MODEL).toContain("Mutation: none");
    expect(MODEL).toMatch(/fetched remote tip[\s\S]*recorded candidate-basis tip exactly/i);
    expect(MODEL).toContain("post-fetch basis mismatch invalidates the confirmation");
  });

  it("owns optional version-bound repository metadata without imposing one format", () => {
    expect(MODEL).toContain("version-bound repository release metadata");
    expect(MODEL).toMatch(/instructions[\s\S]*specifications[\s\S]*code[\s\S]*tests/i);
    expect(MODEL).toMatch(/fixed filename[\s\S]*schema/i);
    expect(MODEL).toMatch(/substantive user-visible content[\s\S]*confirmation/i);
    expect(EXECUTION).toContain("release metadata transaction");
    for (const result of [
      "unit target version",
      "dependency propagation",
      "version-bound repository release metadata",
    ]) {
      expect(EXECUTION).toContain(result);
    }
    expect(EXECUTION).toMatch(
      /no version-bound repository release metadata[\s\S]*must not create/i,
    );
    expect(RECOVERY).toContain("repository release metadata <state>");
    expect(SPEC).toContain("版本绑定仓库发布元数据");
    expect(PRODUCT).toContain("version-bound repository release metadata");
    expect(ARCHITECTURE).toContain("version-bound repository release metadata");
    expect(EXECUTION).not.toContain("Do not create notes files");
    expect(SPEC).not.toContain("不生成 repo changelog/release-note 文件");
  });

  it("uses one side-effect-free release metadata transaction and one verified commit", () => {
    expect(EXECUTION).toContain("origin GitHub remote");
    expect(EXECUTION).toContain("working GitHub CLI authentication");
    expect(EXECUTION).toContain("clean tree");
    expect(EXECUTION).toContain("git merge --ff-only origin/<default-branch>");
    expect(EXECUTION).toContain("same verified release commit");
    expect(EXECUTION).toContain("one verified non-tagging release metadata transaction");
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
    expect(RECOVERY).toContain("One validated release metadata diff");
    expect(RECOVERY).toContain("One validated local release commit ahead");
    expect(RECOVERY).toContain("do not repeat the release metadata transaction or commit");
    expect(RECOVERY).toContain("do not delete the tag");
    expect(RECOVERY).toContain("There is no destructive rollback");
    expect(requirementNames).toContain("既有发布状态与失败恢复共享同一 predicate");
  });

  it("retains the bounded release exclusions", () => {
    expect(ENTRY).toMatch(/Never[\s\S]*deploy[\s\S]*registry package/i);
    expect(RECOVERY).toMatch(/no rollback[\s\S]*registry publish[\s\S]*automatic PR/i);
    expect(requirementNames).toContain("发布接入与执行职责边界");
  });
});
