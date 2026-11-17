---
'@ghds/react': minor
'@ghds/web-components': minor
---

Menu items accept an optional `href`. `Menu` (`MenuItem`) and `gh-menu` (`GhMenuItem`) render an item with an `href` as a real link — a `role="none"` wrapper around `<a role="menuitem" href>` — so an action that links out keeps native link behaviour (open in new tab, copy link address, crawlability). Activating it navigates natively and closes the menu; `onSelect` / the `select` event is not fired for href items. Enter is left to the native link and Space clicks it, so keyboard activation navigates without `preventDefault`. A `disabled` href item drops its `href`. An empty `href` (`''`) counts as no `href`, so every item is either a link or an action, never both. Action items behave as before, and both kinds can be mixed in one menu.
