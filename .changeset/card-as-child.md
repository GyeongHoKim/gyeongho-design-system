---
'@ghds/react': minor
---

`Card` gains `asChild`, following the `Button` pattern: `<Card asChild><a href="/docs">…</a></Card>` renders the child as the card root, with the sketch surface, fastener and lined margin inside it. An `asChild` card is interactive: it lifts on hover and focus, a `plain` card's stroke darkens to `comp.card.stroke.hover` on mouse hover, and keyboard focus shows a `comp.card.focus.ring` focus ring.
