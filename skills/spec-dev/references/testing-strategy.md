---
name: testing-strategy
description: "Testing strategy guide for SDD projects. Defines the test pyramid, layer responsibilities, naming conventions, and how specs map to tests."
---

# Testing Strategy

## Test Pyramid

```
        /\
       /E2E\         BDD scenarios from specs → Playwright
      /------\
     / Integ. \      Store + Composable + Component → Vitest + test-utils
    /----------\
   /   Unit     \    Pure functions, business rules → Vitest (zero framework deps)
  /--------------\
```

**Principle:** The more a test depends on infrastructure, the fewer of them you need. Pure logic gets the most tests; E2E covers critical user journeys only.

## Layer Responsibilities

### Unit Tests

**Location:** `test/unit/`
**Framework:** Vitest
**Scope:** Pure functions with zero framework dependencies

Good candidates:
- Validation logic (e.g., edge validation, input sanitization)
- Data transformations (format converters, mappers)
- Business rule functions
- State machine transition logic
- Utility functions

**Pattern — AAA (Arrange/Act/Assert):**

```typescript
it('should detect cycle when edge creates loop', () => {
  // Arrange
  const edges = [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }]
  const newEdge = { source: 'c', target: 'a' }

  // Act
  const result = wouldCreateCycle(edges, newEdge)

  // Assert
  expect(result).toBe(true)
})
```

### Integration Tests

**Location:** `test/nuxt/` (Nuxt) or `test/integration/`
**Framework:** Vitest + framework test utils
**Scope:** Components, stores, composables that depend on framework runtime

Good candidates:
- Pinia store actions and getters
- Composables that use framework APIs (reactivity, lifecycle)
- Component rendering and interaction
- Store ↔ component integration

**Pattern — test public API, not internals:**

```typescript
describe('flowStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should add node and sync to canvas', () => {
    const store = useFlowStore()
    store.addNode('text', { x: 100, y: 200 })

    expect(store.nodes).toHaveLength(1)
    expect(store.nodes[0].type).toBe('text')
  })
})
```

### E2E Tests

**Location:** `tests/`
**Framework:** Playwright
**Scope:** Critical user journeys mapped from BDD scenarios in specs

Good candidates:
- Core user workflows (create → configure → execute)
- Cross-module interactions that integration tests can't cover
- Error recovery flows visible to users

**Pattern — map directly from BDD scenarios:**

```typescript
// Spec says:
//   Scenario: Create text node from toolbar
//     Given canvas editor is open
//     When user clicks toolbar add button and selects text
//     Then a text node appears on canvas

test('create text node from toolbar', async ({ page }) => {
  await page.goto('/canvas/test-id')
  await page.click('[data-testid="toolbar-add"]')
  await page.click('[data-testid="node-type-text"]')
  await expect(page.locator('[data-testid="node-text"]')).toBeVisible()
})
```

## Spec → Test Mapping

Every test must trace back to a spec:

```
docs/specs/ai-generation-flow.md
  AC-01: "Node enters generating state"
    → test/nuxt/aiGeneration.test.ts: it('should set status to generating')
  AC-02: "Generate button disabled during generation"
    → tests/ai-generation.spec.ts: test('generate button disabled while generating')
```

When you write a test, add a comment referencing the AC:

```typescript
// AC-01: Node enters generating state when generate clicked
it('should set status to generating when generate is called', () => {
  // ...
})
```

## data-testid Conventions

All interactive UI elements should have `data-testid` for E2E tests. Naming pattern:

```
{component}-{element}
{component}-{element}-{variant}
```

Examples:
- `toolbar-add` — toolbar's add button
- `node-type-text` — node type selector for text
- `node-generate` — node's generate button
- `node-status-generating` — status indicator

## Coverage Targets

| Layer | Target | Focus |
|-------|--------|-------|
| Unit | > 90% | Validation, business rules, pure logic |
| Integration | > 70% | All public store actions, key composables |
| E2E | Critical paths 100% | Every P0 user journey has at least one test |

These are guidelines, not gates. 90% coverage with meaningful tests beats 100% coverage with trivial assertions.

## When NOT to test

- Third-party library behavior (trust the library)
- CSS/styling (unless testing conditional class application)
- Static content rendering
- Framework internals (Vue reactivity, Nuxt auto-imports)

## Test File Naming

```
test/unit/{module}.test.ts          # Unit tests
test/nuxt/{component|store}.test.ts # Integration tests
tests/{feature}.spec.ts             # E2E tests
```

Match the `{feature}` name to the spec filename in `docs/specs/` for easy tracing.
