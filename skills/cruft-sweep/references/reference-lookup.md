---
name: reference-lookup
description: "How to find the architecture and convention reference for the current project. Defines lookup order, what to extract from each source, and how to ask the user when nothing is found."
---

# Reference Lookup

The skill needs a reference defining "what should be here". Without it, judgment cleanup is impossible. Mechanical cleanup can still proceed.

## Lookup Order

Try these in order. Stop at the first match that yields actionable rules. Keep checking lower-priority sources for additional rules — they can supplement.

### 1. CLAUDE.md (project + global)

Check both locations:
- `./CLAUDE.md` (project root)
- `~/.claude/CLAUDE.md` (user global)

Look for sections describing: architecture, conventions, file structure, naming rules, layer boundaries, forbidden patterns, "do not" rules.

### 2. Architecture documents

In order:
- `architecture.md` (project root)
- `docs/architecture.md`
- `docs/architecture/` (directory of related files)
- `docs/ARCHITECTURE.md`

Extract: module boundaries, layer rules, dependency direction, naming conventions, registered modules.

### 3. Convention documents

- `conventions.md` / `CONVENTIONS.md`
- `.conventions/` (directory)
- `STYLE.md` / `CONTRIBUTING.md`

### 4. Executable conventions

These are conventions already encoded as machine rules. High-value because they're authoritative — running the tool gives an exact answer.

- `.eslintrc*` / `eslint.config.*` — coding rules and any custom plugins
- `tsconfig.json` — type and module rules, path aliases
- `.dependency-cruiser.cjs` / `dependency-cruiser.config.*` — module dependency rules
- `biome.json` — coding rules
- `.editorconfig` — formatting
- `.ls-lint.yml` — file naming rules

These don't tell you the *intent* but they tell you the *enforced* rules. Treat them as ground truth — if eslint forbids it, it's a violation regardless of what the docs say.

### 5. README architecture section

Look in `README.md` for sections titled "Architecture", "Project Structure", "Conventions", or similar.

## When Nothing is Found

Ask the user. **Do not infer architecture from existing code** — inferring bakes existing cruft in as "the standard", which makes the skill useless.

Match the user's language. Example for Chinese:

```
没有找到架构或规范文档。可以选择：

A. 描述一下当前架构和规范（我会按你说的作为参考）
B. 指给我一个具体文档路径
C. 只做机械清理（死代码 + lint 违反），跳过需要判断的部分

你选哪个？
```

For English:

```
No architecture or convention reference found. Options:

A. Describe the current architecture and conventions yourself
B. Point me to a specific document path
C. Run mechanical cleanup only (dead code + lint violations), skip judgment items

Which one?
```

## What to Extract

Regardless of source, extract these into an internal "rules digest". This digest is working context for diagnose; it doesn't need to be saved to disk.

- **Module boundaries** — which directories are modules, what their public APIs are
- **Layer rules** — which layers can depend on which (e.g., `domain/` cannot import from `infrastructure/`)
- **Naming conventions** — file naming, identifier conventions
- **Forbidden patterns** — things explicitly called out as "do not do this"
- **Canonical implementations** — when something has a single official location (e.g., "all date formatting in `lib/date.ts`")
- **Deprecated APIs** — symbols marked `@deprecated`, "old" patterns, things ADRs replaced

## Make Each Rule Scannable

Every digest entry feeds the rule-by-rule compliance scan in [diagnose Step 5](diagnose.md#step-5-rule-by-rule-compliance-scan). For that scan to produce verifiable PASS/FAIL evidence, each rule must be **scannable** — there has to be a concrete way to check it.

Scannable rules:
- "No `import Combine`" — grep
- "Core public APIs are protocols" — read each public symbol, check declaration
- "Files use kebab-case" — glob + pattern match
- "domain/ cannot import infrastructure/" — read imports per file in domain/

Non-scannable (push back on):
- "Code should be clean" — what does that check look like?
- "Follow conventions" — which convention, where written
- "Be idiomatic" — no operationalization

If the source document only contains non-scannable guidance, ask the user to make it concrete enough to scan against. Don't try to invent the operationalization yourself — the user owns the conventions.

## Confirm the Digest Before Scanning

Surface the digest back to the user before running the scan. This catches misinterpretations cheaply — re-running the scan after the digest is wrong is much more expensive.

```
基于 CLAUDE.md 和 docs/architecture.md，我识别出以下规则作为参考：

- 模块边界：src/{api,domain,infra,ui} 四层
- 依赖方向：ui → api → domain → infra（不允许反向）
- 命名：kebab-case for files, PascalCase for types
- 禁止：从 src/legacy/ 导入到非 legacy 代码
- Canonical: 日期格式化统一用 src/utils/date.ts

正确吗？还有遗漏的规则吗？
```

If the user corrects, update the digest before scanning.

## Reference Does Not Need to Be Complete

Partial rules are fine. If you only know the dependency direction but not naming, scan only for dependency violations. The skill should never refuse to run because the reference isn't comprehensive — partial cleanup is still cleanup.

Note any gaps in the report so the user knows what wasn't checked:

```
Reference coverage:
✓ Module boundaries (from architecture.md)
✓ Dependency direction (from .dependency-cruiser.cjs)
✗ Naming conventions (not specified)
✗ Canonical implementations (not specified)

Diagnose ran rules where coverage exists. Items requiring naming or canonical
rules are not in this report.
```
