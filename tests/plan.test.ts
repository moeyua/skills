import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FORMATS_PATH = resolve(REPO_ROOT, "skills/plan/references/issue-formats.md");
const TEMPLATE_PATH = resolve(REPO_ROOT, "skills/plan/references/plan-template.md");
const SKILL_PATH = resolve(REPO_ROOT, "skills/plan/SKILL.md");
const TARGET_PATHS = {
  local: resolve(REPO_ROOT, "skills/plan/references/target-local.md"),
  issue: resolve(REPO_ROOT, "skills/plan/references/target-issue.md"),
  both: resolve(REPO_ROOT, "skills/plan/references/target-both.md"),
} as const;

const EXPECTED_CHANGE_TYPES = ["fix", "feat", "refactor", "perf"] as const;

const REQUIRED_SECTIONS = {
  fix: ["background", "problem", "reproduction", "expected", "actual", "scope", "acceptance"],
  feat: ["background", "goal", "user_scenario", "scope", "non_goals", "acceptance"],
  refactor: ["background", "refactor_goal", "behavior_invariants", "scope", "acceptance"],
  perf: [
    "background",
    "performance_problem",
    "metric",
    "baseline",
    "target",
    "measurement",
    "scope",
    "acceptance",
  ],
} as const;

function extractSchema(markdown: string, type: keyof typeof REQUIRED_SECTIONS): string {
  const pattern = "^## `" + type + "`\\n\\n([\\s\\S]*?)(?=\\n## `|(?![\\s\\S]))";
  const match = new RegExp(pattern, "m").exec(markdown);
  expect(match, `missing centralized ${type} schema`).not.toBeNull();
  return match![1]!;
}

interface TransactionRow {
  current: string;
  later: string;
  calls: string[];
  continues: boolean;
}

function extractTransactionTable(markdown: string): Map<string, TransactionRow> {
  const section = /^## Transaction table\n\n[\s\S]*?\n\n(\| event[\s\S]*?)(?=\n## )/m.exec(
    markdown,
  );
  expect(section, "missing transaction table").not.toBeNull();

  const rows = new Map<string, TransactionRow>();
  for (const line of section![1]!.split("\n").slice(2)) {
    if (!line.startsWith("|")) {
      continue;
    }

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim().replaceAll("`", ""));
    const [event, current, later, calls, continues] = cells;
    rows.set(event!, {
      current: current!,
      later: later!,
      calls: calls === "none" ? [] : calls!.split(","),
      continues: continues === "yes",
    });
  }

  return rows;
}

describe("plan artifact contract", () => {
  const skill = readFileSync(SKILL_PATH, "utf8");
  const template = readFileSync(TEMPLATE_PATH, "utf8");

  it("resolves one explicit artifact target before side effects and defaults to both", () => {
    expect(skill).toMatch(/resolve.+artifact target.+before.+side effect/is);
    expect(skill).toMatch(/target.+omitted.+both/is);
    expect(skill).toContain("Never infer, recommend, or switch the target");
    expect(skill).toMatch(/conflicting targets.+stop before side effects/is);
    expect(skill).toMatch(/without a second confirmation or prose-approval gate/i);
    expect(skill).toMatch(/do not fall back.+retry.+different artifact/is);
  });

  it("loads one target-specific contract", () => {
    for (const [target, path] of Object.entries(TARGET_PATHS)) {
      expect(existsSync(path), `missing ${target} target reference`).toBe(true);
      expect(skill).toContain(`references/target-${target}.md`);
    }
  });

  it("records at most one canonical Issue association", () => {
    expect(skill).toContain("at most one GitHub Issue");
    expect(skill).toContain("never search by title");
    expect(template).toContain("issue: <canonical GitHub Issue URL; include only after success>");
    expect(template).toMatch(/local.+both/is);
  });

  it("does not require an earlier shape session", () => {
    expect(skill).toContain("Do not require shape");
  });
});

describe("plan target contracts", () => {
  it("keeps local free of GitHub mutation", () => {
    const local = readFileSync(TARGET_PATHS.local, "utf8");

    expect(local).toMatch(/one coherent change/i);
    expect(local).toMatch(/zero GitHub mutation/i);
    expect(local).toMatch(/existing canonical Issue URL/i);
    expect(local).toMatch(/run `gh auth status.+before any URL or repository lookup/is);
  });

  it("supports a bounded, same-repository Issue batch without project writes", () => {
    const issue = readFileSync(TARGET_PATHS.issue, "utf8");

    expect(issue).toMatch(/1[–-]20/);
    expect(issue).toMatch(/same repository/i);
    expect(issue).toMatch(/zero project writes/i);
    expect(issue).toMatch(
      /more than 20 items.+multiple repositories.+`blocked` before any mutation/is,
    );
    expect(issue).toMatch(/entire batch before the first mutation/is);
    expect(issue).toMatch(
      /explicit `OWNER\/REPOSITORY`.+repository named by all explicitly supplied canonical Issue URLs.+current repository/is,
    );
    expect(issue).toMatch(/Run `gh auth status.+Resolve one canonical repository/is);
    expect(issue).toMatch(/batch marker/i);
    expect(issue).toMatch(/created.+reused.+blocked.+failed.+unknown.+not-attempted/is);
    expect(issue).toMatch(/first.+failure.+stop/is);
  });

  it("defines a complete ledger for preflight and label failures", () => {
    const issue = readFileSync(TARGET_PATHS.issue, "utf8");

    expect(issue).toMatch(
      /item-specific checks fail preflight.+failed a check as `blocked`.+otherwise valid item as `not-attempted`/is,
    );
    expect(issue).toMatch(/batch-global prerequisite.+mark every row `blocked`/is);
    expect(issue).toMatch(
      /label create fails.+attribute `failed` to the first input-order create candidate.+every other create candidate `not-attempted`/is,
    );
    expect(issue).toMatch(/report any labels already created.+stop before creating Issues/is);
    expect(issue).toMatch(
      /`partial` when at least one row is `created` or `reused` and at least one row is not/is,
    );
    expect(issue).toMatch(/report.+labels created by this run.+every termination path/is);
  });

  it("stops permanently after an ambiguous create and reconciles once by marker", () => {
    const issue = readFileSync(TARGET_PATHS.issue, "utf8");

    expect(issue).toMatch(/first ambiguous create result.+stop the batch permanently/is);
    expect(issue).toMatch(/exactly one read-only reconciliation.+exact hidden batch marker/is);
    expect(issue).toMatch(/mark the current item `created`.+otherwise mark it `unknown`/is);
    expect(issue).toMatch(/every later pending item `not-attempted`/is);
    expect(issue).toMatch(/never reconcile by title.+never retry/is);
    expect(issue).toMatch(/never resumes the batch/i);
    expect(issue).not.toMatch(/allow the sequence to continue/i);
  });

  it("keeps both local-first and reports an Issue failure as partial", () => {
    const both = readFileSync(TARGET_PATHS.both, "utf8");

    expect(both).toMatch(/one coherent change/i);
    expect(both).toMatch(/local.+before.+Issue/is);
    expect(both).toMatch(/Issue failure.+partial/is);
    expect(both).toMatch(/canonical URL/i);
    expect(both).toMatch(
      /explicit `OWNER\/REPOSITORY` first.+repository named by an explicitly supplied canonical Issue URL.+current repository/is,
    );
    expect(both).toMatch(/verify.+belongs to the resolved repository/is);
    expect(both).toMatch(/Only after definitive Issue success.+add `issue:/is);
    expect(both).toMatch(/Start the GitHub portion by running `gh auth status/is);
    expect(both).toMatch(/case-only label collision.+partial.+do not create/is);
    expect(both).toMatch(/report.+labels created by this run/is);
  });

  it("locks mock transaction transcripts, ledger completion, and zero project writes", () => {
    const issue = readFileSync(TARGET_PATHS.issue, "utf8");
    const policy = extractTransactionTable(issue);
    const scenarios = [
      {
        name: "canonical reuse from another worktree",
        events: ["canonical-reuse"],
        ledger: ["reused"],
        calls: ["issue-view"],
        overall: "success",
      },
      {
        name: "label failure preserves a later preflight reuse",
        events: ["label-create-failure", "canonical-reuse"],
        ledger: ["failed", "reused"],
        calls: ["issue-view", "label-create"],
        overall: "partial",
      },
      {
        name: "definite failure after one success",
        events: ["create-success", "create-definite-failure", "create-success"],
        ledger: ["created", "failed", "not-attempted"],
        calls: ["issue-create", "issue-create"],
        overall: "partial",
      },
      {
        name: "ambiguous result reconciles once and permanently stops",
        events: ["create-success", "create-ambiguous-one-match", "create-success"],
        ledger: ["created", "created", "not-attempted"],
        calls: ["issue-create", "issue-create", "marker-query-once"],
        overall: "partial",
      },
      {
        name: "ambiguous first result remains unknown",
        events: ["create-ambiguous-not-one", "create-success"],
        ledger: ["unknown", "not-attempted"],
        calls: ["issue-create", "marker-query-once"],
        overall: "failed",
      },
      {
        name: "item preflight failure blocks without mutation",
        events: ["preflight-item-failure", "create-success"],
        ledger: ["blocked", "not-attempted"],
        calls: [],
        overall: "blocked",
      },
      {
        name: "global preflight failure blocks every row",
        events: ["preflight-global-failure", "create-success"],
        ledger: ["blocked", "blocked"],
        calls: [],
        overall: "blocked",
      },
    ] as const;

    for (const scenario of scenarios) {
      const ledger = Array<string>(scenario.events.length).fill("pending");
      const calls: string[] = [];

      for (const [index, event] of scenario.events.entries()) {
        if (event !== "canonical-reuse") {
          continue;
        }

        const transition = policy.get(event);
        expect(transition, `${scenario.name}: missing ${event} transition`).toBeDefined();
        ledger[index] = transition!.current;
        calls.push(...transition!.calls);
      }

      for (const [index, event] of scenario.events.entries()) {
        if (ledger[index] !== "pending") {
          continue;
        }

        const transition = policy.get(event);
        expect(transition, `${scenario.name}: missing ${event} transition`).toBeDefined();
        ledger[index] = transition!.current;
        calls.push(...transition!.calls);

        if (!transition!.continues) {
          for (let later = index + 1; later < ledger.length; later += 1) {
            if (ledger[later] === "pending") {
              ledger[later] = transition!.later;
            }
          }
          break;
        }
      }

      const completed = ledger.filter(
        (status) => status === "created" || status === "reused",
      ).length;
      const mutationStarted = calls.some(
        (call) => call === "label-create" || call === "issue-create",
      );
      const overall = ledger.every((status) => status === "created" || status === "reused")
        ? "success"
        : completed > 0
          ? "partial"
          : !mutationStarted && ledger.some((status) => status === "blocked")
            ? "blocked"
            : "failed";

      expect(ledger, `${scenario.name}: complete ordered ledger`).toEqual(scenario.ledger);
      expect(calls, `${scenario.name}: mock gh call suffix`).toEqual(scenario.calls);
      expect(overall, `${scenario.name}: aggregate state`).toBe(scenario.overall);
      expect(issue, `${scenario.name}: project tree must remain unchanged`).toContain(
        "every row guarantees zero project writes",
      );
    }
  });
});

describe("plan Issue projection contract", () => {
  const skill = readFileSync(SKILL_PATH, "utf8");
  const formats = readFileSync(FORMATS_PATH, "utf8");

  it("keeps label metadata and schemas aligned to the four shared change types", () => {
    const metadata = /^## Label metadata\n\n([\s\S]*?)(?=\n## `fix`)/m.exec(formats);
    expect(metadata, "missing label metadata table").not.toBeNull();

    const metadataLabels = [...metadata![1]!.matchAll(/^\| `([a-z]+)`\s+\|/gm)].map(
      (match) => match[1]!,
    );
    const schemaTypes = [...formats.matchAll(/^## `([a-z]+)`$/gm)].map((match) => match[1]!);

    expect(metadataLabels).toEqual(EXPECTED_CHANGE_TYPES);
    expect(schemaTypes).toEqual(EXPECTED_CHANGE_TYPES);
    expect(metadataLabels).toEqual(schemaTypes);
    expect(formats).not.toMatch(/(?:^## |^\| )`brainstorm`/m);
  });

  it.each(Object.entries(REQUIRED_SECTIONS))(
    "locks the semantic section order for %s",
    (type, expected) => {
      const schema = extractSchema(formats, type as keyof typeof REQUIRED_SECTIONS);
      const sections = [...schema.matchAll(/^\| `([a-z_]+)`\s+\|/gm)].map((match) => match[1]!);

      expect(sections).toEqual(expected);
    },
  );

  it("uses the user's language and the active GitHub account", () => {
    expect(skill).toContain("Use the user's current language for every user-visible Issue field");
    expect(skill).toContain("gh auth status --active --hostname github.com");
    expect(formats).toContain("Render each semantic section as one natural visible `##` heading");
  });
});
