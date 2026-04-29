/**
 * Aggregate schema export — single import point for the audit script.
 */

import * as Spec from './spec.schema.mjs'
import * as ModuleContract from './module.schema.mjs'
import * as Adr from './adr.schema.mjs'

export { Adr, ModuleContract, Spec }

/**
 * The full doc-type catalog, used by section-presence and similar broad checks.
 * Order matters only for first-match — each rel path matches at most one type.
 */
export const DOC_TYPES = [
  { type: 'spec', match: Spec.isSpecFile, requiredSections: Spec.REQUIRED_SECTIONS },
  { type: 'module contract', match: ModuleContract.isModuleFile, requiredSections: ModuleContract.REQUIRED_SECTIONS },
  { type: 'ADR', match: Adr.isAdrFile, requiredSections: Adr.REQUIRED_SECTIONS },
]
