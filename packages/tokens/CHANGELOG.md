# @ghds/tokens

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

## 0.3.0

### Minor Changes

- 3afb01f: Add Checkbox (+ CheckboxGroup), Radio (+ RadioGroup), and Switch across all three platforms (GHD-31).

  - **`@ghds/tokens`** — adds `comp.checkbox`, `comp.radio`, `comp.switch`, aliasing only existing `sys` color/spacing/icon-size roles (no new `sys` tokens, no WCAG contrast matrix changes).
  - **`@ghds/react`** — adds `Checkbox`/`CheckboxGroup`, `Radio`/`RadioGroup`, `Switch`. Native `<input type="checkbox"|"radio">` (and `role="switch"` for Switch) drive behavior; sketch-core draws the box/ring/track, with a hand-drawn check/minus mark (via the existing `<Icon>`) or a second sketched dot/thumb overlaid for checked states. `indeterminate` is set imperatively as a DOM property, matching native checkbox semantics.
  - **`@ghds/web-components`** — adds `gh-checkbox`/`gh-checkbox-group`, `gh-radio`/`gh-radio-group`, `gh-switch`. Introduces `ElementInternals.states` (`CustomStateSet`) alongside reflected boolean attributes for `:state(checked)`/`:state(indeterminate)` CSS hooks, and the package's first solid `fillStyle` sketches. `gh-radio-group` manages same-`name` mutual exclusivity in JS, since form-associated custom elements don't get it natively.
  - **`@ghds/react-native`** — adds `Checkbox`/`CheckboxGroup`, `Radio`/`RadioGroup`, `Switch`. Fixes a React Native Web gap where `accessibilityState.checked` isn't mapped to `aria-checked` by adding it as a direct prop.

    **Breaking change**: `buildRectangleOutline(size, inset, params)` has been renamed to `buildOutline(shape, size, inset, params)` to support the ellipse geometry Radio/Switch need. `useSketch`'s new `shape` option is backward-compatible (defaults to `'rectangle'`), but the renamed low-level export is not — update any direct imports of `buildRectangleOutline` from `@ghds/react-native`.

## 0.2.0

### Minor Changes

- a81d243: Add a hand-drawn icon system (GHD-24).

  - **New `@ghds/icons` package** — the single source of truth for iconography: 26 core icons as platform-agnostic SVG path `d` strings on a 24×24 grid, plus `iconSeed()` for stable per-name sketching. Zero runtime deps; sketched at render time via `@ghds/sketch-core` so icons match the rest of GHDS.
  - **`@ghds/tokens`** — adds `sys.icon.size` (`sm`/`md`/`lg` → 16/24/32px) and the `ref.iconSize` scale behind it.
  - **`@ghds/react`** — adds an `<Icon>` component consuming both, with deterministic per-name seeding, `currentColor` theming (inherits its context's color), accessible `label`/decorative modes, and a Storybook catalog of the full set.

  `@ghds/web-components` and `@ghds/react-native` renderers will consume the same `@ghds/icons` data in a follow-up.

## 0.1.0

### Minor Changes

- 8c2f9f0: feat(react): @ghds/react v1 — sketchy Button, Card, and Input

  Introduce the `@ghds/react` component library. Visuals are rendered from
  `@ghds/sketch-core` geometry via a new `useSketch` hook (ResizeObserver
  measurement + a per-instance fixed PRNG seed so re-renders never reshuffle the
  hand-drawn look) and a `SketchSurface` renderer. Headless behaviour and
  accessibility come from Radix (`Slot`/`Slottable` for Button `asChild`, `Label`
  for Input).

  All design values are sourced from `@ghds/tokens`: colors are consumed as CSS
  custom properties so `[data-theme="dark"]` / `prefers-color-scheme` re-theme
  components live, while sketch parameters and dimensions come from the token
  object.

  Tokens: extend `comp.button` (neutral variant, stroke + focus colors) and add
  the `comp.card` and `comp.input` token sets (referencing `sys` only).

- 008f148: Add a sketch elevation parameter token: `ref.sketch.elevation` (`flat` = 0,
  `raised` = 4) and the `sys.sketch.elevation` semantic alias. Renderers feed it to
  `SketchOptions.elevation` to emit the engine's offset drop-shadow outline;
  `<gh-card elevated>` is the first consumer.
- c49d101: Add semantic typography tokens so consumers never reach past the tier boundary:

  - `sys.typography.code` — a monospace text role (`fontFamily` → `{ref.fontFamily.mono}`,
    plus `fontSize`/`lineHeight`/`fontWeight`), giving a **sys**-tier monospace stack.
  - `sys.typography.tracking` (`normal`, `wide`) — letter-spacing roles backed by the
    new `ref.letterSpacing` (`normal` = `0`, `wide` = `0.08em`).

  The documentation site (`apps/website`) is the first consumer, replacing direct
  `ref` references and hardcoded `letter-spacing`.
