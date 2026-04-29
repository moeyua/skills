import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_IGNORE = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.output',
  'coverage',
  '.turbo',
  '.cache',
])

export async function walkMarkdown(root, { ignore = DEFAULT_IGNORE } = {}) {
  const out = []
  await walk(root, root, ignore, out)
  return out
}

async function walk(start, dir, ignore, out) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (ignore.has(entry.name)) continue
    if (entry.name.startsWith('.') && entry.name !== '.spec-dev') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(start, full, ignore, out)
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      out.push(path.relative(start, full))
    }
  }
}

export async function pathExists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}
