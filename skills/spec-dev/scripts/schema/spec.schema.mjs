/**
 * Schema for feature spec files (`docs/specs/*.md`).
 *
 * Declarative; no validator library. The audit script reads these constants
 * to drive its checks. If you need to tighten or relax a rule, this is the
 * one place to edit.
 */

/**
 * AC line shape: `- [x] AC-NN ...` (states: space, x, ~).
 * Anything else on a line that mentions an AC id is malformed.
 */
export const AC_LINE_PATTERN = /^\s*-\s*\[([x~ ])\]\s*(?:\*\*)?AC-(\d{1,3}[a-z]?)\b\s*\*?\*?\s*(.*)$/

/** Loose AC token finder — used to detect "this line mentions AC-NN at all". */
export const AC_TOKEN_PATTERN = /AC-\d{1,3}[a-z]?\b/

/** Validates a fully-formed AC line. */
export const AC_VALID_LINE_PATTERN = /^\s*-\s*\[([x~ ])\]\s*(?:\*\*)?AC-(\d{1,3}[a-z]?)\b/

/**
 * Required sections in a spec file. Each entry has a list of acceptable
 * header keywords (case-insensitive `includes` match against H2/H3 text).
 */
export const REQUIRED_SECTIONS = [
  { keys: ['goal', '目标'], label: 'Goal' },
  { keys: ['acceptance criteria', '验收标准', 'ac'], label: 'Acceptance Criteria' },
  { keys: ['out of scope', '不在范围', 'non-goals', '非目标'], label: 'Out of Scope' },
]

/** Three-state AC state vocabulary. */
export const VALID_AC_STATES = new Set([' ', 'x', '~'])

/** Returns true if the rel path looks like a feature spec file. */
export function isSpecFile(rel) {
  const norm = rel.replaceAll('\\', '/').toLowerCase()
  return norm.includes('docs/specs/') && !norm.endsWith('readme.md')
}
