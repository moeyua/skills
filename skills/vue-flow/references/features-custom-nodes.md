---
name: features-custom-nodes
description: Creating custom Vue Flow node components — template slots, nodeTypes, props injection, TypeScript
---

# Custom Nodes

Custom nodes let you render any Vue component inside a node. There are three ways to register them, tried in order:

1. **`nodeTypes` object** on `<VueFlow>` or `useVueFlow`
2. **Global component registration** as `Vue Flow-{type}`
3. **Template slots** using `#node-{type}`

## Method 1: Template Slots (simplest)

```vue
<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'
import { ref } from 'vue'

const nodes = ref<Node[]>([
  { id: '1', type: 'special', position: { x: 0, y: 0 }, data: { title: 'Custom!', emoji: '🎯' } },
])
</script>

<template>
  <VueFlow v-model:nodes="nodes">
    <template #node-special="{ data }">
      <div class="special-node">
        <span>{{ data.emoji }}</span>
        <strong>{{ data.title }}</strong>
      </div>
    </template>
  </VueFlow>
</template>
```

The slot receives all node props: `id`, `type`, `data`, `selected`, `connectable`, `position`, `dragging`, `dimensions`, `zIndex`, etc.

## Method 2: nodeTypes Object (recommended for reuse)

```vue
<script setup lang="ts">
import { markRaw } from 'vue'
import { VueFlow } from '@vue-flow/core'
import ProcessNode from './ProcessNode.vue'

const nodeTypes = {
  process: markRaw(ProcessNode),
}
</script>

<template>
  <VueFlow :node-types="nodeTypes" />
</template>
```

**Important:** Wrap components with `markRaw()` to avoid Vue reactivity warnings.

## Custom Node Component

A custom node component receives all node props automatically:

```vue
<!-- ProcessNode.vue -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  id: string
  data: {
    label: string
    status: 'pending' | 'running' | 'done'
  }
  selected: boolean
  connectable: boolean
}

defineProps<Props>()
</script>

<template>
  <Handle type="target" :position="Position.Top" />

  <div :class="['process-node', data.status]">
    <div class="label">{{ data.label }}</div>
    <div class="status">{{ data.status }}</div>
  </div>

  <Handle type="source" :position="Position.Bottom" />
</template>

<style scoped>
.process-node {
  padding: 10px 20px;
  border-radius: 8px;
  background: white;
  border: 2px solid #1a192b;
}
.process-node.running { border-color: #ff9900; }
.process-node.done { border-color: #00cc66; }
</style>
```

## Key Points for Custom Nodes

- You **must** include `<Handle>` components for connection points
- Interactive elements (inputs, selects, buttons) need the `nodrag` class to prevent drag:
  ```vue
  <input class="nodrag" type="text" v-model="localValue" />
  ```
- Scrollable containers need the `nowheel` class:
  ```vue
  <div class="nowheel" style="overflow: auto; max-height: 200px">...</div>
  ```
- Custom node CSS class: `.vue-flow__node-{type}`

## Updating Data from Inside

Use the `useNode` composable:

```vue
<script setup lang="ts">
import { useNode } from '@vue-flow/core'

const { node } = useNode()

function toggleStatus() {
  node.data.status = node.data.status === 'done' ? 'pending' : 'done'
}
</script>
```

## TypeScript: Typed Custom Nodes

```ts
import type { Node } from '@vue-flow/core'

interface TaskData {
  label: string
  priority: 'low' | 'medium' | 'high'
}

type TaskNode = Node<TaskData, {}, 'task'>

const nodes: TaskNode[] = [
  {
    id: '1',
    type: 'task',
    position: { x: 0, y: 0 },
    data: { label: 'Review PR', priority: 'high' },
  },
]
```

<!-- Source: docs/src/guide/node.md (custom nodes section), docs/src/guide/getting-started.md -->
