---
"@ghds/tokens": minor
---

Add a sketch elevation parameter token: `ref.sketch.elevation` (`flat` = 0,
`raised` = 4) and the `sys.sketch.elevation` semantic alias. Renderers feed it to
`SketchOptions.elevation` to emit the engine's offset drop-shadow outline;
`<gh-card elevated>` is the first consumer.
