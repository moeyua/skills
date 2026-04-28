---
name: diagnose
description: "Detailed Diagnose phase procedure: enumerate source files, run a per-file read pass, cross-reference imports/exports, scan the digest rule-by-rule, verify doc↔code consistency, supplement with tools, then write a report that includes both findings AND verified-clean evidence."
---

# Diagnose Phase

Read-only. Produces `.claude/cleanup/report.md`. Does not modify any code.

The whole phase is structured as a series of scanning passes. Each pass produces both **findings** (cruft to clean) and **verified-clean evidence** (rules / paths / files that passed). Both belong in the report.

A common failure mode is the "shallow scan": run linters, grep for TODOs, list orphan directories, declare done. That misses the things tools don't catch — convention violations, doc↔code drift, file-internal cruft inside otherwise-referenced files. The procedure below forces depth.

## Step 1: Locate Reference + Extract Rules Digest

Follow [reference-lookup](reference-lookup.md). Surface the digest to the user for confirmation before scanning. The digest must be **actionable** — every entry should be scannable. If the user gave abstract guidance like "follow good practices", push them to make it concrete enough to scan against.

Concrete digest entries look like:
- "no `import Combine` anywhere"
- "Core modules expose protocols, not concrete classes, in their public API"
- "All UI primarily SwiftUI; AppKit only when system constraint requires"
- "Cross-layer imports forbidden in the direction infra → domain"
- "All file paths use kebab-case"

Vague entries to push back on:
- "Code should be clean" — not scannable
- "Follow our conventions" — which conventions, where written

If only a partial reference is available, scan only what the reference covers. Note coverage gaps in the report. Mechanical / file-internal scans (Step 3) can proceed regardless of reference quality; the rule-compliance pass (Step 5) needs the digest.

## Step 2: Enumerate the Source File Inventory

Build a complete list of files to scan. Use `Glob` or `find`. Group by package / app for monorepos.

For each app or package, list:
- Source files (`src/**/*.{ts,tsx,js}`, `Sources/**/*.swift`, `app/**/*.{rs,go,py}`, etc.)
- Test files (`test/**`, `Tests/**`, `*.test.*`, `*.spec.*`)
- Config files (`*.config.*`, `tsconfig*.json`, `package.json`, lint configs)

Output the count to the user before scanning starts:

```
Inventory:
  apps/api/      11 src + 4 scripts + 14 tests + 6 configs
  apps/desktop/  30 swift sources + 21 swift tests
  apps/web/      19 sources + 5 tests + 5 configs
  Total: ~115 files to scan
```

This sets expectations and confirms scope. If the count is much larger than expected, this is the moment to suggest scoping (a single app, a single subdirectory) before scanning.

## Step 3: Per-File Read Pass (L2)

**Read every source file.** Do not grep. Reading is the only way to catch file-internal cruft that tools miss.

For monorepos with >50 files total, dispatch one Explore subagent per app or package in parallel. Subagents protect attention budget and let parallel reads finish around the same time. Single-package projects can be scanned inline.

In each file, look for:

| L2 finding type | What to look for |
|---|---|
| Unused imports | Imports declared but never referenced in the file |
| Unused local symbols | Private/internal types, functions, constants defined but unreferenced inside the file |
| Commented-out code | `//` or `/* */` blocks containing actual code (NOT doc comments) |
| Debug leftovers | `console.log` / `print` / `dump` / `debugPrint` outside intentional logging paths |
| Dead branches | `if (false)`, switch cases that can't be reached, guards that always pass given current call sites |
| Unused parameters | Parameters in function signatures that aren't used and aren't marked intentional (`_` in Swift, `_` prefix in TS) |
| Stale TODO / FIXME | Outside test fixtures; especially "remove once X" where X already happened |

Findings here are usually high-confidence. Most are mechanical (cleanable without judgment).

## Step 4: Cross-File Analysis (L3)

Build a project-wide symbol table from the per-file pass. Then check:

| L3 finding type | How to check |
|---|---|
| Unused exports | For every `export` (or `public`/`internal` symbol in Swift), grep the project for importers. Zero importers → candidate for removal or visibility downgrade |
| Duplicate implementations | Same/similar code blocks (≥5 lines, ≥80% similar) appearing in multiple files |
| Multiple patterns for same job | Several different error-shaping helpers, several KV-key formatters, several date-format functions |
| Type definitions in two places | `types.ts` declares a type that's also redeclared inline in another file |

Be discerning: some duplication is intentional (e.g., scoped CSS in component frameworks, defensive trimming in independent network clients). Flag, don't condemn. The user decides per cluster.

## Step 5: Rule-by-Rule Compliance Scan

For each entry in the rules digest from Step 1, run a targeted scan. Produce one of:

- **PASS** with evidence (e.g., "checked all 30 Swift files for `import Combine` — zero matches")
- **FAIL** with locations (e.g., "found `import Combine` at `src/X.swift:1`, `Y.swift:1`")

This pass is the highest-value differentiator from "shallow" cleanup. The findings might be zero, but the **evidence of having checked** is itself part of the report's value — it's what makes the report usable for audit, onboarding, or PR review context.

Example digest scans:

| Digest rule | Scan technique |
|---|---|
| "No Combine" | Grep `import Combine` + `AnyPublisher` + `@Published` + `.sink` + `.assign` |
| "Core exposes protocols" | Read each `Sources/Core/*/index.swift` (or equivalent), check public types are protocols |
| "Logs never contain selected text" | Grep log statements, check arguments don't include selection-related variables |
| "Cross-layer imports forbidden" | Read each file's imports, check direction matches digest |
| "kebab-case file naming" | Glob filenames, check pattern |
| "Tailwind 4 deferred" | Grep `tailwind` across configs and source |

Some scans are fully grep-able; others require reading. Always state what was checked, even when nothing was found.

## Step 6: Doc↔Code Consistency

Verify that documentation matches code reality. Three sub-checks:

**6a. Module contracts vs source paths**
For each `docs/modules/*.md` (or equivalent), extract referenced source paths (e.g., `apps/api/src/auth.ts`). Verify each exists. Flag missing paths.

**6b. Doc-internal links**
For CLAUDE.md, README, and any doc index file, extract relative-path links. Verify each resolves to a real file/directory. Flag broken links.

**6c. Cross-reference identifiers**
ADR numbers, spec IDs, feature flags — verify references match what exists.

This pass also produces PASS-with-evidence:
```
Doc↔code:
  ✓ 25 CLAUDE.md links resolve
  ✓ 6 module contract source paths exist
  ✓ 10 ADR references match files in docs/decisions/
  ✗ docs/specs/old-feature.md references apps/desktop/Sources/Removed.swift (deleted)
```

## Step 7: Tool Augmentation

Run any installed static analysis tools. These supplement the manual passes — they catch things the read missed (e.g., subtle unused exports across complex import chains).

In priority order based on what's installed:

- **JS/TS**: `pnpm dlx knip`, `pnpm dlx ts-prune`, `pnpm dlx unimported`, project lint
- **Rust**: `cargo +nightly udeps`, `cargo clippy`
- **Python**: `vulture`
- **Go**: `staticcheck` with `U1000`
- **Cross-language**: `dependency-cruiser` (if configured), `jscpd` for duplicate detection

Tool findings are appended to existing categories (Type B for dead code, Type A for architecture violations). Don't double-list — if Step 3 already found `unused export X`, the tool finding for the same symbol is suppressed.

When no relevant tools are installed, that's not a fallback to "skip". The per-file pass + cross-file analysis cover most of what tools would have caught. Note in the "Coverage" section which tools weren't run.

## Step 8: Classify and Write the Report

Map every finding into one of the five cruft types (see [concepts](concepts.md)). The user-facing presentation has only two layers:

- **Mechanical** (types A + B): tools or rule-scans verify; cleanup is mostly automated
- **Judgment** (types C + D + E): user input required per item

Within each layer, sort by:
1. Confidence (high → low)
2. Scope (small → large)
3. File path (alphabetical, for stable diffs)

The report MUST include a **Verified Clean** section. See [report-format](report-format.md) for the structure.

## Step 9: Handle Large Reports

Count total findings. Behavior depends on size:

| Size | Behavior |
|------|----------|
| < 50 | Show full report inline + write file |
| 50–200 | Show summary inline (counts per type), point to file |
| > 200 | Show summary + recommend scoping before clean |

For >200, suggest one of:
- "Sweep mechanical only first (typically 60-80% of findings, low risk)"
- "Focus on directory `X` (highest density of findings)"
- "Focus on type `Y` (e.g., dead code only)"

Note: even with many findings, the **Verified Clean** section should be summarized inline — it's part of the value, not noise.

## Step 10: Hand Off to the User

End diagnose with a clear question. Match the user's language. Example:

```
诊断完成。报告写入 .claude/cleanup/report.md。

机械可清理: M 项
  - 死代码: X
  - 架构违反: Y

需要判断: K 项
  - 重复实现: X 组
  - 旧 API: Y
  - 投机性代码: Z

已验证干净:
  - {规则数} convention rules: PASS
  - {链接数} doc↔code references resolve
  - {文件数} files scanned with no L2 findings

要不要现在开始清理？建议从机械类开始：
1. 全部机械清理
2. 只清某个目录范围
3. 只看报告先不动手
```

Wait for the user to choose before entering Clean. Do not assume.

## Coverage Gaps

If the reference was partial, end the report with a "Not Checked" section listing what wasn't scanned and why:

```markdown
## Not Checked

- Naming conventions: no rules in reference
- Canonical implementations: no rules in reference
- Outdated dependencies: out of scope (use `pnpm outdated`)
- Hardware-dependent code paths: covered by manual test checklist

To include the first two, add the rules to CLAUDE.md or architecture.md and re-run.
```

Honest gap reporting matters: the user needs to know what *wasn't* covered as much as what was.

## Anti-Patterns

These are tempting shortcuts that produce shallow reports. Don't:

- **Grep instead of read.** Grep finds only what you know to look for. Reading catches the unexpected.
- **Skip files because "they probably have nothing".** Per-file pass means *every* file. The smallest files are sometimes the dirtiest (orphan utilities, copied config snippets).
- **Treat tool absence as permission to skip.** When `knip` isn't installed, the per-file + cross-file passes still cover most of what it would catch.
- **Hide the "verified clean" results because they're not findings.** They are findings — findings of compliance. They're part of why running this skill is valuable for healthy projects too.
- **List only the most "interesting" items.** Exhaustiveness within scope is the goal. Confidence labels (high / low) handle the unevenness; skipping doesn't.
