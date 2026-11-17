---
'@ghds/web-components': patch
---

`gh-menu` sizes its dropdown panel from the new `--comp-menu-panel-minWidth` token instead of a hardcoded `10rem`. The rendered width is unchanged at the default root font size (`160px`).
