# @ghds/sketch-core

## 0.1.0

### Minor Changes

- c004c72: Add path/arc rendering, two new fillers, and elevation IR to the sketch engine.

  - `path(d, o)`: parse an SVG path `d` string (M L H V C S Q T A Z, absolute &
    relative) and render it as sketchy, jittered path data. Curves and arcs are
    flattened to quantized line segments for byte-stable cross-engine output, and
    invalid input degrades gracefully (empty drawable + `console.warn`) instead of
    throwing. Compound paths fill with the even-odd rule so holes stay hollow.
  - New `fillStyle` values `'zigzag'` and `'dots'`, alongside the existing
    hachure/cross-hatch/solid, both honouring `hachureGap`/`hachureAngle` and the
    even-odd hole rule.
  - Elevation IR: optional `SketchOptions.elevation` emits an offset drop-shadow
    outline as `SketchDrawable.shadowPaths`, drawn from an independent PRNG stream
    so it never perturbs the foreground shape.
  - New public exports: `path`, `linearizePath`, and the `Subpath` type.

  These are additive IR-contract changes (new optional `SketchOptions` fields, a
  new optional `SketchDrawable.shadowPaths`, and new exports); existing output is
  unchanged.
