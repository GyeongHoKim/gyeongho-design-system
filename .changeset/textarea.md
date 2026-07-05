---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add Textarea across all three platforms (GHD-32, slice 1 of 2 — Select/Combobox from the same
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
