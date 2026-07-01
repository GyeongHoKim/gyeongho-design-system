# @ghds/icons

## 0.1.0

### Minor Changes

- a81d243: Add a hand-drawn icon system (GHD-24).

  - **New `@ghds/icons` package** — the single source of truth for iconography: 26 core icons as platform-agnostic SVG path `d` strings on a 24×24 grid, plus `iconSeed()` for stable per-name sketching. Zero runtime deps; sketched at render time via `@ghds/sketch-core` so icons match the rest of GHDS.
  - **`@ghds/tokens`** — adds `sys.icon.size` (`sm`/`md`/`lg` → 16/24/32px) and the `ref.iconSize` scale behind it.
  - **`@ghds/react`** — adds an `<Icon>` component consuming both, with deterministic per-name seeding, `currentColor` theming (inherits its context's color), accessible `label`/decorative modes, and a Storybook catalog of the full set.

  `@ghds/web-components` and `@ghds/react-native` renderers will consume the same `@ghds/icons` data in a follow-up.
