#!/usr/bin/env node
/**
 * Verify [x] AC markers against actual test evidence.
 *
 * For every `[x]` AC in `docs/specs/*.md`, search the project's test
 * directories for an annotation referencing that AC id (`(AC-NN)`,
 * `AC-NN:`, `@AC-NN`, `// AC-NN`, etc.). Emit a verdict per AC.
 *
 *   PASS                  — at least one test file annotates this AC id
 *   DOWNGRADE-TO-TILDE    — no annotation found; recommend [x] → [~]
 *
 * `[~]` AC pass through (already marked as untested debt). `[ ]` AC are
 * out of scope here — Verify only reverse-checks claims, never promotes.
 *
 * Usage:
 *   node scripts/verify.mjs --root <project-root>
 *     [--spec docs/specs/foo.md] [--json]
 *     [--test-dirs test,tests,__tests__,e2e]
 *     [--test-extensions .ts,.tsx,.js,.jsx,.mjs,.cjs,.py,.go,.rs]
 *
 * Exit codes: 0=all [x] verified, 1=at least one downgrade recommended,
 *             2=internal failure.
 */

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathExists, walkMarkdown } from './lib/walk.mjs'
import { makeFinding, parseArgs, printHuman, printJson, summarize } from './lib/report.mjs'

const args = parseArgs(process.argv.slice(2))
const root = path.resolve(args.root || '.')
const json = args.json === true
const onlySpec = args.spec ? path.resolve(root, args.spec) : null
const testDirs = (args['test-dirs'] || 'test,tests,__tests__,e2e,spec,specs').split(',')
const testExts = (args['test-extensions'] || '.ts,.tsx,.js,.jsx,.mjs,.cjs,.vue,.py,.go,.rs').split(',')

try {
  const specFiles = await collectSpecFiles(root, onlySpec)
  const acItems = []
  for (const specRel of specFiles) {
    acItems.push(...await parseSpecAcs(root, specRel))
  }

  const testIndex = await buildTestAnnotationIndex(root, testDirs, testExts)
  const findings = []
  let passCount = 0

  for (const ac of acItems) {
    if (ac.state !== 'x') continue
    const annotations = testIndex.get(ac.id) || []
    if (annotations.length === 0) {
      findings.push(makeFinding({
        level: 'ERROR',
        kind: 'unbacked-ac',
        file: ac.specFile,
        line: ac.specLine,
        message: `${ac.id} marked [x] but no test file references it (verdict: DOWNGRADE-TO-TILDE)`,
        context: ac.text,
        fix: `Either: (a) add a test annotation \`(${ac.id})\` near the relevant test case, (b) downgrade the marker to [~] via Sync Mode, or (c) record an entry in docs/.spec-dev/decisions.md if the test lives somewhere the index can't see.`,
      }))
    } else {
      passCount += 1
    }
  }

  const summary = summarize(findings, {
    checks_run: ['ac-test-annotation'],
    files_scanned: specFiles.length,
    ac_x_total: acItems.filter(a => a.state === 'x').length,
    ac_x_verified: passCount,
  })
  const meta = { tool: 'spec-dev/verify', root }

  if (json) printJson(meta, findings, summary)
  else printHuman('spec-dev verify', findings, summary)

  process.exit(summary.errors > 0 ? 1 : 0)
} catch (err) {
  console.error(`spec-dev verify failed: ${err.message}`)
  if (err.stack) console.error(err.stack)
  process.exit(2)
}

// =============================================================================
// helpers
// =============================================================================

async function collectSpecFiles(root, onlySpec) {
  if (onlySpec) {
    if (!(await pathExists(onlySpec))) throw new Error(`spec file not found: ${onlySpec}`)
    return [path.relative(root, onlySpec)]
  }
  const all = await walkMarkdown(root)
  return all.filter((rel) => {
    const norm = rel.replaceAll('\\', '/').toLowerCase()
    return norm.includes('docs/specs/') && !norm.endsWith('readme.md')
  })
}

async function parseSpecAcs(root, specRel) {
  const abs = path.join(root, specRel)
  const content = await readFile(abs, 'utf8')
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const acLinePattern = /^\s*-\s*\[([x~ ])\]\s*(?:\*\*)?AC-(\d{1,3}[a-z]?)\b\s*\*?\*?\s*(.*)$/
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(acLinePattern)
    if (!m) continue
    out.push({
      id: `AC-${m[2]}`,
      state: m[1],
      text: m[3].trim(),
      specFile: specRel,
      specLine: i + 1,
    })
  }
  return out
}

async function buildTestAnnotationIndex(root, testDirs, testExts) {
  const index = new Map()
  const annotationPattern = /\bAC-(\d{1,3}[a-z]?)\b/g

  const candidateRoots = []
  for (const dir of testDirs) {
    const abs = path.join(root, dir)
    if (await pathExists(abs)) candidateRoots.push(abs)
  }

  // Also scan source roots for inline test annotations (Vue SFC, Rust, Go often colocate).
  for (const dir of ['src', 'app', 'lib', 'packages']) {
    const abs = path.join(root, dir)
    if (await pathExists(abs)) candidateRoots.push(abs)
  }

  for (const start of candidateRoots) {
    await walkAndIndex(start, root, testExts, annotationPattern, index)
  }

  return index
}

async function walkAndIndex(dir, projectRoot, exts, pattern, index) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkAndIndex(full, projectRoot, exts, pattern, index)
      continue
    }
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!exts.includes(ext)) continue
    let content
    try {
      content = await readFile(full, 'utf8')
    } catch {
      continue
    }
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      const id = `AC-${match[1]}`
      if (!index.has(id)) index.set(id, [])
      const list = index.get(id)
      const rel = path.relative(projectRoot, full)
      if (!list.includes(rel)) list.push(rel)
    }
  }
}
