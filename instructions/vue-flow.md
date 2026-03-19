# Vue Flow Skill Generation Instructions

## Source

- **Repository:** https://github.com/bcakmakoglu/vue-flow
- **Docs path:** `docs/src/guide/` and `docs/src/typedocs/`
- **Website:** https://vueflow.dev

## Scope

Generate a comprehensive skill covering all major aspects of Vue Flow — a highly customizable Vue 3 component for building node-based editors and interactive flowcharts.

## Target Audience

Vue 3 developers building node-based UIs: workflow editors, diagram tools, data pipelines, mind maps, etc.

## Reference File Plan

### Core

| File | Source docs | Covers |
|------|-----------|--------|
| `core-getting-started.md` | `guide/getting-started.md`, `guide/index.md` | Installation, basic setup, first flow |
| `core-nodes.md` | `guide/node.md` | Node types, node props, programmatic nodes, node updates |
| `core-edges.md` | `guide/edge.md` | Edge types, edge props, edge labels, programmatic edges |
| `core-handles.md` | `guide/handle.md` | Handle component, handle positions, dynamic handles, validation |

### Features

| File | Source docs | Covers |
|------|-----------|--------|
| `features-custom-nodes.md` | `guide/node.md` (custom section) | Custom node components, template slots, node props injection |
| `features-custom-edges.md` | `guide/edge.md` (custom section) | Custom edge components, edge paths, edge labels |
| `features-composables.md` | `guide/composables.md` | `useVueFlow`, `useNodesState`, `useEdgesState`, other composables |
| `features-events.md` | `guide/vue-flow/events.md` | All events: node, edge, connection, pane, interaction events |
| `features-components.md` | `guide/components/` | Background, Controls, MiniMap, NodeResizer, NodeToolbar |

### Advanced

| File | Source docs | Covers |
|------|-----------|--------|
| `advanced-config.md` | `guide/vue-flow/config.md` | VueFlow props, viewport config, behavior options |
| `advanced-state.md` | `guide/vue-flow/state.md`, `guide/controlled-flow.md` | State management, controlled vs uncontrolled, v-model |
| `advanced-theming.md` | `guide/theming.md` | CSS variables, class overrides, dark mode |
| `advanced-utilities.md` | `guide/utils/` | Edge utils, graph utils, instance methods |

### Best Practices

| File | Source docs | Covers |
|------|-----------|--------|
| `best-practices-patterns.md` | cross-cutting | Common patterns, performance tips, layout integration, troubleshooting |

## Constraints

1. **Vue 3 Composition API only** — all examples must use `<script setup lang="ts">` syntax
2. **TypeScript first** — include type annotations in all code examples
3. **Practical focus** — prioritize runnable code snippets over API tables
4. **One concept per file** — each reference file covers a single cohesive topic
5. **Rewrite for agents** — restructure docs for AI consumption, don't copy verbatim
6. **Source attribution** — include source doc links in HTML comments at end of each file
7. **Latest stable version** — target the current stable release of Vue Flow
