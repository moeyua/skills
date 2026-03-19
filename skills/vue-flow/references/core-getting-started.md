---
name: core-getting-started
description: Vue Flow installation, prerequisites, required styles, and first flow setup
---

# Getting Started

## Prerequisites

- Node.js v20+
- Vue 3.3+

## Installation

```bash
npm add @vue-flow/core
# or
pnpm add @vue-flow/core
```

## Required Styles

Both imports are mandatory — the first provides structural CSS, the second provides the default theme:

```ts
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
```

You can skip `theme-default.css` only if you provide all styling yourself.

## Core Concepts

- Every **node** and **edge** must have a unique `id`
- Nodes require an `position: { x, y }` for placement
- Edges connect nodes via `source` and `target` (node IDs)
- The `<VueFlow>` parent container **must** have explicit width and height

## Predefined Node Types

| Type | Description | Handles |
|------|-------------|---------|
| `input` | Starting point | Source (bottom) |
| `default` | Intermediate node | Target (top) + Source (bottom) |
| `output` | Ending point | Target (top) |

## Predefined Edge Types

| Type | Description |
|------|-------------|
| `default` | Bezier curve |
| `step` | Right-angle path |
| `smoothstep` | Rounded right-angle path |
| `straight` | Straight line |

## First Flow

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import type { Edge, Node } from '@vue-flow/core'

const nodes = ref<Node[]>([
  { id: '1', type: 'input', position: { x: 250, y: 5 }, data: { label: 'Input Node' } },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'Default Node' } },
  { id: '3', type: 'output', position: { x: 400, y: 200 }, data: { label: 'Output Node' } },
])

const edges = ref<Edge[]>([
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
])
</script>

<template>
  <div style="width: 100vw; height: 100vh">
    <VueFlow v-model:nodes="nodes" v-model:edges="edges" fit-view-on-init />
  </div>
</template>
```

## TypeScript Support

Vue Flow is fully written in TypeScript. Use the `Node` and `Edge` generic types with custom data:

```ts
import type { Node, Edge } from '@vue-flow/core'

interface ProcessData {
  label: string
  status: 'pending' | 'running' | 'done'
}

type ProcessNode = Node<ProcessData, {}, 'process'>
type ProcessEdge = Edge<{ weight: number }>
```

<!-- Source: docs/src/guide/getting-started.md, docs/src/guide/index.md -->
