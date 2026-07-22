/** Scenario-card loading and validation for conversational shape cases. */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";

export const SCENARIO_KINDS = ["explore", "fix", "feat", "refactor", "perf"] as const;
export type ScenarioKind = (typeof SCENARIO_KINDS)[number];

export interface ScenarioCard {
  id: string;
  kind: ScenarioKind;
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
  if (!text.startsWith("---\n")) throw new Error(`场景卡 ${path} 缺少 YAML frontmatter`);
  const end = text.indexOf("\n---", 4);
  if (end === -1) throw new Error(`场景卡 ${path} frontmatter 未闭合`);

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
  const match = new RegExp(`^## ${heading}\\s*$`, "m").exec(body);
  if (match === null) return "";
  const start = match.index + match[0].length;
  const next = body.slice(start).search(/^## /m);
  return (next === -1 ? body.slice(start) : body.slice(start, start + next)).trim();
}

export function parseScenarioCard(path: string, fixturesRoot: string): ScenarioCard {
  const text = readFileSync(path, "utf8");
  const fm = parseFrontmatter(text, path);
  const errors: string[] = [];

  for (const key of ["id", "kind", "title", "fixture"]) {
    if (fm[key] === undefined || fm[key] === "") errors.push(`frontmatter 缺 ${key}`);
  }
  if (fm["kind"] !== undefined && !SCENARIO_KINDS.includes(fm["kind"] as ScenarioKind)) {
    errors.push(`kind 非法:${fm["kind"]}(可用:${SCENARIO_KINDS.join("/")})`);
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

  if (errors.length > 0) throw new Error(`场景卡 ${path} 校验失败:${errors.join(";")}`);
  return {
    id: fm["id"] as string,
    kind: fm["kind"] as ScenarioKind,
    title: fm["title"] as string,
    fixture,
    initialIntent: sections.initialIntent as string,
    intentCard: sections.intentCard as string,
    answerPolicy: sections.answerPolicy as string,
    path,
  };
}

export function loadScenarios(scenariosDir: string, fixturesRoot: string): ScenarioCard[] {
  return readdirSync(scenariosDir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => parseScenarioCard(join(scenariosDir, file), fixturesRoot));
}
