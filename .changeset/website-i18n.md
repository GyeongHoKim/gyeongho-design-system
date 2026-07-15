---
"@ghds/website": minor
---

Add Korean/English internationalization with full content parity.

- Astro i18n config: `en` (default) + `ko` locales, `prefixDefaultLocale` routing
- UI string dictionary for nav, theme toggle, footer (en/ko)
- Locale-aware `withBase` path helper (auto-detects active locale)
- Localized nav labels and summaries
- Language switcher (EN ↔ KO) in the site header
- Dynamic `<html lang>` and locale-aware theme toggle labels
- All 41 pages moved to `src/pages/en/` with adjusted import paths
- All 41 pages translated to Korean in `src/pages/ko/` (해요체 tone)
- Root redirect to `/en/`
