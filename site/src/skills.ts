import { parse } from "yaml";

export interface Skill {
  name: string;
  category: string;
  description: string;
  manualOnly: boolean;
  credits?: string;
  body: string;
  /** Files besides SKILL.md, with paths relative to the skill directory. */
  files: SkillFile[];
}

export interface SkillFile {
  path: string;
  content: string;
}

interface Frontmatter {
  name?: string;
  description?: string;
  "disable-model-invocation"?: boolean;
  metadata?: { credits?: string };
}

/** Parse skills from a map of paths (relative to `skills/`, e.g. `engineering/shape/SKILL.md`) to file contents. */
export function parseSkills(files: Record<string, string>): Skill[] {
  const skills: Skill[] = [];
  for (const [path, text] of Object.entries(files)) {
    const parts = path.split("/");
    if (parts.length !== 3 || parts[2] !== "SKILL.md") continue;
    const [category = "", dir = ""] = parts;
    const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
    const prefix = `${category}/${dir}/`;
    const meta = (match ? parse(match[1] ?? "") : {}) as Frontmatter;
    skills.push({
      name: meta.name ?? dir,
      category,
      description: meta.description ?? "",
      manualOnly: meta["disable-model-invocation"] === true,
      credits: meta.metadata?.credits,
      body: text.slice(match?.[0].length ?? 0).trimStart(),
      files: Object.entries(files)
        .filter(([p]) => p.startsWith(prefix) && p !== `${prefix}SKILL.md`)
        .map(([p, content]) => ({ path: p.slice(prefix.length), content }))
        .sort((a, b) => a.path.localeCompare(b.path)),
    });
  }
  return skills.sort(
    (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );
}
