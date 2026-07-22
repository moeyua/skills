import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("project identity", () => {
  it("uses the scoped Skills package name", () => {
    const packageJson = JSON.parse(readFileSync(resolve(REPO_ROOT, "package.json"), "utf-8")) as {
      name?: string;
    };

    expect(packageJson.name).toBe("@moeyua/skills");
  });

  it.each([
    ["README.md", "# Skills"],
    ["README.zh-CN.md", "# Skills"],
    ["PRODUCT.md", "# Skills"],
    ["ARCHITECTURE.md", "# Skills Architecture"],
    ["ROADMAP.md", "# Skills Roadmap"],
    ["skills/RESOLVER.md", "# Skills Resolver"],
  ])("uses the Skills heading in %s", (path, heading) => {
    const firstLine = readFileSync(resolve(REPO_ROOT, path), "utf-8").split("\n", 1)[0];

    expect(firstLine).toBe(heading);
  });
});
