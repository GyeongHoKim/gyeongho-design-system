---
'@ghds/sketch-core': minor
---

Add `roundedRectangle(x, y, w, h, r, o)`, a sketchy rectangle with arc corners. `r` is clamped to half the shorter side, so a pill radius draws semicircular ends; `r <= 0` returns the plain `rectangle()` output.
