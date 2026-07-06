---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add the Modal/Dialog across all three platforms and the scrim colour token (GHD-35, M11 slice 6).

- **`@ghds/tokens`** — new `sys.color.bg.overlay` scrim colour (light + dark) and a `comp.modal` token file (scrim colour/opacity, panel surface/stroke/shadow/radius/padding, `sys.zIndex.modal`).
- **`@ghds/react`** — `Modal` renders through a portal with a scrim, `role="dialog"` + `aria-modal`, a self-contained focus trap (Tab cycles within, focus restored on close), Escape-to-close, and body scroll lock.
- **`@ghds/web-components`** — `<gh-modal>` built on the native `<dialog>` (`showModal()`) for focus trapping, the top layer, and Escape; the `::backdrop` is the token scrim. Dispatches a `close` event.
- **`@ghds/react-native`** — `Modal` built on RN's `Modal` (focus containment + hardware back) with a token scrim and a sketchy panel.

Each ships unit tests, Storybook stories, and an eight-section documentation page.
