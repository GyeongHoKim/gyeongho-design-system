---
'@ghds/web-components': minor
---

`gh-table` columns accept an optional `render(value, row)` function for rich cell content. Return a Lit `TemplateResult` (import `html` from `lit`), for example a `<code>` key name or a colour swatch. Row values stay `string | number`, and columns without `render` render exactly as before.
