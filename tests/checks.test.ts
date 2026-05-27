import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { findSkillFiles, checkSkillFiles } from '../scripts/checks.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

describe('findSkillFiles', () => {
  it('finds all 7 stub skill files in the repo', () => {
    const files = findSkillFiles(REPO_ROOT);
    expect(files).toHaveLength(7);
    expect(files.map((p) => p.replace(REPO_ROOT, '')).sort()).toEqual([
      '/skills/commit/SKILL.md',
      '/skills/explore/SKILL.md',
      '/skills/implement/SKILL.md',
      '/skills/push/SKILL.md',
      '/skills/review/SKILL.md',
      '/skills/test/SKILL.md',
      '/skills/think/SKILL.md',
    ]);
  });
});

describe('checkSkillFiles', () => {
  it('parses and validates all stub skill files', () => {
    const map = checkSkillFiles(REPO_ROOT);
    expect(map.size).toBe(7);
    for (const name of ['explore', 'think', 'implement', 'test', 'review', 'commit', 'push']) {
      expect(map.has(name)).toBe(true);
      expect(map.get(name)?.name).toBe(name);
    }
  });
});
