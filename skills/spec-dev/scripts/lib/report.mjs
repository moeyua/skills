const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

const colorize = process.stdout.isTTY
  ? (color, str) => `${COLORS[color] || ''}${str}${COLORS.reset}`
  : (_color, str) => str

export function makeFinding({ level, kind, file, line, message, context, fix }) {
  return { level, kind, file, line, message, context, fix }
}

export function summarize(findings, meta = {}) {
  const errors = findings.filter(f => f.level === 'ERROR').length
  const warnings = findings.filter(f => f.level === 'WARNING').length
  const info = findings.filter(f => f.level === 'INFO').length
  return { ...meta, errors, warnings, info }
}

export function printHuman(title, findings, summary) {
  const lines = []
  lines.push(colorize('bold', title))
  lines.push(colorize('gray', '='.repeat(title.length)))
  if (summary.checks_run) lines.push(`Checks: ${summary.checks_run.join(', ')}`)
  if (summary.files_scanned !== undefined) lines.push(`Files scanned: ${summary.files_scanned}`)
  lines.push(
    `${colorize('red', `Errors: ${summary.errors}`)}  `
      + `${colorize('yellow', `Warnings: ${summary.warnings}`)}  `
      + `${colorize('cyan', `Info: ${summary.info}`)}`,
  )
  lines.push('')

  if (findings.length === 0) {
    lines.push(colorize('green', '✓ All checks passed.'))
    process.stdout.write(`${lines.join('\n')}\n`)
    return
  }

  const grouped = groupByFile(findings)
  for (const [file, items] of grouped) {
    lines.push(colorize('bold', file))
    for (const item of items) {
      const levelColor = item.level === 'ERROR' ? 'red' : item.level === 'WARNING' ? 'yellow' : 'cyan'
      const loc = item.line ? colorize('gray', `L${item.line}`) : colorize('gray', '   ')
      lines.push(
        `  ${colorize(levelColor, item.level.padEnd(7))} ${loc}  ${colorize('dim', `[${item.kind}]`)} ${item.message}`,
      )
      if (item.context) lines.push(`    ${colorize('gray', '› ')}${colorize('dim', item.context)}`)
      if (item.fix) lines.push(`    ${colorize('green', 'fix:')} ${item.fix}`)
    }
    lines.push('')
  }

  process.stdout.write(`${lines.join('\n')}\n`)
}

export function printJson(meta, findings, summary) {
  process.stdout.write(`${JSON.stringify({ meta, summary, findings }, null, 2)}\n`)
}

function groupByFile(findings) {
  const map = new Map()
  for (const f of findings) {
    const key = f.file || '(no file)'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(f)
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.line || 0) - (b.line || 0))
  }
  return map
}

export function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const eq = arg.indexOf('=')
    if (eq > -1) {
      out[arg.slice(2, eq)] = arg.slice(eq + 1)
    } else {
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        out[arg.slice(2)] = next
        i++
      } else {
        out[arg.slice(2)] = true
      }
    }
  }
  return out
}
