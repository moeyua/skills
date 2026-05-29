#!/usr/bin/env node
/**
 * Install a praxis rule into an agent's always-on context.
 *
 * Usage: node scripts/setup-rule.mjs <rule> <agent>
 *   <rule>  — a file rules/<rule>.md (e.g. output-style, anti-patterns, durable-context)
 *   <agent> — claude-code | codex
 *
 * Why this exists: rules/ files are never loaded on their own. Claude Code only
 * auto-loads ~/.claude/CLAUDE.md globally, so for claude-code we copy the rule to
 * ~/.claude/rules/<rule>.md and add an `@import` line to CLAUDE.md (the only
 * reliably always-on user file). Codex auto-loads ~/.codex/AGENTS.md but has no
 * @import, so we inline the rule content there.
 *
 * Both edits are idempotent: re-running replaces the praxis-managed block in place
 * rather than duplicating it. The core upsertBlock is pure and unit-tested.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);
const RULES_DIR = join(REPO_ROOT, "rules");

const AGENTS = ["claude-code", "codex"];

export function availableRules(rulesDir = RULES_DIR) {
  return readdirSync(rulesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => basename(f, ".md"))
    .sort();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Insert or replace a marker-delimited block. Pure and testable.
 * Re-running with the same marker replaces the existing block instead of duplicating.
 */
export function upsertBlock(text, marker, body) {
  const start = `<!-- praxis:${marker} start -->`;
  const end = `<!-- praxis:${marker} end -->`;
  const block = `${start}\n${body}\n${end}`;
  const base = (text ?? "").trimEnd();
  const re = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  if (re.test(base)) {
    return base.replace(re, block) + "\n";
  }
  return (base ? base + "\n\n" : "") + block + "\n";
}

function fail(msg) {
  console.error(`setup-rule: ${msg}`);
  console.error("usage: node scripts/setup-rule.mjs <rule> <agent>");
  console.error(`  rules:  ${availableRules().join(", ")}`);
  console.error(`  agents: ${AGENTS.join(", ")}`);
  process.exit(1);
}

function main(argv) {
  const rule = argv[0];
  const agent = argv[1];

  if (!rule || !agent) fail("missing argument");
  if (!availableRules().includes(rule)) fail(`unknown rule "${rule}"`);
  if (!AGENTS.includes(agent)) fail(`unknown agent "${agent}"`);

  const ruleFile = join(RULES_DIR, `${rule}.md`);
  const home = homedir();

  if (agent === "claude-code") {
    const rulesDest = join(home, ".claude", "rules");
    mkdirSync(rulesDest, { recursive: true });
    copyFileSync(ruleFile, join(rulesDest, `${rule}.md`));

    const claudeMd = join(home, ".claude", "CLAUDE.md");
    const current = existsSync(claudeMd) ? readFileSync(claudeMd, "utf8") : "";
    writeFileSync(claudeMd, upsertBlock(current, rule, `@~/.claude/rules/${rule}.md`));

    console.log(`Installed rule "${rule}" for claude-code:`);
    console.log(`  - copied to ~/.claude/rules/${rule}.md`);
    console.log(`  - @import added to ~/.claude/CLAUDE.md`);
    console.log("Re-run after editing the rule to refresh the copy.");
  } else {
    const ruleText = readFileSync(ruleFile, "utf8").trim();
    const agentsMd = join(home, ".codex", "AGENTS.md");
    mkdirSync(dirname(agentsMd), { recursive: true });
    const current = existsSync(agentsMd) ? readFileSync(agentsMd, "utf8") : "";
    writeFileSync(agentsMd, upsertBlock(current, rule, ruleText));

    console.log(`Installed rule "${rule}" for codex:`);
    console.log("  - content inlined into ~/.codex/AGENTS.md");
  }
}

function isDirectRun() {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isDirectRun()) main(process.argv.slice(2));
