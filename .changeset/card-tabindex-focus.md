---
'@ghds/react': patch
---

A `Card` made focusable with `tabIndex` now shows the `comp.card.focus.ring` outline on keyboard focus instead of the browser default, matching `gh-card`'s `:host(:focus-visible)` and `asChild` link cards. This applies with or without `interactive`. Focus alone does not lift a card that is not `interactive`, and focus on a descendant of an `interactive` card lifts it without drawing the ring.
