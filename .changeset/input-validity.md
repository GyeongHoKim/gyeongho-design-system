---
'@ghds/web-components': patch
---

`gh-input` now mirrors the inner input's validity, so a malformed `type="email"` or `type="url"` value is invalid and blocks form submission like a native input (GHD-81).
