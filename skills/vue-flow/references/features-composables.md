---
name: features-composables
description: Vue Flow composables — useVueFlow, useNode, useEdge, useHandleConnections, useNodesData, useNodeId, useHandle
---

# Composables

Vue Flow provides several composables for interacting with graph state and behavior.

## useVueFlow

The primary composable — provides access to the entire Vue Flow state and all actions.

```ts
import { useVueFlow } from '@vue-flow/core'

const {
  // State (reactive)
  nodes,
  edges,
  viewport,
  dimensions,

  // Getters
  getNodes,
  getEdges,
  getElements,
  getSelectedNodes,
  getSelectedEdges,

  // Actions — elements
  addNodes,
  addEdges,
  setNodes,
  setEdges,
  removeNodes,
  removeEdges,
  findNode,
  findEdge,
  updateNode,
  updateNodeData,
  updateEdgeData,
  updateNodeInternals,
  applyNodeChanges,
  applyEdgeChanges,

  // Actions — viewport
  fitView,
  fitBounds,
  zoomIn,
  zoomOut,
  zoomTo,
  setViewport,
  getViewport,
  project,

  // Actions — serialization
  toObject,

  // Events (on<EventName> pattern)
  onInit,
  onNodeClick,
  onNodeDrag,
  onNodeDragStart,
  onNodeDragStop,
  onEdgeClick,
  onEdgeUpdate,
  onConnect,
  onNodesChange,
  onEdgesChange,
  onPaneReady,
  onError,
  // ... and all other events (see features-events.md)
} = useVueFlow()
```

### State Creation and Injection

The **first** call to `useVueFlow()` in a component tree creates the store and provides it via Vue's provide/inject. Subsequent calls inject the same instance.

```ts
// In parent — creates the store
const { nodes, edges, onInit } = useVueFlow()

// In child — injects the same store
const { findNode, addNodes } = useVueFlow()
```

### Multiple Instances

Use unique IDs to manage multiple flows:

```ts
const flow1 = useVueFlow({ id: 'flow-1' })
const flow2 = useVueFlow({ id: 'flow-2' })
```

## useNode

Access and mutate the current node's reactive state inside a custom node component. Must be called inside a component rendered as a custom node.

```vue
<script setup lang="ts">
import { useNode } from '@vue-flow/core'

const { node, connectedEdges } = useNode()

// Reactive — changes reflect immediately on the graph
function updateLabel(newLabel: string) {
  node.data.label = newLabel
}
</script>
```

Returns:

| Property | Type | Description |
|----------|------|-------------|
| `node` | `GraphNode` | Reactive node object (data, position, etc.) |
| `connectedEdges` | `ComputedRef<GraphEdge[]>` | All edges connected to this node |

## useEdge

Access and mutate the current edge's reactive state inside a custom edge component. Must be called inside a component rendered as a custom edge.

```vue
<script setup lang="ts">
import { useEdge } from '@vue-flow/core'

const { edge } = useEdge()

// Reactive — changes reflect immediately
edge.data.weight = 42
</script>
```

Returns:

| Property | Type | Description |
|----------|------|-------------|
| `edge` | `GraphEdge` | Reactive edge object (data, style, etc.) |

## useHandleConnections

Returns an array of connections for a specific handle. Useful in custom nodes to track what's connected:

```vue
<script setup lang="ts">
import { useHandleConnections } from '@vue-flow/core'

// All connections to target handle 'input-a'
const connections = useHandleConnections({
  type: 'target',
  id: 'input-a',
  onConnect: (params) => {
    console.log('New connection:', params)
  },
  onDisconnect: (params) => {
    console.log('Disconnected:', params)
  },
})
</script>

<template>
  <div>Connected: {{ connections.length }}</div>
</template>
```

Parameters:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `'source' \| 'target'` | Yes | Handle type |
| `id` | `string` | No | Handle ID |
| `nodeId` | `string` | No | Node ID (defaults to current node) |
| `onConnect` | `Function` | No | Callback on new connection |
| `onDisconnect` | `Function` | No | Callback on disconnection |

## useNodeConnections

Returns all connections for a node (across all handles), unlike `useHandleConnections` which tracks a single handle.

**When to use which:**
- `useHandleConnections` — you care about what's connected to a **specific handle** (e.g., "input-a")
- `useNodeConnections` — you care about all connections to the **entire node** regardless of handle

```ts
import { useNodeConnections } from '@vue-flow/core'

const connections = useNodeConnections({
  handleType: 'target',
  onConnect: (params) => console.log('connected', params),
  onDisconnect: (params) => console.log('disconnected', params),
})
```

Parameters:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `handleType` | `'source' \| 'target'` | Yes | Which side to track |
| `handleId` | `string` | No | Filter to specific handle |
| `nodeId` | `string` | No | Node ID (defaults to current node) |
| `onConnect` | `Function` | No | Callback on new connection |
| `onDisconnect` | `Function` | No | Callback on disconnection |

## useNodesData

Retrieves reactive data from nodes by their IDs. Commonly paired with `useHandleConnections`:

```vue
<script setup lang="ts">
import { useHandleConnections, useNodesData } from '@vue-flow/core'
import { computed } from 'vue'

const connections = useHandleConnections({ type: 'target' })

const sourceNodeIds = computed(() =>
  connections.value.map(c => c.source),
)

const sourceNodesData = useNodesData(sourceNodeIds)
</script>

<template>
  <div v-for="nodeData in sourceNodesData" :key="nodeData.id">
    {{ nodeData.data.label }}
  </div>
</template>
```

Optional type guard for narrowing data types:

```ts
const typedData = useNodesData(nodeIds, (data): data is TaskData => 'priority' in data)
```

## useNodeId

Returns the current node's ID inside a custom node component:

```vue
<script setup lang="ts">
import { useNodeId } from '@vue-flow/core'

const nodeId = useNodeId()
// nodeId.value === '1' (the current node's id)
</script>
```

Must be called inside a custom node component (provided by Vue Flow's internal `NodeWrapper`).

## useHandle

Creates custom handle behavior without using the `<Handle>` component. Useful for fully custom handle implementations:

```ts
import { useHandle } from '@vue-flow/core'

const { handlePointerDown, handleClick } = useHandle({
  nodeId: 'node-1',
  handleId: 'my-handle',
  type: 'source',
  isValidConnection: (connection) => connection.target !== 'node-1',
})
```

<!-- Source: docs/src/guide/composables.md -->
