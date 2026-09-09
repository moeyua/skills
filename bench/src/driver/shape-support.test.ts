/** Tests for the Shape driver's required Explore support. */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect } from "vite-plus/test";
import { driverIdentity, installSkillSnapshot, observeSkillLoad } from "./common.ts";
import { inspectFixtureWorktree, prepareFixture } from "./fixture.ts";
import { unknownExecution, type ExecutionIdentity } from "../identity.ts";
import type { NormalizedTranscript, SkillInjectionEvent } from "../normalize/events.ts";

function snapshotProject() {
  const source = mkdtempSync(join(tmpdir(), "bench-composed-skills-"));
  const skillsRoot = join(source, "skills");
  for (const skill of ["shape", "explore"]) {
    mkdirSync(join(skillsRoot, skill, "references"), { recursive: true });
    writeFileSync(join(skillsRoot, skill, "SKILL.md"), `# ${skill} current entry\n`);
    writeFileSync(join(skillsRoot, skill, "references/context.md"), `${skill} context\n`);
  }
  const fixture = join(source, "fixture");
  mkdirSync(fixture);
  writeFileSync(join(fixture, "README.md"), "fixture\n");
  const workDir = prepareFixture(fixture, "composed-skills");
  return {
    source,
    skillsRoot,
    fixture,
    workDir,
    dispose() {
      rmSync(source, { recursive: true, force: true });
      rmSync(workDir, { recursive: true, force: true });
    },
  };
}

function driverCard() {
  return {
    id: "required-explore",
    title: "required explore",
    kind: "feat" as const,
    fixture: ".",
    initialIntent: "shape this project",
    intentCard: "inspect before deciding",
    answerPolicy: "test",
    path: "test.md",
  };
}

function installedIdentity(project: ReturnType<typeof snapshotProject>): ExecutionIdentity {
  return {
    ...unknownExecution(),
    source: installSkillSnapshot(project.workDir, "codex", "shape", project.skillsRoot),
    explore: {
      source: installSkillSnapshot(project.workDir, "codex", "explore", project.skillsRoot),
      loadEvidence: null,
    },
  };
}

function injectedTranscript(identity: ExecutionIdentity): NormalizedTranscript {
  return {
    session: { host: "codex", sessionId: "composed", cwd: "/fixture", model: undefined },
    sourcePath: "/fixture/composed.jsonl",
    turnCount: 1,
    events: [identity.source!, identity.explore!.source].map((source): SkillInjectionEvent => {
      const path = join(source.installedPath, "SKILL.md");
      return {
        kind: "skill-injection",
        name: source === identity.source ? "shape" : "explore",
        path,
        body: readFileSync(path, "utf8"),
        rawText: "host injected skill",
        turn: 0,
        timestamp: undefined,
      };
    }),
  };
}

describe("required Explore snapshots", () => {
  it.each(["codex", "claude"] as const)(
    "installs Shape and Explore from the selected source for %s without dirtying the fixture",
    (host) => {
      const project = snapshotProject();
      try {
        const identity = driverIdentity(project.workDir, host, driverCard(), project.fixture, {
          skillsRoot: project.skillsRoot,
        });
        for (const [skill, source] of [
          ["shape", identity.source],
          ["explore", identity.explore?.source],
        ] as const) {
          expect(source?.root).toBe(join(project.skillsRoot, skill));
          expect(source?.installedPath).toBe(
            join(project.workDir, host === "codex" ? ".agents/skills" : ".claude/skills", skill),
          );
          expect(source?.hash).toBe(source?.installedHash);
          expect(readFileSync(join(source!.installedPath, "references/context.md"), "utf8")).toBe(
            `${skill} context\n`,
          );
        }
        expect(identity.loadEvidence).toBeNull();
        expect(identity.explore?.loadEvidence).toBeNull();
        expect(inspectFixtureWorktree(project.workDir).changes).toEqual([]);
      } finally {
        project.dispose();
      }
    },
  );

  it.each([
    ["codex", "directory"],
    ["codex", "entry"],
    ["claude", "directory"],
    ["claude", "entry"],
  ] as const)("rejects a missing Explore %s/%s before installing Shape", (host, missing) => {
    const project = snapshotProject();
    try {
      rmSync(join(project.skillsRoot, "explore", ...(missing === "entry" ? ["SKILL.md"] : [])), {
        recursive: true,
      });
      expect(() =>
        driverIdentity(project.workDir, host, driverCard(), project.fixture, {
          skillsRoot: project.skillsRoot,
        }),
      ).toThrow();
      const installRoot = join(
        project.workDir,
        host === "codex" ? ".agents/skills" : ".claude/skills",
      );
      expect(existsSync(join(installRoot, "shape"))).toBe(false);
      expect(existsSync(join(installRoot, "explore"))).toBe(false);
      expect(inspectFixtureWorktree(project.workDir).changes).toEqual([]);
    } finally {
      project.dispose();
    }
  });
});

describe("independent Shape and Explore load evidence", () => {
  it("requires a correlated Explore result even when Shape has already loaded", () => {
    const project = snapshotProject();
    try {
      const identity = installedIdentity(project);
      const transcript = injectedTranscript(identity);
      transcript.events.pop();
      const path = join(identity.explore!.source.installedPath, "SKILL.md");
      transcript.events.push(
        {
          kind: "tool-call",
          name: "exec",
          callId: "explore",
          input: { cmd: `cat ${path}` },
          turn: 1,
          timestamp: undefined,
        },
        {
          kind: "tool-result",
          callId: "other",
          output: readFileSync(path, "utf8"),
          turn: 1,
          timestamp: undefined,
        },
      );
      let observed = observeSkillLoad(transcript, identity);
      expect(observed.loadEvidence).toContain("Host skill injection");
      expect(observed.explore?.loadEvidence).toBeNull();
      transcript.events.push({
        kind: "tool-result",
        callId: "explore",
        turn: 1,
        timestamp: undefined,
        output: ["Script completed", JSON.stringify({ output: readFileSync(path, "utf8") })].join(
          "\n",
        ),
      });
      observed = observeSkillLoad(transcript, identity);
      expect(observed.loadEvidence).toContain("Host skill injection");
      expect(observed.explore?.loadEvidence).toContain(path);
    } finally {
      project.dispose();
    }
  });

  it.each([
    ["shape", "path"],
    ["shape", "body"],
    ["explore", "path"],
    ["explore", "body"],
  ] as const)(
    "a conflicting %s injection %s invalidates only that skill, including existing evidence",
    (skill, conflict) => {
      const project = snapshotProject();
      try {
        const identity = installedIdentity(project);
        const transcript = injectedTranscript(identity);
        const previouslyObserved = observeSkillLoad(transcript, identity);
        expect(previouslyObserved.loadEvidence).toContain("Host skill injection");
        expect(previouslyObserved.explore?.loadEvidence).toContain("Host skill injection");
        const original = transcript.events.find(
          (event): event is SkillInjectionEvent =>
            event.kind === "skill-injection" && event.name === skill,
        )!;
        transcript.events.push({
          ...original,
          ...(conflict === "path"
            ? { path: `/global/skills/${skill}/SKILL.md` }
            : { body: "# Previous version" }),
        });
        const observed = observeSkillLoad(transcript, previouslyObserved);
        expect(
          skill === "shape" ? observed.loadEvidence : observed.explore?.loadEvidence,
        ).toBeNull();
        expect(
          skill === "shape" ? observed.explore?.loadEvidence : observed.loadEvidence,
        ).toContain("Host skill injection");
      } finally {
        project.dispose();
      }
    },
  );

  it("matches unnamed injections by skill path without cross-contaminating the two skills", () => {
    const project = snapshotProject();
    try {
      const identity = installedIdentity(project);
      const transcript = injectedTranscript(identity);
      for (const event of transcript.events) {
        if (event.kind === "skill-injection") event.name = undefined;
      }
      const observed = observeSkillLoad(transcript, identity);
      expect(observed.loadEvidence).toContain("Host skill injection");
      expect(observed.explore?.loadEvidence).toContain("Host skill injection");
      transcript.events.push({
        kind: "skill-injection",
        name: undefined,
        path: "/global/skills/explore/SKILL.md",
        body: "# Global Explore",
        rawText: "global injection",
        turn: 0,
        timestamp: undefined,
      });
      const conflicting = observeSkillLoad(transcript, observed);
      expect(conflicting.loadEvidence).toContain("Host skill injection");
      expect(conflicting.explore?.loadEvidence).toBeNull();
    } finally {
      project.dispose();
    }
  });

  it.each(["shape", "explore"] as const)(
    "a changed installed %s reference invalidates only its evidence",
    (skill) => {
      const project = snapshotProject();
      try {
        const identity = installedIdentity(project);
        const transcript = injectedTranscript(identity);
        const source = skill === "shape" ? identity.source! : identity.explore!.source;
        writeFileSync(
          join(source.installedPath, "references/context.md"),
          "changed after installation\n",
        );
        const observed = observeSkillLoad(transcript, identity);
        expect(
          skill === "shape" ? observed.loadEvidence : observed.explore?.loadEvidence,
        ).toBeNull();
        expect(
          skill === "shape" ? observed.explore?.loadEvidence : observed.loadEvidence,
        ).toContain("Host skill injection");
      } finally {
        project.dispose();
      }
    },
  );
});
