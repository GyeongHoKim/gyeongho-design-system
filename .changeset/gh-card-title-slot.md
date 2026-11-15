---
'@ghds/web-components': minor
---

`gh-card` now renders a named `title` slot before the body. Content with `slot="title"` previously matched no slot and never appeared; it now renders first with title styling, on every `variant`.
