/**
 * Schema for module contract files (`docs/modules/*.md`).
 */

export const REQUIRED_SECTIONS = [
  { keys: ['public api', '公共 api', '对外 api', '对外接口'], label: 'Public API' },
  { keys: ['invariants', '不变量'], label: 'Invariants' },
  { keys: ['does not own', 'boundary', '边界', '不负责'], label: 'Boundary (Does NOT own)' },
  { keys: ['error scenarios', '错误场景', '异常'], label: 'Error Scenarios' },
]

/** Header keyword used to find the Public API section for drift detection. */
export const PUBLIC_API_HEADER_KEY = 'public api'

/** Returns true if the rel path looks like a module contract file. */
export function isModuleFile(rel) {
  const norm = rel.replaceAll('\\', '/').toLowerCase()
  return norm.includes('docs/modules/') && !norm.endsWith('readme.md')
}
