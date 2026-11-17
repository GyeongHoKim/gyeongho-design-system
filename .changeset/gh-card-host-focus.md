---
'@ghds/web-components': patch
---

A focusable `gh-card` (`tabindex` on the host, typically with `interactive`) no longer shows the browser's rectangular default outline. On `:focus-visible` the host outline is replaced by the `comp.card.focus.ring` ring drawn on the paper, the same ring as link mode, so it follows a sticky card's folded corner and the tilt.
