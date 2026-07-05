---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add Slider across all three platforms (GHD-33, slice 1 of 4 — DatePicker/FileUpload/FormField from
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
