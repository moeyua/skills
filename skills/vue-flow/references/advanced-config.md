---
name: advanced-config
description: Vue Flow configuration — all VueFlow props for viewport, selection, zoom, pan, snapping, and behavior
---

# Configuration

All options can be passed as props to `<VueFlow>` or via `useVueFlow()`.

## Basic Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | auto | Unique flow instance ID |
| `nodes` | `Node[]` | `[]` | Initial nodes |
| `edges` | `Edge[]` | `[]` | Initial edges |
| `node-types` | `Record<string, Component>` | `{}` | Custom node type → component map |
| `edge-types` | `Record<string, Component>` | `{}` | Custom edge type → component map |
| `apply-default` | `boolean` | `true` | Enable default change handlers |
| `connection-mode` | `ConnectionMode` | `Loose` | `Loose` (any→any) or `Strict` (source→target) |
| `fit-view-on-init` | `boolean` | `false` | Fit viewport to content on mount |
| `auto-connect` | `boolean \| Connector` | `false` | Auto-create edges on connection |

## Viewport Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min-zoom` | `number` | `0.5` | Minimum zoom level |
| `max-zoom` | `number` | `2` | Maximum zoom level |
| `default-viewport` | `ViewportTransform` | `{ zoom: 1, x: 0, y: 0 }` | Initial viewport state |
| `translate-extent` | `CoordinateExtent` | - | Bounding box for viewport panning |
| `zoom-on-scroll` | `boolean` | `true` | Zoom with mouse wheel |
| `zoom-on-pinch` | `boolean` | `true` | Zoom with trackpad pinch |
| `zoom-on-double-click` | `boolean` | `true` | Zoom on double-click |
| `pan-on-scroll` | `boolean` | `false` | Pan instead of zoom on scroll |
| `pan-on-scroll-speed` | `number` | `0.5` | Pan scroll speed |
| `pan-on-scroll-mode` | `PanOnScrollMode` | `Free` | `Free`, `Horizontal`, or `Vertical` |
| `pan-on-drag` | `boolean` | `true` | Pan by dragging the pane |
| `prevent-scrolling` | `boolean` | `true` | Prevent page scroll when cursor over flow |
| `zoom-activation-key-code` | `KeyCode` | `Meta` | Key to activate zoom |

## Selection Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selection-key-code` | `KeyCode` | `Shift` | Key to activate selection rectangle |
| `multi-selection-key-code` | `KeyCode` | `Meta` | Key for multi-select |
| `delete-key-code` | `KeyCode` | `Backspace` | Key to delete selected elements |
| `elements-selectable` | `boolean` | `true` | Allow element selection |

## Node Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes-draggable` | `boolean` | `true` | Allow node dragging globally |
| `nodes-connectable` | `boolean` | `true` | Allow handle connections globally |
| `node-extent` | `CoordinateExtent` | - | Bounding box for node movement |
| `select-nodes-on-drag` | `boolean` | `true` | Select node when drag starts |
| `snap-to-grid` | `boolean` | `false` | Snap node positions to grid |
| `snap-grid` | `[number, number]` | `[15, 15]` | Grid size `[x, y]` |

## Edge Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `edges-updatable` | `boolean` | `true` | Allow edge reconnection by dragging |
| `default-marker-color` | `string` | `#b1b1b7` | Default arrow marker color |
| `edge-updater-radius` | `number` | `10` | Radius for edge update trigger |
| `connect-on-click` | `boolean` | `true` | Create edges by sequential handle clicks |
| `default-edge-options` | `DefaultEdgeOptions` | - | Defaults for all new edges |
| `elevate-edges-on-select` | `boolean` | `false` | Raise selected edge z-index |

### default-edge-options Example

Apply default properties to all newly created edges:

```vue
<VueFlow
  :default-edge-options="{
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: MarkerType.ArrowClosed,
  }"
/>
```

## Performance

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `only-render-visible-elements` | `boolean` | `false` | Skip rendering off-screen elements |

## CSS Class Overrides

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `no-wheel-class-name` | `string` | `nowheel` | Class to disable wheel events |
| `no-pan-class-name` | `string` | `nopan` | Class to disable panning |

## Connection Line Options

```vue
<VueFlow
  :connection-line-options="{
    type: ConnectionLineType.SmoothStep,
    style: { stroke: '#ff0000', strokeWidth: 2 },
  }"
/>
```

## Example: Full Config

```vue
<VueFlow
  v-model:nodes="nodes"
  v-model:edges="edges"
  :default-viewport="{ zoom: 1.5, x: 0, y: 0 }"
  :min-zoom="0.2"
  :max-zoom="4"
  :snap-to-grid="true"
  :snap-grid="[20, 20]"
  :connection-mode="ConnectionMode.Strict"
  :nodes-draggable="true"
  :elements-selectable="true"
  :pan-on-scroll="true"
  :zoom-on-scroll="false"
  fit-view-on-init
/>
```

<!-- Source: docs/src/guide/vue-flow/config.md -->
