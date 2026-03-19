---
name: advanced-theming
description: Vue Flow theming — CSS variables, class selectors, custom styling, dark mode
---

# Theming

## Required CSS

```ts
// Structural styles (always required)
import '@vue-flow/core/dist/style.css'

// Default theme (optional — skip if fully custom)
import '@vue-flow/core/dist/theme-default.css'
```

## CSS Variables

Override these on `.vue-flow` or any parent:

| Variable | Default | Controls |
|----------|---------|----------|
| `--vf-node-color` | - | Node border, box-shadow, handle fill |
| `--vf-node-bg` | - | Node background |
| `--vf-node-text` | - | Node text color |
| `--vf-box-shadow` | - | Box-shadow color |
| `--vf-handle` | - | Handle color |
| `--vf-connection-path` | - | Connection line color |

```css
.vue-flow {
  --vf-node-bg: #1a1a2e;
  --vf-node-color: #6366f1;
  --vf-node-text: #e2e8f0;
  --vf-handle: #6366f1;
  --vf-connection-path: #6366f1;
}
```

## Inline Styles on Elements

### On VueFlow component

```vue
<VueFlow class="my-flow" :style="{ background: '#1a1a2e' }" />
```

### On individual nodes/edges

```ts
const nodes: Node[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { label: 'Styled' },
    class: 'highlighted',
    style: { backgroundColor: '#6366f1', color: 'white', borderRadius: '12px' },
  },
]

const edges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
]
```

## CSS Class Reference

### Containers

| Selector | Element |
|----------|---------|
| `.vue-flow` | Root wrapper |
| `.vue-flow__container` | Inner container |
| `.vue-flow__viewport` | Zoomable/pannable viewport |
| `.vue-flow__background` | Background component |
| `.vue-flow__minimap` | MiniMap component |
| `.vue-flow__controls` | Controls component |

### Nodes

| Selector | Element |
|----------|---------|
| `.vue-flow__nodes` | Nodes container |
| `.vue-flow__node` | Any node |
| `.vue-flow__node-{type}` | Node by type (e.g., `.vue-flow__node-input`) |
| `.vue-flow__node.selected` | Selected node |
| `.vue-flow__nodesselection` | Multi-selection rectangle |

### Edges

| Selector | Element |
|----------|---------|
| `.vue-flow__edges` | Edges container |
| `.vue-flow__edge` | Any edge |
| `.vue-flow__edge-{type}` | Edge by type |
| `.vue-flow__edge.selected` | Selected edge |
| `.vue-flow__edge.animated` | Animated edge |
| `.vue-flow__edge-path` | Edge SVG path |
| `.vue-flow__edge-text` | Edge label text |
| `.vue-flow__edge-textbg` | Edge label background |

### Connections

| Selector | Element |
|----------|---------|
| `.vue-flow__connectionline` | Active connection line |
| `.vue-flow__connection` | Connection path wrapper |
| `.vue-flow__connection-path` | Connection SVG path |

### Handles

| Selector | Element |
|----------|---------|
| `.vue-flow__handle` | Any handle |
| `.vue-flow__handle-top` | Top handle |
| `.vue-flow__handle-right` | Right handle |
| `.vue-flow__handle-bottom` | Bottom handle |
| `.vue-flow__handle-left` | Left handle |
| `.vue-flow__handle-connecting` | Handle during connection |
| `.vue-flow__handle-valid` | Valid connection target |

## Custom Node Type Styling

```css
/* Style all nodes of type "process" */
.vue-flow__node-process {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.vue-flow__node-process.selected {
  box-shadow: 0 0 0 3px #6366f1;
}
```

## Dark Mode Example

```css
.vue-flow.dark {
  --vf-node-bg: #1e293b;
  --vf-node-color: #6366f1;
  --vf-node-text: #e2e8f0;
  --vf-handle: #818cf8;
  --vf-connection-path: #818cf8;
  background: #0f172a;
}

.vue-flow.dark .vue-flow__edge-path {
  stroke: #475569;
}

.vue-flow.dark .vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #818cf8;
}
```

<!-- Source: docs/src/guide/theming.md -->
