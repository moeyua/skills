---
name: features-events
description: Vue Flow events — node, edge, connection, pane, and interaction events via component and composable
---

# Events

Vue Flow events can be consumed two ways:

1. **Component events** — `@event-name` on `<VueFlow>`
2. **Composable hooks** — `onEventName()` from `useVueFlow()`

Both approaches receive the same payload.

## Node Events

| Component Event | Composable Hook | Payload |
|----------------|-----------------|---------|
| `@node-click` | `onNodeClick` | `{ event, node }` |
| `@node-double-click` | `onNodeDoubleClick` | `{ event, node }` |
| `@node-context-menu` | `onNodeContextMenu` | `{ event, node }` |
| `@node-mouse-enter` | `onNodeMouseEnter` | `{ event, node }` |
| `@node-mouse-leave` | `onNodeMouseLeave` | `{ event, node }` |
| `@node-mouse-move` | `onNodeMouseMove` | `{ event, node }` |
| `@node-drag-start` | `onNodeDragStart` | `{ event, node }` |
| `@node-drag` | `onNodeDrag` | `{ event, node }` |
| `@node-drag-stop` | `onNodeDragStop` | `{ event, node }` |

## Edge Events

| Component Event | Composable Hook | Payload |
|----------------|-----------------|---------|
| `@edge-click` | `onEdgeClick` | `{ event, edge }` |
| `@edge-double-click` | `onEdgeDoubleClick` | `{ event, edge }` |
| `@edge-context-menu` | `onEdgeContextMenu` | `{ event, edge }` |
| `@edge-mouse-enter` | `onEdgeMouseEnter` | `{ event, edge }` |
| `@edge-mouse-leave` | `onEdgeMouseLeave` | `{ event, edge }` |
| `@edge-mouse-move` | `onEdgeMouseMove` | `{ event, edge }` |
| `@edge-update-start` | `onEdgeUpdateStart` | `{ event, edge }` |
| `@edge-update` | `onEdgeUpdate` | `{ edge, connection }` |
| `@edge-update-end` | `onEdgeUpdateEnd` | `{ event, edge }` |

## Connection Events

| Component Event | Composable Hook | Payload |
|----------------|-----------------|---------|
| `@connect` | `onConnect` | `Connection` |
| `@connect-start` | `onConnectStart` | `{ event, nodeId, handleId, handleType }` |
| `@connect-end` | `onConnectEnd` | `event` |

## Change Events

| Component Event | Composable Hook | Payload |
|----------------|-----------------|---------|
| `@nodes-change` | `onNodesChange` | `NodeChange[]` |
| `@edges-change` | `onEdgesChange` | `EdgeChange[]` |

## Pane Events

| Component Event | Composable Hook | Payload |
|----------------|-----------------|---------|
| `@pane-ready` | `onPaneReady` | `VueFlowStore` |
| `@pane-click` | `onPaneClick` | `event` |
| `@pane-context-menu` | `onPaneContextMenu` | `event` |
| `@pane-scroll` | `onPaneScroll` | `event` |
| `@move` | `onMove` | `{ event, flowTransform }` |
| `@move-start` | `onMoveStart` | `{ event, flowTransform }` |
| `@move-end` | `onMoveEnd` | `{ event, flowTransform }` |

## Lifecycle Event

| Component Event | Composable Hook | Description |
|----------------|-----------------|-------------|
| `@init` | `onInit` | Fired when Vue Flow is initialized |

## Usage Examples

### Component events

```vue
<template>
  <VueFlow
    @node-click="({ event, node }) => console.log('clicked', node.id)"
    @connect="(params) => addEdges(params)"
    @pane-ready="(instance) => instance.fitView()"
    @nodes-change="(changes) => console.log('changes', changes)"
  />
</template>
```

### Composable hooks

```ts
const { onNodeClick, onConnect, onInit, onNodesChange } = useVueFlow()

onNodeClick(({ event, node }) => {
  console.log('clicked', node.id)
})

onConnect((params) => {
  addEdges(params)
})

onInit(() => {
  fitView()
})

onNodesChange((changes) => {
  changes.forEach((change) => {
    if (change.type === 'position') {
      console.log(`Node ${change.id} moved`)
    }
  })
})
```

## Auto-Connect Pattern

Use `auto-connect` to automatically create edges on connection:

```vue
<VueFlow :auto-connect="true" />

<!-- Or with custom connector -->
<VueFlow :auto-connect="(params) => ({ ...params, type: 'smoothstep', animated: true })" />
```

<!-- Source: docs/src/guide/vue-flow/events.md -->
