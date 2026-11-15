---
'@ghds/react': patch
---

An `interactive` `Card` that is itself focusable (`tabIndex`) now shows the `comp.card.focus.ring` outline on keyboard focus instead of the browser default, matching `asChild` link cards. Focus on a descendant still lifts the card without drawing the ring.
