# @ghds/react

## 0.2.0

### Minor Changes

- a81d243: Add a hand-drawn icon system (GHD-24).

  - **New `@ghds/icons` package** — the single source of truth for iconography: 26 core icons as platform-agnostic SVG path `d` strings on a 24×24 grid, plus `iconSeed()` for stable per-name sketching. Zero runtime deps; sketched at render time via `@ghds/sketch-core` so icons match the rest of GHDS.
  - **`@ghds/tokens`** — adds `sys.icon.size` (`sm`/`md`/`lg` → 16/24/32px) and the `ref.iconSize` scale behind it.
  - **`@ghds/react`** — adds an `<Icon>` component consuming both, with deterministic per-name seeding, `currentColor` theming (inherits its context's color), accessible `label`/decorative modes, and a Storybook catalog of the full set.

  `@ghds/web-components` and `@ghds/react-native` renderers will consume the same `@ghds/icons` data in a follow-up.

### Patch Changes

- Updated dependencies [a81d243]
  - @ghds/icons@0.1.0
  - @ghds/tokens@0.2.0

## 0.1.2

### Patch Changes

- 75195a7: Add a deterministic sketch-seed override so visual-regression snapshots are stable (GHD-45). `@ghds/sketch-core` now exports `forcedSeed()` / `setForcedSeed()`: when a host pins a seed, every adapter (`useSketch` in React/React Native, `SketchyBase` in web components) uses it instead of a random per-instance seed, making the hand-drawn geometry byte-identical across runs. Production and local dev are unchanged — the seed stays random unless explicitly pinned (e.g. by Storybook under Chromatic).
- Updated dependencies [75195a7]
  - @ghds/sketch-core@0.2.0

## 0.1.1

### Patch Changes

- b84efba: Fix sketch surface hidden behind opaque-background ancestors (GHD-44). Button, Card, and Input now establish their own stacking context (`isolation: isolate`) so the decorative `z-index: -1` sketch layer — and, for filled variants, the light label — no longer disappear when the component is placed inside a card, panel, or section with an opaque background.

## 0.1.0

### Minor Changes

- 8c2f9f0: feat(react): @ghds/react v1 — sketchy Button, Card, and Input

  Introduce the `@ghds/react` component library. Visuals are rendered from
  `@ghds/sketch-core` geometry via a new `useSketch` hook (ResizeObserver
  measurement + a per-instance fixed PRNG seed so re-renders never reshuffle the
  hand-drawn look) and a `SketchSurface` renderer. Headless behaviour and
  accessibility come from Radix (`Slot`/`Slottable` for Button `asChild`, `Label`
  for Input).

  All design values are sourced from `@ghds/tokens`: colors are consumed as CSS
  custom properties so `[data-theme="dark"]` / `prefers-color-scheme` re-theme
  components live, while sketch parameters and dimensions come from the token
  object.

  Tokens: extend `comp.button` (neutral variant, stroke + focus colors) and add
  the `comp.card` and `comp.input` token sets (referencing `sys` only).

### Patch Changes

- Updated dependencies [8c2f9f0]
- Updated dependencies [c004c72]
- Updated dependencies [008f148]
- Updated dependencies [c49d101]
  - @ghds/tokens@0.1.0
  - @ghds/sketch-core@0.1.0
