---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add Select across all three platforms (GHD-32, slice 2 of 2 — Combobox from the same Linear
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
