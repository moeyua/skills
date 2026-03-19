---
name: core-edges
description: Vue Flow edges — types, adding/removing/updating, props, events, BaseEdge, and EdgeLabelRenderer
---

# Edges

Edges connect nodes through handles. Each edge requires a unique `id`, `source` (node ID), and `target` (node ID).

## Predefined Edge Types

| Type | Description |
|------|-------------|
| `default` | Bezier curve (smooth) |
| `step` | Right-angle step path |
| `smoothstep` | Rounded step path |
| `straight` | Direct line |

## Adding Edges

### Via prop binding

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Edge } from '@vue-flow/core'

const edges = ref<Edge[]>([
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
])
</script>

<template>
  <VueFlow v-model:edges="edges" />
</template>
```

### Via useVueFlow

```ts
const { addEdges } = useVueFlow()

addEdges({
  id: 'e1-3',
  source: '1',
  target: '3',
  sourceHandle: 'source-a',  // when node has multiple handles
  targetHandle: 'target-b',
})
```

## Removing Edges

```ts
const { removeEdges } = useVueFlow()

removeEdges('e1-2')
removeEdges(['e1-2', 'e2-3'])

// Or filter the ref
edges.value = edges.value.filter(e => e.id !== 'e1-2')
```

## Updating Edge Data

```ts
const { updateEdgeData, findEdge } = useVueFlow()

// Merge data
updateEdgeData('e1-2', { weight: 5 })

// Direct mutation
const edge = findEdge('e1-2')
if (edge) {
  edge.data = { ...edge.data, weight: 10 }
}
```

Inside custom edge components, use `useEdge`:

```vue
<script setup lang="ts">
import { useEdge } from '@vue-flow/core'

const { edge } = useEdge()
edge.data.weight = 42
</script>
```

## Edge Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `source` | `string` | Yes | Source node ID |
| `target` | `string` | Yes | Target node ID |
| `type` | `string` | No | Edge type |
| `sourceHandle` | `string` | No | Source handle ID |
| `targetHandle` | `string` | No | Target handle ID |
| `label` | `string` | No | Edge label text |
| `animated` | `boolean` | No | Animated dashed line |
| `style` | `CSSProperties` | No | Inline styles |
| `selected` | `boolean` | No | Selection state |
| `updatable` | `boolean` | No | Allow edge reconnection |
| `curvature` | `number` | No | Bezier curvature |
| `interactionWidth` | `number` | No | Click area width |
| `markerStart` | `string \| EdgeMarker` | No | Start marker |
| `markerEnd` | `string \| EdgeMarker` | No | End marker (arrow) |
| `data` | `Record<string, any>` | No | Custom data |

## Edge Events

### Via useVueFlow

```ts
const { onEdgeClick, onEdgeDoubleClick, onEdgeContextMenu,
  onEdgeMouseEnter, onEdgeMouseLeave, onEdgeMouseMove,
  onEdgeUpdateStart, onEdgeUpdate, onEdgeUpdateEnd } = useVueFlow()

onEdgeClick(({ event, edge }) => {
  console.log('Clicked edge:', edge.id)
})

// Edge update: drag edge endpoint to new handle
onEdgeUpdate(({ edge, connection }) => {
  console.log('Edge updated:', edge.id, '→', connection)
})
```

### Via component

```vue
<VueFlow
  @edge-click="onEdgeClick"
  @edge-double-click="onEdgeDoubleClick"
  @edge-update="onEdgeUpdate"
  @edge-update-start="onEdgeUpdateStart"
  @edge-update-end="onEdgeUpdateEnd"
/>
```

## Key Edge Components

### BaseEdge

Renders the SVG path for an edge. Used inside custom edge components:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, getBezierPath } from '@vue-flow/core'
import type { BezierEdgeProps } from '@vue-flow/core'

const props = defineProps<BezierEdgeProps>()

const path = computed(() => getBezierPath(props))
</script>

<template>
  <BaseEdge :id="props.id" :path="path[0]" :marker-end="props.markerEnd" :style="props.style" />
</template>
```

### EdgeLabelRenderer

Escapes the SVG context to render HTML labels positioned on edges. This is how you put buttons, inputs, or any HTML on an edge:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'
import type { BezierEdgeProps } from '@vue-flow/core'

const props = defineProps<BezierEdgeProps>()

const path = computed(() => getBezierPath(props))

const { removeEdges } = useVueFlow()
</script>

<template>
  <BaseEdge :path="path[0]" :marker-end="markerEnd" :style="style" />
  <EdgeLabelRenderer>
    <div
      class="nodrag nopan"
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px, ${path[2]}px)`,
        pointerEvents: 'all',
      }"
    >
      <button @click="removeEdges([id])">×</button>
    </div>
  </EdgeLabelRenderer>
</template>
```

<!-- Source: docs/src/guide/edge.md -->
