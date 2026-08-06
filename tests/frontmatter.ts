/**
 * Frontmatter parser for Skills skill files.
 *
 * Zero runtime dependencies — stdlib only. So first-run doesn't require `pnpm install`.
 *
 * Skills frontmatter has 2 string fields: name and description.
 */

import { readFileSync } from "node:fs";

export interface SkillFrontmatter {
  name: string;
  description: string;
}

export class FrontmatterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FrontmatterError";
  }
}

const REQUIRED_FIELDS = ["name", "description"] as const;
const ALL_FIELDS = ["name", "description"] as const;
type FieldName = (typeof ALL_FIELDS)[number];

export function parseFrontmatter(filePath: string): SkillFrontmatter {
  const text = readFileSync(filePath, "utf-8");
  const lines = text.split("\n");

  if (lines[0] !== "---") {
    throw new FrontmatterError(`INVALID FRONTMATTER: ${filePath} must start with ---`);
  }

  const endIdx = lines.indexOf("---", 1);
  if (endIdx === -1) {
    throw new FrontmatterError(`INVALID FRONTMATTER: ${filePath} missing closing ---`);
  }

  const fields: Partial<Record<FieldName, string>> = {};
  for (const raw of lines.slice(1, endIdx)) {
    if (!raw.trim()) continue;
    const colonIdx = raw.indexOf(":");
    if (colonIdx === -1) {
      throw new FrontmatterError(`INVALID FRONTMATTER LINE: ${filePath}: ${JSON.stringify(raw)}`);
    }
    const key = raw.slice(0, colonIdx).trim();
    const rawValue = raw.slice(colonIdx + 1).trim();
    if ((ALL_FIELDS as readonly string[]).includes(key)) {
      fields[key as FieldName] = parseScalar(rawValue, filePath, key);
    }
  }

  for (const required of REQUIRED_FIELDS) {
    if (!fields[required]?.trim()) {
      throw new FrontmatterError(`MISSING ${required}: in ${filePath}`);
    }
  }

  return {
    name: fields.name!,
    description: fields.description!,
  };
}

function parseScalar(raw: string, filePath: string, field: string): string {
  if (!raw) {
    throw new FrontmatterError(`EMPTY FRONTMATTER VALUE: ${filePath} field ${field}`);
  }
  const first = raw[0];
  if (first === '"' || first === "'") {
    const last = raw[raw.length - 1];
    if (last !== first) {
      throw new FrontmatterError(`INVALID FRONTMATTER QUOTE: ${filePath} field ${field}`);
    }
    return raw.slice(1, -1);
  }
  return raw;
}
