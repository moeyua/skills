#!/usr/bin/env node
/**
 * Forbid UI / implementation literals inside spec files.
 *
 * Specs describe behavior. UI details (colors, pixels, Tailwind classes)
 * belong in DESIGN.md; implementation paths (function names, file:line refs)
 * are choices that change without changing observable behavior. Either
 * leaking into a spec is a boundary error — caught here as ERROR, not
 * judgment, because the boundary is project policy, not aesthetic taste.
 *
 * Usage:
 *   node scripts/check-literals.mjs --root <project-root> [--json] [--rules <path>]
 *
 * Project override: drop a JSON file at `docs/.spec-dev/literals.json` to
 * extend or replace the defaults. Format:
 *   {
 *     "extends": "default" | "none",
 *     "rules": [
 *       { "id": "...", "pattern": "regex", "level": "ERROR"|"WARNING",
 *         "message": "...", "fix": "..." }
 *     ]
 *   }
 *
 * Exit codes: 0=clean, 1=ERROR found, 2=internal failure.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathExists, walkMarkdown } from './lib/walk.mjs'
import { makeFinding, parseArgs, printHuman, printJson, summarize } from './lib/report.mjs'
import { Spec } from './schema/index.mjs'

const isSpecFile = Spec.isSpecFile

const DEFAULT_RULES = [
  // ---------- UI literals (belong in DESIGN.md, not in specs) ----------
  {
    id: 'ui-color-function',
    pattern: '\\b(oklch|oklab|lab|lch|hsl|hsla|rgb|rgba|color)\\s*\\(',
    level: 'ERROR',
    message: 'UI color function in spec — belongs in DESIGN.md',
    fix: 'Reference the design token by name (e.g. "primary brand color") instead of the literal color value.',
  },
  {
    id: 'ui-hex-color',
    pattern: '#[0-9a-fA-F]{3,8}\\b',
    level: 'ERROR',
    message: 'UI hex color literal in spec — belongs in DESIGN.md',
    fix: 'Reference the design token by name; hex values live in DESIGN.md tokens.',
  },
  {
    id: 'ui-length-unit',
    pattern: '\\b\\d+(?:\\.\\d+)?(px|rem|em|vh|vw|pt)\\b',
    level: 'ERROR',
    message: 'UI length unit in spec — pixel-perfect specs belong in DESIGN.md',
    fix: 'Replace with behavioral phrasing (e.g. "compact density" not "8px gap"); precise values live in DESIGN.md.',
  },
  {
    id: 'ui-tailwind-utility',
    pattern: '(?<![\\w-])(?:m[xytrbl]?|p[xytrbl]?|gap|space-[xy]|w|h|min-[wh]|max-[wh]|text|bg|border|rounded|shadow|leading|tracking|flex|grid|col-span|row-span|inset|top|right|bottom|left|z|opacity)-(?:\\[[^\\]]+\\]|[a-z0-9.]+)\\b',
    level: 'ERROR',
    message: 'Tailwind utility class in spec — implementation detail, not behavior',
    fix: 'Describe the behavior (e.g. "card has elevated state on hover") rather than the class name.',
  },
  {
    id: 'ui-css-property',
    pattern: '\\b(box-shadow|border-radius|transform|transition|filter|backdrop-filter|cursor)\\s*:',
    level: 'ERROR',
    message: 'CSS property declaration in spec — implementation detail',
    fix: 'Describe the user-visible effect, not the CSS that produces it.',
  },
  {
    id: 'ui-css-function',
    pattern: '\\b(clamp|calc|min|max|var)\\s*\\(',
    level: 'WARNING',
    message: 'CSS function in spec — usually an implementation detail',
    fix: 'If this is describing behavior (e.g. "value is clamped between X and Y"), prefer plain language. CSS functions belong in DESIGN.md / code.',
  },

  // ---------- Implementation literals (belong in code, not in specs) ----------
  // NOTE: bare function-call shapes like `foo(bar)` are NOT in this list. In
  // practice specs reference function names inside inline code (`foo()`) for
  // legitimate reasons — TDD pointers, Public API tables, cross-references.
  // The signal-to-noise ratio of a "looks like a call" rule is too low to
  // earn a place here. Use `impl-file-line-ref` and `impl-class-keyword`
  // instead — those are precise enough to be ERRORs.
  {
    id: 'impl-file-line-ref',
    pattern: '\\b[\\w-]+\\.(?:ts|tsx|js|jsx|mjs|cjs|vue|svelte|py|go|rs|java|kt|swift|cs|cpp|c|h|rb)\\s*:\\s*\\d+',
    level: 'ERROR',
    message: 'Implementation file:line reference in spec',
    fix: 'Specs describe behavior. Source file references belong in module contracts (Public API table) or test pointers, not in AC text.',
  },
  {
    id: 'impl-class-keyword',
    pattern: '\\b(?:class|interface|enum|struct)\\s+[A-Z][\\w]*\\b',
    level: 'ERROR',
    message: 'Type / class declaration syntax in spec',
    fix: 'Specs describe behavior, not type hierarchies. Move to module contract or remove.',
  },
]

const args = parseArgs(process.argv.slice(2))
const root = path.resolve(args.root || '.')
const json = args.json === true
const rulesArgPath = args.rules ? path.resolve(args.rules) : null

try {
  const rules = await loadRules(root, rulesArgPath)
  const compiledRules = rules.map(r => ({ ...r, regex: new RegExp(r.pattern, 'g') }))
  const files = (await walkMarkdown(root)).filter(rel => isSpecFile(rel))

  const findings = []
  for (const rel of files) {
    const abs = path.join(root, rel)
    const content = await readFile(abs, 'utf8')
    const stripped = stripFencedCode(content)
    const lines = stripped.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue

      // Skip markdown links — paths inside [text](path) are valid references
      const sanitized = line.replaceAll(/\[[^\]]+\]\([^)]+\)/g, '')

      for (const rule of compiledRules) {
        rule.regex.lastIndex = 0
        const matches = sanitized.matchAll(rule.regex)
        for (const match of matches) {
          findings.push(makeFinding({
            level: rule.level,
            kind: rule.id,
            file: rel,
            line: i + 1,
            message: rule.message,
            context: `${line.trim().slice(0, 120)}  →  matched: \`${match[0]}\``,
            fix: rule.fix,
          }))
        }
      }
    }
  }

  const summary = summarize(findings, {
    checks_run: ['literals'],
    files_scanned: files.length,
    rules_active: compiledRules.length,
  })
  const meta = { tool: 'spec-dev/check-literals', root }

  if (json) printJson(meta, findings, summary)
  else printHuman('spec-dev check-literals', findings, summary)

  process.exit(summary.errors > 0 ? 1 : 0)
} catch (err) {
  console.error(`spec-dev check-literals failed: ${err.message}`)
  if (err.stack) console.error(err.stack)
  process.exit(2)
}

// =============================================================================
// helpers
// =============================================================================

async function loadRules(root, override) {
  const projectPath = override || path.join(root, 'docs', '.spec-dev', 'literals.json')
  if (!(await pathExists(projectPath))) return DEFAULT_RULES

  const raw = await readFile(projectPath, 'utf8')
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    throw new Error(`failed to parse ${projectPath}: ${err.message}`)
  }

  const projectRules = Array.isArray(parsed.rules) ? parsed.rules : []
  if (parsed.extends === 'none') return projectRules
  // default behavior: extend the defaults
  return [...DEFAULT_RULES, ...projectRules]
}

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
