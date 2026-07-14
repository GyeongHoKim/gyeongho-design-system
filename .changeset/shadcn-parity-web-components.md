---
"@ghds/web-components": minor
---

Add shadcn-parity hand-drawn components:

- Primitives: `gh-separator`, `gh-label`, `gh-kbd`, `gh-empty`, `gh-toggle`, `gh-button-group`.
- Floating: `gh-popover`, `gh-hover-card`, `gh-collapsible`, `gh-toggle-group`, `gh-combobox`.
- Overlays (native `<dialog>`): `gh-alert-dialog`, `gh-sheet`, `gh-drawer`.
- Menus: `gh-context-menu`, `gh-menubar`, `gh-navigation-menu`, `gh-command`.
- Composites: `gh-calendar`, `gh-date-picker`, `gh-sidebar`, `gh-chart`.
- Notifications: new `gh-toaster` viewport element plus an imperative `toast()` controller / `ToastController` (variants, positioning, stacking, auto-dismiss, `dismiss(id)`).

BREAKING: the Toast API is rewritten. `gh-toast` is now the per-item visual only and no longer anchors itself to the viewport. Mount a `gh-toaster` and raise notifications via `toast()` / `ToastController` instead of using a single fixed `gh-toast`.
