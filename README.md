# @moeyua/skills

Personal skills for AI coding assistants.

Inspired by [antfu/skills](https://github.com/antfu/skills).

## Usage

```bash
# Install all skills globally
pnpx skills add moeyua/skills --skill='*' -g

# Install a specific skill
pnpx skills add moeyua/skills --skill=moeyua -g
```

## Structure

Skills come from three sources:

- **Manual** (`skills/`) - Hand-written skills
- **Generated** (`sources/` → `skills/`) - Generated from OSS documentation
- **Synced** (`vendor/` → `skills/`) - Synced from projects that already have skills

## Development

```bash
pnpm install

# Initialize git submodules
pnpm start init

# Sync vendor skills
pnpm start sync

# Check for updates
pnpm start check

# Remove unlisted submodules/skills
pnpm start cleanup
```

## License

[MIT](./LICENSE.md)
