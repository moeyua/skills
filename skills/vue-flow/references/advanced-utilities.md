---
name: advanced-utilities
description: Vue Flow utilities — edge path functions, graph queries, viewport methods, type helpers
---

# Utilities

## Edge Path Functions

All path functions return `[path, labelX, labelY, offsetX, offsetY]`.

### getBezierPath

```ts
import { getBezierPath } from '@vue-flow/core'

const [path, labelX, labelY, offsetX, offsetY] = getBezierPath({
  sourceX: 0,
  sourceY: 0,
  sourcePosition: Position.Bottom,
  targetX: 200,
  targetY: 200,
  targetPosition: Position.Top,
  curvature: 0.25, // optional
})
```

### getSimpleBezierPath

Bezier without curvature derived from handle angles:

```ts
import { getSimpleBezierPath } from '@vue-flow/core'

const [path, labelX, labelY] = getSimpleBezierPath({
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
})
```

### getSmoothStepPath

Rounded right-angle path:

```ts
import { getSmoothStepPath } from '@vue-flow/core'

const [path, labelX, labelY] = getSmoothStepPath({
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  borderRadius: 10,  // 0 for sharp steps
  offset: 0,
  centerX: undefined, // optional forced center
  centerY: undefined,
})
```

### getStraightPath

```ts
import { getStraightPath } from '@vue-flow/core'

const [path, labelX, labelY] = getStraightPath({
  sourceX, sourceY, targetX, targetY,
})
```

### Exported Edge Components

Pre-built edge components for direct use:

```ts
import { BezierEdge, SmoothStepEdge, StepEdge, StraightEdge } from '@vue-flow/core'
```

## Graph Query Functions

### Type checking

```ts
import { isNode, isEdge } from '@vue-flow/core'

if (isNode(element)) { /* ... */ }
if (isEdge(element)) { /* ... */ }
```

### Traversal

```ts
import { getOutgoers, getIncomers, getConnectedEdges } from '@vue-flow/core'

// Get all nodes connected downstream from a node
const outgoers = getOutgoers(node, nodes, edges)

// Get all nodes connected upstream to a node
const incomers = getIncomers(node, nodes, edges)

// Get all edges connected to specific nodes
const connected = getConnectedEdges(nodeIds, edges)
```

### Geometry

```ts
import { getRectOfNodes, getNodesInside, getTransformForBounds } from '@vue-flow/core'

// Bounding rectangle of multiple nodes
const bounds = getRectOfNodes(selectedNodes)

// Nodes inside a specified rectangle
const nodesInRect = getNodesInside(nodes, rect)

// Viewport transform to fit specific bounds
const transform = getTransformForBounds(bounds, width, height, minZoom, maxZoom, padding)
```

### Marker ID

```ts
import { getMarkerId } from '@vue-flow/core'

const markerId = getMarkerId(markerDefinition)
```

## Viewport / Instance Methods

Accessed via `useVueFlow()` or the `VueFlowStore` from `onPaneReady`:

### Coordinate Projection

```ts
const { project } = useVueFlow()

// Convert pixel coordinates (e.g., mouse position) to flow coordinates
const flowPosition = project({ x: event.clientX, y: event.clientY })
```

### View Manipulation

```ts
const { fitView, fitBounds, setViewport, getViewport, zoomIn, zoomOut, zoomTo } = useVueFlow()

// Fit all nodes into view
fitView({ padding: 0.2, includeHiddenNodes: false })

// Fit specific bounds
fitBounds({ x: 0, y: 0, width: 500, height: 300 })

// Set exact viewport
setViewport({ x: 100, y: 50, zoom: 1.5 })

// Get current viewport
const { x, y, zoom } = getViewport()

// Zoom controls
zoomIn()
zoomOut()
zoomTo(1.5)
```

### Element Getters

```ts
const { getElements, getNodes, getEdges, getSelectedNodes, getSelectedEdges } = useVueFlow()

const allElements = getElements.value
const allNodes = getNodes.value
const allEdges = getEdges.value
const selected = getSelectedNodes.value
const selectedEdges = getSelectedEdges.value
```

### Element Setters

Replace the entire nodes/edges array (useful for restore/reset):

```ts
const { setNodes, setEdges } = useVueFlow()

// Replace all nodes
setNodes([
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Fresh Start' } },
])

// Replace all edges
setEdges([
  { id: 'e1-2', source: '1', target: '2' },
])
```

### Serialization

```ts
const { toObject } = useVueFlow()

// Export current state
const flowState = toObject()
// { elements: [...], position: [x, y], zoom: 1.5 }

// Useful for save/load functionality
localStorage.setItem('flow', JSON.stringify(flowState))
```

<!-- Source: docs/src/guide/utils/edge.md, docs/src/guide/utils/graph.md, docs/src/guide/utils/instance.md -->
