/**
 * Validation checks for praxis skills.
 *
 * Each function takes the repository root and either returns ok/throws.
 * Driver lives in `verify-skills.ts`. Functions can be imported by vitest.
 *
 * v1 only implements the minimal happy-path check (`checkSkillFiles`).
 * The rest are stubs to be filled when skill content lands.
 */

import { readdirSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { parseFrontmatter, type SkillFrontmatter } from './frontmatter.ts';

export function findSkillFiles(root: string): string[] {
  const skillsDir = join(root, 'skills');
  const entries = readdirSync(skillsDir);
  const result: string[] = [];
  for (const entry of entries) {
    const skillPath = join(skillsDir, entry, 'SKILL.md');
    try {
      if (statSync(skillPath).isFile()) {
        result.push(skillPath);
      }
    } catch {
      // Not a skill directory (likely a regular file like RESOLVER.md). Skip.
    }
  }
  return result.sort();
}

export function checkSkillFiles(root: string): Map<string, SkillFrontmatter> {
  const skillFiles = findSkillFiles(root);
  if (skillFiles.length === 0) {
    throw new Error('NO SKILLS FOUND: expected skills/*/SKILL.md');
  }

  const out = new Map<string, SkillFrontmatter>();
  for (const path of skillFiles) {
    const skillDir = basename(dirname(path));
    const fields = parseFrontmatter(path);
    if (fields.name !== skillDir) {
      throw new Error(
        `NAME MISMATCH: ${path} frontmatter name=${fields.name} dir=${skillDir}`,
      );
    }
    out.set(skillDir, fields);
    console.log(`ok: ${path}`);
  }
  return out;
}

// --- TODO (v1 final): implement these checks ---
//
// checkDescriptionConformance:
//   - 40 <= length <= 500
//   - first word not "the/a/an/this/it"
//   - description contains "Use when" and "Not for"
//
// checkOutcomeContract:
//   - SKILL.md contains "## Outcome Contract"
//   - contains "Outcome:", "Done when:", "Evidence:", "Output:"
//
// checkReferencesExist:
//   - parse `references/X.md` patterns from SKILL.md text
//   - confirm files exist
//
// checkMarkdownLinks:
//   - all relative markdown links resolve to existing files
//
// checkTriggerJaccard:
//   - pairwise Jaccard < 0.5 over when_to_use keyword sets
//
// checkPortableSurface:
//   - no personal paths (/Users/X/, /home/X/)
//   - no AI attribution (Co-Authored-By: Claude, noreply@anthropic.com, ...)
//   - no private/internal repo context
//
// checkResolverConsistency:
//   - every skill name appears in skills/RESOLVER.md
//   - RESOLVER.md doesn't reference skills that don't exist
//
// checkNoRootSkill:
//   - root SKILL.md must not exist (breaks `npx skills add` nested discovery)
