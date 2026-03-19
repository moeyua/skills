---
name: core-nodes
description: Vue Flow nodes — types, adding/removing/updating, props, events, and styling
---

# Nodes

Nodes are the building blocks of a Vue Flow graph. Each node requires a unique `id` and an `position: { x, y }`.

## Adding Nodes

### Via prop binding

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Node } from '@vue-flow/core'

const nodes = ref<Node[]>([
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
])

function addNode() {
  nodes.value.push({
    id: `${nodes.value.length + 1}`,
    position: { x: Math.random() * 400, y: Math.random() * 400 },
    data: { label: `Node ${nodes.value.length + 1}` },
  })
}
</script>

<template>
  <VueFlow v-model:nodes="nodes" />
</template>
```

### Via useVueFlow

```ts
const { addNodes } = useVueFlow()

// Single node
addNodes({ id: '4', position: { x: 0, y: 0 }, data: { label: 'New' } })

// Multiple nodes
addNodes([
  { id: '5', position: { x: 0, y: 100 }, data: { label: 'A' } },
  { id: '6', position: { x: 200, y: 100 }, data: { label: 'B' } },
])
```

## Removing Nodes

```ts
const { removeNodes } = useVueFlow()

// By ID
removeNodes('1')

// Multiple
removeNodes(['1', '2'])

// Or filter the ref array
nodes.value = nodes.value.filter(n => n.id !== '1')
```

## Updating Node Data

```ts
const { updateNodeData, findNode, updateNode } = useVueFlow()

// Method 1: updateNodeData (merges with existing data)
updateNodeData('1', { label: 'Updated Label' })

// Method 2: Direct mutation via findNode
const node = findNode('1')
if (node) {
  node.data = { ...node.data, label: 'Updated' }
}

// Method 3: updateNode (update multiple properties)
updateNode('1', { position: { x: 100, y: 200 }, data: { label: 'Moved' } })
```

Inside a custom node component, use the `useNode` composable:

```vue
<script setup lang="ts">
import { useNode } from '@vue-flow/core'

const { node } = useNode()
node.data.label = 'Updated from inside'
</script>
```

## Node Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `position` | `{ x: number, y: number }` | Yes | XY coordinates |
| `type` | `string` | No | Node type (`input`, `default`, `output`, or custom) |
| `data` | `Record<string, any>` | No | Custom data object |
| `label` | `string` | No | Display text |
| `selected` | `boolean` | No | Selection state |
| `dragging` | `boolean` | No | Drag state |
| `connectable` | `boolean \| number \| Function` | No | Connection rules |
| `parent` | `string` | No | Parent node ID for nesting |
| `zIndex` | `number` | No | Stack order |
| `dragHandle` | `string` | No | CSS selector for drag handle area |
| `targetPosition` | `Position` | No | Target handle position |
| `sourcePosition` | `Position` | No | Source handle position |

## Node Events

### Via useVueFlow

```ts
const { onNodeDragStart, onNodeDrag, onNodeDragStop, onNodeClick,
  onNodeDoubleClick, onNodeContextMenu, onNodeMouseEnter,
  onNodeMouseLeave, onNodeMouseMove } = useVueFlow()

onNodeClick(({ event, node }) => {
  console.log('Clicked node:', node.id)
})
```

### Via component

```vue
<VueFlow
  @node-click="({ event, node }) => handleClick(node)"
  @node-drag-start="onDragStart"
  @node-drag="onDrag"
  @node-drag-stop="onDragStop"
  @node-double-click="onDoubleClick"
  @node-context-menu="onContextMenu"
  @node-mouse-enter="onMouseEnter"
  @node-mouse-leave="onMouseLeave"
  @node-mouse-move="onMouseMove"
/>
```

## Node Styling

Custom CSS class per node type:

```css
.vue-flow__node-custom {
  background: #fff;
  border: 1px solid #1a192b;
  border-radius: 8px;
  padding: 10px;
}
```

### Utility CSS Classes

| Class | Purpose |
|-------|---------|
| `.nodrag` | Prevent dragging on interactive elements (inputs, buttons) |
| `.nowheel` | Allow scrolling inside node (prevents zoom/pan capture) |
| `.nopan` | Prevent panning when interacting with element |

```vue
<template>
  <div>
    <input class="nodrag" type="text" />
    <div class="nowheel" style="overflow: auto; max-height: 100px">
      <!-- scrollable content -->
    </div>
  </div>
</template>
```

<!-- Source: docs/src/guide/node.md -->
