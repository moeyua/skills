#!/usr/bin/env node
/**
 * Mechanical audit for spec-dev managed docs.
 *
 * Reproducible, full-coverage checks. The LLM does NOT participate in finding
 * issues here — it only consumes the report. Anything that requires judgment
 * goes elsewhere (Audit prompt narrative, Verify mode for [x] reality, etc.).
 *
 * Usage:
 *   node scripts/audit-mechanical.mjs --root <project-root> [--json] [--checks <a,b,c>]
 *
 * Default checks: dead-links, ac-format, section-presence
 *
 * Exit codes: 0=clean, 1=ERROR found, 2=internal failure.
 */

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathExists, walkMarkdown } from './lib/walk.mjs'
import { makeFinding, parseArgs, printHuman, printJson, summarize } from './lib/report.mjs'
import { extractExports, extractInlineIdentifiers, extractSourcePaths, extractTableRows, findSectionRange, stripFencedCode as stripFenced } from './lib/parsers.mjs'
import { DOC_TYPES, ModuleContract, Spec } from './schema/index.mjs'

const isSpecFile = Spec.isSpecFile
const isModuleFile = ModuleContract.isModuleFile

const args = parseArgs(process.argv.slice(2))
const root = path.resolve(args.root || '.')
const json = args.json === true
const checks = args.checks
  ? String(args.checks).split(',')
  : ['dead-links', 'ac-format', 'section-presence', 'public-api-drift', 'test-ac-mapping']

try {
  const findings = []
  const files = await walkMarkdown(root)
  const fileSet = new Set(files)

  if (checks.includes('dead-links')) findings.push(...await checkDeadLinks(root, files))
  if (checks.includes('ac-format')) findings.push(...await checkAcFormat(root, files))
  if (checks.includes('section-presence')) findings.push(...await checkSectionPresence(root, files))
  if (checks.includes('public-api-drift')) findings.push(...await checkPublicApiDrift(root, files))
  if (checks.includes('test-ac-mapping')) findings.push(...await checkTestAcMapping(root, files))

  const summary = summarize(findings, { checks_run: checks, files_scanned: fileSet.size })
  const meta = { tool: 'spec-dev/audit-mechanical', root }

  if (json) printJson(meta, findings, summary)
  else printHuman('spec-dev audit (mechanical)', findings, summary)

  process.exit(summary.errors > 0 ? 1 : 0)
} catch (err) {
  console.error(`spec-dev audit failed: ${err.message}`)
  if (err.stack) console.error(err.stack)
  process.exit(2)
}

// =============================================================================
// dead-links: every relative markdown link must resolve to an existing file
// =============================================================================
async function checkDeadLinks(root, files) {
  const findings = []
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+?)(?:\s+"[^"]*")?\)/g

  for (const rel of files) {
    const abs = path.join(root, rel)
    const content = await readFile(abs, 'utf8')
    const stripped = stripFencedCode(content)
    const lines = stripped.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue
      for (const match of line.matchAll(linkPattern)) {
        const [, text, target] = match
        if (shouldSkipLinkTarget(target)) continue

        const cleaned = target.split('#')[0]
        if (!cleaned) continue

        const resolved = path.resolve(path.dirname(abs), cleaned)
        if (await pathExists(resolved)) continue

        findings.push(makeFinding({
          level: 'ERROR',
          kind: 'dead-link',
          file: rel,
          line: i + 1,
          message: `Link target does not exist: ${cleaned}`,
          context: `[${text}](${target})`,
          fix: `Either correct the path (consider relative-prefix mistakes like missing ../) or remove the link if the target was deleted.`,
        }))
      }
    }
  }
  return findings
}

/**
 * Whether to skip a link target (treat as out-of-scope for the file-system check).
 *
 * Skips:
 *   - external protocols (http, mailto, tel, ftp, data)
 *   - same-doc anchors (#section)
 *   - absolute web routes (/foo/bar) — typical of VitePress / Docusaurus / Next docs
 *   - .html targets (web render artefact, source is .md handled separately)
 *   - bare tokens that look like git commit hashes (7-40 hex chars, no path)
 *   - bare identifiers with no path separator and no file extension (e.g. anchors
 *     produced by docusaurus shorthand, or footnote-style refs)
 */
function shouldSkipLinkTarget(target) {
  if (/^(?:https?|mailto|tel|ftp|data):/i.test(target)) return true
  if (target.startsWith('#')) return true
  if (target.startsWith('/')) return true
  const noAnchor = target.split('#')[0]
  if (!noAnchor) return true
  if (/\.html?$/i.test(noAnchor)) return true
  if (/^[0-9a-f]{7,40}$/i.test(noAnchor)) return true
  if (!noAnchor.includes('/') && !/\.[a-z0-9]{1,8}$/i.test(noAnchor)) return true
  return false
}

// =============================================================================
// ac-format: AC *definition* lines must be `- [<marker>] AC-NN`. Inline
// references like `(AC-03)` inside a TDD pointer / scenario are not AC
// definitions and never enter this check.
// =============================================================================
async function checkAcFormat(root, files) {
  const findings = []
  // Match a line that looks like an AC definition: a checkbox item whose first
  // token after the marker is `AC-NN`. Captures the marker text (which may be
  // illegal — that's the whole point) so we can validate it.
  const acDefinitionPattern = /^\s*-\s*\[([^\]]{0,3})\]\s*(?:\*\*)?AC-(\d{1,3}[a-z]?)\b/
  const validMarker = /^[x~ ]$/

  for (const rel of files) {
    if (!isSpecFile(rel)) continue
    const abs = path.join(root, rel)
    const content = await readFile(abs, 'utf8')
    const stripped = stripFencedCode(content)
    const lines = stripped.split('\n')

    const seen = new Map()

    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(acDefinitionPattern)
      if (!m) continue

      const marker = m[1]
      const id = `AC-${m[2]}`

      if (!validMarker.test(marker)) {
        findings.push(makeFinding({
          level: 'ERROR',
          kind: 'invalid-ac-format',
          file: rel,
          line: i + 1,
          message: `AC marker is malformed (must be exactly [ ], [x], or [~])`,
          context: lines[i].trim(),
          fix: `Use exactly: "- [ ] ${id} ..." or "- [x] ${id} ..." or "- [~] ${id} ..." — no other markers ([X], [v], [?], empty, etc.) are recognized.`,
        }))
        continue
      }

      if (seen.has(id)) {
        findings.push(makeFinding({
          level: 'ERROR',
          kind: 'duplicate-ac-id',
          file: rel,
          line: i + 1,
          message: `Duplicate ${id} (first defined at line ${seen.get(id)})`,
          context: lines[i].trim(),
          fix: `Renumber one of the duplicates. AC IDs must be unique within a spec file.`,
        }))
      } else {
        seen.set(id, i + 1)
      }
    }
  }
  return findings
}

// =============================================================================
// section-presence: required sections per doc type
// =============================================================================
async function checkSectionPresence(root, files) {
  const findings = []
  const headerPattern = /^(#{2,3})\s+(.+?)\s*$/

  for (const rel of files) {
    const rule = DOC_TYPES.find(r => r.match(rel))
    if (!rule) continue

    const abs = path.join(root, rel)
    const content = await readFile(abs, 'utf8')
    const stripped = stripFencedCode(content)
    const lines = stripped.split('\n')

    const headers = []
    for (const line of lines) {
      const m = line.match(headerPattern)
      if (m) headers.push(m[2].toLowerCase())
    }

    for (const requirement of rule.requiredSections) {
      const present = requirement.keys.some(key => headers.some(h => h.includes(key)))
      if (!present) {
        findings.push(makeFinding({
          level: 'ERROR',
          kind: 'missing-section',
          file: rel,
          message: `${rule.type} is missing required section: ${requirement.label}`,
          fix: `Add a "## ${requirement.label}" section. Acceptable header keywords: ${requirement.keys.join(', ')}.`,
        }))
      }
    }
  }
  return findings
}

// =============================================================================
// public-api-drift: declared exports in module contracts must exist in source
// =============================================================================
async function checkPublicApiDrift(root, files) {
  const findings = []
  for (const rel of files) {
    if (!isModuleFile(rel)) continue
    const abs = path.join(root, rel)
    const content = await readFile(abs, 'utf8')
    const stripped = stripFenced(content)
    const lines = stripped.split('\n')

    const range = findSectionRange(lines, 'public api', 2)
    if (!range) continue

    const sectionText = lines.slice(range[0], range[1]).join('\n')
    const sourcePaths = extractSourcePaths(sectionText)
    if (sourcePaths.length === 0) continue

    // Pick the first source path that resolves; if none, dead-link will already report.
    let resolvedSource = null
    for (const p of sourcePaths) {
      const candidate = path.resolve(path.dirname(abs), p)
      if (await pathExists(candidate)) {
        resolvedSource = candidate
        break
      }
      const fromRoot = path.resolve(root, p)
      if (await pathExists(fromRoot)) {
        resolvedSource = fromRoot
        break
      }
    }
    if (!resolvedSource) continue

    const declared = collectDeclaredExports(lines, range)
    if (declared.length === 0) continue

    const actual = await extractExports(resolvedSource)
    if (actual === null) continue
    const actualSet = new Set(actual)

    for (const { name, line: declLine } of declared) {
      if (actualSet.has(name)) continue
      findings.push(makeFinding({
        level: 'WARNING',
        kind: 'public-api-drift',
        file: rel,
        line: declLine,
        message: `Module contract declares export \`${name}\` but it was not found in ${path.relative(root, resolvedSource)}`,
        context: `declared exports: [${declared.map(d => d.name).join(', ')}]`,
        fix: `Either rename the contract entry to match the actual export, remove it if the export was deleted, or — if this is a false positive (e.g. SFC default export, dynamic factory) — record an entry in docs/.spec-dev/decisions.md.`,
      }))
    }
  }
  return findings
}

function collectDeclaredExports(lines, range) {
  const out = []
  const tableRows = extractTableRows(lines, range)
  if (tableRows.length > 0) {
    // Skip the header row
    for (let i = 1; i < tableRows.length; i++) {
      const row = tableRows[i]
      const idents = extractInlineIdentifiers(row.cols[0] || '')
      for (const id of idents) out.push({ name: id, line: row.line })
    }
  }
  // Also pick up bullet-list inline identifiers
  for (let i = range[0]; i < range[1]; i++) {
    const line = lines[i]
    if (!/^\s*[-*]\s/.test(line)) continue
    const idents = extractInlineIdentifiers(line)
    for (const id of idents) out.push({ name: id, line: i + 1 })
  }
  return out
}

// =============================================================================
// test-ac-mapping: orphan test annotations that no spec defines
// =============================================================================
async function checkTestAcMapping(root, files) {
  const findings = []
  const definedAcIds = new Set()
  const acLinePattern = /^\s*-\s*\[[x~ ]\]\s*(?:\*\*)?AC-(\d{1,3}[a-z]?)\b/

  for (const rel of files) {
    if (!isSpecFile(rel)) continue
    const abs = path.join(root, rel)
    const content = await readFile(abs, 'utf8')
    const lines = stripFenced(content).split('\n')
    for (const line of lines) {
      const m = line.match(acLinePattern)
      if (m) definedAcIds.add(`AC-${m[1]}`)
    }
  }

  const annotationPattern = /\bAC-(\d{1,3}[a-z]?)\b/g
  const candidateRoots = []
  for (const dir of ['test', 'tests', '__tests__', 'e2e', 'spec', 'specs']) {
    const abs = path.join(root, dir)
    if (await pathExists(abs)) candidateRoots.push(abs)
  }
  const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.py', '.go', '.rs'])

  for (const start of candidateRoots) {
    await walkTests(start, root, exts, annotationPattern, definedAcIds, findings)
  }
  return findings
}

async function walkTests(dir, projectRoot, exts, pattern, defined, findings) {
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
      await walkTests(full, projectRoot, exts, pattern, defined, findings)
      continue
    }
    if (!entry.isFile()) continue
    if (!exts.has(path.extname(entry.name).toLowerCase())) continue
    let content
    try {
      content = await readFile(full, 'utf8')
    } catch {
      continue
    }
    const seen = new Set()
    for (const m of content.matchAll(pattern)) {
      const id = `AC-${m[1]}`
      if (defined.has(id)) continue
      if (seen.has(id)) continue
      seen.add(id)
      findings.push(makeFinding({
        level: 'WARNING',
        kind: 'orphan-test-annotation',
        file: path.relative(projectRoot, full),
        message: `Test references ${id} but no spec defines it`,
        fix: `Either add ${id} to the relevant spec, fix the annotation if the AC was renumbered, or delete it if the test no longer maps to documented behavior.`,
      }))
    }
  }
}

// =============================================================================
// helpers
// =============================================================================
function stripFencedCode(content) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const out = []
  let fence = null
  for (const line of lines) {
    const m = line.match(/^\s*(`{3,}|~{3,})/)
    if (!fence && m) {
      fence = { marker: m[1][0], len: m[1].length }
      out.push('')
      continue
    }
    if (fence) {
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/)
      if (close && close[1][0] === fence.marker && close[1].length >= fence.len) {
        fence = null
      }
      out.push('')
      continue
    }
    out.push(line)
  }
  return out.join('\n')
}
