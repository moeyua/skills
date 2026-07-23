import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RELEASE = readFileSync(resolve(REPO_ROOT, "skills/release/SKILL.md"), "utf8");
const SPEC = readFileSync(resolve(REPO_ROOT, "specs/release/spec.md"), "utf8");

describe("release boundary", () => {
  it("models single packages and monorepos as release units", () => {
    expect(RELEASE).toContain("release unit");
    expect(RELEASE).toContain("single package");
    expect(RELEASE).toContain("fixed or linked version group");
    expect(RELEASE).toContain("independently versioned package");
    expect(RELEASE).not.toContain("Not for multi-version workspaces");
    expect(SPEC).toContain("release unit、version group 与 tag identity");
  });

  it("keeps project-defined version groups separate from units and tag identities", () => {
    expect(RELEASE).toContain("version group");
    expect(RELEASE).toContain("does not imply one shared current version");
    expect(RELEASE).toContain("affected subset");
    expect(RELEASE).toContain("one unit or an aggregate");
    expect(SPEC).toContain("linked 组成员可保留不同当前版本");
  });

  it("resolves repository-owned release topology without guessing", () => {
    expect(RELEASE).toContain("release topology");
    expect(RELEASE).toContain("workspace manifests");
    expect(RELEASE).toContain("release-tool configuration");
    expect(RELEASE).toContain("tag template");
    expect(RELEASE).toContain("dependency propagation");
    expect(RELEASE).toContain("stop without mutation");
    expect(SPEC).toContain("项目发布拓扑");
  });

  it("recommends and confirms one exact release set", () => {
    expect(RELEASE).toContain("release set");
    expect(RELEASE).toContain(
      "one or more exact unit target versions plus one or more tag identities",
    );
    expect(RELEASE).toContain("latest Release identity for every tag identity");
    expect(RELEASE).toContain("confirm the whole set");
    expect(RELEASE).toContain("Only that later user confirmation unlocks release mutation");
    expect(SPEC).toContain("候选 release set");
  });

  it("uses one version transaction and release commit for the confirmed set", () => {
    expect(RELEASE).toContain("one verified non-tagging version transaction");
    expect(RELEASE).toContain("non-committing");
    expect(RELEASE).toContain("must not stage files");
    expect(RELEASE).toContain("HEAD, index, and refs remain unchanged");
    expect(RELEASE).toContain("changes every confirmed changed unit");
    expect(RELEASE).toContain("preserves every policy-declared unchanged unit");
    expect(RELEASE).toContain("chore(release): <release-set-label>");
    expect(SPEC).toContain("单次版本事务与 release commit");
    expect(SPEC).toContain("不得自行 stage、commit 或改变 git refs");
  });

  it("publishes and recovers every tag and GitHub Release independently", () => {
    expect(RELEASE).toContain("For each release identity");
    expect(RELEASE).toContain("--notes-start-tag <identity-baseline-tag>");
    expect(RELEASE).toContain("Record each tag and Release independently");
    expect(RELEASE).toContain("resume only the missing identities");
    expect(RELEASE).toContain("<identity>: <tag> → <covered units> @ <commit>");
    expect(SPEC).toContain("逐 release identity 幂等恢复");
  });

  it("validates the shared release commit before any completed-set return", () => {
    expect(RELEASE).toContain("Before returning any fully or partially existing set");
    expect(RELEASE).toContain("all existing identities point to the same verified release commit");
    expect(SPEC).toContain("完整或部分既有 set");
  });

  it("executes directly when the user supplies an exact tag", () => {
    expect(RELEASE).toContain("user supplied an exact tag in the current request");
    expect(RELEASE).toContain("treat it as the confirmed release identity");
    expect(SPEC).toContain("用户显式 tag 可直接执行");
  });

  it("requires confirmation when supplied tags expand the release set", () => {
    expect(RELEASE).toContain(
      "When supplied tags require extra derived unit targets or identities",
    );
    expect(RELEASE).toContain("show the expanded exact release set");
    expect(RELEASE).toContain(
      "A propagated unit without its own tag is still an expansion and requires next-turn confirmation",
    );
    expect(RELEASE).toContain(
      "explicit approval of one tag does not silently authorize additional package releases",
    );
    expect(RELEASE).toContain("End the current turn after that final response");
    expect(SPEC).toContain("派生额外 unit target/identity");
    expect(SPEC).toContain("额外 unit 即使按策略没有自己的 tag 也属于扩展");
  });

  it("re-resolves an explicit tag set from the fetched default tip", () => {
    expect(RELEASE).toContain(
      "For every path, record the remote default-branch tip whose committed tree supplied the initial topology",
    );
    expect(RELEASE).toContain(
      "Immediately after fetch, re-resolve the topology, policy, unit versions, identity baselines, and release set from the fetched commit",
    );
    expect(RELEASE).toContain(
      "the candidate-basis equality gate does not apply, but post-fetch re-resolution does",
    );
    expect(RELEASE).toContain(
      "the supplied tags' declared mappings still determine the same exact unit targets and identities",
    );
    expect(RELEASE).toContain("If the refreshed mapping changes or expands the set");
    expect(SPEC).toContain("所有路径都必须记录初次解析");
    expect(SPEC).toContain("fetch 后从 fetched commit 重新解析");
  });

  it("rejects explicit-tag downgrades and version reuse across units", () => {
    expect(RELEASE).toContain(
      "An explicit tag chooses an exact target; it does not waive version validity",
    );
    expect(RELEASE).toContain("every changed unit target must be an allowed forward successor");
    expect(RELEASE).toContain(
      "each changed unit target must be strictly greater than both its current version and latest released unit version",
    );
    expect(RELEASE).toContain(
      "An unapproved equal target, lower target, or reused new identity version stops without mutation",
    );
    expect(SPEC).toContain("每个 unit target");
    expect(SPEC).toContain("合法 forward successor");
    expect(SPEC).toContain("降级 target 或新 identity version 复用必须零 mutation 停止");
  });

  it("allows policy-declared unchanged members in an aggregate identity", () => {
    expect(RELEASE).toContain("identity's version/sequence");
    expect(RELEASE).toContain(
      "A covered member may equal its current version only when the authoritative project policy explicitly marks that unit unchanged",
    );
    expect(RELEASE).toContain("this does not count as identity-version reuse");
    expect(RELEASE).toContain(
      "generic fallback must not invent aggregate or unchanged-member semantics",
    );
    expect(RELEASE).toContain("preserve every policy-declared unchanged unit");
    expect(SPEC).toContain("aggregate identity 覆盖的 member");
    expect(SPEC).toContain("明确标记 unchanged 时才可等于 current version");
  });

  it("recommends one SemVer candidate when the user omits the tag", () => {
    expect(RELEASE).toContain("When the user did not provide a tag");
    expect(RELEASE).toContain("one candidate tag with SemVer for each resulting tag identity");
    expect(RELEASE).toContain("changes since the latest release");
    expect(RELEASE).toContain("Put the candidate in the final response");
    expect(RELEASE).not.toContain("Never derive the next version");
  });

  it("prefers the project's authoritative version policy over generic SemVer", () => {
    expect(RELEASE).toContain(
      "resolve the authoritative project version policy applicable to every unit",
    );
    expect(RELEASE).toContain(
      "repository instructions, versioning or release documentation, and committed release-tool configuration",
    );
    expect(RELEASE).toContain("takes precedence over the generic SemVer mapping");
    expect(RELEASE).toContain("Only when no applicable authoritative project policy exists");
    expect(RELEASE).toContain(
      "Do not infer release topology, dependency propagation, or version policy only from historical tag increments or commit-message patterns",
    );
    expect(RELEASE).toContain(
      "If applicable sources conflict, a package maps to multiple units, a tool hides the expected diff, or the topology cannot produce an exact set",
    );
    expect(RELEASE).toContain("report the sources and stop without mutation");
    expect(RELEASE).toContain("Version policy: <project sources | generic SemVer fallback>");
    expect(SPEC).toContain("项目权威版本策略优先于通用 SemVer");
  });

  it("ends the recommendation turn before any release mutation", () => {
    expect(RELEASE).toContain("End the current turn after that final response");
    expect(RELEASE).toContain("Do not switch branches, change a version, commit, push, tag");
    expect(RELEASE).toContain("in the recommendation turn");
  });

  it("continues only after the next user message confirms the candidate", () => {
    expect(RELEASE).toContain("next user message unambiguously confirms that candidate");
    expect(RELEASE).toContain("does not need to repeat the tags");
    expect(RELEASE).toContain("Only that later user confirmation unlocks release mutation");
    expect(SPEC).toContain("候选 release set 跨轮确认后才允许 mutation");
  });

  it("revalidates the candidate basis after cross-turn confirmation", () => {
    expect(RELEASE).toContain(
      "record the remote default-branch tip, latest Release identity for every tag identity",
    );
    expect(RELEASE).toContain("On a cross-turn candidate path");
    expect(RELEASE).toContain("A post-fetch basis mismatch invalidates the confirmation");
    expect(RELEASE).toContain("recompute from the refreshed default branch");
    expect(RELEASE).toContain(
      "return the refreshed candidate in the final response, and end the turn",
    );
    expect(SPEC).toContain("任一变化都必须使旧确认失效");
  });

  it("matches the fetched default tip to the confirmed basis before mutation", () => {
    expect(RELEASE).toContain(
      "Fetch that exact branch before switching branches or changing versions",
    );
    expect(RELEASE).toContain(
      "require the fetched remote tip to equal the recorded candidate-basis tip exactly",
    );
    expect(RELEASE).toContain("A post-fetch basis mismatch invalidates the confirmation");
    expect(SPEC).toContain("跨轮候选路径还要求 fetched tip 与记录 tip 精确相等");
  });

  it("switches to and fast-forwards the remote default branch", () => {
    expect(RELEASE).toContain("git switch <default-branch>");
    expect(RELEASE).toContain("git merge --ff-only origin/<default-branch>");
    expect(RELEASE).toContain("A dirty tree or diverged default branch stops before mutation");
  });

  it("creates and pushes a package-version release commit before the tag", () => {
    expect(RELEASE).toContain("pnpm version <version> --no-git-tag-version");
    expect(RELEASE).toContain('git commit -m "chore(release): <tag>"');
    expect(RELEASE).toContain("git push origin <default-branch>:<default-branch>");
    expect(RELEASE).toContain(
      "Never create the tag until the remote default branch contains `<release-commit>`",
    );
    expect(RELEASE).toContain("git push origin refs/tags/<tag>");
    expect(RELEASE).toContain("gh release create <tag> --verify-tag --generate-notes");
  });

  it("uses generated notes and retains the bounded release exclusions", () => {
    expect(RELEASE).toContain("GitHub-generated notes are the release notes");
    expect(RELEASE).toContain(
      "no deployment, rollback, changelog, artifact upload, registry publish, or automatic PR",
    );
    expect(RELEASE).not.toContain("Never edit a version file");
  });

  it("reports partial state without destructive rollback", () => {
    expect(RELEASE).toContain("keep and report local commit/status");
    expect(RELEASE).toContain("do not create tags");
    expect(RELEASE).toContain("do not delete the tag");
    expect(RELEASE).toContain("report the exact completed identity and error");
  });

  it("recovers one validated local release commit after a branch push failure", () => {
    expect(RELEASE).toContain("one validated local release commit ahead");
    expect(RELEASE).toContain("its parent is the fetched remote default tip");
    expect(RELEASE).toContain("retry only the default-branch push");
  });

  it("validates the committed release tree before push and on every commit reuse path", () => {
    expect(RELEASE).toContain("release-commit predicate");
    expect(RELEASE).toContain("After `git commit`, validate `HEAD`");
    expect(RELEASE).toContain("semantic diff against its parent changes only");
    expect(RELEASE).toContain("tree/index to be clean");
    expect(RELEASE).toContain("every fresh commit, local-ahead recovery, and remote commit reuse");
  });

  it("recovers one validated version diff after a commit failure", () => {
    expect(RELEASE).toContain("one validated version diff");
    expect(RELEASE).toContain("local `HEAD` equals the fetched remote tip");
    expect(RELEASE).toContain("resume at complete/staged-diff verification");
  });

  it("is idempotent across release commit, tag, and Release state", () => {
    expect(RELEASE).toContain("do not repeat the version transaction or commit");
    expect(RELEASE).toContain("Reuse matching tags");
    expect(RELEASE).toContain("retain its URL/state");
  });
});
