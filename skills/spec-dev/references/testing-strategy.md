---
name: testing-strategy
description: "Testing strategy guide for SDD projects. Defines the test pyramid, layer responsibilities, naming conventions, and how specs map to tests."
---

# Testing Strategy

This guide is **technology-neutral**. It describes the shape of a healthy test suite for SDD projects; the specific framework names (Vitest/Jest/Playwright/Cypress/pytest/go test/…) are substituted in per project. Record your project's choices in `docs/guides/testing.md`.

## Test Pyramid

```mermaid
graph BT
    Unit["Unit — Pure functions, business rules"] --> Integration["Integration — Modules + adapters with framework runtime"] --> E2E["E2E — BDD scenarios from specs"]
```

**Principle:** The more a test depends on infrastructure, the fewer of them you need. Pure logic gets the most tests; E2E covers critical user journeys only.

## Layer Responsibilities

### Unit Tests

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

**Scope:** Modules that depend on the framework runtime — stores, components, hooks/composables, adapters that touch I/O boundaries with test doubles.

Good candidates:
- Store actions and selectors (Pinia, Zustand, Redux, etc.)
- Hooks / composables that use framework APIs (reactivity, lifecycle)
- Component rendering and interaction
- Store ↔ component integration

**Pattern — test public API, not internals.** Use your framework's test harness (e.g., `@testing-library`, Nuxt test utils, React Testing Library). Example (Pinia-flavored, substitute your own stack):

```typescript
describe('flowStore', () => {
  it('should add node and sync to canvas', () => {
    const store = useFlowStore()
    store.addNode('text', { x: 100, y: 200 })

    expect(store.nodes).toHaveLength(1)
    expect(store.nodes[0].type).toBe('text')
  })
})
```

### E2E / Acceptance Tests

**Scope:** Critical user journeys mapped from BDD scenarios in specs

The project chooses one verification method and documents it in `docs/guides/testing.md`:

- **Automated E2E**: BDD scenarios map to E2E test files (Playwright / Cypress / Selenium / whatever the project uses)
- **Manual testing**: BDD scenarios map to a manual test checklist with structured pass/fail records

Both approaches are valid. Automated E2E is preferred when the project has the infrastructure; manual testing is acceptable when E2E tooling is not integrated.

Good candidates:
- Core user workflows (create → configure → execute)
- Cross-module interactions that integration tests can't cover
- Error recovery flows visible to users

**Pattern A — automated E2E (map from BDD scenarios):**

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

**Pattern B — manual test checklist (when no E2E framework):**

```markdown
## Manual Test: {Feature name}

| # | Scenario | Steps | Expected | Pass/Fail | Tester | Date |
|---|----------|-------|----------|-----------|--------|------|
| 1 | Create text node from toolbar | 1. Open canvas editor 2. Click toolbar add 3. Select text | Text node appears on canvas | | | |
```

## Spec → Test Mapping

Every test must trace back to a spec. In the spec, each AC points at the test; in the test, a comment references the AC:

```
docs/specs/ai-generation-flow.md
  AC-01: "Node enters generating state"
    → {integration-tests}/aiGeneration.test.ts: it('should set status to generating')
  AC-02: "Generate button disabled during generation"
    → {e2e-tests}/ai-generation.spec.ts: test('generate button disabled while generating')
```

When you write a test, add a comment referencing the AC:

```typescript
// AC-01: Node enters generating state when generate clicked
it('should set status to generating when generate is called', () => {
  // ...
})
```

This two-way link is what makes Audit Mode's TDD checks possible.

## UI Test Selector Conventions (frontend only)

Interactive UI elements should expose a stable hook for E2E tests — `data-testid` is a common choice; your project may prefer `aria-label`, test ids injected by the framework, or accessible name queries. Pick one and record it in `docs/guides/testing.md`.

A naming pattern that scales:

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
| Integration | > 70% | All public store/module actions, key hooks/composables |
| E2E / Manual | Critical paths 100% | Every P0 user journey has at least one automated test or manual test record |

These are guidelines, not gates. 90% coverage with meaningful tests beats 100% coverage with trivial assertions.

## When NOT to test

- Third-party library behavior (trust the library)
- CSS/styling (unless testing conditional class application)
- Static content rendering
- Framework internals (reactivity systems, auto-imports, DI containers)

## Test File Naming

A consistent naming scheme helps both humans and Audit Mode locate the test for a given spec. The exact paths below are a suggestion — match whatever the project has already established, and record the chosen scheme in `docs/guides/testing.md`:

```
{unit-tests}/{module}.test.ts           # Unit tests
{integration-tests}/{unit}.test.ts      # Integration tests
{e2e-tests}/{feature}.spec.ts           # E2E tests
```

Match the `{feature}` name to the spec filename in `docs/specs/` for easy tracing.
