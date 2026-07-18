---
"@ghds/web-components": minor
---

`gh-navigation-menu` now accepts a `current` property — the active page's path — and highlights the matching item. A standalone top-level link matches its path exactly (so a root `/` link is current only on the home page); a dropdown group is highlighted when any of its child links matches the current path exactly *or* as an ancestor (`/components/` is current on `/components/button/`). Matching leaf links receive `aria-current="page"`. Trailing slashes and query/hash are ignored when comparing. Leaving `current` unset preserves the previous behaviour (nothing highlighted).
