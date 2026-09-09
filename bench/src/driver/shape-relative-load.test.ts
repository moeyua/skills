/** Relative tool reads must identify the installed entry using observed working-directory facts. */

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { hashTree, unknownExecution, type ExecutionIdentity } from "../identity.ts";
import type { NormalizedTranscript } from "../normalize/events.ts";
import { observeSkillLoad } from "./common.ts";

const relativeEntry = ".agents/skills/explore/SKILL.md";
const command = `cat ${relativeEntry}`;
let projectDir: string;
let identity: ExecutionIdentity;

beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), "bench-relative-load-"));
  const installedPath = join(projectDir, ".agents/skills/explore");
  mkdirSync(join(installedPath, "references"), { recursive: true });
  writeFileSync(
    join(installedPath, "SKILL.md"),
    "# Explore installed entry\nRead the current project.\n",
  );
  writeFileSync(join(installedPath, "references/context.md"), "Overview evidence requirements\n");
  const hash = hashTree(installedPath);
  identity = {
    ...unknownExecution(),
    explore: {
      source: { root: installedPath, installedPath, hash, installedHash: hash },
      loadEvidence: null,
    },
  };
});

afterEach(() => rmSync(projectDir, { recursive: true, force: true }));

function batch(cmd: string, extra = ""): string {
  return `text(await tools.exec_command({cmd:${JSON.stringify(cmd)},max_output_tokens:7000${extra}}));\ntext(await tools.exec_command({cmd:"rg --files",max_output_tokens:4000}));`;
}

function transcript(name: string, input: unknown): NormalizedTranscript {
  return {
    session: { host: "codex", sessionId: "relative", cwd: projectDir, model: undefined },
    sourcePath: "/fixture/rollout.jsonl",
    turnCount: 1,
    events: [
      { kind: "tool-call", name, callId: "read", input, turn: 1, timestamp: undefined },
      {
        kind: "tool-result",
        callId: "read",
        turn: 1,
        timestamp: undefined,
        output: [
          JSON.stringify({ output: readFileSync(join(projectDir, relativeEntry), "utf8") }),
          JSON.stringify({ output: "README.md\nsrc/index.ts\n" }),
        ].join("\n"),
      },
    ],
  };
}

describe("relative Explore entry reads", () => {
  it.each(["direct", "batch", "parallel", "single-quoted", "double-quoted"])(
    "recognizes a %s relative read using the observed session cwd",
    (kind) => {
      const quoted =
        kind === "single-quoted" ? `cat -- '${relativeEntry}'` : `cat "${relativeEntry}"`;
      const session =
        kind === "direct"
          ? transcript("exec_command", { cmd: command })
          : transcript(
              "exec",
              kind === "parallel"
                ? `const results = await Promise.allSettled([tools.exec_command({cmd:${JSON.stringify(command)}}), tools.exec_command({cmd:"rg --files"})]);`
                : batch(kind === "batch" ? command : quoted),
            );
      const observed = observeSkillLoad(session, identity);
      expect(observed.explore?.loadEvidence).toContain(join(projectDir, relativeEntry));
      expect(observed.loadEvidence).toBeNull();
    },
  );

  it.each(["exec_command", "exec"])(
    "uses literal %s workdir even when the session cwd is unknown or different",
    (name) => {
      const input =
        name === "exec_command"
          ? { cmd: command, workdir: projectDir }
          : batch(command, `,workdir:${JSON.stringify(projectDir)}`);
      for (const cwd of [undefined, "/different/project"]) {
        const session = transcript(name, input);
        session.session.cwd = cwd;
        expect(observeSkillLoad(session, identity).explore?.loadEvidence).toContain(
          join(projectDir, relativeEntry),
        );
      }
    },
  );

  it.each([undefined, "/different/project"])(
    "does not infer a relative read's cwd from the installed snapshot when cwd is %s",
    (cwd) => {
      const session = transcript("exec", batch(command));
      session.session.cwd = cwd;
      expect(observeSkillLoad(session, identity).explore?.loadEvidence).toBeNull();
    },
  );

  it.each(["exec_command", "exec"])(
    "rejects %s reads from a different explicit workdir",
    (name) => {
      const input =
        name === "exec_command"
          ? { cmd: command, workdir: "/different/project" }
          : batch(command, ',workdir:"/different/project"');
      expect(observeSkillLoad(transcript(name, input), identity).explore?.loadEvidence).toBeNull();
    },
  );

  it.each([
    `cd . && ${command}`,
    `${command} && echo complete`,
    `${command}; echo complete`,
    `${command} | tee output.txt`,
    `cat $PWD/${relativeEntry}`,
    `cat $(pwd)/${relativeEntry}`,
    `cat ~/${relativeEntry}`,
    `cat ${relativeEntry} README.md`,
  ])("does not resolve shell control, expansion, or multi-file reads: %s", (cmd) => {
    expect(
      observeSkillLoad(transcript("exec_command", { cmd }), identity).explore?.loadEvidence,
    ).toBeNull();
  });

  it.each([
    batch(command, ",workdir:currentDirectory"),
    batch(command, ",...options"),
    batch(command, ',["workdir"]:currentDirectory'),
    `const cmd = ${JSON.stringify(command)}; text(await tools.exec_command({cmd}));`,
    `text(await tools.exec_command({cmd:${JSON.stringify(command)} + suffix}));`,
    `text(await tools["exec_command"]({cmd:${JSON.stringify(command)}}));`,
  ])("does not turn dynamic or structurally ambiguous code into load evidence %#", (input) => {
    expect(observeSkillLoad(transcript("exec", input), identity).explore?.loadEvidence).toBeNull();
  });

  it.each([
    ["false branch", `if (false) { ${batch(command)} }`],
    ["uncalled function", `function readLater() { ${batch(command)} }`],
    ["exit", `exit(); ${batch(command)}`],
    ["throw", `throw new Error("stop"); ${batch(command)}`],
    [
      "option initializer",
      `text(await tools.exec_command({cmd:${JSON.stringify(command)},max_output_tokens:exit()}));`,
    ],
    [
      "option array element",
      `text(await tools.exec_command({cmd:${JSON.stringify(command)},prefix_rule:[exit()]}));`,
    ],
    [
      "extra command argument",
      `text(await tools.exec_command({cmd:${JSON.stringify(command)}},exit()));`,
    ],
    [
      "extra Promise.all argument",
      `await Promise.all([tools.exec_command({cmd:${JSON.stringify(command)}})],exit());`,
    ],
    [
      "extra Promise.allSettled argument",
      `await Promise.allSettled([tools.exec_command({cmd:${JSON.stringify(command)}})],exit());`,
    ],
    [
      "extra text argument",
      `text(await tools.exec_command({cmd:${JSON.stringify(command)}}),exit());`,
    ],
    ["uninitialized variable", `let unresolved; ${batch(command)}`],
  ])(
    "does not infer the target read from identical output through unsupported %s code",
    (_case, code) => {
      const input = `text(await tools.exec_command({cmd:"cat /different/project/explore.md"}));\n${code}`;
      expect(
        observeSkillLoad(transcript("exec", input), identity).explore?.loadEvidence,
      ).toBeNull();
    },
  );

  it("retains support for ordinary literal command options", () => {
    const input = batch(command, ',login:false,shell:"/bin/zsh",prefix_rule:["cat"]');
    expect(observeSkillLoad(transcript("exec", input), identity).explore?.loadEvidence).toContain(
      join(projectDir, relativeEntry),
    );
  });

  it("still requires correlated full entry output and an unchanged installed tree", () => {
    const session = transcript("exec", batch(command));
    const result = session.events[1]!;
    if (result.kind !== "tool-result") throw new Error("expected tool result fixture");
    result.callId = "other";
    expect(observeSkillLoad(session, identity).explore?.loadEvidence).toBeNull();
    result.callId = "read";
    result.output = "# Explore installed entry";
    expect(observeSkillLoad(session, identity).explore?.loadEvidence).toBeNull();
    result.output = readFileSync(join(projectDir, relativeEntry), "utf8");
    expect(observeSkillLoad(session, identity).explore?.loadEvidence).toContain(relativeEntry);
    writeFileSync(join(identity.explore!.source.installedPath, "references/context.md"), "changed");
    expect(observeSkillLoad(session, identity).explore?.loadEvidence).toBeNull();
  });
});
