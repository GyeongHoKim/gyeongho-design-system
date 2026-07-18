---
"@ghds/web-components": minor
---

`gh-button` now accepts an optional `href` (plus `target`/`rel`). When `href` is set and the button is not `disabled`, it renders as a real link (`<a href>`) instead of a `<button>`, keeping the sketch outline, variant colours, and focus styling. This is for navigation actions that should look like a button but stay right-clickable, keyboard-focusable links (e.g. a language switcher). A `disabled` button still renders a `<button>` since a link cannot be truly disabled. The link's semantics come from the inner anchor rather than a host `role="button"`.
