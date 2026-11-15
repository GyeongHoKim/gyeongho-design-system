---
'@ghds/react': patch
---

A disabled `<Button asChild>` now actually blocks activation. Previously it only set `aria-disabled`, so a disabled `<Button asChild disabled><a href="…">` still navigated and fired the child's `onClick`. Clicks, middle-clicks and keyboard Enter are now cancelled (`preventDefault`) in the capture phase before the child's handlers run. The element keeps `aria-disabled="true"` and stays focusable so assistive technology can still find it. The `asChild` JSDoc now includes a link example.
