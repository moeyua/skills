#!/usr/bin/env tsx
/**
 * Validate praxis skill metadata, references, and routing invariants.
 *
 * Run as: pnpm verify  (or: tsx scripts/verify-skills.ts [--root PATH])
 *
 * Default --root is the repository root inferred from this file's location.
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { checkSkillFiles } from './checks.ts';

function parseArgs(argv: string[]): { root: string } {
  let root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') {
      const next = argv[i + 1];
      if (!next) throw new Error('--root requires a path');
      root = resolve(next);
      i++;
    }
  }
  return { root };
}

function main(): number {
  const { root } = parseArgs(process.argv.slice(2));

  try {
    const skills = checkSkillFiles(root);
    console.log(`\nok: verified ${skills.size} skill(s) at ${root}`);
    console.log('note: v1 stub — many checks not yet implemented (see scripts/checks.ts)');
    return 0;
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
}

process.exit(main());
