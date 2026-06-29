# @ghds/react-native

## 0.1.0

### Minor Changes

- 4c17e2e: Add `@ghds/react-native` v1 — the hand-drawn React Native component library.

  - **Button, Card, Input** components with a sketchy (wired) aesthetic.
  - Renders the platform-agnostic `@ghds/sketch-core` IR (`path d` strings) through
    `react-native-svg` `<Path>`, measuring layout with `onLayout`. The PRNG seed is
    fixed once per instance, so hover/focus re-renders never make the outline
    shimmer; geometry regenerates only when the measured size changes.
  - Themed with `@shopify/restyle`. The Restyle theme (light + dark) is built
    entirely from `@ghds/tokens` (`sys`/`comp` tiers) — no hardcoded design values.
  - Accessible by default (`accessibilityRole`/`accessibilityState`, labels) and
    covered by unit tests via `react-native-web` + Testing Library.

### Patch Changes

- Updated dependencies [8c2f9f0]
- Updated dependencies [c004c72]
- Updated dependencies [008f148]
- Updated dependencies [c49d101]
  - @ghds/tokens@0.1.0
  - @ghds/sketch-core@0.1.0
