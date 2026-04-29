/**
 * Lightweight markdown / source parsers used across the script layer.
 *
 * Pure regex; no AST. Trades occasional false positives for zero deps.
 */

import { readFile } from 'node:fs/promises'

/**
 * Strip fenced code blocks while preserving line numbers (replace with blank).
 */
export function stripFencedCode(content) {
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

/**
 * Find the line range of a section by header text (case-insensitive `includes`).
 * Returns [startLineIdx, endLineIdx) or null if not found.
 *
 * `level` filters by heading depth (2 = ##, 3 = ###). Pass `null` to accept any.
 */
export function findSectionRange(lines, headerKey, level = null) {
  const headerPattern = /^(#{1,6})\s+(.+?)\s*$/
  let start = -1
  let startLevel = -1
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(headerPattern)
    if (!m) continue
    const depth = m[1].length
    const text = m[2].toLowerCase()
    if (start === -1) {
      if ((level === null || depth === level) && text.includes(headerKey.toLowerCase())) {
        start = i
        startLevel = depth
      }
      continue
    }
    if (depth <= startLevel) {
      return [start, i]
    }
  }
  if (start === -1) return null
  return [start, lines.length]
}

/**
 * Extract markdown table rows under a header. Returns [{cols: [...]}]. The header row
 * (e.g. `| Export | Purpose |`) is included as the first item; the separator row
 * (e.g. `|---|---|`) is dropped.
 */
export function extractTableRows(lines, [start, end]) {
  const rows = []
  for (let i = start; i < end; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('|') || !line.endsWith('|')) continue
    if (/^\|\s*[-:]+\s*(\|\s*[-:]+\s*)+\|$/.test(line)) continue
    const cols = line
      .slice(1, -1)
      .split('|')
      .map(c => c.trim())
    rows.push({ cols, line: i + 1 })
  }
  return rows
}

/**
 * Extract inline-code identifiers from a span of lines: `foo` → "foo".
 */
export function extractInlineIdentifiers(text) {
  const out = []
  for (const match of text.matchAll(/`([A-Za-z_$][\w$]*)`/g)) {
    out.push(match[1])
  }
  return out
}

/**
 * Extract source file paths in inline code or markdown link form, restricted
 * to common code extensions.
 */
const SOURCE_EXTS = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'vue', 'svelte', 'py', 'go', 'rs', 'rb', 'kt', 'swift', 'java']
const SOURCE_RE = new RegExp(`(?:[\\w./@-]+)\\.(?:${SOURCE_EXTS.join('|')})\\b`, 'g')
export function extractSourcePaths(text) {
  const found = new Set()
  for (const match of text.matchAll(SOURCE_RE)) found.add(match[0])
  return [...found]
}

/**
 * Read a source file and extract its top-level export names. Best-effort regex.
 *
 * Supports: TS/JS (`export const`, `export function`, `export class`, `export default`,
 * named re-exports `export { a, b }`); Vue SFC (`defineComponent`, `<script setup>`
 * exposes `defineExpose({ a, b })`); Python (`__all__`); Go (capitalized top-level
 * `func`, `type`, `var`, `const`); Rust (`pub fn`, `pub struct`, `pub mod`, `pub use`).
 */
export async function extractExports(absPath) {
  const ext = absPath.split('.').pop().toLowerCase()
  let content
  try {
    content = await readFile(absPath, 'utf8')
  } catch {
    return null
  }
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return extractTsExports(content)
    case 'vue':
      return extractVueExports(content)
    case 'svelte':
      return extractSvelteExports(content)
    case 'py':
      return extractPyExports(content)
    case 'go':
      return extractGoExports(content)
    case 'rs':
      return extractRustExports(content)
    default:
      return []
  }
}

function extractTsExports(content) {
  const names = new Set()
  const stripped = stripFencedCode(content) // no-op for non-md; keeps signature
  // export const|let|var|function|async function|class|interface|type|enum NAME
  for (const m of stripped.matchAll(/^\s*export\s+(?:default\s+)?(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm)) {
    names.add(m[1])
  }
  // export default <name> (only if a bare identifier)
  for (const m of stripped.matchAll(/^\s*export\s+default\s+([A-Za-z_$][\w$]*)\s*[;\n]/gm)) {
    names.add(m[1])
  }
  // export { a, b as c }
  for (const m of stripped.matchAll(/^\s*export\s*\{([^}]+)\}/gm)) {
    for (const part of m[1].split(',')) {
      const segs = part.trim().split(/\s+as\s+/)
      const final = segs[segs.length - 1].trim()
      if (final && /^[A-Za-z_$][\w$]*$/.test(final)) names.add(final)
    }
  }
  return [...names]
}

function extractVueExports(content) {
  const names = new Set(['default'])
  const exposeMatch = content.match(/defineExpose\s*\(\s*\{([^}]+)\}\s*\)/)
  if (exposeMatch) {
    for (const part of exposeMatch[1].split(',')) {
      const final = part.trim().split(':')[0].trim()
      if (final && /^[A-Za-z_$][\w$]*$/.test(final)) names.add(final)
    }
  }
  return [...names]
}

function extractSvelteExports(content) {
  const names = new Set(['default'])
  for (const m of content.matchAll(/export\s+(?:let|const|function)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1])
  }
  return [...names]
}

function extractPyExports(content) {
  const names = new Set()
  const allMatch = content.match(/__all__\s*=\s*\[([^\]]*)\]/)
  if (allMatch) {
    for (const m of allMatch[1].matchAll(/['"]([A-Za-z_][\w]*)['"]/g)) names.add(m[1])
    return [...names]
  }
  // Fallback: top-level def / class
  for (const m of content.matchAll(/^(?:def|class)\s+([A-Za-z_][\w]*)/gm)) {
    if (!m[1].startsWith('_')) names.add(m[1])
  }
  return [...names]
}

function extractGoExports(content) {
  const names = new Set()
  for (const m of content.matchAll(/^(?:func|type|var|const)\s+([A-Z][\w]*)/gm)) {
    names.add(m[1])
  }
  return [...names]
}

function extractRustExports(content) {
  const names = new Set()
  for (const m of content.matchAll(/^pub\s+(?:fn|struct|enum|trait|mod|use|const|static|type)\s+([A-Za-z_][\w]*)/gm)) {
    names.add(m[1])
  }
  return [...names]
}
