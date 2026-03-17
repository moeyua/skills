import { execSync } from 'node:child_process'
import { cpSync, existsSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { createInterface } from 'node:readline'
import { manual, submodules, vendors } from '../meta.ts'

const root = resolve(import.meta.dirname, '..')
const skipPrompt = process.argv.includes('-y')

function run(cmd: string, cwd = root) {
  console.log(`$ ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

function confirm(message: string): Promise<boolean> {
  if (skipPrompt)
    return Promise.resolve(true)
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise<boolean>((resolve) => {
    rl.question(`${message} (y/N) `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

async function init() {
  console.log('Initializing submodules...')

  for (const [name, url] of Object.entries(submodules)) {
    const dir = resolve(root, 'sources', name)
    if (!existsSync(dir)) {
      console.log(`\nAdding source submodule: ${name}`)
      run(`git submodule add ${url} sources/${name}`)
    }
    else {
      console.log(`Source submodule already exists: ${name}`)
    }
  }

  for (const [name, meta] of Object.entries(vendors)) {
    const dir = resolve(root, 'vendor', name)
    if (!existsSync(dir)) {
      console.log(`\nAdding vendor submodule: ${name}`)
      run(`git submodule add ${meta.source} vendor/${name}`)
    }
    else {
      console.log(`Vendor submodule already exists: ${name}`)
    }
  }

  run('git submodule update --init --recursive')
  console.log('\nDone!')
}

async function sync() {
  console.log('Syncing vendor skills...')

  // Update submodules first
  run('git submodule update --remote --merge')

  for (const [name, meta] of Object.entries(vendors)) {
    const vendorDir = resolve(root, 'vendor', name)
    if (!existsSync(vendorDir)) {
      console.log(`Vendor directory not found: ${name}, run 'init' first`)
      continue
    }

    for (const [sourceSkill, outputSkill] of Object.entries(meta.skills)) {
      const sourceDir = resolve(vendorDir, 'skills', sourceSkill)
      const targetDir = resolve(root, 'skills', outputSkill)

      if (!existsSync(sourceDir)) {
        console.log(`Source skill not found: ${sourceDir}`)
        continue
      }

      console.log(`Syncing: ${name}/${sourceSkill} -> skills/${outputSkill}`)

      // Clean target and copy
      if (existsSync(targetDir))
        rmSync(targetDir, { recursive: true })
      cpSync(sourceDir, targetDir, { recursive: true })

      // Get git SHA
      const sha = execSync('git rev-parse HEAD', { cwd: vendorDir }).toString().trim()
      const date = new Date().toISOString().split('T')[0]

      // Write SYNC.md
      writeFileSync(resolve(targetDir, 'SYNC.md'), `# Sync Info

- **Source:** \`vendor/${name}/skills/${sourceSkill}\`
- **Git SHA:** \`${sha}\`
- **Synced:** ${date}
`)
    }
  }

  console.log('\nDone!')
}

async function check() {
  console.log('Checking for updates...\n')

  for (const [name] of Object.entries(submodules)) {
    const dir = resolve(root, 'sources', name)
    if (!existsSync(dir))
      continue
    const local = execSync('git rev-parse HEAD', { cwd: dir }).toString().trim()
    const remote = execSync('git rev-parse origin/HEAD', { cwd: dir }).toString().trim().replace(/^[^\n]*\n?/, '')
    if (local !== remote) {
      console.log(`[update available] sources/${name}`)
    }
    else {
      console.log(`[up to date] sources/${name}`)
    }
  }

  for (const [name] of Object.entries(vendors)) {
    const dir = resolve(root, 'vendor', name)
    if (!existsSync(dir))
      continue
    try {
      execSync('git fetch', { cwd: dir, stdio: 'ignore' })
      const local = execSync('git rev-parse HEAD', { cwd: dir }).toString().trim()
      const remote = execSync('git rev-parse FETCH_HEAD', { cwd: dir }).toString().trim()
      if (local !== remote) {
        console.log(`[update available] vendor/${name}`)
      }
      else {
        console.log(`[up to date] vendor/${name}`)
      }
    }
    catch {
      console.log(`[error checking] vendor/${name}`)
    }
  }
}

async function cleanup() {
  const skillsDir = resolve(root, 'skills')
  const sourcesDir = resolve(root, 'sources')
  const vendorDir = resolve(root, 'vendor')

  // Collect all known skill names
  const knownSkills = new Set<string>([
    ...manual,
    ...Object.keys(submodules),
    ...Object.values(vendors).flatMap(v => Object.values(v.skills)),
  ])

  // Check for unknown skills
  if (existsSync(skillsDir)) {
    for (const entry of readdirSync(skillsDir)) {
      if (!knownSkills.has(entry)) {
        if (await confirm(`Remove unknown skill: skills/${entry}?`)) {
          rmSync(resolve(skillsDir, entry), { recursive: true })
          console.log(`Removed: skills/${entry}`)
        }
      }
    }
  }

  // Check for unknown sources
  if (existsSync(sourcesDir)) {
    for (const entry of readdirSync(sourcesDir)) {
      if (!(entry in submodules)) {
        if (await confirm(`Remove unknown source: sources/${entry}?`)) {
          run(`git submodule deinit -f sources/${entry}`)
          run(`git rm -f sources/${entry}`)
          console.log(`Removed: sources/${entry}`)
        }
      }
    }
  }

  // Check for unknown vendors
  if (existsSync(vendorDir)) {
    for (const entry of readdirSync(vendorDir)) {
      if (!(entry in vendors)) {
        if (await confirm(`Remove unknown vendor: vendor/${entry}?`)) {
          run(`git submodule deinit -f vendor/${entry}`)
          run(`git rm -f vendor/${entry}`)
          console.log(`Removed: vendor/${entry}`)
        }
      }
    }
  }

  console.log('\nCleanup done!')
}

// Main
const command = process.argv[2]

switch (command) {
  case 'init':
    await init()
    break
  case 'sync':
    await sync()
    break
  case 'check':
    await check()
    break
  case 'cleanup':
    await cleanup()
    break
  default:
    console.log(`
Usage: pnpm start <command> [-y]

Commands:
  init      Initialize git submodules
  sync      Update submodules and sync vendor skills
  check     Check for available updates
  cleanup   Remove submodules/skills not defined in meta.ts

Options:
  -y        Skip confirmation prompts
`)
}
