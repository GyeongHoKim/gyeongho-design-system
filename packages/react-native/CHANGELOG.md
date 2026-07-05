# @ghds/react-native

## 0.4.0

### Minor Changes

- 498063b: Add Textarea across all three platforms (GHD-32, slice 1 of 2 — Select/Combobox from the same
  Linear issue are deferred to a follow-up PR, since they need floating-UI infrastructure that
  doesn't exist in this repo yet).

  - **`@ghds/tokens`** — adds `comp.textarea`, aliasing the same `sys` roles as `comp.input` (no new
    `sys` tokens).
  - **`@ghds/react`** — adds `Textarea`. Same hand-drawn-box pattern as `Input`; adds an opt-in
    `autoResize` prop that JS-measures `scrollHeight` (not CSS `field-sizing`, for cross-browser
    determinism) and disables the native resize handle.
  - **`@ghds/web-components`** — adds `gh-textarea`, form-associated like `gh-input`, with the same
    `autoResize` mechanism and a `rows` property. Also restores its authored default value on form
    reset (rather than always clearing it), matching the more correct pattern already used by
    `gh-checkbox`/`gh-radio`/`gh-switch`.
  - **`@ghds/react-native`** — adds `Textarea`, using `TextInput`'s `multiline` +
    `onContentSizeChange` for auto-resize, with a `rows`-derived minimum height (RN has no native
    `rows` attribute). Requires a `label` prop, matching the `Checkbox`/`Radio`/`Switch` convention
    rather than `Input`'s older, label-less shape.

### Patch Changes

- Updated dependencies [498063b]
  - @ghds/tokens@0.4.0

## 0.3.0

### Minor Changes

- 3afb01f: Add Checkbox (+ CheckboxGroup), Radio (+ RadioGroup), and Switch across all three platforms (GHD-31).

  - **`@ghds/tokens`** — adds `comp.checkbox`, `comp.radio`, `comp.switch`, aliasing only existing `sys` color/spacing/icon-size roles (no new `sys` tokens, no WCAG contrast matrix changes).
  - **`@ghds/react`** — adds `Checkbox`/`CheckboxGroup`, `Radio`/`RadioGroup`, `Switch`. Native `<input type="checkbox"|"radio">` (and `role="switch"` for Switch) drive behavior; sketch-core draws the box/ring/track, with a hand-drawn check/minus mark (via the existing `<Icon>`) or a second sketched dot/thumb overlaid for checked states. `indeterminate` is set imperatively as a DOM property, matching native checkbox semantics.
  - **`@ghds/web-components`** — adds `gh-checkbox`/`gh-checkbox-group`, `gh-radio`/`gh-radio-group`, `gh-switch`. Introduces `ElementInternals.states` (`CustomStateSet`) alongside reflected boolean attributes for `:state(checked)`/`:state(indeterminate)` CSS hooks, and the package's first solid `fillStyle` sketches. `gh-radio-group` manages same-`name` mutual exclusivity in JS, since form-associated custom elements don't get it natively.
  - **`@ghds/react-native`** — adds `Checkbox`/`CheckboxGroup`, `Radio`/`RadioGroup`, `Switch`. Fixes a React Native Web gap where `accessibilityState.checked` isn't mapped to `aria-checked` by adding it as a direct prop.

    **Breaking change**: `buildRectangleOutline(size, inset, params)` has been renamed to `buildOutline(shape, size, inset, params)` to support the ellipse geometry Radio/Switch need. `useSketch`'s new `shape` option is backward-compatible (defaults to `'rectangle'`), but the renamed low-level export is not — update any direct imports of `buildRectangleOutline` from `@ghds/react-native`.

### Patch Changes

- Updated dependencies [3afb01f]
  - @ghds/tokens@0.3.0

## 0.2.0

### Minor Changes

- e127779: Add the `Icon` renderer to the remaining platforms (GHD-24). `@ghds/web-components` ships `<gh-icon name size label>` and `@ghds/react-native` ships `<Icon>`, both consuming the same `@ghds/icons` path data through `@ghds/sketch-core` with the deterministic per-name seed — so an icon looks identical across React, web components and React Native. Sizes come from `sys.icon.size`; color inherits `currentColor` (web) / defaults to `sys.color.icon.default` (RN).

## 0.1.2

### Patch Changes

- Updated dependencies [a81d243]
  - @ghds/tokens@0.2.0

## 0.1.1

### Patch Changes

- 75195a7: Add a deterministic sketch-seed override so visual-regression snapshots are stable (GHD-45). `@ghds/sketch-core` now exports `forcedSeed()` / `setForcedSeed()`: when a host pins a seed, every adapter (`useSketch` in React/React Native, `SketchyBase` in web components) uses it instead of a random per-instance seed, making the hand-drawn geometry byte-identical across runs. Production and local dev are unchanged — the seed stays random unless explicitly pinned (e.g. by Storybook under Chromatic).
- Updated dependencies [75195a7]
  - @ghds/sketch-core@0.2.0

## 0.1.0

### Minor Changes

- 4c17e2e: Add `@ghds/react-native` v1 — the hand-drawn React Native component library.

  - **Button, Card, Input** components with a sketchy (wired) aesthetic.
  - Renders the platform-agnostic `@ghds/sketch-core` IR (`path d` strings) through
    `react-native-svg` `<Path>`, measuring layout with `onLayout`. The PRNG seed is
    fixed once per instance, so hover/focus re-renders never make the outline
    shimmer; geometry regenerates only when the measured size changes.
  - Themed with `@shopify/restyle`. The Restyle theme (light + dark) is built
    entirely from `@ghds/tokens` (`sys`/`comp` tiers) — no hardcoded design values.
  - Accessible by default (`accessibilityRole`/`accessibilityState`, labels) and
    covered by unit tests via `react-native-web` + Testing Library.

### Patch Changes

- Updated dependencies [8c2f9f0]
- Updated dependencies [c004c72]
- Updated dependencies [008f148]
- Updated dependencies [c49d101]
  - @ghds/tokens@0.1.0
  - @ghds/sketch-core@0.1.0
