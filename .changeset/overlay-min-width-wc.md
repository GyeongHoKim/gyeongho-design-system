---
'@ghds/web-components': patch
---

`gh-context-menu`, `gh-navigation-menu`, `gh-popover` and `gh-hover-card` size their panels from the overlay min-width tokens (`--comp-*-minWidth` / `--sys-overlay-minWidth-lg`) instead of hardcoded `rem` values. Rendered widths are unchanged at the default root font size.
