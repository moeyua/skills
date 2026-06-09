# Design format — `DESIGN.md`

The project's **visual identity**, written so a coding agent can implement it consistently. Adopts the `design.md` spec (Google Labs, `google-labs-code/design.md`): a two-layer file — machine-readable design **tokens** in YAML front matter, plus human-readable design **rationale** in markdown prose. Only for projects with a UI / visual identity — a pure library / CLI / backend doesn't need it.

Design is the _visual identity only_. Interaction flows, user journeys, and behavior are **not** design's job — those describe behavior and belong in the behavior contract (`specs/`).

## Sections

A `DESIGN.md` has two layers.

### Layer 1 — YAML front matter (the normative token values)

Delimited by `---` at the top of the file. Machine-readable design tokens — the exact values an agent implements against. They are normative.

```yaml
---
name: <string>
description: <string> # optional
version: <string> # optional
colors:
  <token-name>: <Color> # hex, rgb(), oklch(), or a named CSS color
typography:
  <token-name>: <Typography> # fontFamily / fontSize / fontWeight / lineHeight / ...
rounded:
  <scale-level>: <Dimension> # border-radius scale
spacing:
  <scale-level>: <Dimension | number>
components:
  <component-name>:
    <prop>: <value | {path.to.token}>
    # valid props: backgroundColor / textColor / typography / rounded / padding / size / height / width
---
```

Token values accept hex/CSS colors, dimensions (with units), typography objects, and references to other tokens in `{path.to.token}` form.

### Layer 2 — markdown prose (the rationale: why, and how to apply)

`##` sections. Any may be omitted, but those present must appear in this canonical order:

1. **Overview** — brand positioning and design philosophy.
2. **Colors** — palette context and what each color token means / when to use it.
3. **Typography** — font families, sizes, weights, and their usage.
4. **Layout** — the spatial system and spacing scale.
5. **Elevation & Depth** — shadow and layering conventions.
6. **Shapes** — border-radius and geometric principles.
7. **Components** — UI element specifications.
8. **Do's and Don'ts** — usage guidance.

**Tokens are the normative values; the prose says why those values exist and how to apply them.** Use only the sections the project needs — a small UI may be just Overview + Colors + Typography.

## Source

The maintainer's stated design intent + design files / mockups / an existing design system, expressed in the `design.md` shape above. Don't invent visual rules, tokens, or positioning the maintainer never set — stop and ask.

## Boundary

- **Visual identity only.** Not interaction flows, user journeys, or screen-by-screen behavior (those describe behavior — record them in `specs/`); not information architecture.
- Not technical architecture (that's `ARCHITECTURE.md`); not the behavior contract (that's `specs/`).
- No future / deferred design ideas — those go to `ROADMAP.md`.
