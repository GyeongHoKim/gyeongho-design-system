---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add the Skeleton loading placeholder across all three platforms (GHD-36, slice 2 of 3 — the M11 표현·상태 group; Table follows).

- **`@ghds/tokens`** — new `comp.skeleton` token file (muted fill, subtle outline, radius, pulse duration), aliasing `sys` only.
- **`@ghds/react`** — `Skeleton` with `rect` / `text` / `circle` variants and `width`/`height` overrides; a sketchy filled shape that pulses opacity toward `sys.opacity.disabled` via the Web Animations API.
- **`@ghds/web-components`** — `<gh-skeleton>` extending `SketchyBase`; CSS-keyframe opacity pulse, region-fill override, and an inner measured frame so percentage widths work.
- **`@ghds/react-native`** — `Skeleton` themed via Restyle; opacity pulse via the `Animated` API.

All three suppress the pulse under `prefers-reduced-motion` (web) / the OS reduce-motion setting (React Native), and are hidden from assistive tech (announce the busy state on the containing region). Ships with unit tests, Storybook stories, and an eight-section documentation page.
