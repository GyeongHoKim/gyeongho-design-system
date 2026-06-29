---
"@ghds/react-native": minor
---

Add `@ghds/react-native` v1 — the hand-drawn React Native component library.

- **Button, Card, Input** components with a sketchy (wired) aesthetic.
- Renders the platform-agnostic `@ghds/sketch-core` IR (`path d` strings) through
  `react-native-svg` `<Path>`, measuring layout with `onLayout`. The PRNG seed is
  fixed once per instance, so hover/focus re-renders never make the outline
  shimmer; geometry regenerates only when the measured size changes.
- Themed with `@shopify/restyle`. The Restyle theme (light + dark) is built
  entirely from `@ghds/tokens` (`sys`/`comp` tiers) — no hardcoded design values.
- Accessible by default (`accessibilityRole`/`accessibilityState`, labels) and
  covered by unit tests via `react-native-web` + Testing Library.
