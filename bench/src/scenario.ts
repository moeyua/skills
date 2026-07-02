/**
 * Scenario card loading and validation.
 *
 * Card format (from the plan's interface boundary): YAML frontmatter with
 * id / mode / title / fixture, then three required sections — 初始意图
 * (verbatim /shape argument), 意图卡 (hidden motivation, constraints, success
 * criteria for the user-sim), 答题策略 (how to answer open questions;
 * anything outside the intent card gets "你决定").
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";

export const SCENARIO_MODES = ["brainstorm", "fix", "feat", "refactor", "perf"] as const;
export type ScenarioMode = (typeof SCENARIO_MODES)[number];

export interface ScenarioCard {
  id: string;
  mode: ScenarioMode;
  title: string;
  fixture: string;
  initialIntent: string;
  intentCard: string;
  answerPolicy: string;
  path: string;
}

const REQUIRED_SECTIONS: [keyof ScenarioCard, string][] = [
  ["initialIntent", "初始意图"],
  ["intentCard", "意图卡"],
  ["answerPolicy", "答题策略"],
];

function parseFrontmatter(text: string, path: string): Record<string, string> {
  if (!text.startsWith("---\n")) {
    throw new Error(`场景卡 ${path} 缺少 YAML frontmatter`);
  }
  const end = text.indexOf("\n---", 4);
  if (end === -1) {
    throw new Error(`场景卡 ${path} frontmatter 未闭合`);
  }
  const fields: Record<string, string> = {};
  for (const line of text.slice(4, end).split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    fields[line.slice(0, colon).trim()] = line
      .slice(colon + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return fields;
}

function extractSection(body: string, heading: string): string {
  const pattern = new RegExp(`^## ${heading}\\s*$`, "m");
  const match = pattern.exec(body);
  if (match === null) return "";
  const start = match.index + match[0].length;
  const next = body.slice(start).search(/^## /m);
  const section = next === -1 ? body.slice(start) : body.slice(start, start + next);
  return section.trim();
}

export function parseScenarioCard(path: string, fixturesRoot: string): ScenarioCard {
  const text = readFileSync(path, "utf8");
  const fm = parseFrontmatter(text, path);
  const errors: string[] = [];

  for (const key of ["id", "mode", "title", "fixture"]) {
    if (fm[key] === undefined || fm[key] === "") errors.push(`frontmatter 缺 ${key}`);
  }
  if (fm["mode"] !== undefined && !SCENARIO_MODES.includes(fm["mode"] as ScenarioMode)) {
    errors.push(`mode 非法:${fm["mode"]}(可用:${SCENARIO_MODES.join("/")})`);
  }
  if (fm["id"] !== undefined && fm["id"] !== basename(path, ".md")) {
    errors.push(`id「${fm["id"]}」与文件名「${basename(path, ".md")}」不一致`);
  }

  const body = text.slice(text.indexOf("\n---", 4) + 4);
  const sections: Partial<Record<keyof ScenarioCard, string>> = {};
  for (const [key, heading] of REQUIRED_SECTIONS) {
    const value = extractSection(body, heading);
    if (value === "") errors.push(`缺少「## ${heading}」节或该节为空`);
    sections[key] = value;
  }

  const fixture = fm["fixture"] ?? "";
  if (fixture !== "") {
    const fixtureDir = join(fixturesRoot, fixture);
    if (!existsSync(fixtureDir) || !statSync(fixtureDir).isDirectory()) {
      errors.push(`fixture 目录不存在:${fixtureDir}`);
    } else if (readdirSync(fixtureDir).length === 0) {
      errors.push(`fixture 目录为空:${fixtureDir}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`场景卡 ${path} 校验失败:${errors.join(";")}`);
  }
  return {
    id: fm["id"] as string,
    mode: fm["mode"] as ScenarioMode,
    title: fm["title"] as string,
    fixture,
    initialIntent: sections.initialIntent as string,
    intentCard: sections.intentCard as string,
    answerPolicy: sections.answerPolicy as string,
    path,
  };
}

export function loadScenarios(scenariosDir: string, fixturesRoot: string): ScenarioCard[] {
  const files = readdirSync(scenariosDir)
    .filter((f) => f.endsWith(".md"))
    .sort();
  return files.map((f) => parseScenarioCard(join(scenariosDir, f), fixturesRoot));
}
