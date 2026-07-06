---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add the presentational display components Badge, Avatar, Spinner, and Progress across all three platforms (GHD-36, slice 1 of 3 — the M11 표현·상태 group; Skeleton and Table follow in later slices).

- **`@ghds/tokens`** — new `comp.badge`, `comp.avatar`, `comp.spinner`, and `comp.progress` token files, aliasing `sys` only (semantic colours, sizes, and the shared `sketch` roughness/bowing; spinner/progress also alias `sys.animation.duration` for their motion).
- **`@ghds/react`** — `Badge` (six semantic variants), `Avatar` (image → initials → empty fallback, `initialsFrom` helper), `Spinner` (rotating sketch ring via the Web Animations API), and `Progress` (determinate + indeterminate). Spinner/Progress suppress motion under `prefers-reduced-motion`.
- **`@ghds/web-components`** — `<gh-badge>`, `<gh-avatar>`, `<gh-spinner>`, `<gh-progress>` extending `SketchyBase`; motion via CSS animation with a `prefers-reduced-motion` guard. `<gh-progress>` draws its rail and fill as two token-coloured sketch layers.
- **`@ghds/react-native`** — `Badge`, `Avatar`, `Spinner`, `Progress` themed via Restyle; Spinner/Progress animate with the `Animated` API and honour the OS "reduce motion" setting. Note: `Progress` sets `accessibilityValue`, which react-native-web does not forward to the DOM (documented on the component page).

Each component ships with unit tests, Storybook stories (light + dark visual-regression variants), and an eight-section documentation page on the website.
