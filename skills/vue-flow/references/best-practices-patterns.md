---
name: best-practices-patterns
description: Vue Flow common patterns, performance tips, error handling, and troubleshooting
---

# Patterns & Troubleshooting

## Common Patterns

### Save and Restore Flow

```ts
const { toObject, setNodes, setEdges, setViewport } = useVueFlow()

function saveFlow() {
  const flow = toObject()
  localStorage.setItem('saved-flow', JSON.stringify(flow))
}

function restoreFlow() {
  const saved = localStorage.getItem('saved-flow')
  if (!saved) return

  const { nodes, edges, position, zoom } = JSON.parse(saved)
  setNodes(nodes)
  setEdges(edges)
  setViewport({ x: position[0], y: position[1], zoom })
}
```

### Auto-Connect on Handle Drop

```vue
<VueFlow :auto-connect="true" />

<!-- Custom connector with defaults -->
<VueFlow
  :auto-connect="(params) => ({
    ...params,
    type: 'smoothstep',
    animated: true,
  })"
/>
```

### Delete Confirmation

Requires `apply-default="false"` on VueFlow to intercept changes before they're applied:

```vue
<script setup lang="ts">
const { onNodesChange, applyNodeChanges, findNode } = useVueFlow()

onNodesChange((changes) => {
  const safeChanges = changes.filter((change) => {
    if (change.type === 'remove') {
      return window.confirm(`Delete "${findNode(change.id)?.data.label}"?`)
    }
    return true
  })
  applyNodeChanges(safeChanges)
})
</script>

<template>
  <VueFlow :apply-default="false" />
</template>
```

### Add Node at Click Position

```ts
const { project, addNodes } = useVueFlow()

function onPaneClick(event: MouseEvent) {
  const position = project({ x: event.clientX, y: event.clientY })
  addNodes({
    id: `node-${Date.now()}`,
    position,
    data: { label: 'New Node' },
  })
}
```

### Drag Node from Sidebar

The most common UX pattern for node-based editors — drag a node type from a sidebar panel onto the canvas:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'

const { project, addNodes, vueFlowRef } = useVueFlow()

const nodes = ref<Node[]>([])
const edges = ref([])

// Track which type is being dragged
const draggedType = ref<string | null>(null)

function onDragStart(event: DragEvent, type: string) {
  draggedType.value = type
  event.dataTransfer!.effectAllowed = 'move'
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
}

function onDrop(event: DragEvent) {
  if (!draggedType.value || !vueFlowRef.value) return

  // Get the VueFlow container bounds to calculate offset
  const { left, top } = vueFlowRef.value.getBoundingClientRect()

  // Convert screen coordinates to flow coordinates
  const position = project({ x: event.clientX - left, y: event.clientY - top })

  addNodes({
    id: `node-${Date.now()}`,
    type: draggedType.value,
    position,
    data: { label: `${draggedType.value} node` },
  })

  draggedType.value = null
}
</script>

<template>
  <!-- Sidebar -->
  <aside>
    <div draggable="true" @dragstart="(e) => onDragStart(e, 'input')">Input Node</div>
    <div draggable="true" @dragstart="(e) => onDragStart(e, 'default')">Default Node</div>
    <div draggable="true" @dragstart="(e) => onDragStart(e, 'output')">Output Node</div>
  </aside>

  <!-- Canvas -->
  <VueFlow
    v-model:nodes="nodes"
    v-model:edges="edges"
    @dragover="onDragOver"
    @drop="onDrop"
  />
</template>
```

Key points:
- Use `vueFlowRef` to get the container's bounding rect for accurate offset calculation
- `project()` converts pixel coordinates to flow coordinates (accounts for zoom/pan)

### Nested Nodes (Parent-Child)

Nodes can be nested inside other nodes using the `parent` property. The child node's `position` becomes relative to the parent:

```ts
const nodes: Node[] = [
  {
    id: 'group-1',
    position: { x: 0, y: 0 },
    data: { label: 'Group' },
    style: { width: '300px', height: '200px', backgroundColor: 'rgba(99, 102, 241, 0.1)' },
  },
  {
    id: 'child-1',
    position: { x: 20, y: 40 },  // relative to parent
    data: { label: 'Child A' },
    parent: 'group-1',            // parent node ID
    extent: 'parent',             // constrain movement within parent
  },
  {
    id: 'child-2',
    position: { x: 150, y: 40 },
    data: { label: 'Child B' },
    parent: 'group-1',
    extent: 'parent',
  },
]
```

Rules:
- Parent node must exist in the nodes array **before** children (order matters)
- `extent: 'parent'` constrains the child to move only within the parent's bounds
- Only nodes with a `parent` can use `extent: 'parent'`
- Parent node needs explicit `width`/`height` in style for children to render correctly

### Copy Selected Nodes

```ts
const { getSelectedNodes, addNodes } = useVueFlow()

function duplicateSelected() {
  const selected = getSelectedNodes.value
  const idMap = new Map<string, string>()

  const newNodes = selected.map((node) => {
    const newId = `${node.id}-copy-${Date.now()}`
    idMap.set(node.id, newId)
    return {
      ...node,
      id: newId,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      selected: false,
    }
  })

  addNodes(newNodes)
}
```

### Layout Integration (dagre)

```ts
import dagre from '@dagrejs/dagre'

function layoutNodes(
  nodes: Node[],
  edges: Edge[],
  direction = 'TB',
  nodeWidth = 150,
  nodeHeight = 50,
): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction })

  nodes.forEach((node) => {
    // Use actual node dimensions if available, otherwise fallback
    const width = node.dimensions?.width ?? nodeWidth
    const height = node.dimensions?.height ?? nodeHeight
    g.setNode(node.id, { width, height })
  })
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    const width = node.dimensions?.width ?? nodeWidth
    const height = node.dimensions?.height ?? nodeHeight
    // dagre returns center position — offset to top-left
    return { ...node, position: { x: pos.x - width / 2, y: pos.y - height / 2 } }
  })
}
```

Note: `node.dimensions` is populated by Vue Flow after the node is rendered. For initial layout before render, pass explicit fallback dimensions. You can re-layout after render using `onNodesInitialized` event.

## Performance Tips

1. **`only-render-visible-elements`** — enable for large graphs (100+ nodes):
   ```vue
   <VueFlow :only-render-visible-elements="true" />
   ```

2. **`markRaw()`** — always wrap custom node/edge components:
   ```ts
   const nodeTypes = { custom: markRaw(CustomNode) }
   ```

3. **Avoid deep reactivity** on node data — use `shallowRef` for large data payloads

4. **Minimize re-renders** — use `computed` for derived props in custom nodes rather than watchers

## Error Handling

Vue Flow emits errors via the `onError` hook. Use `isErrorOfType()` to check specific error codes:

```ts
import { useVueFlow, isErrorOfType, ErrorCode } from '@vue-flow/core'
import type { VueFlowError } from '@vue-flow/core'

const { onError } = useVueFlow()

onError((error: VueFlowError) => {
  if (isErrorOfType(error, ErrorCode.EDGE_SOURCE_MISSING)) {
    console.warn('Edge source node missing:', error.args)
  }

  if (isErrorOfType(error, ErrorCode.MISSING_VIEWPORT_DIMENSIONS)) {
    console.error('VueFlow container has no dimensions — set width/height on parent')
  }
})
```

### ErrorCode Enum Values

```ts
import { ErrorCode } from '@vue-flow/core'

// Viewport
ErrorCode.MISSING_VIEWPORT_DIMENSIONS

// Nodes
ErrorCode.NODE_INVALID
ErrorCode.NODE_NOT_FOUND
ErrorCode.NODE_MISSING_PARENT
ErrorCode.NODE_TYPE_MISSING
ErrorCode.NODE_EXTENT_INVALID

// Edges
ErrorCode.EDGE_INVALID
ErrorCode.EDGE_NOT_FOUND
ErrorCode.EDGE_SOURCE_MISSING
ErrorCode.EDGE_TARGET_MISSING
ErrorCode.EDGE_TYPE_MISSING
ErrorCode.EDGE_SOURCE_TARGET_SAME
ErrorCode.EDGE_SOURCE_TARGET_MISSING
ErrorCode.EDGE_ORPHANED
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `MISSING_VIEWPORT_DIMENSIONS` | Parent container has no width/height | Set explicit `width` and `height` on the parent `<div>` |
| `NODE_INVALID` | Malformed node object | Check `id` and `position` are set |
| `NODE_NOT_FOUND` | `useNode()` called outside node context | Only call inside custom node components |
| `NODE_MISSING_PARENT` | Nested node's parent doesn't exist | Ensure parent node is in the nodes array |
| `NODE_TYPE_MISSING` | No component for node type | Register via `nodeTypes`, global component, or slot |
| `NODE_EXTENT_INVALID` | `extent: 'parent'` on non-child node | Only child nodes (with `parent`) can use parent extent |
| `EDGE_INVALID` | Missing `source` or `target` | Ensure both fields are set |
| `EDGE_NOT_FOUND` | `useEdge()` called outside edge context | Only call inside custom edge components |
| `EDGE_SOURCE_MISSING` | Source node doesn't exist | Add the source node first |
| `EDGE_TARGET_MISSING` | Target node doesn't exist | Add the target node first |
| `EDGE_TYPE_MISSING` | No component for edge type | Register via `edgeTypes`, global component, or slot |
| `EDGE_SOURCE_TARGET_SAME` | Source equals target | May be intentional (self-referencing) |
| `EDGE_SOURCE_TARGET_MISSING` | Both source and target nodes missing | Ensure both nodes exist |
| `EDGE_ORPHANED` | Edge lost node connection after removal | Remove orphaned edges or re-add missing nodes |

## Tips

- In **development**, Vue Flow logs warnings for errors
- In **production**, errors are suppressed by default — use `onError` to handle them
- **Container sizing**: The most common issue — always ensure `<VueFlow>` has a sized parent
- **Dynamic handles**: Call `updateNodeInternals()` after adding/removing handles at runtime
- **markRaw is mandatory**: Custom components in `nodeTypes`/`edgeTypes` objects must be wrapped in `markRaw()` to prevent Vue reactivity warnings and performance issues

<!-- Source: docs/src/guide/troubleshooting.md, cross-cutting patterns from all docs -->
