/**
 * Smoke test: runs every check from scripts/checks.ts against the live squire
 * repo. Replaces the deleted CLI entrypoint scripts/verify-skills.ts.
 *
 * As scripts/checks.ts grows new check functions, add a new it() block here.
 * That keeps the live verifier a single, append-only ledger of invariants.
 */

import { describe, it, expect } from "vite-plus/test";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkSkillFiles,
  checkDescriptionConformance,
  checkOutcomeContract,
  checkReferencesExist,
  checkMarkdownLinks,
  checkNoRootSkill,
  checkTriggerJaccard,
  checkResolverConsistency,
  checkSpecFormat,
} from "../../scripts/checks.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("repo skill verifier (smoke)", () => {
  // Parse once and reuse — every check below operates on the same snapshot.
  const skills = checkSkillFiles(REPO_ROOT);

  it("checkSkillFiles: name <-> dir match, frontmatter parses", () => {
    expect(skills.size).toBeGreaterThanOrEqual(7);
  });

  it("checkDescriptionConformance: every description has Use when / Not for, 40-500 chars", () => {
    expect(() => checkDescriptionConformance(skills)).not.toThrow();
  });

  it("checkOutcomeContract: every SKILL.md has the 4 Outcome Contract fields", () => {
    expect(() => checkOutcomeContract(REPO_ROOT)).not.toThrow();
  });

  it("checkReferencesExist: every references/X.md mentioned in a SKILL.md exists", () => {
    expect(() => checkReferencesExist(REPO_ROOT)).not.toThrow();
  });

  it("checkMarkdownLinks: every relative markdown link resolves", () => {
    expect(() => checkMarkdownLinks(REPO_ROOT)).not.toThrow();
  });

  it("checkNoRootSkill: no root SKILL.md (would break nested discovery)", () => {
    expect(() => checkNoRootSkill(REPO_ROOT)).not.toThrow();
  });

  it("checkTriggerJaccard: no two skills share more than half their when_to_use keywords", () => {
    expect(() => checkTriggerJaccard(skills)).not.toThrow();
  });

  it("checkResolverConsistency: RESOLVER.md lists exactly the skills under skills/", () => {
    expect(() => checkResolverConsistency(REPO_ROOT, skills)).not.toThrow();
  });

  it("checkSpecFormat: every specs/*/spec.md is structurally valid with a legal Verify per requirement", () => {
    expect(() => checkSpecFormat(REPO_ROOT)).not.toThrow();
  });
});
