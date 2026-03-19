---
name: features-components
description: Vue Flow slots and plugin components — VueFlow slots, Background, Controls, MiniMap, NodeResizer, NodeToolbar
---

# Slots & Plugin Components

## VueFlow Built-in Slots

The `<VueFlow>` component provides three slots for customization:

### Default Slot

Elements placed outside the viewport — sidebars, floating panels, toolbars. They don't move or scale with the graph:

```vue
<VueFlow>
  <div class="sidebar">My Sidebar</div>
  <Background />
  <Controls />
</VueFlow>
```

### Connection Line Slot

Customize the line drawn while the user drags to create a new connection:

```vue
<VueFlow>
  <template #connection-line="{ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }">
    <g>
      <path
        :d="`M${sourceX},${sourceY} L${targetX},${targetY}`"
        stroke="#6366f1"
        stroke-width="2"
        fill="none"
      />
      <circle :cx="targetX" :cy="targetY" r="4" fill="#6366f1" />
    </g>
  </template>
</VueFlow>
```

### Zoom Pane Slot

Elements placed inside the viewport — they scale and move with zoom/pan:

```vue
<VueFlow>
  <template #zoom-pane>
    <div :style="{ position: 'absolute', left: '100px', top: '100px' }">
      I move with the graph!
    </div>
  </template>
</VueFlow>
```

---

## Plugin Components

Vue Flow ships additional components as separate packages. Each requires its own install and (usually) CSS import.

## Background

Renders a pattern overlay (dots, lines, or crosses) behind the graph.

```bash
npm add @vue-flow/background
```

```vue
<script setup lang="ts">
import { Background, BackgroundVariant } from '@vue-flow/background'
</script>

<template>
  <VueFlow>
    <Background :variant="BackgroundVariant.Dots" :gap="16" :size="1" pattern-color="#aaa" />
  </VueFlow>
</template>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `BackgroundVariant` | `dots` | `dots`, `lines`, or `crosses` |
| `gap` | `number` | `10` | Space between pattern elements |
| `size` | `number` | `0.4` | Size of pattern elements |
| `patternColor` | `string` | `#81818a` | Pattern color |
| `bgColor` | `string` | `#fff` | Background fill color |

## Controls

Zoom, fit-view, and lock buttons panel.

```bash
npm add @vue-flow/controls
```

```ts
import '@vue-flow/controls/dist/style.css'
```

```vue
<script setup lang="ts">
import { Controls } from '@vue-flow/controls'
</script>

<template>
  <VueFlow>
    <Controls
      :show-zoom="true"
      :show-fit-view="true"
      :show-interactive="true"
      @zoom-in="onZoomIn"
      @zoom-out="onZoomOut"
      @fit-view="onFitView"
      @interaction-change="(active) => console.log('interactive:', active)"
    />
  </VueFlow>
</template>
```

### Custom Control Buttons

```vue
<script setup lang="ts">
import { Controls, ControlButton } from '@vue-flow/controls'
</script>

<template>
  <VueFlow>
    <Controls>
      <ControlButton @click="resetLayout">
        <icon />
      </ControlButton>
    </Controls>
  </VueFlow>
</template>
```

### Controls Slots

| Slot | Description |
|------|-------------|
| `top` | Before built-in buttons |
| `control-zoom-in` | Replace zoom-in button |
| `control-zoom-out` | Replace zoom-out button |
| `control-fit-view` | Replace fit-view button |
| `control-interactive` | Replace lock button |
| `default` | After built-in buttons |
| `icon-zoom-in` | Replace zoom-in icon |
| `icon-zoom-out` | Replace zoom-out icon |
| `icon-fit-view` | Replace fit-view icon |
| `icon-lock` / `icon-unlock` | Replace lock icons |

## MiniMap

Miniature overview of the entire graph.

```bash
npm add @vue-flow/minimap
```

```ts
import '@vue-flow/minimap/dist/style.css'
```

```vue
<script setup lang="ts">
import { MiniMap } from '@vue-flow/minimap'
</script>

<template>
  <VueFlow>
    <MiniMap
      :pannable="true"
      :zoomable="true"
      :node-color="(node) => node.type === 'input' ? '#6366f1' : '#ddd'"
      :node-stroke-color="'#555'"
      :mask-color="'rgba(240, 242, 243, 0.7)'"
    />
  </VueFlow>
</template>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodeColor` | `string \| Function` | `#fff` | Node fill color |
| `nodeStrokeColor` | `string \| Function` | `#555` | Node border color |
| `nodeBorderRadius` | `number` | `5` | Node corner radius |
| `nodeStrokeWidth` | `number` | `2` | Node border width |
| `maskColor` | `string` | `rgba(240,242,243,0.7)` | Viewport mask color |
| `pannable` | `boolean` | `false` | Allow panning via minimap |
| `zoomable` | `boolean` | `false` | Allow zooming via minimap |

Custom minimap nodes via slot `#node-{type}`.

## NodeResizer

Adds resize handles to nodes.

```bash
npm add @vue-flow/node-resizer
```

```ts
import '@vue-flow/node-resizer/dist/style.css'
```

```vue
<!-- Inside custom node component -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'
</script>

<template>
  <NodeResizer :min-width="100" :min-height="50" @resize="onResize" />
  <Handle type="target" :position="Position.Top" />
  <div>Resizable Node</div>
  <Handle type="source" :position="Position.Bottom" />
</template>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minWidth` | `number` | - | Minimum width |
| `minHeight` | `number` | - | Minimum height |
| `isVisible` | `boolean` | `true` | Show/hide resize handles |
| `color` | `string` | - | Handle color |

Emits: `resizeStart`, `resize`, `resizeEnd`.

## NodeToolbar

Floating toolbar that appears when a node is selected (or always visible).

```bash
npm add @vue-flow/node-toolbar
```

```vue
<!-- Inside custom node component -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
</script>

<template>
  <NodeToolbar :position="Position.Top" :offset="10">
    <button @click="duplicate">Duplicate</button>
    <button @click="remove">Delete</button>
  </NodeToolbar>

  <Handle type="target" :position="Position.Top" />
  <div>Toolbar Node</div>
  <Handle type="source" :position="Position.Bottom" />
</template>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodeId` | `string \| string[]` | Context node | Target node(s) |
| `isVisible` | `boolean` | Selected state | Override visibility |
| `position` | `Position` | `Top` | Toolbar placement |
| `offset` | `number` | `10` | Distance from node |

<!-- Source: docs/src/guide/components/*.md -->
