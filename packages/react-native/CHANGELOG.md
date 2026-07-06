# @ghds/react-native

## 0.7.0

### Minor Changes

- 44bcef4: Add FormField across all three platforms (GHD-33, slice 2 of 4 — FileUpload/DatePicker deferred to
  their own future PRs).

  - **`@ghds/tokens`** — adds a real `sys.color.text.danger` role (previously only a dead, gray-stub
    `comp.input.text.danger`/`comp.textarea.text.danger`) and repoints those two existing tokens at
    it. `Input`/`Textarea`'s error text now uses this proper danger-red role instead of borrowing the
    border-danger token.
  - **`@ghds/react`** — Context + opt-in consumption: `FormField` owns rendering Label/HelperText/
    ErrorText and provides `{ id, describedByIds, invalid }` via context; `Input`/`Textarea` read it
    when present (falling back to today's standalone `useId()`-based behavior otherwise) and suppress
    their own internal label/error rendering when wrapped. Also fixes a confirmed prop-collision bug:
    a caller-supplied `aria-describedby`/`aria-invalid` previously silently overrode the internally-
    computed one via `{...rest}` spread ordering. Checkbox/Radio/Switch/Select/Slider don't consume
    this context in v1 — they have no error concept yet; that's separate future work.
  - **`@ghds/web-components`** — `<gh-form-field>` auto-wires `id`/`aria-describedby`/`aria-invalid`
    directly onto its slotted control: light DOM gives slotted children no context-injection mechanism
    (the same gap already documented for `gh-radio-group`'s `name`), and a light-DOM `aria-describedby`
    can't reference elements in `gh-form-field`'s own shadow root, so it reaches into its own light-DOM
    child imperatively instead — deriving `${for}-helper`/`${for}-error` ids and keeping them in sync
    on `slotchange`, without clobbering ids/attributes a consumer set independently.
  - **`@ghds/react-native`** — a thinner, visual-only wrapper: renders label/helperText/errorText
    `<Text>`s around `children` with no id/`aria-describedby` equivalent on this platform — a real,
    permanent asymmetry vs. React/Web Components, not a gap to fake via prop-cloning. Its primary
    value-add is giving RN's own `Input` (which has no `label` prop) a label when wrapped.

### Patch Changes

- Updated dependencies [44bcef4]
  - @ghds/tokens@0.7.0

## 0.6.0

### Minor Changes

- d5f9994: Add Slider across all three platforms (GHD-33, slice 1 of 4 — DatePicker/FileUpload/FormField from
  the same Linear issue are deferred to their own future PRs, split by complexity/interaction model).

  - **`@ghds/tokens`** — adds `comp.slider` (track/rail/fill/thumb tokens), referencing only
    already-existing `sys` roles (no new `sys`-tier token needed).
  - **`@ghds/react`** and **`@ghds/web-components`** — a real, invisible `<input type="range">`
    spans the full track and carries every interaction (dragging, clicking the track, and native
    Arrow/Home/End/PageUp/PageDown keyboard behavior) with zero custom pointer/keydown code — the
    same "real native element drives behavior, sketch is decorative-only" rule every sibling
    component follows. The rail, fill, and thumb are three shapes computed directly from
    `@ghds/sketch-core`, sharing one measured box and seed — the same multi-shape trick `Radio`/
    `Switch` already use for their dot/thumb.
  - **`@ghds/react-native`** — no native range-slider primitive and no gesture library is installed
    (bare RN, no Expo), so dragging is hand-rolled via `PanResponder` (built into RN core, no new
    dependency). `accessibilityRole="adjustable"` + `accessibilityValue`/`accessibilityActions`
    (`increment`/`decrement`) are the standard RN pattern. Confirmed neither `accessibilityValue`
    nor `accessibilityState.disabled` has a React Native Web equivalent mapping (verified directly
    against `createDOMProps`) — the same gap class already documented for Select's `aria-expanded`
    and Switch's `aria-checked` — so `aria-valuemin`/`aria-valuemax`/`aria-valuenow`/`aria-disabled`
    are set directly for the web target. `onAccessibilityAction` itself has no React Native Web
    wiring at all (confirmed directly) — a real, native-only (iOS/Android) platform gap, documented
    rather than worked around.
  - v1 scope: a single thumb (no two-thumb range mode — "range 옵션" in the ticket names a possible
    future dual-thumb mode, not a v1 requirement), horizontal orientation only, no value tooltip
    while dragging.

### Patch Changes

- Updated dependencies [d5f9994]
  - @ghds/tokens@0.6.0

## 0.5.0

### Minor Changes

- abed772: Add Select across all three platforms (GHD-32, slice 2 of 2 — Combobox from the same Linear
  issue is deferred again, to its own future PR, since it builds directly on the floating-UI
  infrastructure introduced here).

  - **`@ghds/tokens`** — adds `comp.select` (trigger/panel/option tokens). First real consumer of
    `sys.shadow.md` and `sys.zIndex.dropdown` in any `comp/*.json` file.
  - **`@ghds/react`** — adds `Select`/`SelectOption`. Unlike every other GHDS component, this is a
    fully custom ARIA listbox widget rather than a wrapped native element — a real `<select>`'s
    browser-drawn dropdown UI can't be restyled to match the hand-drawn aesthetic. The trigger is a
    real `<button>`; the listbox panel and its keyboard/typeahead model are hand-implemented,
    following the WAI-ARIA "select-only combobox" pattern (`aria-activedescendant` roving highlight,
    no wraparound at the ends in v1). Positioned via the new `@floating-ui/react-dom` dependency,
    using `position: fixed` (no portal/reparenting) — clipped only by an ancestor that establishes
    its own containing block (`transform`/`filter`/`contain`), an accepted v1 limitation.
  - **`@ghds/web-components`** — adds `gh-select` (trigger, form-associated) and the internal
    `gh-select-listbox` (the floating panel — its own `SketchyBase` instance, since the trigger and
    panel are visually independent surfaces). Positioned via the new `@floating-ui/dom` dependency.
    Options are a data array property (`options`), not slotted children — light DOM has no context
    mechanism to bridge selection state the way React's children composition can.
  - **`@ghds/react-native`** — adds `Select`, mirroring Web Components' data-array `options` API.
    No floating-ui binding exists for React Native; the panel is a `Modal` with a
    `measureInWindow()`-based below/above flip heuristic. Confirmed `aria-haspopup`, `aria-controls`,
    and `aria-activedescendant` have no RN equivalent in any form (verified directly against
    `ViewAccessibility.d.ts` and `react-native-web`'s source) — a real, documented platform gap, not
    a workaround.

### Patch Changes

- Updated dependencies [abed772]
  - @ghds/tokens@0.5.0

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
