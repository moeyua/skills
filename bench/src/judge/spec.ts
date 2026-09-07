/**
 * Selected skill spec loading and requirement extraction.
 *
 * The judge reads specs/<skill>/spec.md at runtime (never a hardcoded copy),
 * so spec updates flow into judging without touching bench code.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface SpecRequirement {
  name: string;
  body: string;
}

export const PUBLIC_SKILLS = [
  "explore",
  "shape",
  "plan",
  "implement",
  "check",
  "docs",
  "publish",
  "release",
  "converge",
  "doctor",
  "handoff",
] as const;
export type PublicSkill = (typeof PUBLIC_SKILLS)[number];

export function parseSkill(value: unknown): PublicSkill {
  if (typeof value !== "string" || !PUBLIC_SKILLS.includes(value as PublicSkill)) {
    throw new Error(`--skill 必须显式选择: ${PUBLIC_SKILLS.join(" / ")}`);
  }
  return value as PublicSkill;
}

export function loadSkillSpec(repoRoot: string, skill: PublicSkill): string {
  const path = join(repoRoot, "specs", parseSkill(skill), "spec.md");
  return readFileSync(path, "utf8");
}

export function extractRequirements(specText: string): SpecRequirement[] {
  const requirements: SpecRequirement[] = [];
  const lines = specText.split("\n");
  let current: SpecRequirement | null = null;
  for (const line of lines) {
    if (line.startsWith("### Requirement: ")) {
      if (current !== null) requirements.push({ ...current, body: current.body.trim() });
      current = { name: line.slice("### Requirement: ".length).trim(), body: "" };
    } else if (current !== null) {
      if (line.startsWith("## ") || line.startsWith("# ")) {
        requirements.push({ ...current, body: current.body.trim() });
        current = null;
      } else {
        current.body += `${line}\n`;
      }
    }
  }
  if (current !== null) requirements.push({ ...current, body: current.body.trim() });
  return requirements;
}
