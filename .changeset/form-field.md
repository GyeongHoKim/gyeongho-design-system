---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add FormField across all three platforms (GHD-33, slice 2 of 4 — FileUpload/DatePicker deferred to
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
- **`@ghds/web-components`** — `<gh-form-field>` is presentational-only: light DOM gives slotted
  children no context-injection mechanism (the same gap already documented for `gh-radio-group`'s
  `name`), so it derives deterministic `${for}-helper`/`${for}-error` ids from a `for` property and
  the consumer wires `id`/`aria-describedby`/`aria-invalid` onto their own nested control manually.
- **`@ghds/react-native`** — a thinner, visual-only wrapper: renders label/helperText/errorText
  `<Text>`s around `children` with no id/`aria-describedby` equivalent on this platform — a real,
  permanent asymmetry vs. React/Web Components, not a gap to fake via prop-cloning. Its primary
  value-add is giving RN's own `Input` (which has no `label` prop) a label when wrapped.
