---
name: advanced-state
description: Vue Flow state management — controlled mode, v-model, change validation, apply changes
---

# State & Controlled Flow

## Default Behavior (Uncontrolled)

By default, Vue Flow handles all state changes automatically — dragging nodes, creating edges, selecting elements all work out of the box with `apply-default` set to `true`.

## v-model Binding

Use `v-model:nodes` and `v-model:edges` to sync Vue Flow's internal state with your own refs:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Edge, Node } from '@vue-flow/core'

const nodes = ref<Node[]>([...])
const edges = ref<Edge[]>([...])
</script>

<template>
  <VueFlow v-model:nodes="nodes" v-model:edges="edges" />
</template>
```

Changes made via `useVueFlow()` actions (like `updateNode`) will reflect in your state.

## Controlled Flow

Disable automatic change handling to validate changes before applying them:

### Step 1: Disable defaults

```vue
<VueFlow :apply-default="false" />
```

### Step 2: Listen to changes

```ts
const { onNodesChange, onEdgesChange, applyNodeChanges, applyEdgeChanges } = useVueFlow()
```

### Step 3: Validate and apply

```ts
onNodesChange((changes) => {
  // Filter or modify changes before applying
  const allowedChanges = changes.filter((change) => {
    // Block deletion of protected nodes
    if (change.type === 'remove') {
      return !protectedNodeIds.includes(change.id)
    }
    return true
  })

  applyNodeChanges(allowedChanges)
})

onEdgesChange((changes) => {
  applyEdgeChanges(changes)
})
```

## Change Types

| Type | Description | Properties |
|------|-------------|------------|
| `add` | Element added | Full node/edge object |
| `remove` | Element removed | `id` |
| `select` | Selection toggled | `id`, `selected` |
| `position` | Node moved | `id`, `position`, `dragging` |
| `dimensions` | Node resized | `id`, `dimensions`, `resizing` |

## Confirm Delete Pattern

A common pattern — ask for confirmation before deletion:

```vue
<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'

const { onNodesChange, applyNodeChanges } = useVueFlow()

onNodesChange((changes) => {
  const nextChanges = changes.reduce<typeof changes>((acc, change) => {
    if (change.type === 'remove') {
      const confirmed = window.confirm(`Delete node ${change.id}?`)
      if (confirmed) acc.push(change)
    }
    else {
      acc.push(change)
    }
    return acc
  }, [])

  applyNodeChanges(nextChanges)
})
</script>

<template>
  <VueFlow :apply-default="false" />
</template>
```

## State Access (Options API)

If using Options API, pass a unique ID to access the same store:

```ts
// In setup or composition API component
const { nodes } = useVueFlow({ id: 'my-flow' })

// In another Options API component
export default {
  mounted() {
    const { getNodes } = useVueFlow({ id: 'my-flow' })
    console.log(getNodes.value)
  },
}
```

## Important Notes

- Vue Flow only tracks changes from **interactions** (user drag, click) and **API calls** (`addNodes`, `removeEdges`, etc.)
- Direct mutations to node/edge arrays are not tracked as "changes" and won't trigger `onNodesChange`/`onEdgesChange`
- `applyNodeChanges` and `applyEdgeChanges` mutate the internal state — they don't need v-model to work

<!-- Source: docs/src/guide/controlled-flow.md, docs/src/guide/vue-flow/state.md -->
