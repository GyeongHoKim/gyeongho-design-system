---
'@ghds/web-components': patch
---

`gh-toggle-group` now keeps every `gh-toggle` in sync with `value` after each click (GHD-78). A controlled group can keep an item pressed by setting the same `value` back in its `value-change` handler, and a change the handler does not accept is reverted.
