---
'@ghds/web-components': patch
---

Enter in `gh-input` no longer submits the form when its default button is disabled, matching native implicit submission (GHD-82). A `gh-button` that comes first is now recognized as the default button, and `gh-button` exposes `form` like a native button. Enter now fires `click` on the default button, so a click listener can cancel the submission as it can with a native input.
