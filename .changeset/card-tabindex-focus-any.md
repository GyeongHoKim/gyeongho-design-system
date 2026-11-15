---
'@ghds/react': patch
---

A `Card` made focusable with `tabIndex` now shows the `comp.card.focus.ring` outline on keyboard focus even without `interactive`, matching `gh-card`'s `:host(:focus-visible)`. Focus alone does not lift a card that is not `interactive`.
