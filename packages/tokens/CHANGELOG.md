# @ghds/tokens

## 0.2.0

### Minor Changes

- a81d243: Add a hand-drawn icon system (GHD-24).

  - **New `@ghds/icons` package** — the single source of truth for iconography: 26 core icons as platform-agnostic SVG path `d` strings on a 24×24 grid, plus `iconSeed()` for stable per-name sketching. Zero runtime deps; sketched at render time via `@ghds/sketch-core` so icons match the rest of GHDS.
  - **`@ghds/tokens`** — adds `sys.icon.size` (`sm`/`md`/`lg` → 16/24/32px) and the `ref.iconSize` scale behind it.
  - **`@ghds/react`** — adds an `<Icon>` component consuming both, with deterministic per-name seeding, `currentColor` theming (inherits its context's color), accessible `label`/decorative modes, and a Storybook catalog of the full set.

  `@ghds/web-components` and `@ghds/react-native` renderers will consume the same `@ghds/icons` data in a follow-up.

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

- 008f148: Add a sketch elevation parameter token: `ref.sketch.elevation` (`flat` = 0,
  `raised` = 4) and the `sys.sketch.elevation` semantic alias. Renderers feed it to
  `SketchOptions.elevation` to emit the engine's offset drop-shadow outline;
  `<gh-card elevated>` is the first consumer.
- c49d101: Add semantic typography tokens so consumers never reach past the tier boundary:

  - `sys.typography.code` — a monospace text role (`fontFamily` → `{ref.fontFamily.mono}`,
    plus `fontSize`/`lineHeight`/`fontWeight`), giving a **sys**-tier monospace stack.
  - `sys.typography.tracking` (`normal`, `wide`) — letter-spacing roles backed by the
    new `ref.letterSpacing` (`normal` = `0`, `wide` = `0.08em`).

  The documentation site (`apps/website`) is the first consumer, replacing direct
  `ref` references and hardcoded `letter-spacing`.
