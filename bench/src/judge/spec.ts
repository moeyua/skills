/**
 * Shape spec loading and requirement extraction.
 *
 * The judge reads specs/shape/spec.md at runtime (never a hardcoded copy),
 * so spec updates flow into judging without touching bench code.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface SpecRequirement {
  name: string;
  body: string;
}

export function loadShapeSpec(repoRoot: string): string {
  const path = join(repoRoot, "specs/shape/spec.md");
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
