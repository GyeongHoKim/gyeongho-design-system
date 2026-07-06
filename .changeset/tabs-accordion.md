---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add the interactive navigation components Tabs and Accordion across all three platforms (GHD-34, slice 2 of 2 — completing the M11 탐색 group).

- **`@ghds/tokens`** — new `comp.tabs` and `comp.accordion` token files, aliasing `sys` only.
- **`@ghds/react`** — `Tabs` (WAI-ARIA tablist/tab/tabpanel, roving tabindex, Arrow/Home/End automatic activation, sketch-filled active tab) and `Accordion` (disclosure, `type="single" | "multiple"`, `aria-expanded`/`aria-controls`, Arrow/Home/End header focus, sketch-outlined sections).
- **`@ghds/web-components`** — `<gh-tabs>` (composed from `<gh-tab>`) and `<gh-accordion>` (composed from `<gh-accordion-item>`), each dispatching a `value-change` event; Web Components panels/sections take text `content`.
- **`@ghds/react-native`** — `Tabs` and `Accordion` themed via Restyle; tap-based selection with `accessibilityState` (arrow-key navigation is a documented web-only gap).

Each ships unit tests, Storybook stories, and an eight-section documentation page.
