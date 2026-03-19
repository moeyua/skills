export interface VendorSkillMeta {
  official?: boolean
  source: string
  skills: Record<string, string>
}

/**
 * Type 1: OSS repos to generate skills from (git submodules in sources/)
 * Key is the submodule directory name, value is the git URL
 */
export const submodules: Record<string, string> = {
  // Example:
  // vue: 'https://github.com/vuejs/docs',
  // vite: 'https://github.com/vitejs/vite',
  'vue-flow': 'https://github.com/bcakmakoglu/vue-flow',
}

/**
 * Type 2: Projects that already have skills (git submodules in vendor/)
 * These are synced directly into skills/
 */
export const vendors: Record<string, VendorSkillMeta> = {
  // Example:
  // 'antfu': {
  //   source: 'https://github.com/antfu/skills',
  //   skills: {
  //     antfu: 'antfu',
  //     vue: 'vue',
  //   },
  // },
}

/**
 * Type 3: Manually written skills (directly in skills/)
 */
export const manual = [
  'dev-flow',
  'doc-system',
  'moeyua',
  'skill-recommender',
]
