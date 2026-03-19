---
name: core-handles
description: Vue Flow handles — positions, multiple handles, connection limiting, dynamic handles
---

# Handles

Handles are connection points on nodes — small circles on node borders where edges attach. They are critical for creating connections between nodes.

## Basic Usage

```vue
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
</script>

<template>
  <div>
    <Handle type="target" :position="Position.Top" />
    <div>Node Content</div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>
```

## Handle Positions

| Position | Placement |
|----------|-----------|
| `Position.Top` | Top edge |
| `Position.Right` | Right edge |
| `Position.Bottom` | Bottom edge |
| `Position.Left` | Left edge |

The position affects the direction edges bend when connecting.

## Multiple Handles

A node can have any number of handles. When there are multiple handles of the same type, each must have a unique `id`:

```vue
<template>
  <div>
    <Handle id="target-a" type="target" :position="Position.Top" style="left: 25%" />
    <Handle id="target-b" type="target" :position="Position.Top" style="left: 75%" />

    <div>Multi-Handle Node</div>

    <Handle id="source-a" type="source" :position="Position.Bottom" style="left: 25%" />
    <Handle id="source-b" type="source" :position="Position.Bottom" style="left: 75%" />
  </div>
</template>
```

When creating edges, reference the handle ID:

```ts
const edges: Edge[] = [
  { id: 'e1', source: '1', sourceHandle: 'source-a', target: '2', targetHandle: 'target-b' },
]
```

If a handle has no `id`, the first handle of that type is used.

## Positioning with CSS

Use relative positioning on the parent container, then position handles with `top`, `left`, `right`, `bottom`:

```vue
<template>
  <div style="position: relative; padding: 10px">
    <Handle type="target" :position="Position.Left" style="top: 30%" />
    <Handle type="target" :position="Position.Left" style="top: 70%" />
    <div>Content</div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>
```

## Hidden Handles

To hide handles visually while keeping them functional, use `opacity: 0` — **do not** remove them from the DOM:

```vue
<Handle type="source" :position="Position.Bottom" style="opacity: 0" />
```

## Limiting Connections

The `connectable` prop controls how many edges can connect to a handle:

```vue
<!-- Boolean: allow or disallow connections -->
<Handle type="target" :position="Position.Top" :connectable="false" />

<!-- Number: max connections -->
<Handle type="target" :position="Position.Top" :connectable="1" />

<!-- Function: custom validation -->
<Handle
  type="target"
  :position="Position.Top"
  :connectable="(node, connectedEdges) => connectedEdges.length < 3"
/>
```

## Connection Mode

Controls which handle types can connect:

```vue
<script setup lang="ts">
import { ConnectionMode } from '@vue-flow/core'
</script>

<!-- Loose: any handle to any handle (default) -->
<VueFlow :connection-mode="ConnectionMode.Loose" />

<!-- Strict: source handles only connect to target handles -->
<VueFlow :connection-mode="ConnectionMode.Strict" />
```

## Dynamic Handles

When handles are added/removed at runtime, tell Vue Flow to recalculate internals:

```ts
// Via store action
const { updateNodeInternals } = useVueFlow()
updateNodeInternals(['nodeId'])

// Inside custom node — via emit
const emit = defineEmits(['updateNodeInternals'])
emit('updateNodeInternals')
```

This is required because Vue Flow caches handle positions for performance.

<!-- Source: docs/src/guide/handle.md -->
