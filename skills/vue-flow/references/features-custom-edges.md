---
name: features-custom-edges
description: Creating custom Vue Flow edge components — path helpers, BaseEdge, EdgeLabelRenderer
---

# Custom Edges

Custom edges let you render any SVG path and HTML labels on connections. Registration follows the same three methods as nodes:

1. **`edgeTypes` object** on `<VueFlow>` or `useVueFlow`
2. **Global component registration**
3. **Template slots** using `#edge-{type}`

## Method 1: Template Slots

```vue
<template>
  <VueFlow v-model:edges="edges">
    <template #edge-custom="edgeProps">
      <CustomEdge v-bind="edgeProps" />
    </template>
  </VueFlow>
</template>
```

## Method 2: edgeTypes Object

```vue
<script setup lang="ts">
import { markRaw } from 'vue'
import ButtonEdge from './ButtonEdge.vue'

const edgeTypes = {
  button: markRaw(ButtonEdge),
}
</script>

<template>
  <VueFlow :edge-types="edgeTypes" />
</template>
```

## Custom Edge Component

Edge components receive path coordinates and must render SVG elements:

```vue
<!-- ButtonEdge.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const { removeEdges } = useVueFlow()

const path = computed(() => getBezierPath({
  sourceX: props.sourceX,
  sourceY: props.sourceY,
  sourcePosition: props.sourcePosition,
  targetX: props.targetX,
  targetY: props.targetY,
  targetPosition: props.targetPosition,
}))
</script>

<template>
  <!-- props.id is available from EdgeProps -->
  <BaseEdge :id="props.id" :path="path[0]" :marker-end="props.markerEnd" :style="props.style" />

  <EdgeLabelRenderer>
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px, ${path[2]}px)`,
        pointerEvents: 'all',
      }"
      class="nodrag nopan"
    >
      <button class="edge-button" @click="removeEdges([props.id])">×</button>
    </div>
  </EdgeLabelRenderer>
</template>
```

## Edge Props (received by custom component)

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Edge ID |
| `source` | `string` | Source node ID |
| `target` | `string` | Target node ID |
| `sourceX` | `number` | Source handle X coordinate |
| `sourceY` | `number` | Source handle Y coordinate |
| `targetX` | `number` | Target handle X coordinate |
| `targetY` | `number` | Target handle Y coordinate |
| `sourcePosition` | `Position` | Source handle position |
| `targetPosition` | `Position` | Target handle position |
| `data` | `any` | Custom data |
| `style` | `CSSProperties` | Inline styles |
| `markerStart` | `string` | Start marker |
| `markerEnd` | `string` | End marker |
| `selected` | `boolean` | Selection state |

## Path Helper Functions

All return `[path, labelX, labelY, offsetX, offsetY]`:

```ts
import { getBezierPath, getSmoothStepPath, getStraightPath, getSimpleBezierPath } from '@vue-flow/core'

// Bezier curve (configurable curvature)
const [path, labelX, labelY] = getBezierPath({
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  curvature: 0.25,
})

// Smooth step (rounded corners)
const [path2] = getSmoothStepPath({
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  borderRadius: 10,
})

// Sharp step (set borderRadius to 0)
const [path3] = getSmoothStepPath({
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  borderRadius: 0,
})

// Straight line
const [path4] = getStraightPath({ sourceX, sourceY, targetX, targetY })
```

## EdgeLabelRenderer

The `EdgeLabelRenderer` component escapes the SVG context so you can render HTML elements (buttons, inputs, rich content) as edge labels:

- Use `position: absolute` with `transform: translate(...)` to position at label coordinates
- Add `pointerEvents: 'all'` to make interactive
- Add `nodrag nopan` classes to prevent graph interactions

## TypeScript

```ts
import type { Edge } from '@vue-flow/core'

interface WeightedEdgeData {
  weight: number
  label: string
}

type WeightedEdge = Edge<WeightedEdgeData>
```

<!-- Source: docs/src/guide/edge.md, docs/src/guide/getting-started.md -->
