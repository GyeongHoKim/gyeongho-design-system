---
"@ghds/tokens": minor
---

Preserve token alias chains in the generated CSS. `dist/css/variables.css` now
emits `comp → sys → ref` aliases as live `var(--…)` references instead of
resolving every token to a literal. Computed values are unchanged, but the
cascade is now wired end-to-end: overriding a single `--sys-*` (or `--ref-*`)
custom property re-themes every component token that aliases it, without
touching component code. This is what makes app-level theme customization
(e.g. rebranding the primary color) possible. The TypeScript and React Native
outputs are unaffected — they remain resolved literal objects.
