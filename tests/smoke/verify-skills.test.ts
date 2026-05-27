/**
 * Smoke test: invokes the same verification logic that used to live in
 * `scripts/verify-skills.ts` (CLI). Keeping it as a vitest test gives us a
 * single entrypoint (`vp test run`) and unified assertions.
 *
 * As `scripts/checks.ts` grows new check functions, add them here too — this
 * file is the authoritative "everything is consistent" gate for the repo.
 */

import { describe, it, expect } from "vite-plus/test";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSkillFiles } from "../../scripts/checks.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("repo skill verifier (smoke)", () => {
  it("all skills pass schema checks", () => {
    expect(() => checkSkillFiles(REPO_ROOT)).not.toThrow();
  });

  // Add future checks here as scripts/checks.ts grows. Examples:
  //   it("description conformance: Use when / Not for, 40-500 chars", () => ...)
  //   it("trigger keyword Jaccard < 0.5 across skills", () => ...)
  //   it("RESOLVER.md lists every skill", () => ...)
});
