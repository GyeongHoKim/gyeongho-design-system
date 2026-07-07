---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add the floating overlay components Tooltip and Menu/Dropdown across all three platforms (GHD-34/GHD-35, M11 slice 5).

- **`@ghds/tokens`** — new `comp.tooltip` and `comp.menu` token files, aliasing `sys` only (menu panel uses `sys.zIndex.dropdown`).
- **`@ghds/react`** — `Tooltip` (hover-after-delay / focus, `aria-describedby`, Escape to close) and `Menu` (button trigger + `role="menu"` with roving focus, Arrow/Home/End/Escape keyboard, click-outside), both positioned with `@floating-ui/react-dom`.
- **`@ghds/web-components`** — `<gh-tooltip>` (links the slotted trigger via `aria-describedby`) and `<gh-menu>` (dispatches a `select` event), positioned with `@floating-ui/dom`.
- **`@ghds/react-native`** — `Tooltip` (tap-to-toggle, content also exposed as an `accessibilityHint`) and `Menu` (`Modal`-anchored panel, tap selection). Hover/arrow-key behaviours are documented web-only gaps.

Each ships unit tests, Storybook stories, and an eight-section documentation page. Tooltip/Menu bubbles and panels are hand-drawn sketch surfaces.
