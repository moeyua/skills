/**
 * Schema for ADR / decision files (`docs/decisions/*.md` or `docs/adr/*.md`).
 */

export const REQUIRED_SECTIONS = [
  { keys: ['status', '状态'], label: 'Status' },
  { keys: ['context', '背景'], label: 'Context' },
  { keys: ['decision', '决策'], label: 'Decision' },
  { keys: ['consequences', '影响', '后果'], label: 'Consequences' },
]

/** Returns true if the rel path looks like an ADR. */
export function isAdrFile(rel) {
  const norm = rel.replaceAll('\\', '/').toLowerCase()
  return (norm.includes('docs/decisions/') || norm.includes('docs/adr/')) && !norm.endsWith('readme.md')
}
