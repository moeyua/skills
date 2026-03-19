---
name: vue-flow
description: Vue Flow — the standard Vue 3 library for building node-based editors, interactive flowcharts, workflow diagrams, and graph UIs with @vue-flow/core. Use this skill whenever the user is working with Vue Flow, mentions @vue-flow/core or vueflow, builds any kind of node/edge graph in Vue, creates custom nodes or edges, implements drag-and-drop flow editors, designs data pipeline or mind map interfaces, asks about graph layout or node connections in Vue, or imports VueFlow, useVueFlow, Handle, or related APIs. Also use when the user needs help with flowchart interactions (zoom, pan, selection), edge path rendering, graph state management, or anything involving node-based visual programming in Vue 3.
metadata:
  author: Moeyua
  version: "2026.3.18"
  source: https://github.com/bcakmakoglu/vue-flow
---

## Quick Start

```bash
pnpm add @vue-flow/core
```

Two CSS imports are mandatory — structural styles and the default theme:

```ts
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
```

Minimal flow:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import type { Edge, Node } from '@vue-flow/core'

const nodes = ref<Node[]>([
  { id: '1', type: 'input', position: { x: 250, y: 5 }, data: { label: 'Start' } },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'Process' } },
  { id: '3', type: 'output', position: { x: 400, y: 200 }, data: { label: 'End' } },
])

const edges = ref<Edge[]>([
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
])
</script>

<template>
  <div style="width: 100vw; height: 100vh">
    <VueFlow v-model:nodes="nodes" v-model:edges="edges" fit-view-on-init />
  </div>
</template>
```

**Critical:** The `<VueFlow>` parent container must have explicit width and height — nothing renders without dimensions.

## Key Concepts

- Every node/edge needs a unique `id`
- Nodes require `position: { x, y }` for placement
- Edges connect nodes via `source` and `target` (node IDs)
- Use `v-model:nodes` and `v-model:edges` for two-way state binding
- Custom components registered via `nodeTypes`/`edgeTypes` must be wrapped in `markRaw()` to avoid Vue reactivity warnings
- VueFlow slots follow `#node-{type}` and `#edge-{type}` naming for custom rendering

---

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Getting Started | Installation, prerequisites, node/edge types, TypeScript setup | [core-getting-started](references/core-getting-started.md) |
| Nodes | Node CRUD, props, events, predefined types, styling, `.nodrag`/`.nowheel` | [core-nodes](references/core-nodes.md) |
| Edges | Edge CRUD, props, events, BaseEdge, EdgeLabelRenderer | [core-edges](references/core-edges.md) |
| Handles | Handle positions, multiple handles, connection limits, dynamic handles | [core-handles](references/core-handles.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| Custom Nodes | Custom node components, 3 registration methods, useNode, TypeScript | [features-custom-nodes](references/features-custom-nodes.md) |
| Custom Edges | Custom edge components, path helpers, EdgeLabelRenderer, useEdge | [features-custom-edges](references/features-custom-edges.md) |
| Composables | useVueFlow, useNode, useEdge, useHandleConnections, useNodesData, useHandle | [features-composables](references/features-composables.md) |
| Events | Node/edge/connection/pane/viewport events via component and composable | [features-events](references/features-events.md) |
| Slots & Plugin Components | VueFlow slots, Background, Controls, MiniMap, NodeResizer, NodeToolbar | [features-components](references/features-components.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| Configuration | All VueFlow props — viewport, selection, snapping, zoom, pan, keys | [advanced-config](references/advanced-config.md) |
| State & Controlled Flow | Controlled mode, v-model, change types, validation, applyChanges | [advanced-state](references/advanced-state.md) |
| Theming | CSS variables, class selectors, dark mode, per-element styling | [advanced-theming](references/advanced-theming.md) |
| Utilities | Edge path functions, graph traversal, viewport methods, serialization | [advanced-utilities](references/advanced-utilities.md) |

## Best Practices

| Topic | Description | Reference |
|-------|-------------|-----------|
| Patterns & Troubleshooting | Save/restore, layout, performance, error handling, common errors | [best-practices-patterns](references/best-practices-patterns.md) |
