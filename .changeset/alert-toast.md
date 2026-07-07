---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add the feedback components Alert/Banner and Toast across all three platforms (GHD-35, M11 slice 7).

- **`@ghds/tokens`** — new `comp.alert` and `comp.toast` token files (severity-coloured outline/icon over a surface fill; toast uses `sys.zIndex.toast` + `sys.shadow.lg`), aliasing `sys` only.
- **`@ghds/react`** — `Alert` (inline banner, four severities, optional dismiss, `role="alert"` for danger / `role="status"` otherwise) and `Toast` (fixed, auto-dismisses after `duration`, same live-region semantics).
- **`@ghds/web-components`** — `<gh-alert>` (dispatches `dismiss`) and `<gh-toast>` (reflects `open`, auto-dismiss timer, dispatches `close`).
- **`@ghds/react-native`** — `Alert` (inline) and `Toast` (transparent `Modal` overlay with `pointerEvents="box-none"`); both set `accessibilityLiveRegion` + `role`.

Each ships unit tests, Storybook stories, and an eight-section documentation page. Auto-dismiss timing is a behavioural default (5000ms), not a motion token.
