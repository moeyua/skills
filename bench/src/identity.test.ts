import { describe, expect, it } from "vite-plus/test";
import { parseExecutionIdentity, unknownExecution } from "./identity.ts";

const exploreSource = {
  root: "/source/explore",
  installedPath: "/fixture/.agents/skills/explore",
  hash: "explore-source",
  installedHash: "explore-source",
};

describe("Explore execution metadata", () => {
  it("records an unknown dependency explicitly without inventing evidence", () => {
    const unknown = unknownExecution();
    expect(unknown.explore).toBeNull();
    expect(parseExecutionIdentity(unknown)).toEqual(unknown);
  });

  it.each([null, "T1 exec explore: entry content matched"])(
    "preserves a valid Explore snapshot with load evidence %s",
    (loadEvidence) => {
      const identity = {
        ...unknownExecution(),
        explore: { source: exploreSource, loadEvidence },
      };
      expect(parseExecutionIdentity(identity)).toEqual(identity);
    },
  );

  it("rejects omitted Explore metadata without upgrading the caller's historical identity", () => {
    const historical: Record<string, unknown> = { ...unknownExecution() };
    delete historical.explore;
    expect(() => parseExecutionIdentity(historical)).toThrow(/explore/);
    expect(historical).not.toHaveProperty("explore");
  });

  it.each([
    "loaded",
    [],
    {},
    { source: null, loadEvidence: null },
    { source: exploreSource },
    { source: exploreSource, loadEvidence: 1 },
    { source: exploreSource, loadEvidence: {} },
    { source: {}, loadEvidence: null },
  ])("rejects malformed Explore metadata %#", (explore) => {
    expect(() => parseExecutionIdentity({ ...unknownExecution(), explore })).toThrow(/explore/);
  });

  it.each(["root", "installedPath", "hash", "installedHash"])(
    "requires a nonempty Explore source %s",
    (field) => {
      for (const value of [undefined, null, "", 1]) {
        expect(() =>
          parseExecutionIdentity({
            ...unknownExecution(),
            explore: { source: { ...exploreSource, [field]: value }, loadEvidence: null },
          }),
        ).toThrow(/explore\.source/);
      }
    },
  );
});
