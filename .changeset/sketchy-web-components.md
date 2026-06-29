---
"@ghds/web-components": minor
---

Add `@ghds/web-components` v1: framework-agnostic, hand-drawn Lit components.

- `SketchyBase` — a Lit base that measures the host via `ResizeObserver`, fixes a
  deterministic PRNG seed once per instance, calls `@ghds/sketch-core`, and injects
  the resulting SVG path strings into a Shadow DOM `<svg>` overlay. Geometry
  regenerates only on size change (no hover/focus jitter).
- `<gh-button>`, `<gh-card>`, `<gh-input>` — sketchy outlines via `@ghds/sketch-core`,
  every design value sourced from `@ghds/tokens` CSS custom properties (which inherit
  through the shadow boundary), `currentColor`-driven strokes, and accessibility
  (native focusable controls, keyboard support, form association via `ElementInternals`).
- Dark mode is a pure CSS-variable override (`[data-theme="dark"]`).
