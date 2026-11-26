---
'@ghds/web-components': patch
---

Pressing Enter in `gh-input` now submits its form, like a native text input (GHD-79). A `keydown` listener can cancel this with `preventDefault()`, and Enter that confirms an IME composition does not submit.
