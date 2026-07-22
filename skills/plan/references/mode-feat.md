# plan — `feat` type

Use `feat` for a new externally observable capability. Its quality bar is a bounded interface plus acceptance scenarios that make the capability reviewable.

## Evidence to resolve

- Identify the actor, situation, desired outcome, and first-version boundary.
- Find the existing seam or prior art the feature should extend.
- Resolve observable success, failure, and consequential edge behavior.
- Put unspecified user-visible semantics on the material decision frontier when reasonable behaviors differ.
- Keep unrelated restructuring outside the feature.

Ask only about unresolved material product choices. Derive implementation conventions and existing interfaces from the repository.

## Required plan sections

### `## Interface boundary`

Describe what callers or users can observe: public API, command, endpoint, schema, configuration, or UI interaction; valid inputs; success and failure outputs; side effects; and what remains internal. Name types or shapes when they are design decisions without pre-writing implementation code.

### `## Acceptance scenarios`

Write verifiable Given/When/Then scenarios covering the normal path and every material failure or boundary condition. Each scenario maps to an implementation outcome and acceptance check.

Include `## Spec delta` because externally observable behavior changes.

## Ready when

The first version is bounded, callers can understand the whole interface without knowing its implementation, and acceptance scenarios cover behavior that would cause a reviewer to reject the feature.
